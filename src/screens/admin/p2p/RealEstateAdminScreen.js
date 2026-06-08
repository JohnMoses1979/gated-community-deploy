// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Alert } from 'react-native';
// import useAppStore from '../../../store/appStore';

// const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
// const STATUS_CFG = {
//   pending:  { label:'Pending',  color:'#D97706', bg:'#FEF3C7' },
//   approved: { label:'Approved', color:'#16A34A', bg:'#DCFCE7' },
//   rejected: { label:'Rejected', color:'#DC2626', bg:'#FEE2E2' },
// };

// export default function RealEstateAdminScreen({ navigation }) {
//   const listings         = useAppStore(s => s.realEstateListings) || [];
//   const approveListing   = useAppStore(s => s.approveRealEstateListing);
//   const rejectListing    = useAppStore(s => s.rejectRealEstateListing);
//   const [filter, setFilter] = useState('pending');

//   const filtered = listings.filter(l => filter === 'all' || l.status === filter);

//   return (
//     <SafeAreaView style={s.screen}>
//       <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

//       <View style={s.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={s.backText}>← Back</Text>
//         </TouchableOpacity>
//         <View style={s.headerRow}>
//           <View>
//             <Text style={s.headerTitle}>🏠 Real Estate</Text>
//             <Text style={s.headerSub}>{listings.filter(l=>l.status==='pending').length} pending approval</Text>
//           </View>
//         </View>
//         <View style={s.statsRow}>
//           {[
//             {l:'Pending', v:listings.filter(l=>l.status==='pending').length, c:'#FDE68A'},
//             {l:'Approved',v:listings.filter(l=>l.status==='approved').length,c:'#6EE7B7'},
//             {l:'Rejected',v:listings.filter(l=>l.status==='rejected').length,c:'#FCA5A5'},
//           ].map((st,i)=>(
//             <View key={i} style={{flex:1,alignItems:'center'}}>
//               {i>0 && <View style={{position:'absolute',left:0,top:4,bottom:4,width:1,backgroundColor:'rgba(255,255,255,0.2)'}}/>}
//               <Text style={{fontSize:20,fontWeight:'900',color:st.c}}>{st.v}</Text>
//               <Text style={{fontSize:9,color:'rgba(255,255,255,0.6)',fontWeight:'600',marginTop:1}}>{st.l}</Text>
//             </View>
//           ))}
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
//         keyExtractor={l=>l.id}
//         contentContainerStyle={s.list}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={<View style={s.empty}><Text style={{fontSize:48}}>🏠</Text><Text style={s.emptyText}>No listings here</Text></View>}
//         renderItem={({item:l})=>{
//           const cfg = STATUS_CFG[l.status]||STATUS_CFG.pending;
//           return (
//             <View style={s.card}>
//               <View style={s.cardTop}>
//                 <View style={{flex:1}}>
//                   <Text style={s.cardTitle}>{l.title||`${l.type} — Unit ${l.unit}`}</Text>
//                   <Text style={s.cardSub}>Unit {l.unit} · {l.sellerName||l.ownerName||'Resident'}</Text>
//                   {l.price ? <Text style={s.cardPrice}>₹{Number(l.price).toLocaleString('en-IN')}</Text> : null}
//                 </View>
//                 <View style={[s.badge,{backgroundColor:cfg.bg}]}>
//                   <Text style={[s.badgeText,{color:cfg.color}]}>{cfg.label}</Text>
//                 </View>
//               </View>
//               {l.description ? <Text style={s.cardDesc} numberOfLines={2}>{l.description}</Text> : null}
//               <Text style={s.cardMeta}>Listed {fmt(l.createdAt||l.listedAt)}</Text>
//               {l.status==='pending' && (
//                 <View style={s.actionRow}>
//                   <TouchableOpacity style={[s.actionBtn,{backgroundColor:'#FEE2E2'}]}
//                     onPress={()=>Alert.alert('Reject?','',[ {text:'Cancel',style:'cancel'},{text:'Reject',style:'destructive',onPress:()=>rejectListing&&rejectListing(l.id)} ])}>
//                     <Text style={[s.actionBtnText,{color:'#DC2626'}]}>✕ Reject</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={[s.actionBtn,{backgroundColor:'#DCFCE7',flex:2}]}
//                     onPress={()=>{ approveListing&&approveListing(l.id); Alert.alert('✅ Approved','Listing is now live.'); }}>
//                     <Text style={[s.actionBtnText,{color:'#16A34A'}]}>✓ Approve Listing</Text>
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
//   screen:       { flex:1, backgroundColor:'#E8F5F5' },
//   header:       { backgroundColor:'#1A7A7A', paddingTop:40, paddingBottom:16, paddingHorizontal:20 },
//   backText:     { color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:'600', marginBottom:8 },
//   headerRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
//   headerTitle:  { fontSize:22, fontWeight:'900', color:'#FFF' },
//   headerSub:    { fontSize:12, color:'rgba(255,255,255,0.72)', marginTop:1 },
//   statsRow:     { flexDirection:'row', alignItems:'center' },
//   tabRow:       { flexDirection:'row', backgroundColor:'#FFF', borderBottomWidth:1, borderBottomColor:'#D0EEEE' },
//   tab:          { flex:1, paddingVertical:12, alignItems:'center' },
//   tabActive:    { borderBottomWidth:3, borderBottomColor:'#1A7A7A' },
//   tabText:      { fontSize:12, fontWeight:'600', color:'#7A9E9E' },
//   tabTextActive:{ color:'#1A7A7A', fontWeight:'800' },
//   list:         { padding:14, paddingBottom:40 },
//   card:         { backgroundColor:'#FFF', borderRadius:14, padding:14, marginBottom:10, borderWidth:1, borderColor:'#D0EEEE', elevation:1 },
//   cardTop:      { flexDirection:'row', alignItems:'flex-start', gap:12, marginBottom:8 },
//   cardTitle:    { fontSize:15, fontWeight:'800', color:'#1A2E2E' },
//   cardSub:      { fontSize:12, color:'#7A9E9E', marginTop:2 },
//   cardPrice:    { fontSize:16, fontWeight:'900', color:'#1A7A7A', marginTop:4 },
//   cardDesc:     { fontSize:13, color:'#3D6E6E', lineHeight:20, marginBottom:8 },
//   cardMeta:     { fontSize:11, color:'#7A9E9E' },
//   badge:        { paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
//   badgeText:    { fontSize:11, fontWeight:'800' },
//   actionRow:    { flexDirection:'row', gap:8, marginTop:10 },
//   actionBtn:    { flex:1, paddingVertical:10, borderRadius:10, alignItems:'center' },
//   actionBtnText:{ fontSize:13, fontWeight:'800' },
//   empty:        { alignItems:'center', paddingTop:60 },
//   emptyText:    { fontSize:15, color:'#7A9E9E', marginTop:12 },
// });








































/**
 * RealEstateAdminScreen.js — Admin: Manage property listings
 *
 * SECURITY FIX (merged):
 *  - POST /api/admin/real-estate/listings/{id}/approve  (no adminId param — JWT)
 *  - POST /api/admin/real-estate/listings/{id}/reject   (no adminId param — JWT)
 *  - GET  /api/admin/real-estate/listings               (JWT auth header)
 *  - All requests carry Authorization: Bearer <token>
 *  - Backend derives admin identity from CurrentUser.get()
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, FlatList, Alert, ActivityIndicator,
  RefreshControl, TextInput, Modal,
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
  ACTIVE:           { label: 'Active',          color: '#1A7A7A', bg: '#DCFCE7' },
  PENDING_APPROVAL: { label: 'Pending',         color: '#D97706', bg: '#FEF3C7' },
  SOLD:             { label: 'Sold',            color: '#6B7280', bg: '#F3F4F6' },
  RENTED:           { label: 'Rented',          color: '#7C3AED', bg: '#EDE9FE' },
  WITHDRAWN:        { label: 'Withdrawn',        color: '#6B7280', bg: '#F3F4F6' },
  REJECTED:         { label: 'Rejected',         color: '#DC2626', bg: '#FEE2E2' },
};

function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: C.muted, bg: '#F1F5F9' };
  return (
    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: cfg.color }}>{cfg.label.toUpperCase()}</Text>
    </View>
  );
}

export default function RealEstateAdminScreen({ navigation }) {
  const token = useAuthStore(s => s.token);

  const [listings, setListings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState('PENDING_APPROVAL');
  const [rejectModal, setRejectModal] = useState(null); // listing being rejected
  const [rejectReason, setRejectReason] = useState('');
  const [actioning, setActioning]   = useState(null); // id being approved/rejected

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const fetchListings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const url = filter
        ? `${apiUrl('/admin/real-estate/listings')}?status=${filter}`
        : apiUrl('/admin/real-estate/listings');
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('Error', 'Could not load listings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, filter]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // FIX: POST /approve — no adminId query param, JWT used by backend
  const handleApprove = async (listing) => {
    Alert.alert(
      'Approve Listing?',
      `Approve "${listing.title}" by ${listing.ownerName}? It will go live immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setActioning(listing.id);
            try {
              const res = await fetch(
                apiUrl(`/admin/real-estate/listings/${listing.id}/approve`),
                { method: 'POST', headers: authHeaders }
              );
              if (!res.ok) throw new Error('Approval failed');
              const updated = await res.json();
              setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
              Alert.alert('✅ Approved', `"${listing.title}" is now live.`);
            } catch (e) {
              Alert.alert('Error', 'Could not approve listing.');
            } finally {
              setActioning(null);
            }
          },
        },
      ]
    );
  };

  // FIX: POST /reject — no adminId query param, JWT used by backend
  const handleReject = async () => {
    if (!rejectModal) return;
    setActioning(rejectModal.id);
    try {
      const res = await fetch(
        apiUrl(`/admin/real-estate/listings/${rejectModal.id}/reject`),
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ reason: rejectReason.trim() }),
        }
      );
      if (!res.ok) throw new Error('Rejection failed');
      const updated = await res.json();
      setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
      setRejectModal(null);
      setRejectReason('');
      Alert.alert('❌ Rejected', `"${rejectModal.title}" has been rejected.`);
    } catch (e) {
      Alert.alert('Error', 'Could not reject listing.');
    } finally {
      setActioning(null);
    }
  };

  const FILTERS = [
    { key: 'PENDING_APPROVAL', label: 'Pending' },
    { key: 'ACTIVE',           label: 'Active' },
    { key: 'REJECTED',         label: 'Rejected' },
    { key: '',                 label: 'All' },
  ];

  const pendingCount = listings.filter(l => l.status === 'PENDING_APPROVAL').length;

  const renderItem = ({ item }) => {
    const isPending = item.status === 'PENDING_APPROVAL';
    const isActioning = actioning === item.id;

    return (
      <View style={[st.card, isPending && { borderColor: C.warn, borderWidth: 1.5 }]}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={st.cardT}>{item.type === 'rent' ? '🏠' : '🏢'} {item.title}</Text>
            <Text style={st.cardS}>📍 Unit {item.unit}</Text>
          </View>
          <Badge status={item.status} />
        </View>

        {/* Owner info */}
        <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginBottom: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>👤 {item.ownerName}</Text>
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>📞 {item.ownerPhone}</Text>
        </View>

        {/* Property details */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <View>
            {item.bedrooms && (
              <Text style={st.cardS}>🛏 {item.bedrooms} BHK  ·  {item.furnished}</Text>
            )}
            {item.area && (
              <Text style={st.cardS}>📐 {item.area} sq ft</Text>
            )}
          </View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.accent }}>
            ₹{item.priceLabel || item.price?.toLocaleString('en-IN')}
          </Text>
        </View>

        {item.description ? (
          <Text style={[st.cardS, { marginBottom: 8 }]} numberOfLines={2}>{item.description}</Text>
        ) : null}

        {item.rejectionReason ? (
          <View style={{ backgroundColor: '#FEE2E2', borderRadius: 8, padding: 8, marginBottom: 8 }}>
            <Text style={{ color: C.danger, fontSize: 12 }}>Rejection reason: {item.rejectionReason}</Text>
          </View>
        ) : null}

        <Text style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
          Submitted {new Date(item.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
          {item.views ? `  ·  👁 ${item.views} views` : ''}
        </Text>

        {/* Action buttons — only for pending */}
        {isPending && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={[st.approveBtn, { flex: 1 }, isActioning && { opacity: 0.6 }]}
              onPress={() => handleApprove(item)}
              disabled={isActioning}
            >
              {isActioning
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={st.approveBtnT}>✅ Approve</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={[st.rejectBtn, { flex: 1 }, isActioning && { opacity: 0.6 }]}
              onPress={() => { setRejectModal(item); setRejectReason(''); }}
              disabled={isActioning}
            >
              <Text style={st.rejectBtnT}>❌ Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={st.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.back}>
          <Text style={st.backT}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={st.hdrT}>Real Estate Admin</Text>
            <Text style={st.hdrSub}>
              {pendingCount > 0
                ? `${pendingCount} pending approval`
                : `${listings.length} listing${listings.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
          {pendingCount > 0 && (
            <View style={{ backgroundColor: C.warn, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>{pendingCount} pending</Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={st.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[st.filterBtn, filter === f.key && st.filterBtnA]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[st.filterBtnT, filter === f.key && st.filterBtnTA]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={{ color: C.muted, marginTop: 12 }}>Loading listings...</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchListings(true)}
              colors={[C.primary]}
            />
          }
          ListEmptyComponent={
            <View style={st.empty}>
              <Text style={{ fontSize: 48 }}>🏠</Text>
              <Text style={st.emptyT}>No listings found</Text>
              <Text style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
                {filter === 'PENDING_APPROVAL' ? 'No pending approvals' : 'Try a different filter'}
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}

      {/* Reject reason modal */}
      <Modal
        visible={!!rejectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectModal(null)}
      >
        <View style={st.overlay}>
          <View style={st.modal}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: C.text, marginBottom: 6 }}>
              ❌ Reject Listing
            </Text>
            <Text style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
              "{rejectModal?.title}"
            </Text>
            <Text style={st.formLabel}>Reason (optional)</Text>
            <TextInput
              style={[st.input, { minHeight: 80, textAlignVertical: 'top' }]}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="e.g. Incomplete information, inappropriate content..."
              placeholderTextColor={C.muted}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[st.rejectBtn, { flex: 1 }, actioning && { opacity: 0.6 }]}
                onPress={handleReject}
                disabled={!!actioning}
              >
                {actioning
                  ? <ActivityIndicator color={C.danger} size="small" />
                  : <Text style={st.rejectBtnT}>Confirm Reject</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F1F5F9' }}
                onPress={() => setRejectModal(null)}
              >
                <Text style={{ color: C.text, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.bg },
  hdr:         { padding: 20, paddingTop: 40, backgroundColor: C.primary },
  back:        { marginBottom: 8 },
  backT:       { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  hdrT:        { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  hdrSub:      { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  filterRow:   { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: C.border },
  filterBtn:   { flex: 1, paddingVertical: 12, alignItems: 'center' },
  filterBtnA:  { borderBottomWidth: 3, borderBottomColor: C.primary },
  filterBtnT:  { fontSize: 12, fontWeight: '600', color: C.muted },
  filterBtnTA: { color: C.primary, fontWeight: '800' },
  card:        { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  cardT:       { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 2 },
  cardS:       { fontSize: 12, color: C.muted, marginTop: 2 },
  approveBtn:  { backgroundColor: C.success, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  approveBtnT: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  rejectBtn:   { backgroundColor: '#FEE2E2', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  rejectBtnT:  { color: C.danger, fontWeight: '800', fontSize: 14 },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal:       { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  formLabel:   { fontSize: 12, fontWeight: '700', color: C.muted, marginBottom: 6 },
  input:       { borderWidth: 1.5, borderRadius: 12, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: C.text, backgroundColor: '#FAFAFA' },
  empty:       { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyT:      { fontSize: 16, fontWeight: '700', color: C.muted },
});