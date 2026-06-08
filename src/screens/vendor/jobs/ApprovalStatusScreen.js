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

// export default function ApprovalStatusScreen({ navigation, route }) {
//   const theme = useTheme();
//   const { requestId } = route?.params || {};
//   const requests = useSharedStore(s => s.maintenanceRequests);
//   const item = requests.find(r => r.id === requestId);

//   // Map shared statuses to display states
//   const resolvedStatus = !item ? 'pending'
//     : item.status === 'quoted'                 ? 'pending'
//     : item.status === 'quote_sent_to_resident' ? 'forwarded'
//     : item.status === 'quote_accepted'         ? 'approved'
//     : item.status === 'quote_rejected'         ? 'rejected'
//     : 'pending';

//   const STATUS_CONFIG = {
//     pending: {
//       icon: '🕐', iconBg: Colors.amberLight,
//       title: 'Quote Submitted!', sub: 'Waiting for admin to review and forward to resident',
//       badgeLabel: 'Pending Admin Review', badgeColor: Colors.amber, badgeBg: Colors.amberLight,
//     },
//     forwarded: {
//       icon: '📨', iconBg: Colors.tealLight,
//       title: 'Quote Forwarded!', sub: 'Admin has sent the quote to the resident',
//       badgeLabel: 'Awaiting Resident', badgeColor: Colors.teal, badgeBg: Colors.tealLight,
//     },
//     approved: {
//       icon: '✅', iconBg: Colors.greenLight,
//       title: 'Quote Accepted!', sub: 'The resident has accepted your quote',
//       badgeLabel: 'Approved ✓', badgeColor: Colors.green, badgeBg: Colors.greenLight,
//     },
//     rejected: {
//       icon: '❌', iconBg: '#FFF1F1',
//       title: 'Quote Rejected', sub: 'The resident declined your quote',
//       badgeLabel: 'Rejected', badgeColor: '#E53E3E', badgeBg: '#FFF1F1',
//     },
//   };

//   const cfg = STATUS_CONFIG[resolvedStatus];

//   return (
//     <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
//       <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
//       <AppHeader title="Quote Status" onBack={() => navigation.goBack()} />

//       <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

//         <View style={styles.statusBox}>
//           <View style={[styles.statusIcon, { backgroundColor: cfg.iconBg }]}>
//             <Text style={{ fontSize: 52 }}>{cfg.icon}</Text>
//           </View>
//           <Text style={styles.statusTitle}>{cfg.title}</Text>
//           <Text style={styles.statusSub}>{cfg.sub}</Text>
//         </View>

//         {item && (
//           <View style={styles.jobCard}>
//             <View style={styles.jobCardInner}>
//               <Text style={styles.jobCardTag}>{item.category} · {item.id}</Text>
//               <Text style={styles.jobCardName}>{item.residentName}</Text>
//               <Text style={styles.jobCardLoc}>Unit {item.unit}</Text>
//               <Divider style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 10 }} />
//               <View style={styles.jobCardStats}>
//                 <View>
//                   <Text style={styles.jobCardStatLabel}>Quote Amount</Text>
//                   <Text style={styles.jobCardStatValue}>
//                     {item.quote ? ('₹' + item.quote.amount) : '—'}
//                   </Text>
//                 </View>
//                 <View style={styles.jobCardDivider} />
//                 <View>
//                   <Text style={styles.jobCardStatLabel}>Est. Days</Text>
//                   <Text style={styles.jobCardStatValue}>
//                     {item.quote ? (item.quote.estimatedDays + ' days') : '—'}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         )}

//         <Card>
//           <Text style={styles.detailLabel}>Current Status</Text>
//           <View style={[styles.statusBadgeRow, { backgroundColor: cfg.badgeBg, borderRadius: Radius.md, padding: 12 }]}>
//             <Text style={[styles.statusBadgeText, { color: cfg.badgeColor }]}>{cfg.badgeLabel}</Text>
//           </View>

//           {resolvedStatus === 'rejected' && (
//             <View style={styles.rejectedNote}>
//               <Text style={styles.rejectedNoteText}>
//                 💡 You can go back to the request and send a revised quote.
//               </Text>
//             </View>
//           )}
//         </Card>

//         {resolvedStatus === 'approved' && (
//           <PrimaryButton
//             title="🚀 Go to Jobs — Start Work"
//             onPress={() => navigation.navigate('JobsList')}
//             color={Colors.green}
//           />
//         )}

//         {(resolvedStatus === 'pending' || resolvedStatus === 'forwarded') && (
//           <PrimaryButton
//             title="← Back to Requests"
//             onPress={() => navigation.navigate('RequestList')}
//             color={Colors.purple}
//             outline
//           />
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe:   { flex: 1, backgroundColor: Colors.bg },
//   scroll: { padding: 16, paddingBottom: 100 },

//   // Status hero box
//   statusBox:   { alignItems: 'center', paddingVertical: 32, gap: 10 },
//   statusIcon:  { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
//   statusTitle: { fontSize: 22, fontWeight: Fonts.extraBold, color: Colors.text, textAlign: 'center' },
//   statusSub:   { fontSize: 14, color: Colors.text2, textAlign: 'center', lineHeight: 20 },

//   // Job card (coloured summary)
//   jobCard:          { marginBottom: 12 },
//   jobCardInner:     { backgroundColor: Colors.teal, borderRadius: Radius.lg, padding: 18 },
//   jobCardTag:       { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: Fonts.semiBold, marginBottom: 4 },
//   jobCardName:      { fontSize: 17, fontWeight: Fonts.extraBold, color: '#FFF' },
//   jobCardLoc:       { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
//   jobCardStats:     { flexDirection: 'row', alignItems: 'center', gap: 16 },
//   jobCardStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 2 },
//   jobCardStatValue: { fontSize: 16, fontWeight: Fonts.bold, color: '#FFF' },
//   jobCardDivider:   { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },

//   // Status badge row
//   statusBadgeRow:  { flexDirection: 'row', alignItems: 'center' },
//   statusBadgeText: { fontSize: 14, fontWeight: Fonts.bold },

//   // Detail label
//   detailLabel: { fontSize: 12, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 5 },

//   // Rejected note
//   rejectedNote:     { marginTop: 12, backgroundColor: '#FFF8E1', borderRadius: Radius.sm, padding: 10 },
//   rejectedNoteText: { fontSize: 13, color: '#B45309', lineHeight: 18 },
// });

























/**
 * ApprovalStatusScreen.js — Vendor
 *
 * SECURITY FIX (merged):
 *  - appStore replaced with maintenanceStore (vendorJobs)
 *  - Token from useAuthStore(s => s.token)
 *  - Shows live status from backend
 */
import React, { useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAuthStore }    from '../../../store/AuthStore';
import useMaintenanceStore from '../../../store/maintenanceStore';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', tealSoft: '#E8F5F5',
  bg: '#E8F5F5', surface: '#FFF', text: '#1A2E2E', muted: '#7A9E9E', border: '#D0EEEE',
  amber: '#B45309', amberBg: '#FEF3C7',
  green: '#15803D', greenBg: '#DCFCE7',
  purple: '#6D28D9', purpleBg: '#EDE9FE',
  red: '#B91C1C', redBg: '#FEE2E2',
};

const STATUS_CONFIG = {
  quoted: {
    icon: '🕐', iconBg: P.amberBg,
    title: 'Quote Submitted!',
    sub: 'Waiting for admin to review and forward to resident.',
    badgeLabel: 'Pending Admin Review',
    badgeColor: P.amber, badgeBg: P.amberBg,
  },
  quote_sent_to_resident: {
    icon: '📨', iconBg: P.tealSoft,
    title: 'Quote Forwarded!',
    sub: 'Admin has sent the quote to the resident. Awaiting their decision.',
    badgeLabel: 'Awaiting Resident',
    badgeColor: P.teal, badgeBg: P.tealSoft,
  },
  quote_accepted: {
    icon: '✅', iconBg: P.greenBg,
    title: 'Quote Accepted!',
    sub: 'The resident has accepted your quote. Admin will confirm work start shortly.',
    badgeLabel: 'Approved ✓',
    badgeColor: P.green, badgeBg: P.greenBg,
  },
  quote_rejected: {
    icon: '❌', iconBg: P.redBg,
    title: 'Quote Rejected',
    sub: 'The resident declined your quote. Submit a revised quote.',
    badgeLabel: 'Rejected',
    badgeColor: P.red, badgeBg: P.redBg,
  },
  approved_to_start: {
    icon: '🚀', iconBg: P.purpleBg,
    title: 'Work Approved!',
    sub: 'Admin has confirmed work start. Head to the gate with your OTP.',
    badgeLabel: '🚀 Go to Gate',
    badgeColor: P.purple, badgeBg: P.purpleBg,
  },
};

function resolveStatus(status) {
  if (STATUS_CONFIG[status]) return status;
  if (status === 'assigned') return 'quoted'; // treat assigned similarly to quoted
  return 'quoted'; // default
}

export default function ApprovalStatusScreen({ navigation, route }) {
  const { requestId } = route?.params || {};

  const token             = useAuthStore(s => s.token);
  const vendorJobs        = useMaintenanceStore(s => s.vendorJobs);
  const loading           = useMaintenanceStore(s => s.loading);
  const vendorFetchMyJobs = useMaintenanceStore(s => s.vendorFetchMyJobs);

  const loadJob = useCallback(() => {
    vendorFetchMyJobs(token);
  }, [token, vendorFetchMyJobs]);

  useEffect(() => { loadJob(); }, [loadJob]);

  const item = vendorJobs.find(r => String(r.id) === String(requestId));

  if (loading && !item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={P.teal} />
        </View>
      </SafeAreaView>
    );
  }

  const resolvedKey = item ? resolveStatus(item.status) : 'quoted';
  const cfg         = STATUS_CONFIG[resolvedKey] || STATUS_CONFIG.quoted;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Quote Status</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.statusBox}>
          <View style={[s.statusIcon, { backgroundColor: cfg.iconBg }]}>
            <Text style={{ fontSize: 52 }}>{cfg.icon}</Text>
          </View>
          <Text style={s.statusTitle}>{cfg.title}</Text>
          <Text style={s.statusSub}>{cfg.sub}</Text>
        </View>

        {/* Job card */}
        {item && (
          <View style={s.jobCard}>
            <Text style={s.jobTag}>{item.category} · {item.id}</Text>
            <Text style={s.jobName}>{item.residentName}</Text>
            <Text style={s.jobLoc}>Unit {item.unit}</Text>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 10 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View>
                <Text style={s.jobStatLabel}>Quote Amount</Text>
                <Text style={s.jobStatValue}>
                  {item.quote ? `₹${item.quote.amount?.toLocaleString('en-IN')}` : '—'}
                </Text>
              </View>
              <View style={{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <View>
                <Text style={s.jobStatLabel}>Est. Days</Text>
                <Text style={s.jobStatValue}>
                  {item.quote?.estimatedDays ? `${item.quote.estimatedDays} days` : '—'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Status badge */}
        <View style={s.card}>
          <Text style={s.secLabel}>CURRENT STATUS</Text>
          <View style={[s.statusBadgeRow, { backgroundColor: cfg.badgeBg, borderRadius: 12, padding: 12 }]}>
            <Text style={[{ fontSize: 14, fontWeight: '800', color: cfg.badgeColor }]}>{cfg.badgeLabel}</Text>
          </View>

          {resolvedKey === 'quote_rejected' && (
            <View style={{ marginTop: 12, backgroundColor: '#FFF8E1', borderRadius: 10, padding: 10 }}>
              <Text style={{ fontSize: 13, color: '#B45309', lineHeight: 18 }}>
                💡 Go back to the request and submit a revised quote.
              </Text>
            </View>
          )}

          {resolvedKey === 'approved_to_start' && item?.vendorGateOTP && (
            <View style={{ marginTop: 12, backgroundColor: P.purpleBg, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: P.purple }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: P.purple, marginBottom: 6 }}>🔐 YOUR GATE OTP</Text>
              <Text style={{ fontSize: 32, fontWeight: '900', color: '#4C1D95', letterSpacing: 8 }}>{item.vendorGateOTP}</Text>
              <Text style={{ fontSize: 11, color: P.purple, marginTop: 6 }}>Show to security guard at the gate</Text>
            </View>
          )}
        </View>

        {/* CTA */}
        {resolvedKey === 'quote_accepted' || resolvedKey === 'approved_to_start' ? (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: P.green }]}
            onPress={() => navigation.navigate('ActiveWork', { jobId: item?.id })}
          >
            <Text style={s.actionBtnText}>🚀 Go to Work — Start Job</Text>
          </TouchableOpacity>
        ) : null}

        {(resolvedKey === 'quoted' || resolvedKey === 'quote_sent_to_resident') && (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: P.surface, borderWidth: 2, borderColor: P.border }]}
            onPress={() => navigation.navigate('RequestList')}
          >
            <Text style={[s.actionBtnText, { color: P.text }]}>← Back to Requests</Text>
          </TouchableOpacity>
        )}

        {resolvedKey === 'quote_rejected' && (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: P.teal }]}
            onPress={() => navigation.navigate('SendQuote', { requestId: item?.id })}
          >
            <Text style={s.actionBtnText}>📤 Submit Revised Quote</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:        { backgroundColor: P.tealDark, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:      { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 8 },
  headerTitle:   { fontSize: 18, fontWeight: '800', color: '#FFF' },
  scroll:        { padding: 16, paddingBottom: 100 },
  statusBox:     { alignItems: 'center', paddingVertical: 28, gap: 10 },
  statusIcon:    { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statusTitle:   { fontSize: 22, fontWeight: '900', color: P.text, textAlign: 'center' },
  statusSub:     { fontSize: 14, color: P.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 12 },
  jobCard:       { backgroundColor: P.teal, borderRadius: 18, padding: 18, marginBottom: 12 },
  jobTag:        { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginBottom: 4 },
  jobName:       { fontSize: 17, fontWeight: '900', color: '#FFF' },
  jobLoc:        { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  jobStatLabel:  { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 2 },
  jobStatValue:  { fontSize: 16, fontWeight: '800', color: '#FFF' },
  card:          { backgroundColor: P.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: P.border },
  secLabel:      { fontSize: 10, fontWeight: '800', color: P.muted, letterSpacing: 1, marginBottom: 10 },
  statusBadgeRow:{ flexDirection: 'row', alignItems: 'center' },
  actionBtn:     { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  actionBtnText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
});