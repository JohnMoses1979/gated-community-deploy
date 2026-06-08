// import React, { useState } from 'react';
// import {
//   View, Text, ScrollView, TouchableOpacity, StyleSheet,
//   SafeAreaView, Alert, Modal,
// } from 'react-native';
// import useAppStore from '../../../store/appStore';
// import { COLORS, globalStyles, STATUS_LABELS } from '../../../components/common/theme';
// import { useTheme } from '../../../hooks/useTheme';

// function formatDate(iso) {
//   if (!iso) return '—';
//   return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
// }

// export default function MaintenanceDetailScreen({ route, navigation }) {
//   const theme = useTheme();
//   const { requestId } = route.params;
//   const requests               = useAppStore((s) => s.maintenanceRequests);
//   const users                  = useAppStore((s) => s.users);
//   const adminSendQuoteRequest  = useAppStore((s) => s.adminSendQuoteRequest);
//   const adminApproveQuote      = useAppStore((s) => s.adminApproveQuote);
//   const adminConfirmWorkStart  = useAppStore((s) => s.adminConfirmWorkStart);
//   const adminRequestPaymentFromResident = useAppStore((s) => s.adminRequestPaymentFromResident);
//   const adminPayVendor         = useAppStore((s) => s.adminPayVendor);
//   const approveWorkStep        = useAppStore((s) => s.approveWorkStep);

//   const req = requests.find(r => r.id === requestId);

//   // Vendor picker state
//   const [showVendorModal, setShowVendorModal] = useState(false);
//   const [selectedVendors, setSelectedVendors] = useState([]);

//   const vendors = users.filter(u => u.role === 'vendor');

//   if (!req) {
//     return (
//       <SafeAreaView style={globalStyles.screen}>
//         <View style={globalStyles.emptyState}>
//           <Text style={globalStyles.emptyText}>Request not found</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // ─── Status Actions ────────────────────────────────────────────────────────
//   const getActionButton = (r) => {
//     switch (r.status) {
//       case 'submitted':
//         return {
//           label: '📤 Send Quote Request to Vendors',
//           action: () => { setSelectedVendors([]); setShowVendorModal(true); },
//           color: COLORS.primary,
//         };
//       case 'quote_requested':
//         return {
//           label: `⏳ Waiting for Vendor Quotes (${r.invitedVendorIds?.length || 0} invited)`,
//           action: () => Alert.alert('Waiting', `Quote requests sent to ${r.invitedVendorIds?.length || 0} vendor(s). They will submit quotes shortly.`),
//           color: theme.primary,
//         };
//       case 'assigned':
//         // Legacy seed data — vendor was assigned directly; waiting for quote
//         return {
//           label: '⏳ Waiting for Vendor Quote…',
//           action: () => Alert.alert('Waiting', `${r.assignedVendorName || 'Vendor'} has been notified. They will submit a quote shortly.`),
//           color: theme.textMuted,
//         };
//       case 'quoted':
//         return {
//           label: '📨 Forward Quote to Resident',
//           action: () => {
//             adminApproveQuote(r.id);
//             Alert.alert('✅ Done', `Quote of ₹${r.quote?.amount?.toLocaleString()} forwarded to ${r.residentName}. They will be notified.`);
//           },
//           color: COLORS.success,
//         };
//       case 'quote_sent_to_resident':
//         return {
//           label: '⏳ Waiting for Resident Decision…',
//           action: () => Alert.alert('Waiting', `Quote of ₹${r.quote?.amount?.toLocaleString()} has been sent to ${r.residentName}. Waiting for their accept/reject.`),
//           color: theme.textMuted,
//         };
//       case 'quote_rejected':
//         return {
//           label: '🔄 Re-request Quote from Vendors',
//           action: () => { setSelectedVendors([]); setShowVendorModal(true); },
//           color: COLORS.warning,
//         };
//       case 'quote_accepted':
//         return {
//           label: '🚀 Confirm Work Start',
//           action: () => {
//             adminConfirmWorkStart(r.id);
//             Alert.alert('✅ Done', 'Vendor notified with gate OTP. Resident will be informed.');
//           },
//           color: COLORS.primary,
//         };
//       case 'approved_to_start':
//         return {
//           label: '⏳ Vendor Heading to Gate…',
//           action: () => Alert.alert('Info', `Vendor ${r.assignedVendorName || ''} has been given a gate OTP and is on the way. Guard will validate entry.`),
//           color: theme.textMuted,
//         };
//       case 'work_in_progress':
//         // If vendor submitted a stage for approval — show approve button
//         if (r.pendingStepApproval) {
//           const WORK_STAGES = [
//             'Work Initiated', 'Site Visit Done', 'Material Planning', 'Material Approved',
//             'Material Procured', 'Work in Progress', 'Quality Check', 'Testing',
//             'Snag / Issue Fixing', 'Final Inspection', 'Handover to Resident', 'Work Completed',
//           ];
//           const stepNum = (r.pendingStep ?? r._workStep ?? 0);
//           const stageName = WORK_STAGES[stepNum] || `Stage ${stepNum + 1}`;
//           return {
//             label: `✅ Approve Stage ${stepNum + 1} — "${stageName}"`,
//             action: () => {
//               approveWorkStep(r.id, 'Admin');
//               Alert.alert('✅ Approved!', `Stage ${stepNum + 1} approved. Vendor will be notified to continue.`);
//             },
//             color: COLORS.success,
//           };
//         }
//         return {
//           label: `🔧 Work In Progress (Stage ${r._workStep || 0}/12)`,
//           action: () => Alert.alert('In Progress', `${r.assignedVendorName || 'Vendor'} is working at Unit ${r.unit}. Stage ${r._workStep || 0}/12 complete.`),
//           color: COLORS.accent,
//         };
//       case 'work_completed':
//         return {
//           label: '✅ Work Completed — Waiting for Vendor Payment Request',
//           action: () => Alert.alert('Completed', 'Work is done. Waiting for vendor to request payment.'),
//           color: theme.textMuted,
//         };
//       case 'payment_requested_to_admin':
//         return {
//           label: '💰 Request Payment from Resident',
//           action: () => {
//             adminRequestPaymentFromResident(r.id);
//             Alert.alert('✅ Done', 'Payment request sent to resident.');
//           },
//           color: COLORS.warning,
//         };
//       case 'payment_requested_to_resident':
//         return {
//           label: '⏳ Waiting for Resident Payment…',
//           action: () => Alert.alert('Waiting', `Payment request of ₹${r.quote?.amount?.toLocaleString()} sent to ${r.residentName}.`),
//           color: theme.textMuted,
//         };
//       case 'payment_received':
//         return {
//           label: '💳 Pay Vendor',
//           action: () => {
//             adminPayVendor(r.id);
//             Alert.alert('✅ Done', 'Vendor has been paid. Job closed!');
//           },
//           color: COLORS.success,
//         };
//       case 'paid_to_vendor':
//         return {
//           label: '✔️ Job Closed — Fully Paid',
//           action: () => Alert.alert('Closed', 'This job is complete and the vendor has been paid.'),
//           color: COLORS.success,
//         };
//       default:
//         return null;
//     }
//   };

//   const actionBtn = getActionButton(req);

//   // ─── Vendor Send Quote Request ─────────────────────────────────────────────
//   const handleSendQuoteRequest = () => {
//     if (!selectedVendors.length) return;
//     adminSendQuoteRequest(req.id, selectedVendors);
//     setShowVendorModal(false);
//     setSelectedVendors([]);
//     Alert.alert(
//       '✅ Quote Request Sent!',
//       `Quote requests sent to ${selectedVendors.length} vendor(s): ${selectedVendors.map(v => v.name).join(', ')}.\n\nVendors will be notified to submit their quotes.`
//     );
//   };

//   return (
//     <SafeAreaView style={globalStyles.screen}>
//       <ScrollView contentContainerStyle={styles.scroll}>

//         {/* ── Header Card ─────────────────────────────────────────────── */}
//         <View style={[globalStyles.card, styles.headerCard]}>
//           <Text style={styles.reqId}>{req.id}</Text>
//           <Text style={styles.reqTitle}>{req.title}</Text>
//           <View style={styles.metaRow}>
//             <Text style={styles.metaChip}>🏠 {req.unit}</Text>
//             <Text style={styles.metaChip}>🔧 {req.category}</Text>
//             <Text style={[styles.metaChip, { color: req.priority === 'High' ? COLORS.danger : COLORS.text }]}>
//               ⚡ {req.priority}
//             </Text>
//           </View>
//           <View style={styles.statusRow}>
//             <Text style={styles.statusLabel}>Status:</Text>
//             <View style={[styles.statusBadge, { backgroundColor: COLORS[req.status] || COLORS.textMuted }]}>
//               <Text style={styles.statusBadgeText}>{STATUS_LABELS[req.status] || req.status}</Text>
//             </View>
//           </View>
//         </View>

//         {/* ── Description ─────────────────────────────────────────────── */}
//         <View style={[globalStyles.card]}>
//           <Text style={globalStyles.cardTitle}>Description</Text>
//           <Text style={styles.description}>{req.description}</Text>
//         </View>

//         {/* ── Resident Info ───────────────────────────────────────────── */}
//         <View style={[globalStyles.card, styles.infoCard]}>
//           <Text style={globalStyles.cardTitle}>Resident Info</Text>
//           <Text style={styles.infoText}>👤 {req.residentName || '—'}</Text>
//           <Text style={styles.infoText}>🏠 Unit {req.unit}</Text>
//         </View>

//         {/* ── Invited Vendors (quote_requested state) ──────────────────── */}
//         {req.invitedVendorIds?.length > 0 && (
//           <View style={[globalStyles.card]}>
//             <Text style={globalStyles.cardTitle}>📤 Vendors Invited for Quote</Text>
//             {req.invitedVendorIds.map(vid => {
//               const v = users.find(u => u.id === vid);
//               return (
//                 <View key={vid} style={styles.vendorInviteRow}>
//                   <Text style={styles.infoText}>🏪 {v?.name || vid}</Text>
//                   {v?.company && <Text style={styles.subText}>{v.company}</Text>}
//                 </View>
//               );
//             })}
//           </View>
//         )}

//         {/* ── Assigned Vendor (once vendor submits quote and locks in) ── */}
//         {req.assignedVendorName && (
//           <View style={[globalStyles.card]}>
//             <Text style={globalStyles.cardTitle}>🔨 Assigned Vendor</Text>
//             <Text style={styles.infoText}>👤 {req.assignedVendorName}</Text>
//           </View>
//         )}

//         {/* ── Quote ───────────────────────────────────────────────────── */}
//         {req.quote && (
//           <View style={[globalStyles.card]}>
//             <Text style={globalStyles.cardTitle}>Quote Details</Text>
//             <Text style={[styles.infoText, { fontSize: 20, fontWeight: '800', color: COLORS.success }]}>
//               ₹{req.quote.amount?.toLocaleString()}
//             </Text>
//             <Text style={styles.infoText}>📝 {req.quote.description}</Text>
//             <Text style={styles.infoText}>⏱ {req.quote.estimatedDays} day(s)</Text>
//           </View>
//         )}

//         {/* ── Gate OTP (approved_to_start) ─────────────────────────────── */}
//         {req.vendorGateOTP && req.status === 'approved_to_start' && (
//           <View style={[globalStyles.card, { borderColor: COLORS.primary, borderWidth: 2 }]}>
//             <Text style={globalStyles.cardTitle}>🔐 Vendor Gate OTP</Text>
//             <Text style={[styles.infoText, { fontSize: 26, fontWeight: '900', letterSpacing: 6, color: COLORS.primary }]}>
//               {req.vendorGateOTP}
//             </Text>
//             <Text style={styles.subText}>Vendor must show this OTP to the security guard to enter.</Text>
//           </View>
//         )}

//         {/* ── Timeline ────────────────────────────────────────────────── */}
//         <View style={[globalStyles.card]}>
//           <Text style={globalStyles.cardTitle}>Timeline</Text>
//           {(req.timeline || []).map((t, i) => (
//             <View key={i} style={styles.timelineItem}>
//               <View style={[styles.timelineDot, { backgroundColor: i === 0 ? COLORS.accent : COLORS.primary }]} />
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.timelineAction}>{t.action}</Text>
//                 <Text style={styles.timelineMeta}>{t.by} · {formatDate(t.at)}</Text>
//               </View>
//             </View>
//           ))}
//         </View>

//         {/* ── Action Button ────────────────────────────────────────────── */}
//         {actionBtn && (
//           <TouchableOpacity
//             style={[globalStyles.btn, { backgroundColor: actionBtn.color, marginBottom: 10 }]}
//             onPress={actionBtn.action}
//           >
//             <Text style={globalStyles.btnText}>{actionBtn.label}</Text>
//           </TouchableOpacity>
//         )}

//         <View style={{ height: 16 }} />
//       </ScrollView>

//       {/* ── Request Quote from Vendors Modal ─────────────────────────────── */}
//       <Modal visible={showVendorModal} animationType="slide" presentationStyle="pageSheet">
//         <SafeAreaView style={{ flex: 1, backgroundColor: '#F0FAFA' }}>
//           {/* Header */}
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>📤 Request Quotes From Vendors</Text>
//             <TouchableOpacity onPress={() => setShowVendorModal(false)}>
//               <Text style={{ fontSize: 24, color: COLORS.textMuted }}>✕</Text>
//             </TouchableOpacity>
//           </View>

//           <ScrollView contentContainerStyle={{ padding: 20 }}>
//             {/* Request summary banner */}
//             <View style={[globalStyles.card, { backgroundColor: theme.surface, borderColor: '#90CAF9' }]}>
//               <Text style={{ color: COLORS.info, fontWeight: '700', fontSize: 13 }}>📋 {req.title}</Text>
//               <Text style={[globalStyles.cardSub, { marginTop: 4 }]}>
//                 {req.category} • {req.priority} priority • Unit {req.unit}
//               </Text>
//             </View>

//             <Text style={[globalStyles.cardSub, { marginBottom: 12, fontWeight: '700', color: COLORS.text }]}>
//               Select vendors to request quotes from:
//             </Text>

//             {vendors.length === 0 && (
//               <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 16 }}>
//                 No vendors found in the system.
//               </Text>
//             )}

//             {vendors.map(v => {
//               const isSelected = selectedVendors.some(s => s.id === v.id);
//               return (
//                 <TouchableOpacity
//                   key={v.id}
//                   style={[
//                     globalStyles.card,
//                     { flexDirection: 'row', alignItems: 'center', gap: 14,
//                       borderColor: isSelected ? COLORS.primary : COLORS.border,
//                       borderWidth: isSelected ? 2 : 1 },
//                   ]}
//                   onPress={() =>
//                     setSelectedVendors(prev =>
//                       isSelected ? prev.filter(s => s.id !== v.id) : [...prev, { id: v.id, name: v.name }]
//                     )
//                   }
//                 >
//                   <View style={[styles.vendorAvatar, { backgroundColor: isSelected ? '#E8EAF6' : '#F3E5F5' }]}>
//                     <Text style={{ fontSize: 24 }}>🏪</Text>
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={globalStyles.cardTitle}>{v.name}</Text>
//                     {v.company && <Text style={globalStyles.cardSub}>{v.company}</Text>}
//                     {v.rating && <Text style={[globalStyles.cardSub, { color: theme.warning }]}>⭐ {v.rating}</Text>}
//                   </View>
//                   <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
//                     {isSelected && <Text style={{ color: theme.card, fontSize: 14, fontWeight: '900' }}>✓</Text>}
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}

//             {selectedVendors.length > 0 ? (
//               <TouchableOpacity
//                 style={[globalStyles.btn, { backgroundColor: COLORS.primary, marginTop: 8 }]}
//                 onPress={handleSendQuoteRequest}
//               >
//                 <Text style={globalStyles.btnText}>
//                   📨 Send Quote Request to {selectedVendors.length} Vendor{selectedVendors.length > 1 ? 's' : ''}
//                 </Text>
//               </TouchableOpacity>
//             ) : (
//               <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 8, fontSize: 13 }}>
//                 Tap vendors above to select them
//               </Text>
//             )}
//           </ScrollView>
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   scroll: { padding: 16 },
//   headerCard: { marginBottom: 12 },
//   reqId: { fontSize: 12, color: '#7A9E9E', fontWeight: '600', marginBottom: 6 },
//   reqTitle: { fontSize: 17, fontWeight: '800', color: '#1A2E2E', marginBottom: 10 },
//   metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
//   metaChip: { fontSize: 13, fontWeight: '600', color: '#3D6E6E', backgroundColor: '#F0FAFA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
//   statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   statusLabel: { fontSize: 14, fontWeight: '600', color: '#3D6E6E' },
//   statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
//   statusBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
//   description: { fontSize: 14, color: '#1A2E2E', lineHeight: 22 },
//   infoCard: { marginBottom: 12 },
//   infoText: { fontSize: 14, color: '#1A2E2E', marginBottom: 6 },
//   subText: { fontSize: 12, color: '#7A9E9E', marginBottom: 4 },
//   vendorInviteRow: { marginBottom: 6, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#D0EEEE' },
//   timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
//   timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
//   timelineAction: { fontSize: 13, fontWeight: '700', color: '#1A2E2E' },
//   timelineMeta: { fontSize: 11, color: '#7A9E9E', marginTop: 2 },
//   // Modal
//   modalHeader: {
//     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
//     padding: 20, paddingTop: 40, backgroundColor: '#1A7A7A',
//   },
//   modalTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', flex: 1, marginRight: 16 },
//   vendorAvatar: {
//     width: 50, height: 50, borderRadius: 14, backgroundColor: '#E8F5F5',
//     alignItems: 'center', justifyContent: 'center',
//   },
//   checkbox: {
//     width: 26, height: 26, borderRadius: 8, borderWidth: 2,
//     borderColor: '#D0EEEE', alignItems: 'center', justifyContent: 'center',
//   },
//   checkboxSelected: {
//     backgroundColor: '#1A7A7A', borderColor: '#1A7A7A',
//   },
// });


















/**
 * MaintenanceDetailScreen.js — Admin
 *
 * SECURITY FIX (merged):
 *  - appStore replaced with maintenanceStore
 *  - Vendor list fetched from backend via /admin/users or auth/users
 *  - adminId never sent — backend reads from JWT via CurrentUser.get()
 *  - Token from useAuthStore(s => s.token)
 *  - All admin actions via maintenanceStore
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import useMaintenanceStore from '../../../store/maintenanceStore';
import StatusBadge from '../../../components/common/StatusBadge';
import { STATUS_LABELS } from '../../../constants/maintenanceStatus';
import { apiUrl } from '../../../services/apiClient';

const C = {
  primary: '#1A7A7A', bg: '#E8F5F5', card: '#FFF',
  border: '#D0EEEE', text: '#1A2E2E', muted: '#7A9E9E',
  success: '#15803D', successBg: '#DCFCE7',
  warn: '#D97706', warnBg: '#FEF3C7',
  danger: '#DC2626', dangerBg: '#FEE2E2',
};

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function InfoRow({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0FAFA' }}>
      <Text style={{ fontSize: 13, color: C.muted }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.text, textAlign: 'right', flex: 1, marginLeft: 12 }}>{value || '—'}</Text>
    </View>
  );
}

export default function MaintenanceDetailScreen({ route, navigation }) {
  const { requestId } = route.params;
  const token = useAuthStore(s => s.token);

  const requests = useMaintenanceStore(s => s.requests);
  const loading = useMaintenanceStore(s => s.loading);
  const adminAssignVendor = useMaintenanceStore(s => s.adminAssignVendor);
  const adminForwardQuote = useMaintenanceStore(s => s.adminForwardQuote);
  const adminConfirmWorkStart = useMaintenanceStore(s => s.adminConfirmWorkStart);
  const adminRequestPaymentFromResident = useMaintenanceStore(s => s.adminRequestPaymentFromResident);
  const adminPayVendor = useMaintenanceStore(s => s.adminPayVendor);
  const adminCloseRequest = useMaintenanceStore(s => s.adminCloseRequest);
  const adminFetchAll = useMaintenanceStore(s => s.adminFetchAll);

  const [vendors, setVendors] = useState([]);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const req = requests.find(r => String(r.id) === String(requestId));

  // Fetch vendors from backend
  useEffect(() => {
    fetch(apiUrl('/admin/users?role=vendor'), {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setVendors(Array.isArray(data) ? data.filter(u => u.role === 'vendor') : []))
      .catch(() => setVendors([]));
  }, [token]);

  if (!req) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <View style={s.hdr}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backT}>← Back</Text></TouchableOpacity>
          <Text style={s.hdrTitle}>Request Details</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.muted }}>Request not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Action button logic ──────────────────────────────────────────────────
  const doAction = async (label, fn, successMsg) => {
    setActionLoading(true);
    try {
      const result = await fn();
      if (result.ok) {
        Alert.alert('✅ Done', successMsg);
        await adminFetchAll(token);
      } else {
        Alert.alert('Error', result.data?.message || 'Action failed. Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Something went wrong.');
    } finally {
      setActionLoading(false);
    }
  };

  const getActionButton = () => {
    switch (req.status) {
      case 'submitted':
      case 'quote_rejected':
        return {
          label: '📤 Send Quote Request to Vendors',
          color: C.primary,
          onPress: () => { setSelectedVendors([]); setShowVendorModal(true); },
        };
      case 'quote_requested':
      case 'assigned':
        return {
          label: `⏳ Waiting for Vendor Quotes (${req.invitedVendorIds?.length || 1} invited)`,
          color: C.muted,
          onPress: () => Alert.alert('Waiting', 'Quote requests sent. Vendors will submit quotes shortly.'),
        };
      case 'quoted':
        return {
          label: '📨 Forward Quote to Resident',
          color: C.success,
          onPress: () => doAction(
            'Forward Quote',
            () => adminForwardQuote(token, req.id),
            `Quote of ₹${req.quote?.amount?.toLocaleString()} forwarded to ${req.residentName}.`
          ),
        };
      case 'quote_sent_to_resident':
        return {
          label: '⏳ Waiting for Resident Decision…',
          color: C.muted,
          onPress: () => Alert.alert('Waiting', `Quote sent to ${req.residentName}. Waiting for accept/reject.`),
        };
      case 'quote_accepted':
        return {
          label: '🚀 Confirm Work Start (Generate Gate OTP)',
          color: C.primary,
          onPress: () => doAction(
            'Confirm Work Start',
            () => adminConfirmWorkStart(token, req.id),
            'Vendor notified with gate OTP. Resident will be informed.'
          ),
        };
      case 'approved_to_start':
        return {
          label: '⏳ Vendor Heading to Gate…',
          color: C.muted,
          onPress: () => Alert.alert('Info', `Vendor ${req.vendorName || ''} has been given a gate OTP.`),
        };
      case 'work_in_progress':
        return {
          label: '🔧 Work In Progress — Monitor',
          color: C.warn,
          onPress: () => Alert.alert('In Progress', `${req.vendorName || 'Vendor'} is working at Unit ${req.unit}.`),
        };
      case 'work_completed':
        return {
          label: '⏳ Waiting for Resident to Approve Work…',
          color: C.muted,
          onPress: () => Alert.alert('Waiting', 'Resident must approve completed work before vendor payment request.'),
        };
      case 'resident_work_approved':
        return {
          label: 'Waiting for Vendor Payment Request...',
          color: C.muted,
          onPress: () => Alert.alert('Waiting', 'Resident approved the work. Vendor must request payment before admin can forward it.'),
        };
      case 'payment_requested_to_admin':
        return {
          label: '💰 Request Payment from Resident',
          color: C.warn,
          onPress: () => doAction(
            'Request Payment',
            () => adminRequestPaymentFromResident(token, req.id),
            'Payment request sent to resident.'
          ),
        };
      case 'payment_requested_to_resident':
        return {
          label: '⏳ Waiting for Resident Payment…',
          color: C.muted,
          onPress: () => Alert.alert('Waiting', `Payment request sent to ${req.residentName}.`),
        };
      case 'payment_received':
        return {
          label: '💳 Pay Vendor — Close Job',
          color: C.success,
          onPress: () => doAction(
            'Pay Vendor',
            () => adminPayVendor(token, req.id),
            'Vendor has been paid. Job closed!'
          ),
        };
      case 'paid_to_vendor':
      case 'closed':
        return {
          label: '✔️ Job Closed — Fully Paid',
          color: C.success,
          onPress: () => Alert.alert('Closed', 'This job is complete and the vendor has been paid.'),
        };
      default:
        return null;
    }
  };

  const actionBtn = getActionButton();

  const handleSendQuoteRequest = async () => {
    if (!selectedVendors.length) return;
    setActionLoading(true);
    const result = await adminAssignVendor(token, req.id, selectedVendors);
    setActionLoading(false);
    setShowVendorModal(false);
    setSelectedVendors([]);
    if (result.ok) {
      Alert.alert(
        '✅ Quote Request Sent!',
        `Quote requests sent to ${selectedVendors.length} vendor(s): ${selectedVendors.map(v => v.name).join(', ')}.`
      );
      await adminFetchAll(token);
    } else {
      Alert.alert('Error', result.data?.message || 'Could not send quote request.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={s.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backT}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.hdrTitle}>Request Detail</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* Header card */}
        <View style={s.card}>
          <Text style={{ fontSize: 12, color: C.muted, fontWeight: '600', marginBottom: 4 }}>{req.id}</Text>
          <Text style={{ fontSize: 17, fontWeight: '800', color: C.text, marginBottom: 10 }}>{req.title}</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {req.unit && <Text style={s.metaChip}>🏠 {req.unit}</Text>}
            {req.category && <Text style={s.metaChip}>🔧 {req.category}</Text>}
            {req.priority && <Text style={s.metaChip}>⚡ {req.priority}</Text>}
          </View>
          <StatusBadge status={req.status} />
        </View>

        {/* Description */}
        <View style={s.card}>
          <Text style={s.secLabel}>DESCRIPTION</Text>
          <Text style={{ fontSize: 14, color: C.text, lineHeight: 22 }}>{req.description}</Text>
        </View>

        {/* Resident info */}
        <View style={s.card}>
          <Text style={s.secLabel}>RESIDENT</Text>
          <InfoRow label="Name" value={req.residentName} />
          {req.unit && <InfoRow label="Unit" value={req.unit} />}
          {req.contactPref && <InfoRow label="Contact via" value={req.contactPref} />}
          {req.preferredSlot && <InfoRow label="Preferred Slot" value={req.preferredSlot} />}
        </View>

        {/* Invited vendors */}
        {req.invitedVendorIds?.length > 0 && (
          <View style={s.card}>
            <Text style={s.secLabel}>📤 VENDORS INVITED FOR QUOTE</Text>
            {req.invitedVendorIds.map((vid, i) => (
              <View key={vid} style={{ paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F0FAFA' }}>
                <Text style={{ fontSize: 13, color: C.text }}>🏪 Vendor #{vid}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Assigned vendor */}
        {req.vendorName && (
          <View style={s.card}>
            <Text style={s.secLabel}>🔨 ASSIGNED VENDOR</Text>
            <InfoRow label="Vendor" value={req.vendorName} />
          </View>
        )}

        {/* Quote */}
        {req.quote && (
          <View style={s.card}>
            <Text style={s.secLabel}>QUOTE DETAILS</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.success, marginBottom: 8 }}>
              ₹{req.quote.amount?.toLocaleString()}
            </Text>
            {req.quote.description && <InfoRow label="Description" value={req.quote.description} />}
            {req.quote.estimatedDays && <InfoRow label="Est. Days" value={`${req.quote.estimatedDays} day(s)`} />}
          </View>
        )}

        {/* Gate OTP */}
        {req.vendorGateOTP && req.status === 'approved_to_start' && (
          <View style={[s.card, { borderColor: C.primary, borderWidth: 2 }]}>
            <Text style={s.secLabel}>🔐 VENDOR GATE OTP</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: C.primary, letterSpacing: 6, marginVertical: 6 }}>
              {req.vendorGateOTP}
            </Text>
            <Text style={{ fontSize: 12, color: C.muted }}>Vendor must show this OTP to security guard to enter.</Text>
          </View>
        )}

        {/* Timeline */}
        {req.timeline?.length > 0 && (
          <View style={s.card}>
            <Text style={s.secLabel}>TIMELINE</Text>
            {[...req.timeline].reverse().map((t, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 4, backgroundColor: i === 0 ? C.primary : C.muted }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>{t.action}</Text>
                  <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{t.by} · {fmtDate(t.at)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action button */}
        {actionBtn && (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: actionBtn.color }, actionLoading && { opacity: 0.6 }]}
            onPress={actionBtn.onPress}
            disabled={actionLoading}
          >
            {actionLoading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={s.actionBtnT}>{actionBtn.label}</Text>
            }
          </TouchableOpacity>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Vendor selector modal */}
      <Modal visible={showVendorModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
          <View style={[s.hdr, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <Text style={s.hdrTitle}>📤 Request Quotes From Vendors</Text>
            <TouchableOpacity onPress={() => setShowVendorModal(false)}>
              <Text style={{ fontSize: 22, color: 'rgba(255,255,255,0.8)' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={[s.card, { backgroundColor: '#E8F5F5', borderColor: '#90CAF9' }]}>
              <Text style={{ color: C.primary, fontWeight: '700', fontSize: 13 }}>📋 {req.title}</Text>
              <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
                {req.category} · {req.priority} priority · Unit {req.unit}
              </Text>
            </View>

            <Text style={{ color: C.text, fontWeight: '700', fontSize: 13, marginBottom: 12 }}>
              Select vendors to request quotes from:
            </Text>

            {vendors.length === 0 && (
              <Text style={{ textAlign: 'center', color: C.muted, marginTop: 16 }}>
                No vendors found. Add vendors in the system first.
              </Text>
            )}

            {vendors.map(v => {
              const isSelected = selectedVendors.some(sv => sv.id === v.id);
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 14, borderColor: isSelected ? C.primary : C.border, borderWidth: isSelected ? 2 : 1 }]}
                  onPress={() =>
                    setSelectedVendors(prev =>
                      isSelected ? prev.filter(sv => sv.id !== v.id) : [...prev, { id: v.id, name: v.name }]
                    )
                  }
                >
                  <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 24 }}>🏪</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>{v.name}</Text>
                    {v.businessName && <Text style={{ fontSize: 12, color: C.muted }}>{v.businessName}</Text>}
                  </View>
                  <View style={[s.checkbox, isSelected && s.checkboxA]}>
                    {isSelected && <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '900' }}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}

            {selectedVendors.length > 0 ? (
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: C.primary }, actionLoading && { opacity: 0.6 }]}
                onPress={handleSendQuoteRequest}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={s.actionBtnT}>
                    📨 Send Quote Request to {selectedVendors.length} Vendor{selectedVendors.length > 1 ? 's' : ''}
                  </Text>
                }
              </TouchableOpacity>
            ) : (
              <Text style={{ textAlign: 'center', color: C.muted, marginTop: 8, fontSize: 13 }}>
                Tap vendors above to select them
              </Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hdr: { backgroundColor: C.primary, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backT: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 8 },
  hdrTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  secLabel: { fontSize: 10, fontWeight: '800', color: C.muted, letterSpacing: 1, marginBottom: 10 },
  metaChip: { fontSize: 13, fontWeight: '600', color: '#3D6E6E', backgroundColor: '#F0FAFA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  actionBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  actionBtnT: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  checkboxA: { backgroundColor: C.primary, borderColor: C.primary },
});
