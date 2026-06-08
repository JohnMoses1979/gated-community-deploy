// import React, { useMemo, useState } from 'react';
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

// export default function ProductListScreen({ navigation }) {
//   const theme = useTheme();
//   const vendorId      = useAuthStore(s => s.user?.id) || 'ven1';
//   const marketplaceProducts = useAppStore(s => s.marketplaceProducts);
//   const deleteProduct = useAppStore(s => s.deleteProduct);
//   const updateProduct = useAppStore(s => s.updateProduct);
//   const [tab, setTab] = useState('all');

//   const products = useMemo(
//     () => marketplaceProducts.filter(p => p.vendorId === vendorId),
//     [marketplaceProducts, vendorId]
//   );

//   const filtered = useMemo(() => {
//     if (tab === 'active') return products.filter(p => p.active);
//     if (tab === 'inactive') return products.filter(p => !p.active);
//     return products;
//   }, [products, tab]);

//   const handleDelete = (item) => {
//     Alert.alert('Delete Product', `Remove "${item.name}" from the marketplace? Residents will no longer see it.`, [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: () => deleteProduct(item.id, vendorId) },
//     ]);
//   };

//   const handleToggleActive = (item) => {
//     updateProduct(item.id, { active: !item.active }, vendorId);
//   };

//   return (
//     <SafeAreaView style={s.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={Colors.teal} />
//       <View style={s.listHeader}>
//         <View style={s.listHeaderTop}>
//           <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
//             <Text style={s.backArrow}>‹</Text>
//           </TouchableOpacity>
//           <Text style={s.heading}>My Products</Text>
//           <TouchableOpacity onPress={() => navigation.navigate('AddProduct')} style={s.addBtn} activeOpacity={0.8}>
//             <Text style={{ fontSize: 20, color: theme.card }}>+</Text>
//           </TouchableOpacity>
//         </View>
//         <View style={s.searchBar}>
//           <Text style={{ fontSize: 16 }}>🔍</Text>
//           <Text style={s.searchPlaceholder}>Search products...</Text>
//         </View>
//         <View style={s.tabRow}>
//           {[['all',`All (${products.length})`],['active',`Active (${products.filter(p=>p.active).length})`],['inactive',`Inactive (${products.filter(p=>!p.active).length})`]].map(([k, l]) => (
//             <TabChip key={k} label={l} active={tab === k} onPress={() => setTab(k)} activeColor={Colors.teal} />
//           ))}
//         </View>
//       </View>

//       <FlatList
//         data={filtered}
//         keyExtractor={p => p.id.toString()}
//         numColumns={2}
//         contentContainerStyle={s.productGrid}
//         columnWrapperStyle={{ gap: 10 }}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={<View style={{ alignItems: 'center', padding: 40 }}><Text style={{ fontSize: 48 }}>📦</Text><Text style={{ fontSize: 15, color: Colors.text3, marginTop: 10 }}>No products yet</Text><Text style={{ fontSize: 13, color: Colors.text3 }}>Tap + to add your first product</Text></View>}
//         renderItem={({ item }) => (
//           <View style={[s.productCard, !item.active && { opacity: 0.6 }]}>
//             <TouchableOpacity onPress={() => navigation.navigate('AddProduct', { product: item })} activeOpacity={0.8} style={{ flex: 1 }}>
//               <View style={s.productEmoji}>
//                 <Text style={{ fontSize: 42 }}>{item.emoji || '📦'}</Text>
//               </View>
//               <Text style={s.productName} numberOfLines={2}>{item.name}</Text>
//               <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
//                 <Text style={s.productPrice}>₹{item.price}</Text>
//                 <Badge
//                   label={item.stock === 0 ? 'Out' : 'In Stock'}
//                   color={item.stock === 0 ? Colors.red : Colors.green}
//                   bg={item.stock === 0 ? Colors.redLight : Colors.greenLight}
//                 />
//               </View>
//               {item.stock > 0 && item.stock < 10 && (
//                 <Text style={s.lowStockText}>⚠️ Only {item.stock} left</Text>
//               )}
//             </TouchableOpacity>
//             <View style={{ flexDirection: 'row', marginTop: 8, gap: 6 }}>
//               <TouchableOpacity
//                 style={[s.miniBtn, { backgroundColor: item.active ? Colors.tealLight : '#F1F5F9', flex: 1 }]}
//                 onPress={() => handleToggleActive(item)}
//               >
//                 <Text style={{ fontSize: 10, fontWeight: '700', color: item.active ? Colors.teal : Colors.text3 }}>
//                   {item.active ? '✅ Active' : '⏸ Paused'}
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[s.miniBtn, { backgroundColor: theme.surface }]} onPress={() => handleDelete(item)}>
//                 <Text style={{ fontSize: 12 }}>🗑</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       />

//       <View style={s.footer}>
//         <PrimaryButton title="+ Add Product" onPress={() => navigation.navigate('AddProduct')} color={Colors.teal} />
//       </View>
//       <MarketplaceTabBar activeTab="Products" onTabPress={(tab) => {
//         if (tab === 'Home')     navigation.navigate('MarketplaceHome');
//         if (tab === 'Orders')   navigation.navigate('VendorOrders');
//         if (tab === 'Earnings') navigation.navigate('MarketplaceEarnings');
//         if (tab === 'More')     navigation.navigate('MarketplaceProfile');
//       }} />
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:   { flex: 1, backgroundColor: Colors.bg },
//   scroll: { padding: 16, paddingBottom: 100 },
//   footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },

//   listHeader: { backgroundColor: Colors.teal, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
//   listHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
//   backBtn:   { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
//   backArrow: { fontSize: 26, color: '#FFFFFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
//   heading: { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFFFFF', flex: 1 },
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
 * ProductListScreen.js — API-connected version
 *
 * Changes from original:
 *  - Products loaded from / saved to MySQL via Spring Boot API
 *  - Delete and toggle-active go to the real backend
 *  - All existing UI, styles, layout, tab-bar unchanged
 *  - Pulls from useVendorStoreSlice instead of useAppStore for products
 *
 * Drop this at: src/screens/vendor/marketplace/ProductListScreen.js
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { PrimaryButton, Badge, TabChip } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
import { useAuthStore } from '../../../store/AuthStore';
import { useTheme } from '../../../hooks/useTheme';

// ── API-backed slice ──────────────────────────────────────────────────────────
import { useVendorStoreSlice } from '../../../api/vendorStoreApi';

// ─────────────────────────────────────────────────────────────────────────────
export default function ProductListScreen({ navigation }) {
  const theme = useTheme();
  const user = useAuthStore(s => s.user);

  // ── Pull from API slice (not appStore) ────────────────────────────────────
  const myProducts = useVendorStoreSlice(s => s.myProducts);
  const productsLoading = useVendorStoreSlice(s => s.productsLoading);
  const fetchMyProducts = useVendorStoreSlice(s => s.fetchMyProducts);
  const deleteProduct = useVendorStoreSlice(s => s.deleteProduct);
  const toggleProductActive = useVendorStoreSlice(s => s.toggleProductActive);

  const [tab, setTab] = useState('all');

  // ── Fetch products from backend on mount ──────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      await fetchMyProducts();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not load products.');
    }
  }, [fetchMyProducts]);

  useEffect(() => {
    loadProducts();
    // Reload when navigating back to this screen (e.g., after adding a product)
    const unsubscribe = navigation.addListener('focus', loadProducts);
    return unsubscribe;
  }, [navigation, loadProducts]);

  // ── Filter by tab ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (tab === 'active') return myProducts.filter(p => p.active);
    if (tab === 'inactive') return myProducts.filter(p => !p.active);
    return myProducts;
  }, [myProducts, tab]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (item) => {
    Alert.alert(
      'Delete Product',
      `Remove "${item.name}" from the marketplace? Residents will no longer see it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(item.id);
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not delete product.');
            }
          },
        },
      ]
    );
  };

  // ── Toggle active / paused ────────────────────────────────────────────────
  const handleToggleActive = async (item) => {
    try {
      await toggleProductActive(item.id);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update product status.');
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalCount = myProducts.length;
  const activeCount = myProducts.filter(p => p.active).length;
  const inactiveCount = myProducts.filter(p => !p.active).length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.teal} />

      {/* ── Header — identical to original ─── */}
      <View style={s.listHeader}>
        <View style={s.listHeaderTop}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.heading}>My Products</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddProduct')}
            style={s.addBtn}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20, color: theme.card }}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar (visual only — filter is done via tab) */}
        <View style={s.searchBar}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <Text style={s.searchPlaceholder}>Search products…</Text>
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          {[
            ['all', `All (${totalCount})`],
            ['active', `Active (${activeCount})`],
            ['inactive', `Inactive (${inactiveCount})`],
          ].map(([k, l]) => (
            <TabChip key={k} label={l} active={tab === k} onPress={() => setTab(k)} activeColor={Colors.teal} />
          ))}
        </View>
      </View>

      {/* ── Product grid ──────────────────────────────────────────────────── */}
      {productsLoading && myProducts.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={Colors.teal} />
          <Text style={{ color: Colors.text3 }}>Loading products…</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => String(p.id)}
          numColumns={2}
          contentContainerStyle={s.productGrid}
          columnWrapperStyle={{ gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshing={productsLoading}
          onRefresh={loadProducts}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 48 }}>📦</Text>
              <Text style={{ fontSize: 15, color: Colors.text3, marginTop: 10 }}>No products yet</Text>
              <Text style={{ fontSize: 13, color: Colors.text3 }}>Tap + to add your first product</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[s.productCard, !item.active && { opacity: 0.6 }]}>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddProduct', { product: item })}
                activeOpacity={0.8}
                style={{ flex: 1 }}
              >
                {/* Emoji / image */}
                <View style={s.productEmoji}>
                  <Text style={{ fontSize: 42 }}>{item.emoji || '📦'}</Text>
                </View>

                <Text style={s.productName} numberOfLines={2}>{item.name}</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <Text style={s.productPrice}>₹{item.price}</Text>
                  <Badge
                    label={item.stock === 0 ? 'Out' : 'In Stock'}
                    color={item.stock === 0 ? Colors.red : Colors.green}
                    bg={item.stock === 0 ? Colors.redLight : Colors.greenLight}
                  />
                </View>

                {item.stock > 0 && item.stock < 10 && (
                  <Text style={s.lowStockText}>⚠️ Only {item.stock} left</Text>
                )}
              </TouchableOpacity>

              {/* Action row */}
              <View style={{ flexDirection: 'row', marginTop: 8, gap: 6 }}>
                <TouchableOpacity
                  style={[s.miniBtn, { backgroundColor: item.active ? Colors.tealLight : '#F1F5F9', flex: 1 }]}
                  onPress={() => handleToggleActive(item)}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: item.active ? Colors.teal : Colors.text3 }}>
                    {item.active ? '✅ Active' : '⏸ Paused'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.miniBtn, { backgroundColor: theme.surface }]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={{ fontSize: 12 }}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <View style={s.footer}>
        <PrimaryButton
          title="+ Add Product"
          onPress={() => navigation.navigate('AddProduct')}
          color={Colors.teal}
        />
      </View>

      {/* ── Tab bar — unchanged ──────────────────────────────────────────── */}
      <MarketplaceTabBar
        activeTab="Products"
        onTabPress={(tab) => {
          if (tab === 'Home') navigation.navigate('MarketplaceHome');
          if (tab === 'Orders') navigation.navigate('VendorOrders');
          if (tab === 'Earnings') navigation.navigate('MarketplaceEarnings');
          if (tab === 'More') navigation.navigate('MarketplaceProfile');
        }}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Styles — IDENTICAL to original ───────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },

  listHeader: { backgroundColor: Colors.teal, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  listHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 26, color: '#FFFFFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
  heading: { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFFFFF', flex: 1 },
  addBtn: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: Colors.bg, borderRadius: Radius.md, marginBottom: 12 },
  searchPlaceholder: { fontSize: 14, color: Colors.text3 },
  tabRow: { flexDirection: 'row', gap: 8, paddingBottom: 14 },

  productGrid: { padding: 12, paddingBottom: 90 },
  productCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  productEmoji: { height: 88, backgroundColor: Colors.bg, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  productName: { fontSize: 13, fontWeight: Fonts.bold, color: Colors.text },
  productPrice: { fontSize: 15, fontWeight: Fonts.extraBold, color: Colors.teal },
  lowStockText: { fontSize: 11, color: Colors.red, marginTop: 5, fontWeight: Fonts.medium },
  miniBtn: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});