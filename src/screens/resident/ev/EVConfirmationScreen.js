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

// export default function EVConfirmationScreen({ navigation, route }) {
//   const theme = useTheme();
//   const evBookings = useResidentStore(st => st.evBookings);
//   const passedBooking = route.params && route.params.booking ? route.params.booking : null;
//   const live = passedBooking ? (evBookings.find(b => b.id === passedBooking.id) || passedBooking) : null;

//   if (!live) {
//     return (
//       <SafeAreaView style={s.screen}>
//         <Hdr title="EV Booking" onBack={() => navigation.navigate('EVCharging')} />
//         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//           <Text style={{ fontSize: 48 }}>😕</Text>
//           <Text style={{ color: '#7A9E9E', fontSize: 16, marginTop: 12 }}>Booking not found</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={s.screen}>
//       <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
//       <Hdr title="Booking Confirmed" subtitle="EV slot reserved successfully" onBack={() => navigation.navigate('EVCharging')} />
//       <ScrollView contentContainerStyle={{ padding:20 }} showsVerticalScrollIndicator={false}>

//         <View style={[s.card, { alignItems:'center', paddingVertical:28, borderColor:C.success, borderWidth:2 }]}>
//           <View style={{ width:72, height:72, borderRadius:36, backgroundColor:'#DCFCE7', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
//             <Text style={{ fontSize:36 }}>✅</Text>
//           </View>
//           <Text style={{ fontSize:22, fontWeight:'900', color:C.success, marginBottom:4 }}>EV Slot Booked!</Text>
//           <Text style={{ color:C.muted, fontSize:13, textAlign:'center' }}>Show the QR code or OTP to the guard before entering the charging area</Text>
//         </View>

//         <View style={[s.card, { marginTop:16 }]}>
//           <Text style={s.sec}>Booking Details</Text>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
//             <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>EV Slot</Text>
//             <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{`⚡ ${live.slot}`}</Text>
//           </View>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
//             <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>Date</Text>
//             <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{live.date}</Text>
//           </View>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
//             <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>Time</Text>
//             <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{`${live.startTime} – ${live.endTime}`}</Text>
//           </View>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
//             <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>Vehicle</Text>
//             <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{`${live.vehicleNumber} (${live.vehicleType})`}</Text>
//           </View>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
//             <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>Deposit</Text>
//             <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{`₹${live.depositAmount} paid`}</Text>
//           </View>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
//             <Text style={{ fontSize: 13, color: C.muted, fontWeight: '600' }}>Booking ID</Text>
//             <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{live.id}</Text>
//           </View>
//         </View>

//         <View style={[s.card, { marginTop:12, alignItems:'center', paddingVertical:24 }]}>
//           <Text style={{ fontSize:13, fontWeight:'700', color:C.muted, marginBottom:16 }}>ENTRY QR CODE</Text>
//           <View style={s.qrBox}>
//             <View style={s.qrInner}>
//               <Text style={{ fontSize: 10, color: C.muted, textAlign: 'center', fontWeight: '600' }}>{live.qrCode}</Text>
//               <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 8, justifyContent: 'center' }}>
//                 {Array.from({ length: 36 }).map((_, i) => {
//                   const seed = String(live.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
//                   return <View key={i} style={{ width: 10, height: 10, backgroundColor: (seed * (i + 3) * 17) % 100 > 45 ? C.primary : 'transparent', borderRadius: 1 }} />;
//                 })}
//               </View>
//             </View>
//           </View>
//           <Text style={{ fontSize:13, color:C.muted, marginTop:16, marginBottom:8 }}>— OR USE OTP —</Text>
//           <View style={s.otpBox}>
//             {(live.otp || '------').split('').map((d,i) => (
//               <View key={i} style={s.otpDigit}><Text style={s.otpDigitT}>{d}</Text></View>
//             ))}
//           </View>
//           <Text style={{ fontSize:11, color:C.muted, marginTop:8 }}>Show to guard at EV charging entrance</Text>
//         </View>

//         <TouchableOpacity style={[s.btn,{marginTop:16}]} onPress={() => navigation.navigate('ResidentDashboard')}>
//           <Text style={s.btnT}>🏠 Back to Home</Text>
//         </TouchableOpacity>
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
 * EVConfirmationScreen.js — EV Booking Confirmation
 *
 * Displays confirmed EV booking with OTP.
 * No direct API calls — receives booking object via navigation params.
 * Token kept for any future refresh calls.
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, Share, Alert,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';

const C = {
  primary: '#1A7A7A', success: '#1A7A7A', danger: '#DC2626',
  warn: '#D97706', accent: '#D4AF5A',
  bg: '#F0FAFA', card: '#FFFFFF', border: '#D0EEEE',
  text: '#1A2E2E', muted: '#7A9E9E',
};

function InfoRow({ label, value, accent }) {
  return (
    <View style={st.row}>
      <Text style={st.rowLabel}>{label}</Text>
      <Text style={[st.rowVal, accent && { color: C.accent, fontSize: 16, fontWeight: '900' }]}>
        {value}
      </Text>
    </View>
  );
}

export default function EVConfirmationScreen({ navigation, route }) {
  // token available for any future refresh if needed
  const token = useAuthStore(s => s.token);
  const { booking } = route.params || {};

  if (!booking) {
    return (
      <SafeAreaView style={st.screen}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.text, textAlign: 'center' }}>
            Booking details not found
          </Text>
          <TouchableOpacity
            style={[st.btn, { marginTop: 24 }]}
            onPress={() => navigation.navigate('EVCharging')}
          >
            <Text style={st.btnT}>Go to EV Charging</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor =
    booking.status === 'booked' || booking.status === 'active' ? C.success :
    booking.status === 'completed' ? C.muted : C.warn;

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `⚡ EV Charging Slot Booked!\n\n` +
          `Slot: ${booking.slot}\n` +
          `Date: ${booking.date}\n` +
          `Time: ${booking.startTime} – ${booking.endTime}\n` +
          `Vehicle: ${booking.vehicleNumber}\n` +
          `🔑 OTP: ${booking.otp || '—'}\n\n` +
          `Show OTP to guard at EV bay — BS Gated Community`,
      });
    } catch (e) {
      Alert.alert('Share failed', e.message);
    }
  };

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.navigate('EVCharging')} style={st.back}>
          <Text style={st.backT}>← EV Charging</Text>
        </TouchableOpacity>
        <Text style={st.hdrT}>✅ Booking Confirmed</Text>
        <Text style={st.hdrSub}>Show OTP to guard at EV bay</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

        {/* Status banner */}
        <View style={[st.banner, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>⚡</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: statusColor }}>
            {booking.status === 'booked'    ? 'Slot Reserved!'    :
             booking.status === 'active'    ? 'Charging Active'   :
             booking.status === 'completed' ? 'Session Complete'  : 'Confirmed'}
          </Text>
          <Text style={{ color: C.muted, fontSize: 13, marginTop: 4, textAlign: 'center' }}>
            {booking.status === 'booked'
              ? 'Your EV slot is confirmed. Keep OTP ready.'
              : booking.status === 'active'
                ? 'Charging session is in progress.'
                : 'Thank you for using EV charging.'}
          </Text>
        </View>

        {/* OTP card */}
        {booking.otp && (booking.status === 'booked' || booking.status === 'active') && (
          <View style={[st.card, { borderColor: C.primary, borderWidth: 2, alignItems: 'center', paddingVertical: 24 }]}>
            <Text style={{ fontSize: 13, color: C.muted, fontWeight: '700', letterSpacing: 1 }}>
              YOUR ENTRY OTP
            </Text>
            <Text style={{ fontSize: 48, fontWeight: '900', color: C.primary, letterSpacing: 10, marginVertical: 12 }}>
              {booking.otp}
            </Text>
            <Text style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>
              🔒 Show this to the guard at the EV bay entrance
            </Text>
            {booking.checkedIn && (
              <View style={{ backgroundColor: C.success + '20', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 12 }}>
                <Text style={{ color: C.success, fontWeight: '800', fontSize: 13 }}>
                  ✅ OTP Used — Entry Logged
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Booking details */}
        <View style={st.card}>
          <Text style={st.secLabel}>BOOKING DETAILS</Text>
          <InfoRow label="Slot"       value={`⚡ ${booking.slot}`} />
          <InfoRow label="Date"       value={booking.date} />
          <InfoRow label="Time"       value={`${booking.startTime} – ${booking.endTime}`} />
          <InfoRow label="Vehicle"    value={`${booking.vehicleNumber} (${booking.vehicleType})`} />
          <InfoRow label="Booking ID" value={`#${booking.id}`} />
          <InfoRow label="Status"     value={booking.status?.toUpperCase()} />
        </View>

        {/* Payment details */}
        <View style={st.card}>
          <Text style={st.secLabel}>PAYMENT</Text>
          <InfoRow label="Deposit Paid" value={`₹${booking.depositAmount}`} accent />
          <InfoRow label="Rate"         value={`₹${booking.ratePerUnit || 12}/kWh`} />
          <InfoRow label="Payment ID"   value={booking.razorpayPaymentId || '—'} />
          <View style={{ backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, marginTop: 10 }}>
            <Text style={{ color: '#92400E', fontSize: 12, lineHeight: 18 }}>
              ⚡ Actual energy used will be calculated after your session ends.
              Deposit will be adjusted against the final bill.
            </Text>
          </View>
        </View>

        {/* Resident info */}
        {(booking.residentName || booking.unit) && (
          <View style={st.card}>
            <Text style={st.secLabel}>RESIDENT</Text>
            {booking.residentName && <InfoRow label="Name" value={booking.residentName} />}
            {booking.unit && booking.unit !== 'N/A' && <InfoRow label="Unit" value={booking.unit} />}
          </View>
        )}

        {/* Entry checklist */}
        {(booking.status === 'booked') && (
          <View style={[st.card, { backgroundColor: '#E8F5F5', borderColor: C.primary }]}>
            <Text style={{ fontWeight: '800', color: C.primary, fontSize: 13, marginBottom: 8 }}>
              ✅ Entry Checklist
            </Text>
            <Text style={{ color: C.muted, fontSize: 12, lineHeight: 20 }}>
              {'• Show 6-digit OTP to guard at EV bay\n' +
               '• Ensure connector type matches your vehicle\n' +
               '• Do not exceed your booked time slot\n' +
               '• Disconnect properly at end of session'}
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={{ gap: 12, marginTop: 8 }}>
          {booking.otp && (
            <TouchableOpacity style={st.btn} onPress={handleShare}>
              <Text style={st.btnT}>📤 Share Booking Details</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[st.btn, { backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: C.primary }]}
            onPress={() => navigation.navigate('EVCharging')}
          >
            <Text style={[st.btnT, { color: C.primary }]}>← View All EV Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingVertical: 14, alignItems: 'center' }}
            onPress={() => navigation.navigate('EVBookSlot', { slot: { id: booking.slot, name: booking.slot, location: '' } })}
          >
            <Text style={{ color: C.muted, fontSize: 14, fontWeight: '700' }}>+ Book Another Slot</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: C.bg },
  hdr:      { padding: 20, paddingTop: 40, backgroundColor: C.primary },
  back:     { marginBottom: 8 },
  backT:    { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  hdrT:     { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  hdrSub:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  banner:   { borderRadius: 16, borderWidth: 2, padding: 20, alignItems: 'center', marginBottom: 16 },
  card:     { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  secLabel: { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 1, marginBottom: 12 },
  row:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.border },
  rowLabel: { fontSize: 12, color: C.muted, fontWeight: '600' },
  rowVal:   { fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  btn:      { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnT:     { color: '#FFF', fontSize: 15, fontWeight: '800' },
});