// import React, { useState } from 'react';
// import {
//   View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
//   ScrollView, TextInput, Alert, Modal,
// } from 'react-native';
// import { useAuthStore }     from '../../../store/AuthStore';
// import { useSecurityStore } from '../../../store/securityStore';
// import { COLORS, globalStyles } from '../../../components/common/theme';
// import { useTheme } from '../../../hooks/useTheme';

// const PURPOSES = ['Personal Visit', 'Delivery', 'Service', 'Guest Stay', 'Official Work', 'Other'];

// // ─── Simulated Share Sheet ────────────────────────────────────────────────────
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
//                   <TouchableOpacity key={c.label} style={shareStyles.channelBtn} onPress={() => handleShare(c.label)}>
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
//   channelBtn:   { flex: 1, alignItems: 'center', backgroundColor: '#E8F5F5', borderRadius: 14, paddingVertical: 12, marginHorizontal: 4 },
//   channelIcon:  { fontSize: 24 },
//   channelText:  { fontSize: 11, fontWeight: '700', color: '#7A9E9E', marginTop: 4 },
//   sentRow:      { alignItems: 'center', paddingVertical: 20 },
//   sentText:     { fontSize: 16, fontWeight: '800', color: '#1A7A7A' },
//   cancelBtn:    { paddingVertical: 14, alignItems: 'center' },
//   cancelText:   { fontSize: 14, fontWeight: '700', color: '#64748B' },
// });

// const STATUS_META = {
//   CREATED:     { color: '#E65100', bg: '#FEF3C7', label: '⏳ Created' },
//   APPROVED:    { color: '#1A7A7A', bg: '#CCFBF1', label: '✅ Approved — Ready to Enter' },
//   CHECKED_IN:  { color: '#1A7A7A', bg: '#DBEAFE', label: '🚶 Inside — Checked In' },
//   CHECKED_OUT: { color: '#64748B', bg: '#F1F5F9', label: '🚪 Checked Out' },
//   DENIED:      { color: '#C62828', bg: '#FEE2E2', label: '🚫 Entry Denied' },
// };

// function fmt(iso) {
//   if (!iso) return '—';
//   return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
// }

// // ─── Visitor List ─────────────────────────────────────────────────────────────

// export default function AddVisitorScreen({ navigation }) {
//   const theme = useTheme();
//   const user       = useAuthStore(s => s.user);
//   const addVisitor = useSecurityStore(s => s.addVisitor);
//   const approveVisitor = useSecurityStore(s => s.approveVisitor);
//   const [form, setForm] = useState({ name: '', phone: '', purpose: 'Personal Visit', vehicleNumber: '' });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = () => {
//     if (!form.name.trim()) { Alert.alert('Required', 'Visitor name is required'); return; }
//     setLoading(true);
//     setTimeout(() => {
//       const visitor = addVisitor({
//         ...form,
//         hostUnit: user?.unit || 'A-101',
//         hostResidentId: user?.id || 'res1',
//         hostResidentName: user?.name || 'Resident',
//       });
//       // Auto-approve immediately — resident initiated = pre-approved
//       approveVisitor(visitor.id, user?.id || 'res1');
//       setLoading(false);
//       Alert.alert(
//         '✅ Visitor Pass Created!',
//         `OTP: ${visitor.otp}\n\nShare this OTP or QR code with ${form.name}. They can show it at the gate for entry.`,
//         [{ text: 'View Pass', onPress: () => navigation.replace('VisitorQRCode', { visitorId: visitor.id }) }]
//       );
//     }, 500);
//   };

//   return (
//     <SafeAreaView style={globalStyles.screen}>
//       <StatusBar barStyle="light-content" backgroundColor='#1A7A7A' />
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Text style={styles.backText}>‹ Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Invite Visitor</Text>
//         <View style={{ width: 60 }} />
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 20 }}>
//         <View style={styles.infoBanner}>
//           <Text style={styles.infoText}>
//             🔐 A unique OTP + QR code will be generated. Share it with your visitor — they show it at the gate.
//           </Text>
//         </View>

//         <Text style={globalStyles.label}>Visitor Name *</Text>
//         <TextInput style={globalStyles.input} placeholder="Full name" placeholderTextColor={COLORS.textMuted}
//           value={form.name} onChangeText={t => setForm(f => ({ ...f, name: t }))} />

//         <Text style={globalStyles.label}>Phone Number</Text>
//         <TextInput style={globalStyles.input} placeholder="Mobile number" keyboardType="phone-pad" placeholderTextColor={COLORS.textMuted}
//           value={form.phone} onChangeText={t => setForm(f => ({ ...f, phone: t }))} />

//         <Text style={globalStyles.label}>Purpose of Visit</Text>
//         <View style={styles.purposeGrid}>
//           {PURPOSES.map(p => (
//             <TouchableOpacity key={p} style={[styles.chip, form.purpose === p && styles.chipActive]} onPress={() => setForm(f => ({ ...f, purpose: p }))}>
//               <Text style={[styles.chipText, form.purpose === p && styles.chipTextActive]}>{p}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Text style={globalStyles.label}>Vehicle Number (optional)</Text>
//         <TextInput style={globalStyles.input} placeholder="e.g. TS09AB1234" autoCapitalize="characters" placeholderTextColor={COLORS.textMuted}
//           value={form.vehicleNumber} onChangeText={t => setForm(f => ({ ...f, vehicleNumber: t }))} />

//         <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 8 }]} onPress={handleSubmit} disabled={loading}>
//           <Text style={globalStyles.btnText}>{loading ? '⏳ Generating Pass...' : '🔐 Generate Visitor Pass'}</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   // ── Header ──────────────────────────────────────────────────────────────────
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     backgroundColor: '#1A7A7A',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: '#FFFFFF',
//     flex: 1,
//     textAlign: 'center',
//   },
//   backBtn: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     minWidth: 50,
//   },
//   backText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },
//   addBtn: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   addBtnText: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },

//   // ── Filter chips ─────────────────────────────────────────────────────────────
//   filterRow: {
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: '#FFFFFF',
//   },
//   chip: {
//     paddingHorizontal: 14,
//     paddingVertical: 7,
//     borderRadius: 20,
//     backgroundColor: '#E8F5F5',
//     borderWidth: 1,
//     borderColor: '#D0EEEE',
//     marginRight: 8,
//   },
//   chipActive: {
//     backgroundColor: '#1A7A7A',
//     borderColor: '#1A7A7A',
//   },
//   chipText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#3D6E6E',
//   },
//   chipTextActive: {
//     color: '#FFFFFF',
//   },

//   // ── Visitor card elements ─────────────────────────────────────────────────────
//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#E8F5F5',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: '#D0EEEE',
//   },
//   statusBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//     alignItems: 'center',
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: '800',
//     letterSpacing: 0.5,
//   },
//   statusBanner: {
//     marginTop: 10,
//     paddingVertical: 7,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     alignItems: 'center',
//   },
//   statusBannerText: {
//     fontSize: 13,
//     fontWeight: '700',
//   },

//   // ── Add Visitor form ─────────────────────────────────────────────────────────
//   infoBanner: {
//     backgroundColor: '#E8F5F5',
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#D0EEEE',
//   },
//   infoText: {
//     fontSize: 13,
//     color: '#3D6E6E',
//     lineHeight: 20,
//   },
//   purposeGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginBottom: 16,
//   },

//   // ── QR Code screen ───────────────────────────────────────────────────────────
//   qrCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 24,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#D0EEEE',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 4,
//     marginBottom: 16,
//   },
//   qrCardTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#1A2E2E',
//     marginBottom: 4,
//   },
//   qrCardSub: {
//     fontSize: 13,
//     color: '#7A9E9E',
//     marginBottom: 16,
//   },
//   qrBox: {
//     width: 180,
//     height: 180,
//     backgroundColor: '#E8F5F5',
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: '#1A7A7A',
//     marginBottom: 16,
//   },
//   qrCodeText: {
//     fontSize: 11,
//     fontFamily: 'monospace',
//     color: '#1A7A7A',
//     textAlign: 'center',
//     fontWeight: '700',
//     letterSpacing: 1,
//     padding: 8,
//   },
//   otpDisplay: {
//     alignItems: 'center',
//     backgroundColor: '#E8F5F5',
//     borderRadius: 14,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#D0EEEE',
//     width: '100%',
//     marginBottom: 8,
//   },
//   otpLabel: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: '#7A9E9E',
//     letterSpacing: 1,
//     marginBottom: 6,
//   },
//   otpValue: {
//     fontSize: 36,
//     fontWeight: '900',
//     color: '#1A7A7A',
//     letterSpacing: 8,
//     fontFamily: 'monospace',
//   },
//   otpHint: {
//     fontSize: 11,
//     color: '#7A9E9E',
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   infoBox: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#D0EEEE',
//     marginBottom: 16,
//     width: '100%',
//   },
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 7,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E8F5F5',
//   },
//   infoLabel: {
//     fontSize: 13,
//     color: '#7A9E9E',
//     fontWeight: '600',
//   },
//   infoValue: {
//     fontSize: 13,
//     color: '#1A2E2E',
//     fontWeight: '700',
//     maxWidth: '60%',
//     textAlign: 'right',
//   },
//   shareBtn: {
//     backgroundColor: '#1A7A7A',
//     borderRadius: 14,
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     alignItems: 'center',
//     marginTop: 8,
//     width: '100%',
//   },
//   shareBtnText: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: '#FFFFFF',
//   },
// });


















// import React, { useState } from 'react';
// import {
//   View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
//   ScrollView, TextInput, Alert, Modal, Linking, Clipboard, Platform,
// } from 'react-native';
// import { useAuthStore } from '../../../store/AuthStore';
// import { useSecurityStore } from '../../../store/securityStore';
// import { COLORS, globalStyles } from '../../../components/common/theme';
// import { VISITOR_API, authApiCall } from '../../../api/api';

// const PURPOSES = ['Personal Visit', 'Delivery', 'Service', 'Guest Stay', 'Official Work', 'Other'];

// // ─── Share Modal ──────────────────────────────────────────────────────────────
// function ShareModal({ visible, onClose, visitor }) {
//   const [copied, setCopied] = useState(false);

//   if (!visitor) return null;

//   const shareMessage =
//     `🏠 *Visitor Pass - ${visitor.hostUnit || 'Gated Community'}*\n\n` +
//     `👤 Name: ${visitor.name}\n` +
//     `🔑 OTP: *${visitor.otp}*\n` +
//     `🎯 Purpose: ${visitor.purpose}\n\n` +
//     `📌 Show this OTP to the guard at the gate for entry.\n` +
//     `⏰ Valid for today only.`;

//   const encodedMsg = encodeURIComponent(shareMessage);

//   const handleWhatsApp = async () => {
//     const phone = visitor.phone ? visitor.phone.replace(/\D/g, '') : '';
//     const url = phone
//       ? `whatsapp://send?phone=91${phone}&text=${encodedMsg}`
//       : `whatsapp://send?text=${encodedMsg}`;
//     try {
//       const supported = await Linking.canOpenURL(url);
//       if (supported) {
//         await Linking.openURL(url);
//       } else {
//         await Linking.openURL(`https://wa.me/${phone ? '91' + phone : ''}?text=${encodedMsg}`);
//       }
//     } catch (e) {
//       Alert.alert('WhatsApp not installed', 'Please install WhatsApp or share manually.');
//     }
//     onClose();
//   };

//   const handleSMS = async () => {
//     const phone = visitor.phone ? visitor.phone.replace(/\D/g, '') : '';
//     const url = Platform.OS === 'ios'
//       ? `sms:${phone}&body=${encodeURIComponent(shareMessage)}`
//       : `sms:${phone}?body=${encodeURIComponent(shareMessage)}`;
//     try {
//       await Linking.openURL(url);
//     } catch (e) {
//       Alert.alert('Cannot open SMS', 'Please send the OTP manually via SMS.');
//     }
//     onClose();
//   };

//   const handleEmail = async () => {
//     const subject = encodeURIComponent(`Visitor Pass OTP - ${visitor.otp}`);
//     const body = encodeURIComponent(shareMessage);
//     const url = `mailto:?subject=${subject}&body=${body}`;
//     try {
//       await Linking.openURL(url);
//     } catch (e) {
//       Alert.alert('Cannot open Email', 'Please send the OTP manually via email.');
//     }
//     onClose();
//   };

//   const handleCopy = () => {
//     try {
//       Clipboard.setString(shareMessage);
//     } catch (e) {
//       console.warn('Clipboard not available:', e);
//     }
//     setCopied(true);
//     setTimeout(() => {
//       setCopied(false);
//       onClose();
//       Alert.alert('✅ Copied!', 'Visitor pass details copied to clipboard.');
//     }, 800);
//   };

//   const CHANNELS = [
//     { icon: '💬', label: 'WhatsApp', color: '#25D366', action: handleWhatsApp },
//     { icon: '📱', label: 'SMS', color: '#3B82F6', action: handleSMS },
//     { icon: '📧', label: 'Email', color: '#EF4444', action: handleEmail },
//     { icon: '📋', label: 'Copy', color: '#6366F1', action: handleCopy },
//   ];

//   return (
//     <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
//       <View style={ss.overlay}>
//         <View style={ss.sheet}>
//           <View style={ss.handle} />
//           <Text style={ss.title}>📤 Share Visitor Pass</Text>

//           <View style={ss.otpBox}>
//             <Text style={ss.otpLabel}>VISITOR OTP</Text>
//             <Text style={ss.otpValue}>{visitor.otp}</Text>
//             <Text style={ss.otpHint}>Share this with {visitor.name}</Text>
//           </View>

//           <View style={ss.messageBubble}>
//             <Text style={ss.messageText}>{shareMessage}</Text>
//           </View>

//           {copied ? (
//             <View style={ss.sentRow}>
//               <Text style={ss.sentText}>✅ Copied to clipboard!</Text>
//             </View>
//           ) : (
//             <>
//               <Text style={ss.channelLabel}>SEND VIA</Text>
//               <View style={ss.channelRow}>
//                 {CHANNELS.map(c => (
//                   <TouchableOpacity
//                     key={c.label}
//                     style={[ss.channelBtn, { backgroundColor: c.color + '15', borderColor: c.color + '40' }]}
//                     onPress={c.action}
//                   >
//                     <Text style={ss.channelIcon}>{c.icon}</Text>
//                     <Text style={[ss.channelText, { color: c.color }]}>{c.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </>
//           )}

//           <TouchableOpacity style={ss.cancelBtn} onPress={onClose}>
//             <Text style={ss.cancelText}>Close</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const ss = StyleSheet.create({
//   overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
//   sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
//   handle: { width: 44, height: 4, backgroundColor: '#D0EEEE', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
//   title: { fontSize: 18, fontWeight: '900', color: '#1A2E2E', marginBottom: 16, textAlign: 'center' },
//   otpBox: { backgroundColor: '#0D6E6E', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 14 },
//   otpLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginBottom: 6 },
//   otpValue: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', letterSpacing: 10, fontFamily: 'monospace' },
//   otpHint: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 },
//   messageBubble: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 16 },
//   messageText: { fontSize: 12, color: '#166534', lineHeight: 20, fontFamily: 'monospace' },
//   channelLabel: { fontSize: 11, fontWeight: '800', color: '#7A9E9E', letterSpacing: 1, marginBottom: 10, textAlign: 'center' },
//   channelRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
//   channelBtn: { flex: 1, alignItems: 'center', borderRadius: 14, paddingVertical: 14, borderWidth: 1.5 },
//   channelIcon: { fontSize: 26, marginBottom: 4 },
//   channelText: { fontSize: 11, fontWeight: '800' },
//   sentRow: { alignItems: 'center', paddingVertical: 20 },
//   sentText: { fontSize: 16, fontWeight: '800', color: '#1A7A7A' },
//   cancelBtn: { paddingVertical: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E8F5F5', marginTop: 4 },
//   cancelText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
// });

// // ─── Visitor Pass Success Card ─────────────────────────────────────────────────
// function VisitorPassCard({ visitor, onShare, onDone }) {
//   return (
//     <View style={ps.container}>
//       <View style={ps.successBanner}>
//         <Text style={ps.successIcon}>✅</Text>
//         <Text style={ps.successTitle}>Visitor Pass Created!</Text>
//         <Text style={ps.successSub}>Share the OTP with your visitor</Text>
//       </View>

//       <View style={ps.otpCard}>
//         <Text style={ps.otpLabel}>VISITOR OTP</Text>
//         <Text style={ps.otpCode}>{visitor.otp}</Text>
//         <Text style={ps.otpHint}>Visitor shows this at the gate</Text>
//       </View>

//       <View style={ps.detailsCard}>
//         {[
//           { label: '👤 Name', value: visitor.name },
//           { label: '📱 Phone', value: visitor.phone || '—' },
//           { label: '🎯 Purpose', value: visitor.purpose },
//           { label: '🏠 Your Unit', value: visitor.hostUnit || '—' },
//         ].map(r => (
//           <View key={r.label} style={ps.detailRow}>
//             <Text style={ps.detailLabel}>{r.label}</Text>
//             <Text style={ps.detailValue}>{r.value}</Text>
//           </View>
//         ))}
//       </View>

//       <View style={ps.infoBox}>
//         <Text style={ps.infoText}>
//           📌 The guard will ask your visitor for this OTP.{'\n'}
//           Once verified and approved, you will receive a <Text style={{ fontWeight: '900' }}>Checked In</Text> notification automatically.
//         </Text>
//       </View>

//       <TouchableOpacity style={ps.shareBtn} onPress={onShare}>
//         <Text style={ps.shareBtnText}>📤 Share OTP with Visitor</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={ps.doneBtn} onPress={onDone}>
//         <Text style={ps.doneBtnText}>← Back to Visitors</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const ps = StyleSheet.create({
//   container: { flex: 1 },
//   successBanner: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#F0FDF4', marginBottom: 4 },
//   successIcon: { fontSize: 48, marginBottom: 8 },
//   successTitle: { fontSize: 22, fontWeight: '900', color: '#166534' },
//   successSub: { fontSize: 14, color: '#16A34A', marginTop: 4 },
//   otpCard: { backgroundColor: '#0D6E6E', margin: 16, borderRadius: 20, padding: 24, alignItems: 'center' },
//   otpLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.65)', letterSpacing: 2, marginBottom: 8 },
//   otpCode: { fontSize: 52, fontWeight: '900', color: '#FFFFFF', letterSpacing: 12, fontFamily: 'monospace' },
//   otpHint: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 8 },
//   detailsCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#D0EEEE', marginBottom: 12 },
//   detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E8F5F5' },
//   detailLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
//   detailValue: { fontSize: 13, color: '#1A2E2E', fontWeight: '700' },
//   infoBox: { backgroundColor: '#FFFBEB', marginHorizontal: 16, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 16 },
//   infoText: { fontSize: 13, color: '#92400E', lineHeight: 20 },
//   shareBtn: { backgroundColor: '#0D6E6E', marginHorizontal: 16, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
//   shareBtnText: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
//   doneBtn: { marginHorizontal: 16, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#D0EEEE' },
//   doneBtnText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
// });

// // ─── Main Screen ──────────────────────────────────────────────────────────────
// export default function AddVisitorScreen({ navigation }) {
//   const user = useAuthStore(s => s.user);
//   const token = useAuthStore(s => s.token);
//   const addVisitor = useSecurityStore(s => s.addVisitor);
//   const approveVisitor = useSecurityStore(s => s.approveVisitor);

//   const [form, setForm] = useState({
//     name: '', phone: '', purpose: 'Personal Visit', vehicleNumber: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [createdVisitor, setCreatedVisitor] = useState(null);
//   const [showShare, setShowShare] = useState(false);

//   const handleSubmit = async () => {
//     if (!form.name.trim()) {
//       Alert.alert('Required', 'Please enter the visitor name.');
//       return;
//     }
//     setLoading(true);
//     try {
//       // ── Backend payload: identity fields REMOVED — server reads from JWT ──
//       // VisitorPassPayloads.CreatePass only accepts:
//       //   visitorName, visitorPhone, purpose, vehicleNumber
//       const payload = {
//         visitorName: form.name.trim(),
//         visitorPhone: form.phone.trim(),
//         purpose: form.purpose,
//         vehicleNumber: form.vehicleNumber.trim(),
//       };

//       const { ok, data } = await authApiCall(VISITOR_API.create, token, 'POST', payload);

//       if (ok && data) {
//         // ✅ Backend success — map response to local display shape
//         const visitor = {
//           id: String(data.id),
//           name: data.visitorName,
//           phone: data.visitorPhone,
//           purpose: data.purpose,
//           vehicleNumber: data.vehicleNumber,
//           otp: data.otp,
//           qrCode: data.qrCode,
//           status: data.status,
//           hostUnit: data.hostUnit,
//           hostResidentName: data.hostResidentName,
//           createdAt: data.createdAt,
//           isFromBackend: true,
//           backendId: data.id,
//         };
//         // Mirror into local store so VisitorListScreen shows it immediately
//         const localVis = addVisitor({
//           ...form,
//           hostUnit: data.hostUnit || user?.unit || 'A-101',
//           hostResidentId: user?.id || 'res1',
//           hostResidentName: data.hostResidentName || user?.name || 'Resident',
//           _backendOtp: data.otp,
//           _backendId: data.id,
//         });
//         approveVisitor(localVis.id, user?.id || 'res1');
//         setCreatedVisitor(visitor);
//       } else {
//         // ⚡ Backend unavailable — graceful local fallback
//         console.warn('Backend unavailable, using local store fallback');
//         const visitor = addVisitor({
//           ...form,
//           hostUnit: user?.unit || 'A-101',
//           hostResidentId: user?.id || 'res1',
//           hostResidentName: user?.name || 'Resident',
//         });
//         approveVisitor(visitor.id, user?.id || 'res1');
//         setCreatedVisitor({ ...visitor, hostUnit: user?.unit || 'A-101' });
//       }
//     } catch (e) {
//       // ⚡ Network error — local fallback
//       const visitor = addVisitor({
//         ...form,
//         hostUnit: user?.unit || 'A-101',
//         hostResidentId: user?.id || 'res1',
//         hostResidentName: user?.name || 'Resident',
//       });
//       approveVisitor(visitor.id, user?.id || 'res1');
//       setCreatedVisitor({ ...visitor, hostUnit: user?.unit || 'A-101' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setCreatedVisitor(null);
//     setForm({ name: '', phone: '', purpose: 'Personal Visit', vehicleNumber: '' });
//   };

//   // ── Pass created → show pass view ─────────────────────────────────────────
//   if (createdVisitor) {
//     return (
//       <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
//         <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleReset} style={styles.backBtn}>
//             <Text style={styles.backText}>‹ Back</Text>
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Visitor Pass</Text>
//           <View style={{ width: 60 }} />
//         </View>

//         <ScrollView>
//           <VisitorPassCard
//             visitor={createdVisitor}
//             onShare={() => setShowShare(true)}
//             onDone={() => navigation.goBack()}
//           />
//         </ScrollView>

//         <ShareModal
//           visible={showShare}
//           visitor={createdVisitor}
//           onClose={() => setShowShare(false)}
//         />
//       </SafeAreaView>
//     );
//   }

//   // ── Form view ──────────────────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
//       <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Text style={styles.backText}>‹ Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Invite Visitor</Text>
//         <View style={{ width: 60 }} />
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 20 }}>
//         <View style={styles.infoBanner}>
//           <Text style={styles.infoText}>
//             🔐 Fill in visitor details and tap <Text style={{ fontWeight: '900' }}>Generate Pass</Text>.{'\n'}
//             A unique OTP will be created — share it with your visitor via WhatsApp, SMS or Copy.
//           </Text>
//         </View>

//         <Text style={styles.label}>Visitor Name *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Full name"
//           placeholderTextColor="#94A3B8"
//           value={form.name}
//           onChangeText={t => setForm(f => ({ ...f, name: t }))}
//         />

//         <Text style={styles.label}>Phone Number</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Mobile number (for WhatsApp / SMS)"
//           keyboardType="phone-pad"
//           placeholderTextColor="#94A3B8"
//           value={form.phone}
//           onChangeText={t => setForm(f => ({ ...f, phone: t }))}
//         />

//         <Text style={styles.label}>Purpose of Visit</Text>
//         <View style={styles.purposeGrid}>
//           {PURPOSES.map(p => (
//             <TouchableOpacity
//               key={p}
//               style={[styles.chip, form.purpose === p && styles.chipActive]}
//               onPress={() => setForm(f => ({ ...f, purpose: p }))}
//             >
//               <Text style={[styles.chipText, form.purpose === p && styles.chipTextActive]}>{p}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Text style={styles.label}>Vehicle Number (optional)</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="e.g. TS09AB1234"
//           autoCapitalize="characters"
//           placeholderTextColor="#94A3B8"
//           value={form.vehicleNumber}
//           onChangeText={t => setForm(f => ({ ...f, vehicleNumber: t }))}
//         />

//         <TouchableOpacity
//           style={[styles.generateBtn, loading && { opacity: 0.6 }]}
//           onPress={handleSubmit}
//           disabled={loading}
//         >
//           <Text style={styles.generateBtnText}>
//             {loading ? '⏳ Generating Pass...' : '🔐 Generate Visitor Pass'}
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#0D6E6E',
//   },
//   headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', flex: 1, textAlign: 'center' },
//   backBtn: { paddingHorizontal: 8, paddingVertical: 4, minWidth: 60 },
//   backText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

//   infoBanner: {
//     backgroundColor: '#F0FDF4', borderRadius: 14, padding: 16, marginBottom: 20,
//     borderWidth: 1, borderColor: '#BBF7D0',
//   },
//   infoText: { fontSize: 13, color: '#166534', lineHeight: 20 },

//   label: { fontSize: 13, fontWeight: '800', color: '#1A2E2E', marginBottom: 6, marginTop: 4 },
//   input: {
//     backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: '#D0EEEE',
//     borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
//     fontSize: 15, color: '#1A2E2E', marginBottom: 14,
//   },

//   purposeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
//   chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E8F5F5', borderWidth: 1, borderColor: '#D0EEEE' },
//   chipActive: { backgroundColor: '#0D6E6E', borderColor: '#0D6E6E' },
//   chipText: { fontSize: 13, fontWeight: '600', color: '#3D6E6E' },
//   chipTextActive: { color: '#FFFFFF' },

//   generateBtn: {
//     backgroundColor: '#0D6E6E', borderRadius: 14, paddingVertical: 16,
//     alignItems: 'center', marginTop: 8, marginBottom: 32,
//     shadowColor: '#0D6E6E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
//   },
//   generateBtnText: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
// });




























import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TextInput, Alert, Modal, Linking, Clipboard, Platform,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { createVisitorPass } from '../../../api/visitorApi';

const PURPOSES = ['Personal Visit', 'Delivery', 'Service', 'Guest Stay', 'Official Work', 'Other'];

// ─── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({ visible, onClose, visitor }) {
  const [copied, setCopied] = useState(false);

  if (!visitor) return null;

  const shareMessage =
    `🏠 *Visitor Pass - ${visitor.hostUnit || 'Gated Community'}*\n\n` +
    `👤 Name: ${visitor.name}\n` +
    `🔑 OTP: *${visitor.otp}*\n` +
    `🎯 Purpose: ${visitor.purpose}\n\n` +
    `📌 Show this OTP to the guard at the gate for entry.\n` +
    `⏰ Valid for today only.`;

  const encodedMsg = encodeURIComponent(shareMessage);

  const handleWhatsApp = async () => {
    const phone = visitor.phone ? visitor.phone.replace(/\D/g, '') : '';
    const url = phone
      ? `whatsapp://send?phone=91${phone}&text=${encodedMsg}`
      : `whatsapp://send?text=${encodedMsg}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`https://wa.me/${phone ? '91' + phone : ''}?text=${encodedMsg}`);
      }
    } catch (e) {
      Alert.alert('WhatsApp not installed', 'Please install WhatsApp or share manually.');
    }
    onClose();
  };

  const handleSMS = async () => {
    const phone = visitor.phone ? visitor.phone.replace(/\D/g, '') : '';
    const url = Platform.OS === 'ios'
      ? `sms:${phone}&body=${encodeURIComponent(shareMessage)}`
      : `sms:${phone}?body=${encodeURIComponent(shareMessage)}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Cannot open SMS', 'Please send the OTP manually via SMS.');
    }
    onClose();
  };

  const handleEmail = async () => {
    const subject = encodeURIComponent(`Visitor Pass OTP - ${visitor.otp}`);
    const body = encodeURIComponent(shareMessage);
    const url = `mailto:?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Cannot open Email', 'Please send the OTP manually via email.');
    }
    onClose();
  };

  const handleCopy = () => {
    try {
      Clipboard.setString(shareMessage);
    } catch (e) {
      console.warn('Clipboard not available:', e);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
      Alert.alert('✅ Copied!', 'Visitor pass details copied to clipboard.');
    }, 800);
  };

  const CHANNELS = [
    { icon: '💬', label: 'WhatsApp', color: '#25D366', action: handleWhatsApp },
    { icon: '📱', label: 'SMS', color: '#3B82F6', action: handleSMS },
    { icon: '📧', label: 'Email', color: '#EF4444', action: handleEmail },
    { icon: '📋', label: 'Copy', color: '#6366F1', action: handleCopy },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ss.overlay}>
        <View style={ss.sheet}>
          <View style={ss.handle} />
          <Text style={ss.title}>📤 Share Visitor Pass</Text>

          <View style={ss.otpBox}>
            <Text style={ss.otpLabel}>VISITOR OTP</Text>
            <Text style={ss.otpValue}>{visitor.otp}</Text>
            <Text style={ss.otpHint}>Share this with {visitor.name}</Text>
          </View>

          <View style={ss.messageBubble}>
            <Text style={ss.messageText}>{shareMessage}</Text>
          </View>

          {copied ? (
            <View style={ss.sentRow}>
              <Text style={ss.sentText}>✅ Copied to clipboard!</Text>
            </View>
          ) : (
            <>
              <Text style={ss.channelLabel}>SEND VIA</Text>
              <View style={ss.channelRow}>
                {CHANNELS.map(c => (
                  <TouchableOpacity
                    key={c.label}
                    style={[ss.channelBtn, { backgroundColor: c.color + '15', borderColor: c.color + '40' }]}
                    onPress={c.action}
                  >
                    <Text style={ss.channelIcon}>{c.icon}</Text>
                    <Text style={[ss.channelText, { color: c.color }]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity style={ss.cancelBtn} onPress={onClose}>
            <Text style={ss.cancelText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const ss = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  handle: { width: 44, height: 4, backgroundColor: '#D0EEEE', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '900', color: '#1A2E2E', marginBottom: 16, textAlign: 'center' },
  otpBox: { backgroundColor: '#0D6E6E', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 14 },
  otpLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginBottom: 6 },
  otpValue: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', letterSpacing: 10, fontFamily: 'monospace' },
  otpHint: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 },
  messageBubble: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 16 },
  messageText: { fontSize: 12, color: '#166534', lineHeight: 20, fontFamily: 'monospace' },
  channelLabel: { fontSize: 11, fontWeight: '800', color: '#7A9E9E', letterSpacing: 1, marginBottom: 10, textAlign: 'center' },
  channelRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  channelBtn: { flex: 1, alignItems: 'center', borderRadius: 14, paddingVertical: 14, borderWidth: 1.5 },
  channelIcon: { fontSize: 26, marginBottom: 4 },
  channelText: { fontSize: 11, fontWeight: '800' },
  sentRow: { alignItems: 'center', paddingVertical: 20 },
  sentText: { fontSize: 16, fontWeight: '800', color: '#1A7A7A' },
  cancelBtn: { paddingVertical: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E8F5F5', marginTop: 4 },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
});

// ─── Visitor Pass Success Card ─────────────────────────────────────────────────
function VisitorPassCard({ visitor, onShare, onDone }) {
  return (
    <View style={ps.container}>
      <View style={ps.successBanner}>
        <Text style={ps.successIcon}>✅</Text>
        <Text style={ps.successTitle}>Visitor Pass Created!</Text>
        <Text style={ps.successSub}>Share the OTP with your visitor</Text>
      </View>

      <View style={ps.otpCard}>
        <Text style={ps.otpLabel}>VISITOR OTP</Text>
        <Text style={ps.otpCode}>{visitor.otp}</Text>
        <Text style={ps.otpHint}>Visitor shows this at the gate</Text>
      </View>

      <View style={ps.detailsCard}>
        {[
          { label: '👤 Name', value: visitor.name },
          { label: '📱 Phone', value: visitor.phone || '—' },
          { label: '🎯 Purpose', value: visitor.purpose },
          { label: '🏠 Your Unit', value: visitor.hostUnit || '—' },
        ].map(r => (
          <View key={r.label} style={ps.detailRow}>
            <Text style={ps.detailLabel}>{r.label}</Text>
            <Text style={ps.detailValue}>{r.value}</Text>
          </View>
        ))}
      </View>

      <View style={ps.infoBox}>
        <Text style={ps.infoText}>
          📌 The guard will ask your visitor for this OTP.{'\n'}
          Once verified and approved, you will receive a <Text style={{ fontWeight: '900' }}>Checked In</Text> notification automatically.
        </Text>
      </View>

      <TouchableOpacity style={ps.shareBtn} onPress={onShare}>
        <Text style={ps.shareBtnText}>📤 Share OTP with Visitor</Text>
      </TouchableOpacity>

      <TouchableOpacity style={ps.doneBtn} onPress={onDone}>
        <Text style={ps.doneBtnText}>← Back to Visitors</Text>
      </TouchableOpacity>
    </View>
  );
}

const ps = StyleSheet.create({
  container: { flex: 1 },
  successBanner: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#F0FDF4', marginBottom: 4 },
  successIcon: { fontSize: 48, marginBottom: 8 },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#166534' },
  successSub: { fontSize: 14, color: '#16A34A', marginTop: 4 },
  otpCard: { backgroundColor: '#0D6E6E', margin: 16, borderRadius: 20, padding: 24, alignItems: 'center' },
  otpLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.65)', letterSpacing: 2, marginBottom: 8 },
  otpCode: { fontSize: 52, fontWeight: '900', color: '#FFFFFF', letterSpacing: 12, fontFamily: 'monospace' },
  otpHint: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 8 },
  detailsCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#D0EEEE', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E8F5F5' },
  detailLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  detailValue: { fontSize: 13, color: '#1A2E2E', fontWeight: '700' },
  infoBox: { backgroundColor: '#FFFBEB', marginHorizontal: 16, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 16 },
  infoText: { fontSize: 13, color: '#92400E', lineHeight: 20 },
  shareBtn: { backgroundColor: '#0D6E6E', marginHorizontal: 16, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  shareBtnText: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  doneBtn: { marginHorizontal: 16, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#D0EEEE' },
  doneBtnText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AddVisitorScreen({ navigation }) {
  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const addVisitor = useSecurityStore(s => s.addVisitor);
  const approveVisitor = useSecurityStore(s => s.approveVisitor);

  const [form, setForm] = useState({
    name: '', phone: '', purpose: 'Personal Visit', vehicleNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [createdVisitor, setCreatedVisitor] = useState(null);
  const [showShare, setShowShare] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter the visitor name.');
      return;
    }
    setLoading(true);
    try {
      // ── Backend payload: identity fields REMOVED — server reads from JWT ──
      // VisitorPassPayloads.CreatePass only accepts:
      //   visitorName, visitorPhone, purpose, vehicleNumber
      const payload = {
        visitorName: form.name.trim(),
        visitorPhone: form.phone.trim(),
        purpose: form.purpose,
        vehicleNumber: form.vehicleNumber.trim(),
      };

      const { response, data } = await createVisitorPass(token, payload);

      if (response.ok && data) {
        // ✅ Backend success — map response to local display shape
        const visitor = {
          id: String(data.id),
          name: data.visitorName,
          phone: data.visitorPhone,
          purpose: data.purpose,
          vehicleNumber: data.vehicleNumber,
          otp: data.otp,
          qrCode: data.qrCode,
          status: data.status,
          hostUnit: data.hostUnit,
          hostResidentName: data.hostResidentName,
          createdAt: data.createdAt,
          isFromBackend: true,
          backendId: data.id,
        };
        // Mirror into local store so VisitorListScreen shows it immediately
        const localVis = addVisitor({
          ...form,
          hostUnit: data.hostUnit || user?.unit || 'A-101',
          hostResidentId: user?.id || 'res1',
          hostResidentName: data.hostResidentName || user?.name || 'Resident',
          _backendOtp: data.otp,
          _backendId: data.id,
        });
        approveVisitor(localVis.id, user?.id || 'res1');
        setCreatedVisitor(visitor);
      } else {
        // ⚡ Backend unavailable — graceful local fallback
        console.warn('Backend unavailable, using local store fallback');
        const visitor = addVisitor({
          ...form,
          hostUnit: user?.unit || 'A-101',
          hostResidentId: user?.id || 'res1',
          hostResidentName: user?.name || 'Resident',
        });
        approveVisitor(visitor.id, user?.id || 'res1');
        setCreatedVisitor({ ...visitor, hostUnit: user?.unit || 'A-101' });
      }
    } catch (e) {
      // ⚡ Network error — local fallback
      const visitor = addVisitor({
        ...form,
        hostUnit: user?.unit || 'A-101',
        hostResidentId: user?.id || 'res1',
        hostResidentName: user?.name || 'Resident',
      });
      approveVisitor(visitor.id, user?.id || 'res1');
      setCreatedVisitor({ ...visitor, hostUnit: user?.unit || 'A-101' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCreatedVisitor(null);
    setForm({ name: '', phone: '', purpose: 'Personal Visit', vehicleNumber: '' });
  };

  // ── Pass created → show pass view ─────────────────────────────────────────
  if (createdVisitor) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReset} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visitor Pass</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView>
          <VisitorPassCard
            visitor={createdVisitor}
            onShare={() => setShowShare(true)}
            onDone={() => navigation.goBack()}
          />
        </ScrollView>

        <ShareModal
          visible={showShare}
          visitor={createdVisitor}
          onClose={() => setShowShare(false)}
        />
      </SafeAreaView>
    );
  }

  // ── Form view ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Visitor</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            🔐 Fill in visitor details and tap <Text style={{ fontWeight: '900' }}>Generate Pass</Text>.{'\n'}
            A unique OTP will be created — share it with your visitor via WhatsApp, SMS or Copy.
          </Text>
        </View>

        <Text style={styles.label}>Visitor Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#94A3B8"
          value={form.name}
          onChangeText={t => setForm(f => ({ ...f, name: t }))}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Mobile number (for WhatsApp / SMS)"
          keyboardType="phone-pad"
          placeholderTextColor="#94A3B8"
          value={form.phone}
          onChangeText={t => setForm(f => ({ ...f, phone: t }))}
        />

        <Text style={styles.label}>Purpose of Visit</Text>
        <View style={styles.purposeGrid}>
          {PURPOSES.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, form.purpose === p && styles.chipActive]}
              onPress={() => setForm(f => ({ ...f, purpose: p }))}
            >
              <Text style={[styles.chipText, form.purpose === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Vehicle Number (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. TS09AB1234"
          autoCapitalize="characters"
          placeholderTextColor="#94A3B8"
          value={form.vehicleNumber}
          onChangeText={t => setForm(f => ({ ...f, vehicleNumber: t }))}
        />

        <TouchableOpacity
          style={[styles.generateBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.generateBtnText}>
            {loading ? '⏳ Generating Pass...' : '🔐 Generate Visitor Pass'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#0D6E6E',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', flex: 1, textAlign: 'center' },
  backBtn: { paddingHorizontal: 8, paddingVertical: 4, minWidth: 60 },
  backText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  infoBanner: {
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  infoText: { fontSize: 13, color: '#166534', lineHeight: 20 },

  label: { fontSize: 13, fontWeight: '800', color: '#1A2E2E', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: '#D0EEEE',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: '#1A2E2E', marginBottom: 14,
  },

  purposeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E8F5F5', borderWidth: 1, borderColor: '#D0EEEE' },
  chipActive: { backgroundColor: '#0D6E6E', borderColor: '#0D6E6E' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#3D6E6E' },
  chipTextActive: { color: '#FFFFFF' },

  generateBtn: {
    backgroundColor: '#0D6E6E', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8, marginBottom: 32,
    shadowColor: '#0D6E6E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  generateBtnText: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
});
