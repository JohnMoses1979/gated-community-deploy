/**
 * AddDeliveryStaffScreen.js
 *
 * Form screen to add a new delivery helper OR edit an existing one.
 *
 * Navigation params:
 *   staffToEdit (optional) — pass existing staff object to pre-fill form for editing
 *
 * Route: AddDeliveryStaff
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { useDeliveryStaffSlice } from '../../../services/deliveryStaffApi';

const VEHICLE_TYPES = ['Bike', 'Bicycle', 'Auto', 'Car', 'Walk'];

export default function AddDeliveryStaffScreen({ navigation, route }) {
    const staffToEdit = route?.params?.staffToEdit || null;
    const isEditing = !!staffToEdit;

    const { addStaff, updateStaff } = useDeliveryStaffSlice();

    const [name, setName] = useState(staffToEdit?.name || '');
    const [phone, setPhone] = useState(staffToEdit?.phone || '');
    const [vehicleType, setVehicleType] = useState(staffToEdit?.vehicleType || '');
    const [saving, setSaving] = useState(false);

    const [errors, setErrors] = useState({});

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Helper name is required';
        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10,15}$/.test(phone.trim())) {
            newErrors.phone = 'Enter a valid 10–15 digit phone number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            if (isEditing) {
                await updateStaff(staffToEdit.id, {
                    name: name.trim(),
                    phone: phone.trim(),
                    vehicleType: vehicleType.trim() || null,
                });
                Alert.alert('✅ Updated', `${name.trim()} has been updated.`, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                await addStaff({
                    name: name.trim(),
                    phone: phone.trim(),
                    vehicleType: vehicleType.trim() || null,
                });
                Alert.alert(
                    '✅ Helper Added',
                    `${name.trim()} has been added to your delivery team.\nThey can now be assigned to orders.`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (err) {
            Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.teal} />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Text style={s.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={s.heading}>{isEditing ? 'Edit Helper' : 'Add Delivery Helper'}</Text>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Important notice */}
                    <View style={s.noticeBanner}>
                        <Text style={{ fontSize: 16 }}>ℹ️</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={s.noticeTitle}>No app account needed</Text>
                            <Text style={s.noticeText}>
                                Delivery helpers do not need to sign up or login. You manage them here and assign them to orders as needed.
                            </Text>
                        </View>
                    </View>

                    {/* Name */}
                    <View style={s.fieldGroup}>
                        <Text style={s.label}>Full Name *</Text>
                        <TextInput
                            style={[s.input, errors.name && s.inputError]}
                            placeholder="e.g. Ravi Kumar"
                            placeholderTextColor="#94A3B8"
                            value={name}
                            onChangeText={v => { setName(v); setErrors(e => ({ ...e, name: null })); }}
                            autoCapitalize="words"
                            returnKeyType="next"
                        />
                        {errors.name ? <Text style={s.errorText}>{errors.name}</Text> : null}
                    </View>

                    {/* Phone */}
                    <View style={s.fieldGroup}>
                        <Text style={s.label}>Phone Number *</Text>
                        <TextInput
                            style={[s.input, errors.phone && s.inputError]}
                            placeholder="e.g. 9876543210"
                            placeholderTextColor="#94A3B8"
                            value={phone}
                            onChangeText={v => { setPhone(v); setErrors(e => ({ ...e, phone: null })); }}
                            keyboardType="phone-pad"
                            maxLength={15}
                            returnKeyType="next"
                        />
                        {errors.phone ? <Text style={s.errorText}>{errors.phone}</Text> : null}
                    </View>

                    {/* Vehicle Type */}
                    <View style={s.fieldGroup}>
                        <Text style={s.label}>Vehicle Type (Optional)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={s.chipRow}>
                                {VEHICLE_TYPES.map(v => (
                                    <TouchableOpacity
                                        key={v}
                                        style={[s.chip, vehicleType === v && s.chipActive]}
                                        onPress={() => setVehicleType(vehicleType === v ? '' : v)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[s.chipText, vehicleType === v && s.chipTextActive]}>
                                            {v === 'Bike' ? '🏍️' : v === 'Bicycle' ? '🚲' : v === 'Auto' ? '🛺' : v === 'Car' ? '🚗' : '🚶'} {v}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        <TextInput
                            style={[s.input, { marginTop: 8 }]}
                            placeholder="Or type custom vehicle type"
                            placeholderTextColor="#94A3B8"
                            value={VEHICLE_TYPES.includes(vehicleType) ? '' : vehicleType}
                            onChangeText={v => setVehicleType(v)}
                            returnKeyType="done"
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[s.saveBtn, saving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.85}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={s.saveBtnText}>
                                {isEditing ? '✅ Save Changes' : '➕ Add Helper'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
        gap: 14,
    },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    backArrow: { fontSize: 26, color: '#FFFFFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
    heading: { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFFFFF', flex: 1 },

    noticeBanner: {
        flexDirection: 'row',
        gap: 10,
        backgroundColor: Colors.blueLight,
        borderRadius: Radius.lg,
        padding: 14,
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    noticeTitle: { fontSize: 13, fontWeight: Fonts.bold, color: Colors.blue, marginBottom: 3 },
    noticeText: { fontSize: 12, color: Colors.blue, lineHeight: 17 },

    fieldGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 8 },
    input: {
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: Radius.md,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 15,
        color: Colors.text,
        backgroundColor: Colors.white,
    },
    inputError: { borderColor: '#EF4444' },
    errorText: { fontSize: 12, color: '#EF4444', marginTop: 5 },

    chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: Radius.full,
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    chipActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
    chipText: { fontSize: 13, color: Colors.text2, fontWeight: Fonts.medium },
    chipTextActive: { color: '#FFFFFF', fontWeight: Fonts.bold },

    saveBtn: {
        backgroundColor: Colors.teal,
        borderRadius: Radius.lg,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 8,
        ...Shadows.card,
    },
    saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: Fonts.bold },
});