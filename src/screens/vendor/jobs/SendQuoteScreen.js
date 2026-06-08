// import React, { useState } from 'react';
// import {
//   View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform,
//   StyleSheet, SafeAreaView, StatusBar, Alert,
// } from 'react-native';
// import { Colors, Fonts, Radius } from '../../../vendor/theme';
// import { AppHeader, Card, PrimaryButton } from '../../../vendor/components';
// import useSharedStore from '../../../store/appStore';
// import { useTheme } from '../../../hooks/useTheme';

// export default function SendQuoteScreen({ navigation, route }) {
//   const theme = useTheme();
//   const { requestId } = route?.params || {};
//   const requests    = useSharedStore(s => s.maintenanceRequests);
//   const submitQuote = useSharedStore(s => s.submitQuote);

//   const request = requests.find(r => r.id === requestId) || { id: requestId, category: 'Service', residentName: '' };

//   const [amount,      setAmount]      = useState('');
//   const [description, setDescription] = useState('');
//   const [estDays,     setEstDays]     = useState('');

//   const handleSubmit = () => {
//     if (!amount || !description || !estDays) {
//       Alert.alert('Missing Fields', 'Please fill in all fields before submitting.');
//       return;
//     }
//     submitQuote(request.id, {
//       amount:       parseFloat(amount),
//       description,
//       estimatedDays: parseInt(estDays, 10),
//     });
//     Alert.alert('Quote Submitted', 'Admin will review and forward to the resident.', [
//       { text: 'OK', onPress: () => navigation.navigate('RequestList') },
//     ]);
//   };

//   return (
//     <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
//       <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
//       <AppHeader title="Send Quote" onBack={() => navigation.goBack()} />

//       <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
//         <ScrollView
//           contentContainerStyle={styles.scroll}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//         >

//           {/* Info banner */}
//           <View style={styles.infoBanner}>
//             <Text style={styles.infoBannerText}>
//               {request.id}  ·  {request.category}  ·  {request.residentName}
//             </Text>
//           </View>

//           {/* Issue title read-only */}
//           <Card>
//             <Text style={styles.label}>Issue</Text>
//             <Text style={styles.issueText}>{request.title || request.description || '—'}</Text>
//           </Card>

//           {/* Amount */}
//           <Card>
//             <Text style={styles.label}>Quote Amount (₹) *</Text>
//             <View style={styles.amountRow}>
//               <View style={styles.currencyBox}><Text style={styles.currency}>₹</Text></View>
//               <TextInput
//                 value={amount}
//                 onChangeText={setAmount}
//                 keyboardType="numeric"
//                 style={styles.amountInput}
//                 placeholderTextColor={Colors.text3}
//                 placeholder="0"
//               />
//             </View>
//           </Card>

//           {/* Work Description */}
//           <Card>
//             <Text style={styles.label}>Work Description *</Text>
//             <TextInput
//               value={description}
//               onChangeText={setDescription}
//               multiline
//               numberOfLines={4}
//               style={styles.textarea}
//               placeholderTextColor={Colors.text3}
//               placeholder="Describe the work you will do..."
//               textAlignVertical="top"
//             />
//           </Card>

//           {/* Estimated Days */}
//           <Card>
//             <Text style={styles.label}>Estimated Days to Complete *</Text>
//             <TextInput
//               value={estDays}
//               onChangeText={setEstDays}
//               keyboardType="numeric"
//               style={styles.input}
//               placeholderTextColor={Colors.text3}
//               placeholder="e.g. 3"
//             />
//           </Card>

//           {/* Summary */}
//           {amount ? (
//             <Card style={styles.summaryCard}>
//               <Text style={styles.summaryTitle}>Quote Summary</Text>
//               {[
//                 ['Category',  request.category || '—'],
//                 ['Amount',    amount ? ('₹' + amount) : '—'],
//                 ['Est. Days', estDays ? (estDays + ' days') : '—'],
//               ].map(([k, v], i) => (
//                 <View key={i} style={[styles.summaryRow, i < 2 && styles.summaryBorder]}>
//                   <Text style={styles.summaryKey}>{k}</Text>
//                   <Text style={styles.summaryVal}>{v}</Text>
//                 </View>
//               ))}
//             </Card>
//           ) : null}

//         </ScrollView>
//       </KeyboardAvoidingView>

//       <View style={styles.footer}>
//         <PrimaryButton title="Submit Quote to Admin" onPress={handleSubmit} color={Colors.purple} />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe:   { flex: 1, backgroundColor: Colors.bg },
//   scroll: { padding: 16, paddingBottom: 100 },

//   infoBanner: { backgroundColor: Colors.tealLight, borderRadius: Radius.md, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.teal + '40' },
//   infoBannerText: { fontSize: 12, color: Colors.purple, fontWeight: Fonts.semiBold },

//   label: { fontSize: 12, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 8 },
//   issueText: { fontSize: 14, color: Colors.text, lineHeight: 20 },

//   amountRow:   { flexDirection: 'row', alignItems: 'center' },
//   currencyBox: { paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border, borderRightWidth: 0, borderTopLeftRadius: Radius.md, borderBottomLeftRadius: Radius.md },
//   currency:    { fontSize: 16, fontWeight: Fonts.bold, color: Colors.purple },
//   amountInput: { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderTopRightRadius: Radius.md, borderBottomRightRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: Fonts.bold, color: Colors.text },

//   input:    { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text },
//   textarea: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text, minHeight: 90 },

//   summaryCard:  { backgroundColor: Colors.tealLight, borderColor: Colors.teal + '30' },
//   summaryTitle: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.purple, marginBottom: 10 },
//   summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
//   summaryBorder:{ borderBottomWidth: 1, borderBottomColor: Colors.purple + '20' },
//   summaryKey:   { fontSize: 13, color: Colors.text2 },
//   summaryVal:   { fontSize: 13, fontWeight: Fonts.bold, color: Colors.text },

//   footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
// });
























/**
 * SendQuoteScreen.js — Vendor
 *
 * SECURITY FIX (merged):
 *  - appStore.submitQuote replaced with maintenanceStore.vendorSubmitQuote
 *  - Token from useAuthStore(s => s.token)
 *  - vendorId never sent — backend reads from JWT
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform,
  StyleSheet, SafeAreaView, StatusBar, Alert, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import useMaintenanceStore from '../../../store/maintenanceStore';

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', tealSoft: '#E8F5F5',
  bg: '#E8F5F5', surface: '#FFF', text: '#1A2E2E',
  muted: '#7A9E9E', border: '#D0EEEE',
  green: '#15803D', greenBg: '#DCFCE7',
  purple: '#6D28D9', purpleBg: '#EDE9FE',
};

function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export default function SendQuoteScreen({ navigation, route }) {
  const { requestId } = route?.params || {};

  const token = useAuthStore(s => s.token);
  const vendorJobs = useMaintenanceStore(s => s.vendorJobs);
  const requests = useMaintenanceStore(s => s.requests);
  const vendorSubmitQuote = useMaintenanceStore(s => s.vendorSubmitQuote);

  const request = vendorJobs.find(r => String(r.id) === String(requestId))
    || requests.find(r => String(r.id) === String(requestId))
    || { id: requestId, category: 'Service', residentName: '', title: '' };

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [estDays, setEstDays] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount.trim() || !description.trim() || !estDays.trim()) {
      Alert.alert('Missing Fields', 'Please fill in quote amount, description, and estimated days.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    const parsedDays = parseInt(estDays, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (isNaN(parsedDays) || parsedDays <= 0) {
      Alert.alert('Invalid Days', 'Please enter a valid number of days.');
      return;
    }

    setSubmitting(true);
    const result = await vendorSubmitQuote(token, request.id, {
      amount: parsedAmount,
      description: description.trim(),
      estimatedDays: parsedDays,
    });
    setSubmitting(false);

    if (result.ok) {
      Alert.alert(
        '✅ Quote Submitted!',
        `Your quote of ₹${parsedAmount.toLocaleString('en-IN')} has been sent to admin.\n\nAdmin will review and forward to the resident.`,
        [{ text: 'OK', onPress: () => navigation.navigate('RequestList') }]
      );
    } else {
      Alert.alert('Error', result.data?.message || 'Could not submit quote. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Submit Quote</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info banner */}
          <View style={s.infoBanner}>
            <Text style={{ fontSize: 12, color: P.teal, fontWeight: '700' }}>
              {request.id} · {request.category} · {request.residentName}
            </Text>
          </View>

          {/* Issue read-only */}
          <Card>
            <Text style={s.label}>Issue</Text>
            <Text style={{ fontSize: 14, color: P.text, lineHeight: 20 }}>
              {request.title || request.description || '—'}
            </Text>
          </Card>

          {/* Quote Amount */}
          <Card>
            <Text style={s.label}>Quote Amount (₹) *</Text>
            <View style={s.amountRow}>
              <View style={s.currencyBox}>
                <Text style={s.currency}>₹</Text>
              </View>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={s.amountInput}
                placeholderTextColor={P.muted}
                placeholder="0"
              />
            </View>
          </Card>

          {/* Work Description */}
          <Card>
            <Text style={s.label}>Work Description *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={s.textarea}
              placeholderTextColor={P.muted}
              placeholder="Describe the work you will do in detail..."
              textAlignVertical="top"
            />
          </Card>

          {/* Estimated Days */}
          <Card>
            <Text style={s.label}>Estimated Days to Complete *</Text>
            <TextInput
              value={estDays}
              onChangeText={setEstDays}
              keyboardType="numeric"
              style={s.input}
              placeholderTextColor={P.muted}
              placeholder="e.g. 2"
            />
          </Card>

          {/* Summary preview */}
          {amount ? (
            <Card style={s.summaryCard}>
              <Text style={s.summaryTitle}>📋 Quote Summary</Text>
              {[
                ['Category', request.category || '—'],
                ['Amount', amount ? `₹${parseFloat(amount).toLocaleString('en-IN')}` : '—'],
                ['Est. Days', estDays ? `${estDays} day(s)` : '—'],
                ['For Resident', request.residentName || '—'],
              ].map(([k, v], i) => (
                <View key={i} style={[s.summaryRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: '#D0EEEE', paddingBottom: 8 }]}>
                  <Text style={{ fontSize: 13, color: P.muted }}>{k}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: P.text }}>{v}</Text>
                </View>
              ))}
            </Card>
          ) : null}

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color="#FFF" />
            : <Text style={s.submitBtnText}>📤 Submit Quote to Admin</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: P.tealDark, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  scroll: { padding: 16, paddingBottom: 20 },
  infoBanner: { backgroundColor: P.tealSoft, borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#B0DEDE' },
  card: { backgroundColor: P.surface, borderRadius: 16, borderWidth: 1, borderColor: P.border, padding: 14, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#3D6E6E', marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencyBox: { paddingHorizontal: 14, paddingVertical: 12, backgroundColor: P.tealSoft, borderWidth: 1.5, borderColor: P.border, borderRightWidth: 0, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  currency: { fontSize: 16, fontWeight: '800', color: P.teal },
  amountInput: { flex: 1, borderWidth: 1.5, borderColor: P.border, borderTopRightRadius: 12, borderBottomRightRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: '700', color: P.text },
  input: { borderWidth: 1.5, borderColor: P.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: P.text },
  textarea: { borderWidth: 1.5, borderColor: P.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: P.text, minHeight: 100 },
  summaryCard: { backgroundColor: P.tealSoft },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: P.teal, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  footer: { padding: 16, backgroundColor: P.surface, borderTopWidth: 1, borderTopColor: P.border },
  submitBtn: { backgroundColor: P.teal, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
});