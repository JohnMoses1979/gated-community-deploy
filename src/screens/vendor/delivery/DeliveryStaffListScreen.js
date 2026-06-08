/**
 * DeliveryStaffListScreen.js
 *
 * Lists all vendor delivery helpers (active + inactive).
 * Vendor can: add new, toggle active/inactive, delete, navigate to edit.
 *
 * Route: VendorDeliveryStaffList
 * Navigation entry point: Vendor Dashboard or VendorOrdersScreen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { useDeliveryStaffSlice } from '../../../services/deliveryStaffApi';

// ─── Vehicle type emoji helper ────────────────────────────────────────────────
function vehicleEmoji(vehicleType) {
    if (!vehicleType) return '🚶';
    const v = vehicleType.toLowerCase();
    if (v.includes('bike') || v.includes('motor')) return '🏍️';
    if (v.includes('cycle') || v.includes('bicycle')) return '🚲';
    if (v.includes('auto')) return '🛺';
    if (v.includes('car')) return '🚗';
    return '🚶';
}

// ─── Staff Card ───────────────────────────────────────────────────────────────
function StaffCard({ item, onToggle, onDelete, onEdit }) {
    return (
        <View style={[s.card, !item.active && s.cardInactive]}>
            <View style={s.cardLeft}>
                <View style={[s.avatar, { backgroundColor: item.active ? Colors.tealLight : '#F1F5F9' }]}>
                    <Text style={{ fontSize: 22 }}>{vehicleEmoji(item.vehicleType)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={s.nameRow}>
                        <Text style={[s.name, !item.active && s.nameInactive]}>{item.name}</Text>
                        <View style={[s.statusBadge, { backgroundColor: item.active ? Colors.greenLight : '#F1F5F9' }]}>
                            <Text style={[s.statusBadgeText, { color: item.active ? Colors.green : '#94A3B8' }]}>
                                {item.active ? '● Active' : '○ Inactive'}
                            </Text>
                        </View>
                    </View>
                    <Text style={s.phone}>📞 {item.phone}</Text>
                    {item.vehicleType ? (
                        <Text style={s.vehicle}>{vehicleEmoji(item.vehicleType)} {item.vehicleType}</Text>
                    ) : null}
                </View>
            </View>

            <View style={s.actions}>
                <TouchableOpacity
                    style={[s.actionBtn, { backgroundColor: item.active ? Colors.amberLight : Colors.tealLight }]}
                    onPress={() => onToggle(item)}
                    activeOpacity={0.8}
                >
                    <Text style={[s.actionBtnText, { color: item.active ? Colors.amber : Colors.teal }]}>
                        {item.active ? 'Disable' : 'Enable'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[s.actionBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => onDelete(item)}
                    activeOpacity={0.8}
                >
                    <Text style={[s.actionBtnText, { color: '#C62828' }]}>Remove</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DeliveryStaffListScreen({ navigation }) {
    const { staff, loading, fetchStaff, toggleStaff, deleteStaff } = useDeliveryStaffSlice();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStaff().catch(() => { });
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try { await fetchStaff(); } catch { }
        setRefreshing(false);
    }, [fetchStaff]);

    const handleToggle = (item) => {
        const action = item.active ? 'Disable' : 'Enable';
        Alert.alert(
            `${action} Helper`,
            `${action} ${item.name}? ${item.active
                ? 'They will not be assignable to new orders.'
                : 'They will be available for order assignment again.'}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: action,
                    onPress: async () => {
                        try {
                            await toggleStaff(item.id);
                        } catch (err) {
                            Alert.alert('Error', err.message);
                        }
                    },
                },
            ]
        );
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Remove Helper',
            `Remove ${item.name} from your delivery team?\n\nExisting order history will be preserved.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteStaff(item.id);
                        } catch (err) {
                            Alert.alert('Error', err.message);
                        }
                    },
                },
            ]
        );
    };

    const activeCount = staff.filter(s => s.active).length;
    const inactiveCount = staff.filter(s => !s.active).length;

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.teal} />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Text style={s.backArrow}>‹</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={s.heading}>Delivery Team</Text>
                    <Text style={s.subheading}>
                        {activeCount} active · {inactiveCount} inactive
                    </Text>
                </View>
                {loading && <ActivityIndicator size="small" color="#FFFFFF" />}
                <TouchableOpacity
                    style={s.addBtn}
                    onPress={() => navigation.navigate('AddDeliveryStaff')}
                    activeOpacity={0.8}
                >
                    <Text style={s.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {/* Info banner */}
            <View style={s.infoBanner}>
                <Text style={{ fontSize: 13 }}>ℹ️</Text>
                <Text style={s.infoText}>
                    These helpers are your own delivery team. They do not have app accounts.
                    Only active helpers can be assigned to orders.
                </Text>
            </View>

            <FlatList
                data={staff}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />
                }
                renderItem={({ item }) => (
                    <StaffCard
                        item={item}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                    />
                )}
                ListEmptyComponent={
                    !loading ? (
                        <View style={s.empty}>
                            <Text style={{ fontSize: 48, marginBottom: 12 }}>🏍️</Text>
                            <Text style={s.emptyTitle}>No delivery helpers yet</Text>
                            <Text style={s.emptySub}>
                                Add your delivery team members to assign them to orders.
                            </Text>
                            <TouchableOpacity
                                style={s.emptyAddBtn}
                                onPress={() => navigation.navigate('AddDeliveryStaff')}
                                activeOpacity={0.8}
                            >
                                <Text style={s.emptyAddBtnText}>+ Add First Helper</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={s.empty}>
                            <ActivityIndicator size="large" color={Colors.teal} />
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    header: {
        backgroundColor: Colors.teal,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        gap: 12,
    },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    backArrow: { fontSize: 26, color: '#FFFFFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
    heading: { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFFFFF' },
    subheading: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
    addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md },
    addBtnText: { color: '#FFFFFF', fontWeight: Fonts.bold, fontSize: 13 },

    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: Colors.blueLight,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    infoText: { flex: 1, fontSize: 12, color: Colors.blue, lineHeight: 17 },

    card: {
        backgroundColor: Colors.white,
        borderRadius: Radius.lg,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.card,
    },
    cardInactive: { opacity: 0.7, borderColor: '#E2E8F0' },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    avatar: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 },
    name: { fontSize: 15, fontWeight: Fonts.bold, color: Colors.text },
    nameInactive: { color: '#94A3B8' },
    phone: { fontSize: 12, color: Colors.text2, marginBottom: 2 },
    vehicle: { fontSize: 12, color: Colors.text3 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
    statusBadgeText: { fontSize: 10, fontWeight: Fonts.bold },

    actions: { flexDirection: 'row', gap: 8 },
    actionBtn: { flex: 1, paddingVertical: 9, borderRadius: Radius.md, alignItems: 'center' },
    actionBtnText: { fontSize: 12, fontWeight: Fonts.bold },

    empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
    emptyTitle: { fontSize: 18, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 8 },
    emptySub: { fontSize: 13, color: Colors.text3, textAlign: 'center', lineHeight: 19, marginBottom: 24 },
    emptyAddBtn: { backgroundColor: Colors.teal, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.md },
    emptyAddBtnText: { color: '#FFFFFF', fontWeight: Fonts.bold, fontSize: 14 },
});