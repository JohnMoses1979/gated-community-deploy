// /**
//  * GuestParkingScreen.js
//  * Resident requests a guest parking slot; admin assigns the slot number after approval.
//  * Theme: matches Visitor screens — #1A7A7A teal header, white cards, teal accents, light teal bg
//  *
//  * Workflow:
//  *  1. Resident fills form (guest name, phone, vehicle number, vehicle type, expected date, duration)
//  *  2. Request saved with status PENDING
//  *  3. Admin reviews → assigns slot number → status → APPROVED
//  *  4. Resident notified → sees slot number → can share with guest
//  *  5. Guard marks entry → ACTIVE; on exit → EXPIRED
//  *  6. If guest stays beyond allowed time → OVERSTAY
//  */

// import React, { useState } from 'react';
// import {
//   View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
//   ScrollView, TextInput, Alert, Modal,
// } from 'react-native';
// import { useAuthStore }     from '../../../store/AuthStore';
// import { useSecurityStore } from '../../../store/securityStore';
// import { COLORS, globalStyles } from '../../../components/common/theme';
// import { useTheme } from '../../../hooks/useTheme';

// // ─── Constants ────────────────────────────────────────────────────────────────
// const VEHICLE_TYPES = [
//   { key: 'Car',   icon: '🚗' },
//   { key: 'Bike',  icon: '🏍️' },
//   { key: 'Auto',  icon: '🛺' },
//   { key: 'Truck', icon: '🚛' },
// ];

// const DURATION_OPTIONS = ['1', '2', '3', '7'];

// const STATUS_META = {
//   PENDING:  { label: 'Pending Approval', color: '#E65100', bg: '#FEF3C7', icon: '🕒' },
//   APPROVED: { label: 'Approved',         color: '#1A7A7A', bg: '#CCFBF1', icon: '✅' },
//   ACTIVE:   { label: 'Active',           color: '#1A7A7A', bg: '#DBEAFE', icon: '🚗' },
//   EXPIRED:  { label: 'Expired',          color: '#64748B', bg: '#F1F5F9', icon: '🚪' },
//   OVERSTAY: { label: 'Overstay!',        color: '#C62828', bg: '#FEE2E2', icon: '⚠️' },
// };

// const FILTERS = [
//   { k: 'all',      label: 'All' },
//   { k: 'PENDING',  label: '🕒 Pending' },
//   { k: 'APPROVED', label: '✅ Approved' },
//   { k: 'ACTIVE',   label: '🚗 Active' },
//   { k: 'EXPIRED',  label: '🚪 Expired' },
// ];

// function fmt(iso) {
//   if (!iso) return '—';
//   return new Date(iso).toLocaleString('en-IN', {
//     day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
//   });
// }

// // ─── Share Modal (same style as visitor screens) ──────────────────────────────
// function ShareModal({ visible, onClose, title, message }) {
//   const [shared, setShared] = useState(false);
//   const CHANNELS = [
//     { icon: '💬', label: 'WhatsApp' },
//     { icon: '📱', label: 'SMS' },
//     { icon: '📧', label: 'Email' },
//     { icon: '📋', label: 'Copy' },
//   ];
//   const handleShare = (channel) => {
//     setShared(true);
//     setTimeout(() => {
//       setShared(false);
//       onClose();
//       Alert.alert('✅ Shared!', `Details sent via ${channel}.`);
//     }, 800);
//   };
//   return (
//     <Modal visible={visible} transparent animationType="slide">
//       <View style={shareStyles.overlay}>
//         <View style={shareStyles.sheet}>
//           <View style={shareStyles.handle} />
//           <Text style={shareStyles.title}>{title}</Text>
//           <View style={shareStyles.messageBubble}>
//             <Text style={shareStyles.messageText}>{message}</Text>
//           </View>
//           {shared ? (
//             <View style={shareStyles.sentRow}>
//               <Text style={shareStyles.sentText}>✅ Sending...</Text>
//             </View>
//           ) : (
//             <>
//               <Text style={shareStyles.channelLabel}>Send via</Text>
//               <View style={shareStyles.channelRow}>
//                 {CHANNELS.map(c => (
//                   <TouchableOpacity
//                     key={c.label}
//                     style={shareStyles.channelBtn}
//                     onPress={() => handleShare(c.label)}
//                   >
//                     <Text style={shareStyles.channelIcon}>{c.icon}</Text>
//                     <Text style={shareStyles.channelText}>{c.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </>
//           )}
//           <TouchableOpacity style={shareStyles.cancelBtn} onPress={onClose}>
//             <Text style={shareStyles.cancelText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const shareStyles = StyleSheet.create({
//   overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
//   sheet:        { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
//   handle:       { width: 40, height: 4, backgroundColor: '#D0EEEE', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
//   title:        { fontSize: 16, fontWeight: '800', color: '#1A2E2E', marginBottom: 12 },
//   messageBubble:{ backgroundColor: '#E8F5F5', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#D0EEEE', marginBottom: 16 },
//   messageText:  { fontSize: 13, color: '#3D6E6E', lineHeight: 20, fontFamily: 'monospace' },
//   channelLabel: { fontSize: 11, fontWeight: '700', color: '#7A9E9E', marginBottom: 10 },
//   channelRow:   { flexDirection: 'row', marginBottom: 16 },
//   channelBtn:   { flex: 1, alignItems: 'center', backgroundColor: '#F0FAFA', borderRadius: 14, paddingVertical: 12, marginHorizontal: 4 },
//   channelIcon:  { fontSize: 24 },
//   channelText:  { fontSize: 11, fontWeight: '700', color: '#7A9E9E', marginTop: 4 },
//   sentRow:      { alignItems: 'center', paddingVertical: 20 },
//   sentText:     { fontSize: 16, fontWeight: '800', color: '#1A7A7A' },
//   cancelBtn:    { paddingVertical: 14, alignItems: 'center' },
//   cancelText:   { fontSize: 14, fontWeight: '700', color: '#64748B' },
// });

// // ─── Main Screen ──────────────────────────────────────────────────────────────
// export default function GuestParkingScreen({ navigation }) {
//   const theme               = useTheme();
//   const user                = useAuthStore(s => s.user);
//   const guestParking        = useSecurityStore(s => s.guestParking);
//   const requestGuestParking = useSecurityStore(s => s.requestGuestParking);

//   const myId       = user?.id || 'res1';
//   const myRequests = (guestParking || [])
//     .filter(p => p.residentId === myId)
//     .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

//   const [showForm, setShowForm]         = useState(false);
//   const [shareParking, setShareParking] = useState(null);
//   const [filter, setFilter]             = useState('all');
//   const [form, setForm] = useState({
//     guestName: '', guestPhone: '', vehicleNumber: '',
//     vehicleType: 'Car', expectedDate: '', duration: '1',
//   });

//   const filtered = filter === 'all'
//     ? myRequests
//     : myRequests.filter(p => p.status === filter);

//   const activeCount  = myRequests.filter(p => p.status === 'ACTIVE').length;
//   const pendingCount = myRequests.filter(p => p.status === 'PENDING').length;

//   const shareText = (p) =>
//     `🏠 BS Gated Community — Guest Parking\n\n` +
//     `Guest: ${p.guestName}\n` +
//     `Vehicle: ${p.vehicleNumber} (${p.vehicleType})\n` +
//     `Parking Slot: P-${p.slotNumber}\n` +
//     `Host Unit: ${p.unit}\n` +
//     (p.guestPhone ? `Phone: ${p.guestPhone}\n` : '') +
//     (p.startTime  ? `Valid from: ${fmt(p.startTime)}\n` : '') +
//     (p.endTime    ? `Expires: ${fmt(p.endTime)}\n` : '') +
//     `\nPlease show this slot number at the main gate.`;

//   const handleRequest = () => {
//     if (!form.guestName.trim())     { Alert.alert('Required', 'Please enter guest name'); return; }
//     if (!form.vehicleNumber.trim()) { Alert.alert('Required', 'Please enter vehicle number'); return; }
//     requestGuestParking({
//       residentId:   myId,
//       residentName: user?.name || 'Resident',
//       unit:         user?.unit || 'A-101',
//       ...form,
//     });
//     setForm({ guestName: '', guestPhone: '', vehicleNumber: '', vehicleType: 'Car', expectedDate: '', duration: '1' });
//     setShowForm(false);
//     Alert.alert(
//       '✅ Request Submitted',
//       'Admin will review and assign a parking slot. You will be notified once approved.'
//     );
//   };

//   return (
//     <SafeAreaView style={globalStyles.screen}>
//       <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

//       {/* ── Header ── */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//         <View style={styles.headerRow}>
//           <View>
//             <Text style={styles.headerTitle}>🅿️ Guest Parking</Text>
//             <Text style={styles.headerSub}>
//               {activeCount > 0
//                 ? `${activeCount} active · ${pendingCount} pending`
//                 : `${myRequests.length} total request${myRequests.length !== 1 ? 's' : ''}`}
//             </Text>
//           </View>
//           <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
//             <Text style={styles.addBtnText}>+ Request</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* ── Filter chips ── */}
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         style={styles.filterRow}
//         contentContainerStyle={{ paddingHorizontal: 12 }}
//       >
//         {FILTERS.map(f => (
//           <TouchableOpacity
//             key={f.k}
//             style={[styles.chip, filter === f.k && styles.chipActive]}
//             onPress={() => setFilter(f.k)}
//           >
//             <Text style={[styles.chipText, filter === f.k && styles.chipTextActive]}>
//               {f.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* ── List ── */}
//       <ScrollView
//         contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Info banner when empty */}
//         {myRequests.length === 0 && (
//           <View style={styles.infoBanner}>
//             <Text style={styles.infoText}>
//               ℹ️  Request a parking slot for your guest. Admin reviews and assigns a slot number.
//               Share the slot number with your guest — they present it at the gate.
//             </Text>
//           </View>
//         )}

//         {filtered.length === 0 ? (
//           <View style={globalStyles.emptyState}>
//             <Text style={{ fontSize: 52 }}>🅿️</Text>
//             <Text style={globalStyles.emptyText}>
//               {filter === 'all' ? 'No parking requests yet' : `No ${filter.toLowerCase()} requests`}
//             </Text>
//             {filter === 'all' && (
//               <TouchableOpacity
//                 style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 16 }]}
//                 onPress={() => setShowForm(true)}
//               >
//                 <Text style={globalStyles.btnText}>Request Guest Parking</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         ) : (
//           filtered.map(p => {
//             const meta = STATUS_META[p.status] || STATUS_META.PENDING;
//             const isShareable = ['APPROVED', 'ACTIVE'].includes(p.status) && p.slotNumber;
//             return (
//               <TouchableOpacity
//                 key={p.id}
//                 style={[
//                   globalStyles.card,
//                   { borderLeftWidth: 4, borderLeftColor: meta.color, padding: 0, overflow: 'hidden' },
//                   p.status === 'OVERSTAY' && { borderColor: '#C62828', borderWidth: 2 },
//                 ]}
//                 onPress={() => navigation.navigate('ParkingSlotPass', { parkingId: p.id })}
//                 activeOpacity={0.92}
//               >
//                 {/* Top row */}
//                 <View style={styles.cardTop}>
//                   <View style={styles.cardAvatar}>
//                     <Text style={{ fontSize: 24 }}>{meta.icon}</Text>
//                   </View>
//                   <View style={{ flex: 1, marginLeft: 12 }}>
//                     <Text style={styles.cardName}>{p.guestName}</Text>
//                     <Text style={styles.cardVehicle}>
//                       {VEHICLE_TYPES.find(v => v.key === p.vehicleType)?.icon || '🚗'}{' '}
//                       {p.vehicleNumber} · {p.vehicleType}
//                     </Text>
//                   </View>
//                   <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
//                     <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
//                   </View>
//                 </View>

//                 {/* Slot assignment banner */}
//                 {p.slotNumber ? (
//                   <View style={styles.slotBanner}>
//                     <Text style={styles.slotLabel}>ASSIGNED SLOT</Text>
//                     <Text style={styles.slotNumber}>P-{p.slotNumber}</Text>
//                   </View>
//                 ) : p.status === 'PENDING' ? (
//                   <View style={[styles.slotBanner, { backgroundColor: '#FFFBEB', borderTopColor: '#FDE68A' }]}>
//                     <Text style={[styles.slotLabel, { color: '#92400E' }]}>SLOT</Text>
//                     <Text style={[styles.slotNumber, { color: '#B45309', fontSize: 14 }]}>
//                       Awaiting Admin Assignment
//                     </Text>
//                   </View>
//                 ) : null}

//                 {/* Details */}
//                 <View style={styles.cardMeta}>
//                   {p.guestPhone ? <Text style={styles.cardMetaText}>📱 {p.guestPhone}</Text> : null}
//                   <Text style={styles.cardMetaText}>📅 Requested: {fmt(p.requestedAt)}</Text>
//                   {p.duration ? <Text style={styles.cardMetaText}>⏱ Duration: {p.duration} day(s)</Text> : null}
//                   {p.startTime && <Text style={styles.cardMetaText}>🟢 Active from: {fmt(p.startTime)}</Text>}
//                   {p.endTime   && <Text style={styles.cardMetaText}>🔴 Expires: {fmt(p.endTime)}</Text>}
//                   <Text style={styles.cardMetaText}>🏠 Unit: {p.unit}</Text>
//                 </View>

//                 {/* Share button — only when slot is assigned */}
//                 {isShareable && (
//                   <TouchableOpacity
//                     style={styles.shareBtn}
//                     onPress={(e) => { e.stopPropagation(); setShareParking(p); }}
//                     activeOpacity={0.85}
//                   >
//                     <Text style={styles.shareBtnText}>📤 Share Parking Details with Guest</Text>
//                   </TouchableOpacity>
//                 )}
//               </TouchableOpacity>
//             );
//           })
//         )}
//       </ScrollView>

//       {/* ── Share Modal ── */}
//       {shareParking && (
//         <ShareModal
//           visible={!!shareParking}
//           onClose={() => setShareParking(null)}
//           title="📤 Share Parking Details"
//           message={shareText(shareParking)}
//         />
//       )}

//       {/* ── Request Form Modal ── */}
//       <Modal visible={showForm} transparent animationType="slide">
//         <View style={formStyles.overlay}>
//           <View style={formStyles.sheet}>
//             <View style={formStyles.handle} />
//             <View style={formStyles.sheetHeader}>
//               <Text style={formStyles.sheetTitle}>Request Guest Parking</Text>
//               <TouchableOpacity onPress={() => setShowForm(false)} style={formStyles.closeBtn}>
//                 <Text style={formStyles.closeBtnText}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <ScrollView showsVerticalScrollIndicator={false}>
//               <View style={styles.infoBanner}>
//                 <Text style={styles.infoText}>
//                   Admin will assign a slot after approval. You'll be notified to share the slot number with your guest.
//                 </Text>
//               </View>

//               <Text style={formStyles.label}>Guest Name *</Text>
//               <TextInput
//                 style={formStyles.input}
//                 placeholder="Full name of your guest"
//                 placeholderTextColor="#7A9E9E"
//                 value={form.guestName}
//                 onChangeText={v => setForm(f => ({ ...f, guestName: v }))}
//               />

//               <Text style={formStyles.label}>Guest Phone (optional)</Text>
//               <TextInput
//                 style={formStyles.input}
//                 placeholder="Mobile number"
//                 placeholderTextColor="#7A9E9E"
//                 value={form.guestPhone}
//                 onChangeText={v => setForm(f => ({ ...f, guestPhone: v }))}
//                 keyboardType="phone-pad"
//               />

//               <Text style={formStyles.label}>Vehicle Number *</Text>
//               <TextInput
//                 style={formStyles.input}
//                 placeholder="e.g. TS09AB1234"
//                 placeholderTextColor="#7A9E9E"
//                 value={form.vehicleNumber}
//                 onChangeText={v => setForm(f => ({ ...f, vehicleNumber: v.toUpperCase() }))}
//                 autoCapitalize="characters"
//               />

//               <Text style={formStyles.label}>Vehicle Type</Text>
//               <View style={formStyles.typeGrid}>
//                 {VEHICLE_TYPES.map(t => (
//                   <TouchableOpacity
//                     key={t.key}
//                     style={[formStyles.typeChip, form.vehicleType === t.key && formStyles.typeChipActive]}
//                     onPress={() => setForm(f => ({ ...f, vehicleType: t.key }))}
//                   >
//                     <Text style={formStyles.typeChipIcon}>{t.icon}</Text>
//                     <Text style={[
//                       formStyles.typeChipText,
//                       form.vehicleType === t.key && formStyles.typeChipTextActive,
//                     ]}>
//                       {t.key}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <Text style={formStyles.label}>Expected Date (optional)</Text>
//               <TextInput
//                 style={formStyles.input}
//                 placeholder="e.g. 15 Jan 2025"
//                 placeholderTextColor="#7A9E9E"
//                 value={form.expectedDate}
//                 onChangeText={v => setForm(f => ({ ...f, expectedDate: v }))}
//               />

//               <Text style={formStyles.label}>Duration (days)</Text>
//               <View style={formStyles.durationRow}>
//                 {DURATION_OPTIONS.map(d => (
//                   <TouchableOpacity
//                     key={d}
//                     style={[formStyles.durationChip, form.duration === d && formStyles.durationChipActive]}
//                     onPress={() => setForm(f => ({ ...f, duration: d }))}
//                   >
//                     <Text style={[
//                       formStyles.durationText,
//                       form.duration === d && formStyles.durationTextActive,
//                     ]}>
//                       {d}d
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <TouchableOpacity
//                 style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 8 }]}
//                 onPress={handleRequest}
//                 activeOpacity={0.85}
//               >
//                 <Text style={globalStyles.btnText}>🚗 Submit Parking Request</Text>
//               </TouchableOpacity>
//               <View style={{ height: 24 }} />
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   // Header
//   header: {
//     padding: 20,
//     paddingTop: 40,
//     backgroundColor: '#1A7A7A',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   backBtn:      { marginBottom: 8 },
//   backText:     { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
//   headerTitle:  { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
//   headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
//   addBtn: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   addBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

//   // Filter chips
//   filterRow: {
//     paddingVertical: 8,
//     backgroundColor: '#FFFFFF',
//     maxHeight: 48,
//     borderBottomWidth: 1,
//     borderBottomColor: '#D0EEEE',
//   },
//   chip: {
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderRadius: 20,
//     backgroundColor: '#F0FAFA',
//     borderWidth: 1,
//     borderColor: '#D0EEEE',
//     marginRight: 6,
//     height: 30,
//     justifyContent: 'center',
//   },
//   chipActive:     { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
//   chipText:       { fontSize: 12, fontWeight: '600', color: '#3D6E6E' },
//   chipTextActive: { color: '#FFFFFF' },

//   // Info banner
//   infoBanner: {
//     backgroundColor: '#E8F5F5',
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#D0EEEE',
//   },
//   infoText: { fontSize: 13, color: '#3D6E6E', lineHeight: 20 },

//   // Card
//   cardTop: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     padding: 14,
//     paddingBottom: 10,
//   },
//   cardAvatar: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     backgroundColor: '#E8F5F5',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: '#D0EEEE',
//   },
//   cardName:    { fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
//   cardVehicle: { fontSize: 13, color: '#7A9E9E', marginTop: 2 },
//   statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
//   statusBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

//   // Slot banner
//   slotBanner: {
//     backgroundColor: '#E8F5F5',
//     borderTopWidth: 1,
//     borderTopColor: '#D0EEEE',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//   },
//   slotLabel:  { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#7A9E9E' },
//   slotNumber: { fontSize: 22, fontWeight: '900', color: '#1A7A7A', letterSpacing: 2 },

//   // Card meta
//   cardMeta:     { paddingHorizontal: 14, paddingBottom: 12 },
//   cardMetaText: { fontSize: 12, color: '#7A9E9E', marginTop: 3 },

//   // Share button
//   shareBtn: {
//     backgroundColor: '#1A7A7A',
//     marginHorizontal: 14,
//     marginBottom: 14,
//     borderRadius: 10,
//     paddingVertical: 11,
//     alignItems: 'center',
//   },
//   shareBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
// });

// const formStyles = StyleSheet.create({
//   overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
//   sheet: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     paddingBottom: 8,
//     maxHeight: '92%',
//   },
//   handle:      { width: 40, height: 4, backgroundColor: '#D0EEEE', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
//   sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//   sheetTitle:  { fontSize: 18, fontWeight: '900', color: '#1A2E2E' },
//   closeBtn:    { padding: 4 },
//   closeBtnText:{ fontSize: 22, color: '#7A9E9E' },

//   label: { fontSize: 13, fontWeight: '700', color: '#3D6E6E', marginBottom: 6, marginTop: 4 },
//   input: {
//     backgroundColor: '#F0FAFA',
//     borderWidth: 1.5,
//     borderColor: '#D0EEEE',
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     fontSize: 15,
//     color: '#1A2E2E',
//     marginBottom: 12,
//   },

//   typeGrid:           { flexDirection: 'row', gap: 8, marginBottom: 12 },
//   typeChip:           { flex: 1, alignItems: 'center', backgroundColor: '#F0FAFA', borderRadius: 12, paddingVertical: 10, borderWidth: 1.5, borderColor: '#D0EEEE' },
//   typeChipActive:     { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
//   typeChipIcon:       { fontSize: 20, marginBottom: 3 },
//   typeChipText:       { fontSize: 12, fontWeight: '700', color: '#3D6E6E' },
//   typeChipTextActive: { color: '#FFFFFF' },

//   durationRow:           { flexDirection: 'row', gap: 8, marginBottom: 16 },
//   durationChip:          { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#F0FAFA', borderWidth: 1.5, borderColor: '#D0EEEE' },
//   durationChipActive:    { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
//   durationText:          { fontSize: 14, fontWeight: '800', color: '#3D6E6E' },
//   durationTextActive:    { color: '#FFFFFF' },
// });















/**
 * GuestParkingScreen.js — Resident
 *
 * Aligned to backend contract:
 *   POST /api/guest-parking       — create request (JWT identity)
 *   GET  /api/guest-parking/my    — own requests (JWT identity)
 *
 * Uses securityStore.createGuestParking() and securityStore.fetchGuestParking().
 * No residentId sent to backend — identity comes from JWT.
 */

import React, { useCallback, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TextInput, Alert, Modal, Linking, Platform,
  Clipboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { globalStyles } from '../../../components/common/theme';

// ─── Constants ────────────────────────────────────────────────────────────────
const VEHICLE_TYPES = [
  { key: 'Car', icon: '🚗' },
  { key: 'Bike', icon: '🏍️' },
  { key: 'Auto', icon: '🛺' },
  { key: 'Truck', icon: '🚛' },
];

const DURATION_OPTIONS = ['1', '2', '3', '7'];
const ALL_SLOTS = Array.from({ length: 15 }, (_, i) => `A${i + 1}`);

const STATUS_META = {
  PENDING: { label: 'Pending', color: '#E65100', bg: '#FEF3C7', icon: '🕒' },
  APPROVED: { label: 'Approved', color: '#1A7A7A', bg: '#CCFBF1', icon: '✅' },
  ACTIVE: { label: 'Active', color: '#1565C0', bg: '#DBEAFE', icon: '🚗' },
  EXITED: { label: 'Exited', color: '#64748B', bg: '#F1F5F9', icon: '🚪' },
  EXPIRED: { label: 'Expired', color: '#64748B', bg: '#F1F5F9', icon: '🚪' },
  OVERSTAY: { label: 'Overstay', color: '#C62828', bg: '#FEE2E2', icon: '⚠️' },
  REJECTED: { label: 'Rejected', color: '#C62828', bg: '#FEE2E2', icon: '✕' },
};

const FILTERS = [
  { k: 'all', label: 'All' },
  { k: 'PENDING', label: '🕒 Pending' },
  { k: 'APPROVED', label: '✅ Approved' },
  { k: 'ACTIVE', label: '🚗 Active' },
  { k: 'EXITED', label: '🚪 Exited' },
];

const STATUS_PRIORITY = {
  ACTIVE: 0, APPROVED: 1, PENDING: 2, OVERSTAY: 3, EXITED: 4, EXPIRED: 4, REJECTED: 5,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const toDateInput = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const todayDateInput = () => toDateInput(new Date());

const isValidVehicle = (v) =>
  /^[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}$/.test(v.trim().toUpperCase().replace(/\s/g, ''));

const isValidPhone = (p) =>
  !p || /^[6-9]\d{9}$/.test(p.replace(/\s/g, ''));

const getTakenSlotsForDate = (parkingRequests, dateStr) => {
  if (!dateStr) return new Set();
  const target = new Date(dateStr);
  return new Set(
    parkingRequests
      .filter(r => {
        if (!['PENDING', 'APPROVED', 'ACTIVE'].includes(r.status)) return false;
        if (!r.slotNumber) return false;
        const start = r.expectedDate ? new Date(r.expectedDate) : new Date(r.requestedAt);
        const end = new Date(start.getTime() + parseInt(r.durationDays || r.duration || '1', 10) * 86400000);
        return target >= start && target < end;
      })
      .map(r => r.slotNumber)
  );
};

// ─── Slot Grid ────────────────────────────────────────────────────────────────
function SlotGrid({ takenSlots, selectedSlot, onSelect }) {
  return (
    <View style={sg.container}>
      <Text style={sg.legend}>
        <Text style={{ color: '#1A7A7A' }}>■ </Text>Available{'  '}
        <Text style={{ color: '#C62828' }}>■ </Text>Taken{'  '}
        <Text style={{ color: '#1565C0' }}>■ </Text>Selected
      </Text>
      <View style={sg.grid}>
        {ALL_SLOTS.map(slot => {
          const taken = takenSlots.has(slot);
          const selected = selectedSlot === slot;
          return (
            <TouchableOpacity
              key={slot}
              style={[sg.slot, taken && sg.slotTaken, selected && sg.slotSelected]}
              onPress={() => !taken && onSelect(slot)}
              activeOpacity={taken ? 1 : 0.75}
              disabled={taken}
            >
              <Text style={[sg.slotLabel, taken && sg.slotLabelTaken, selected && sg.slotLabelSelected]}>
                {slot}
              </Text>
              {taken && <Text style={sg.slotStatus}>🔴</Text>}
              {selected && <Text style={sg.slotStatus}>✓</Text>}
              {!taken && !selected && <Text style={sg.slotStatus}>🟢</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
const sg = StyleSheet.create({
  container: { marginBottom: 16 },
  legend: { fontSize: 11, color: '#7A9E9E', marginBottom: 10, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { width: 58, height: 56, borderRadius: 12, backgroundColor: '#E8F5F5', borderWidth: 2, borderColor: '#D0EEEE', alignItems: 'center', justifyContent: 'center' },
  slotTaken: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  slotSelected: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  slotLabel: { fontSize: 12, fontWeight: '800', color: '#1A7A7A' },
  slotLabelTaken: { color: '#C62828' },
  slotLabelSelected: { color: '#FFFFFF' },
  slotStatus: { fontSize: 9, marginTop: 2 },
});

// ─── Booking Table ────────────────────────────────────────────────────────────
function BookingTable({ parkingRequests }) {
  const dateMap = {};
  parkingRequests.forEach(r => {
    if (!['PENDING', 'APPROVED', 'ACTIVE', 'EXITED', 'EXPIRED'].includes(r.status)) return;
    const dateKey = fmtDate(r.expectedDate || r.requestedAt);
    if (!dateMap[dateKey]) dateMap[dateKey] = [];
    dateMap[dateKey].push(r);
  });
  const dates = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
  if (dates.length === 0) {
    return (
      <View style={bt.emptyBox}>
        <Text style={bt.emptyText}>No bookings to display</Text>
      </View>
    );
  }
  return (
    <View style={bt.container}>
      <View style={bt.tableHeader}>
        <Text style={[bt.th, { flex: 1.2 }]}>Date</Text>
        <Text style={[bt.th, { flex: 1 }]}>Slot</Text>
        <Text style={[bt.th, { flex: 1.5 }]}>Guest</Text>
        <Text style={[bt.th, { flex: 1 }]}>Vehicle</Text>
        <Text style={[bt.th, { flex: 0.9 }]}>Status</Text>
      </View>
      {dates.map(date =>
        dateMap[date].map((r, idx) => {
          const meta = STATUS_META[r.status] || STATUS_META.PENDING;
          return (
            <View key={`${date}-${r.id}`} style={[bt.row, idx % 2 === 0 && bt.rowAlt]}>
              <Text style={[bt.td, { flex: 1.2 }]}>{idx === 0 ? date : ''}</Text>
              <View style={[bt.slotCell, { flex: 1 }]}>
                <Text style={bt.slotTag}>{r.slotNumber || '—'}</Text>
              </View>
              <Text style={[bt.td, { flex: 1.5 }]} numberOfLines={1}>{r.guestName}</Text>
              <Text style={[bt.td, { flex: 1 }]} numberOfLines={1}>{r.vehicleNumber}</Text>
              <View style={{ flex: 0.9, alignItems: 'center' }}>
                <View style={[bt.statusDot, { backgroundColor: meta.bg }]}>
                  <Text style={[bt.statusText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}
const bt = StyleSheet.create({
  container: { borderRadius: 12, borderWidth: 1, borderColor: '#D0EEEE', overflow: 'hidden', marginBottom: 16 },
  emptyBox: { backgroundColor: '#F0FAFA', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16 },
  emptyText: { color: '#7A9E9E', fontSize: 13 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1A7A7A', paddingHorizontal: 10, paddingVertical: 9 },
  th: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  row: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#E8F5F5', backgroundColor: '#FFFFFF', alignItems: 'center' },
  rowAlt: { backgroundColor: '#F8FDFD' },
  td: { fontSize: 11, color: '#3D6E6E', fontWeight: '600' },
  slotCell: { alignItems: 'flex-start' },
  slotTag: { backgroundColor: '#E8F5F5', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, fontSize: 11, fontWeight: '800', color: '#1A7A7A' },
  statusDot: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  statusText: { fontSize: 9, fontWeight: '800' },
});

// ─── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({ visible, onClose, title, message, phone }) {
  const [shared, setShared] = useState(false);
  const CHANNELS = [
    { icon: '💬', label: 'WhatsApp' },
    { icon: '📱', label: 'SMS' },
    { icon: '📧', label: 'Email' },
    { icon: '📋', label: 'Copy' },
  ];
  const guestPhone = (phone || '').replace(/\D/g, '');

  const openExternal = async (url, fallbackUrl = null) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else if (fallbackUrl) await Linking.openURL(fallbackUrl);
      else await Linking.openURL(url);
      return true;
    } catch {
      Alert.alert('Unable to open app', 'Please check the app is installed.');
      return false;
    }
  };

  const handleShare = async (channel) => {
    setShared(true);
    const encoded = encodeURIComponent(message);
    let ok = false;
    if (channel === 'WhatsApp') {
      const phoneParam = guestPhone ? `91${guestPhone}` : '';
      ok = await openExternal(
        `whatsapp://send?${phoneParam ? `phone=${phoneParam}&` : ''}text=${encoded}`,
        `https://wa.me/${phoneParam}?text=${encoded}`
      );
    } else if (channel === 'SMS') {
      const sep = Platform.OS === 'ios' ? '&' : '?';
      ok = await openExternal(`sms:${guestPhone}${sep}body=${encoded}`);
    } else if (channel === 'Email') {
      ok = await openExternal(`mailto:?subject=${encodeURIComponent('Guest Parking Details')}&body=${encoded}`);
    } else {
      Clipboard.setString(message);
      ok = true;
    }
    setShared(false);
    if (ok) {
      onClose();
      Alert.alert('Ready', channel === 'Copy' ? 'Parking details copied.' : `${channel} opened with parking details.`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={shareS.overlay}>
        <View style={shareS.sheet}>
          <View style={shareS.handle} />
          <Text style={shareS.title}>{title}</Text>
          <View style={shareS.messageBubble}>
            <Text style={shareS.messageText}>{message}</Text>
          </View>
          {shared ? (
            <View style={shareS.sentRow}><Text style={shareS.sentText}>✅ Sending...</Text></View>
          ) : (
            <>
              <Text style={shareS.channelLabel}>Send via</Text>
              <View style={shareS.channelRow}>
                {CHANNELS.map(c => (
                  <TouchableOpacity key={c.label} style={shareS.channelBtn} onPress={() => handleShare(c.label)}>
                    <Text style={shareS.channelIcon}>{c.icon}</Text>
                    <Text style={shareS.channelText}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <TouchableOpacity style={shareS.cancelBtn} onPress={onClose}>
            <Text style={shareS.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const shareS = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  handle: { width: 40, height: 4, backgroundColor: '#D0EEEE', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '800', color: '#1A2E2E', marginBottom: 12 },
  messageBubble: { backgroundColor: '#E8F5F5', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#D0EEEE', marginBottom: 16 },
  messageText: { fontSize: 13, color: '#3D6E6E', lineHeight: 20, fontFamily: 'monospace' },
  channelLabel: { fontSize: 11, fontWeight: '700', color: '#7A9E9E', marginBottom: 10 },
  channelRow: { flexDirection: 'row', marginBottom: 16 },
  channelBtn: { flex: 1, alignItems: 'center', backgroundColor: '#F0FAFA', borderRadius: 14, paddingVertical: 12, marginHorizontal: 4 },
  channelIcon: { fontSize: 24 },
  channelText: { fontSize: 11, fontWeight: '700', color: '#7A9E9E', marginTop: 4 },
  sentRow: { alignItems: 'center', paddingVertical: 20 },
  sentText: { fontSize: 16, fontWeight: '800', color: '#1A7A7A' },
  cancelBtn: { paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GuestParkingScreen({ navigation }) {
  const user = useAuthStore(s => s.user);
  const guestParking = useSecurityStore(s => s.guestParking) || [];
  const fetchGuestParking = useSecurityStore(s => s.fetchGuestParking);
  const createGuestParking = useSecurityStore(s => s.createGuestParking);

  // My requests: filter by residentId from JWT user
  const myId = String(user?.id || '');
  const myRequests = guestParking
    .filter(p => String(p.residentId || '') === myId)
    .sort((a, b) => {
      const statusDiff = (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0);
    });

  const [showForm, setShowForm] = useState(false);
  const [shareParking, setShareParking] = useState(null);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('list');

  const INIT_FORM = {
    guestName: '', guestPhone: '', vehicleNumber: '',
    vehicleType: 'Car', expectedDate: '', duration: '1', slotNumber: '',
  };
  const [form, setForm] = useState(INIT_FORM);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const takenSlots = getTakenSlotsForDate(guestParking, form.expectedDate);

  useEffect(() => {
    if (form.slotNumber && takenSlots.has(form.slotNumber)) {
      setForm(f => ({ ...f, slotNumber: '' }));
    }
  }, [form.expectedDate]);

  useFocusEffect(
    useCallback(() => {
      fetchGuestParking?.();
    }, [fetchGuestParking])
  );

  const filtered = filter === 'all' ? myRequests : myRequests.filter(p => p.status === filter);
  const activeCount = myRequests.filter(p => p.status === 'ACTIVE').length;
  const pendingCount = myRequests.filter(p => p.status === 'PENDING').length;
  const approvedCount = myRequests.filter(p => p.status === 'APPROVED').length;
  const exitedCount = myRequests.filter(p => ['EXITED', 'EXPIRED'].includes(p.status)).length;

  const validate = () => {
    const e = {};
    if (!form.guestName.trim())
      e.guestName = 'Guest name is required';
    else if (form.guestName.trim().length < 2)
      e.guestName = 'Enter a valid name (min 2 chars)';
    if (form.guestPhone && !isValidPhone(form.guestPhone))
      e.guestPhone = 'Enter a valid 10-digit mobile number';
    if (!form.vehicleNumber.trim())
      e.vehicleNumber = 'Vehicle number is required';
    else if (!isValidVehicle(form.vehicleNumber))
      e.vehicleNumber = 'Enter valid Indian vehicle number (e.g. TS09AB1234)';
    if (!form.expectedDate)
      e.expectedDate = 'Please select expected date';
    if (!form.slotNumber)
      e.slotNumber = 'Please select a parking slot';
    return e;
  };

  const handleRequest = async () => {
    if (submitting) return;
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);
    try {
      // Build payload — NO residentId/residentName (JWT handles identity)
      const payload = {
        unit: user?.unit || user?.flat || '',
        guestName: form.guestName.trim(),
        guestPhone: form.guestPhone.trim() || null,
        vehicleNumber: form.vehicleNumber.trim().toUpperCase().replace(/\s/g, ''),
        vehicleType: form.vehicleType,
        expectedDate: form.expectedDate,
        durationDays: parseInt(form.duration, 10),
        slotNumber: form.slotNumber,
      };
      const saved = await createGuestParking(payload);
      setForm(INIT_FORM);
      setShowForm(false);
      Alert.alert(
        '✅ Request Submitted',
        `Slot: ${saved.slotNumber}\nOTP: ${saved.parkingOtp}\n\nShare this OTP with your guest. Guard will verify at the gate.\n\nNote: Admin must approve before your guest arrives.`
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const shareText = (p) =>
    `🏠 Gated Community — Guest Parking\n\n` +
    `Guest: ${p.guestName}\n` +
    `Vehicle: ${p.vehicleNumber} (${p.vehicleType})\n` +
    `Parking Slot: ${p.slotNumber}\n` +
    `OTP: ${p.parkingOtp}\n` +
    `Host Unit: ${p.unit}\n` +
    (p.guestPhone ? `Phone: ${p.guestPhone}\n` : '') +
    `Duration: ${p.durationDays || p.duration} day(s)\n` +
    `\nShow OTP to guard at main gate for entry.`;

  return (
    <SafeAreaView style={globalStyles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>🅿️ Guest Parking</Text>
            <Text style={s.headerSub}>
              {approvedCount > 0 || activeCount > 0 || pendingCount > 0
                ? `${approvedCount} approved · ${activeCount} active · ${exitedCount} exited`
                : `${myRequests.length} total request${myRequests.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)}>
            <Text style={s.addBtnText}>+ Request</Text>
          </TouchableOpacity>
        </View>

        <View style={s.viewToggle}>
          <TouchableOpacity
            style={[s.toggleBtn, activeTab === 'list' && s.toggleBtnActive]}
            onPress={() => setActiveTab('list')}
          >
            <Text style={[s.toggleBtnText, activeTab === 'list' && s.toggleBtnTextActive]}>📋 List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.toggleBtn, activeTab === 'table' && s.toggleBtnActive]}
            onPress={() => setActiveTab('table')}
          >
            <Text style={[s.toggleBtnText, activeTab === 'table' && s.toggleBtnTextActive]}>📅 Date Table</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter chips */}
      {activeTab === 'list' && (
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.k}
              style={[s.chip, filter === f.k && s.chipActive]}
              onPress={() => setFilter(f.k)}
            >
              <Text style={[s.chipText, filter === f.k && s.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'table' && (
          <>
            <Text style={s.sectionLabel}>BOOKING SCHEDULE — SLOTS A1 TO A15</Text>
            <BookingTable parkingRequests={myRequests} />
            <Text style={s.sectionLabel}>SLOT AVAILABILITY TODAY</Text>
            <View style={s.todaySlots}>
              {ALL_SLOTS.map(slot => {
                const todayTaken = getTakenSlotsForDate(guestParking, new Date().toISOString()).has(slot);
                return (
                  <View
                    key={slot}
                    style={[s.todaySlotChip, todayTaken ? s.todaySlotTaken : s.todaySlotFree]}
                  >
                    <Text style={[s.todaySlotText, todayTaken ? s.todaySlotTextTaken : s.todaySlotTextFree]}>
                      {slot}
                    </Text>
                    <Text style={{ fontSize: 8 }}>{todayTaken ? '🔴' : '🟢'}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {activeTab === 'list' && (
          <>
            {myRequests.length === 0 && (
              <View style={s.infoBanner}>
                <Text style={s.infoText}>
                  ℹ️ Request a parking slot for your guest. After admin approval, share the OTP with your guest — the guard will verify it at the gate.
                </Text>
              </View>
            )}

            {filtered.length === 0 ? (
              <View style={globalStyles.emptyState}>
                <Text style={{ fontSize: 52 }}>🅿️</Text>
                <Text style={globalStyles.emptyText}>
                  {filter === 'all' ? 'No parking requests yet' : `No ${filter.toLowerCase()} requests`}
                </Text>
                {filter === 'all' && (
                  <TouchableOpacity
                    style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 16 }]}
                    onPress={() => setShowForm(true)}
                  >
                    <Text style={globalStyles.btnText}>Request Guest Parking</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filtered.map(p => {
                const meta = STATUS_META[p.status] || STATUS_META.PENDING;
                const isShareable = p.slotNumber && p.parkingOtp &&
                  ['APPROVED', 'ACTIVE'].includes(p.status);
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      globalStyles.card,
                      { borderLeftWidth: 4, borderLeftColor: meta.color, padding: 0, overflow: 'hidden' },
                      p.status === 'OVERSTAY' && { borderColor: '#C62828', borderWidth: 2 },
                    ]}
                    onPress={() => navigation.navigate('ParkingSlotPass', { parkingId: p.id })}
                    activeOpacity={0.92}
                  >
                    <View style={s.cardTop}>
                      <View style={s.cardAvatar}>
                        <Text style={{ fontSize: 24 }}>{meta.icon}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={s.cardName}>{p.guestName}</Text>
                        <Text style={s.cardVehicle}>
                          {VEHICLE_TYPES.find(v => v.key === p.vehicleType)?.icon || '🚗'}{' '}
                          {p.vehicleNumber} · {p.vehicleType}
                        </Text>
                      </View>
                      <View style={[s.statusBadge, { backgroundColor: meta.bg }]}>
                        <Text style={[s.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
                      </View>
                    </View>

                    {p.slotNumber ? (
                      <View style={s.slotBanner}>
                        <View>
                          <Text style={s.slotLabel}>ASSIGNED SLOT</Text>
                          <Text style={s.slotNumber}>{p.slotNumber}</Text>
                        </View>
                        {p.parkingOtp && ['APPROVED', 'ACTIVE'].includes(p.status) && (
                          <View style={s.otpBox}>
                            <Text style={s.otpLabel}>OTP</Text>
                            <Text style={s.otpValue}>{p.parkingOtp}</Text>
                          </View>
                        )}
                      </View>
                    ) : null}

                    <View style={s.cardMeta}>
                      {p.guestPhone ? <Text style={s.cardMetaText}>📱 {p.guestPhone}</Text> : null}
                      <Text style={s.cardMetaText}>📅 Requested: {fmt(p.requestedAt)}</Text>
                      {p.expectedDate ? <Text style={s.cardMetaText}>📆 Expected: {fmtDate(p.expectedDate)}</Text> : null}
                      {p.durationDays ? <Text style={s.cardMetaText}>⏱ Duration: {p.durationDays} day(s)</Text> : null}
                      {p.startTime ? <Text style={s.cardMetaText}>🟢 Active from: {fmt(p.startTime)}</Text> : null}
                      {p.endTime ? <Text style={s.cardMetaText}>🔴 Expires: {fmt(p.endTime)}</Text> : null}
                      <Text style={s.cardMetaText}>🏠 Unit: {p.unit}</Text>
                    </View>

                    {p.status === 'PENDING' && (
                      <View style={s.pendingNotice}>
                        <Text style={s.pendingNoticeText}>
                          🕒 Awaiting admin approval. OTP will be visible once approved.
                        </Text>
                      </View>
                    )}

                    {isShareable && (
                      <TouchableOpacity
                        style={s.shareBtn}
                        onPress={(e) => { e.stopPropagation(); setShareParking(p); }}
                        activeOpacity={0.85}
                      >
                        <Text style={s.shareBtnText}>📤 Share Slot & OTP with Guest</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {shareParking && (
        <ShareModal
          visible={!!shareParking}
          onClose={() => setShareParking(null)}
          title="📤 Share Parking Details"
          message={shareText(shareParking)}
          phone={shareParking.guestPhone}
        />
      )}

      {/* Request Form Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={formS.overlay}>
          <View style={formS.sheet}>
            <View style={formS.handle} />
            <View style={formS.sheetHeader}>
              <Text style={formS.sheetTitle}>Request Guest Parking</Text>
              <TouchableOpacity
                onPress={() => { setShowForm(false); setErrors({}); setForm(INIT_FORM); }}
                style={formS.closeBtn}
              >
                <Text style={formS.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={s.infoBanner}>
                <Text style={s.infoText}>
                  Select a date and slot (A1–A15). Admin will approve your request. After approval, share the OTP with your guest for gate entry.
                </Text>
              </View>

              <Text style={formS.label}>Guest Name *</Text>
              <TextInput
                style={[formS.input, errors.guestName && formS.inputError]}
                placeholder="Full name of your guest"
                placeholderTextColor="#7A9E9E"
                value={form.guestName}
                onChangeText={v => { setForm(f => ({ ...f, guestName: v })); setErrors(e => ({ ...e, guestName: '' })); }}
              />
              {errors.guestName ? <Text style={formS.errorText}>{errors.guestName}</Text> : null}

              <Text style={formS.label}>Guest Phone (optional)</Text>
              <TextInput
                style={[formS.input, errors.guestPhone && formS.inputError]}
                placeholder="10-digit mobile number"
                placeholderTextColor="#7A9E9E"
                value={form.guestPhone}
                onChangeText={v => { setForm(f => ({ ...f, guestPhone: v })); setErrors(e => ({ ...e, guestPhone: '' })); }}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.guestPhone ? <Text style={formS.errorText}>{errors.guestPhone}</Text> : null}

              <Text style={formS.label}>Vehicle Number *</Text>
              <TextInput
                style={[formS.input, errors.vehicleNumber && formS.inputError]}
                placeholder="e.g. TS09AB1234"
                placeholderTextColor="#7A9E9E"
                value={form.vehicleNumber}
                onChangeText={v => { setForm(f => ({ ...f, vehicleNumber: v.toUpperCase() })); setErrors(e => ({ ...e, vehicleNumber: '' })); }}
                autoCapitalize="characters"
                maxLength={12}
              />
              {errors.vehicleNumber ? <Text style={formS.errorText}>{errors.vehicleNumber}</Text> : null}

              <Text style={formS.label}>Vehicle Type</Text>
              <View style={formS.typeGrid}>
                {VEHICLE_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[formS.typeChip, form.vehicleType === t.key && formS.typeChipActive]}
                    onPress={() => setForm(f => ({ ...f, vehicleType: t.key }))}
                  >
                    <Text style={formS.typeChipIcon}>{t.icon}</Text>
                    <Text style={[formS.typeChipText, form.vehicleType === t.key && formS.typeChipTextActive]}>
                      {t.key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={formS.label}>Expected Date *</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={[formS.input, formS.webDateInput, errors.expectedDate && formS.inputError]}
                  value={form.expectedDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#7A9E9E"
                  onChangeText={v => {
                    setForm(f => ({ ...f, expectedDate: v, slotNumber: '' }));
                    setErrors(e => ({ ...e, expectedDate: '' }));
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={[formS.input, formS.dateInput, errors.expectedDate && formS.inputError]}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={form.expectedDate ? formS.dateText : formS.datePlaceholder}>
                      {form.expectedDate ? fmtDate(form.expectedDate) : 'Select expected date'}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={form.expectedDate ? new Date(form.expectedDate) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      minimumDate={new Date()}
                      onChange={(event, selectedDate) => {
                        if (Platform.OS !== 'ios') setShowDatePicker(false);
                        if (selectedDate) {
                          setForm(f => ({ ...f, expectedDate: toDateInput(selectedDate), slotNumber: '' }));
                          setErrors(e => ({ ...e, expectedDate: '' }));
                        }
                      }}
                    />
                  )}
                  {Platform.OS === 'ios' && showDatePicker && (
                    <TouchableOpacity style={formS.doneBtn} onPress={() => setShowDatePicker(false)}>
                      <Text style={formS.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              {errors.expectedDate ? <Text style={formS.errorText}>{errors.expectedDate}</Text> : null}

              <Text style={formS.label}>Duration (days)</Text>
              <View style={formS.durationRow}>
                {DURATION_OPTIONS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[formS.durationChip, form.duration === d && formS.durationChipActive]}
                    onPress={() => setForm(f => ({ ...f, duration: d }))}
                  >
                    <Text style={[formS.durationText, form.duration === d && formS.durationTextActive]}>{d}d</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={formS.label}>
                Select Parking Slot * {form.expectedDate ? `(for ${form.expectedDate})` : '(enter date first)'}
              </Text>
              {errors.slotNumber ? <Text style={formS.errorText}>{errors.slotNumber}</Text> : null}
              {form.slotNumber ? (
                <View style={formS.selectedSlotBanner}>
                  <Text style={formS.selectedSlotText}>✅ Selected: {form.slotNumber}</Text>
                  <TouchableOpacity onPress={() => setForm(f => ({ ...f, slotNumber: '' }))}>
                    <Text style={{ color: '#C62828', fontWeight: '700', fontSize: 13 }}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              <SlotGrid
                takenSlots={takenSlots}
                selectedSlot={form.slotNumber}
                onSelect={slot => { setForm(f => ({ ...f, slotNumber: slot })); setErrors(e => ({ ...e, slotNumber: '' })); }}
              />

              <TouchableOpacity
                style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 8, opacity: submitting ? 0.6 : 1 }]}
                onPress={handleRequest}
                disabled={submitting}
                activeOpacity={0.85}
              >
                <Text style={globalStyles.btnText}>{submitting ? 'Submitting...' : 'Submit Request'}</Text>
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header: { padding: 20, paddingTop: 40, backgroundColor: '#1A7A7A' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { marginBottom: 8 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  viewToggle: { flexDirection: 'row', marginTop: 14, gap: 8 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  toggleBtnActive: { backgroundColor: '#FFFFFF' },
  toggleBtnText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  toggleBtnTextActive: { color: '#1A7A7A' },
  filterRow: { paddingVertical: 8, backgroundColor: '#FFFFFF', maxHeight: 48, borderBottomWidth: 1, borderBottomColor: '#D0EEEE' },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F0FAFA', borderWidth: 1, borderColor: '#D0EEEE', marginRight: 6, height: 30, justifyContent: 'center' },
  chipActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#3D6E6E' },
  chipTextActive: { color: '#FFFFFF' },
  infoBanner: { backgroundColor: '#E8F5F5', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#D0EEEE' },
  infoText: { fontSize: 13, color: '#3D6E6E', lineHeight: 20 },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#7A9E9E', marginBottom: 10, marginTop: 4 },
  todaySlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  todaySlotChip: { width: 54, height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  todaySlotFree: { backgroundColor: '#E8F5F5', borderColor: '#D0EEEE' },
  todaySlotTaken: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  todaySlotText: { fontSize: 12, fontWeight: '800' },
  todaySlotTextFree: { color: '#1A7A7A' },
  todaySlotTextTaken: { color: '#C62828' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, paddingBottom: 10 },
  cardAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D0EEEE' },
  cardName: { fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
  cardVehicle: { fontSize: 13, color: '#7A9E9E', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  statusBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  slotBanner: { backgroundColor: '#E8F5F5', borderTopWidth: 1, borderTopColor: '#D0EEEE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  slotLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#7A9E9E' },
  slotNumber: { fontSize: 22, fontWeight: '900', color: '#1A7A7A', letterSpacing: 2 },
  otpBox: { backgroundColor: '#1A7A7A', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  otpLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 },
  otpValue: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: 4, fontFamily: 'monospace' },
  cardMeta: { paddingHorizontal: 14, paddingBottom: 12 },
  cardMetaText: { fontSize: 12, color: '#7A9E9E', marginTop: 3 },
  pendingNotice: { backgroundColor: '#FEF3C7', marginHorizontal: 14, marginBottom: 14, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderLeftWidth: 3, borderLeftColor: '#E65100' },
  pendingNoticeText: { fontSize: 12, color: '#7C3D00', fontWeight: '600' },
  shareBtn: { backgroundColor: '#1A7A7A', marginHorizontal: 14, marginBottom: 14, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  shareBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});

const formS = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 8, maxHeight: '95%' },
  handle: { width: 40, height: 4, backgroundColor: '#D0EEEE', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '900', color: '#1A2E2E' },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 22, color: '#7A9E9E' },
  label: { fontSize: 13, fontWeight: '700', color: '#3D6E6E', marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: '#F0FAFA', borderWidth: 1.5, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1A2E2E', marginBottom: 4 },
  dateInput: { justifyContent: 'center', minHeight: 48 },
  webDateInput: { minHeight: 48, fontWeight: '700' },
  dateText: { fontSize: 15, color: '#1A2E2E', fontWeight: '700' },
  datePlaceholder: { fontSize: 15, color: '#7A9E9E' },
  doneBtn: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8, marginBottom: 8 },
  doneBtnText: { color: '#1A7A7A', fontSize: 14, fontWeight: '800' },
  inputError: { borderColor: '#C62828', backgroundColor: '#FEE2E2' },
  errorText: { fontSize: 11, color: '#C62828', fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  typeGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeChip: { flex: 1, alignItems: 'center', backgroundColor: '#F0FAFA', borderRadius: 12, paddingVertical: 10, borderWidth: 1.5, borderColor: '#D0EEEE' },
  typeChipActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  typeChipIcon: { fontSize: 20, marginBottom: 3 },
  typeChipText: { fontSize: 12, fontWeight: '700', color: '#3D6E6E' },
  typeChipTextActive: { color: '#FFFFFF' },
  durationRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  durationChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#F0FAFA', borderWidth: 1.5, borderColor: '#D0EEEE' },
  durationChipActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  durationText: { fontSize: 14, fontWeight: '800', color: '#3D6E6E' },
  durationTextActive: { color: '#FFFFFF' },
  selectedSlotBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#CCFBF1', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#A7F3D0' },
  selectedSlotText: { fontSize: 14, fontWeight: '800', color: '#1A7A7A' },
});
