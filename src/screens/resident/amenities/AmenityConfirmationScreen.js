// /**
//  * AmenityConfirmationScreen.js
//  * Booking confirmed — shows OTP, QR, booking details.
//  */
// import React, { useMemo } from 'react';
// import {
//   View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
//   ScrollView,
// } from 'react-native';
// import useResidentStore from '../../../store/residentStore';

// const C = {
//   primary: '#1A7A7A', success: '#1A7A7A', danger: '#DC2626',
//   warn: '#D97706', accent: '#D4AF5A',
//   bg: '#F0FAFA', card: '#FFFFFF', border: '#D0EEEE',
//   text: '#1A2E2E', muted: '#7A9E9E',
// };

// function DetailRow({ label, value }) {
//   return (
//     <View style={st.detailRow}>
//       <Text style={st.detailLabel}>{label}</Text>
//       <Text style={st.detailValue} numberOfLines={2}>{value}</Text>
//     </View>
//   );
// }

// function QRPattern({ seed }) {
//   const cells = useMemo(() => {
//     const hash = String(seed || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
//     return Array.from({ length: 49 }, (_, i) => (hash * (i + 7) * 31) % 100 > 45);
//   }, [seed]);
//   return (
//     <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 154, gap: 2 }}>
//       {cells.map((on, i) => (
//         <View
//           key={i}
//           style={{ width: 20, height: 20, backgroundColor: on ? C.primary : 'transparent', borderRadius: 2 }}
//         />
//       ))}
//     </View>
//   );
// }

// export default function AmenityConfirmationScreen({ navigation, route }) {
//   // All hooks at top — never conditional
//   const amenityBookings = useResidentStore(s => s.amenityBookings);

//   const passedBooking = route.params && route.params.booking ? route.params.booking : null;
//   const live = passedBooking
//     ? (amenityBookings.find(b => b.id === passedBooking.id) || passedBooking)
//     : null;

//   if (!live) {
//     return (
//       <SafeAreaView style={st.screen}>
//         <StatusBar barStyle="light-content" backgroundColor={C.primary} />
//         <View style={st.hdr}>
//           <TouchableOpacity onPress={() => navigation.navigate('Amenities')} style={st.back}>
//             <Text style={st.backT}>← Back</Text>
//           </TouchableOpacity>
//           <Text style={st.hdrT}>Booking Confirmed</Text>
//         </View>
//         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
//           <Text style={{ fontSize: 48 }}>😕</Text>
//           <Text style={{ color: C.muted, fontSize: 16, marginTop: 12, textAlign: 'center' }}>
//             Booking details not found
//           </Text>
//           <TouchableOpacity
//             style={[st.btn, { marginTop: 20 }]}
//             onPress={() => navigation.navigate('Amenities')}
//           >
//             <Text style={st.btnT}>Go to Amenities</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const formattedDate = live.date
//     ? (() => {
//         try {
//           return new Date(live.date + 'T00:00:00').toLocaleDateString('en-IN', {
//             weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
//           });
//         } catch (e) { return live.date; }
//       })()
//     : '—';

//   const otp = live.otp || '------';

//   return (
//     <SafeAreaView style={st.screen}>
//       <StatusBar barStyle="light-content" backgroundColor={C.primary} />

//       <View style={st.hdr}>
//         <TouchableOpacity onPress={() => navigation.navigate('Amenities')} style={st.back}>
//           <Text style={st.backT}>← Back to Amenities</Text>
//         </TouchableOpacity>
//         <Text style={st.hdrT}>Booking Confirmed</Text>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

//         {/* Success banner */}
//         <View style={[st.card, { alignItems: 'center', paddingVertical: 28, borderColor: C.success, borderWidth: 2 }]}>
//           <View style={st.successIcon}>
//             <Text style={{ fontSize: 42 }}>✅</Text>
//           </View>
//           <Text style={{ fontSize: 22, fontWeight: '900', color: C.success, marginBottom: 4 }}>
//             Booking Confirmed!
//           </Text>
//           <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
//             Show the OTP or QR code to the guard at the amenity entrance
//           </Text>
//         </View>

//         {/* OTP + QR */}
//         <View style={[st.card, { alignItems: 'center', paddingVertical: 24, marginTop: 4 }]}>
//           <Text style={st.sectionLabel}>YOUR ENTRY OTP</Text>
//           <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
//             {otp.split('').map((d, i) => (
//               <View key={i} style={st.otpDigit}>
//                 <Text style={st.otpDigitT}>{d}</Text>
//               </View>
//             ))}
//           </View>
//           <Text style={{ fontSize: 11, color: C.muted, marginBottom: 20 }}>
//             Valid for booking date only — do not share
//           </Text>
//           <Text style={st.sectionLabel}>— OR SCAN QR CODE —</Text>
//           <View style={st.qrBox}>
//             <QRPattern seed={live.id} />
//           </View>
//           <Text style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>{live.qrCode || ''}</Text>
//         </View>

//         {/* Booking details */}
//         <View style={[st.card, { marginTop: 4 }]}>
//           <Text style={[st.sectionLabel, { marginBottom: 12 }]}>BOOKING DETAILS</Text>
//           <DetailRow label="Booking ID"  value={live.id || '—'} />
//           <DetailRow label="Amenity"     value={((live.amenityEmoji || '') + ' ' + (live.amenityName || '')).trim()} />
//           <DetailRow label="Date"        value={formattedDate} />
//           <DetailRow label="Time Slot"   value={live.slot || '—'} />
//           <DetailRow label="Members"     value={String(live.members || 1) + ' person(s)'} />
//           <DetailRow label="Status"      value={live.status === 'confirmed' ? '✅ Confirmed' : (live.status || '—')} />
//           <DetailRow
//             label="Amount"
//             value={
//               live.amount > 0
//                 ? (live.paymentStatus === 'paid' ? '✅ ₹' + live.amount + ' Paid' : '⏳ ₹' + live.amount + ' Pending')
//                 : '🆓 Free'
//             }
//           />
//         </View>

//         {/* Reminders */}
//         <View style={[st.card, { backgroundColor: '#E8F5F5', marginTop: 4 }]}>
//           <Text style={{ fontWeight: '800', color: C.primary, fontSize: 13, marginBottom: 8 }}>
//             📋 Reminders
//           </Text>
//           <Text style={{ color: C.muted, fontSize: 12, lineHeight: 20 }}>
//             {'• Arrive 5 minutes before your slot\n• Show OTP or QR code to security guard\n• Slot is non-transferable\n• Cancel at least 2 hours before to avoid penalty\n• Maintain cleanliness and follow community rules'}
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={[st.btn, { marginTop: 16 }]}
//           onPress={() => navigation.navigate('Amenities')}
//         >
//           <Text style={st.btnT}>📅 View All Bookings</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[st.btn, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.primary, marginTop: 10 }]}
//           onPress={() => navigation.navigate('ResidentDashboard')}
//         >
//           <Text style={[st.btnT, { color: C.primary }]}>🏠 Back to Home</Text>
//         </TouchableOpacity>

//         <View style={{ height: 40 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const st = StyleSheet.create({
//   screen:      { flex: 1, backgroundColor: C.bg },
//   hdr:         { padding: 20, paddingTop: 40, backgroundColor: C.primary },
//   back:        { marginBottom: 8 },
//   backT:       { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
//   hdrT:        { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
//   card:        { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
//   sectionLabel:{ fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 1, marginBottom: 16 },
//   successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
//   detailRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
//   detailLabel: { fontSize: 13, color: C.muted, fontWeight: '600', flex: 1 },
//   detailValue: { fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
//   qrBox:       { width: 168, height: 168, borderRadius: 16, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.primary, padding: 8 },
//   otpDigit:    { width: 44, height: 56, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
//   otpDigitT:   { color: '#FFF', fontSize: 22, fontWeight: '900' },
//   btn:         { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
//   btnT:        { color: '#FFF', fontSize: 16, fontWeight: '800' },
// });





























/**
 * AmenityConfirmationScreen.js
 *
 * Displays booking confirmation with OTP and QR code.
 * No direct API calls — receives booking object via navigation params.
 * Token kept in scope for any future refresh calls.
 */
import React, { useRef } from 'react';
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

export default function AmenityConfirmationScreen({ navigation, route }) {
  // token available for any future refresh/re-fetch if needed
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
            onPress={() => navigation.navigate('Amenities')}
          >
            <Text style={st.btnT}>Go to Amenities</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = booking.date
    ? new Date(`${booking.date}T00:00:00`).toLocaleDateString('en-IN', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    })
    : booking.date;

  const isPaid = booking.paymentStatus === 'paid';
  const isFree = booking.paymentStatus === 'free' || booking.amount === 0;
  const isCancelled = booking.status === 'cancelled';

  const statusColor =
    isCancelled ? C.danger :
      booking.status === 'confirmed' ? C.success : C.warn;

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `🏛️ Amenity Booking Confirmed!\n\n` +
          `${booking.amenityEmoji || ''} ${booking.amenityName}\n` +
          `📅 ${formattedDate}\n` +
          `⏰ ${booking.slot}\n` +
          `👥 ${booking.members || 1} member(s)\n` +
          `🔑 OTP: ${booking.otp || '—'}\n\n` +
          `Show OTP to guard at entry — BS Gated Community`,
      });
    } catch (e) {
      Alert.alert('Share failed', e.message);
    }
  };

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.navigate('Amenities')} style={st.back}>
          <Text style={st.backT}>← Amenities</Text>
        </TouchableOpacity>
        <Text style={st.hdrT}>
          {isCancelled ? '🚫 Booking Cancelled' : '✅ Booking Confirmed'}
        </Text>
        <Text style={st.hdrSub}>
          {isCancelled
            ? 'This booking has been cancelled'
            : 'Show OTP to guard at entry'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

        {/* Status banner */}
        <View style={[st.banner, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>
            {isCancelled ? '🚫' : booking.checkedIn ? '✅' : '🎉'}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: statusColor }}>
            {isCancelled
              ? 'Cancelled'
              : booking.checkedIn
                ? 'Checked In'
                : 'Booking Confirmed!'}
          </Text>
          <Text style={{ color: C.muted, fontSize: 13, marginTop: 4, textAlign: 'center' }}>
            {isCancelled
              ? 'This slot has been released'
              : booking.checkedIn
                ? 'Entry logged by guard'
                : 'Your slot is reserved. Keep OTP handy.'}
          </Text>
        </View>

        {/* OTP card — only when confirmed and not checked in */}
        {booking.otp && !isCancelled && (
          <View style={[st.card, { borderColor: C.primary, borderWidth: 2, alignItems: 'center', paddingVertical: 24 }]}>
            <Text style={{ fontSize: 13, color: C.muted, fontWeight: '700', letterSpacing: 1 }}>
              YOUR ENTRY OTP
            </Text>
            <Text style={{ fontSize: 48, fontWeight: '900', color: C.primary, letterSpacing: 10, marginVertical: 12 }}>
              {booking.otp}
            </Text>
            <Text style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>
              🔒 Show this to the guard at the amenity entrance
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
          <InfoRow label="Amenity" value={`${booking.amenityEmoji || '🏛️'} ${booking.amenityName}`} />
          <InfoRow label="Date" value={formattedDate} />
          <InfoRow label="Time Slot" value={booking.slot} />
          <InfoRow label="Members" value={`${booking.members || 1} person(s)`} />
          <InfoRow label="Booking ID" value={`#${booking.id}`} />
          <InfoRow label="Status" value={booking.status?.replace('_', ' ').toUpperCase()} />
        </View>

        {/* Payment details */}
        <View style={st.card}>
          <Text style={st.secLabel}>PAYMENT</Text>
          {isFree ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ color: C.muted, fontSize: 13 }}>Amount</Text>
              <Text style={{ color: C.success, fontWeight: '900', fontSize: 18 }}>FREE</Text>
            </View>
          ) : (
            <>
              <InfoRow label="Amount" value={`₹${booking.amount}`} accent />
              <InfoRow
                label="Payment Status"
                value={isPaid ? '✅ Paid' : '⏳ Pending'}
              />
              {booking.razorpayPaymentId && (
                <InfoRow label="Payment ID" value={booking.razorpayPaymentId} />
              )}
            </>
          )}
        </View>

        {/* Resident info */}
        {(booking.residentName || booking.unit) && (
          <View style={st.card}>
            <Text style={st.secLabel}>RESIDENT</Text>
            {booking.residentName && <InfoRow label="Name" value={booking.residentName} />}
            {booking.unit && booking.unit !== 'N/A' && <InfoRow label="Unit" value={booking.unit} />}
          </View>
        )}

        {/* Rules reminder */}
        {!isCancelled && !booking.checkedIn && (
          <View style={[st.card, { backgroundColor: '#E8F5F5', borderColor: C.primary }]}>
            <Text style={{ fontWeight: '800', color: C.primary, fontSize: 13, marginBottom: 8 }}>
              📋 Entry Checklist
            </Text>
            <Text style={{ color: C.muted, fontSize: 12, lineHeight: 20 }}>
              {'• Show your 6-digit OTP to the guard\n' +
                '• Arrive on time — slot is non-transferable\n' +
                '• Bring only the number of members booked\n' +
                '• Follow amenity rules and maintain cleanliness'}
            </Text>
          </View>
        )}

        {/* Cancelled info */}
        {isCancelled && booking.cancelledAt && (
          <View style={[st.card, { backgroundColor: '#FEE2E2', borderColor: C.danger }]}>
            <Text style={{ color: C.danger, fontWeight: '800', fontSize: 13 }}>
              🚫 Cancellation Details
            </Text>
            <Text style={{ color: C.danger, fontSize: 12, marginTop: 6 }}>
              Cancelled on {new Date(booking.cancelledAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
            {isPaid && (
              <Text style={{ color: C.danger, fontSize: 12, marginTop: 4 }}>
                Refund (if applicable) will be processed per society policy.
              </Text>
            )}
          </View>
        )}

        {/* Action buttons */}
        <View style={{ gap: 12, marginTop: 8 }}>
          {!isCancelled && booking.otp && (
            <TouchableOpacity style={st.btn} onPress={handleShare}>
              <Text style={st.btnT}>📤 Share Booking Details</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[st.btn, { backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: C.primary }]}
            onPress={() => navigation.navigate('Amenities')}
          >
            <Text style={[st.btnT, { color: C.primary }]}>
              {isCancelled ? '← Back to Amenities' : '← View All Bookings'}
            </Text>
          </TouchableOpacity>

          {!isCancelled && !booking.checkedIn && (
            <TouchableOpacity
              style={[st.btn, { backgroundColor: 'transparent' }]}
              onPress={() => navigation.navigate('AmenityBooking', {
                amenity: {
                  id: booking.amenityId,
                  name: booking.amenityName,
                  emoji: booking.amenityEmoji,
                },
              })}
            >
              <Text style={[st.btnT, { color: C.muted }]}>+ Book Another Slot</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  hdr: { padding: 20, paddingTop: 40, backgroundColor: C.primary },
  back: { marginBottom: 8 },
  backT: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  hdrT: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  hdrSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  banner: { borderRadius: 16, borderWidth: 2, padding: 20, alignItems: 'center', marginBottom: 16 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  secLabel: { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 1, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.border },
  rowLabel: { fontSize: 12, color: C.muted, fontWeight: '600' },
  rowVal: { fontSize: 13, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  btn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnT: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});