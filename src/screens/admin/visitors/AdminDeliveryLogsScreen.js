import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
} from 'react-native';
import { useSecurityStore } from '../../../store/securityStore';

const P = {
  teal: '#1A7A7A',
  tealDeep: '#1A7A7A',
  bg: '#E8F5F5',
  surface: '#FFFFFF',
  text: '#1A2E2E',
  textMuted: '#7A9E9E',
  border: '#D0EEEE',
};

const fmt = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

const startOfToday = () => {
  const dt = new Date();
  dt.setHours(0, 0, 0, 0);
  return dt;
};

export default function AdminDeliveryLogsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const entryLogs = useSecurityStore(s => s.entryLogs || []);

  const today = startOfToday();
  const todaysDeliveryLogs = useMemo(() => {
    return entryLogs
      .filter(l => String(l.type || '').toUpperCase() === 'DELIVERY')
      .filter(l => new Date(l.at || 0) >= today)
      .filter(l => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          String(l.name || '').toLowerCase().includes(q) ||
          String(l.unit || '').toLowerCase().includes(q) ||
          String(l.hostResidentName || '').toLowerCase().includes(q) ||
          String(l.provider || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  }, [entryLogs, search, today]);

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDeep} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Delivery Logs</Text>
        <Text style={s.sub}>Today: {todaysDeliveryLogs.length}</Text>
      </View>

      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          placeholder="Search resident, unit, provider, person..."
          placeholderTextColor={P.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={todaysDeliveryLogs}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyText}>No delivery entries for today</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.name}>{item.name || item.provider || 'Delivery'}</Text>
            <Text style={s.subText}>Resident: {item.hostResidentName || '-'}</Text>
            <Text style={s.subText}>Unit: {item.unit || '-'}</Text>
            <Text style={s.subText}>Action: {String(item.action || '').replace(/_/g, ' ') || '-'}</Text>
            <Text style={s.subText}>Time: {fmt(item.at)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  header: { backgroundColor: P.tealDeep, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 6, fontWeight: '600' },
  title: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  sub: { color: 'rgba(255,255,255,0.75)', marginTop: 2, fontSize: 12 },
  searchWrap: { padding: 14, borderBottomWidth: 1, borderBottomColor: P.border, backgroundColor: P.surface },
  searchInput: { backgroundColor: P.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: P.text },
  list: { padding: 14, paddingBottom: 30 },
  card: { backgroundColor: P.surface, borderRadius: 12, borderWidth: 1, borderColor: P.border, padding: 12, marginBottom: 10 },
  name: { fontSize: 14, fontWeight: '800', color: P.text },
  subText: { fontSize: 12, color: P.textMuted, marginTop: 2 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: P.textMuted, fontSize: 14, fontWeight: '600' },
});

