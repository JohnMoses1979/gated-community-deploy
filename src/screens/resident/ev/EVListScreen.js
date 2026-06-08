// import React, { useState } from 'react';
// import {
//   View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
//   ScrollView, Alert, TextInput,
// } from 'react-native';
// import { useAuthStore } from '../../../store/AuthStore';
// import useResidentStore from '../../../store/residentStore';
// import { useTheme } from '../../../hooks/useTheme';

// const C = {
//   primary: '#1A7A7A', accent: '#D4AF5A', success: '#1A7A7A',
//   danger: '#DC2626', warn: '#D97706', bg: '#F0FAFA',
//   card: '#FFFFFF', border: '#D0EEEE', text: '#1A2E2E', muted: '#7A9E9E',
// };

// function Hdr({ title, subtitle, onBack, right }) {
//   return (
//     <View style={s.hdr}>
//       <TouchableOpacity onPress={onBack} style={s.back}>
//         <Text style={s.backT}>← Back</Text>
//       </TouchableOpacity>
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//         <View>
//           <Text style={s.hdrT}>{title}</Text>
//           {subtitle ? <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{subtitle}</Text> : null}
//         </View>
//         {right || null}
//       </View>
//     </View>
//   );
// }

// function Badge({ label, color, bg }) {
//   return <View style={[s.badge, { backgroundColor: bg }]}><Text style={[s.badgeT, { color }]}>{label}</Text></View>;
// }

// // ─── EV List Screen ───────────────────────────────────────────────────────────

// function EVCard({ b, onPress }) {
//   const statusColor = b.status === 'active' ? '#1A7A7A' : b.status === 'completed' ? '#7A9E9E' : '#D97706';
//   return (
//     <TouchableOpacity
//       style={[s.card, { borderLeftWidth: 4, borderLeftColor: statusColor }]}
//       onPress={onPress} activeOpacity={onPress ? 0.85 : 1}
//     >
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//         <View style={{ flex: 1 }}>
//           <Text style={s.cardT}>⚡ Slot {b.slot}</Text>
//           <Text style={s.cardS}>📅 {b.date}  🕐 {b.startTime} – {b.endTime}</Text>
//           <Text style={s.cardS}>🚗 {b.vehicleNumber} ({b.vehicleType})</Text>
//           <Text style={[s.cardS, { color: b.paymentStatus === 'paid' ? '#1A7A7A' : '#D97706', fontWeight: '700', marginTop: 2 }]}>
//             {b.paymentStatus === 'paid' ? '✅ Deposit Paid' : '⏳ Payment Pending'} · ₹{b.depositAmount}
//           </Text>
//         </View>
//         <View style={[s.badge, { backgroundColor: statusColor + '20' }]}>
//           <Text style={[s.badgeT, { color: statusColor }]}>{b.status.toUpperCase()}</Text>
//         </View>
//       </View>
//       {b.status !== 'completed' && b.otp && (
//         <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5F5', borderRadius: 10, padding: 10, marginTop: 10 }}>
//           <Text style={{ fontSize: 11, color: '#7A9E9E' }}>🔑 OTP: </Text>
//           <Text style={{ fontWeight: '900', color: '#1A7A7A', letterSpacing: 4, fontSize: 16 }}>{b.otp}</Text>
//         </View>
//       )}
//       {onPress && b.status !== 'completed' && (
//         <Text style={{ textAlign: 'right', color: '#7A9E9E', fontSize: 11, marginTop: 6 }}>Tap to view QR →</Text>
//       )}
//     </TouchableOpacity>
//   );
// }

// export default function EVListScreen({ navigation }) {
//   const theme = useTheme();
//   const user = useAuthStore(st => st.user);
//   const evBookings = useResidentStore(st => st.evBookings);
//   const [tab, setTab] = useState('browse');

//   const myId = user?.id || 'res1';
//   const mine = evBookings.filter(b => b.residentId === myId);
//   const pending = mine.filter(b => b.status === 'payment_pending');
//   const upcoming = mine.filter(b => b.paymentStatus === 'paid' && !b.checkedIn && b.status !== 'completed');
//   const past = mine.filter(b => b.checkedIn || b.status === 'completed');

//   const EV_SLOTS = ['EV-01','EV-02','EV-03','EV-04','EV-05','EV-06'];
//   const bookedSlots = evBookings.filter(b => ['booked','active'].includes(b.status)).map(b => b.slot);

//   return (
//     <SafeAreaView style={s.screen}>
//       <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
//       <Hdr
//         title="⚡ EV Charging"
//         subtitle={`${EV_SLOTS.length - bookedSlots.length} of ${EV_SLOTS.length} slots available`}
//         onBack={() => navigation.goBack()}
//       />

//       <View style={s.tabRow}>
//         {['browse','upcoming','history'].map(t => (
//           <TouchableOpacity key={t} style={[s.tab, tab===t && s.tabA]} onPress={() => setTab(t)}>
//             <Text style={[s.tabT, tab===t && s.tabTA]}>
//               {t==='browse' ? 'Book Slot' : t==='upcoming' ? ('Upcoming' + (upcoming.length > 0 ? ' (' + upcoming.length + ')' : '')) : 'History'}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <ScrollView contentContainerStyle={{ padding:16 }} showsVerticalScrollIndicator={false}>

//         {tab === 'browse' && (
//           <>
//             {pending.length > 0 && (
//               <View style={[s.card, { borderColor:C.warn, borderWidth:2, marginBottom:12 }]}>
//                 <Text style={{ color:C.warn, fontWeight:'800', fontSize:13 }}>⏳ Pending Payment ({pending.length})</Text>
//                 {pending.map(b => (
//                   <TouchableOpacity key={b.id} style={{ marginTop:8, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}
//                     onPress={() => navigation.navigate('EVPayment', { booking: b })}>
//                     <Text style={{ color:C.text, fontWeight:'700' }}>⚡ {b.slot} · {b.date}</Text>
//                     <Text style={{ color:C.warn, fontWeight:'800', fontSize:12 }}>Pay ₹{b.depositAmount} →</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             )}

//             <View style={[s.card, { marginBottom:12 }]}>
//               <Text style={s.sec}>Slot Availability</Text>
//               <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
//                 {EV_SLOTS.map(slot => {
//                   const occupied = bookedSlots.includes(slot);
//                   return (
//                     <View key={slot} style={[s.slotChip, occupied && s.slotOcc]}>
//                       <Text style={[s.slotT, occupied && { color:C.danger }]}>{slot}</Text>
//                       <Text style={{ fontSize:10, color: occupied ? C.danger : C.success }}>{occupied?'●':'○'}</Text>
//                     </View>
//                   );
//                 })}
//               </View>
//               <Text style={[s.cardS,{marginTop:8}]}>{EV_SLOTS.length - bookedSlots.length} of {EV_SLOTS.length} slots free · ₹200 deposit · ₹12/kWh</Text>
//             </View>

//             <TouchableOpacity
//               style={s.btn}
//               onPress={() => {
//                 if (EV_SLOTS.length === bookedSlots.length) {
//                   Alert.alert('No Slots','All EV slots are occupied. Try again later.'); return;
//                 }
//                 navigation.navigate('EVBookSlot');
//               }}>
//               <Text style={s.btnT}>⚡ Book EV Slot</Text>
//             </TouchableOpacity>
//           </>
//         )}

//         {tab === 'upcoming' && (
//           upcoming.length === 0
//             ? <View style={s.empty}><Text style={{ fontSize:48 }}>⚡</Text><Text style={s.emptyT}>No upcoming bookings</Text></View>
//             : upcoming.map(b => <EVCard key={b.id} b={b} onPress={() => navigation.navigate('EVConfirmation', { booking:b })} />)
//         )}

//         {tab === 'history' && (
//           past.length === 0
//             ? <View style={s.empty}><Text style={{ fontSize:48 }}>📋</Text><Text style={s.emptyT}>No history yet</Text></View>
//             : past.map(b => <EVCard key={b.id} b={b} />)
//         )}
//         <View style={{ height:40 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   screen:    { flex: 1, backgroundColor: C.bg },
//   hdr:       { padding: 20, paddingTop: 40, backgroundColor: C.primary },
//   back:      { marginBottom: 8 },
//   backT:     { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
//   hdrT:      { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
//   tabRow:    { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: C.border },
//   tab:       { flex: 1, paddingVertical: 13, alignItems: 'center' },
//   tabA:      { borderBottomWidth: 3, borderBottomColor: C.primary },
//   tabT:      { fontSize: 13, fontWeight: '600', color: C.muted },
//   tabTA:     { color: C.primary, fontWeight: '800' },
//   card:      { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
//   cardT:     { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 2 },
//   cardS:     { fontSize: 12, color: C.muted, marginTop: 2 },
//   sec:       { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 1, marginBottom: 12, marginTop: 4 },
//   label:     { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 1, marginBottom: 12 },
//   badge:     { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
//   badgeT:    { fontSize: 10, fontWeight: '800' },
//   chip:      { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border },
//   chipA:     { backgroundColor: C.primary, borderColor: C.primary },
//   chipT:     { fontSize: 13, fontWeight: '600', color: C.text },
//   chipTA:    { color: '#FFF' },
//   dateChip:  { width: 56, paddingVertical: 12, borderRadius: 14, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
//   dateChipA: { backgroundColor: C.primary, borderColor: C.primary },
//   slotChip:  { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: '#D0EEEE', flexDirection: 'row', gap: 4, alignItems: 'center' },
//   slotOcc:   { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
//   slotT:     { fontSize: 12, fontWeight: '700', color: C.primary },
//   input:     { backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.text, marginBottom: 16 },
//   btn:       { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
//   btnT:      { color: '#FFF', fontSize: 16, fontWeight: '800' },
//   empty:     { alignItems: 'center', paddingVertical: 60, gap: 12 },
//   emptyT:    { fontSize: 16, fontWeight: '700', color: C.muted },
//   qrBox:     { width: 180, height: 180, borderRadius: 16, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.primary },
//   qrInner:   { padding: 16, alignItems: 'center' },
//   otpBox:    { flexDirection: 'row', gap: 8 },
//   otpDigit:  { width: 44, height: 56, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
//   otpDigitT: { color: '#FFF', fontSize: 22, fontWeight: '900' },
//   detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
//   detailLabel:{ fontSize: 13, color: C.muted, fontWeight: '600' },
//   detailValue:{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
// });





























/**
 * EVListScreen.js — Resident: EV Charging Slot Browser
 *
 * SECURITY FIX (merged):
 *  - GET /api/ev-bookings/my  with Authorization: Bearer <token>
 *  - residentId never sent; backend derives from JWT
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import { apiUrl } from '../../../services/apiClient';

const C = {
  primary: '#1A7A7A', success: '#1A7A7A', danger: '#DC2626',
  warn: '#D97706', accent: '#D4AF5A',
  bg: '#F0FAFA', card: '#FFFFFF', border: '#D0EEEE',
  text: '#1A2E2E', muted: '#7A9E9E',
};

// Static EV slot config — in production this would come from an admin-managed endpoint
const EV_SLOTS = [
  { id: 'EV-A1', name: 'Slot A1', location: 'Basement Level 1 — Zone A', connectorType: 'Type 2 AC', maxKW: 7.2,  available: true },
  { id: 'EV-A2', name: 'Slot A2', location: 'Basement Level 1 — Zone A', connectorType: 'Type 2 AC', maxKW: 7.2,  available: true },
  { id: 'EV-B1', name: 'Slot B1', location: 'Basement Level 1 — Zone B', connectorType: 'CCS DC Fast', maxKW: 22,   available: true },
  { id: 'EV-B2', name: 'Slot B2', location: 'Basement Level 1 — Zone B', connectorType: 'CCS DC Fast', maxKW: 22,   available: true },
  { id: 'EV-C1', name: 'Slot C1', location: 'Open Parking — Zone C',     connectorType: 'Bharat AC',  maxKW: 3.3,  available: true },
  { id: 'EV-C2', name: 'Slot C2', location: 'Open Parking — Zone C',     connectorType: 'Bharat AC',  maxKW: 3.3,  available: true },
];

const TIME_SLOTS = [
  { id: 'morning',   label: '🌅 Morning',   time: '06:00 – 10:00', hours: 4 },
  { id: 'midday',    label: '☀️ Midday',    time: '10:00 – 14:00', hours: 4 },
  { id: 'afternoon', label: '🌤 Afternoon', time: '14:00 – 18:00', hours: 4 },
  { id: 'evening',   label: '🌆 Evening',   time: '18:00 – 22:00', hours: 4 },
  { id: 'night',     label: '🌙 Night',     time: '22:00 – 06:00', hours: 8 },
];

const RATE_PER_UNIT = 12; // ₹12 per kWh — matches backend default
const DEPOSIT_BASE  = 200;

function SlotCard({ slot, onBook }) {
  return (
    <TouchableOpacity
      style={[st.card, { borderLeftWidth: 4, borderLeftColor: slot.available ? C.primary : C.muted }]}
      onPress={() => slot.available && onBook(slot)}
      activeOpacity={slot.available ? 0.85 : 1}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={st.cardT}>⚡ {slot.name}</Text>
          <Text style={st.cardS}>📍 {slot.location}</Text>
          <Text style={st.cardS}>🔌 {slot.connectorType}  ·  {slot.maxKW} kW max</Text>
          <Text style={[st.cardS, { color: C.success, fontWeight: '700', marginTop: 4 }]}>
            ₹{RATE_PER_UNIT}/kWh  ·  ₹{DEPOSIT_BASE} deposit
          </Text>
        </View>
        <View style={{
          backgroundColor: slot.available ? '#DCFCE7' : '#F3F4F6',
          paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
        }}>
          <Text style={{
            fontSize: 11, fontWeight: '800',
            color: slot.available ? C.success : C.muted,
          }}>
            {slot.available ? 'AVAILABLE' : 'OCCUPIED'}
          </Text>
        </View>
      </View>
      {slot.available && (
        <TouchableOpacity
          style={[st.btn, { marginTop: 12, paddingVertical: 10 }]}
          onPress={() => onBook(slot)}
        >
          <Text style={st.btnT}>Book This Slot →</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

function BookingCard({ b }) {
  const statusColor =
    b.status === 'booked' || b.status === 'active' ? C.success :
    b.status === 'completed' ? C.muted : C.warn;

  return (
    <View style={[st.card, { borderLeftWidth: 4, borderLeftColor: statusColor }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={st.cardT}>⚡ {b.slot}</Text>
          <Text style={st.cardS}>📅 {b.date}  ·  🕐 {b.startTime} – {b.endTime}</Text>
          <Text style={st.cardS}>🚗 {b.vehicleNumber} ({b.vehicleType})</Text>
          {b.status === 'booked' && b.otp && (
            <View style={{ backgroundColor: '#E8F5F5', borderRadius: 10, padding: 10, marginTop: 8 }}>
              <Text style={{ fontSize: 11, color: C.muted }}>🔑 Entry OTP</Text>
              <Text style={{ fontSize: 24, fontWeight: '900', color: C.primary, letterSpacing: 6 }}>{b.otp}</Text>
              <Text style={{ fontSize: 10, color: C.muted }}>Show to guard at EV bay</Text>
            </View>
          )}
        </View>
        <View style={{ backgroundColor: statusColor + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: statusColor }}>
            {b.status?.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function EVListScreen({ navigation }) {
  const token = useAuthStore(s => s.token);

  const [tab, setTab]                 = useState('slots');
  const [myBookings, setMyBookings]   = useState([]);
  const [loadingBookings, setLoading] = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  // FIX: GET /my — no residentId param, JWT used by backend
  const fetchMyBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(apiUrl('/ev-bookings/my'), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMyBookings(Array.isArray(data) ? data : []);
    } catch {
      // silent — show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchMyBookings(); }, [fetchMyBookings]);

  const handleBook = (slot) => {
    navigation.navigate('EVBookSlot', { slot, timeSlots: TIME_SLOTS, ratePerUnit: RATE_PER_UNIT, depositBase: DEPOSIT_BASE });
  };

  const upcoming = myBookings.filter(b => b.status === 'booked' || b.status === 'active');
  const history  = myBookings.filter(b => b.status === 'completed' || b.status === 'payment_pending');

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.back}>
          <Text style={st.backT}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.hdrT}>⚡ EV Charging</Text>
        <Text style={st.hdrSub}>
          {EV_SLOTS.filter(s => s.available).length} slots available  ·  ₹{RATE_PER_UNIT}/kWh
        </Text>
      </View>

      <View style={st.tabRow}>
        {[
          { key: 'slots',    label: 'Available Slots' },
          { key: 'upcoming', label: upcoming.length > 0 ? `My Bookings (${upcoming.length})` : 'My Bookings' },
          { key: 'history',  label: 'History' },
        ].map(t => (
          <TouchableOpacity key={t.key} style={[st.tab, tab === t.key && st.tabA]} onPress={() => setTab(t.key)}>
            <Text style={[st.tabT, tab === t.key && st.tabTA]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchMyBookings(true)} colors={[C.primary]} />
        }
      >
        {tab === 'slots' && (
          <>
            <View style={[st.card, { backgroundColor: '#E8F5F5', borderColor: C.primary, marginBottom: 16 }]}>
              <Text style={{ fontWeight: '800', color: C.primary, fontSize: 13, marginBottom: 6 }}>
                ⚡ How EV Charging Works
              </Text>
              <Text style={{ color: C.muted, fontSize: 12, lineHeight: 20 }}>
                {'• Pay ₹' + DEPOSIT_BASE + ' deposit to book a slot\n' +
                 '• Show OTP to guard at EV bay entrance\n' +
                 '• Actual usage billed at ₹' + RATE_PER_UNIT + '/kWh after charging\n' +
                 '• Deposit adjusted against final bill'}
              </Text>
            </View>
            {EV_SLOTS.map(slot => (
              <SlotCard key={slot.id} slot={slot} onBook={handleBook} />
            ))}
          </>
        )}

        {tab === 'upcoming' && (
          loadingBookings ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={C.primary} />
              <Text style={{ color: C.muted, marginTop: 12 }}>Loading bookings...</Text>
            </View>
          ) : upcoming.length === 0 ? (
            <View style={st.empty}>
              <Text style={{ fontSize: 48 }}>⚡</Text>
              <Text style={st.emptyT}>No active bookings</Text>
              <TouchableOpacity style={[st.btn, { marginTop: 16, paddingHorizontal: 24 }]} onPress={() => setTab('slots')}>
                <Text style={st.btnT}>Browse Slots</Text>
              </TouchableOpacity>
            </View>
          ) : upcoming.map(b => <BookingCard key={b.id} b={b} />)
        )}

        {tab === 'history' && (
          loadingBookings ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={C.primary} />
            </View>
          ) : history.length === 0 ? (
            <View style={st.empty}>
              <Text style={{ fontSize: 48 }}>📋</Text>
              <Text style={st.emptyT}>No history yet</Text>
            </View>
          ) : history.map(b => <BookingCard key={b.id} b={b} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  hdr:    { padding: 20, paddingTop: 40, backgroundColor: C.primary },
  back:   { marginBottom: 8 },
  backT:  { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  hdrT:   { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  hdrSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  tabRow: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: C.border },
  tab:    { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabA:   { borderBottomWidth: 3, borderBottomColor: C.primary },
  tabT:   { fontSize: 12, fontWeight: '600', color: C.muted },
  tabTA:  { color: C.primary, fontWeight: '800' },
  card:   { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  cardT:  { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 2 },
  cardS:  { fontSize: 12, color: C.muted, marginTop: 2 },
  btn:    { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnT:   { color: '#FFF', fontSize: 14, fontWeight: '800' },
  empty:  { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyT: { fontSize: 16, fontWeight: '700', color: C.muted },
});