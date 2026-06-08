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

// export default function EVPaymentScreen({ navigation, route }) {
//   const theme = useTheme();
//   const payEVBooking = useResidentStore(st => st.payEVBooking);
//   const [method, setMethod] = useState('upi');
//   const [paying, setPaying] = useState(false);

//   const booking = route.params && route.params.booking ? route.params.booking : null;

//   if (!booking) {
//     return (
//       <SafeAreaView style={s.screen}>
//         <Hdr title="EV Payment" subtitle="Secure · Instant confirmation" onBack={() => navigation.goBack()} />
//         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//           <Text style={{ color: '#7A9E9E', fontSize: 16 }}>Booking not found</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const handlePay = () => {
//     setPaying(true);
//     setTimeout(() => {
//       payEVBooking(booking.id);
//       setPaying(false);
//       navigation.replace('EVConfirmation', { booking: { ...booking, status:'booked', paymentStatus:'paid' } });
//     }, 1500);
//   };

//   return (
//     <SafeAreaView style={s.screen}>
//       <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
//       <Hdr title="EV Payment" subtitle="Secure · Instant confirmation" onBack={() => navigation.goBack()} />
//       <ScrollView contentContainerStyle={{ padding:20 }} showsVerticalScrollIndicator={false}>

//         <View style={[s.card, { borderColor:C.accent, borderWidth:2 }]}>
//           <Text style={{ fontWeight:'800', color:C.text, fontSize:15, marginBottom:8 }}>Order Summary</Text>
//           <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
//             <Text style={s.cardS}>⚡ Slot {booking.slot}</Text>
//             <Text style={{ fontWeight:'700', color:C.text }}>₹{booking.depositAmount}</Text>
//           </View>
//           <Text style={s.cardS}>📅 {booking.date} · 🕐 {booking.startTime}–{booking.endTime}</Text>
//           <Text style={s.cardS}>🚗 {booking.vehicleNumber} ({booking.vehicleType})</Text>
//           <View style={{ height:1, backgroundColor:C.border, marginVertical:12 }} />
//           <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
//             <Text style={{ fontWeight:'800', color:C.text, fontSize:16 }}>Deposit Total</Text>
//             <Text style={{ fontWeight:'900', color:C.accent, fontSize:20 }}>₹{booking.depositAmount}</Text>
//           </View>
//           <Text style={{ fontSize:11, color:C.muted, marginTop:4 }}>Actual usage billed at ₹12/kWh after charging</Text>
//         </View>

//         <Text style={[s.label,{marginTop:20}]}>Select Payment Method</Text>
//         {[
//           { id:'upi',        label:'UPI / QR',            emoji:'📱' },
//           { id:'card',       label:'Credit / Debit Card',  emoji:'💳' },
//           { id:'netbanking', label:'Net Banking',           emoji:'🏦' },
//         ].map(m => (
//           <TouchableOpacity key={m.id} style={[s.card, { flexDirection:'row', alignItems:'center', gap:12, marginBottom:8,
//             borderColor:method===m.id?C.primary:C.border, borderWidth:method===m.id?2:1 }]}
//             onPress={() => setMethod(m.id)}>
//             <Text style={{ fontSize:22 }}>{m.emoji}</Text>
//             <Text style={{ fontWeight:'700', color:C.text, flex:1 }}>{m.label}</Text>
//             <View style={[{ width:20, height:20, borderRadius:10, borderWidth:2,
//               borderColor:method===m.id?C.primary:C.muted,
//               backgroundColor:method===m.id?C.primary:'transparent' }]} />
//           </TouchableOpacity>
//         ))}

//         <TouchableOpacity style={[s.btn,{marginTop:24, opacity:paying?0.7:1}]} onPress={handlePay} disabled={paying}>
//           <Text style={s.btnT}>{paying ? 'Processing...' : `💳 Pay ₹${booking.depositAmount}`}</Text>
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
 * EVPaymentScreen.js
 * Expo Go compatible — Razorpay WebView checkout for EV deposit payment.
 *
 * SECURITY FIX (merged):
 *  - residentId, residentName, unit removed from /create-order request body
 *    (backend derives these from JWT via CurrentUser.get())
 *  - Authorization: Bearer <token> added to all fetch calls
 */
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, ActivityIndicator, Alert, Modal,
} from "react-native";
import { WebView } from "react-native-webview";
import { useAuthStore } from "../../../store/AuthStore";
import { apiUrl } from "../../../services/apiClient";

const RAZORPAY_KEY_ID = "rzp_test_SnbPPu9JniMOi8";

const C = {
  primary: "#1A7A7A", accent: "#D4AF5A",
  bg: "#F0FAFA", border: "#D0EEEE",
  text: "#1A2E2E", muted: "#7A9E9E",
};

export default function EVPaymentScreen({ navigation, route }) {
  const user = useAuthStore((s) => s.user);
  // FIX: token for Authorization header
  const token = useAuthStore((s) => s.token);
  const [paying, setPaying] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [razorpayHtml, setRazorpayHtml] = useState("");

  const booking = route.params?.booking || null;

  if (!booking) {
    return (
      <SafeAreaView style={st.screen}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: "700" }}>
            Booking not found
          </Text>
          <TouchableOpacity
            style={[st.btn, { marginTop: 20 }]}
            onPress={() => navigation.navigate("EVCharging")}
          >
            <Text style={st.btnT}>Go to EV Charging</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Shared auth headers
  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const buildHtml = (orderData) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: sans-serif; background: #F0FAFA;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      min-height: 100vh; padding: 24px;
    }
    .spinner {
      width: 52px; height: 52px;
      border: 4px solid #D0EEEE; border-top-color: #1A7A7A;
      border-radius: 50%;
      animation: spin 0.8s linear infinite; margin-bottom: 18px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { color: #7A9E9E; font-size: 16px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p>Opening Razorpay Checkout...</p>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    function postToApp(data) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }
    window.addEventListener('load', function() {
      var rzp = new Razorpay({
        key:         "${RAZORPAY_KEY_ID}",
        amount:      ${orderData.amount},
        currency:    "INR",
        name:        "BS Gated Community",
        description: "EV Charging Deposit - ${booking.slot}",
        order_id:    "${orderData.razorpayOrderId}",
        prefill: {
          name:    "${user?.name    || 'Resident'}",
          email:   "${user?.email   || 'resident@bsgated.com'}",
          contact: "${user?.phone   || '9999999999'}"
        },
        theme: { color: "#1A7A7A" },
        handler: function(response) {
          postToApp({
            type:                "SUCCESS",
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_signature:  response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: function() {
            postToApp({ type: "CANCELLED" });
          }
        }
      });
      rzp.on('payment.failed', function(response) {
        postToApp({ type: "FAILED", message: response.error.description || "Payment failed" });
      });
      rzp.open();
    });
  </script>
</body>
</html>`;

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);
    try {
      // FIX: residentId, residentName, unit REMOVED — backend reads from JWT
      const orderRes = await fetch(apiUrl('/ev-bookings/create-order'), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          slot:          booking.slot,
          date:          booking.date,
          startTime:     booking.startTime,
          endTime:       booking.endTime,
          vehicleNumber: booking.vehicleNumber,
          vehicleType:   booking.vehicleType,
          depositAmount: booking.depositAmount,
          ratePerUnit:   booking.ratePerUnit || 12,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create order");
      }

      const orderData = await orderRes.json();
      setRazorpayHtml(buildHtml(orderData));
      setPaying(false);
      setShowWebView(true);

    } catch (err) {
      setPaying(false);
      Alert.alert("Error", err.message || "Could not connect to server.");
    }
  };

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "CANCELLED") {
        setShowWebView(false);
        Alert.alert("Cancelled", "Payment was cancelled.");
        return;
      }

      if (data.type === "FAILED") {
        setShowWebView(false);
        Alert.alert("Payment Failed", data.message || "Payment failed.");
        return;
      }

      if (data.type === "SUCCESS") {
        setShowWebView(false);
        setPaying(true);

        // FIX: verify-payment also carries JWT token
        const verifyRes = await fetch(apiUrl('/ev-bookings/verify-payment'), {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            razorpayOrderId:   data.razorpay_order_id,
            razorpayPaymentId: data.razorpay_payment_id,
            razorpaySignature: data.razorpay_signature,
          }),
        });

        if (!verifyRes.ok) {
          throw new Error("Payment verification failed. Contact support.");
        }

        const confirmedBooking = await verifyRes.json();
        setPaying(false);
        navigation.replace("EVConfirmation", { booking: confirmedBooking });
      }
    } catch (err) {
      setPaying(false);
      setShowWebView(false);
      Alert.alert("Error", err.message || "Something went wrong.");
    }
  };

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => {
          setShowWebView(false);
          Alert.alert("Cancelled", "Payment was cancelled.");
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: C.primary }}>
          <View style={st.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowWebView(false);
              Alert.alert("Cancelled", "Payment was cancelled.");
            }}>
              <Text style={st.modalClose}>✕  Close</Text>
            </TouchableOpacity>
            <Text style={st.modalTitle}>🔒 Secure Payment</Text>
            <View style={{ width: 70 }} />
          </View>
          <WebView
            source={{ html: razorpayHtml }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={st.webLoader}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={{ color: C.muted, marginTop: 12 }}>Loading Razorpay...</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>

      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={st.backT}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.hdrT}>EV Payment</Text>
        <Text style={st.hdrSub}>Secure · Instant confirmation</Text>
      </View>

      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>

        <View style={[st.card, { borderColor: C.accent, borderWidth: 1.5 }]}>
          <Text style={st.cardTitle}>🧾 Order Summary</Text>
          {[
            ["EV Slot",   `⚡ ${booking.slot}`],
            ["Date",      booking.date],
            ["Time",      `${booking.startTime} – ${booking.endTime}`],
            ["Vehicle",   `${booking.vehicleNumber} (${booking.vehicleType})`],
          ].map(([label, value]) => (
            <View key={label} style={st.row}>
              <Text style={st.rowLabel}>{label}</Text>
              <Text style={st.rowVal}>{value}</Text>
            </View>
          ))}
          <View style={st.divider} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "900", color: C.text, fontSize: 16 }}>Deposit</Text>
            <Text style={{ fontWeight: "900", color: C.accent, fontSize: 26 }}>
              ₹{booking.depositAmount}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            Actual usage billed at ₹12/kWh after charging
          </Text>
        </View>

        <View style={st.infoCard}>
          <Text style={{ fontSize: 22 }}>🔒</Text>
          <Text style={st.infoText}>
            Razorpay secure checkout. Pay deposit via UPI, card, net banking or wallet.
            Your entry OTP is generated instantly after payment.
          </Text>
        </View>

        <TouchableOpacity
          style={[st.btn, paying && { opacity: 0.7 }]}
          onPress={handlePay}
          disabled={paying}
        >
          {paying ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={st.btnT}>Please wait...</Text>
            </View>
          ) : (
            <Text style={st.btnT}>⚡ Pay ₹{booking.depositAmount} Deposit</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingVertical: 14, alignItems: "center", marginTop: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: C.muted, fontSize: 14, fontWeight: "600" }}>
            Cancel & Go Back
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.bg },
  hdr:         { padding: 20, paddingTop: 40, backgroundColor: C.primary },
  backT:       { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 8 },
  hdrT:        { fontSize: 22, fontWeight: "800", color: "#FFF" },
  hdrSub:      { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  content:     { padding: 20 },
  card:        { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  cardTitle:   { fontWeight: "800", color: C.text, fontSize: 14, marginBottom: 12 },
  row:         { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.border },
  rowLabel:    { fontSize: 12, color: C.muted, fontWeight: "600" },
  rowVal:      { fontSize: 13, color: C.text, fontWeight: "700", maxWidth: "60%", textAlign: "right" },
  divider:     { height: 1, backgroundColor: C.border, marginVertical: 12 },
  infoCard:    { backgroundColor: "#E8F5F5", borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: "row", gap: 12, alignItems: "flex-start" },
  infoText:    { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 },
  btn:         { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnT:        { color: "#FFF", fontSize: 16, fontWeight: "800" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: C.primary },
  modalClose:  { color: "#FFF", fontSize: 14, fontWeight: "700" },
  modalTitle:  { color: "#FFF", fontSize: 15, fontWeight: "800" },
  webLoader:   { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: C.bg },
});