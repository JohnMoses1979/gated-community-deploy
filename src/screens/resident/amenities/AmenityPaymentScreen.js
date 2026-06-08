// /**
//  * AmenityPaymentScreen.js
//  * Resident pays for a booked amenity slot.
//  * Fixed: hooks not conditional, pushes confirmed booking to adminStore on payment.
//  */
// import React, { useState } from "react";
// import {
//   View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
//   ScrollView, ActivityIndicator,
// } from "react-native";
// import useResidentStore from "../../../store/residentStore";
// import { useTheme }     from "../../../hooks/useTheme";

// const C = {
//   primary: "#1A7A7A", success: "#1A7A7A", danger: "#DC2626",
//   warn: "#D97706", accent: "#D4AF5A",
//   bg: "#F0FAFA", card: "#FFFFFF", border: "#D0EEEE",
//   text: "#1A2E2E", muted: "#7A9E9E",
// };

// const PAYMENT_METHODS = [
//   { id: "upi",        label: "UPI / QR Code",        emoji: "📱", desc: "GPay, PhonePe, Paytm" },
//   { id: "card",       label: "Credit / Debit Card",   emoji: "💳", desc: "Visa, Mastercard, RuPay" },
//   { id: "netbanking", label: "Net Banking",           emoji: "🏦", desc: "All major banks" },
//   { id: "wallet",     label: "Community Wallet",      emoji: "👛", desc: "Use prepaid balance" },
// ];

// export default function AmenityPaymentScreen({ navigation, route }) {
//   const theme = useTheme();
//   // ✅ All hooks at top level
//   const payAmenityBooking = useResidentStore(s => s.payAmenityBooking);
//   const amenityBookings   = useResidentStore(s => s.amenityBookings);

//   const [method, setMethod] = useState("upi");
//   const [paying,  setPaying]  = useState(false);

//   const { booking: passedBooking } = route.params || {};
//   // Get live booking in case store has updated version
//   const booking = amenityBookings.find(b => b.id === passedBooking?.id) || passedBooking;

//   if (!booking) {
//     return (
//       <SafeAreaView style={st.screen}>
//         <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//           <Text style={{ fontSize: 48 }}>😕</Text>
//           <Text style={{ color: C.muted, fontSize: 16, marginTop: 12 }}>Booking not found</Text>
//           <TouchableOpacity style={[st.btn, { marginTop: 20, paddingHorizontal: 24 }]} onPress={() => navigation.navigate("Amenities")}>
//             <Text style={st.btnT}>Go to Amenities</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const handlePay = () => {
//     setPaying(true);
//     setTimeout(() => {
//       // payAmenityBooking marks booking confirmed + pushes to adminStore
//       const paid = payAmenityBooking(booking.id);
//       setPaying(false);
//       navigation.replace("AmenityConfirmation", {
//         booking: { ...booking, status: "confirmed", paymentStatus: "paid" },
//       });
//     }, 1500);
//   };

//   const formattedDate = booking.date
//     ? new Date(booking.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "long", year: "numeric" })
//     : booking.date;

//   return (
//     <SafeAreaView style={st.screen}>
//       <StatusBar barStyle="light-content" backgroundColor={C.primary} />

//       {/* Header */}
//       <View style={st.hdr}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={st.back}>
//           <Text style={st.backT}>← Back</Text>
//         </TouchableOpacity>
//         <Text style={st.hdrT}>Complete Payment</Text>
//         <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
//           Secure payment · Booking confirmed instantly
//         </Text>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

//         {/* ── Order Summary ── */}
//         <View style={[st.card, { borderColor: C.accent, borderWidth: 1.5 }]}>
//           <Text style={{ fontWeight: "800", color: C.text, fontSize: 14, marginBottom: 12 }}>🧾 Order Summary</Text>
//           <View style={st.summaryRow}>
//             <Text style={st.summaryLabel}>Amenity</Text>
//             <Text style={st.summaryVal}>{booking.amenityEmoji || ""} {booking.amenityName}</Text>
//           </View>
//           <View style={st.summaryRow}>
//             <Text style={st.summaryLabel}>Date</Text>
//             <Text style={st.summaryVal}>{formattedDate}</Text>
//           </View>
//           <View style={st.summaryRow}>
//             <Text style={st.summaryLabel}>Time Slot</Text>
//             <Text style={st.summaryVal}>{booking.slot}</Text>
//           </View>
//           <View style={st.summaryRow}>
//             <Text style={st.summaryLabel}>Members</Text>
//             <Text style={st.summaryVal}>{booking.members || 1}</Text>
//           </View>
//           <View style={st.summaryRow}>
//             <Text style={st.summaryLabel}>Booking ID</Text>
//             <Text style={[st.summaryVal, { fontFamily: "monospace", fontSize: 11 }]}>{booking.id}</Text>
//           </View>
//           <View style={{ height: 1, backgroundColor: C.border, marginVertical: 12 }} />
//           <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
//             <Text style={{ fontWeight: "900", color: C.text, fontSize: 16 }}>Total Amount</Text>
//             <Text style={{ fontWeight: "900", color: C.accent, fontSize: 26 }}>₹{booking.amount}</Text>
//           </View>
//         </View>

//         {/* ── Payment Method ── */}
//         <Text style={st.sectionLabel}>SELECT PAYMENT METHOD</Text>
//         {PAYMENT_METHODS.map(m => (
//           <TouchableOpacity
//             key={m.id}
//             style={[st.card, { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 8,
//               borderColor: method === m.id ? C.primary : C.border,
//               borderWidth: method === m.id ? 2 : 1,
//               backgroundColor: method === m.id ? "#E8F5F5" : C.card,
//             }]}
//             onPress={() => setMethod(m.id)}
//           >
//             <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: method === m.id ? C.primary : "#F0FAFA", alignItems: "center", justifyContent: "center" }}>
//               <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={{ fontWeight: "700", color: C.text, fontSize: 14 }}>{m.label}</Text>
//               <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{m.desc}</Text>
//             </View>
//             <View style={{
//               width: 22, height: 22, borderRadius: 11, borderWidth: 2,
//               borderColor: method === m.id ? C.primary : C.muted,
//               backgroundColor: method === m.id ? C.primary : "transparent",
//               alignItems: "center", justifyContent: "center",
//             }}>
//               {method === m.id && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFF" }} />}
//             </View>
//           </TouchableOpacity>
//         ))}

//         {/* ── Security Note ── */}
//         <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, backgroundColor: "#E8F5F5", borderRadius: 12, marginTop: 4, marginBottom: 16 }}>
//           <Text style={{ fontSize: 20 }}>🔒</Text>
//           <Text style={{ flex: 1, fontSize: 11, color: C.muted, lineHeight: 16 }}>
//             Your payment is secure and encrypted. Booking will be confirmed instantly after payment and reflected to the admin dashboard.
//           </Text>
//         </View>

//         {/* ── Pay Button ── */}
//         <TouchableOpacity
//           style={[st.btn, paying && { opacity: 0.7 }]}
//           onPress={handlePay}
//           disabled={paying}
//         >
//           {paying ? (
//             <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
//               <ActivityIndicator color="#FFF" size="small" />
//               <Text style={st.btnT}>Processing Payment...</Text>
//             </View>
//           ) : (
//             <Text style={st.btnT}>💳 Pay ₹{booking.amount} & Confirm Booking</Text>
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={{ paddingVertical: 14, alignItems: "center", marginTop: 8 }}
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={{ color: C.muted, fontSize: 14, fontWeight: "600" }}>Cancel & Go Back</Text>
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
//   backT:       { color: "rgba(255,255,255,0.8)", fontSize: 14 },
//   hdrT:        { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
//   sectionLabel:{ fontSize: 11, fontWeight: "800", color: C.muted, letterSpacing: 1, marginBottom: 12, marginTop: 8 },
//   card:        { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
//   summaryRow:  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.border },
//   summaryLabel:{ fontSize: 12, color: C.muted, fontWeight: "600" },
//   summaryVal:  { fontSize: 13, color: C.text, fontWeight: "700", maxWidth: "60%", textAlign: "right" },
//   btn:         { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
//   btnT:        { color: "#FFF", fontSize: 16, fontWeight: "800" },
// });










































/**
 * AmenityPaymentScreen.js
 * Expo Go compatible - uses WebView + Razorpay JS checkout.
 *
 * SECURITY FIX (merged):
 *  - residentId, residentName, unit removed from /confirm-free and /create-order bodies
 *    (backend derives these from JWT via CurrentUser.get())
 *  - Authorization: Bearer <token> added to all fetch calls
 *  - /verify-payment also carries Authorization header
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { WebView } from "react-native-webview";
import useResidentStore from "../../../store/residentStore";
import { useAuthStore } from "../../../store/AuthStore";
import { apiUrl } from "../../../services/apiClient";

const RAZORPAY_KEY_ID = "rzp_test_SnbPPu9JniMOi8";

const C = {
  primary: "#1A7A7A",
  accent: "#D4AF5A",
  bg: "#F0FAFA",
  border: "#D0EEEE",
  text: "#1A2E2E",
  muted: "#7A9E9E",
};

export default function AmenityPaymentScreen({ navigation, route }) {
  const user = useAuthStore((s) => s.user);
  // FIX: get token for Authorization header
  const token = useAuthStore((s) => s.token);
  const amenityBookings = useResidentStore((s) => s.amenityBookings);
  const syncAmenityBooking = useResidentStore((s) => s.syncAmenityBooking);
  const [paying, setPaying] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [razorpayHtml, setRazorpayHtml] = useState("");

  const { booking: passedBooking } = route.params || {};
  const booking =
    amenityBookings.find((b) => b.id === passedBooking?.id) || passedBooking;

  if (!booking) {
    return (
      <SafeAreaView style={st.screen}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: "700" }}>
            Booking not found
          </Text>
          <TouchableOpacity
            style={[st.btn, { marginTop: 20 }]}
            onPress={() => navigation.navigate("Amenities")}
          >
            <Text style={st.btnT}>Go to Amenities</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = booking.date
    ? new Date(`${booking.date}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : booking.date;

  const buildHtml = (orderData) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, sans-serif;
      background: #F0FAFA;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .spinner {
      width: 52px;
      height: 52px;
      border: 4px solid #D0EEEE;
      border-top-color: #1A7A7A;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 18px;
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
        key: "${RAZORPAY_KEY_ID}",
        amount: ${orderData.amount},
        currency: "INR",
        name: "BS Gated Community",
        description: "Amenity - ${booking.amenityName}",
        order_id: "${orderData.razorpayOrderId}",
        prefill: {
          name: "${user?.name || "Resident"}",
          email: "${user?.email || "resident@bsgated.com"}",
          contact: "${user?.phone || "9999999999"}"
        },
        theme: { color: "#1A7A7A" },
        handler: function(response) {
          postToApp({
            type: "SUCCESS",
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        modal: {
          ondismiss: function() {
            postToApp({ type: "CANCELLED" });
          }
        }
      });

      rzp.on("payment.failed", function(response) {
        postToApp({
          type: "FAILED",
          message: response.error.description || "Payment failed"
        });
      });

      rzp.open();
    });
  </script>
</body>
</html>`;

  // Shared auth headers for all API calls
  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);

    try {
      // ── FREE BOOKING ──────────────────────────────────────────────────────
      if (!booking.amount || booking.amount === 0) {
        // FIX: residentId, residentName, unit removed — backend reads from JWT
        const res = await fetch(apiUrl('/amenity-bookings/confirm-free'), {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            amenityId: booking.amenityId,
            amenityName: booking.amenityName,
            amenityEmoji: booking.amenityEmoji,
            slot: booking.slot,
            date: booking.date,
            members: booking.members || 1,
            amount: 0,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to confirm booking");
        }

        const confirmedBooking = await res.json();
        syncAmenityBooking(confirmedBooking);
        setPaying(false);
        navigation.replace("AmenityConfirmation", { booking: confirmedBooking });
        return;
      }

      // ── PAID BOOKING — create Razorpay order ─────────────────────────────
      // FIX: residentId, residentName, unit removed — backend reads from JWT
      const orderRes = await fetch(apiUrl('/amenity-bookings/create-order'), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          amenityId: booking.amenityId,
          amenityName: booking.amenityName,
          amenityEmoji: booking.amenityEmoji,
          slot: booking.slot,
          date: booking.date,
          members: booking.members || 1,
          amount: booking.amount,
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
      Alert.alert("Error", err.message || "Something went wrong.");
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
        // FIX: verify-payment also carries JWT token
        const verifyRes = await fetch(apiUrl('/amenity-bookings/verify-payment'), {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            razorpayOrderId: data.razorpay_order_id,
            razorpayPaymentId: data.razorpay_payment_id,
            razorpaySignature: data.razorpay_signature,
          }),
        });

        const verifiedBooking = await verifyRes.json().catch(() => ({}));
        if (!verifyRes.ok) {
          throw new Error(verifiedBooking.message || "Payment verification failed.");
        }

        syncAmenityBooking(verifiedBooking);
        setPaying(false);

        Alert.alert(
          "✅ Payment Successful!",
          `Your Entry OTP: ${verifiedBooking.otp}\n\nShow this to the guard at entry.`,
          [
            {
              text: "View Booking",
              onPress: () =>
                navigation.replace("AmenityConfirmation", {
                  booking: verifiedBooking,
                }),
            },
          ]
        );
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
            <TouchableOpacity
              onPress={() => {
                setShowWebView(false);
                Alert.alert("Cancelled", "Payment was cancelled.");
              }}
            >
              <Text style={st.modalClose}>Close</Text>
            </TouchableOpacity>
            <Text style={st.modalTitle}>Secure Payment</Text>
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
                <Text style={{ color: C.muted, marginTop: 12, fontSize: 14 }}>
                  Loading Razorpay...
                </Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>

      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={st.backT}>Back</Text>
        </TouchableOpacity>
        <Text style={st.hdrT}>Complete Payment</Text>
        <Text style={st.hdrSub}>Secure payment via Razorpay</Text>
      </View>

      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        <View style={[st.card, { borderColor: C.accent, borderWidth: 1.5 }]}>
          <Text style={st.cardTitle}>Order Summary</Text>
          {[
            ["Amenity", `${booking.amenityEmoji || ""} ${booking.amenityName}`.trim()],
            ["Date", formattedDate],
            ["Time Slot", booking.slot],
            ["Members", String(booking.members || 1)],
            ["Booking ID", String(booking.id)],
          ].map(([label, value]) => (
            <View key={label} style={st.row}>
              <Text style={st.rowLabel}>{label}</Text>
              <Text style={[st.rowVal, label === "Booking ID" && { fontSize: 11 }]}>
                {value}
              </Text>
            </View>
          ))}
          <View style={st.divider} />
          <View style={st.totalRow}>
            <Text style={st.totalLabel}>Total</Text>
            <Text style={st.totalValue}>Rs.{booking.amount}</Text>
          </View>
        </View>

        {booking.amount > 0 ? (
          <View style={st.testModeCard}>
            <Text style={st.testModeTitle}>Razorpay Test Mode</Text>
            <Text style={st.testModeText}>
              UPI: use success@razorpay for a successful test payment.
            </Text>
            <Text style={st.testModeText}>
              Net banking: after selecting a bank, Razorpay opens a mock page. Choose Success there.
            </Text>
            <Text style={st.testModeText}>
              Card: use Razorpay test card details while using test keys.
            </Text>
          </View>
        ) : null}

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
          ) : booking.amount === 0 ? (
            <Text style={st.btnT}>Confirm Free Booking</Text>
          ) : (
            <Text style={st.btnT}>Pay Rs.{booking.amount} via Razorpay</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingVertical: 14, alignItems: "center", marginTop: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: C.muted, fontSize: 14, fontWeight: "600" }}>
            Cancel and Go Back
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  hdr: { padding: 20, paddingTop: 40, backgroundColor: C.primary },
  backT: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 8 },
  hdrT: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  hdrSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  content: { padding: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTitle: { fontWeight: "800", color: C.text, fontSize: 14, marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  rowLabel: { fontSize: 12, color: C.muted, fontWeight: "600" },
  rowVal: {
    fontSize: 13,
    color: C.text,
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontWeight: "900", color: C.text, fontSize: 16 },
  totalValue: { fontWeight: "900", color: C.accent, fontSize: 26 },
  testModeCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  testModeTitle: { fontSize: 13, fontWeight: "800", color: "#92400E", marginBottom: 8 },
  testModeText: { fontSize: 12, color: "#A16207", lineHeight: 18, marginBottom: 6 },
  btn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnT: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: C.primary,
  },
  modalClose: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  modalTitle: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  webLoader: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
  },
});