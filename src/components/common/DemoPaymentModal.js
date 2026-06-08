import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const C = {
  primary: "#1A7A7A",
  primaryDark: "#155F5F",
  accent: "#D4AF5A",
  bg: "#F0FAFA",
  card: "#FFFFFF",
  border: "#D0EEEE",
  text: "#1A2E2E",
  muted: "#7A9E9E",
  soft: "#E8F5F5",
  successSoft: "#ECFDF5",
};

const METHODS = [
  { key: "upi", label: "UPI", icon: "UPI", sub: "Google Pay, PhonePe, Paytm" },
  { key: "card", label: "Card", icon: "CARD", sub: "Credit, debit, RuPay, Visa" },
  { key: "netbanking", label: "Net Banking", icon: "BANK", sub: "SBI, HDFC, ICICI, Axis" },
  { key: "wallet", label: "Wallet", icon: "WAL", sub: "Amazon Pay, Paytm Wallet" },
];

const UPI_APPS = ["Google Pay", "PhonePe", "Paytm", "BHIM", "Other UPI"];
const BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank"];

const fakeId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export default function DemoPaymentModal({
  visible,
  amount,
  title = "Secure Payment",
  subtitle = "Fully simulated checkout for demos",
  payLabel,
  onClose,
  onSuccess,
}) {
  const [method, setMethod] = useState("upi");
  const [upiApp, setUpiApp] = useState("Google Pay");
  const [upiId, setUpiId] = useState("demo@upi");
  const [bank, setBank] = useState(BANKS[0]);
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardName, setCardName] = useState("Demo Resident");
  const [cardExpiry, setCardExpiry] = useState("12/29");
  const [cardCvv, setCardCvv] = useState("123");
  const [processing, setProcessing] = useState(false);

  const selectedMethod = useMemo(
    () => METHODS.find((item) => item.key === method) || METHODS[0],
    [method]
  );

  const formattedAmount = Number(amount || 0).toLocaleString("en-IN");

  const handleSuccess = () => {
    if (processing) return;
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      onSuccess?.({
        type: "SUCCESS",
        razorpay_payment_id: fakeId("pay_demo"),
        razorpay_order_id: fakeId("order_demo"),
        razorpay_signature: fakeId("sig_demo"),
        method,
        methodLabel: selectedMethod.label,
      });
    }, 900);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={st.screen}>
        <View style={st.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={st.closeText}>Close</Text>
          </TouchableOpacity>
          <Text style={st.headerTitle}>{title}</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
          <View style={st.testModeCard}>
            <Text style={st.testModeTitle}>TEST MODE (current)</Text>
            <Text style={st.testModeText}>
              Fully simulated payment UI. No Razorpay modal opens.
            </Text>
            <Text style={st.testModeText}>
              Tapping Pay returns a fake payment ID and continues the success flow.
            </Text>
          </View>

          <View style={st.amountCard}>
            <Text style={st.amountLabel}>Amount to Pay</Text>
            <Text style={st.amountValue}>Rs. {formattedAmount}</Text>
            <Text style={st.amountSub}>{subtitle}</Text>
          </View>

          <Text style={st.sectionLabel}>Choose Payment Method</Text>
          <View style={st.methodList}>
            {METHODS.map((item) => {
              const active = item.key === method;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[st.methodCard, active && st.methodCardActive]}
                  onPress={() => setMethod(item.key)}
                >
                  <View style={[st.methodIcon, active && st.methodIconActive]}>
                    <Text style={[st.methodIconText, active && st.methodIconTextActive]}>
                      {item.icon}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[st.methodTitle, active && st.methodTitleActive]}>
                      {item.label}
                    </Text>
                    <Text style={st.methodSub}>{item.sub}</Text>
                  </View>
                  <View style={[st.radio, active && st.radioActive]} />
                </TouchableOpacity>
              );
            })}
          </View>

          {method === "upi" ? (
            <View style={st.card}>
              <Text style={st.sectionLabel}>UPI App</Text>
              <View style={st.chipRow}>
                {UPI_APPS.map((item) => {
                  const active = upiApp === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[st.chip, active && st.chipActive]}
                      onPress={() => setUpiApp(item)}
                    >
                      <Text style={[st.chipText, active && st.chipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={st.inputLabel}>UPI ID</Text>
              <TextInput
                value={upiId}
                onChangeText={setUpiId}
                style={st.input}
                placeholder="name@bank"
                placeholderTextColor={C.muted}
              />
            </View>
          ) : null}

          {method === "card" ? (
            <View style={st.card}>
              <Text style={st.inputLabel}>Card Number</Text>
              <TextInput
                value={cardNumber}
                onChangeText={setCardNumber}
                style={st.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={C.muted}
                keyboardType="number-pad"
              />
              <Text style={st.inputLabel}>Cardholder Name</Text>
              <TextInput
                value={cardName}
                onChangeText={setCardName}
                style={st.input}
                placeholder="Name on card"
                placeholderTextColor={C.muted}
              />
              <View style={st.row}>
                <View style={{ flex: 1 }}>
                  <Text style={st.inputLabel}>Expiry</Text>
                  <TextInput
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                    style={st.input}
                    placeholder="MM/YY"
                    placeholderTextColor={C.muted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.inputLabel}>CVV</Text>
                  <TextInput
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    style={st.input}
                    placeholder="123"
                    placeholderTextColor={C.muted}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          ) : null}

          {method === "netbanking" ? (
            <View style={st.card}>
              <Text style={st.sectionLabel}>Select Bank</Text>
              {BANKS.map((item) => {
                const active = bank === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[st.bankRow, active && st.bankRowActive]}
                    onPress={() => setBank(item)}
                  >
                    <Text style={[st.bankText, active && st.bankTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {method === "wallet" ? (
            <View style={st.card}>
              <Text style={st.sectionLabel}>Wallet Checkout</Text>
              <Text style={st.walletText}>
                Wallet balance is shown as available for demo. No real debit happens in test mode.
              </Text>
              <View style={st.walletCard}>
                <Text style={st.walletLabel}>Available Balance</Text>
                <Text style={st.walletValue}>Rs. 5,000</Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            style={[st.payButton, processing && { opacity: 0.75 }]}
            onPress={handleSuccess}
            disabled={processing}
          >
            {processing ? (
              <View style={st.processingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={st.payButtonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={st.payButtonText}>
                {payLabel || `Pay Rs. ${formattedAmount}`}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={st.footerText}>
            Demo checkout only. Razorpay integration is preserved in code and can be re-enabled later.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  content: { padding: 16, paddingBottom: 36 },
  testModeCard: {
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#F4D58D",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  testModeTitle: { color: "#8A5A00", fontSize: 13, fontWeight: "900", marginBottom: 6 },
  testModeText: { color: "#8A5A00", fontSize: 12, lineHeight: 18 },
  amountCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.accent,
    padding: 18,
    marginBottom: 16,
  },
  amountLabel: { color: C.muted, fontSize: 12, fontWeight: "700" },
  amountValue: { color: C.primaryDark, fontSize: 30, fontWeight: "900", marginTop: 6 },
  amountSub: { color: C.text, fontSize: 12, marginTop: 6 },
  sectionLabel: { color: C.text, fontSize: 13, fontWeight: "800", marginBottom: 10 },
  methodList: { gap: 10, marginBottom: 16 },
  methodCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  methodCardActive: { borderColor: C.primary, backgroundColor: C.soft },
  methodIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  methodIconActive: { backgroundColor: C.primary },
  methodIconText: { color: C.primary, fontSize: 11, fontWeight: "900" },
  methodIconTextActive: { color: "#FFFFFF" },
  methodTitle: { color: C.text, fontSize: 14, fontWeight: "800" },
  methodTitleActive: { color: C.primaryDark },
  methodSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: C.border,
  },
  radioActive: { borderColor: C.primary, backgroundColor: C.primary },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 16,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { color: C.text, fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: "#FFFFFF" },
  inputLabel: { color: C.muted, fontSize: 12, fontWeight: "700", marginBottom: 6 },
  input: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.text,
    marginBottom: 12,
  },
  row: { flexDirection: "row", gap: 10 },
  bankRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    marginBottom: 8,
  },
  bankRowActive: { borderColor: C.primary, backgroundColor: C.soft },
  bankText: { color: C.text, fontSize: 13, fontWeight: "700" },
  bankTextActive: { color: C.primaryDark },
  walletText: { color: C.muted, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  walletCard: {
    backgroundColor: C.successSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#B7E4C7",
    padding: 14,
  },
  walletLabel: { color: "#166534", fontSize: 12, fontWeight: "700" },
  walletValue: { color: "#166534", fontSize: 24, fontWeight: "900", marginTop: 4 },
  payButton: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  payButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  processingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  footerText: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 12,
  },
});
