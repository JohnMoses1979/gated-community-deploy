// /**
//  * VendorDeliveryWorkflow.js
//  * ──────────────────────────────────────────────────────────────────────────────
//  * TEMPORARY / TESTING ONLY — Dummy delivery partner workflow inside Vendor.
//  * This file can be removed once a real third-party delivery integration is added.
//  *
//  * Screens exported:
//  *   VendorOrdersWithDeliveryScreen — enhanced orders list (replaces OrdersListScreen)
//  *   VendorAssignDeliveryScreen     — pick a dummy delivery partner + see OTP
//  *   VendorDeliveryStatusScreen     — live status of a specific order, mark delivered
//  *
//  * All screens read/write the global Zustand store (useStore).
//  */

// import React, { useState } from 'react';
// import {
//   View, Text, ScrollView, FlatList, TouchableOpacity,
//   StyleSheet, SafeAreaView, StatusBar, Alert, TextInput,
// } from 'react-native';
// import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
// import { AppHeader, Card, PrimaryButton, Badge, Avatar, Divider } from '../../../vendor/components';
// import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
// import useAppStore from '../../../store/appStore';
// import { useTheme } from '../../../hooks/useTheme';

// // ─── Dummy delivery partners ──────────────────────────────────────────────────
// const DUMMY_PARTNERS = [
//   { id: 'dp1', name: 'Rajesh Kumar',  phone: '98765 43210', vehicle: 'Bike · UP16 AB 1234', emoji: '🏍️' },
//   { id: 'dp2', name: 'Suresh Singh',  phone: '87654 32109', vehicle: 'Bike · UP14 CD 5678', emoji: '🏍️' },
//   { id: 'dp3', name: 'Anil Sharma',   phone: '76543 21098', vehicle: 'Cycle · N/A',          emoji: '🚲' },
// ];

// // ─── Helper ───────────────────────────────────────────────────────────────────
// const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

// const STATUS_META = {
//   pending:           { label: 'New',              color: Colors.amber,   bg: Colors.amberLight  },
//   accepted:          { label: 'Confirmed',         color: Colors.teal,    bg: Colors.tealLight   },
//   assigned_delivery: { label: 'Delivery Assigned', color: Colors.blue,    bg: Colors.blueLight   },
//   out_for_delivery:  { label: 'Out for Delivery',  color: Colors.blue,    bg: Colors.blueLight   },
//   delivered:         { label: 'Delivered ✅',       color: Colors.green,   bg: Colors.greenLight  },
//   rejected:          { label: 'Rejected',          color: '#C62828',      bg: '#FEE2E2'          },
//   returned:          { label: 'Returned 📦',        color: '#E8A020',      bg: '#FFF7ED'          },
// };

// // ─── 1. VendorOrdersWithDeliveryScreen ───────────────────────────────────────
// // Enhanced version of the original OrdersListScreen that includes delivery management

// export default function VendorAssignDeliveryScreen({ navigation, route }) {
//   const theme = useTheme();
//   const orderId             = route?.params?.orderId;
//   const orders              = useAppStore(s => s.marketplaceOrders);
//   const assignDeliveryPartner = useAppStore(s => s.assignDeliveryPartner);
//   const [selected, setSelected] = useState(null);
//   const order = orders.find(o => o.id === orderId);

//   if (!order) return null;

//   const handleAssign = () => {
//     if (!selected) { Alert.alert('Select a delivery partner first'); return; }
//     Alert.alert(
//       'Assign Delivery',
//       `Assign ${selected.name} to deliver order #${orderId}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Assign',
//           onPress: () => {
//             assignDeliveryPartner(orderId, selected.id, selected.name);
//             navigation.goBack();
//             Alert.alert('✅ Assigned', `${selected.name} has been assigned.\nShare OTP ${order.otp} with them to show the guard.`);
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={s.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={Colors.teal} />
//       <AppHeader title="Assign Delivery Partner" subtitle={`Order #${orderId}`} onBack={() => navigation.goBack()} />
//       <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>

//         {/* Test mode notice */}
//         <Card style={{ backgroundColor: Colors.amberLight, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
//           <Text style={{ fontSize: 20 }}>⚠️</Text>
//           <View style={{ flex: 1 }}>
//             <Text style={{ fontSize: 13, fontWeight: Fonts.bold, color: Colors.amber }}>Dummy Workflow (Testing Only)</Text>
//             <Text style={{ fontSize: 12, color: Colors.amber, marginTop: 3, lineHeight: 17 }}>
//               These are test delivery partners. In production, replace with your third-party delivery API integration.
//             </Text>
//           </View>
//         </Card>

//         {/* OTP Card */}
//         <Card style={{ backgroundColor: Colors.tealLight, alignItems: 'center' }}>
//           <Text style={{ fontSize: 13, fontWeight: Fonts.bold, color: Colors.teal, marginBottom: 6 }}>Order OTP — Share with Delivery Partner</Text>
//           <Text style={s.otpLarge}>{order.otp}</Text>
//           <Text style={{ fontSize: 11, color: Colors.teal, textAlign: 'center', marginTop: 6 }}>
//             Guard will ask delivery partner for this OTP to allow community entry.
//           </Text>
//         </Card>

//         {/* Select Partner */}
//         <Text style={[s.sectionLabel, { paddingHorizontal: 0, marginTop: 4 }]}>Select Delivery Partner</Text>
//         {DUMMY_PARTNERS.map(partner => (
//           <TouchableOpacity
//             key={partner.id}
//             style={[s.partnerCard, selected?.id === partner.id && { borderColor: Colors.teal, backgroundColor: Colors.tealLight }]}
//             onPress={() => setSelected(partner)}
//             activeOpacity={0.85}
//           >
//             <View style={[s.partnerEmoji, selected?.id === partner.id && { backgroundColor: Colors.teal }]}>
//               <Text style={{ fontSize: 26 }}>{partner.emoji}</Text>
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={[s.partnerName, selected?.id === partner.id && { color: Colors.teal }]}>{partner.name}</Text>
//               <Text style={s.partnerSub}>{partner.vehicle}</Text>
//               <Text style={s.partnerSub}>📞 {partner.phone}</Text>
//             </View>
//             <View style={[s.radioOuter, selected?.id === partner.id && { borderColor: Colors.teal }]}>
//               {selected?.id === partner.id && <View style={s.radioInner} />}
//             </View>
//           </TouchableOpacity>
//         ))}

//         {/* Order summary */}
//         <Card>
//           <Text style={s.sectionLabel}>Order Summary</Text>
//           {[
//             ['Customer',  `${order.residentName} · Unit ${order.unit}`],
//             ['Items',     `${order.items.length} item${order.items.length > 1 ? 's' : ''}`],
//             ['Total',     `₹${order.total}`],
//             ['Placed At', fmt(order.placedAt)],
//           ].map(([k, v], i) => (
//             <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: Colors.border }}>
//               <Text style={{ fontSize: 12, color: Colors.text2 }}>{k}</Text>
//               <Text style={{ fontSize: 13, fontWeight: Fonts.semiBold, color: Colors.text }}>{v}</Text>
//             </View>
//           ))}
//         </Card>

//       </ScrollView>

//       <View style={s.footer}>
//         <PrimaryButton
//           title={selected ? `Assign ${selected.name}` : 'Select a Partner to Assign'}
//           onPress={handleAssign}
//           color={Colors.teal}
//           style={{ opacity: selected ? 1 : 0.5 }}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:   { flex: 1, backgroundColor: Colors.bg },
//   scroll: { padding: 16, paddingBottom: 100 },
//   footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },

//   listHeader:    { backgroundColor: Colors.teal, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
//   listHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
//   backBtn:       { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
//   backArrow:     { fontSize: 22, color: Colors.text, fontWeight: '700', marginTop: -2 },
//   heading:       { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFFFFF', flex: 1 },
//   dummyBadge:    { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Colors.amberLight, borderRadius: Radius.md },
//   dummyBadgeText:{ fontSize: 10, color: Colors.amber, fontWeight: Fonts.bold },

//   catChip:    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
//   catChipText:{ fontSize: 12, color: Colors.text2, fontWeight: Fonts.medium },

//   orderCard:  { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
//   orderTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
//   orderId:    { fontSize: 15, fontWeight: Fonts.extraBold, color: Colors.text },
//   orderName:  { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text },
//   orderMeta:  { fontSize: 11, color: Colors.text3, marginTop: 1 },
//   actionBtn:  { flex: 1, paddingVertical: 11, borderRadius: Radius.md, alignItems: 'center' },
//   actionBtnText: { fontSize: 13, fontWeight: Fonts.bold },

//   otpChip:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.tealLight, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8, flexWrap: 'wrap' },
//   otpChipLabel: { fontSize: 12, fontWeight: Fonts.bold, color: Colors.teal },
//   otpChipValue: { fontSize: 18, fontWeight: Fonts.extraBold, color: Colors.teal, letterSpacing: 4 },
//   otpChipSub:   { fontSize: 11, color: Colors.teal },
//   otpLarge:     { fontSize: 42, fontWeight: Fonts.extraBold, color: Colors.teal, letterSpacing: 12, textAlign: 'center' },

//   sectionLabel: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 12 },

//   partnerCard:  { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 2, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadows.card },
//   partnerEmoji: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
//   partnerName:  { fontSize: 15, fontWeight: Fonts.bold, color: Colors.text },
//   partnerSub:   { fontSize: 12, color: Colors.text2, marginTop: 2 },
//   radioOuter:   { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
//   radioInner:   { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.teal },

//   trackCircle:  { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
//   trackLine:    { width: 2, height: 28, marginTop: 2 },

//   emptyContainer:{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
//   emptyTitle:    { fontSize: 18, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 6 },
// });

















































/**
 * VendorAssignDeliveryScreen.js — FIXED & COMPLETE
 *
 * Root cause of blank screen (fixed):
 *  1. Was importing DUMMY_PARTNERS from old VendorDeliveryWorkflow.js
 *  2. Was calling useAppStore.assignDeliveryPartner (local Zustand, not API)
 *  3. Was accessing order.items directly — model stores itemsJson (string), not parsed array
 *  4. Was never calling fetchActiveStaff() — list was always empty
 *  5. No loading/error state shown to user
 *
 * What this screen does now:
 *  - Fetches vendor's ACTIVE delivery helpers from GET /api/vendor/delivery-staff/active
 *  - Marks helpers as BUSY if they have an in-progress order (via busy flag returned by API)
 *  - Prevents selecting a BUSY helper (greyed out with "On Delivery" badge)
 *  - On confirm: calls PUT /api/vendor/orders/{id}/assign-delivery with { deliveryStaffId }
 *  - Updates Zustand order slice so VendorOrdersScreen reflects new status immediately
 *  - On success: navigates back and shows alert with OTP to share
 *
 * Route params: { orderId }
 * Route name:   VendorAssignDelivery
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton } from '../../../vendor/components';
import { useDeliveryStaffSlice } from '../../../services/deliveryStaffApi';
import { useVendorOrderSlice } from '../../../api/marketplaceApi';

// ─── Vehicle emoji helper ─────────────────────────────────────────────────────
function vehicleEmoji(vehicleType) {
  if (!vehicleType) return '🚶';
  const v = vehicleType.toLowerCase();
  if (v.includes('bike') || v.includes('motor')) return '🏍️';
  if (v.includes('cycle') || v.includes('bicycle')) return '🚲';
  if (v.includes('auto')) return '🛺';
  if (v.includes('car')) return '🚗';
  return '🚶';
}

// ─── Date formatter ────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }) : '—';

// ─── Helper Card ──────────────────────────────────────────────────────────────
function HelperCard({ helper, selected, onSelect }) {
  const isBusy = helper.busy === true;
  const isSelected = selected?.id === helper.id;

  return (
    <TouchableOpacity
      style={[
        s.helperCard,
        isSelected && s.helperCardSelected,
        isBusy && s.helperCardBusy,
      ]}
      onPress={() => {
        if (isBusy) {
          Alert.alert(
            '⚠️ Helper Busy',
            `${helper.name} is currently on another delivery and cannot be assigned right now.\n\nWait for their current delivery to complete or choose a different helper.`,
          );
          return;
        }
        onSelect(helper);
      }}
      activeOpacity={isBusy ? 1 : 0.85}
    >
      {/* Vehicle icon */}
      <View style={[
        s.helperIconBox,
        isSelected && { backgroundColor: Colors.teal },
        isBusy && { backgroundColor: '#F1F5F9' },
      ]}>
        <Text style={{ fontSize: 26 }}>{vehicleEmoji(helper.vehicleType)}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={[s.helperName, isSelected && { color: Colors.teal }, isBusy && { color: '#94A3B8' }]}>
            {helper.name}
          </Text>
          {isBusy && (
            <View style={s.busyBadge}>
              <Text style={s.busyBadgeText}>🚚 On Delivery</Text>
            </View>
          )}
        </View>
        <Text style={[s.helperSub, isBusy && { color: '#CBD5E1' }]}>
          📞 {helper.phone}
        </Text>
        {helper.vehicleType ? (
          <Text style={[s.helperSub, isBusy && { color: '#CBD5E1' }]}>
            {vehicleEmoji(helper.vehicleType)} {helper.vehicleType}
          </Text>
        ) : null}
      </View>

      {/* Radio */}
      {!isBusy && (
        <View style={[s.radioOuter, isSelected && { borderColor: Colors.teal }]}>
          {isSelected && <View style={s.radioInner} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VendorAssignDeliveryScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;

  // ── Zustand slices ─────────────────────────────────────────────────────────
  // Orders slice — to get order details + update after assignment
  const { orders, assignDelivery } = useVendorOrderSlice();

  // Staff slice — to fetch active helpers
  const { activeStaff, loading: staffLoading, error: staffError, fetchActiveStaff } = useDeliveryStaffSlice();

  // ── Local state ────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Resolve order from store ───────────────────────────────────────────────
  // Parse itemsJson safely — the model stores JSON string, not a real array
  const order = orders.find(o => String(o.id) === String(orderId));
  let parsedItems = [];
  if (order) {
    try { parsedItems = JSON.parse(order.itemsJson || '[]'); } catch { parsedItems = []; }
  }

  // ── Fetch active helpers on mount ──────────────────────────────────────────
  useEffect(() => {
    fetchActiveStaff().catch(() => { });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchActiveStaff(); } catch { }
    setRefreshing(false);
  }, [fetchActiveStaff]);

  // ── Guard: orderId must be present ────────────────────────────────────────
  if (!orderId) {
    return (
      <SafeAreaView style={s.safe}>
        <AppHeader title="Assign Delivery Helper" onBack={() => navigation.goBack()} />
        <View style={s.centeredMsg}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={s.centeredText}>No order ID provided. Please go back and try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Guard: order must exist in Zustand (may not be loaded yet) ────────────
  if (!order) {
    return (
      <SafeAreaView style={s.safe}>
        <AppHeader title="Assign Delivery Helper" subtitle={`Order #${orderId}`} onBack={() => navigation.goBack()} />
        <View style={s.centeredMsg}>
          <ActivityIndicator size="large" color={Colors.teal} />
          <Text style={[s.centeredText, { marginTop: 16 }]}>Loading order details…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Assignment handler ─────────────────────────────────────────────────────
  const handleAssign = () => {
    if (!selected) {
      Alert.alert('No Helper Selected', 'Please select a delivery helper before assigning.');
      return;
    }

    Alert.alert(
      '🚚 Assign Delivery Helper',
      `Assign ${selected.name} to deliver Order #${orderId}?\n\nThey will be marked BUSY until this order is delivered.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async () => {
            setAssigning(true);
            try {
              // assignDelivery in the Zustand slice calls:
              // PUT /api/vendor/orders/{orderId}/assign-delivery
              // Body: { deliveryStaffId: selected.id }
              await assignDelivery(order.id, selected.id);

              navigation.goBack();
              Alert.alert(
                '✅ Helper Assigned',
                `${selected.name} has been assigned to Order #${orderId}.\n\n` +
                `📱 OTP to share with helper: ${order.otp}\n\n` +
                `Guard will ask for this OTP at the gate.`,
              );
            } catch (err) {
              Alert.alert('Assignment Failed', err.message || 'Something went wrong. Please try again.');
            } finally {
              setAssigning(false);
            }
          },
        },
      ],
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const availableCount = activeStaff.filter(h => !h.busy).length;
  const busyCount = activeStaff.filter(h => h.busy).length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.teal} />
      <AppHeader
        title="Assign Delivery Helper"
        subtitle={`Order #${orderId}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />
        }
      >
        {/* OTP Card */}
        <Card style={{ backgroundColor: Colors.tealLight, alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: Fonts.bold, color: Colors.teal, marginBottom: 6 }}>
            🔑 Order OTP — Share with Delivery Helper
          </Text>
          <Text style={s.otpLarge}>{order.otp || '——'}</Text>
          <Text style={{ fontSize: 11, color: Colors.teal, textAlign: 'center', marginTop: 6, lineHeight: 16 }}>
            Guard will ask delivery helper for this OTP to allow entry into the community.
          </Text>
        </Card>

        {/* Section: select helper */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={s.sectionLabel}>Select Delivery Helper</Text>
          {staffLoading && !refreshing && (
            <ActivityIndicator size="small" color={Colors.teal} />
          )}
          {!staffLoading && activeStaff.length > 0 && (
            <Text style={{ fontSize: 11, color: Colors.text3 }}>
              {availableCount} available · {busyCount} busy
            </Text>
          )}
        </View>

        {/* Error state */}
        {staffError && !staffLoading && (
          <View style={s.errorBanner}>
            <Text style={{ fontSize: 13, color: '#C62828', fontWeight: Fonts.bold }}>
              ⚠️ Failed to load helpers
            </Text>
            <Text style={{ fontSize: 12, color: '#C62828', marginTop: 4 }}>{staffError}</Text>
            <TouchableOpacity
              style={{ marginTop: 10, backgroundColor: '#FEE2E2', borderRadius: Radius.md, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start' }}
              onPress={() => fetchActiveStaff().catch(() => { })}
            >
              <Text style={{ fontSize: 12, fontWeight: Fonts.bold, color: '#C62828' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading skeleton */}
        {staffLoading && !refreshing && activeStaff.length === 0 && (
          <View style={s.centeredMsg}>
            <ActivityIndicator size="large" color={Colors.teal} />
            <Text style={[s.centeredText, { marginTop: 12 }]}>Loading your delivery team…</Text>
          </View>
        )}

        {/* Empty: no helpers at all */}
        {!staffLoading && !staffError && activeStaff.length === 0 && (
          <View style={s.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🏍️</Text>
            <Text style={s.emptyTitle}>No delivery helpers yet</Text>
            <Text style={s.emptySub}>
              Add helpers to your delivery team first. Go back to Orders and tap the 🏍️ Team button.
            </Text>
            <TouchableOpacity
              style={s.addBtn}
              onPress={() => navigation.navigate('VendorDeliveryStaffList')}
              activeOpacity={0.85}
            >
              <Text style={s.addBtnText}>➕ Manage Delivery Team</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Helper list */}
        {activeStaff.length > 0 && activeStaff.map(helper => (
          <HelperCard
            key={String(helper.id)}
            helper={helper}
            selected={selected}
            onSelect={setSelected}
          />
        ))}

        {/* Order summary */}
        {activeStaff.length > 0 && (
          <Card style={{ marginTop: 8 }}>
            <Text style={s.sectionLabel}>Order Summary</Text>
            {[
              ['Customer', `${order.residentName} · Unit ${order.unit}`],
              ['Items', `${parsedItems.length} item${parsedItems.length !== 1 ? 's' : ''}`],
              ['Total', `₹${order.total}`],
              ['Placed', fmt(order.placedAt)],
            ].map(([k, v], i, arr) => (
              <View
                key={k}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 6,
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <Text style={{ fontSize: 12, color: Colors.text2 }}>{k}</Text>
                <Text style={{ fontSize: 13, fontWeight: Fonts.semiBold, color: Colors.text }}>{v}</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      {/* Footer CTA */}
      {activeStaff.length > 0 && (
        <View style={s.footer}>
          {assigning ? (
            <View style={[s.assignBtn, { opacity: 0.7 }]}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={[s.assignBtnText, { marginLeft: 10 }]}>Assigning…</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[s.assignBtn, !selected && { opacity: 0.45 }]}
              onPress={handleAssign}
              activeOpacity={0.85}
              disabled={!selected}
            >
              <Text style={s.assignBtnText}>
                {selected ? `✅ Assign ${selected.name}` : 'Select a Helper to Assign'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  sectionLabel: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 12 },

  otpLarge: {
    fontSize: 42,
    fontWeight: Fonts.extraBold,
    color: Colors.teal,
    letterSpacing: 12,
    textAlign: 'center',
  },

  helperCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadows.card,
  },
  helperCardSelected: {
    borderColor: Colors.teal,
    backgroundColor: Colors.tealLight,
  },
  helperCardBusy: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  helperIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperName: { fontSize: 15, fontWeight: Fonts.bold, color: Colors.text },
  helperSub: { fontSize: 12, color: Colors.text2, marginTop: 2 },

  busyBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  busyBadgeText: { fontSize: 10, fontWeight: Fonts.bold, color: '#92400E' },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.teal,
  },

  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  assignBtn: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...Shadows.card,
  },
  assignBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: Fonts.bold,
  },

  centeredMsg: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  centeredText: { fontSize: 14, color: Colors.text3, textAlign: 'center', lineHeight: 20 },

  emptyBox: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 20, paddingBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 13, color: Colors.text3, textAlign: 'center', lineHeight: 19, marginBottom: 24 },
  addBtn: { backgroundColor: Colors.teal, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.md },
  addBtnText: { color: '#FFFFFF', fontWeight: Fonts.bold, fontSize: 14 },

  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
});