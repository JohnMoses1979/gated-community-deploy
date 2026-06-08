// import React, { useState } from 'react';
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, SafeAreaView, StatusBar, Alert, Switch,
// } from 'react-native';
// import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
// import { AppHeader, Card, PrimaryButton, InputField, Divider, Badge } from '../../../vendor/components';
// import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
// import useAppStore from '../../../store/appStore';
// import { useAuthStore } from '../../../store/AuthStore';
// import { useTheme } from '../../../hooks/useTheme';

// // ─── StoreProfileScreen ───────────────────────────────────────────────────────

// export default function StoreProfileScreen({ navigation }) {
//   const theme = useTheme();
//   const vendorId = useAuthStore(s => s.user?.id) || 'ven1';
//   const fallbackName = useAuthStore(s => s.user?.name) || 'My Store';
//   const store = useAppStore(s => s.getVendorStore(vendorId));
//   const upsertVendorStore = useAppStore(s => s.upsertVendorStore);
//   const [storeName,    setStoreName]    = useState(store?.storeName || fallbackName);
//   const [category,     setCategory]     = useState(store?.category || 'Grocery Store');
//   const [phone,        setPhone]        = useState(store?.phone || '');
//   const [email,        setEmail]        = useState(store?.email || '');
//   const [address,      setAddress]      = useState(store?.address || '');
//   const [description,  setDescription]  = useState(store?.description || '');

//   return (
//     <SafeAreaView style={s.safe}>
//       <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
//       <AppHeader title="Store Profile" onBack={() => navigation.goBack()} />
//       <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

//         <View style={s.logoRow}>
//           <View style={s.logoCircle}>
//             <Text style={{ fontSize: 36 }}>🏪</Text>
//           </View>
//           <TouchableOpacity style={s.changeLogoBtn} activeOpacity={0.8}>
//             <Text style={s.changeLogoText}>Change Logo</Text>
//           </TouchableOpacity>
//         </View>

//         <Card style={{ marginBottom: 12 }}>
//           <InputField label="Store Name"    value={storeName}   onChangeText={setStoreName}   placeholder="Enter store name" />
//           <InputField label="Category"      value={category}    onChangeText={setCategory}    placeholder="e.g. Grocery, Electronics" />
//           <InputField label="Phone Number"  value={phone}       onChangeText={setPhone}       placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />
//           <InputField label="Email"         value={email}       onChangeText={setEmail}       placeholder="store@email.com" />
//           <InputField label="Address"       value={address}     onChangeText={setAddress}     placeholder="Full address" />
//           <InputField label="Description"   value={description} onChangeText={setDescription} placeholder="Describe your store" multiline />
//         </Card>

//         <PrimaryButton
//           title="Save Changes"
//           onPress={() => {
//             if (!storeName.trim()) {
//               Alert.alert('Store Name Required', 'Please enter your store name.');
//               return;
//             }
//             upsertVendorStore(vendorId, {
//               storeName: storeName.trim(),
//               category: category.trim(),
//               phone: phone.trim(),
//               email: email.trim(),
//               address: address.trim(),
//               description: description.trim(),
//               isActive: true,
//             });
//             Alert.alert('Saved', 'Store profile updated successfully.');
//             navigation.goBack();
//           }}
//           color={Colors.teal}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:   { flex: 1, backgroundColor: Colors.bg },
//   scroll: { padding: 16, paddingBottom: 100 },

//   profileHero: {
//     backgroundColor: Colors.white,
//     borderRadius: Radius.xl,
//     padding: 20,
//     alignItems: 'center',
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     ...Shadows.card,
//   },
//   storeLogoCircle: {
//     width: 80, height: 80, borderRadius: 40,
//     backgroundColor: Colors.tealLight,
//     alignItems: 'center', justifyContent: 'center',
//     marginBottom: 12,
//   },
//   profileName:     { fontSize: 20, fontWeight: Fonts.extraBold, color: Colors.text },
//   profileCategory: { fontSize: 13, color: Colors.teal, fontWeight: Fonts.semiBold, marginTop: 4, marginBottom: 12 },
//   badgeRow:        { flexDirection: 'row', gap: 8 },

//   sectionLabel: { fontSize: 13, fontWeight: Fonts.bold, color: Colors.text2, marginBottom: 10 },

//   toggleRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
//   toggleLabel:  { fontSize: 14, fontWeight: Fonts.semiBold, color: Colors.text },
//   toggleSub:    { fontSize: 11, color: Colors.text3, marginTop: 2 },

//   detailRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
//   detailBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
//   detailKey:    { fontSize: 13, color: Colors.text2 },
//   detailSub:    { fontSize: 12, color: Colors.text3 },
//   detailVal:    { fontSize: 13, fontWeight: Fonts.semiBold, color: Colors.text },

//   menuRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
//   menuIcon:  { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.tealLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   menuLabel: { fontSize: 14, fontWeight: Fonts.semiBold, color: Colors.text },
//   menuSub:   { fontSize: 11, color: Colors.text3, marginTop: 2 },
//   menuArrow: { fontSize: 20, color: Colors.text3 },

//   statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
//   statCard:  { width: '48%', borderRadius: Radius.md, padding: 14, alignItems: 'center' },
//   statVal:   { fontSize: 22, fontWeight: Fonts.extraBold, marginBottom: 3 },
//   statLabel: { fontSize: 12, fontWeight: Fonts.medium, opacity: 0.85 },

//   logoRow:       { alignItems: 'center', marginBottom: 16 },
//   logoCircle:    { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.tealLight, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
//   changeLogoBtn: { backgroundColor: Colors.teal, borderRadius: Radius.md, paddingHorizontal: 16, paddingVertical: 8 },
//   changeLogoText:{ fontSize: 13, fontWeight: Fonts.semiBold, color: '#fff' },

//   offerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
//   couponBox:   { backgroundColor: Colors.tealLight, borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 6 },
//   couponCode:  { fontSize: 13, fontWeight: Fonts.extraBold, color: Colors.teal },
//   offerDesc:   { fontSize: 13, color: Colors.text, marginBottom: 4 },
//   offerExpiry: { fontSize: 11, color: Colors.text3 },

//   logoutBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FFF1F1',
//     borderRadius: Radius.lg,
//     paddingVertical: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#FFCCCC',
//   },
//   logoutIcon: { fontSize: 18, marginRight: 8 },
//   logoutText: { fontSize: 16, fontWeight: Fonts.bold, color: '#E53E3E' },
//   version:    { textAlign: 'center', fontSize: 12, color: Colors.text3, marginBottom: 8 },
// });









/**
 * StoreProfileScreen.js
 *
 * Create or Edit the vendor's store.
 * - If vendor has no store → shows a CREATE form
 * - If vendor already has a store → shows pre-filled EDIT form
 * - All saves go to MySQL via Spring Boot API
 * - Handles both marketplace and business vendor types
 *
 * Route: navigation.navigate('StoreProfile')
 * Place this at: src/screens/vendor/marketplace/StoreProfileScreen.js
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton } from '../../../vendor/components';
import { useAuthStore } from '../../../store/AuthStore';
import { useVendorStoreSlice } from '../../../api/vendorStoreApi';

// ─────────────────────────────────────────────────────────────────────────────
// ── Field Component ───────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, maxLength, required, hint }) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>
        {label}
        {required && <Text style={{ color: Colors.red || '#C62828' }}> *</Text>}
      </Text>
      <TextInput
        style={[f.input, multiline && f.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ''}
        placeholderTextColor={Colors.text3 || '#94A3B8'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType || 'default'}
        maxLength={maxLength}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {hint ? <Text style={f.hint}>{hint}</Text> : null}
      {maxLength && value?.length > 0
        ? <Text style={f.counter}>{value.length}/{maxLength}</Text>
        : null
      }
    </View>
  );
}
const f = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.text2 || '#3D6E6E', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: Colors.border || '#D0EEEE', borderRadius: Radius.md || 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text || '#1A2E2E', backgroundColor: '#FAFEFF' },
  multiline: { height: 88, paddingTop: 12 },
  hint: { fontSize: 11, color: Colors.text3 || '#7A9E9E', marginTop: 4 },
  counter: { fontSize: 10, color: Colors.text3 || '#7A9E9E', textAlign: 'right', marginTop: 2 },
});

// ─────────────────────────────────────────────────────────────────────────────
// ── Section Header ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function SectionHead({ title, subtitle }) {
  return (
    <View style={{ marginBottom: 14, marginTop: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.teal || '#1A7A7A', letterSpacing: 0.3 }}>
        {title}
      </Text>
      {subtitle ? <Text style={{ fontSize: 11, color: Colors.text3 || '#7A9E9E', marginTop: 2 }}>{subtitle}</Text> : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Main Screen ───────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export default function StoreProfileScreen({ navigation }) {
  const user = useAuthStore(s => s.user);
  const vendorType = user?.vendorType || 'marketplace'; // "marketplace" or "business"

  // API slice
  const myStore = useVendorStoreSlice(s => s.myStore);
  const storeLoading = useVendorStoreSlice(s => s.storeLoading);
  const fetchMyStore = useVendorStoreSlice(s => s.fetchMyStore);
  const createStore = useVendorStoreSlice(s => s.createStore);
  const updateStore = useVendorStoreSlice(s => s.updateStore);

  const isEditing = !!myStore;

  // ── Form state — initialised from DB data (or blank for new store) ─────────
  const [form, setForm] = useState({
    storeName: '',
    description: '',
    category: '',
    subcategory: '',
    logoUrl: '',
    bannerUrl: '',
    contactPhone: '',
    address: '',
    // marketplace-specific
    deliveryRadiusKm: '',
    deliveryCharge: '',
    minOrderAmount: '',
    deliveryMode: 'DELIVERY',   // DELIVERY | PICKUP | BOTH
    estimatedDeliveryTime: '',
    // business-specific
    serviceRadiusKm: '',
    serviceMode: 'WALK_IN',    // APPOINTMENT | WALK_IN | BOTH
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-fill form when store data is available
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const store = myStore ?? await fetchMyStore();
        if (store) {
          setForm({
            storeName: store.storeName ?? '',
            description: store.description ?? '',
            category: store.category ?? '',
            subcategory: store.subcategory ?? '',
            logoUrl: store.logoUrl ?? '',
            bannerUrl: store.bannerUrl ?? '',
            contactPhone: store.contactPhone ?? '',
            address: store.address ?? '',
            deliveryRadiusKm: store.deliveryRadiusKm != null ? String(store.deliveryRadiusKm) : '',
            deliveryCharge: store.deliveryCharge != null ? String(store.deliveryCharge) : '',
            minOrderAmount: store.minOrderAmount != null ? String(store.minOrderAmount) : '',
            deliveryMode: store.deliveryMode ?? 'DELIVERY',
            estimatedDeliveryTime: store.estimatedDeliveryTime ?? '',
            serviceRadiusKm: store.serviceRadiusKm != null ? String(store.serviceRadiusKm) : '',
            serviceMode: store.serviceMode ?? 'WALK_IN',
          });
        }
      } catch (err) {
        if (err?.status !== 404) console.warn('StoreProfileScreen load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // run once on mount

  const set = (key) => (value) => setForm(prev => ({ ...prev, [key]: value }));

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.storeName.trim()) {
      Alert.alert('Validation', 'Store name is required.');
      return;
    }

    setSaving(true);
    try {
      // Build payload — only send numeric fields if they have a value
      const payload = {
        storeName: form.storeName.trim(),
        description: form.description || undefined,
        category: form.category || undefined,
        subcategory: form.subcategory || undefined,
        logoUrl: form.logoUrl || undefined,
        bannerUrl: form.bannerUrl || undefined,
        contactPhone: form.contactPhone || undefined,
        address: form.address || undefined,
      };

      if (vendorType === 'marketplace') {
        if (form.deliveryRadiusKm) payload.deliveryRadiusKm = parseFloat(form.deliveryRadiusKm);
        if (form.deliveryCharge) payload.deliveryCharge = parseFloat(form.deliveryCharge);
        if (form.minOrderAmount) payload.minOrderAmount = parseFloat(form.minOrderAmount);
        payload.deliveryMode = form.deliveryMode;
        if (form.estimatedDeliveryTime) payload.estimatedDeliveryTime = form.estimatedDeliveryTime;
      }

      if (vendorType === 'business') {
        if (form.serviceRadiusKm) payload.serviceRadiusKm = parseFloat(form.serviceRadiusKm);
        payload.serviceMode = form.serviceMode;
      }

      if (isEditing) {
        await updateStore(payload);
        Alert.alert('✅ Saved', 'Store profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createStore(payload);
        Alert.alert('🎉 Store Created!', 'Your store is now live in the marketplace.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert(
        isEditing ? 'Update Failed' : 'Create Failed',
        err.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Delivery mode selector ────────────────────────────────────────────────
  function DeliveryModeSelector({ value, onChange }) {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={f.label}>Delivery Mode</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['DELIVERY', 'PICKUP', 'BOTH'].map(mode => (
            <TouchableOpacity
              key={mode}
              style={[dm.chip, value === mode && dm.chipActive]}
              onPress={() => onChange(mode)}
              activeOpacity={0.75}
            >
              <Text style={[dm.chipText, value === mode && dm.chipTextActive]}>
                {mode === 'DELIVERY' ? '🚚 Delivery' : mode === 'PICKUP' ? '🏪 Pickup' : '↕️ Both'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  function ServiceModeSelector({ value, onChange }) {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={f.label}>Service Mode</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['APPOINTMENT', 'WALK_IN', 'BOTH'].map(mode => (
            <TouchableOpacity
              key={mode}
              style={[dm.chip, value === mode && dm.chipActive]}
              onPress={() => onChange(mode)}
              activeOpacity={0.75}
            >
              <Text style={[dm.chipText, value === mode && dm.chipTextActive]}>
                {mode === 'APPOINTMENT' ? '📅 Appt' : mode === 'WALK_IN' ? '🚶 Walk-in' : '↕️ Both'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title={isEditing ? 'Edit Store' : 'Create Store'} onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.teal} />
          <Text style={{ marginTop: 12, color: Colors.text3 }}>Loading store details…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.teal || '#1A7A7A'} />
      <AppHeader
        title={isEditing ? 'Edit Store Profile' : 'Create Your Store'}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Basic Info ──────────────────────────────────────────────── */}
          <Card style={styles.section}>
            <SectionHead title="🏪 Basic Info" subtitle="Visible to all residents in the marketplace" />

            <Field
              label="Store Name" required
              value={form.storeName}
              onChangeText={set('storeName')}
              placeholder="e.g. Fresh Mart, Quick Grocery"
              maxLength={120}
            />
            <Field
              label="Description"
              value={form.description}
              onChangeText={set('description')}
              placeholder="What do you sell? Tell residents about your store…"
              multiline maxLength={500}
            />
            <Field
              label="Category"
              value={form.category}
              onChangeText={set('category')}
              placeholder="e.g. Grocery, Electronics, Clothing"
              maxLength={80}
            />
            <Field
              label="Subcategory"
              value={form.subcategory}
              onChangeText={set('subcategory')}
              placeholder="e.g. Dairy, Fruits & Vegetables"
              maxLength={80}
            />
          </Card>

          {/* ── Contact & Location ─────────────────────────────────────── */}
          <Card style={styles.section}>
            <SectionHead title="📍 Contact & Location" />

            <Field
              label="Contact Phone"
              value={form.contactPhone}
              onChangeText={set('contactPhone')}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={15}
            />
            <Field
              label="Store Address"
              value={form.address}
              onChangeText={set('address')}
              placeholder="Building / block / area"
              multiline maxLength={255}
            />
          </Card>

          {/* ── Branding ───────────────────────────────────────────────── */}
          <Card style={styles.section}>
            <SectionHead title="🎨 Branding" subtitle="Image URLs (upload to cloud storage first)" />

            <Field
              label="Logo URL"
              value={form.logoUrl}
              onChangeText={set('logoUrl')}
              placeholder="https://..."
              hint="Shown as store avatar in marketplace"
              maxLength={500}
            />
            <Field
              label="Banner URL"
              value={form.bannerUrl}
              onChangeText={set('bannerUrl')}
              placeholder="https://..."
              hint="Banner shown on store detail page"
              maxLength={500}
            />
          </Card>

          {/* ── Marketplace-specific ────────────────────────────────────── */}
          {vendorType === 'marketplace' && (
            <Card style={styles.section}>
              <SectionHead title="🚚 Delivery Settings" subtitle="Applies to marketplace vendors" />

              <DeliveryModeSelector
                value={form.deliveryMode}
                onChange={set('deliveryMode')}
              />
              <Field
                label="Delivery Radius (km)"
                value={form.deliveryRadiusKm}
                onChangeText={set('deliveryRadiusKm')}
                placeholder="e.g. 5"
                keyboardType="decimal-pad"
                hint="Maximum distance you can deliver to"
              />
              <Field
                label="Delivery Charge (₹)"
                value={form.deliveryCharge}
                onChangeText={set('deliveryCharge')}
                placeholder="e.g. 20 (enter 0 for free delivery)"
                keyboardType="decimal-pad"
              />
              <Field
                label="Minimum Order Amount (₹)"
                value={form.minOrderAmount}
                onChangeText={set('minOrderAmount')}
                placeholder="e.g. 100"
                keyboardType="decimal-pad"
              />
              <Field
                label="Estimated Delivery Time"
                value={form.estimatedDeliveryTime}
                onChangeText={set('estimatedDeliveryTime')}
                placeholder="e.g. 30-45 mins"
                maxLength={50}
              />
            </Card>
          )}

          {/* ── Business-specific ───────────────────────────────────────── */}
          {vendorType === 'business' && (
            <Card style={styles.section}>
              <SectionHead title="🔧 Service Settings" subtitle="Applies to business vendors" />

              <ServiceModeSelector
                value={form.serviceMode}
                onChange={set('serviceMode')}
              />
              <Field
                label="Service Radius (km)"
                value={form.serviceRadiusKm}
                onChangeText={set('serviceRadiusKm')}
                placeholder="e.g. 3"
                keyboardType="decimal-pad"
                hint="How far you travel for service calls"
              />
            </Card>
          )}

          {/* ── Save button ─────────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.saveBtnText}>
                {isEditing ? '💾  Save Changes' : '🚀  Create Store'}
              </Text>
            }
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const dm = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md || 10, borderWidth: 1.5, borderColor: Colors.border || '#D0EEEE', backgroundColor: '#F8FEFF' },
  chipActive: { backgroundColor: Colors.tealLight || '#E8F5F5', borderColor: Colors.teal || '#1A7A7A' },
  chipText: { fontSize: 12, color: Colors.text3 || '#7A9E9E', fontWeight: '600' },
  chipTextActive: { color: Colors.teal || '#1A7A7A', fontWeight: '800' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg || '#F0FAFA' },
  scroll: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 14, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 4 },
  saveBtn: {
    backgroundColor: Colors.teal || '#1A7A7A',
    borderRadius: Radius.lg || 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
});