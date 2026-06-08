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

// export default function EVBookSlotScreen({ navigation }) {
//   const theme = useTheme();
//   const user = useAuthStore(st => st.user);
//   const evBookings = useResidentStore(st => st.evBookings);
//   const createEVBooking = useResidentStore(st => st.createEVBooking);

//   const bookedSlots = evBookings.filter(b => ['booked','active'].includes(b.status)).map(b => b.slot);
//   const EV_SLOTS = ['EV-01','EV-02','EV-03','EV-04','EV-05','EV-06'].filter(s => !bookedSlots.includes(s));

//   const dates = Array.from({ length:7 }, (_, i) => {
//     const d = new Date(Date.now() + (i+1)*86400000);
//     return d.toISOString().split('T')[0];
//   });
//   const START_TIMES = ['06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00'];
//   const END_TIMES   = ['08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];

//   const [slot, setSlot] = useState(null);
//   const [date, setDate] = useState(dates[0]);
//   const [startTime, setStartTime] = useState(null);
//   const [endTime, setEndTime] = useState(null);
//   const [vehicleNumber, setVehicleNumber] = useState('');
//   const [vehicleType, setVehicleType] = useState('Car');

//   const TYPES = ['Car','Bike','Auto'];
//   const DEPOSIT = 200;

//   const handleBook = () => {
//     if (!slot) { Alert.alert('Required','Select an EV slot'); return; }
//     if (!startTime || !endTime) { Alert.alert('Required','Select start and end time'); return; }
//     if (!vehicleNumber.trim()) { Alert.alert('Required','Enter vehicle number'); return; }

//     const booking = createEVBooking({
//       residentId: user?.id || 'res1',
//       residentName: user?.name || 'Resident',
//       unit: user?.unit || 'A-101',
//       vehicleNumber: vehicleNumber.trim().toUpperCase(),
//       vehicleType,
//       slot, date, startTime, endTime,
//       depositAmount: DEPOSIT,
//       ratePerUnit: 12,
//     });
//     navigation.replace('EVPayment', { booking });
//   };

//   return (
//     <SafeAreaView style={s.screen}>
//       <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
//       <Hdr title="Book EV Slot" subtitle={`${EV_SLOTS.length} slot(s) available · ₹200 deposit`} onBack={() => navigation.goBack()} />
//       <ScrollView contentContainerStyle={{ padding:20 }} showsVerticalScrollIndicator={false}>

//         <View style={[s.card, { alignItems:'center', paddingVertical:20, marginBottom:4 }]}>
//           <Text style={{ fontSize:52 }}>⚡</Text>
//           <Text style={{ fontSize:20, fontWeight:'800', color:C.text, marginTop:8 }}>EV Charging</Text>
//           <Text style={{ color:C.accent, fontWeight:'700', fontSize:14, marginTop:4 }}>₹{DEPOSIT} deposit · ₹12/kWh billed monthly</Text>
//         </View>

//         <Text style={s.label}>Select EV Slot</Text>
//         <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:20 }}>
//           {EV_SLOTS.map(sl => (
//             <TouchableOpacity key={sl} style={[s.chip, slot===sl && s.chipA]} onPress={() => setSlot(sl)}>
//               <Text style={[s.chipT, slot===sl && s.chipTA]}>⚡ {sl}</Text>
//             </TouchableOpacity>
//           ))}
//           {EV_SLOTS.length === 0 && <Text style={{ color:C.danger, fontWeight:'700' }}>All slots occupied</Text>}
//         </View>

//         <Text style={s.label}>Select Date</Text>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:20 }}>
//           <View style={{ flexDirection:'row', gap:10 }}>
//             {dates.map(d => {
//               const day = new Date(d).toLocaleDateString('en-IN',{weekday:'short'});
//               const num = new Date(d).getDate();
//               return (
//                 <TouchableOpacity key={d} style={[s.dateChip, date===d && s.dateChipA]} onPress={() => setDate(d)}>
//                   <Text style={{ fontSize:11, fontWeight:'600', color:date===d?'#FFF':C.muted }}>{day}</Text>
//                   <Text style={{ fontSize:18, fontWeight:'800', color:date===d?'#FFF':C.text }}>{num}</Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </ScrollView>

//         <Text style={s.label}>Start Time</Text>
//         <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:20 }}>
//           {START_TIMES.map(t => (
//             <TouchableOpacity key={t} style={[s.chip, startTime===t && s.chipA]} onPress={() => setStartTime(t)}>
//               <Text style={[s.chipT, startTime===t && s.chipTA]}>🕐 {t}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Text style={s.label}>End Time</Text>
//         <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:20 }}>
//           {END_TIMES.filter(t => !startTime || t > startTime).map(t => (
//             <TouchableOpacity key={t} style={[s.chip, endTime===t && s.chipA]} onPress={() => setEndTime(t)}>
//               <Text style={[s.chipT, endTime===t && s.chipTA]}>🕐 {t}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Text style={s.label}>Vehicle Number</Text>
//         <TextInput style={s.input} value={vehicleNumber} onChangeText={setVehicleNumber}
//           placeholder="e.g. TS09EV1234" placeholderTextColor={C.muted} autoCapitalize="characters" />

//         <Text style={s.label}>Vehicle Type</Text>
//         <View style={{ flexDirection:'row', gap:10, marginBottom:20 }}>
//           {TYPES.map(t => (
//             <TouchableOpacity key={t} style={[s.chip, vehicleType===t && s.chipA]} onPress={() => setVehicleType(t)}>
//               <Text style={[s.chipT, vehicleType===t && s.chipTA]}>{t}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {slot && startTime && endTime && (
//           <View style={[s.card, { backgroundColor: theme.inputBg, borderColor:C.primary, borderWidth:1.5, marginBottom:8 }]}>
//             <Text style={{ fontWeight:'700', color:C.primary, fontSize:13 }}>Booking Summary</Text>
//             <Text style={s.cardS}>⚡ {slot}  📅 {date}</Text>
//             <Text style={s.cardS}>🕐 {startTime} → {endTime}  🚗 {vehicleNumber||'—'}</Text>
//             <Text style={[s.cardS,{marginTop:4}]}>Deposit: ₹{DEPOSIT}</Text>
//           </View>
//         )}

//         <TouchableOpacity style={s.btn} onPress={handleBook}>
//           <Text style={s.btnT}>→ Proceed to Payment</Text>
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
 * EVBookSlotScreen.js — Resident: Book an EV charging slot
 *
 * SECURITY FIX (merged):
 *  - No direct API call from this screen
 *  - residentId, residentName, unit intentionally NOT included in booking object
 *    passed to EVPaymentScreen — EVPaymentScreen sends to backend which reads from JWT
 *  - token available via useAuthStore if needed for future slot-availability check
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, TextInput, Alert,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';

const C = {
  primary: '#1A7A7A', success: '#1A7A7A', danger: '#DC2626',
  warn: '#D97706', accent: '#D4AF5A',
  bg: '#F0FAFA', card: '#FFFFFF', border: '#D0EEEE',
  text: '#1A2E2E', muted: '#7A9E9E',
};

const VEHICLE_TYPES = ['2-Wheeler', '4-Wheeler', 'SUV', 'Other'];

export default function EVBookSlotScreen({ navigation, route }) {
  const { slot, timeSlots = [], ratePerUnit = 12, depositBase = 200 } = route.params || {};

  // token available if slot-availability API check is added
  const token = useAuthStore(s => s.token);
  const user  = useAuthStore(s => s.user);

  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() + (i + 1) * 86400000);
    return d.toISOString().split('T')[0];
  }), []);

  const [date, setDate]               = useState(dates[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('4-Wheeler');
  const [rulesOk, setRulesOk]         = useState(false);

  if (!slot) {
    return (
      <SafeAreaView style={st.screen}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.text, fontSize: 16 }}>No slot selected.</Text>
          <TouchableOpacity style={[st.btn, { marginTop: 20 }]} onPress={() => navigation.goBack()}>
            <Text style={st.btnT}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const deposit = depositBase + (vehicleType === 'SUV' ? 100 : vehicleType === '4-Wheeler' ? 50 : 0);

  const handleProceed = () => {
    if (!selectedTime) { Alert.alert('Select Time', 'Please choose a time slot.'); return; }
    if (!vehicleNumber.trim()) { Alert.alert('Vehicle Number', 'Please enter your vehicle registration number.'); return; }
    if (!rulesOk) { Alert.alert('Agree to Rules', 'Please acknowledge the EV charging rules.'); return; }

    // FIX: residentId, residentName, unit intentionally NOT included
    // EVPaymentScreen sends this to /ev-bookings/create-order
    // Backend reads identity from JWT via CurrentUser.get()
    const booking = {
      slot:          slot.id,
      slotName:      slot.name,
      slotLocation:  slot.location,
      date,
      startTime:     selectedTime.time.split(' – ')[0],
      endTime:       selectedTime.time.split(' – ')[1],
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType,
      depositAmount: deposit,
      ratePerUnit,
    };

    navigation.navigate('EVPayment', { booking });
  };

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.back}>
          <Text style={st.backT}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.hdrT}>⚡ Book EV Slot</Text>
        <Text style={st.hdrSub}>{slot.name}  ·  {slot.location}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

        {/* Slot info */}
        <View style={[st.card, { backgroundColor: '#E8F5F5', borderColor: C.primary, borderWidth: 1.5 }]}>
          <Text style={{ fontWeight: '800', color: C.primary, fontSize: 14, marginBottom: 6 }}>⚡ {slot.name}</Text>
          <Text style={st.cardS}>📍 {slot.location}</Text>
          <Text style={st.cardS}>🔌 {slot.connectorType}  ·  {slot.maxKW} kW max</Text>
          <Text style={[st.cardS, { color: C.success, fontWeight: '700', marginTop: 4 }]}>
            ₹{ratePerUnit}/kWh  ·  Deposit: ₹{deposit}
          </Text>
        </View>

        {/* Date selection */}
        <Text style={st.label}>SELECT DATE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {dates.map(d => {
              const dt  = new Date(d + 'T00:00:00');
              const day = dt.toLocaleDateString('en-IN', { weekday: 'short' });
              const num = dt.getDate();
              const mon = dt.toLocaleDateString('en-IN', { month: 'short' });
              const sel = date === d;
              return (
                <TouchableOpacity
                  key={d}
                  style={[st.dateChip, sel && st.dateChipA]}
                  onPress={() => { setDate(d); setSelectedTime(null); }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '600', color: sel ? '#FFF' : C.muted }}>{day}</Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: sel ? '#FFF' : C.text }}>{num}</Text>
                  <Text style={{ fontSize: 9,  fontWeight: '600', color: sel ? 'rgba(255,255,255,0.8)' : C.muted }}>{mon}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Time slot selection */}
        <Text style={st.label}>SELECT TIME SLOT</Text>
        <View style={{ gap: 10, marginBottom: 20 }}>
          {(timeSlots.length > 0 ? timeSlots : [
            { id: 'morning',   label: '🌅 Morning',   time: '06:00 – 10:00', hours: 4 },
            { id: 'midday',    label: '☀️ Midday',    time: '10:00 – 14:00', hours: 4 },
            { id: 'afternoon', label: '🌤 Afternoon', time: '14:00 – 18:00', hours: 4 },
            { id: 'evening',   label: '🌆 Evening',   time: '18:00 – 22:00', hours: 4 },
            { id: 'night',     label: '🌙 Night',     time: '22:00 – 06:00', hours: 8 },
          ]).map(ts => {
            const sel = selectedTime?.id === ts.id;
            return (
              <TouchableOpacity
                key={ts.id}
                style={[st.timeChip, sel && st.timeChipA]}
                onPress={() => setSelectedTime(ts)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 14, fontWeight: '700', color: sel ? '#FFF' : C.text }]}>{ts.label}</Text>
                  <Text style={[{ fontSize: 12, marginTop: 2, color: sel ? 'rgba(255,255,255,0.8)' : C.muted }]}>
                    🕐 {ts.time}  ·  {ts.hours}h session
                  </Text>
                </View>
                {sel && <Text style={{ color: '#FFF', fontSize: 18 }}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Vehicle details */}
        <Text style={st.label}>VEHICLE DETAILS</Text>
        <TextInput
          style={st.input}
          value={vehicleNumber}
          onChangeText={t => setVehicleNumber(t.toUpperCase())}
          placeholder="e.g. TS09AB1234"
          placeholderTextColor={C.muted}
          autoCapitalize="characters"
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {VEHICLE_TYPES.map(vt => (
            <TouchableOpacity
              key={vt}
              style={[st.chip, vehicleType === vt && st.chipA]}
              onPress={() => setVehicleType(vt)}
            >
              <Text style={[st.chipT, vehicleType === vt && { color: '#FFF' }]}>{vt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        {selectedTime && vehicleNumber.trim() && (
          <View style={[st.card, { backgroundColor: '#E8F5F5', borderColor: C.primary, borderWidth: 1.5, marginBottom: 16 }]}>
            <Text style={{ fontWeight: '800', color: C.primary, fontSize: 14, marginBottom: 10 }}>📋 Booking Summary</Text>
            {[
              ['Slot',    `⚡ ${slot.name}`],
              ['Date',    new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })],
              ['Time',    selectedTime.time],
              ['Vehicle', `${vehicleNumber.trim().toUpperCase()} (${vehicleType})`],
              ['Deposit', `₹${deposit}`],
            ].map(([label, value]) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border }}>
                <Text style={{ fontSize: 12, color: C.muted, fontWeight: '600' }}>{label}</Text>
                <Text style={{ fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{value}</Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
              <Text style={{ fontWeight: '800', color: C.text }}>Pay Now</Text>
              <Text style={{ fontWeight: '900', color: C.accent, fontSize: 20 }}>₹{deposit}</Text>
            </View>
            <Text style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Actual usage billed at ₹{ratePerUnit}/kWh after session ends
            </Text>
          </View>
        )}

        {/* Rules */}
        <TouchableOpacity
          style={{ flexDirection: 'row', gap: 12, marginBottom: 20, padding: 14, backgroundColor: rulesOk ? '#E8F5F5' : '#FAFAFA', borderRadius: 12, borderWidth: 1.5, borderColor: rulesOk ? C.primary : C.border, alignItems: 'flex-start' }}
          onPress={() => setRulesOk(!rulesOk)}
        >
          <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: rulesOk ? C.primary : C.border, backgroundColor: rulesOk ? C.primary : 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
            {rulesOk && <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '900' }}>✓</Text>}
          </View>
          <Text style={{ flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 }}>
            I agree to EV charging rules. I will bring my OTP for guard entry, not exceed my booked time slot, and ensure my vehicle's charging connector matches the slot type.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[st.btn, (!selectedTime || !vehicleNumber.trim() || !rulesOk) && { opacity: 0.5 }]}
          onPress={handleProceed}
          disabled={!selectedTime || !vehicleNumber.trim() || !rulesOk}
        >
          <Text style={st.btnT}>→ Proceed to Pay ₹{deposit}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: C.bg },
  hdr:       { padding: 20, paddingTop: 40, backgroundColor: C.primary },
  back:      { marginBottom: 8 },
  backT:     { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  hdrT:      { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  hdrSub:    { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  label:     { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 1, marginBottom: 12 },
  card:      { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  cardS:     { fontSize: 12, color: C.muted, marginTop: 2 },
  dateChip:  { width: 56, paddingVertical: 12, borderRadius: 14, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
  dateChipA: { backgroundColor: C.primary, borderColor: C.primary },
  timeChip:  { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border },
  timeChipA: { backgroundColor: C.primary, borderColor: C.primary },
  input:     { borderWidth: 1.5, borderRadius: 12, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.text, backgroundColor: C.card, marginBottom: 12, fontWeight: '700', letterSpacing: 2 },
  chip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border },
  chipA:     { backgroundColor: C.primary, borderColor: C.primary },
  chipT:     { fontSize: 12, fontWeight: '700', color: C.text },
  btn:       { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnT:      { color: '#FFF', fontSize: 16, fontWeight: '800' },
});