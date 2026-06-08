



/**
 * RealEstateScreen.js — Resident: Buy/Sell/Rent property listings
 *
 * SECURITY FIX (merged):
 *  - GET  /api/real-estate/listings/my         (no ownerId param — JWT)
 *  - POST /api/real-estate/listings             (ownerId removed from body)
 *  - PATCH /api/real-estate/listings/{id}/status (ownerId removed from body)
 *  - All requests carry Authorization: Bearer <token>
 *  - Backend derives owner identity from CurrentUser.get()
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, Alert, TextInput, Modal,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import { apiUrl } from '../../../services/apiClient';

const C = {
  primary: '#1A7A7A', success: '#1A7A7A', danger: '#DC2626',
  warn: '#D97706', accent: '#D4AF5A',
  bg: '#F0FAFA', card: '#FFFFFF', border: '#D0EEEE',
  text: '#1A2E2E', muted: '#7A9E9E',
};

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', color: '#1A7A7A', bg: '#DCFCE7' },
  PENDING_APPROVAL: { label: 'Pending Approval', color: '#D97706', bg: '#FEF3C7' },
  SOLD: { label: 'Sold', color: '#6B7280', bg: '#F3F4F6' },
  RENTED: { label: 'Rented', color: '#7C3AED', bg: '#EDE9FE' },
  WITHDRAWN: { label: 'Withdrawn', color: '#6B7280', bg: '#F3F4F6' },
  REJECTED: { label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
};

function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: C.muted, bg: '#F1F5F9' };
  return (
    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: cfg.color }}>{cfg.label.toUpperCase()}</Text>
    </View>
  );
}

function ListingCard({ listing, onUpdateStatus }) {
  const isPending = listing.status === 'PENDING_APPROVAL';
  const isActive = listing.status === 'ACTIVE';
  const isRejected = listing.status === 'REJECTED';

  return (
    <View style={[st.card, { borderLeftWidth: 4, borderLeftColor: (STATUS_CONFIG[listing.status] || {}).color || C.muted }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={st.cardT}>{listing.type === 'rent' ? '🏠' : '🏢'} {listing.title}</Text>
          <Text style={st.cardS}>📍 Unit {listing.unit}  ·  {listing.area ? `${listing.area} sq ft` : ''}</Text>
          {listing.bedrooms && (
            <Text style={st.cardS}>🛏 {listing.bedrooms} BHK  ·  🚿 {listing.bathrooms} bath  ·  {listing.furnished}</Text>
          )}
        </View>
        <Badge status={listing.status} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: C.accent }}>
          ₹{listing.priceLabel || listing.price?.toLocaleString('en-IN')}
        </Text>
        <Text style={{ fontSize: 11, color: C.muted }}>
          👁 {listing.views || 0} views
        </Text>
      </View>

      {isPending && (
        <View style={{ backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, marginBottom: 8 }}>
          <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '600' }}>
            ⏳ Waiting for admin approval before going live
          </Text>
        </View>
      )}

      {isRejected && listing.rejectionReason && (
        <View style={{ backgroundColor: '#FEE2E2', borderRadius: 10, padding: 10, marginBottom: 8 }}>
          <Text style={{ color: C.danger, fontSize: 12, fontWeight: '600' }}>
            ❌ Rejected: {listing.rejectionReason}
          </Text>
        </View>
      )}

      {isActive && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[st.smallBtn, { flex: 1, backgroundColor: '#F3F4F6' }]}
            onPress={() => onUpdateStatus(listing, 'SOLD')}
          >
            <Text style={{ color: C.text, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>Mark Sold</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.smallBtn, { flex: 1, backgroundColor: '#EDE9FE' }]}
            onPress={() => onUpdateStatus(listing, 'RENTED')}
          >
            <Text style={{ color: '#7C3AED', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>Mark Rented</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.smallBtn, { flex: 1, backgroundColor: '#FEE2E2' }]}
            onPress={() => onUpdateStatus(listing, 'WITHDRAWN')}
          >
            <Text style={{ color: C.danger, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
        Listed {new Date(listing.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </Text>
    </View>
  );
}

function ActiveListingCard({ listing }) {
  return (
    <View style={[st.card, { borderLeftWidth: 4, borderLeftColor: C.primary }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={st.cardT}>{listing.type === 'rent' ? '🏠' : '🏢'} {listing.title}</Text>
          <Text style={st.cardS}>📍 Unit {listing.unit}</Text>
          {listing.bedrooms && (
            <Text style={st.cardS}>🛏 {listing.bedrooms} BHK  ·  {listing.furnished}</Text>
          )}
          <Text style={st.cardS}>👤 {listing.ownerName}  ·  📞 {listing.ownerPhone}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Badge status={listing.status} />
          <Text style={{ fontSize: 11, color: C.muted }}>👁 {listing.views || 0}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 20, fontWeight: '900', color: C.accent, marginTop: 4 }}>
        ₹{listing.priceLabel || listing.price?.toLocaleString('en-IN')}
        <Text style={{ fontSize: 12, fontWeight: '600', color: C.muted }}>
          {listing.type === 'rent' ? '/mo' : ''}
        </Text>
      </Text>
      {listing.availability && (
        <Text style={[st.cardS, { marginTop: 4 }]}>📅 Available: {listing.availability}</Text>
      )}
    </View>
  );
}

export default function RealEstateScreen({ navigation }) {
  const token = useAuthStore(s => s.token);
  const user = useAuthStore(s => s.user);

  const [tab, setTab] = useState('browse');
  const [activeListings, setActive] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [form, setForm] = useState({
    type: 'sale', title: '', description: '', unit: user?.unit || '',
    price: '', priceLabel: '', area: '', bedrooms: '2', bathrooms: '1',
    furnished: 'Semi-Furnished', availability: '', amenities: '',
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // FIX: GET /listings/my — no ownerId param, JWT used by backend
  const fetchMyListings = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/real-estate/listings/my'), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMyListings(Array.isArray(data) ? data : []);
    } catch {
      // silent fail — show empty state
    }
  }, [token]);

  const fetchActiveListings = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/real-estate/listings/active'), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActive(Array.isArray(data) ? data : []);
    } catch {
      // silent fail
    }
  }, [token]);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    await Promise.all([fetchMyListings(), fetchActiveListings()]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchMyListings, fetchActiveListings]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // FIX: POST /listings — ownerId, ownerName, ownerPhone removed; JWT provides them
  const handleCreate = async () => {
    if (!form.title.trim()) { Alert.alert('Required', 'Please enter a title.'); return; }
    if (!form.price) { Alert.alert('Required', 'Please enter a price.'); return; }

    setCreating(true);
    try {
      const payload = {
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        unit: form.unit.trim(),
        price: parseInt(form.price) || 0,
        priceLabel: form.priceLabel.trim(),
        area: parseInt(form.area) || null,
        bedrooms: parseInt(form.bedrooms) || null,
        bathrooms: parseInt(form.bathrooms) || null,
        furnished: form.furnished,
        availability: form.availability.trim(),
        amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
        // ownerId, ownerName, ownerPhone intentionally NOT sent — backend reads from JWT
      };

      const res = await fetch(apiUrl('/real-estate/listings'), {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create listing');
      }

      const newListing = await res.json();
      setMyListings(prev => [newListing, ...prev]);
      setShowCreate(false);
      setForm({
        type: 'sale', title: '', description: '', unit: user?.unit || '',
        price: '', priceLabel: '', area: '', bedrooms: '2', bathrooms: '1',
        furnished: 'Semi-Furnished', availability: '', amenities: '',
      });

      Alert.alert(
        '✅ Listing Submitted!',
        newListing.status === 'PENDING_APPROVAL'
          ? 'Your listing is pending admin approval and will go live soon.'
          : 'Your listing is now live!',
      );
      setTab('my');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not create listing. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // FIX: PATCH /listings/{id}/status — ownerId removed; JWT provides identity
  const handleUpdateStatus = (listing, newStatus) => {
    const labels = { SOLD: 'sold', RENTED: 'rented', WITHDRAWN: 'withdrawn' };
    Alert.alert(
      `Mark as ${labels[newStatus] || newStatus}?`,
      `This will mark your listing "${listing.title}" as ${labels[newStatus] || newStatus}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const res = await fetch(apiUrl(`/real-estate/listings/${listing.id}/status`), {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ status: newStatus }),
                // ownerId intentionally NOT sent — backend reads from JWT
              });
              if (!res.ok) throw new Error('Update failed');
              const updated = await res.json();
              setMyListings(prev =>
                prev.map(l => l.id === updated.id ? updated : l)
              );
              Alert.alert('✅ Updated', `Listing marked as ${labels[newStatus]}.`);
            } catch (err) {
              Alert.alert('Error', 'Could not update listing status.');
            }
          },
        },
      ]
    );
  };

  const setF = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const FURNISHED_OPTIONS = ['Fully Furnished', 'Semi-Furnished', 'Unfurnished'];
  const TYPE_OPTIONS = [{ key: 'sale', label: '🏢 For Sale' }, { key: 'rent', label: '🏠 For Rent' }];

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.back}>
          <Text style={st.backT}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={st.hdrT}>Real Estate</Text>
            <Text style={st.hdrSub}>{activeListings.length} active listings in society</Text>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
            onPress={() => setShowCreate(true)}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>+ List Property</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={st.tabRow}>
        {[
          { key: 'browse', label: `Browse (${activeListings.length})` },
          { key: 'my', label: `My Listings (${myListings.length})` },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[st.tab, tab === t.key && st.tabA]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[st.tabT, tab === t.key && st.tabTA]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAll(true)}
              colors={[C.primary]}
            />
          }
        >
          {tab === 'browse' && (
            activeListings.length === 0 ? (
              <View style={st.empty}>
                <Text style={{ fontSize: 48 }}>🏠</Text>
                <Text style={st.emptyT}>No active listings</Text>
                <Text style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
                  Be the first to list a property!
                </Text>
              </View>
            ) : (
              activeListings.map(l => <ActiveListingCard key={l.id} listing={l} />)
            )
          )}

          {tab === 'my' && (
            myListings.length === 0 ? (
              <View style={st.empty}>
                <Text style={{ fontSize: 48 }}>📋</Text>
                <Text style={st.emptyT}>No listings yet</Text>
                <TouchableOpacity
                  style={[st.btn, { marginTop: 16, paddingHorizontal: 24 }]}
                  onPress={() => setShowCreate(true)}
                >
                  <Text style={st.btnT}>+ Create Your First Listing</Text>
                </TouchableOpacity>
              </View>
            ) : (
              myListings.map(l => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            )
          )}
        </ScrollView>
      )}

      {/* Create Listing Modal */}
      <Modal
        visible={showCreate}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreate(false)}
      >
        <View style={st.overlay}>
          <View style={st.modal}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.text }}>🏠 List a Property</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Text style={{ fontSize: 20, color: C.muted }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={st.formLabel}>Type</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                {TYPE_OPTIONS.map(o => (
                  <TouchableOpacity
                    key={o.key}
                    style={[st.chip, form.type === o.key && st.chipA, { flex: 1 }]}
                    onPress={() => setF('type', o.key)}
                  >
                    <Text style={[st.chipT, form.type === o.key && { color: '#FFF' }]}>{o.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={st.formLabel}>Title *</Text>
              <TextInput style={st.input} value={form.title} onChangeText={v => setF('title', v)} placeholder="e.g. Spacious 2BHK for Sale" placeholderTextColor={C.muted} />

              <Text style={st.formLabel}>Unit / Flat No.</Text>
              <TextInput style={st.input} value={form.unit} onChangeText={v => setF('unit', v)} placeholder="e.g. B-204" placeholderTextColor={C.muted} />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={st.formLabel}>Price (₹) *</Text>
                  <TextInput style={st.input} value={form.price} onChangeText={v => setF('price', v)} placeholder="5000000" placeholderTextColor={C.muted} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.formLabel}>Price Label</Text>
                  <TextInput style={st.input} value={form.priceLabel} onChangeText={v => setF('priceLabel', v)} placeholder="50L / 15K/mo" placeholderTextColor={C.muted} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={st.formLabel}>Area (sq ft)</Text>
                  <TextInput style={st.input} value={form.area} onChangeText={v => setF('area', v)} placeholder="1200" placeholderTextColor={C.muted} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.formLabel}>Bedrooms</Text>
                  <TextInput style={st.input} value={form.bedrooms} onChangeText={v => setF('bedrooms', v)} placeholder="2" placeholderTextColor={C.muted} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.formLabel}>Bathrooms</Text>
                  <TextInput style={st.input} value={form.bathrooms} onChangeText={v => setF('bathrooms', v)} placeholder="1" placeholderTextColor={C.muted} keyboardType="numeric" />
                </View>
              </View>

              <Text style={st.formLabel}>Furnished Status</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {FURNISHED_OPTIONS.map(o => (
                  <TouchableOpacity
                    key={o}
                    style={[st.chip, form.furnished === o && st.chipA]}
                    onPress={() => setF('furnished', o)}
                  >
                    <Text style={[st.chipT, form.furnished === o && { color: '#FFF' }]}>{o}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={st.formLabel}>Availability</Text>
              <TextInput style={st.input} value={form.availability} onChangeText={v => setF('availability', v)} placeholder="Immediate / June 2026" placeholderTextColor={C.muted} />

              <Text style={st.formLabel}>Description</Text>
              <TextInput
                style={[st.input, { minHeight: 80, textAlignVertical: 'top' }]}
                value={form.description}
                onChangeText={v => setF('description', v)}
                placeholder="Describe the property..."
                placeholderTextColor={C.muted}
                multiline
              />

              <Text style={st.formLabel}>Amenities (comma separated)</Text>
              <TextInput style={st.input} value={form.amenities} onChangeText={v => setF('amenities', v)} placeholder="Parking, Gym, Pool" placeholderTextColor={C.muted} />

              <TouchableOpacity
                style={[st.btn, { marginTop: 16 }, creating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={creating}
              >
                {creating
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={st.btnT}>🚀 Submit Listing</Text>
                }
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  tabRow: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabA: { borderBottomWidth: 3, borderBottomColor: C.primary },
  tabT: { fontSize: 13, fontWeight: '600', color: C.muted },
  tabTA: { color: C.primary, fontWeight: '800' },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  cardT: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 2 },
  cardS: { fontSize: 12, color: C.muted, marginTop: 2 },
  smallBtn: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%' },
  formLabel: { fontSize: 12, fontWeight: '700', color: C.muted, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderRadius: 12, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: C.text, backgroundColor: '#FAFAFA', marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#FAFAFA', alignItems: 'center' },
  chipA: { backgroundColor: C.primary, borderColor: C.primary },
  chipT: { fontSize: 12, fontWeight: '700', color: C.text },
  btn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnT: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyT: { fontSize: 16, fontWeight: '700', color: C.muted },
});