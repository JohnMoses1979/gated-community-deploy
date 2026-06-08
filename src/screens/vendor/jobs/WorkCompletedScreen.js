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

// export default function WorkCompletedScreen({ navigation, route }) {
//   const theme = useTheme();
//   const { jobId } = route?.params || {};
//   const requests           = useSharedStore(s => s.maintenanceRequests);
//   const vendorRequestPayment = useSharedStore(s => s.vendorRequestPayment);

//   const job = requests.find(r => r.id === jobId) || {};

//   return (
//     <SafeAreaView style={[styles.safe, {backgroundColor: theme.background}]}>
//       <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
//       <AppHeader title="Work Completed" onBack={() => navigation.goBack()} />

//       <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
//         <View style={styles.statusBox}>
//           <View style={[styles.statusIcon, { backgroundColor: Colors.greenLight }]}>
//             <Text style={{ fontSize: 52 }}>🏁</Text>
//           </View>
//           <Text style={styles.statusTitle}>Work Completed!</Text>
//           <Text style={styles.statusSub}>Request payment from admin to proceed</Text>
//         </View>

//         <Card>
//           {[
//             ['Resident',  job.residentName || '—'],
//             ['Category',  job.category     || '—'],
//             ['Job ID',    job.id           || '—'],
//             ['Quote',     job.quote ? ('₹' + job.quote.amount) : '—'],
//           ].map(([k, v], i) => (
//             <View key={i} style={[styles.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 }]}>
//               <Text style={styles.detailLabel}>{k}</Text>
//               <Text style={styles.detailValue}>{v}</Text>
//             </View>
//           ))}
//         </Card>

//         {job.status === 'work_completed' && (
//           <PrimaryButton
//             title="💰 Request Payment from Admin"
//             onPress={() => {
//               vendorRequestPayment(job.id);
//               Alert.alert('Done', 'Payment request sent to admin.', [
//                 { text: 'OK', onPress: () => navigation.navigate('BusinessHome') },
//               ]);
//             }}
//             color={Colors.green}
//           />
//         )}

//         {job.status !== 'work_completed' && (
//           <PrimaryButton
//             title="🏠 Back to Home"
//             onPress={() => navigation.navigate('BusinessHome')}
//             color={Colors.purple}
//           />
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }






















/**
 * WorkCompletedScreen.js — Vendor
 *
 * SECURITY FIX (merged):
 *  - appStore.vendorRequestPayment replaced with maintenanceStore.vendorRequestPayment
 *  - Token from useAuthStore(s => s.token)
 *  - vendorId never sent — backend reads from JWT
 *
 * Flow guard: vendor can only request payment AFTER resident approves work.
 */
import React, { useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Alert, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAuthStore }    from '../../../store/AuthStore';
import useMaintenanceStore from '../../../store/maintenanceStore';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', tealSoft: '#E8F5F5',
  bg: '#E8F5F5', surface: '#FFF', text: '#1A2E2E', muted: '#7A9E9E', border: '#D0EEEE',
  amber: '#B45309', amberBg: '#FEF3C7',
  green: '#15803D', greenBg: '#DCFCE7',
  purple: '#6D28D9', purpleBg: '#EDE9FE',
};

export default function WorkCompletedScreen({ navigation, route }) {
  const { jobId } = route?.params || {};

  const token              = useAuthStore(s => s.token);
  const vendorJobs         = useMaintenanceStore(s => s.vendorJobs);
  const loading            = useMaintenanceStore(s => s.loading);
  const vendorFetchMyJobs  = useMaintenanceStore(s => s.vendorFetchMyJobs);
  const vendorRequestPayment = useMaintenanceStore(s => s.vendorRequestPayment);

  const loadJob = useCallback(() => {
    vendorFetchMyJobs(token);
  }, [token, vendorFetchMyJobs]);

  useEffect(() => { loadJob(); }, [loadJob]);

  const job = vendorJobs.find(r => String(r.id) === String(jobId)) || {};

  const isWorkCompleted       = job.status === 'work_completed';
  const isResidentApproved    = job.status === 'resident_work_approved';
  const isPaymentRequested    = ['payment_requested_to_admin', 'payment_requested_to_resident'].includes(job.status);
  const isPaid                = ['payment_received', 'paid_to_vendor', 'closed'].includes(job.status);

  const handleRequestPayment = () => {
    Alert.alert(
      'Request Payment from Admin',
      `Send a payment request of ₹${job.quote?.amount?.toLocaleString('en-IN') || '—'} to Admin?\n\nAdmin will collect from the resident and transfer to you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            const result = await vendorRequestPayment(token, job.id);
            if (result.ok) {
              Alert.alert(
                '💰 Request Sent!',
                'Payment request has been sent to admin. They will collect from the resident and pay you.',
                [{ text: 'OK', onPress: () => navigation.navigate('BusinessHome') }]
              );
            } else {
              Alert.alert('Error', result.data?.message || 'Could not send request. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading && !job.id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={P.teal} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Work Completed</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero status icon */}
        <View style={s.statusBox}>
          <View style={[s.statusIcon, { backgroundColor: isPaid ? P.greenBg : isResidentApproved ? '#EDE9FE' : P.amberBg }]}>
            <Text style={{ fontSize: 52 }}>
              {isPaid ? '💰' : isPaymentRequested ? '💳' : isResidentApproved ? '✅' : '🏁'}
            </Text>
          </View>
          <Text style={s.statusTitle}>
            {isPaid              ? 'Job Closed — Paid!'
            : isPaymentRequested ? 'Payment Requested'
            : isResidentApproved ? 'Resident Approved!'
            : 'Work Completed'}
          </Text>
          <Text style={s.statusSub}>
            {isPaid
              ? 'This job has been completed and payment received. Well done!'
            : isPaymentRequested
              ? 'Waiting for admin to process and transfer payment to you.'
            : isResidentApproved
              ? 'Resident confirmed the work. Raise a payment request now.'
            : 'Waiting for resident to review and approve the completed work.'}
          </Text>
        </View>

        {/* Job details */}
        <View style={s.card}>
          <Text style={s.secLabel}>JOB DETAILS</Text>
          {[
            ['Resident',  job.residentName || '—'],
            ['Unit',      job.unit         || '—'],
            ['Category',  job.category     || '—'],
            ['Job ID',    job.id           || '—'],
            ['Quote',     job.quote ? `₹${job.quote.amount?.toLocaleString('en-IN')}` : '—'],
            ['Status',    job.status?.replace(/_/g, ' ') || '—'],
          ].map(([k, v], i) => (
            <View key={k} style={[s.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: '#F0FAFA', paddingTop: 8 }]}>
              <Text style={s.detailLabel}>{k}</Text>
              <Text style={s.detailValue}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Payment flow info */}
        <View style={s.card}>
          <Text style={s.secLabel}>💡 PAYMENT FLOW</Text>
          {[
            { icon: '🏁', text: 'Vendor marks work as completed',              done: true },
            { icon: '👤', text: 'Resident reviews and approves completed work', done: isResidentApproved || isPaymentRequested || isPaid },
            { icon: '💰', text: 'Vendor raises payment request to admin',       done: isPaymentRequested || isPaid },
            { icon: '🏦', text: 'Admin collects from resident and pays vendor', done: isPaid },
          ].map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <Text style={{ fontSize: 16, width: 24 }}>{step.done ? '✅' : step.icon}</Text>
              <Text style={{ fontSize: 12, color: step.done ? P.green : P.muted, flex: 1, lineHeight: 18, fontWeight: step.done ? '700' : '400' }}>
                {step.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Waiting for resident */}
        {isWorkCompleted && (
          <View style={s.waitingBanner}>
            <Text style={s.waitingText}>
              👤 Waiting for resident to review and approve the completed work…{'\n'}
              You'll be notified once they confirm.
            </Text>
          </View>
        )}

        {/* Request payment button */}
        {isResidentApproved && (
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: P.green }]} onPress={handleRequestPayment}>
            <Text style={s.actionBtnText}>💰 Request Payment from Admin</Text>
          </TouchableOpacity>
        )}

        {/* Payment awaiting */}
        {isPaymentRequested && (
          <View style={s.waitingBanner}>
            <Text style={s.waitingText}>
              💳 Payment request sent to admin. They will collect from the resident and transfer to you.
            </Text>
          </View>
        )}

        {/* Done */}
        {isPaid && (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: P.purple }]}
            onPress={() => navigation.navigate('BusinessHome')}
          >
            <Text style={s.actionBtnText}>🏠 Back to Home</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:      { backgroundColor: P.tealDark, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  scroll:      { padding: 16, paddingBottom: 100 },
  statusBox:   { alignItems: 'center', paddingVertical: 28, gap: 10 },
  statusIcon:  { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statusTitle: { fontSize: 22, fontWeight: '900', color: P.text, textAlign: 'center' },
  statusSub:   { fontSize: 14, color: P.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  card:        { backgroundColor: P.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: P.border },
  secLabel:    { fontSize: 10, fontWeight: '800', color: P.muted, letterSpacing: 1, marginBottom: 10 },
  detailRow:   { paddingBottom: 8 },
  detailLabel: { fontSize: 12, fontWeight: '600', color: P.muted, marginBottom: 3 },
  detailValue: { fontSize: 14, fontWeight: '700', color: P.text },
  waitingBanner: { padding: 16, borderRadius: 14, backgroundColor: P.amberBg, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: P.amber },
  waitingText:   { fontSize: 13, fontWeight: '700', color: P.amber, lineHeight: 20 },
  actionBtn:     { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  actionBtnText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
});
