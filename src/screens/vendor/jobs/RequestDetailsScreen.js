// import React from 'react';
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, SafeAreaView, StatusBar,
// } from 'react-native';
// import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
// import { AppHeader, Avatar, Card, PrimaryButton, Divider } from '../../../vendor/components';
// import useSharedStore from '../../../store/appStore';
// import { useTheme } from '../../../hooks/useTheme';

// export default function RequestDetailsScreen({ navigation, route }) {
//   const theme = useTheme();
//   const { requestId } = route?.params || {};
//   const requests = useSharedStore(s => s.maintenanceRequests);

//   const request = requests.find(r => r.id === requestId);

//   if (!request) {
//     return (
//       <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
//         <AppHeader title="Request Details" onBack={() => navigation.goBack()} />
//         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//           <Text style={{ color: Colors.text2 }}>Request not found.</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // Map shared-store status to display info
//   const STATUS_INFO = {
//     quote_requested:       { label: 'Quote Requested — Submit Your Bid', color: Colors.purple, bg: Colors.purpleLight, icon: '📋' },
//     assigned:              { label: 'Assigned — Submit Your Quote',       color: Colors.purple, bg: Colors.purpleLight, icon: '📋' },
//     quoted:                { label: 'Quote Sent — Awaiting Admin Review', color: Colors.amber,  bg: Colors.amberLight,  icon: '💬' },
//     quote_sent_to_resident:{ label: 'Quote Forwarded to Resident',        color: Colors.teal,   bg: Colors.tealLight,   icon: '📨' },
//     quote_accepted:        { label: 'Quote Accepted — Ready to Start',    color: Colors.green,  bg: Colors.greenLight,  icon: '✅' },
//     quote_rejected:        { label: 'Quote Rejected',                     color: '#E53E3E',     bg: '#FFF1F1',          icon: '❌' },
//     work_in_progress:      { label: 'Work In Progress',                   color: Colors.amber,  bg: Colors.amberLight,  icon: '🔧' },
//     work_completed:        { label: 'Work Completed',                     color: Colors.green,  bg: Colors.greenLight,  icon: '🏁' },
//     approved_to_start:     { label: 'Approved — Head to Gate with OTP',   color: Colors.green,  bg: Colors.greenLight,  icon: '🚀' },
//   };
//   const statusInfo = STATUS_INFO[request.status] || { label: request.status, color: Colors.purple, bg: Colors.purpleLight, icon: '📋' };

//   return (
//     <SafeAreaView style={[styles.safe, {backgroundColor: theme.background}]}>
//       <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
//       <AppHeader title="Request Details" onBack={() => navigation.goBack()} />

//       <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

//         {/* Customer Card */}
//         <Card style={styles.customerCard}>
//           <View style={styles.customerRow}>
//             <Avatar name={request.residentName} size={50} color={Colors.purple} />
//             <View style={{ flex: 1 }}>
//               <Text style={styles.customerName}>{request.residentName}</Text>
//               <Text style={styles.customerLoc}>Unit {request.unit}</Text>
//               <Text style={styles.customerTime}>
//                 {new Date(request.createdAt).toLocaleDateString()} · {request.id}
//               </Text>
//             </View>
//           </View>
//         </Card>

//         {/* Detail rows */}
//         {[
//           { label: 'Service Category', value: request.category },
//           { label: 'Issue Title',      value: request.title },
//           { label: 'Description',      value: request.description },
//           { label: 'Priority',         value: request.priority },
//         ].map((row, i) => (
//           <Card key={i}>
//             <Text style={styles.detailLabel}>{row.label}</Text>
//             <Text style={styles.detailValue}>{row.value}</Text>
//           </Card>
//         ))}

//         {/* Quote details if submitted */}
//         {request.quote && (
//           <Card>
//             <Text style={styles.detailLabel}>Your Quote</Text>
//             <Text style={[styles.detailValue, { color: Colors.purple, fontSize: 18, fontWeight: Fonts.bold }]}>
//               ₹{request.quote.amount?.toLocaleString()}
//             </Text>
//             <Text style={[styles.detailValue, { marginTop: 4 }]}>{request.quote.description}</Text>
//             <Text style={[styles.detailLabel, { marginTop: 6 }]}>Estimated: {request.quote.estimatedDays} days</Text>
//           </Card>
//         )}

//         {/* Status Card */}
//         <Card>
//           <Text style={styles.detailLabel}>Request Status</Text>
//           <View style={[styles.statusBadgeRow, { backgroundColor: statusInfo.bg, borderRadius: 10, padding: 12 }]}>
//             <Text style={{ fontSize: 18, marginRight: 8 }}>{statusInfo.icon}</Text>
//             <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
//           </View>
//         </Card>

//         {/* Timeline */}
//         {request.timeline && request.timeline.length > 0 && (
//           <Card>
//             <Text style={styles.detailLabel}>Timeline</Text>
//             {request.timeline.map((t, i) => (
//               <View key={i} style={styles.timelineItem}>
//                 <View style={[styles.timelineDot, { backgroundColor: Colors.teal }]} />
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.timelineAction}>{t.action}</Text>
//                   <Text style={styles.timelineAt}>{new Date(t.at).toLocaleString()} · {t.by}</Text>
//                 </View>
//               </View>
//             ))}
//           </Card>
//         )}

//         {/* Gate OTP — shown when approved_to_start */}
//         {request.status === 'approved_to_start' && request.vendorGateOTP && (
//           <Card style={{ borderColor: Colors.purple, borderWidth: 2 }}>
//             <Text style={styles.detailLabel}>🔐 Gate Entry OTP</Text>
//             <Text style={{ fontSize: 28, fontWeight: Fonts.extraBold, color: Colors.purple, letterSpacing: 6, marginTop: 4 }}>
//               {request.vendorGateOTP}
//             </Text>
//             <Text style={[styles.detailLabel, { marginTop: 8 }]}>Show this OTP to the security guard to enter the community.</Text>
//           </Card>
//         )}

//       </ScrollView>

//       {/* Send Quote footer — shown when admin has requested a quote OR legacy assigned */}
//       {(request.status === 'quote_requested' || request.status === 'assigned') && (
//         <View style={styles.footer}>
//           <PrimaryButton
//             title="📤 Submit Your Quote"
//             onPress={() => navigation.navigate('SendQuote', { requestId: request.id })}
//             color={Colors.purple}
//           />
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe:   { flex: 1, backgroundColor: Colors.bg },
//   scroll: { padding: 16, paddingBottom: 100 },

//   customerCard: { marginBottom: 10 },
//   customerRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   customerName: { fontSize: 17, fontWeight: Fonts.extraBold, color: Colors.text },
//   customerLoc:  { fontSize: 13, color: Colors.text2, marginTop: 2 },
//   customerTime: { fontSize: 11, color: Colors.text3, marginTop: 3 },

//   detailLabel: { fontSize: 12, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 5 },
//   detailValue: { fontSize: 14, color: Colors.text, lineHeight: 20 },

//   contactRow:    { flexDirection: 'row', gap: 10, marginTop: 4 },
//   contactBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: Radius.md },
//   contactBtnText:{ fontSize: 14, fontWeight: Fonts.bold },

//   statusBadgeRow:  { flexDirection: 'row', alignItems: 'center' },
//   statusBadgeText: { fontSize: 14, fontWeight: Fonts.bold },

//   timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 12 },
//   timelineDot:  { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
//   timelineAction: { fontSize: 13, fontWeight: '600', color: Colors.text },
//   timelineAt:     { fontSize: 11, color: Colors.text3, marginTop: 2 },

//   footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
// });


















/**
 * RequestDetailsScreen.js — Vendor
 *
 * SECURITY FIX (merged):
 *  - appStore replaced with maintenanceStore (vendorJobs)
 *  - Token from useAuthStore(s => s.token)
 *  - vendorId never sent — backend reads from JWT
 */
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import useMaintenanceStore from '../../../store/maintenanceStore';
import StatusBadge from '../../../components/common/StatusBadge';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', tealSoft: '#E8F5F5',
  bg: '#E8F5F5', surface: '#FFF', text: '#1A2E2E',
  muted: '#7A9E9E', border: '#D0EEEE',
  green: '#15803D', greenBg: '#DCFCE7',
  amber: '#B45309', amberBg: '#FEF3C7',
  purple: '#6D28D9', purpleBg: '#EDE9FE',
  red: '#B91C1C', redBg: '#FEE2E2',
};

function InfoRow({ label, value }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || '—'}</Text>
    </View>
  );
}

const STATUS_HINT = {
  quote_requested: { text: '📤 Admin has invited you — submit a quote to proceed.', color: P.teal, bg: P.tealSoft },
  assigned: { text: '👷 You\'ve been assigned — submit your quote below.', color: P.teal, bg: P.tealSoft },
  quoted: { text: '💬 Your quote is sent — awaiting admin review.', color: P.amber, bg: P.amberBg },
  quote_sent_to_resident: { text: '📨 Quote forwarded to resident — awaiting their decision.', color: '#0D9488', bg: '#CCFBF1' },
  quote_accepted: { text: '✅ Resident accepted the quote — wait for admin to approve work start.', color: P.green, bg: P.greenBg },
  quote_rejected: { text: '❌ Resident rejected the quote. Submit a revised quote.', color: P.red, bg: P.redBg },
  approved_to_start: { text: '🚀 Work approved! Head to the gate with your OTP below.', color: P.purple, bg: P.purpleBg },
  work_in_progress: { text: '🔧 Work is in progress. Mark it complete once done.', color: P.amber, bg: P.amberBg },
  work_completed: { text: '🏁 Work marked complete — waiting for resident to approve.', color: '#0D9488', bg: '#CCFBF1' },
  resident_work_approved: { text: '✅ Resident approved! You can now request payment from admin.', color: P.green, bg: P.greenBg },
  payment_requested_to_admin: { text: '💳 Payment request sent — admin will collect and pay you.', color: P.amber, bg: P.amberBg },
  payment_requested_to_resident: { text: '⏳ Admin has requested payment from resident.', color: P.amber, bg: P.amberBg },
  payment_received: { text: '💵 Payment received by admin. Transfer to you is pending.', color: '#0891B2', bg: '#E0F7FA' },
  paid_to_vendor: { text: '💰 Job closed! You have been paid. Well done!', color: P.green, bg: P.greenBg },
};

export default function RequestDetailsScreen({ navigation, route }) {
  const { requestId } = route?.params || {};
  const vendorJobs = useMaintenanceStore(s => s.vendorJobs);

  // Also check requests (admin might have fetched it)
  const requests = useMaintenanceStore(s => s.requests);
  const request = vendorJobs.find(r => String(r.id) === String(requestId))
    || requests.find(r => String(r.id) === String(requestId));

  if (!request) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
        <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Request Details</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: P.muted }}>Request not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hint = STATUS_HINT[request.status];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{request.title}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Status hint banner */}
        {hint && (
          <View style={[s.hintBanner, { backgroundColor: hint.bg, borderLeftColor: hint.color }]}>
            <Text style={[s.hintText, { color: hint.color }]}>{hint.text}</Text>
          </View>
        )}

        {/* Status */}
        <View style={s.card}>
          <Text style={s.secLabel}>STATUS</Text>
          <StatusBadge status={request.status} />
        </View>

        {/* Customer Info */}
        <View style={s.card}>
          <Text style={s.secLabel}>CUSTOMER</Text>
          <View style={s.customerRow}>
            <View style={s.customerAvatar}>
              <Text style={{ fontSize: 22 }}>👤</Text>
            </View>
            <View>
              <Text style={s.customerName}>{request.residentName || '—'}</Text>
              <Text style={s.customerSub}>Unit {request.unit || '—'}</Text>
              <Text style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>Job #{request.id}</Text>
            </View>
          </View>
        </View>

        {/* Job Details */}
        <View style={s.card}>
          <Text style={s.secLabel}>JOB DETAILS</Text>
          <InfoRow label="Category" value={request.category} />
          <InfoRow label="Priority" value={request.priority} />
          <InfoRow label="Submitted" value={request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} />
          {request.preferredSlot && <InfoRow label="Preferred Slot" value={request.preferredSlot} />}
          {request.contactPref && <InfoRow label="Contact via" value={request.contactPref} />}
          <Text style={[s.secLabel, { marginTop: 12 }]}>DESCRIPTION</Text>
          <Text style={{ fontSize: 14, color: P.text, lineHeight: 22 }}>{request.description || '—'}</Text>
        </View>

        {/* Your submitted quote */}
        {request.quote && (
          <View style={s.card}>
            <Text style={s.secLabel}>YOUR QUOTE</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: P.green, marginBottom: 6 }}>
              ₹{request.quote.amount?.toLocaleString('en-IN')}
            </Text>
            {request.quote.description && <InfoRow label="Description" value={request.quote.description} />}
            {request.quote.estimatedDays && <InfoRow label="Est. Days" value={`${request.quote.estimatedDays} day(s)`} />}
          </View>
        )}

        {/* Gate OTP */}
        {request.status === 'approved_to_start' && request.vendorGateOTP && (
          <View style={[s.card, { borderColor: P.purple, borderWidth: 2 }]}>
            <Text style={s.secLabel}>🔐 GATE ENTRY OTP</Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: P.purple, letterSpacing: 8, marginVertical: 8 }}>
              {request.vendorGateOTP}
            </Text>
            <Text style={{ fontSize: 12, color: P.muted }}>
              Show this OTP to the security guard to enter. Do not share with anyone else.
            </Text>
          </View>
        )}

        {/* Timeline */}
        {request.timeline?.length > 0 && (
          <View style={s.card}>
            <Text style={s.secLabel}>TIMELINE</Text>
            {[...request.timeline].reverse().map((t, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10, paddingBottom: 12 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: i === 0 ? P.teal : '#B0DEDE', marginTop: 3 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: P.text }}>{t.action}</Text>
                  {t.by && <Text style={{ fontSize: 11, color: P.muted, marginTop: 1 }}>by {t.by}</Text>}
                  {t.at && <Text style={{ fontSize: 11, color: P.muted }}>{new Date(t.at).toLocaleString('en-IN')}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Footer actions */}
      {(request.status === 'quote_requested' || request.status === 'assigned') && (
        <View style={s.footer}>
          <TouchableOpacity
            style={s.footerBtn}
            onPress={() => navigation.navigate('SendQuote', { requestId: request.id })}
          >
            <Text style={s.footerBtnText}>📤 Submit Your Quote</Text>
          </TouchableOpacity>
        </View>
      )}

      {request.status === 'approved_to_start' && (
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.footerBtn, { backgroundColor: P.purple }]}
            onPress={() => navigation.navigate('ActiveWork', { jobId: request.id })}
          >
            <Text style={s.footerBtnText}>🔧 Begin Work</Text>
          </TouchableOpacity>
        </View>
      )}

      {request.status === 'work_in_progress' && (
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.footerBtn, { backgroundColor: P.amber }]}
            onPress={() => navigation.navigate('ActiveWork', { jobId: request.id })}
          >
            <Text style={s.footerBtnText}>📝 Mark Work Complete</Text>
          </TouchableOpacity>
        </View>
      )}

      {request.status === 'resident_work_approved' && (
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.footerBtn, { backgroundColor: P.green }]}
            onPress={() => navigation.navigate('WorkCompleted', { jobId: request.id })}
          >
            <Text style={s.footerBtnText}>💰 Request Payment</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: P.tealDark, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  card: { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border },
  secLabel: { fontSize: 10, fontWeight: '800', color: P.muted, letterSpacing: 1, marginBottom: 10 },
  hintBanner: { borderRadius: 12, padding: 14, marginBottom: 12, borderLeftWidth: 4 },
  hintText: { fontSize: 13, fontWeight: '700', lineHeight: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#F0FAFA' },
  infoLabel: { fontSize: 13, color: P.muted },
  infoValue: { fontSize: 13, fontWeight: '700', color: P.text, textAlign: 'right', flex: 1, marginLeft: 12 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  customerAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: P.tealSoft, alignItems: 'center', justifyContent: 'center' },
  customerName: { fontSize: 16, fontWeight: '800', color: P.text },
  customerSub: { fontSize: 13, color: P.muted, marginTop: 2 },
  footer: { padding: 16, backgroundColor: P.surface, borderTopWidth: 1, borderTopColor: P.border },
  footerBtn: { backgroundColor: P.teal, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  footerBtnText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
});