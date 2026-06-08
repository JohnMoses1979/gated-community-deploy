// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Alert } from 'react-native';
// import { useSecurityStore } from '../../../store/securityStore';

// const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
// const STATUS_CFG = {
//   pending:  {label:'Pending', color:'#D97706',bg:'#FEF3C7'},
//   approved: {label:'Approved',color:'#16A34A',bg:'#DCFCE7'},
//   rejected: {label:'Rejected',color:'#DC2626',bg:'#FEE2E2'},
// };

// export default function VisitorParkingAdminScreen({ navigation }) {
//   const guestParking        = useSecurityStore(s => s.guestParking) || [];
//   const approveGuestParking = useSecurityStore(s => s.approveGuestParking);
//   const rejectGuestParking  = useSecurityStore(s => s.rejectGuestParking);
//   const [filter, setFilter] = useState('pending');

//   const filtered = guestParking.filter(p => filter==='all' || p.status===filter);

//   return (
//     <SafeAreaView style={s.screen}>
//       <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

//       <View style={s.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={s.backText}>← Back</Text>
//         </TouchableOpacity>
//         <View style={s.headerRow}>
//           <View>
//             <Text style={s.headerTitle}>🚗 Visitor Parking</Text>
//             <Text style={s.headerSub}>{guestParking.filter(p=>p.status==='pending').length} requests pending</Text>
//           </View>
//         </View>
//       </View>

//       <View style={s.tabRow}>
//         {['pending','approved','rejected','all'].map(k=>(
//           <TouchableOpacity key={k} style={[s.tab,filter===k&&s.tabActive]} onPress={()=>setFilter(k)}>
//             <Text style={[s.tabText,filter===k&&s.tabTextActive]}>{k.charAt(0).toUpperCase()+k.slice(1)}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <FlatList
//         data={filtered}
//         keyExtractor={p=>p.id}
//         contentContainerStyle={s.list}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={<View style={s.empty}><Text style={{fontSize:48}}>🚗</Text><Text style={s.emptyText}>No parking requests</Text></View>}
//         renderItem={({item:p})=>{
//           const cfg = STATUS_CFG[p.status]||STATUS_CFG.pending;
//           return (
//             <View style={s.card}>
//               <View style={s.cardTop}>
//                 <View style={{flex:1}}>
//                   <Text style={s.cardTitle}>{p.vehicleNumber||'Vehicle'}</Text>
//                   <Text style={s.cardSub}>Unit {p.hostUnit} · {p.guestName||'Guest'}</Text>
//                   {p.purpose && <Text style={s.cardSub}>Purpose: {p.purpose}</Text>}
//                   {p.startDate && <Text style={s.cardSub}>📅 {fmt(p.startDate)} – {fmt(p.endDate)}</Text>}
//                 </View>
//                 <View style={[s.badge,{backgroundColor:cfg.bg}]}>
//                   <Text style={[s.badgeText,{color:cfg.color}]}>{cfg.label}</Text>
//                 </View>
//               </View>
//               {p.status==='pending' && (
//                 <View style={s.actionRow}>
//                   <TouchableOpacity style={[s.actionBtn,{backgroundColor:'#FEE2E2'}]}
//                     onPress={()=>rejectGuestParking&&rejectGuestParking(p.id)}>
//                     <Text style={[s.actionBtnText,{color:'#DC2626'}]}>✕ Reject</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={[s.actionBtn,{backgroundColor:'#DCFCE7',flex:2}]}
//                     onPress={()=>{ approveGuestParking&&approveGuestParking(p.id); Alert.alert('✅ Approved'); }}>
//                     <Text style={[s.actionBtnText,{color:'#16A34A'}]}>✓ Approve</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>
//           );
//         }}
//       />
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   screen:        {flex:1,backgroundColor:'#E8F5F5'},
//   header:        {backgroundColor:'#1A7A7A',paddingTop:40,paddingBottom:16,paddingHorizontal:20},
//   backText:      {color:'rgba(255,255,255,0.85)',fontSize:14,fontWeight:'600',marginBottom:8},
//   headerRow:     {flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
//   headerTitle:   {fontSize:22,fontWeight:'900',color:'#FFF'},
//   headerSub:     {fontSize:12,color:'rgba(255,255,255,0.72)',marginTop:1},
//   tabRow:        {flexDirection:'row',backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#D0EEEE'},
//   tab:           {flex:1,paddingVertical:12,alignItems:'center'},
//   tabActive:     {borderBottomWidth:3,borderBottomColor:'#1A7A7A'},
//   tabText:       {fontSize:12,fontWeight:'600',color:'#7A9E9E'},
//   tabTextActive: {color:'#1A7A7A',fontWeight:'800'},
//   list:          {padding:14,paddingBottom:40},
//   card:          {backgroundColor:'#FFF',borderRadius:14,padding:14,marginBottom:10,borderWidth:1,borderColor:'#D0EEEE',elevation:1},
//   cardTop:       {flexDirection:'row',alignItems:'flex-start',gap:12,marginBottom:8},
//   cardTitle:     {fontSize:15,fontWeight:'800',color:'#1A2E2E'},
//   cardSub:       {fontSize:12,color:'#7A9E9E',marginTop:2},
//   badge:         {paddingHorizontal:10,paddingVertical:4,borderRadius:20},
//   badgeText:     {fontSize:11,fontWeight:'800'},
//   actionRow:     {flexDirection:'row',gap:8,marginTop:10},
//   actionBtn:     {flex:1,paddingVertical:10,borderRadius:10,alignItems:'center'},
//   actionBtnText: {fontSize:13,fontWeight:'800'},
//   empty:         {alignItems:'center',paddingTop:60},
//   emptyText:     {fontSize:15,color:'#7A9E9E',marginTop:12},
// });









/**
 * VisitorParkingAdminScreen.js — Admin
 *
 * Aligned to backend contract:
 *   GET /api/admin/guest-parking           — all requests
 *   PUT /api/admin/guest-parking/{id}/approve
 *   PUT /api/admin/guest-parking/{id}/reject
 *
 * Uses securityStore.fetchGuestParking(), approveGuestParking(), rejectGuestParking().
 * Admin identity from JWT — no adminId sent to backend.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSecurityStore } from '../../../store/securityStore';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_CFG = {
  PENDING: { label: 'Pending', color: '#E65100', bg: '#FEF3C7' },
  APPROVED: { label: 'Approved', color: '#1A7A7A', bg: '#CCFBF1' },
  ACTIVE: { label: 'Active', color: '#1565C0', bg: '#DBEAFE' },
  EXITED: { label: 'Exited', color: '#64748B', bg: '#F1F5F9' },
  EXPIRED: { label: 'Expired', color: '#64748B', bg: '#F1F5F9' },
  REJECTED: { label: 'Rejected', color: '#C62828', bg: '#FEE2E2' },
  OVERSTAY: { label: 'Overstay', color: '#C62828', bg: '#FEE2E2' },
};

const TAB_FILTERS = ['all', 'PENDING', 'APPROVED', 'ACTIVE', 'EXITED', 'REJECTED'];
const TAB_LABELS = {
  all: 'All', PENDING: 'Pending', APPROVED: 'Approved',
  ACTIVE: 'Active', EXITED: 'Exited', REJECTED: 'Rejected',
};

export default function VisitorParkingAdminScreen({ navigation }) {
  const guestParking = useSecurityStore(s => s.guestParking) || [];
  const fetchGuestParking = useSecurityStore(s => s.fetchGuestParking);
  const approveGuestParking = useSecurityStore(s => s.approveGuestParking);
  const rejectGuestParking = useSecurityStore(s => s.rejectGuestParking);

  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null); // tracks which card is loading

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    await fetchGuestParking?.();
    setRefreshing(false);
  }, [fetchGuestParking]);

  useFocusEffect(useCallback(() => { fetchAll(); }, [fetchAll]));

  const normalise = (p) => {
    const status = (p.status || 'PENDING').toUpperCase();
    const migratedStatus = status === 'EXPIRED' ? 'EXITED' : status;
    const isOverstay =
      migratedStatus === 'ACTIVE' &&
      p.endTime &&
      new Date(p.endTime).getTime() < Date.now();
    return { ...p, status: isOverstay ? 'OVERSTAY' : migratedStatus };
  };
  const allNorm = guestParking.map(normalise);
  const filtered = filter === 'all' ? allNorm : allNorm.filter(p => p.status === filter);

  const pendingCount = allNorm.filter(p => p.status === 'PENDING').length;
  const activeCount = allNorm.filter(p => p.status === 'ACTIVE').length;

  const handleApprove = async (p) => {
    Alert.alert(
      'Approve Parking',
      `Approve parking for ${p.guestName}?\nSlot: ${p.slotNumber}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setActionId(p.id);
            const result = await approveGuestParking(p.id);
            setActionId(null);
            if (result) {
              Alert.alert('✅ Approved', `Parking approved. Slot ${result.slotNumber} confirmed.`);
            } else {
              Alert.alert('Error', 'Could not approve. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (p) => {
    Alert.alert(
      'Reject Parking',
      `Reject parking request for ${p.guestName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActionId(p.id);
            const result = await rejectGuestParking(p.id);
            setActionId(null);
            if (result) {
              Alert.alert('Rejected', 'Parking request has been rejected.');
            } else {
              Alert.alert('Error', 'Could not reject. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item: p }) => {
    const cfg = STATUS_CFG[p.status] || STATUS_CFG.PENDING;
    const loading = actionId === p.id;

    return (
      <View style={s.card}>
        {/* Top row */}
        <View style={s.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{p.vehicleNumber || 'Vehicle'}</Text>
            <Text style={s.cardSub}>👤 {p.guestName || 'Guest'}</Text>
            <Text style={s.cardSub}>🏠 Unit {p.unit || '—'} · {p.residentName || '—'}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Slot + OTP */}
        <View style={s.slotRow}>
          <View style={s.slotBox}>
            <Text style={s.slotBoxLabel}>SLOT</Text>
            <Text style={s.slotBoxVal}>{p.slotNumber || '—'}</Text>
          </View>
          <View style={[s.slotBox, { backgroundColor: '#1A7A7A' }]}>
            <Text style={[s.slotBoxLabel, { color: 'rgba(255,255,255,0.7)' }]}>OTP</Text>
            <Text style={[s.slotBoxVal, { color: '#FFFFFF', fontSize: 20 }]}>{p.parkingOtp || '—'}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={s.detailsBox}>
          {[
            { l: 'Vehicle Type', v: p.vehicleType || '—' },
            { l: 'Phone', v: p.guestPhone || '—' },
            { l: 'Duration', v: p.durationDays ? `${p.durationDays} day(s)` : '—' },
            { l: 'Expected', v: fmt(p.expectedDate) },
            { l: 'Requested', v: fmtTime(p.requestedAt) },
            ...(p.approvedAt ? [{ l: 'Approved', v: fmtTime(p.approvedAt) }] : []),
            ...(p.rejectedAt ? [{ l: 'Rejected', v: fmtTime(p.rejectedAt) }] : []),
            ...(p.startTime ? [{ l: 'Active from', v: fmtTime(p.startTime) }] : []),
            ...(p.endTime ? [{ l: 'Expires', v: fmtTime(p.endTime) }] : []),
            ...(p.exitTime ? [{ l: 'Exited', v: fmtTime(p.exitTime) }] : []),
          ].map(r => (
            <View key={r.l} style={s.detailRow}>
              <Text style={s.dLabel}>{r.l}</Text>
              <Text style={s.dValue}>{r.v}</Text>
            </View>
          ))}
        </View>

        {p.status === 'ACTIVE' && (
          <View style={[s.statusBanner, { backgroundColor: '#DBEAFE', borderColor: '#1565C0' }]}>
            <Text style={{ color: '#1565C0', fontWeight: '700', fontSize: 12 }}>
              🚗 Guest is currently parked in slot {p.slotNumber}
            </Text>
          </View>
        )}
        {p.status === 'OVERSTAY' && (
          <View style={[s.statusBanner, { backgroundColor: '#FEE2E2', borderColor: '#C62828' }]}>
            <Text style={{ color: '#C62828', fontWeight: '700', fontSize: 12 }}>
              ⚠️ Guest has exceeded allowed parking duration
            </Text>
          </View>
        )}

        {/* Approve / Reject actions — PENDING only */}
        {p.status === 'PENDING' && (
          <View style={s.actionRow}>
            {loading ? (
              <View style={s.loadingRow}>
                <ActivityIndicator color="#1A7A7A" size="small" />
                <Text style={{ color: '#1A7A7A', marginLeft: 8, fontWeight: '700' }}>Processing...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: '#FEE2E2' }]}
                  onPress={() => handleReject(p)}
                >
                  <Text style={[s.actionBtnText, { color: '#C62828' }]}>✕ Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: '#CCFBF1', flex: 2 }]}
                  onPress={() => handleApprove(p)}
                >
                  <Text style={[s.actionBtnText, { color: '#1A7A7A' }]}>✓ Approve</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>🚗 Guest Parking</Text>
            <Text style={s.headerSub}>{pendingCount} pending · {activeCount} active</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={s.statChip}>
              <Text style={s.statChipText}>{allNorm.length} Total</Text>
            </View>
            <TouchableOpacity
              style={[s.statChip, { backgroundColor: 'rgba(255,255,255,0.3)' }]}
              onPress={fetchAll}
            >
              <Text style={s.statChipText}>↻ Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filter chips */}
      <View style={s.filterRow}>
        {TAB_FILTERS.map(k => (
          <TouchableOpacity
            key={k}
            style={[s.filterChip, filter === k && s.filterChipActive]}
            onPress={() => setFilter(k)}
          >
            <Text style={[s.filterChipText, filter === k && s.filterChipTextActive]}>
              {TAB_LABELS[k] || k}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={p => String(p.id)}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        onRefresh={fetchAll}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>🚗</Text>
            <Text style={s.emptyText}>No parking requests</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8F5F5' },
  header: { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  statChip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statChipText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#D0EEEE' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F0FAFA', borderWidth: 1, borderColor: '#D0EEEE' },
  filterChipActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  filterChipText: { fontSize: 11, fontWeight: '600', color: '#3D6E6E' },
  filterChipTextActive: { color: '#FFF' },
  list: { padding: 14, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#D0EEEE', overflow: 'hidden', elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, paddingBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#1A2E2E', letterSpacing: 1 },
  cardSub: { fontSize: 12, color: '#7A9E9E', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '800' },
  slotRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#D0EEEE' },
  slotBox: { flex: 1, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRightWidth: 1, borderRightColor: '#D0EEEE' },
  slotBoxLabel: { fontSize: 9, fontWeight: '800', color: '#7A9E9E', letterSpacing: 2, marginBottom: 2 },
  slotBoxVal: { fontSize: 24, fontWeight: '900', color: '#1A7A7A', letterSpacing: 3, fontFamily: 'monospace' },
  detailsBox: { backgroundColor: '#F8FAFA', borderTopWidth: 1, borderTopColor: '#D0EEEE', padding: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#EEF5F5' },
  dLabel: { fontSize: 12, color: '#7A9E9E', fontWeight: '600' },
  dValue: { fontSize: 12, color: '#1A2E2E', fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 8, padding: 12 },
  actionBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: '800' },
  loadingRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 11 },
  statusBanner: { margin: 12, marginTop: 0, borderRadius: 10, padding: 10, borderWidth: 1 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#7A9E9E', marginTop: 12 },
});
