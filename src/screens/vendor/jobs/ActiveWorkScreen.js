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

// export default function ActiveWorkScreen({ navigation, route }) {
//   const theme = useTheme();
//   const { jobId } = route?.params || {};
//   const requests                   = useSharedStore(s => s.maintenanceRequests);
//   const vendorRequestStepApproval  = useSharedStore(s => s.vendorRequestStepApproval);
//   const vendorRequestPayment        = useSharedStore(s => s.vendorRequestPayment);

//   // Always read fresh from store (not stale closure)
//   const job = requests.find(r => r.id === jobId);

//   if (!job) {
//     return (
//       <SafeAreaView style={[styles.safe, {backgroundColor: theme.background}]}>
//         <AppHeader title="Active Work" onBack={() => navigation.goBack()} />
//         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//           <Text style={{ color: Colors.text2 }}>Job not found.</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // _workStep = number of stages APPROVED so far (0 = none yet, 12 = all done)
//   const completedSteps  = job._workStep || 0;
//   const progress        = Math.round((completedSteps / 12) * 100);
//   const pendingApproval = job.pendingStepApproval === true;
//   const pendingStepNum  = job.pendingStep ?? completedSteps;
//   const isWorkCompleted = job.status === 'work_completed';
//   const isInProgress    = job.status === 'work_in_progress';
//   const currentStageName = WORK_STAGES[completedSteps] || `Stage ${completedSteps + 1}`;
//   const pendingStageName = WORK_STAGES[pendingStepNum]  || `Stage ${pendingStepNum + 1}`;

//   const handleSubmitStage = () => {
//     if (pendingApproval) return;
//     Alert.alert(
//       `Submit Stage ${completedSteps + 1} for Approval`,
//       `Mark "${currentStageName}" as complete?\n\nAdmin and resident will be notified to approve before you can continue.`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Submit for Approval',
//           onPress: () => {
//             vendorRequestStepApproval(jobId);
//             Alert.alert('✅ Submitted!', `Stage ${completedSteps + 1} "${currentStageName}" submitted.\n\nWaiting for admin or resident to approve.`);
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
//       <View style={styles.activeHeader}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
//           <Text style={styles.backArrow}>‹</Text>
//         </TouchableOpacity>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.activeTitle}>Active Work</Text>
//           <Text style={styles.activeSub}>{job.id} · {job.category}</Text>
//         </View>
//         <Badge label="In Progress" color={Colors.amber} bg={Colors.amberLight} />
//       </View>

//       <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

//         {/* Job summary */}
//         <View style={styles.summaryCard}>
//           <View style={styles.summaryCardInner}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.scName}>{job.residentName}</Text>
//               <Text style={styles.scLoc}>Unit {job.unit}</Text>
//             </View>
//             <View style={{ alignItems: 'flex-end' }}>
//               <Text style={styles.scAmtLabel}>Quote Amount</Text>
//               <Text style={styles.scAmt}>{job.quote ? ('₹' + job.quote.amount) : '—'}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Pending approval banner */}
//         {pendingApproval && (
//           <View style={styles.pendingBanner}>
//             <Text style={styles.pendingIcon}>⏳</Text>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.pendingTitle}>Waiting for Approval — Stage {pendingStepNum + 1}/12</Text>
//               <Text style={styles.pendingSub}>"{pendingStageName}" submitted — admin or resident must approve before you can continue.</Text>
//             </View>
//           </View>
//         )}

//         {/* Ready to submit banner */}
//         {isInProgress && !pendingApproval && completedSteps < 12 && (
//           <View style={[styles.pendingBanner, { borderLeftColor: Colors.teal, backgroundColor: theme.surface }]}>
//             <Text style={styles.pendingIcon}>🔧</Text>
//             <View style={{ flex: 1 }}>
//               <Text style={[styles.pendingTitle, { color: Colors.purple }]}>
//                 {completedSteps === 0 ? 'Work Started — Submit Stage 1' : `Stage ${completedSteps} Approved — Submit Stage ${completedSteps + 1}`}
//               </Text>
//               <Text style={[styles.pendingSub, { color: Colors.purple }]}>
//                 Currently working on: "{currentStageName}" — tap Submit below when done.
//               </Text>
//             </View>
//           </View>
//         )}

//         {/* Progress steps */}
//         <Card>
//           <View style={styles.progressHeaderRow}>
//             <Text style={styles.progressTitle}>Work Progress</Text>
//             <Text style={styles.progressCount}>{completedSteps}/12 stages</Text>
//           </View>
//           <View style={styles.progressBarBg}>
//             <View style={[styles.progressBarFill, { width: (progress + '%') }]} />
//           </View>
//           <View style={{ marginTop: 16 }}>
//             {WORK_STAGES.map((stage, i) => (
//               <ProgressStep
//                 key={i}
//                 number={i + 1}
//                 label={stage}
//                 status={
//                   i < completedSteps ? 'done'
//                   : pendingApproval && i === pendingStepNum ? 'active'
//                   : i === completedSteps && !pendingApproval ? 'active'
//                   : 'pending'
//                 }
//                 isLast={i === WORK_STAGES.length - 1}
//               />
//             ))}
//           </View>
//         </Card>

//         {/* Action: submit current stage for approval */}
//         {isInProgress && !pendingApproval && completedSteps < 12 && (
//           <PrimaryButton
//             title={`📋 Submit Stage ${completedSteps + 1} for Approval`}
//             onPress={handleSubmitStage}
//             color={Colors.purple}
//           />
//         )}

//         {/* Waiting state */}
//         {isInProgress && pendingApproval && (
//           <View style={styles.waitingBtn}>
//             <Text style={styles.waitingBtnText}>⏳ Awaiting Approval — Stage {pendingStepNum + 1} "{pendingStageName}"</Text>
//           </View>
//         )}

//         {/* All 12 done — request payment */}
//         {isWorkCompleted && (
//           <PrimaryButton
//             title="💰 Request Payment from Admin"
//             onPress={() => {
//               vendorRequestPayment(jobId);
//               Alert.alert('✅ Requested!', 'Payment request sent to admin. They will collect from the resident and pay you.', [
//                 { text: 'OK', onPress: () => navigation.navigate('JobsList') },
//               ]);
//             }}
//             color={Colors.green}
//           />
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe:   { flex: 1, backgroundColor: Colors.bg },
//   scroll: { padding: 16, paddingBottom: 100 },

//   // Active header
//   activeHeader: {
//     flexDirection: 'row', alignItems: 'center', gap: 12,
//     backgroundColor: '#1A7A7A', paddingTop: 20, paddingBottom: 20, paddingHorizontal: 16,
//   },
//   backBtn:    { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
//   backArrow:  { fontSize: 22, color: '#FFF', marginTop: -2 },
//   activeTitle:{ fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFF' },
//   activeSub:  { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },

//   // Summary card
//   summaryCard:      { backgroundColor: Colors.tealLight, borderRadius: Radius.lg, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.teal + '30' },
//   summaryCardInner: { flexDirection: 'row', alignItems: 'center' },
//   scName:           { fontSize: 16, fontWeight: Fonts.bold, color: Colors.text },
//   scLoc:            { fontSize: 13, color: Colors.text2, marginTop: 2 },
//   scAmtLabel:       { fontSize: 11, color: Colors.text2, marginBottom: 2 },
//   scAmt:            { fontSize: 18, fontWeight: Fonts.extraBold, color: Colors.purple },

//   // Pending / ready banner
//   pendingBanner: {
//     flexDirection: 'row', alignItems: 'flex-start', gap: 10,
//     backgroundColor: Colors.amberLight, borderRadius: Radius.md, padding: 14,
//     marginBottom: 12, borderLeftWidth: 4, borderLeftColor: Colors.amber,
//   },
//   pendingIcon:  { fontSize: 22 },
//   pendingTitle: { fontSize: 13, fontWeight: Fonts.bold, color: Colors.amber, marginBottom: 2 },
//   pendingSub:   { fontSize: 12, color: Colors.text2, lineHeight: 18 },

//   // Progress
//   progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
//   progressTitle:     { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text },
//   progressCount:     { fontSize: 12, color: Colors.text2 },
//   progressBarBg:     { height: 8, backgroundColor: Colors.bg, borderRadius: 99, overflow: 'hidden' },
//   progressBarFill:   { height: '100%', backgroundColor: Colors.teal, borderRadius: 99 },

//   // Waiting button placeholder
//   waitingBtn:     { margin: 16, padding: 16, borderRadius: Radius.md, backgroundColor: Colors.amberLight, alignItems: 'center' },
//   waitingBtnText: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.amber, textAlign: 'center' },
// });


















/**
 * ActiveWorkScreen.js — Vendor
 *
 * SECURITY FIX (merged):
 *  - appStore replaced with maintenanceStore
 *  - vendorMarkWorkComplete from maintenanceStore
 *  - Token from useAuthStore(s => s.token)
 *  - vendorId never sent — backend reads from JWT
 *
 * Flow:
 *   approved_to_start → [guard verifies OTP] → work_in_progress
 *   work_in_progress  → vendor marks complete → work_completed
 *   work_completed    → resident approves     → resident_work_approved
 *   resident_work_approved → vendor requests payment → payment_requested_to_admin
 */
import React, { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity, Alert, ActivityIndicator,
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

const WORK_STAGES = [
  { key: 'work_started',   label: 'Work Started',   icon: '🔧' },
  { key: 'work_completed', label: 'Work Completed',  icon: '🏁' },
];

function ProgressStep({ number, label, icon, status, isLast }) {
  const isDone   = status === 'done';
  const isActive = status === 'active';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: isLast ? 0 : 16 }}>
      <View style={{ alignItems: 'center' }}>
        <View style={[
          ps.dot,
          isDone   && ps.dotDone,
          isActive && ps.dotActive,
        ]}>
          <Text style={{ fontSize: 11 }}>{isDone ? '✓' : icon}</Text>
        </View>
        {!isLast && <View style={[ps.line, isDone && ps.lineDone]} />}
      </View>
      <View style={{ flex: 1, paddingTop: 5 }}>
        <Text style={[ps.label, isActive && { color: P.teal, fontWeight: '800' }, isDone && { color: P.green }]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const ps = StyleSheet.create({
  dot:      { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FAFA', borderWidth: 1.5, borderColor: '#B0DEDE' },
  dotDone:  { backgroundColor: P.green, borderColor: P.green },
  dotActive:{ backgroundColor: P.teal, borderColor: P.teal, transform: [{ scale: 1.1 }] },
  line:     { width: 2, height: 24, backgroundColor: '#D0EEEE', marginTop: 2 },
  lineDone: { backgroundColor: P.green },
  label:    { fontSize: 14, fontWeight: '600', color: P.muted },
});

export default function ActiveWorkScreen({ navigation, route }) {
  const { jobId } = route?.params || {};

  const token               = useAuthStore(s => s.token);
  const vendorJobs          = useMaintenanceStore(s => s.vendorJobs);
  const loading             = useMaintenanceStore(s => s.loading);
  const vendorFetchMyJobs   = useMaintenanceStore(s => s.vendorFetchMyJobs);
  const vendorMarkWorkComplete = useMaintenanceStore(s => s.vendorMarkWorkComplete);

  const loadJob = useCallback(() => {
    vendorFetchMyJobs(token);
  }, [token, vendorFetchMyJobs]);

  useEffect(() => { loadJob(); }, [loadJob]);

  const job = vendorJobs.find(r => String(r.id) === String(jobId));

  if (!job) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
        <StatusBar barStyle="light-content" backgroundColor={P.teal} />
        <View style={s.activeHeader}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.activeTitle}>Active Work</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {loading
            ? <ActivityIndicator size="large" color={P.teal} />
            : <Text style={{ color: P.muted }}>Job not found.</Text>
          }
        </View>
      </SafeAreaView>
    );
  }

  const isInProgress        = job.status === 'work_in_progress';
  const isWorkCompleted     = job.status === 'work_completed';
  const isResidentApproved  = job.status === 'resident_work_approved';
  const isPaymentRequested  = ['payment_requested_to_admin', 'payment_requested_to_resident'].includes(job.status);
  const isPaidToVendor      = ['paid_to_vendor', 'closed'].includes(job.status);

  const completedSteps = isWorkCompleted || isResidentApproved || isPaymentRequested || isPaidToVendor ? 2 : 1;
  const progress       = Math.round((completedSteps / 2) * 100);

  const handleMarkCompleted = () => {
    Alert.alert(
      'Mark Work Completed',
      'Confirm that you have finished the entire job?\n\nThe resident will be notified to review and approve.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            const result = await vendorMarkWorkComplete(token, job.id);
            if (result.ok) {
              Alert.alert('✅ Done!', 'Work marked as completed. Waiting for resident to confirm.');
            } else {
              Alert.alert('Error', result.data?.message || 'Could not update. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleGoToPayment = () => {
    navigation.navigate('WorkCompleted', { jobId: job.id });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={P.teal} />

      <View style={s.activeHeader}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.activeTitle}>Active Work</Text>
          <Text style={s.activeSub}>{job.id} · {job.category}</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ fontSize: 11, color: '#FFF', fontWeight: '700' }}>In Progress</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Job summary */}
        <View style={s.summaryCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={s.scName}>{job.residentName}</Text>
              <Text style={s.scLoc}>Unit {job.unit}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.scAmtLabel}>Quote Amount</Text>
              <Text style={s.scAmt}>{job.quote ? `₹${job.quote.amount?.toLocaleString('en-IN')}` : '—'}</Text>
            </View>
          </View>
        </View>

        {/* Status banners */}
        {isInProgress && (
          <View style={[s.banner, { borderLeftColor: P.teal, backgroundColor: P.tealSoft }]}>
            <Text style={s.bannerIcon}>🔧</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.bannerTitle, { color: P.teal }]}>Work In Progress</Text>
              <Text style={s.bannerSub}>You are on-site and working. Tap below once the job is fully done.</Text>
            </View>
          </View>
        )}

        {isWorkCompleted && (
          <View style={[s.banner, { borderLeftColor: P.green, backgroundColor: P.greenBg }]}>
            <Text style={s.bannerIcon}>🏁</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.bannerTitle, { color: P.green }]}>Work Completed!</Text>
              <Text style={[s.bannerSub, { color: '#166534' }]}>
                Waiting for the resident to review and approve the work before you can raise a payment request.
              </Text>
            </View>
          </View>
        )}

        {isResidentApproved && (
          <View style={[s.banner, { borderLeftColor: P.purple, backgroundColor: P.purpleBg }]}>
            <Text style={s.bannerIcon}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.bannerTitle, { color: P.purple }]}>Resident Approved!</Text>
              <Text style={[s.bannerSub, { color: '#4C1D95' }]}>
                Tap below to raise a payment request to admin.
              </Text>
            </View>
          </View>
        )}

        {isPaymentRequested && (
          <View style={[s.banner, { borderLeftColor: P.green, backgroundColor: P.greenBg }]}>
            <Text style={s.bannerIcon}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.bannerTitle, { color: P.green }]}>Payment Requested</Text>
              <Text style={s.bannerSub}>Admin will collect from the resident and transfer to you.</Text>
            </View>
          </View>
        )}

        {isPaidToVendor && (
          <View style={[s.banner, { borderLeftColor: P.green, backgroundColor: P.greenBg }]}>
            <Text style={s.bannerIcon}>💰</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.bannerTitle, { color: P.green }]}>Job Closed — Paid!</Text>
              <Text style={s.bannerSub}>This job is complete and payment has been received.</Text>
            </View>
          </View>
        )}

        {/* Progress card */}
        <View style={s.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={s.secLabel}>WORK PROGRESS</Text>
            <Text style={{ fontSize: 12, color: P.muted }}>{completedSteps}/2 stages</Text>
          </View>
          <View style={s.progressBarBg}>
            <View style={[s.progressBarFill, { width: progress + '%' }]} />
          </View>
          <View style={{ marginTop: 16 }}>
            {WORK_STAGES.map((stage, i) => (
              <ProgressStep
                key={stage.key}
                number={i + 1}
                label={stage.label}
                icon={stage.icon}
                status={
                  i < completedSteps - 1     ? 'done'
                  : i === completedSteps - 1 ? 'active'
                  : 'pending'
                }
                isLast={i === WORK_STAGES.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Payment flow info */}
        <View style={s.card}>
          <Text style={s.secLabel}>💡 PAYMENT FLOW</Text>
          {[
            { icon: '🔧', text: 'Vendor completes the work',                    done: completedSteps >= 1 },
            { icon: '🏁', text: 'Vendor marks work as completed',               done: isWorkCompleted || isResidentApproved || isPaymentRequested || isPaidToVendor },
            { icon: '👤', text: 'Resident reviews and approves completed work', done: isResidentApproved || isPaymentRequested || isPaidToVendor },
            { icon: '💰', text: 'Vendor raises payment request to admin',       done: isPaymentRequested || isPaidToVendor },
            { icon: '🏦', text: 'Admin collects from resident and pays vendor', done: isPaidToVendor },
          ].map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <Text style={{ fontSize: 16, width: 24 }}>{step.done ? '✅' : step.icon}</Text>
              <Text style={{ fontSize: 12, color: step.done ? P.green : P.muted, flex: 1, lineHeight: 18, fontWeight: step.done ? '700' : '400' }}>
                {step.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        {isInProgress && (
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: P.teal }]} onPress={handleMarkCompleted}>
            <Text style={s.actionBtnText}>✅ Mark Work as Completed</Text>
          </TouchableOpacity>
        )}

        {isWorkCompleted && (
          <View style={[s.waitingBtn]}>
            <Text style={s.waitingBtnText}>👤 Waiting for resident to review and approve the work…</Text>
          </View>
        )}

        {isResidentApproved && (
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: P.green }]} onPress={handleGoToPayment}>
            <Text style={s.actionBtnText}>💰 Request Payment from Admin</Text>
          </TouchableOpacity>
        )}

        {isPaymentRequested && (
          <View style={s.waitingBtn}>
            <Text style={s.waitingBtnText}>⏳ Payment requested — waiting for admin to pay you.</Text>
          </View>
        )}

        {isPaidToVendor && (
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
  activeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: P.teal, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 16 },
  backBtn:      { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backArrow:    { fontSize: 22, color: '#FFF', marginTop: -2 },
  activeTitle:  { fontSize: 18, fontWeight: '800', color: '#FFF' },
  activeSub:    { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  scroll:       { padding: 16, paddingBottom: 100 },
  summaryCard:  { backgroundColor: P.tealSoft, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#B0DEDE' },
  scName:       { fontSize: 16, fontWeight: '800', color: P.text },
  scLoc:        { fontSize: 13, color: P.muted, marginTop: 2 },
  scAmtLabel:   { fontSize: 11, color: P.muted, marginBottom: 2 },
  scAmt:        { fontSize: 18, fontWeight: '900', color: P.teal },
  banner:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, padding: 14, marginBottom: 12, borderLeftWidth: 4 },
  bannerIcon:   { fontSize: 22 },
  bannerTitle:  { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  bannerSub:    { fontSize: 12, color: P.muted, lineHeight: 18 },
  card:         { backgroundColor: P.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: P.border },
  secLabel:     { fontSize: 10, fontWeight: '800', color: P.muted, letterSpacing: 1, marginBottom: 10 },
  progressBarBg:  { height: 8, backgroundColor: P.tealSoft, borderRadius: 99, overflow: 'hidden' },
  progressBarFill:{ height: '100%', backgroundColor: P.teal, borderRadius: 99 },
  actionBtn:    { paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  actionBtnText:{ color: '#FFF', fontWeight: '900', fontSize: 15 },
  waitingBtn:   { padding: 16, borderRadius: 14, backgroundColor: P.amberBg, alignItems: 'center', marginBottom: 12, borderLeftWidth: 4, borderLeftColor: P.amber },
  waitingBtnText: { fontSize: 13, fontWeight: '700', color: P.amber, textAlign: 'center', lineHeight: 20 },
});
