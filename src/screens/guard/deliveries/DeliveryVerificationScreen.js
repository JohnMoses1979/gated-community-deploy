// /**
//  * DeliveryVerificationScreen.js — REBUILT FROM SCRATCH
//  *
//  * ❌ REPLACES: DeliveryEntryScreen.js (manual form with no OTP validation at all)
//  *
//  * ✅ NEW:
//  *   - OTP + QR toggle on same screen (per your answer)
//  *   - Guard MUST verify OTP/QR before entry is allowed
//  *   - Reads pending deliveries from securityStore
//  *   - verifyDeliveryOTP() / verifyDeliveryQR() → updates status to OTP_VERIFIED
//  *   - markDelivered() → checkout flow
//  *   - Shows all delivery passes pending + in-progress
//  */

// import React, { useEffect, useState } from 'react';
// import {
//   Alert,
//   FlatList,
//   Modal,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { useAuthStore } from '../../../store/AuthStore';
// import { useSecurityStore } from '../../../store/securityStore';
// import useAppStore from '../../../store/appStore';
// import { useTheme } from '../../../hooks/useTheme';
// import {
//   fetchPendingDeliveries,
//   verifyDeliveryOtp,
//   markDeliveryDelivered,
// } from '../../../services/deliveryApi';

// // ─── Mode Toggle ──────────────────────────────────────────────────────────────
// function ModeToggle({ mode, onChange }) {
//   return (
//     <View style={styles.modeToggle}>
//       {['otp', 'qr'].map(m => (
//         <TouchableOpacity
//           key={m}
//           style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
//           onPress={() => onChange(m)}
//         >
//           <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
//             {m === 'otp' ? '🔢 Enter OTP' : '📱 Scan QR'}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }

// // ─── Delivery Status Badge ────────────────────────────────────────────────────
// const STATUS_META = {
//   PENDING: { label: 'Pending', color: '#E65100', bg: '#FEF3C7' },
//   OTP_VERIFIED: { label: 'OTP Verified', color: '#1A7A7A', bg: '#CCFBF1' },
//   CHECKED_IN: { label: 'Inside', color: '#1A7A7A', bg: '#DBEAFE' },
//   DELIVERED: { label: 'Delivered', color: '#064E3B', bg: '#D1FAE5' },
//   CHECKED_OUT: { label: 'Checked Out', color: '#7A9E9E', bg: '#F1F5F9' },
// };

// function DeliveryCard({ delivery, onMarkDelivered }) {
//   const meta = STATUS_META[delivery.status] || STATUS_META.PENDING;
//   return (
//     <View style={styles.delivCard}>
//       <View style={styles.delivCardHeader}>
//         <View style={styles.delivIcon}>
//           <Text style={{ fontSize: 22 }}>
//             {{ 'Amazon': '📦', 'Swiggy': '🍔', 'Zomato': '🍕', 'Flipkart': '🛍️', 'BigBasket': '🥦' }[delivery.provider] || '📦'}
//           </Text>
//         </View>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.delivName}>{delivery.provider}</Text>
//           <Text style={styles.delivSub}>{delivery.deliveryPersonName} · {delivery.deliveryPersonPhone}</Text>
//         </View>
//         <View style={[styles.delivBadge, { backgroundColor: meta.bg }]}>
//           <Text style={[styles.delivBadgeText, { color: meta.color }]}>{meta.label}</Text>
//         </View>
//       </View>

//       <View style={styles.delivDetails}>
//         <View style={styles.detailRow}>
//           <Text style={styles.detailLabel}>Deliver to</Text>
//           <Text style={styles.detailValue}>{delivery.hostUnit} · {delivery.hostResidentName}</Text>
//         </View>
//         <View style={styles.detailRow}>
//           <Text style={styles.detailLabel}>Created</Text>
//           <Text style={styles.detailValue}>{new Date(delivery.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
//         </View>
//         {delivery.checkedInAt && (
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Entered at</Text>
//             <Text style={styles.detailValue}>{new Date(delivery.checkedInAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
//           </View>
//         )}
//       </View>

//       {(delivery.status === 'OTP_VERIFIED' || delivery.status === 'CHECKED_IN') && (
//         <TouchableOpacity style={styles.deliveredBtn} onPress={() => onMarkDelivered(delivery)}>
//           <Text style={styles.deliveredBtnText}>✅ Mark Delivered & Checkout</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// // ─── QR Simulator ─────────────────────────────────────────────────────────────
// function QRScanSimulator({ deliveries, onScan, onClose }) {
//   const pending = deliveries.filter(d => d.status === 'PENDING');
//   return (
//     <Modal visible transparent animationType="slide">
//       <View style={styles.qrOverlay}>
//         <View style={styles.qrModal}>
//           <View style={styles.qrHeader}>
//             <Text style={styles.qrTitle}>📱 QR Scanner</Text>
//             <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 22, color: '#64748B' }}>✕</Text></TouchableOpacity>
//           </View>
//           <View style={styles.qrViewfinder}>
//             <View style={styles.qrC1} /><View style={styles.qrC2} />
//             <View style={styles.qrC3} /><View style={styles.qrC4} />
//             <Text style={styles.qrHint}>Point camera at delivery QR code</Text>
//           </View>
//           <Text style={styles.qrOrLabel}>— or tap a pending delivery —</Text>
//           <FlatList
//             data={pending}
//             keyExtractor={i => i.id}
//             style={{ maxHeight: 220 }}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.qrItem}
//                 onPress={() => onScan(item.qrCode || `DELIVERY|${item.id}|${item.otp || ''}`)}
//               >
//                 <Text style={styles.qrItemName}>{item.provider} · {item.deliveryPersonName}</Text>
//                 <Text style={styles.qrItemSub}>For {item.hostUnit}</Text>
//               </TouchableOpacity>
//             )}
//             ListEmptyComponent={<Text style={styles.qrEmpty}>No pending deliveries</Text>}
//           />
//         </View>
//       </View>
//     </Modal>
//   );
// }

// // ─── Marketplace Delivery Section ────────────────────────────────────────────
// function MarketplaceDeliverySection() {
//   const marketplaceOrders = useAppStore(s => s.marketplaceOrders);
//   const verifyOrderOTP = useAppStore(s => s.verifyOrderOTP);

//   // Guard sees orders in 'assigned_delivery' status — partner assigned, waiting at gate for OTP
//   // After guard verifies OTP, verifyOrderOTP() moves them to out_for_delivery + otpVerified=true
//   const pendingMktOrders = marketplaceOrders.filter(
//     o => o.status === 'assigned_delivery'
//   );
//   // Already verified — delivery partner is inside community
//   const verifiedMktOrders = marketplaceOrders.filter(
//     o => o.status === 'out_for_delivery' && o.otpVerified
//   );

//   const [otpInputs, setOtpInputs] = useState({});
//   const [results, setResults] = useState({});

//   const handleVerify = (order) => {
//     const otp = (otpInputs[order.id] || '').trim();
//     if (otp.length < 4) {
//       Alert.alert('Invalid OTP', 'Please enter the 6-digit marketplace delivery OTP');
//       return;
//     }
//     const res = verifyOrderOTP(order.id, otp);
//     if (!res.ok) {
//       setResults(prev => ({ ...prev, [order.id]: { ok: false } }));
//       Alert.alert('❌ Wrong OTP', 'The OTP does not match this order. Please check and try again.');
//       return;
//     }
//     setResults(prev => ({ ...prev, [order.id]: { ok: true } }));
//     setOtpInputs(prev => ({ ...prev, [order.id]: '' }));
//     Alert.alert(
//       '✅ Entry Allowed',
//       `Marketplace delivery for ${order.residentName} (Unit ${order.unit}) has been verified.\nThe delivery partner may now enter the community.`
//     );
//   };

//   return (
//     <View>
//       {/* Mandatory notice */}
//       <View style={styles.mandatoryBanner}>
//         <Text style={styles.mandatoryText}>
//           🛒 Marketplace orders require the 6-digit OTP from the resident's order confirmation before the delivery partner can enter
//         </Text>
//       </View>

//       {pendingMktOrders.length === 0 && verifiedMktOrders.length === 0 && (
//         <View style={styles.emptyState}>
//           <Text style={{ fontSize: 40 }}>🛒</Text>
//           <Text style={styles.emptyText}>No marketplace deliveries pending</Text>
//         </View>
//       )}

//       {pendingMktOrders.length > 0 && (
//         <>
//           <Text style={styles.sectionLabel}>PENDING OTP VERIFICATION ({pendingMktOrders.length})</Text>
//           {pendingMktOrders.map(order => (
//             <View key={order.id} style={styles.mktCard}>
//               {/* Order header */}
//               <View style={styles.mktCardHeader}>
//                 <View style={styles.mktIcon}>
//                   <Text style={{ fontSize: 22 }}>🛒</Text>
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.mktOrderId}>Order #{order.id}</Text>
//                   <Text style={styles.mktSub}>
//                     {order.residentName} · Unit {order.unit}
//                   </Text>
//                 </View>
//                 <View style={[styles.delivBadge, { backgroundColor: '#FFFFFF' }]}>
//                   <Text style={[styles.delivBadgeText, { color: '#E65100' }]}>OTP Needed</Text>
//                 </View>
//               </View>

//               {/* Delivery partner info */}
//               {order.deliveryPartnerName && (
//                 <View style={styles.mktDetails}>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Delivery Partner</Text>
//                     <Text style={styles.detailValue}>{order.deliveryPartnerName}</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Items</Text>
//                     <Text style={styles.detailValue}>{order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.total}</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Resident Unit</Text>
//                     <Text style={styles.detailValue}>{order.unit}</Text>
//                   </View>
//                 </View>
//               )}

//               {/* OTP input */}
//               <View style={styles.otpRow}>
//                 <TextInput
//                   style={[styles.otpInput, { fontSize: 16, letterSpacing: 3 }]}
//                   placeholder="Enter 6-digit OTP"
//                   placeholderTextColor="#94A3B8"
//                   value={otpInputs[order.id] || ''}
//                   onChangeText={val => setOtpInputs(prev => ({ ...prev, [order.id]: val }))}
//                   keyboardType="number-pad"
//                   maxLength={6}
//                 />
//                 <TouchableOpacity
//                   style={[styles.verifyBtn, { backgroundColor: '#1A7A7A' }]}
//                   onPress={() => handleVerify(order)}
//                 >
//                   <Text style={styles.verifyBtnText}>Allow Entry</Text>
//                 </TouchableOpacity>
//               </View>

//               {/* Show error feedback */}
//               {results[order.id] && !results[order.id].ok && (
//                 <Text style={{ color: '#C62828', fontSize: 12, marginTop: 6, fontWeight: '700' }}>
//                   ❌ Wrong OTP. Please ask the resident to share the correct OTP.
//                 </Text>
//               )}
//             </View>
//           ))}
//         </>
//       )}

//       {verifiedMktOrders.length > 0 && (
//         <>
//           <Text style={styles.sectionLabel}>INSIDE COMMUNITY — MARKETPLACE ({verifiedMktOrders.length})</Text>
//           {verifiedMktOrders.map(order => (
//             <View key={order.id} style={[styles.mktCard, { borderColor: '#86EFAC' }]}>
//               <View style={styles.mktCardHeader}>
//                 <View style={[styles.mktIcon, { backgroundColor: '#FFFFFF' }]}>
//                   <Text style={{ fontSize: 22 }}>✅</Text>
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.mktOrderId}>Order #{order.id}</Text>
//                   <Text style={styles.mktSub}>{order.residentName} · Unit {order.unit}</Text>
//                   {order.deliveryPartnerName && (
//                     <Text style={[styles.mktSub, { color: '#1A7A7A' }]}>
//                       🏍️ {order.deliveryPartnerName} — inside
//                     </Text>
//                   )}
//                 </View>
//                 <View style={[styles.delivBadge, { backgroundColor: '#FFFFFF' }]}>
//                   <Text style={[styles.delivBadgeText, { color: '#064E3B' }]}>✓ Verified</Text>
//                 </View>
//               </View>
//             </View>
//           ))}
//         </>
//       )}
//     </View>
//   );
// }

// // ─── Main ─────────────────────────────────────────────────────────────────────
// export default function DeliveryVerificationScreen({ navigation }) {
//   const theme = useTheme();
//   const user = useAuthStore(s => s.user);
//   const setStoreDeliveries = useSecurityStore(s => s.setDeliveries);
//   const logEntry = useSecurityStore(s => s.logEntry);

//   // Backend-driven state
//   const [deliveries, setDeliveries] = useState([]);
//   const [loadingDeliveries, setLoadingDeliveries] = useState(true);

//   useEffect(() => {
//     fetchPendingDeliveries()
//       .then(result => {
//         if (result.ok) {
//           const normalized = (result.data || []).map(d => ({
//             ...d,
//             status: (d.status || '').toUpperCase(),
//           }));
//           setDeliveries(normalized);
//           setStoreDeliveries(normalized);
//         }
//       })
//       .finally(() => setLoadingDeliveries(false));
//   }, [setStoreDeliveries]);
//   // const deliveries = useSecurityStore(s => s.deliveries);
//   // const verifyDeliveryOTP = useSecurityStore(s => s.verifyDeliveryOTP);
//   // const verifyDeliveryQR = useSecurityStore(s => s.verifyDeliveryQR);
//   // const markDelivered = useSecurityStore(s => s.markDelivered);
//   const checkBlacklist = useSecurityStore(s => s.checkBlacklist);

//   // Marketplace pending count for badge — orders waiting at gate for OTP
//   const marketplaceOrders = useAppStore(s => s.marketplaceOrders);
//   const pendingMktCount = marketplaceOrders.filter(
//     o => o.status === 'assigned_delivery'
//   ).length;

//   const [mode, setMode] = useState('otp');
//   const [otpInput, setOtpInput] = useState('');
//   const [otpInputs, setOtpInputs] = useState({});  // per-job OTP for maintenance tab
//   const [result, setResult] = useState(null);  // { ok, delivery, error }
//   const [showQR, setShowQR] = useState(false);
//   const [tab, setTab] = useState('verify'); // 'verify' | 'all' | 'marketplace' | 'maintenance'

//   const maintenanceRequests = useAppStore(s => s.maintenanceRequests);
//   const guardValidateMaintenanceOTP = useAppStore(s => s.guardValidateMaintenanceOTP);
//   const pendingMaintenanceJobs = maintenanceRequests.filter(r => r.status === 'approved_to_start');
//   const activeMaintenanceJobs = maintenanceRequests.filter(r => r.status === 'work_in_progress');
//   const maintenancePendingCount = pendingMaintenanceJobs.length;

//   const guardId = user?.id || 'sec1';

//   const pendingDeliveries = deliveries.filter(d => d.status === 'PENDING');
//   const activeDeliveries = deliveries.filter(d => ['OTP_VERIFIED', 'CHECKED_IN'].includes(d.status));

//   // REPLACE entire handleOTPVerify:
//   const handleOTPVerify = async () => {
//     const otp = otpInput.trim();
//     if (otp.length < 4) {
//       Alert.alert('Invalid OTP', 'Please enter the delivery OTP');
//       return;
//     }

//     const res = await verifyDeliveryOtp(otp, guardId);
//     if (!res.ok) {
//       setResult({
//         ok: false,
//         error: res.error || 'No pending delivery found with this OTP.',
//       });
//       return;
//     }

//     // Check blacklist (still uses local store — no change needed)
//     const bl = checkBlacklist(
//       res.data.deliveryPersonName,
//       res.data.deliveryPersonPhone
//     );
//     if (bl) {
//       Alert.alert(
//         '🚫 BLACKLISTED',
//         `${res.data.deliveryPersonName} is on the blacklist.\n\nReason: ${bl.reason}`
//       );
//       return;
//     }

//     // Update screen + global store so dashboard counts stay in sync
//     const nextDeliveries = deliveries.map(d =>
//       String(d.id) === String(res.data.id) ? { ...d, status: 'OTP_VERIFIED' } : d
//     );
//     setDeliveries(nextDeliveries);
//     setStoreDeliveries(nextDeliveries);
//     logEntry(
//       'DELIVERY',
//       res.data.id,
//       res.data.deliveryPersonName || res.data.provider || 'Delivery',
//       res.data.hostUnit || '-',
//       'OTP_VERIFIED',
//       'Main Gate',
//       guardId,
//       {
//         hostResidentId: res.data.hostResidentId || '',
//         hostResidentName: res.data.hostResidentName || '',
//         provider: res.data.provider || '',
//       }
//     );

//     setResult({ ok: true, delivery: res.data });
//     setOtpInput('');
//     Alert.alert(
//       '✅ Delivery Verified',
//       `${res.data.provider} delivery for ${res.data.hostUnit} has been allowed entry.`
//     );
//   };
//   // const handleOTPVerify = () => {
//   //   const otp = otpInput.trim();
//   //   if (otp.length < 4) { Alert.alert('Invalid OTP', 'Please enter the delivery OTP'); return; }

//   //   const res = verifyDeliveryOTP(otp, guardId);
//   //   if (!res.ok) {
//   //     setResult({ ok: false, error: 'No pending delivery found with this OTP. It may already be verified or expired.' });
//   //     return;
//   //   }

//   //   const bl = checkBlacklist(res.data.deliveryPersonName, res.data.deliveryPersonPhone);
//   //   if (bl) {
//   //     Alert.alert('🚫 BLACKLISTED', `${res.data.deliveryPersonName} is on the blacklist.\n\nReason: ${bl.reason}`);
//   //     return;
//   //   }

//   //   setResult({ ok: true, delivery: res.data });
//   //   setOtpInput('');
//   //   Alert.alert('✅ Delivery Verified', `${res.data.provider} delivery for ${res.data.hostUnit} has been allowed entry.`);
//   // };

//     const handleQRScan = async (qrData) => {
//     setShowQR(false);
//     const qrText = String(qrData || '');
//     const parts = qrText.split('|');
//     const otp = parts[0] === 'DELIVERY' ? parts[2] : qrText;
//     const res = await verifyDeliveryOtp(otp, guardId);
//     if (!res.ok) {
//       setResult({ ok: false, error: 'Invalid QR code. Delivery not found or already processed.' });
//       return;
//     }
//     const bl = checkBlacklist(res.data.deliveryPersonName, res.data.deliveryPersonPhone);
//     if (bl) {
//       Alert.alert('BLACKLISTED', `${res.data.deliveryPersonName} is on the blacklist.`);
//       return;
//     }
//     const nextDeliveries = deliveries.map(d =>
//       String(d.id) === String(res.data.id) ? { ...d, status: 'OTP_VERIFIED' } : d
//     );
//     setDeliveries(nextDeliveries);
//     setStoreDeliveries(nextDeliveries);
//     logEntry(
//       'DELIVERY',
//       res.data.id,
//       res.data.deliveryPersonName || res.data.provider || 'Delivery',
//       res.data.hostUnit || '-',
//       'QR_VERIFIED',
//       'Main Gate',
//       guardId,
//       {
//         hostResidentId: res.data.hostResidentId || '',
//         hostResidentName: res.data.hostResidentName || '',
//         provider: res.data.provider || '',
//       }
//     );
//     setResult({ ok: true, delivery: res.data });
//     Alert.alert('QR Verified', `Delivery for ${res.data.hostUnit} allowed entry.`);
//   };

//   // REPLACE entire handleMarkDelivered:
//     const handleMarkDelivered = (delivery) => {
//     Alert.alert(
//       'Mark Delivered',
//       `Confirm ${delivery.provider} delivery to ${delivery.hostUnit} is complete and person has exited?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Confirm',
//           onPress: async () => {
//             const res = await markDeliveryDelivered(delivery.id, guardId);
//             if (!res.ok) {
//               Alert.alert('Error', res.error);
//               return;
//             }
//             const nextDeliveries = deliveries.filter(d => String(d.id) !== String(delivery.id));
//             setDeliveries(nextDeliveries);
//             setStoreDeliveries(nextDeliveries);
//             logEntry(
//               'DELIVERY',
//               delivery.id,
//               delivery.deliveryPersonName || delivery.provider || 'Delivery',
//               delivery.hostUnit || '-',
//               'CHECK_OUT',
//               'Main Gate',
//               guardId,
//               {
//                 hostResidentId: delivery.hostResidentId || '',
//                 hostResidentName: delivery.hostResidentName || '',
//                 provider: delivery.provider || '',
//               }
//             );
//             setResult(null);
//             Alert.alert('Done', 'Delivery marked complete. Person checked out.');
//           },
//         },
//       ]
//     );
//   };

//   // const handleMarkDelivered = (delivery) => {
//   //   Alert.alert('Mark Delivered', `Confirm ${delivery.provider} delivery to ${delivery.hostUnit} is complete and person has exited?`, [
//   //     { text: 'Cancel', style: 'cancel' },
//   //     {
//   //       text: 'Confirm', onPress: () => {
//   //         markDelivered(delivery.id, guardId);
//   //         setResult(null);
//   //         Alert.alert('✅ Done', 'Delivery marked complete. Person checked out.');
//   //       }
//   //     },
//   //   ]);
//   // };

//   return (
//     <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
//       <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Text style={styles.backText}>‹</Text>
//         </TouchableOpacity>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>Delivery Verification</Text>
//           <Text style={styles.headerSub}>OTP / QR gate entry</Text>
//         </View>
//         <View style={{ width: 44 }} />
//       </View>

//       {/* Sub-tabs */}
//       <View style={styles.tabBar}>
//         <TouchableOpacity style={[styles.tabItem, tab === 'verify' && styles.tabItemActive]} onPress={() => setTab('verify')}>
//           <Text style={[styles.tabText, tab === 'verify' && styles.tabTextActive]}>
//             🔍 Verify ({pendingDeliveries.length})
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.tabItem, tab === 'all' && styles.tabItemActive]} onPress={() => setTab('all')}>
//           <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>
//             📋 Active ({activeDeliveries.length})
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.tabItem, tab === 'marketplace' && styles.tabItemActive]} onPress={() => setTab('marketplace')}>
//           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//             <Text style={[styles.tabText, tab === 'marketplace' && styles.tabTextActive]}>🛒 Market</Text>
//             {pendingMktCount > 0 && (
//               <View style={styles.mktBadge}>
//                 <Text style={styles.mktBadgeText}>{pendingMktCount}</Text>
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.tabItem, tab === 'maintenance' && styles.tabItemActive]} onPress={() => setTab('maintenance')}>
//           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//             <Text style={[styles.tabText, tab === 'maintenance' && styles.tabTextActive]}>🔧 Work</Text>
//             {maintenancePendingCount > 0 && (
//               <View style={[styles.mktBadge, { backgroundColor: theme.primary }]}>
//                 <Text style={styles.mktBadgeText}>{maintenancePendingCount}</Text>
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

//         {tab === 'verify' && (
//           <>
//             {/* ⚠️ Mandatory notice */}
//             <View style={styles.mandatoryBanner}>
//               <Text style={styles.mandatoryText}>⚠️ OTP or QR verification is MANDATORY before any delivery person can enter</Text>
//             </View>

//             <ModeToggle mode={mode} onChange={(m) => { setMode(m); setResult(null); }} />

//             {mode === 'otp' && (
//               <View style={styles.card}>
//                 <Text style={styles.cardTitle}>🔢 Verify Delivery OTP</Text>
//                 <Text style={styles.cardSub}>Ask the delivery person for the OTP from the resident's delivery pass</Text>
//                 <View style={styles.otpRow}>
//                   <TextInput
//                     style={styles.otpInput}
//                     placeholder="Enter OTP"
//                     placeholderTextColor="#94A3B8"
//                     value={otpInput}
//                     onChangeText={setOtpInput}
//                     keyboardType="number-pad"
//                     maxLength={6}
//                   />
//                   <TouchableOpacity style={styles.verifyBtn} onPress={handleOTPVerify}>
//                     <Text style={styles.verifyBtnText}>Verify</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}

//             {mode === 'qr' && (
//               <View style={styles.card}>
//                 <Text style={styles.cardTitle}>📱 Verify by QR Code</Text>
//                 <Text style={styles.cardSub}>Scan the QR code from the resident's delivery pass</Text>
//                 <TouchableOpacity style={styles.scanBtn} onPress={() => setShowQR(true)}>
//                   <Text style={styles.scanBtnText}>📸 Open QR Scanner</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             {/* Result */}
//             {result && result.ok && (
//               <View style={styles.successCard}>
//                 <Text style={styles.successTitle}>✅ Verification Successful</Text>
//                 <Text style={styles.successSub}>
//                   {result.delivery.provider} · {result.delivery.deliveryPersonName}
//                 </Text>
//                 <Text style={styles.successSub}>Delivering to: {result.delivery.hostUnit}</Text>
//                 <TouchableOpacity
//                   style={styles.deliveredBtn}
//                   onPress={() => handleMarkDelivered(result.delivery)}
//                 >
//                   <Text style={styles.deliveredBtnText}>Mark Delivered & Checkout</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             {result && !result.ok && (
//               <View style={styles.errorCard}>
//                 <Text style={styles.errorTitle}>❌ Verification Failed</Text>
//                 <Text style={styles.errorSub}>{result.error}</Text>
//               </View>
//             )}

//             {/* Pending Deliveries List */}
//             {pendingDeliveries.length > 0 && (
//               <>
//                 <Text style={styles.sectionLabel}>PENDING DELIVERIES ({pendingDeliveries.length})</Text>
//                 {pendingDeliveries.map(d => (
//                   <DeliveryCard key={d.id} delivery={d} onMarkDelivered={handleMarkDelivered} />
//                 ))}
//               </>
//             )}
//           </>
//         )}

//         {tab === 'all' && (
//           <>
//             {activeDeliveries.length > 0 && (
//               <>
//                 <Text style={styles.sectionLabel}>INSIDE COMPOUND ({activeDeliveries.length})</Text>
//                 {activeDeliveries.map(d => (
//                   <DeliveryCard key={d.id} delivery={d} onMarkDelivered={handleMarkDelivered} />
//                 ))}
//               </>
//             )}
//             {activeDeliveries.length === 0 && (
//               <View style={styles.emptyState}>
//                 <Text style={{ fontSize: 48 }}>📦</Text>
//                 <Text style={styles.emptyText}>No active deliveries</Text>
//               </View>
//             )}
//           </>
//         )}

//         {/* ── Marketplace Deliveries Tab ───────────────────────────────── */}
//         {tab === 'marketplace' && <MarketplaceDeliverySection />}

//         {/* ── Maintenance Vendor Entry Tab ─────────────────────────────── */}
//         {tab === 'maintenance' && (
//           <View>
//             <View style={styles.mandatoryBanner}>
//               <Text style={styles.mandatoryText}>
//                 🔧 Vendors need admin approval before entering. Ask the vendor for the 6-digit OTP from their approval notification.
//               </Text>
//             </View>

//             {pendingMaintenanceJobs.length === 0 && activeMaintenanceJobs.length === 0 && (
//               <View style={styles.emptyState}>
//                 <Text style={{ fontSize: 40 }}>🔧</Text>
//                 <Text style={styles.emptyText}>No maintenance vendors pending entry</Text>
//               </View>
//             )}

//             {pendingMaintenanceJobs.length > 0 && (
//               <>
//                 <Text style={styles.sectionLabel}>AWAITING ENTRY ({pendingMaintenanceJobs.length})</Text>
//                 {pendingMaintenanceJobs.map(job => {
//                   const jobOtpKey = `maint_${job.id}`;
//                   return (
//                     <View key={job.id} style={styles.mktCard}>
//                       <View style={styles.mktCardHeader}>
//                         <View style={[styles.mktIcon, { backgroundColor: theme.surface }]}>
//                           <Text style={{ fontSize: 22 }}>🔧</Text>
//                         </View>
//                         <View style={{ flex: 1 }}>
//                           <Text style={styles.mktOrderId}>{job.id} — {job.category}</Text>
//                           <Text style={styles.mktSub}>{job.assignedVendorName || 'Vendor'}</Text>
//                           <Text style={styles.mktSub}>Unit {job.unit} · {job.residentName}</Text>
//                         </View>
//                         <View style={[styles.delivBadge, { backgroundColor: theme.surface }]}>
//                           <Text style={[styles.delivBadgeText, { color: theme.primary }]}>Pending Entry</Text>
//                         </View>
//                       </View>
//                       <View style={[styles.otpRow, { marginTop: 12 }]}>
//                         <TextInput
//                           style={styles.otpInput}
//                           placeholder="6-digit vendor OTP"
//                           placeholderTextColor="#94A3B8"
//                           value={otpInputs[jobOtpKey] || ''}
//                           onChangeText={v => setOtpInputs(p => ({ ...p, [jobOtpKey]: v }))}
//                           keyboardType="number-pad"
//                           maxLength={6}
//                         />
//                         <TouchableOpacity
//                           style={[styles.verifyBtn, { backgroundColor: theme.primary }]}
//                           onPress={() => {
//                             const otp = (otpInputs[jobOtpKey] || '').trim();
//                             if (otp.length < 6) {
//                               Alert.alert('Invalid OTP', 'Please enter the full 6-digit OTP');
//                               return;
//                             }
//                             const res = guardValidateMaintenanceOTP(job.id, otp);
//                             if (!res.ok) {
//                               Alert.alert('❌ Wrong OTP', 'OTP does not match. Please check with the vendor.');
//                               return;
//                             }
//                             setOtpInputs(p => ({ ...p, [jobOtpKey]: '' }));
//                             Alert.alert(
//                               '✅ Entry Allowed',
//                               `${job.assignedVendorName || 'Vendor'} is cleared to enter for ${job.category} work at Unit ${job.unit}.\n\nWork status is now In Progress.`
//                             );
//                           }}
//                         >
//                           <Text style={styles.verifyBtnText}>Allow</Text>
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   );
//                 })}
//               </>
//             )}

//             {activeMaintenanceJobs.length > 0 && (
//               <>
//                 <Text style={styles.sectionLabel}>INSIDE — WORK IN PROGRESS ({activeMaintenanceJobs.length})</Text>
//                 {activeMaintenanceJobs.map(job => (
//                   <View key={job.id} style={[styles.mktCard, { borderColor: '#86EFAC' }]}>
//                     <View style={styles.mktCardHeader}>
//                       <View style={[styles.mktIcon, { backgroundColor: theme.surface }]}>
//                         <Text style={{ fontSize: 22 }}>✅</Text>
//                       </View>
//                       <View style={{ flex: 1 }}>
//                         <Text style={styles.mktOrderId}>{job.id} — {job.category}</Text>
//                         <Text style={styles.mktSub}>{job.assignedVendorName || 'Vendor'} · Unit {job.unit}</Text>
//                         <Text style={[styles.mktSub, { color: theme.primary }]}>🔧 Work in progress</Text>
//                       </View>
//                       <View style={[styles.delivBadge, { backgroundColor: theme.surface }]}>
//                         <Text style={[styles.delivBadgeText, { color: '#064E3B' }]}>Inside</Text>
//                       </View>
//                     </View>
//                   </View>
//                 ))}
//               </>
//             )}
//           </View>
//         )}

//         <View style={{ height: 40 }} />
//       </ScrollView>

//       {showQR && (
//         <QRScanSimulator deliveries={deliveries} onScan={handleQRScan} onClose={() => setShowQR(false)} />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: '#FFFFFF' },
//   header: { backgroundColor: '#0D6E6E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 14 },
//   backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
//   backText: { color: '#FFF', fontSize: 24, fontWeight: '300', lineHeight: 28, marginTop: -1 },
//   headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
//   headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
//   tabBar: { flexDirection: 'row', backgroundColor: '#1A7A7A', borderTopWidth: 1, borderTopColor: '#2D3F5A' },
//   tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
//   tabItemActive: { borderBottomWidth: 3, borderBottomColor: '#D4AF5A' },
//   tabText: { color: '#7A9E9E', fontSize: 11, fontWeight: '600' },
//   tabTextActive: { color: '#D4AF5A', fontWeight: '800' },
//   body: { padding: 16 },
//   sectionLabel: { fontSize: 11, fontWeight: '800', color: '#7A9E9E', letterSpacing: 1, marginTop: 18, marginBottom: 10 },

//   // Marketplace tab badge
//   mktBadge: { backgroundColor: '#C62828', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
//   mktBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },

//   // Marketplace delivery cards
//   mktCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#D0EEEE' },
//   mktCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
//   mktIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
//   mktOrderId: { fontSize: 14, fontWeight: '800', color: '#1A2E2E' },
//   mktSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
//   mktDetails: { backgroundColor: '#E8F5F5', borderRadius: 10, padding: 12, gap: 8, marginBottom: 12 },

//   mandatoryBanner: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: '#E65100' },
//   mandatoryText: { fontSize: 12, fontWeight: '700', color: '#E65100' },

//   modeToggle: { flexDirection: 'row', backgroundColor: '#D0EEEE', borderRadius: 12, padding: 4, marginBottom: 14 },
//   modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
//   modeBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
//   modeBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
//   modeBtnTextActive: { color: '#1A7A7A', fontWeight: '800' },

//   card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#D0EEEE' },
//   cardTitle: { fontSize: 15, fontWeight: '800', color: '#1A2E2E', marginBottom: 4 },
//   cardSub: { fontSize: 12, color: '#64748B', marginBottom: 14 },

//   otpRow: { flexDirection: 'row', gap: 10 },
//   otpInput: { flex: 1, backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, fontWeight: '800', color: '#1A2E2E', textAlign: 'center', letterSpacing: 4 },
//   verifyBtn: { backgroundColor: '#E65100', paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
//   verifyBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
//   scanBtn: { backgroundColor: '#E65100', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
//   scanBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

//   successCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#86EFAC' },
//   successTitle: { fontSize: 15, fontWeight: '800', color: '#064E3B', marginBottom: 4 },
//   successSub: { fontSize: 13, color: '#065F46', marginBottom: 4 },
//   errorCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#FECACA' },
//   errorTitle: { fontSize: 15, fontWeight: '800', color: '#991B1B', marginBottom: 4 },
//   errorSub: { fontSize: 13, color: '#C62828' },

//   delivCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#D0EEEE' },
//   delivCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
//   delivIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
//   delivName: { fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
//   delivSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
//   delivBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
//   delivBadgeText: { fontSize: 11, fontWeight: '800' },
//   delivDetails: { backgroundColor: '#E8F5F5', borderRadius: 10, padding: 12, gap: 8 },
//   detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
//   detailLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
//   detailValue: { fontSize: 12, color: '#1A2E2E', fontWeight: '700', flex: 1, textAlign: 'right' },
//   deliveredBtn: { marginTop: 12, backgroundColor: '#1A7A7A', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
//   deliveredBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

//   emptyState: { alignItems: 'center', padding: 40, gap: 12 },
//   emptyText: { fontSize: 16, color: '#64748B', fontWeight: '600' },

//   qrOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
//   qrModal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
//   qrHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//   qrTitle: { fontSize: 18, fontWeight: '800', color: '#1A2E2E' },
//   qrViewfinder: { backgroundColor: '#000', borderRadius: 16, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
//   qrC1: { position: 'absolute', top: 10, left: 10, width: 26, height: 26, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#D4AF5A' },
//   qrC2: { position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#D4AF5A' },
//   qrC3: { position: 'absolute', bottom: 10, left: 10, width: 26, height: 26, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#D4AF5A' },
//   qrC4: { position: 'absolute', bottom: 10, right: 10, width: 26, height: 26, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#D4AF5A' },
//   qrHint: { color: '#7A9E9E', fontSize: 13 },
//   qrOrLabel: { textAlign: 'center', fontSize: 12, color: '#7A9E9E', marginBottom: 10 },
//   qrItem: { padding: 14, borderRadius: 10, backgroundColor: '#E8F5F5', marginBottom: 8, borderWidth: 1, borderColor: '#D0EEEE' },
//   qrItemName: { fontSize: 14, fontWeight: '700', color: '#1A2E2E' },
//   qrItemSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
//   qrEmpty: { textAlign: 'center', color: '#7A9E9E', padding: 20 },
// });





















































/**
 * DeliveryVerificationScreen.js — COMPLETE FIX
 *
 * What was broken and why nothing showed in the Market tab:
 *
 * PROBLEM 1 — Wrong API endpoint:
 *   fetchPendingDeliveries() called GET /api/deliveries/pending which only
 *   returns passes with status = 'PENDING'. Once a vendor marks an order
 *   "Out for Delivery", the backend creates a DeliveryPass with status PENDING
 *   — so it SHOULD appear. But if the guard has already verified the OTP
 *   (status becomes OTP_VERIFIED), it disappears from /pending.
 *   FIX: Use GET /api/deliveries/active (new endpoint) which returns
 *   PENDING + OTP_VERIFIED passes together.
 *
 * PROBLEM 2 — marketplaceOrderId might be null in JSON:
 *   Spring Boot serialises Long fields as null when unset. The frontend
 *   check `d.marketplaceOrderId != null` works correctly for this.
 *   BUT: if the backend hasn't actually created the DeliveryPass yet
 *   (vendor hasn't clicked "Out for Delivery"), there's nothing to show.
 *   The debug logs added to deliveryApi.js will confirm whether any passes
 *   with marketplaceOrderId come back from the server.
 *
 * PROBLEM 3 — Security rule blocks the new endpoint:
 *   SecurityConfig only allowed ROLE_SECURITY for /pending and /verify-otp.
 *   Added /active to that same rule (see SecurityConfig note below).
 *
 * WHAT TO DO:
 *   Step 1: Deploy the backend changes (new /active endpoint + repo method).
 *   Step 2: Replace deliveryApi.js with deliveryApi_fixed.js.
 *   Step 3: Replace DeliveryVerificationScreen.js with this file.
 *   Step 4: Open Metro logs, go to Market tab, check [deliveryApi] logs.
 *           If passes appear but marketplaceOrderId = null → backend isn't
 *           setting the field (check createFromMarketplaceOrder is called).
 *           If no passes appear → vendor hasn't marked "Out for Delivery" yet.
 *
 * SECURITYCONFIG NOTE — add /deliveries/active to guard-allowed paths:
 *   .requestMatchers(HttpMethod.GET, "/api/deliveries/pending").hasRole("SECURITY")
 *   .requestMatchers(HttpMethod.GET, "/api/deliveries/active").hasRole("SECURITY")   ← ADD
 *   .requestMatchers("/api/deliveries/verify-otp", "/api/deliveries/*\/delivered").hasRole("SECURITY")
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useTheme } from '../../../hooks/useTheme';
import {
  fetchPendingDeliveries,
  verifyDeliveryOtp,
  markDeliveryDelivered,
} from '../../../services/deliveryApi';

// ─── Mode Toggle ──────────────────────────────────────────────────────────────
function ModeToggle({ mode, onChange }) {
  return (
    <View style={styles.modeToggle}>
      {['otp', 'qr'].map(m => (
        <TouchableOpacity
          key={m}
          style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
          onPress={() => onChange(m)}
        >
          <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
            {m === 'otp' ? '🔢 Enter OTP' : '📱 Scan QR'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Status meta ──────────────────────────────────────────────────────────────
const STATUS_META = {
  PENDING:      { label: 'Pending',      color: '#E65100', bg: '#FEF3C7' },
  OTP_VERIFIED: { label: 'OTP Verified', color: '#1A7A7A', bg: '#CCFBF1' },
  CHECKED_IN:   { label: 'Inside',       color: '#1A7A7A', bg: '#DBEAFE' },
  DELIVERED:    { label: 'Delivered',    color: '#064E3B', bg: '#D1FAE5' },
  CHECKED_OUT:  { label: 'Checked Out',  color: '#7A9E9E', bg: '#F1F5F9' },
};

// ─── Delivery Card ────────────────────────────────────────────────────────────
function DeliveryCard({ delivery, onMarkDelivered }) {
  const meta = STATUS_META[delivery.status] || STATUS_META.PENDING;
  const providerEmoji =
    { Amazon: '📦', Swiggy: '🍔', Zomato: '🍕', Flipkart: '🛍️', BigBasket: '🥦' }[delivery.provider] || '📦';

  return (
    <View style={styles.delivCard}>
      <View style={styles.delivCardHeader}>
        <View style={styles.delivIcon}>
          <Text style={{ fontSize: 22 }}>{providerEmoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.delivName}>{delivery.provider}</Text>
          <Text style={styles.delivSub}>
            {delivery.deliveryPersonName}
            {delivery.deliveryPersonPhone ? ` · ${delivery.deliveryPersonPhone}` : ''}
          </Text>
        </View>
        <View style={[styles.delivBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.delivBadgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.delivDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Deliver to</Text>
          <Text style={styles.detailValue}>{delivery.hostUnit} · {delivery.hostResidentName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created</Text>
          <Text style={styles.detailValue}>
            {new Date(delivery.createdAt).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {(delivery.status === 'OTP_VERIFIED' || delivery.status === 'CHECKED_IN') && (
        <TouchableOpacity style={styles.deliveredBtn} onPress={() => onMarkDelivered(delivery)}>
          <Text style={styles.deliveredBtnText}>✅ Mark Delivered & Checkout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── QR Simulator ────────────────────────────────────────────────────────────
function QRScanSimulator({ deliveries, onScan, onClose }) {
  const pending = deliveries.filter(d => d.status === 'PENDING');
  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.qrOverlay}>
        <View style={styles.qrModal}>
          <View style={styles.qrHeader}>
            <Text style={styles.qrTitle}>📱 QR Scanner</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 22, color: '#64748B' }}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.qrViewfinder}>
            <View style={styles.qrC1} /><View style={styles.qrC2} />
            <View style={styles.qrC3} /><View style={styles.qrC4} />
            <Text style={styles.qrHint}>Point camera at delivery QR code</Text>
          </View>
          <Text style={styles.qrOrLabel}>— or tap a pending delivery —</Text>
          <FlatList
            data={pending}
            keyExtractor={i => String(i.id)}
            style={{ maxHeight: 220 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.qrItem}
                onPress={() => onScan(item.qrCode || `DELIVERY|${item.id}|${item.otp || ''}`)}
              >
                <Text style={styles.qrItemName}>{item.provider} · {item.deliveryPersonName}</Text>
                <Text style={styles.qrItemSub}>For {item.hostUnit}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.qrEmpty}>No pending deliveries</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Marketplace Delivery Section ─────────────────────────────────────────────
/**
 * Identifies marketplace passes by marketplaceOrderId != null.
 * This is set by DeliveryPassService.createFromMarketplaceOrder() on the backend
 * when a vendor marks an order "Out for Delivery".
 *
 * If nothing shows here:
 *   1. Check Metro logs for "[deliveryApi] pass[N]" entries.
 *   2. If no passes at all → vendor hasn't clicked "Out for Delivery" yet.
 *   3. If passes show but marketplaceOrderId is null → backend bug in
 *      createFromMarketplaceOrder() not setting the field.
 *   4. If marketplaceOrderId is set but still empty → check status filter below.
 */
function MarketplaceDeliverySection({ allDeliveries, onDeliveriesChange, guardId, logEntry }) {
  const [otpInputs, setOtpInputs] = useState({});
  const [results,   setResults]   = useState({});
  const [verifying, setVerifying] = useState({});

  // ── Identify marketplace passes ───────────────────────────────────────────
  // marketplaceOrderId is a Long on backend: non-null non-zero = marketplace pass
  const isMktPass = (d) => {
    const mid = d.marketplaceOrderId;
    return mid !== null && mid !== undefined && mid !== 0 && mid !== '0';
  };

  const pendingMkt  = allDeliveries.filter(d => isMktPass(d) && d.status === 'PENDING');
  const verifiedMkt = allDeliveries.filter(d => isMktPass(d) &&
    (d.status === 'OTP_VERIFIED' || d.status === 'CHECKED_IN'));

  // ── DEBUG helper: show in UI what we got from backend ────────────────────
  // Remove this block once confirmed working
  const allMkt   = allDeliveries.filter(isMktPass);
  const totalAll = allDeliveries.length;

  // ── OTP verify ────────────────────────────────────────────────────────────
  const handleVerify = async (delivery) => {
    const otp = (otpInputs[delivery.id] || '').trim();
    if (otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP from the resident\'s order screen');
      return;
    }
    setVerifying(prev => ({ ...prev, [delivery.id]: true }));
    const res = await verifyDeliveryOtp(otp, guardId);
    setVerifying(prev => ({ ...prev, [delivery.id]: false }));

    if (!res.ok) {
      setResults(prev => ({ ...prev, [delivery.id]: { ok: false } }));
      Alert.alert('❌ Wrong OTP', 'Ask the resident to open their order screen and share the exact OTP shown there.');
      return;
    }

    setResults(prev => ({ ...prev, [delivery.id]: { ok: true } }));
    setOtpInputs(prev => ({ ...prev, [delivery.id]: '' }));

    const updated = allDeliveries.map(d =>
      String(d.id) === String(res.data.id) ? { ...d, status: 'OTP_VERIFIED' } : d
    );
    onDeliveriesChange(updated);

    logEntry(
      'DELIVERY', res.data.id,
      res.data.deliveryPersonName || res.data.provider || 'Delivery',
      res.data.hostUnit || '-', 'OTP_VERIFIED', 'Main Gate', guardId,
      {
        hostResidentId:   res.data.hostResidentId   || '',
        hostResidentName: res.data.hostResidentName || '',
        provider:         res.data.provider         || '',
      },
    );

    Alert.alert(
      '✅ Entry Allowed',
      `Marketplace delivery for ${res.data.hostResidentName} (Unit ${res.data.hostUnit}) verified. Delivery person may enter.`,
    );
  };

  return (
    <View>
      {/* Info banner */}
      <View style={styles.mandatoryBanner}>
        <Text style={styles.mandatoryText}>
          🛒 Marketplace orders: ask the resident for the OTP on their order tracking screen, then tap Allow Entry.
        </Text>
      </View>


      {/* Empty state */}
      {pendingMkt.length === 0 && verifiedMkt.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 40 }}>🛒</Text>
          <Text style={styles.emptyText}>No marketplace deliveries pending</Text>
          <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 6, paddingHorizontal: 24 }}>
            Appears once a vendor marks an order "Out for Delivery". Pull to refresh.
          </Text>
        </View>
      )}

      {/* PENDING passes */}
      {pendingMkt.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>PENDING OTP VERIFICATION ({pendingMkt.length})</Text>
          {pendingMkt.map(delivery => (
            <View key={delivery.id} style={styles.mktCard}>
              <View style={styles.mktCardHeader}>
                <View style={styles.mktIcon}>
                  <Text style={{ fontSize: 22 }}>🛒</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mktOrderId}>{delivery.provider}</Text>
                  <Text style={styles.mktSub}>
                    For: {delivery.hostResidentName || '—'} · Unit {delivery.hostUnit || '—'}
                  </Text>
                </View>
                <View style={[styles.delivBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.delivBadgeText, { color: '#E65100' }]}>OTP Needed</Text>
                </View>
              </View>

              <View style={styles.mktDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Delivery Person</Text>
                  <Text style={styles.detailValue}>
                    {delivery.deliveryPersonName || 'Not assigned'}
                  </Text>
                </View>
                {delivery.deliveryPersonPhone ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{delivery.deliveryPersonPhone}</Text>
                  </View>
                ) : null}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Unit</Text>
                  <Text style={styles.detailValue}>{delivery.hostUnit || '—'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Resident</Text>
                  <Text style={styles.detailValue}>{delivery.hostResidentName || '—'}</Text>
                </View>
              </View>

              <View style={styles.otpRow}>
                <TextInput
                  style={[styles.otpInput, { fontSize: 16, letterSpacing: 3 }]}
                  placeholder="6-digit OTP"
                  placeholderTextColor="#94A3B8"
                  value={otpInputs[delivery.id] || ''}
                  onChangeText={val => setOtpInputs(prev => ({ ...prev, [delivery.id]: val }))}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={[styles.verifyBtn, { backgroundColor: '#1A7A7A', opacity: verifying[delivery.id] ? 0.7 : 1 }]}
                  onPress={() => handleVerify(delivery)}
                  disabled={!!verifying[delivery.id]}
                >
                  {verifying[delivery.id]
                    ? <ActivityIndicator color="#FFF" size="small" />
                    : <Text style={styles.verifyBtnText}>Allow Entry</Text>
                  }
                </TouchableOpacity>
              </View>

              {results[delivery.id] && !results[delivery.id].ok && (
                <Text style={{ color: '#C62828', fontSize: 12, marginTop: 6, fontWeight: '700' }}>
                  ❌ Wrong OTP. Ask the resident to check their order tracking screen.
                </Text>
              )}
            </View>
          ))}
        </>
      )}

      {/* OTP VERIFIED — inside community */}
      {verifiedMkt.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>INSIDE COMMUNITY — MARKETPLACE ({verifiedMkt.length})</Text>
          {verifiedMkt.map(delivery => (
            <View key={delivery.id} style={[styles.mktCard, { borderColor: '#86EFAC' }]}>
              <View style={styles.mktCardHeader}>
                <View style={[styles.mktIcon, { backgroundColor: '#F0FFF4' }]}>
                  <Text style={{ fontSize: 22 }}>✅</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mktOrderId}>{delivery.provider}</Text>
                  <Text style={styles.mktSub}>
                    {delivery.hostResidentName} · Unit {delivery.hostUnit}
                  </Text>
                  {delivery.deliveryPersonName && (
                    <Text style={[styles.mktSub, { color: '#1A7A7A' }]}>
                      🏍️ {delivery.deliveryPersonName}
                      {delivery.deliveryPersonPhone ? ` · ${delivery.deliveryPersonPhone}` : ''}
                      {' '}— inside
                    </Text>
                  )}
                </View>
                <View style={[styles.delivBadge, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={[styles.delivBadgeText, { color: '#064E3B' }]}>✓ Verified</Text>
                </View>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DeliveryVerificationScreen({ navigation }) {
  const theme = useTheme();
  const user  = useAuthStore(s => s.user);
  const setStoreDeliveries      = useSecurityStore(s => s.setDeliveries);
  const logEntry                = useSecurityStore(s => s.logEntry);
  const checkBlacklist          = useSecurityStore(s => s.checkBlacklist);
  const maintenanceRequests     = require('../../../store/appStore').default(s => s.maintenanceRequests);
  const guardValidateMaintenanceOTP = require('../../../store/appStore').default(s => s.guardValidateMaintenanceOTP);

  const [deliveries,        setDeliveries] = useState([]);
  const [loadingDeliveries, setLoading]    = useState(true);
  const [refreshing,        setRefreshing] = useState(false);
  const [mode,      setMode]     = useState('otp');
  const [otpInput,  setOtpInput] = useState('');
  const [otpInputs, setOtpInputs]= useState({});
  const [result,    setResult]   = useState(null);
  const [showQR,    setShowQR]   = useState(false);
  const [tab,       setTab]      = useState('verify');

  const guardId = user?.id || 'sec1';

  const pendingMaintenanceJobs  = maintenanceRequests.filter(r => r.status === 'approved_to_start');
  const activeMaintenanceJobs   = maintenanceRequests.filter(r => r.status === 'work_in_progress');
  const maintenancePendingCount = pendingMaintenanceJobs.length;

  // ── Load deliveries ───────────────────────────────────────────────────────
  const loadDeliveries = useCallback(async () => {
    const res = await fetchPendingDeliveries();
    if (res.ok) {
      const normalized = (res.data || []).map(d => ({
        ...d,
        status: (d.status || '').toUpperCase(),
      }));
      setDeliveries(normalized);
      setStoreDeliveries(normalized);
    }
  }, [setStoreDeliveries]);

  useEffect(() => { loadDeliveries().finally(() => setLoading(false)); }, [loadDeliveries]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDeliveries();
    setRefreshing(false);
  }, [loadDeliveries]);

  const handleDeliveriesChange = useCallback((updated) => {
    setDeliveries(updated);
    setStoreDeliveries(updated);
  }, [setStoreDeliveries]);

  // Derived lists
  const pendingDeliveries = deliveries.filter(d => d.status === 'PENDING');
  const activeDeliveries  = deliveries.filter(d => ['OTP_VERIFIED', 'CHECKED_IN'].includes(d.status));

  // Marketplace badge — same isMktPass logic
  const pendingMktCount = deliveries.filter(d => {
    const mid = d.marketplaceOrderId;
    return mid !== null && mid !== undefined && mid !== 0 && mid !== '0' && d.status === 'PENDING';
  }).length;

  // ── OTP verify (Verify tab) ───────────────────────────────────────────────
  const handleOTPVerify = async () => {
    const otp = otpInput.trim();
    if (otp.length < 4) { Alert.alert('Invalid OTP', 'Please enter the delivery OTP'); return; }
    const res = await verifyDeliveryOtp(otp, guardId);
    if (!res.ok) { setResult({ ok: false, error: res.error || 'No pending delivery found with this OTP.' }); return; }
    const bl = checkBlacklist(res.data.deliveryPersonName, res.data.deliveryPersonPhone);
    if (bl) { Alert.alert('🚫 BLACKLISTED', `${res.data.deliveryPersonName} is on the blacklist.\n\nReason: ${bl.reason}`); return; }
    const next = deliveries.map(d => String(d.id) === String(res.data.id) ? { ...d, status: 'OTP_VERIFIED' } : d);
    handleDeliveriesChange(next);
    logEntry('DELIVERY', res.data.id, res.data.deliveryPersonName || res.data.provider || 'Delivery',
      res.data.hostUnit || '-', 'OTP_VERIFIED', 'Main Gate', guardId,
      { hostResidentId: res.data.hostResidentId || '', hostResidentName: res.data.hostResidentName || '', provider: res.data.provider || '' });
    setResult({ ok: true, delivery: res.data });
    setOtpInput('');
    Alert.alert('✅ Delivery Verified', `${res.data.provider} delivery for ${res.data.hostUnit} allowed entry.`);
  };

  const handleQRScan = async (qrData) => {
    setShowQR(false);
    const parts = String(qrData || '').split('|');
    const otp   = parts[0] === 'DELIVERY' ? parts[2] : qrData;
    const res   = await verifyDeliveryOtp(otp, guardId);
    if (!res.ok) { setResult({ ok: false, error: 'Invalid QR code.' }); return; }
    const bl = checkBlacklist(res.data.deliveryPersonName, res.data.deliveryPersonPhone);
    if (bl) { Alert.alert('BLACKLISTED', `${res.data.deliveryPersonName} is on the blacklist.`); return; }
    const next = deliveries.map(d => String(d.id) === String(res.data.id) ? { ...d, status: 'OTP_VERIFIED' } : d);
    handleDeliveriesChange(next);
    logEntry('DELIVERY', res.data.id, res.data.deliveryPersonName || res.data.provider || 'Delivery',
      res.data.hostUnit || '-', 'QR_VERIFIED', 'Main Gate', guardId,
      { hostResidentId: res.data.hostResidentId || '', hostResidentName: res.data.hostResidentName || '', provider: res.data.provider || '' });
    setResult({ ok: true, delivery: res.data });
    Alert.alert('QR Verified', `Delivery for ${res.data.hostUnit} allowed entry.`);
  };

  const handleMarkDelivered = (delivery) => {
    Alert.alert(
      'Mark Delivered',
      `Confirm ${delivery.provider} delivery to ${delivery.hostUnit} is complete?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const res = await markDeliveryDelivered(delivery.id, guardId);
            if (!res.ok) { Alert.alert('Error', res.error); return; }
            const next = deliveries.filter(d => String(d.id) !== String(delivery.id));
            handleDeliveriesChange(next);
            logEntry('DELIVERY', delivery.id, delivery.deliveryPersonName || delivery.provider || 'Delivery',
              delivery.hostUnit || '-', 'CHECK_OUT', 'Main Gate', guardId,
              { hostResidentId: delivery.hostResidentId || '', hostResidentName: delivery.hostResidentName || '', provider: delivery.provider || '' });
            setResult(null);
            Alert.alert('Done', 'Delivery marked complete. Person checked out.');
          },
        },
      ],
    );
  };

  if (loadingDeliveries) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1A7A7A" />
        <Text style={{ color: '#7A9E9E', marginTop: 12, fontSize: 14 }}>Loading deliveries...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Delivery Verification</Text>
          <Text style={styles.headerSub}>OTP / QR gate entry</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.backBtn}>
          <Text style={{ color: '#FFF', fontSize: 18 }}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabItem, tab === 'verify' && styles.tabItemActive]} onPress={() => setTab('verify')}>
          <Text style={[styles.tabText, tab === 'verify' && styles.tabTextActive]}>
            🔍 Verify ({pendingDeliveries.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, tab === 'all' && styles.tabItemActive]} onPress={() => setTab('all')}>
          <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>
            📋 Active ({activeDeliveries.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, tab === 'marketplace' && styles.tabItemActive]} onPress={() => setTab('marketplace')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.tabText, tab === 'marketplace' && styles.tabTextActive]}>🛒 Market</Text>
            {pendingMktCount > 0 && (
              <View style={styles.mktBadge}><Text style={styles.mktBadgeText}>{pendingMktCount}</Text></View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, tab === 'maintenance' && styles.tabItemActive]} onPress={() => setTab('maintenance')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.tabText, tab === 'maintenance' && styles.tabTextActive]}>🔧 Work</Text>
            {maintenancePendingCount > 0 && (
              <View style={[styles.mktBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.mktBadgeText}>{maintenancePendingCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A7A7A" />}
      >
        {/* ── Verify Tab ─────────────────────────────────────────────────── */}
        {tab === 'verify' && (
          <>
            <View style={styles.mandatoryBanner}>
              <Text style={styles.mandatoryText}>⚠️ OTP or QR verification is MANDATORY before any delivery person can enter</Text>
            </View>
            <ModeToggle mode={mode} onChange={(m) => { setMode(m); setResult(null); }} />
            {mode === 'otp' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🔢 Verify Delivery OTP</Text>
                <Text style={styles.cardSub}>Ask the delivery person for the OTP from the resident's delivery pass</Text>
                <View style={styles.otpRow}>
                  <TextInput style={styles.otpInput} placeholder="Enter OTP" placeholderTextColor="#94A3B8"
                    value={otpInput} onChangeText={setOtpInput} keyboardType="number-pad" maxLength={6} />
                  <TouchableOpacity style={styles.verifyBtn} onPress={handleOTPVerify}>
                    <Text style={styles.verifyBtnText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {mode === 'qr' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>📱 Verify by QR Code</Text>
                <Text style={styles.cardSub}>Scan the QR code from the resident's delivery pass</Text>
                <TouchableOpacity style={styles.scanBtn} onPress={() => setShowQR(true)}>
                  <Text style={styles.scanBtnText}>📸 Open QR Scanner</Text>
                </TouchableOpacity>
              </View>
            )}
            {result && result.ok && (
              <View style={styles.successCard}>
                <Text style={styles.successTitle}>✅ Verification Successful</Text>
                <Text style={styles.successSub}>{result.delivery.provider} · {result.delivery.deliveryPersonName}</Text>
                <Text style={styles.successSub}>Delivering to: {result.delivery.hostUnit}</Text>
                <TouchableOpacity style={styles.deliveredBtn} onPress={() => handleMarkDelivered(result.delivery)}>
                  <Text style={styles.deliveredBtnText}>Mark Delivered & Checkout</Text>
                </TouchableOpacity>
              </View>
            )}
            {result && !result.ok && (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>❌ Verification Failed</Text>
                <Text style={styles.errorSub}>{result.error}</Text>
              </View>
            )}
            {pendingDeliveries.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>PENDING DELIVERIES ({pendingDeliveries.length})</Text>
                {pendingDeliveries.map(d => (
                  <DeliveryCard key={d.id} delivery={d} onMarkDelivered={handleMarkDelivered} />
                ))}
              </>
            )}
          </>
        )}

        {/* ── Active Tab ─────────────────────────────────────────────────── */}
        {tab === 'all' && (
          activeDeliveries.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>INSIDE COMPOUND ({activeDeliveries.length})</Text>
              {activeDeliveries.map(d => (
                <DeliveryCard key={d.id} delivery={d} onMarkDelivered={handleMarkDelivered} />
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>📦</Text>
              <Text style={styles.emptyText}>No active deliveries</Text>
            </View>
          )
        )}

        {/* ── Marketplace Tab ─────────────────────────────────────────────── */}
        {tab === 'marketplace' && (
          <MarketplaceDeliverySection
            allDeliveries={deliveries}
            onDeliveriesChange={handleDeliveriesChange}
            guardId={guardId}
            logEntry={logEntry}
          />
        )}

        {/* ── Maintenance Tab ────────────────────────────────────────────── */}
        {tab === 'maintenance' && (
          <View>
            <View style={styles.mandatoryBanner}>
              <Text style={styles.mandatoryText}>
                🔧 Vendors need admin approval before entering. Ask the vendor for the 6-digit OTP from their approval notification.
              </Text>
            </View>
            {pendingMaintenanceJobs.length === 0 && activeMaintenanceJobs.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 40 }}>🔧</Text>
                <Text style={styles.emptyText}>No maintenance vendors pending entry</Text>
              </View>
            )}
            {pendingMaintenanceJobs.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>AWAITING ENTRY ({pendingMaintenanceJobs.length})</Text>
                {pendingMaintenanceJobs.map(job => {
                  const jobOtpKey = `maint_${job.id}`;
                  return (
                    <View key={job.id} style={styles.mktCard}>
                      <View style={styles.mktCardHeader}>
                        <View style={[styles.mktIcon, { backgroundColor: theme.surface }]}>
                          <Text style={{ fontSize: 22 }}>🔧</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.mktOrderId}>{job.id} — {job.category}</Text>
                          <Text style={styles.mktSub}>{job.assignedVendorName || 'Vendor'}</Text>
                          <Text style={styles.mktSub}>Unit {job.unit} · {job.residentName}</Text>
                        </View>
                        <View style={[styles.delivBadge, { backgroundColor: '#FEF3C7' }]}>
                          <Text style={[styles.delivBadgeText, { color: '#E65100' }]}>Pending Entry</Text>
                        </View>
                      </View>
                      <View style={[styles.otpRow, { marginTop: 12 }]}>
                        <TextInput style={styles.otpInput} placeholder="6-digit vendor OTP"
                          placeholderTextColor="#94A3B8" value={otpInputs[jobOtpKey] || ''}
                          onChangeText={v => setOtpInputs(p => ({ ...p, [jobOtpKey]: v }))}
                          keyboardType="number-pad" maxLength={6} />
                        <TouchableOpacity
                          style={[styles.verifyBtn, { backgroundColor: '#1A7A7A' }]}
                          onPress={() => {
                            const otp = (otpInputs[jobOtpKey] || '').trim();
                            if (otp.length < 6) { Alert.alert('Invalid OTP', 'Please enter the full 6-digit OTP'); return; }
                            const res = guardValidateMaintenanceOTP(job.id, otp);
                            if (!res.ok) { Alert.alert('❌ Wrong OTP', 'OTP does not match.'); return; }
                            setOtpInputs(p => ({ ...p, [jobOtpKey]: '' }));
                            Alert.alert('✅ Entry Allowed', `${job.assignedVendorName || 'Vendor'} cleared to enter for ${job.category} work at Unit ${job.unit}.`);
                          }}
                        >
                          <Text style={styles.verifyBtnText}>Allow</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
            {activeMaintenanceJobs.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>INSIDE — WORK IN PROGRESS ({activeMaintenanceJobs.length})</Text>
                {activeMaintenanceJobs.map(job => (
                  <View key={job.id} style={[styles.mktCard, { borderColor: '#86EFAC' }]}>
                    <View style={styles.mktCardHeader}>
                      <View style={[styles.mktIcon, { backgroundColor: '#F0FFF4' }]}>
                        <Text style={{ fontSize: 22 }}>✅</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.mktOrderId}>{job.id} — {job.category}</Text>
                        <Text style={styles.mktSub}>{job.assignedVendorName || 'Vendor'} · Unit {job.unit}</Text>
                        <Text style={[styles.mktSub, { color: '#1A7A7A' }]}>🔧 Work in progress</Text>
                      </View>
                      <View style={[styles.delivBadge, { backgroundColor: '#D1FAE5' }]}>
                        <Text style={[styles.delivBadgeText, { color: '#064E3B' }]}>Inside</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {showQR && (
        <QRScanSimulator deliveries={deliveries} onScan={handleQRScan} onClose={() => setShowQR(false)} />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { backgroundColor: '#0D6E6E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#FFF', fontSize: 24, fontWeight: '300', lineHeight: 28, marginTop: -1 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  tabBar: { flexDirection: 'row', backgroundColor: '#1A7A7A', borderTopWidth: 1, borderTopColor: '#2D3F5A' },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabItemActive: { borderBottomWidth: 3, borderBottomColor: '#D4AF5A' },
  tabText: { color: '#7A9E9E', fontSize: 11, fontWeight: '600' },
  tabTextActive: { color: '#D4AF5A', fontWeight: '800' },
  body: { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#7A9E9E', letterSpacing: 1, marginTop: 18, marginBottom: 10 },
  mktBadge: { backgroundColor: '#C62828', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  mktBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  mktCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#D0EEEE' },
  mktCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  mktIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center' },
  mktOrderId: { fontSize: 14, fontWeight: '800', color: '#1A2E2E' },
  mktSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  mktDetails: { backgroundColor: '#E8F5F5', borderRadius: 10, padding: 12, gap: 8, marginBottom: 12 },
  mandatoryBanner: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: '#E65100' },
  mandatoryText: { fontSize: 12, fontWeight: '700', color: '#E65100' },
  modeToggle: { flexDirection: 'row', backgroundColor: '#D0EEEE', borderRadius: 12, padding: 4, marginBottom: 14 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  modeBtnTextActive: { color: '#1A7A7A', fontWeight: '800' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#D0EEEE' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1A2E2E', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#64748B', marginBottom: 14 },
  otpRow: { flexDirection: 'row', gap: 10 },
  otpInput: { flex: 1, backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, fontWeight: '800', color: '#1A2E2E', textAlign: 'center', letterSpacing: 4 },
  verifyBtn: { backgroundColor: '#E65100', paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center', minWidth: 80, alignItems: 'center' },
  verifyBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  scanBtn: { backgroundColor: '#E65100', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  scanBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  successCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#86EFAC' },
  successTitle: { fontSize: 15, fontWeight: '800', color: '#064E3B', marginBottom: 4 },
  successSub: { fontSize: 13, color: '#065F46', marginBottom: 4 },
  errorCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#FECACA' },
  errorTitle: { fontSize: 15, fontWeight: '800', color: '#991B1B', marginBottom: 4 },
  errorSub: { fontSize: 13, color: '#C62828' },
  delivCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#D0EEEE' },
  delivCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  delivIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center' },
  delivName: { fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
  delivSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  delivBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  delivBadgeText: { fontSize: 11, fontWeight: '800' },
  delivDetails: { backgroundColor: '#E8F5F5', borderRadius: 10, padding: 12, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  detailValue: { fontSize: 12, color: '#1A2E2E', fontWeight: '700', flex: 1, textAlign: 'right' },
  deliveredBtn: { marginTop: 12, backgroundColor: '#1A7A7A', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  deliveredBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  emptyState: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  qrOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  qrModal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  qrHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  qrTitle: { fontSize: 18, fontWeight: '800', color: '#1A2E2E' },
  qrViewfinder: { backgroundColor: '#000', borderRadius: 16, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  qrC1: { position: 'absolute', top: 10, left: 10, width: 26, height: 26, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#D4AF5A' },
  qrC2: { position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#D4AF5A' },
  qrC3: { position: 'absolute', bottom: 10, left: 10, width: 26, height: 26, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#D4AF5A' },
  qrC4: { position: 'absolute', bottom: 10, right: 10, width: 26, height: 26, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#D4AF5A' },
  qrHint: { color: '#7A9E9E', fontSize: 13 },
  qrOrLabel: { textAlign: 'center', fontSize: 12, color: '#7A9E9E', marginBottom: 10 },
  qrItem: { padding: 14, borderRadius: 10, backgroundColor: '#E8F5F5', marginBottom: 8, borderWidth: 1, borderColor: '#D0EEEE' },
  qrItemName: { fontSize: 14, fontWeight: '700', color: '#1A2E2E' },
  qrItemSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  qrEmpty: { textAlign: 'center', color: '#7A9E9E', padding: 20 },
});