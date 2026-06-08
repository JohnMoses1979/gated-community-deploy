// import React, { useState } from 'react';
// import {
//   View, Text, ScrollView, FlatList, TextInput, TouchableOpacity,
//   StyleSheet, SafeAreaView, StatusBar, Alert,
// } from 'react-native';
// import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
// import { AppHeader, Card, PrimaryButton, Divider, Badge, Avatar, SectionTitle, TabChip } from '../../../vendor/components';
// import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
// import useAppStore from '../../../store/appStore';
// import { useAuthStore } from '../../../store/AuthStore';
// import { useTheme } from '../../../hooks/useTheme';

// const EMOJIS = ['🍚','🫙','🫘','🌾','🍬','🧂','🧈','🥛','🥚','🧅','🍅','🥦','🧃','🍫','🫐','📦'];

// // ─── ProductListScreen ────────────────────────────────────────────────────────

// export default function AddProductScreen({ navigation, route }) {
//   const theme = useTheme();
//   const existingProduct = route?.params?.product;
//   const vendorId = useAuthStore(s => s.user?.id) || 'ven1';
//   const vendorName = useAuthStore(s => s.user?.name) || 'My Store';
//   const storeName = useAppStore(s => s.getVendorStore(vendorId)?.storeName || vendorName);
//   const addProduct    = useAppStore(s => s.addProduct);
//   const updateProduct = useAppStore(s => s.updateProduct);
//   const deleteProduct = useAppStore(s => s.deleteProduct);

//   const [name,     setName]     = useState(existingProduct?.name     || '');
//   const [category, setCategory] = useState(existingProduct?.category || 'Rice & Grains');
//   const [price,    setPrice]    = useState(existingProduct?.price != null ? String(existingProduct.price) : '');
//   const [stock,    setStock]    = useState(existingProduct?.stock != null ? String(existingProduct.stock) : '');
//   const [desc,     setDesc]     = useState(existingProduct?.desc || '');
//   const [emoji,    setEmoji]    = useState(existingProduct?.emoji || '📦');

//   const handleSave = () => {
//     if (!name.trim())  { Alert.alert('Required', 'Enter product name'); return; }
//     if (!price.trim()) { Alert.alert('Required', 'Enter price'); return; }
//     if (!stock.trim()) { Alert.alert('Required', 'Enter stock quantity'); return; }

//     const data = {
//       name: name.trim(),
//       category: category.trim(),
//       price: parseFloat(price) || 0,
//       stock: parseInt(stock, 10) || 0,
//       desc: desc.trim(),
//       emoji,
//       active: existingProduct ? existingProduct.active : true,
//     };

//     if (existingProduct) {
//       updateProduct(existingProduct.id, data, vendorId);
//       Alert.alert('✅ Updated', `"${data.name}" has been updated and is live in the resident store.`);
//     } else {
//       addProduct(data, vendorId, storeName);
//       Alert.alert('✅ Product Added', `"${data.name}" is now live in the resident marketplace.`);
//     }
//     navigation.goBack();
//   };

//   const handleDelete = () => {
//     Alert.alert('Delete Product', `Remove "${existingProduct.name}" permanently? Residents will no longer see it.`, [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: () => { deleteProduct(existingProduct.id, vendorId); navigation.goBack(); } },
//     ]);
//   };

//   return (
//     <SafeAreaView style={s.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={Colors.teal} />
//       <AppHeader title={existingProduct ? 'Edit Product' : 'Add New Product'} onBack={() => navigation.goBack()} />
//       <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

//         <Card>
//           <Text style={s.label}>Product Emoji / Icon</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
//             <View style={{ flexDirection: 'row', gap: 8 }}>
//               {EMOJIS.map((e) => (
//                 <TouchableOpacity key={e} onPress={() => setEmoji(e)}
//                   style={[s.thumbBox, emoji === e && { borderColor: Colors.teal, backgroundColor: Colors.tealLight }]}>
//                   <Text style={{ fontSize: 22 }}>{e}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </ScrollView>
//           <View style={{ alignItems: 'center', marginTop: 12 }}>
//             <Text style={{ fontSize: 52 }}>{emoji}</Text>
//           </View>
//         </Card>

//         {[
//           { label: 'Product Name *', value: name,     set: setName,     type: 'default' },
//           { label: 'Category *',     value: category, set: setCategory, type: 'default' },
//         ].map((f, i) => (
//           <Card key={i}>
//             <Text style={s.label}>{f.label}</Text>
//             <TextInput value={f.value} onChangeText={f.set} keyboardType={f.type} style={s.input} placeholderTextColor={Colors.text3} />
//           </Card>
//         ))}

//         <Card>
//           <View style={{ flexDirection: 'row', gap: 12 }}>
//             <View style={{ flex: 1 }}>
//               <Text style={s.label}>Price (₹) *</Text>
//               <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={s.input} placeholderTextColor={Colors.text3} placeholder="0" />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={s.label}>Stock Qty *</Text>
//               <TextInput value={stock} onChangeText={setStock} keyboardType="numeric" style={s.input} placeholderTextColor={Colors.text3} placeholder="0" />
//             </View>
//           </View>
//           <Text style={{ fontSize: 11, color: Colors.text3, marginTop: 6 }}>⚠️ Low stock alert triggers below 10 units</Text>
//         </Card>

//         <Card>
//           <Text style={s.label}>Description</Text>
//           <TextInput value={desc} onChangeText={setDesc} multiline numberOfLines={4} style={[s.input, { minHeight: 90, textAlignVertical: 'top' }]} placeholderTextColor={Colors.text3} placeholder="Describe the product..." />
//         </Card>

//         <Card>
//           <Text style={s.label}>Offer / Discount (Optional)</Text>
//           <View style={{ flexDirection: 'row', gap: 10 }}>
//             {['No Discount', '10% OFF', '20% OFF', 'Custom'].map((o, i) => (
//               <TouchableOpacity key={i} style={[s.offerChip, i === 0 && { backgroundColor: Colors.teal, borderColor: Colors.teal }]} activeOpacity={0.7}>
//                 <Text style={[s.offerChipText, i === 0 && { color: theme.card }]}>{o}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </Card>

//       </ScrollView>
//       <View style={s.footer}>
//         {existingProduct && (
//           <TouchableOpacity onPress={handleDelete} style={[s.deleteBtn, { marginBottom: 10 }]}>
//             <Text style={{ color: theme.danger, fontWeight: '700', fontSize: 14 }}>🗑 Delete Product</Text>
//           </TouchableOpacity>
//         )}
//         <PrimaryButton title={existingProduct ? '💾 Update Product' : '✅ Save & Publish'} onPress={handleSave} color={Colors.teal} />
//       </View>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:   { flex: 1, backgroundColor: Colors.bg },
//   scroll: { padding: 16, paddingBottom: 100 },
//   footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },

//   listHeader: { backgroundColor: Colors.teal, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
//   listHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
//   backBtn:   { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
//   backArrow: { fontSize: 22, color: Colors.text, fontWeight: '700', marginTop: -2 },
//   heading: { fontSize: 22, fontWeight: Fonts.extraBold, color: Colors.text, flex: 1 },
//   addBtn: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center' },
//   searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: Colors.bg, borderRadius: Radius.md, marginBottom: 12 },
//   searchPlaceholder: { fontSize: 14, color: Colors.text3 },
//   tabRow: { flexDirection: 'row', gap: 8, paddingBottom: 14 },

//   productGrid: { padding: 12, paddingBottom: 90 },
//   productCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
//   productEmoji: { height: 88, backgroundColor: Colors.bg, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
//   productName: { fontSize: 13, fontWeight: Fonts.bold, color: Colors.text },
//   productPrice: { fontSize: 15, fontWeight: Fonts.extraBold, color: Colors.teal },
//   lowStockText: { fontSize: 11, color: Colors.red, marginTop: 5, fontWeight: Fonts.medium },
//   miniBtn: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
//   deleteBtn: { alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },

//   label: { fontSize: 12, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 6 },
//   input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text },

//   imageUploadBox: { height: 130, backgroundColor: Colors.bg, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border, gap: 6 },
//   imageUploadText: { fontSize: 13, color: Colors.text3 },
//   thumbBox: { width: 62, height: 62, borderRadius: 10, backgroundColor: Colors.tealLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.teal },
//   thumbAdd: { backgroundColor: Colors.bg, borderColor: Colors.border, borderStyle: 'dashed' },
//   offerChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
//   offerChipText: { fontSize: 12, color: Colors.text2, fontWeight: Fonts.medium },

//   listContent: { padding: 16, paddingBottom: 90 },
//   orderCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
//   orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
//   orderId:  { fontSize: 15, fontWeight: Fonts.extraBold, color: Colors.text },
//   orderName:{ fontSize: 14, fontWeight: Fonts.bold, color: Colors.text },
//   orderMeta:{ fontSize: 11, color: Colors.text3, marginTop: 2 },
//   orderActionBtn: { flex: 1, paddingVertical: 11, borderRadius: Radius.md, alignItems: 'center' },
//   orderActionText:{ fontSize: 13, fontWeight: Fonts.bold },

//   customerName: { fontSize: 16, fontWeight: Fonts.bold, color: Colors.text },
//   customerLoc:  { fontSize: 12, color: Colors.text2, marginTop: 2, lineHeight: 17 },
//   sectionLabel: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 12 },
//   itemRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
//   itemBorder:{ borderBottomWidth: 1, borderBottomColor: Colors.border },
//   itemEmoji: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
//   itemName:  { fontSize: 13, fontWeight: Fonts.bold, color: Colors.text },
//   itemQty:   { fontSize: 12, color: Colors.text3, marginTop: 2 },
//   itemPrice: { fontSize: 14, fontWeight: Fonts.extraBold, color: Colors.teal },
//   rowKey:    { fontSize: 13, color: Colors.text2 },
//   rowVal:    { fontSize: 13, fontWeight: Fonts.semiBold, color: Colors.text },
//   footerBtn: { flex: 1, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
//   footerBtnText: { fontSize: 15, fontWeight: Fonts.bold },

//   trackCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
//   trackLine:   { width: 2, height: 30, marginTop: 2 },
//   callBtn:     { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
//   mapBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: Colors.tealLight, borderRadius: Radius.md, marginTop: 8 },
//   mapBtnText:  { fontSize: 14, fontWeight: Fonts.bold, color: Colors.teal },

//   menuItem:   { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
//   menuIcon:   { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
//   menuLabel:  { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text },
//   menuSub:    { fontSize: 12, color: Colors.text3, marginTop: 2 },
//   toggleBase: { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.border },
//   toggleThumb:{ position: 'absolute', left: 2, top: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
//   uploadBtn:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.md },
//   uploadBtnText: { fontSize: 12, fontWeight: Fonts.bold, color: Colors.teal },

//   mktEarningsHero: { backgroundColor: Colors.teal, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, overflow: 'hidden', position: 'relative' },
//   mktHeroCircle:   { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
//   earningsTitle:   { fontSize: 18, fontWeight: Fonts.extraBold, color: '#fff' },
//   earningsSub:     { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
//   earningsAmt:     { fontSize: 36, fontWeight: Fonts.extraBold, color: '#fff', marginTop: 2 },
//   earningsDelta:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 14 },
//   periodTabs:     { flexDirection: 'row', gap: 8 },
//   periodTab:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.15)' },
//   periodTabActive:{ backgroundColor: '#fff' },
//   periodTabText:  { fontSize: 12, fontWeight: Fonts.bold, color: '#fff' },

//   statsGridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
//   statGridCard: { width: '48%', borderRadius: Radius.md, padding: 14, alignItems: 'center' },
//   statGridVal:  { fontSize: 22, fontWeight: Fonts.extraBold, marginBottom: 3 },
//   statGridLabel:{ fontSize: 12, fontWeight: Fonts.medium, opacity: 0.8 },
//   txnAmt:       { fontSize: 14, fontWeight: Fonts.extraBold, color: Colors.green },

//   heroBackBtn:   { position: 'absolute', top: 48, left: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
//   heroBackArrow: { fontSize: 22, color: '#fff', fontWeight: '700', marginTop: -2 },
// });































/**
 * AddProductScreen.js — Create or Edit a product
 *
 * When navigated with `route.params.product`, loads that product into the form
 * (EDIT mode). Otherwise shows a blank CREATE form.
 *
 * All saves go to MySQL via Spring Boot API.
 * UI design matches your existing vendor aesthetic.
 *
 * Route: navigation.navigate('AddProduct')          ← create
 *        navigation.navigate('AddProduct', { product }) ← edit
 *
 * Place at: src/screens/vendor/marketplace/AddProductScreen.js
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card } from '../../../vendor/components';
import { useVendorStoreSlice } from '../../../api/vendorStoreApi';

// ── Common emoji picker for quick product icon ────────────────────────────────
const EMOJI_OPTIONS = [
  '🍚', '🫙', '🫘', '🌾', '🍬', '🧂', '🧈', '🥛', '🥚', '🧅',
  '🍅', '🥦', '🧃', '🍫', '🫐', '📦', '🧴', '🛒', '🍎', '🥕',
  '🧹', '💊', '🫖', '🍞', '🧀', '🥩', '🐟', '🌽', '🫚', '🍋',
];

const CATEGORIES = [
  'Grocery', 'Dairy', 'Fruits & Veg', 'Snacks', 'Beverages',
  'Household', 'Personal Care', 'Bakery', 'Meat & Fish', 'Electronics',
  'Clothing', 'Services', 'Other',
];

// ─────────────────────────────────────────────────────────────────────────────
// ── Field helper ──────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, maxLength, required, hint }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={f.label}>
        {label}
        {required && <Text style={{ color: '#C62828' }}> *</Text>}
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
    </View>
  );
}
const f = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', color: Colors.text2 || '#3D6E6E', marginBottom: 5 },
  input: { borderWidth: 1.5, borderColor: Colors.border || '#D0EEEE', borderRadius: Radius.md || 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.text || '#1A2E2E', backgroundColor: '#FAFEFF' },
  multiline: { height: 80, paddingTop: 12 },
  hint: { fontSize: 11, color: Colors.text3 || '#7A9E9E', marginTop: 3 },
});

// ─────────────────────────────────────────────────────────────────────────────
// ── Main Screen ───────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export default function AddProductScreen({ route, navigation }) {
  const existingProduct = route?.params?.product ?? null;
  const isEditing = !!existingProduct;

  // API slice
  const addProduct = useVendorStoreSlice(s => s.addProduct);
  const updateProduct = useVendorStoreSlice(s => s.updateProduct);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    description: '',
    emoji: '📦',
    imageUrl: '',
    price: '',
    originalPrice: '',
    stock: '',
    category: '',
    subcategory: '',
    unit: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Pre-fill if editing
  useEffect(() => {
    if (existingProduct) {
      setForm({
        name: existingProduct.name ?? '',
        description: existingProduct.description ?? '',
        emoji: existingProduct.emoji ?? '📦',
        imageUrl: existingProduct.imageUrl ?? '',
        price: existingProduct.price != null ? String(existingProduct.price) : '',
        originalPrice: existingProduct.originalPrice != null ? String(existingProduct.originalPrice) : '',
        stock: existingProduct.stock != null ? String(existingProduct.stock) : '',
        category: existingProduct.category ?? '',
        subcategory: existingProduct.subcategory ?? '',
        unit: existingProduct.unit ?? '',
        active: existingProduct.active ?? true,
      });
    }
  }, [existingProduct]);

  const set = (key) => (value) => setForm(prev => ({ ...prev, [key]: value }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Validate required fields
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Product name is required.');
      return;
    }
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Validation', 'Please enter a valid price (0 or more).');
      return;
    }
    const stockNum = parseInt(form.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Validation', 'Please enter a valid stock quantity (0 or more).');
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: priceNum,
      stock: stockNum,
      active: form.active,
      description: form.description || undefined,
      emoji: form.emoji || undefined,
      imageUrl: form.imageUrl || undefined,
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
      category: form.category || undefined,
      subcategory: form.subcategory || undefined,
      unit: form.unit || undefined,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await updateProduct(existingProduct.id, payload);
        Alert.alert('✅ Updated', `"${payload.name}" has been updated.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await addProduct(payload);
        Alert.alert('🎉 Product Added', `"${payload.name}" is now live in your store!`, [
          {
            text: 'Add Another', onPress: () => {
              setForm({ name: '', description: '', emoji: '📦', imageUrl: '', price: '', originalPrice: '', stock: '', category: '', subcategory: '', unit: '', active: true });
            }
          },
          { text: 'Done', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert(
        isEditing ? 'Update Failed' : 'Add Failed',
        err.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.teal || '#1A7A7A'} />
      <AppHeader
        title={isEditing ? 'Edit Product' : 'Add Product'}
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

          {/* ── Emoji picker ──────────────────────────────────────────── */}
          <Card style={styles.section}>
            <Text style={f.label}>Product Icon (Emoji)</Text>
            <TouchableOpacity
              style={styles.emojiDisplay}
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 48 }}>{form.emoji || '📦'}</Text>
              <Text style={{ fontSize: 12, color: Colors.teal, fontWeight: '700', marginTop: 6 }}>
                {showEmojiPicker ? 'Close ▲' : 'Change ▼'}
              </Text>
            </TouchableOpacity>

            {showEmojiPicker && (
              <View style={styles.emojiGrid}>
                {EMOJI_OPTIONS.map(e => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiOption, form.emoji === e && styles.emojiOptionActive]}
                    onPress={() => { set('emoji')(e); setShowEmojiPicker(false); }}
                  >
                    <Text style={{ fontSize: 28 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>

          {/* ── Basic Details ──────────────────────────────────────────── */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Product Details</Text>

            <Field
              label="Product Name" required
              value={form.name}
              onChangeText={set('name')}
              placeholder="e.g. Toor Dal 1kg, Fresh Milk 500ml"
              maxLength={150}
            />
            <Field
              label="Description"
              value={form.description}
              onChangeText={set('description')}
              placeholder="Brief description for residents…"
              multiline maxLength={500}
            />
            <Field
              label="Unit / Pack size"
              value={form.unit}
              onChangeText={set('unit')}
              placeholder="e.g. 1 kg, 500 ml, 1 pc, 6 pack"
              maxLength={30}
              hint="Shown below the price in the marketplace"
            />
          </Card>

          {/* ── Pricing ────────────────────────────────────────────────── */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Pricing & Stock</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Field
                  label="Selling Price (₹)" required
                  value={form.price}
                  onChangeText={set('price')}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Field
                  label="Original / MRP (₹)"
                  value={form.originalPrice}
                  onChangeText={set('originalPrice')}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  hint="Shown as strikethrough"
                />
              </View>
            </View>

            <Field
              label="Stock Quantity" required
              value={form.stock}
              onChangeText={set('stock')}
              placeholder="e.g. 50"
              keyboardType="number-pad"
              hint="Set to 0 to mark as out of stock"
            />
          </Card>

          {/* ── Category ───────────────────────────────────────────────── */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Category</Text>

            <Text style={f.label}>Category</Text>
            <TouchableOpacity
              style={[f.input, { justifyContent: 'center' }]}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 14, color: form.category ? Colors.text : Colors.text3 }}>
                {form.category || 'Select a category ▼'}
              </Text>
            </TouchableOpacity>

            {showCategoryPicker && (
              <View style={styles.categoryList}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryItem, form.category === cat && styles.categoryItemActive]}
                    onPress={() => { set('category')(cat); setShowCategoryPicker(false); }}
                  >
                    <Text style={[styles.categoryText, form.category === cat && { color: Colors.teal, fontWeight: '800' }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ marginTop: 10 }}>
              <Field
                label="Subcategory (optional)"
                value={form.subcategory}
                onChangeText={set('subcategory')}
                placeholder="e.g. Pulses, Leafy Greens"
                maxLength={80}
              />
            </View>
          </Card>

          {/* ── Visibility toggle ──────────────────────────────────────── */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>👁️ Visibility</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>Active / Visible</Text>
                <Text style={{ fontSize: 12, color: Colors.text3, marginTop: 2 }}>
                  Residents can see this product when active
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, form.active && styles.toggleBtnActive]}
                onPress={() => set('active')(!form.active)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: form.active ? Colors.teal : Colors.text3 }}>
                  {form.active ? '✅ Active' : '⏸ Paused'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

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
                {isEditing ? '💾  Save Changes' : '🛒  Add to Store'}
              </Text>
            }
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg || '#F0FAFA' },
  scroll: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 14, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.teal || '#1A7A7A', marginBottom: 14 },
  row: { flexDirection: 'row' },

  emojiDisplay: { alignItems: 'center', paddingVertical: 12, backgroundColor: Colors.bg || '#F0FAFA', borderRadius: Radius.md || 10, marginBottom: 8 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 8 },
  emojiOption: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg || '#F0FAFA', borderWidth: 1.5, borderColor: Colors.border || '#D0EEEE' },
  emojiOptionActive: { backgroundColor: Colors.tealLight || '#E8F5F5', borderColor: Colors.teal || '#1A7A7A' },

  categoryList: { backgroundColor: Colors.bg || '#F0FAFA', borderRadius: Radius.md || 10, borderWidth: 1, borderColor: Colors.border || '#D0EEEE', marginTop: 6, overflow: 'hidden' },
  categoryItem: { paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.border || '#D0EEEE' },
  categoryItemActive: { backgroundColor: Colors.tealLight || '#E8F5F5' },
  categoryText: { fontSize: 14, color: Colors.text || '#1A2E2E' },

  toggleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md || 10, backgroundColor: Colors.bg || '#F0FAFA', borderWidth: 1.5, borderColor: Colors.border || '#D0EEEE' },
  toggleBtnActive: { backgroundColor: Colors.tealLight || '#E8F5F5', borderColor: Colors.teal || '#1A7A7A' },

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