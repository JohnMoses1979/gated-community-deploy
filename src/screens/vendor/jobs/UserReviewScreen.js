// // WorkScreens.js — wired to shared useStore
// // Status flow from shared store:
// //   assigned → quoted → quote_sent_to_resident → quote_accepted →
// //   work_in_progress → work_completed → payment_requested_to_admin →
// //   payment_requested_to_resident → payment_received → paid_to_vendor

// import React from 'react';
// import {
//   View, Text, ScrollView, StyleSheet,
//   SafeAreaView, StatusBar, TouchableOpacity, Alert,
// } from 'react-native';
// import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
// import { AppHeader, Card, PrimaryButton, Divider, Badge } from '../../../vendor/components';
// import { ProgressStep } from '../../../vendor/components';
// import useSharedStore from '../../../store/appStore';
// import { useTheme } from '../../../hooks/useTheme';

// const WORK_STAGES = [
//   'Work Initiated', 'Site Visit Done', 'Material Planning', 'Material Approved',
//   'Material Procured', 'Work in Progress', 'Quality Check', 'Testing',
//   'Snag / Issue Fixing', 'Final Inspection', 'Handover to Resident', 'Work Completed',
// ];

// // ─── ApprovalStatusScreen ─────────────────────────────────────────────────────
// // Shows after vendor submits quote — reflects real store status

// export default function UserReviewScreen({ navigation, route }) {
//   const theme = useTheme();
//   const { jobId } = route?.params || {};
//   const requests = useSharedStore(s => s.maintenanceRequests);
//   const job = requests.find(r => r.id === jobId) || {};

//   return (
//     <SafeAreaView style={[styles.safe, {backgroundColor: theme.background}]}>
//       <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
//       <AppHeader title="Job Review" onBack={() => navigation.goBack()} />
//       <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

//         <View style={styles.statusBox}>
//           <View style={[styles.statusIcon, { backgroundColor: Colors.greenLight }]}>
//             <Text style={{ fontSize: 52 }}>⭐</Text>
//           </View>
//           <Text style={styles.statusTitle}>
//             {job.status === 'paid_to_vendor' ? 'Job Closed — Paid!' : 'Awaiting Payment'}
//           </Text>
//           <Text style={styles.statusSub}>
//             {job.status === 'paid_to_vendor'
//               ? 'This job has been completed and paid'
//               : 'Waiting for payment to clear'}
//           </Text>
//         </View>

//         <Card>
//           {[
//             ['Resident', job.residentName || '—'],
//             ['Category', job.category     || '—'],
//             ['Quote',    job.quote ? ('₹' + job.quote.amount) : '—'],
//             ['Status',   job.status       || '—'],
//           ].map(([k, v], i) => (
//             <View key={i} style={[styles.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 }]}>
//               <Text style={styles.detailLabel}>{k}</Text>
//               <Text style={styles.detailValue}>{v}</Text>
//             </View>
//           ))}
//         </Card>

//         <PrimaryButton
//           title="🏠 Back to Home"
//           onPress={() => navigation.navigate('BusinessHome')}
//           color={Colors.purple}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }





















/**
 * UserReviewScreen.js — Vendor
 *
 * SECURITY FIX (merged):
 *  - appStore replaced with maintenanceStore (vendorJobs)
 *  - Shows ratings/reviews left by residents on completed jobs
 *  - Token from useAuthStore(s => s.token)
 *  - vendorId never sent — backend reads from JWT
 */
import React, { useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAuthStore }    from '../../../store/AuthStore';
import useMaintenanceStore from '../../../store/maintenanceStore';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', tealSoft: '#E8F5F5',
  bg: '#E8F5F5', surface: '#FFF', text: '#1A2E2E', muted: '#7A9E9E', border: '#D0EEEE',
  gold: '#D97706', goldBg: '#FEF3C7',
  green: '#15803D', greenBg: '#DCFCE7',
};

function StarRow({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Text key={n} style={{ fontSize: 18, color: n <= rating ? P.gold : '#D0EEEE' }}>★</Text>
      ))}
    </View>
  );
}

function AverageRating({ jobs }) {
  const rated = jobs.filter(j => j.vendorRating?.rating);
  if (!rated.length) return null;
  const avg = rated.reduce((sum, j) => sum + (j.vendorRating.rating || 0), 0) / rated.length;
  return (
    <View style={s.avgCard}>
      <Text style={s.avgScore}>{avg.toFixed(1)}</Text>
      <StarRow rating={Math.round(avg)} />
      <Text style={s.avgSub}>{rated.length} review{rated.length !== 1 ? 's' : ''}</Text>
    </View>
  );
}

function ReviewCard({ job }) {
  const rating = job.vendorRating;
  if (!rating) return null;

  return (
    <View style={s.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle} numberOfLines={1}>{job.title}</Text>
          <Text style={s.cardSub}>{job.category} · {job.residentName}</Text>
          <Text style={s.cardId}>{job.id}</Text>
        </View>
        <StarRow rating={rating.rating || 0} />
      </View>

      {rating.review ? (
        <View style={s.reviewBox}>
          <Text style={s.reviewText}>"{rating.review}"</Text>
        </View>
      ) : null}

      {rating.tags?.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {rating.tags.map(tag => (
            <View key={tag} style={s.tag}>
              <Text style={s.tagText}>✓ {tag}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={s.dateText}>
        {rating.createdAt ? new Date(rating.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
      </Text>
    </View>
  );
}

export default function UserReviewScreen({ navigation }) {
  const token             = useAuthStore(s => s.token);
  const vendorJobs        = useMaintenanceStore(s => s.vendorJobs);
  const loading           = useMaintenanceStore(s => s.loading);
  const vendorFetchMyJobs = useMaintenanceStore(s => s.vendorFetchMyJobs);

  const [refreshing, setRefreshing] = React.useState(false);

  const loadJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    await vendorFetchMyJobs(token);
    if (isRefresh) setRefreshing(false);
  }, [token, vendorFetchMyJobs]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  // Only show jobs that have a resident rating
  const ratedJobs = vendorJobs.filter(j => j.vendorRating?.rating);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Reviews</Text>
        <Text style={s.headerSub}>{ratedJobs.length} review{ratedJobs.length !== 1 ? 's' : ''} received</Text>
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={P.teal} />
        </View>
      ) : (
        <FlatList
          data={ratedJobs}
          keyExtractor={j => String(j.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadJobs(true)}
              colors={[P.teal]}
            />
          }
          ListHeaderComponent={
            ratedJobs.length > 0 ? <AverageRating jobs={vendorJobs} /> : null
          }
          renderItem={({ item }) => <ReviewCard job={item} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 52 }}>⭐</Text>
              <Text style={s.emptyTitle}>No reviews yet</Text>
              <Text style={s.emptySub}>
                Reviews from residents appear here once a job is completed and rated.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:     { backgroundColor: P.tealDark, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:   { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 8 },
  headerTitle:{ fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub:  { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  avgCard:    { backgroundColor: P.surface, borderRadius: 18, padding: 20, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: P.border, gap: 6 },
  avgScore:   { fontSize: 52, fontWeight: '900', color: P.gold },
  avgSub:     { fontSize: 13, color: P.muted, marginTop: 4 },
  card:       { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border },
  cardTitle:  { fontSize: 15, fontWeight: '800', color: P.text },
  cardSub:    { fontSize: 12, color: P.muted, marginTop: 2 },
  cardId:     { fontSize: 11, color: '#B0DEDE', marginTop: 1 },
  reviewBox:  { backgroundColor: P.tealSoft, borderRadius: 10, padding: 10, marginTop: 8, borderLeftWidth: 3, borderLeftColor: P.teal },
  reviewText: { fontSize: 13, color: '#3D6E6E', lineHeight: 20, fontStyle: 'italic' },
  tag:        { backgroundColor: P.greenBg, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#BBF7D0' },
  tagText:    { fontSize: 11, fontWeight: '700', color: P.green },
  dateText:   { fontSize: 11, color: '#B0DEDE', marginTop: 8, textAlign: 'right' },
  empty:      { alignItems: 'center', paddingTop: 60, gap: 10, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: P.text },
  emptySub:   { fontSize: 14, color: P.muted, textAlign: 'center', lineHeight: 20 },
});