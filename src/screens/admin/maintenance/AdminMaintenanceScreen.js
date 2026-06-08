
/**
 * AdminMaintenanceScreen.js — Admin
 *
 * SECURITY FIX (merged):
 *  - appStore replaced with maintenanceStore (adminFetchAll)
 *  - appStore.users replaced with API fetch for vendors
 *  - Token from useAuthStore(s => s.token)
 *  - adminId never sent — backend reads from JWT
 *  - All admin actions via maintenanceStore
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, TextInput, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import useMaintenanceStore from '../../../store/maintenanceStore';
import StatusBadge from '../../../components/common/StatusBadge';
import { STATUS_LABELS, ADMIN_ACTION_REQUIRED } from '../../../constants/maintenanceStatus';

const C = {
  primary: '#1A7A7A', bg: '#E8F5F5', card: '#FFF',
  border: '#D0EEEE', text: '#1A2E2E', muted: '#7A9E9E',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: '🆕 New' },
  { key: 'assigned', label: '📤 Quote Req' },
  { key: 'quoted', label: '💰 Quote In' },
  { key: 'quote_sent_to_resident', label: '📨 Resident Review' },
  { key: 'quote_accepted', label: '✅ Accepted' },
  { key: 'quote_rejected', label: '❌ Rejected' },
  { key: 'approved_to_start', label: '🚀 Approved' },
  { key: 'work_in_progress', label: '🔧 In Progress' },
  { key: 'work_completed', label: '🏁 Completed' },
  { key: 'resident_work_approved', label: '✅ Resident OK' },
  { key: 'payment_requested_to_admin', label: '💳 Pay Due' },
  { key: 'payment_requested_to_resident', label: '⏳ Resident Pay' },
  { key: 'payment_received', label: '💵 Pay Vendor' },
  { key: 'closed', label: '✔️ Closed' },
];

const ACTION_LABELS = {
  submitted: '⚡ Send Quote Request to Vendors',
  quoted: '⚡ Forward Quote to Resident',
  quote_accepted: '⚡ Confirm Work Start',
  payment_requested_to_admin: '⚡ Request Payment from Resident',
  payment_received: '⚡ Pay Vendor',
};

export default function AdminMaintenanceScreen({ navigation }) {
  const token = useAuthStore(s => s.token);

  const requests = useMaintenanceStore(s => s.requests);
  const loading = useMaintenanceStore(s => s.loading);
  const adminFetchAll = useMaintenanceStore(s => s.adminFetchAll);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    await adminFetchAll(token);
    if (isRefresh) setRefreshing(false);
  }, [token, adminFetchAll]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const actionCount = requests.filter(r => ADMIN_ACTION_REQUIRED.includes(r.status)).length;

  const filtered = requests
    .filter(r => {
      const matchSearch =
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.unit?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase()) ||
        r.residentName?.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || r.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      const aAction = ADMIN_ACTION_REQUIRED.includes(a.status) ? 0 : 1;
      const bAction = ADMIN_ACTION_REQUIRED.includes(b.status) ? 0 : 1;
      if (aAction !== bAction) return aAction - bAction;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const getCount = (key) =>
    key === 'all' ? requests.length : requests.filter(r => r.status === key).length;

  const renderItem = ({ item }) => {
    const actionNeeded = ADMIN_ACTION_REQUIRED.includes(item.status);
    return (
      <TouchableOpacity
        style={[st.reqCard, actionNeeded && { borderLeftWidth: 4, borderLeftColor: C.primary }]}
        onPress={() => navigation.navigate('MaintenanceDetail', { requestId: item.id })}
        activeOpacity={0.85}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 11, color: C.muted, fontWeight: '600' }}>{item.id}</Text>
            <StatusBadge status={item.status} small />
          </View>
          <Text style={st.reqTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={{ fontSize: 12, color: '#3D6E6E' }}>{item.unit || '—'} · {item.category} · {item.priority}</Text>
          {item.residentName && <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>👤 {item.residentName}</Text>}
          {item.vendorName && <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>🔨 {item.vendorName}</Text>}
          {item.quote?.amount && <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>💰 ₹{item.quote.amount?.toLocaleString()}</Text>}

          {actionNeeded && ACTION_LABELS[item.status] && (
            <View style={st.actionBanner}>
              <Text style={{ color: C.primary, fontWeight: '700', fontSize: 11 }}>{ACTION_LABELS[item.status]}</Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 18, color: C.muted }}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={{ backgroundColor: C.primary, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFF' }}>Maintenance</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>
              {requests.length} total{actionCount > 0 ? ` · ${actionCount} need action` : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
        <TextInput
          style={st.searchInput}
          placeholder="Search by title, unit, category, resident…"
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Action summary banner */}
      {actionCount > 0 && (
        <TouchableOpacity style={st.summaryBanner} onPress={() => setFilter('all')}>
          <Text style={{ color: C.primary, fontWeight: '700', fontSize: 13 }}>
            ⚡ {actionCount} request{actionCount > 1 ? 's' : ''} need{actionCount === 1 ? 's' : ''} your action
          </Text>
        </TouchableOpacity>
      )}

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ borderBottomWidth: 1, borderBottomColor: '#D0EEEE' }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
      >
        {FILTERS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[st.chip, filter === key && st.chipActive]}
            onPress={() => setFilter(key)}
          >
            <Text style={[st.chipText, filter === key && { color: '#FFF' }]}>
              {label} ({getCount(key)})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && !refreshing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} colors={[C.primary]} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 48, opacity: 0.5 }}>
              <Text style={{ fontSize: 36 }}>🔧</Text>
              <Text style={{ fontSize: 15, color: C.muted, marginTop: 8 }}>No maintenance requests</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  searchInput: { backgroundColor: C.card, borderWidth: 1.5, borderColor: '#B0DEDE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.text, marginBottom: 10 },
  summaryBanner: { marginHorizontal: 16, marginBottom: 4, backgroundColor: '#E8F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderLeftWidth: 4, borderLeftColor: C.primary },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8, backgroundColor: '#F0FAFA', borderWidth: 1, borderColor: '#D0EEEE' },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 11, fontWeight: '600', color: '#3D6E6E' },
  reqCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#D0EEEE' },
  reqTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2 },
  actionBanner: { marginTop: 8, backgroundColor: '#E8F5F5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', borderLeftWidth: 3, borderLeftColor: C.primary },
});
