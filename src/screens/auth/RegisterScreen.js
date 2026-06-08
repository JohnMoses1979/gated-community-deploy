/**
 * RegisterScreen.js
 *
 * Simple registration — just account details, NO doc upload here.
 * Docs are collected later inside the dashboard (Profile > Verify).
 *
 * Fields: Role, Full Name, Mobile, OTP (demo skip), Password, Confirm Password
 *
 * On submit:
 *   → registerUser() saves user AND auto-logs in (isLoggedIn=true)
 *   → RootNavigator routes to role dashboard automatically
 *   → Inside dashboard: Profile tab is open, all other tabs locked until verified
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';

const ROLES = ['Resident', 'Vendor', 'Guard', 'Builder', 'Admin'];
const MOCK_OTP = '123456';

const ROLE_MAP = {
  Resident: 'resident',
  Vendor:   'vendor',
  Guard:    'security',
  Builder:  'builder',
  Admin:    'admin',
};

const P = {
  teal: '#1A7A7A', tealDark: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFFFFF', text: '#1A2E2E', textSub: '#3D6E6E',
  textMuted: '#7A9E9E', border: '#D0EEEE', success: '#2E7D32',
  successBg: '#E8F5E9', successBorder: '#A5D6A7',
};

import { useAuthStore } from '../../store/AuthStore';
import { useAppContext } from '../superadmin/SocietyContext';

export default function RegisterScreen({ navigation }) {
  const registerUser = useAuthStore((s) => s.registerUser);
  const sendOtp      = useAuthStore((s) => s.sendOtp);
  const verifyOtp    = useAuthStore((s) => s.verifyOtp);
  const { addNotification } = useAppContext();

  const [name,            setName]            = useState('');
  const [phone,           setPhone]           = useState('');
  const [otp,             setOtp]             = useState('');
  const [otpSent,         setOtpSent]         = useState(false);
  const [otpVerified,     setOtpVerified]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role,            setRole]            = useState('Resident');
  const [vendorType,      setVendorType]      = useState('marketplace');
  const [showPw,          setShowPw]          = useState(false);

  const handleSendOtp = async () => {
    if (phone.length < 10) { Alert.alert('Invalid', 'Enter a valid 10-digit mobile number.'); return; }
    
    setLoading(true);
    const result = await sendOtp(`+91${phone}`); // Assuming Indian number, adjust if needed
    setLoading(false);

    if (result.success) {
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Please check your mobile for the verification code.');
    } else {
      Alert.alert('Error', result.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) { Alert.alert('Invalid', 'Enter the OTP sent to your phone.'); return; }

    setLoading(true);
    const result = await verifyOtp(`+91${phone}`, otp);
    setLoading(false);

    if (result.success) {
      setOtpVerified(true);
      Alert.alert('Success', 'Phone number verified!');
    } else {
      Alert.alert('Verification Failed', result.message || 'Invalid OTP.');
    }
  };

  const handleSkipOtp = () => {
    // Demo only — skip OTP verification
    setOtpVerified(true);
    setOtpSent(true);
  };

  const handleRegister = async () => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    const roleKey = ROLE_MAP[role] || 'resident';

    if (!name.trim() || name.trim().length < 3) { 
      Alert.alert('Invalid Name', 'Please enter your full name (at least 3 characters).'); 
      return; 
    }
    if (!phoneRegex.test(phone)) { 
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Indian mobile number.'); 
      return; 
    }
    if (!otpVerified) { 
      Alert.alert('Verify OTP', 'Please verify your mobile number with OTP first.'); 
      return; 
    }
    if (!password.trim() || password.length < 6) { 
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.'); 
      return; 
    }
    if (roleKey === 'vendor' && !vendorType) {
      Alert.alert('Select Type', 'Please choose Business or Marketplace for vendor registration.');
      return;
    }
    if (password !== confirmPassword) { 
      Alert.alert('Mismatch', 'Passwords do not match.'); 
      return; 
    }


    // await is required here because registerUser is async
    const result = await registerUser({
      name: name.trim(),
      phone: phone.trim(),
      password,
      role: roleKey,
      vendorType: roleKey === 'vendor' ? vendorType : null,
      businessType: roleKey === 'vendor' && vendorType === 'business' ? 'business' : null,
      marketplaceType: roleKey === 'vendor' && vendorType === 'marketplace' ? 'marketplace' : null,
    });

    if (result.success) {
      if (roleKey === 'admin' || roleKey === 'builder') {
        addNotification({
          title: `New ${roleKey === 'admin' ? 'Admin' : 'Builder'} Registration`,
          message: `${name} has registered as a ${roleKey}. Verification required.`,
          type: 'warning',
          category: 'admin_registration',
          userId: result.user.id,
          targetRole: 'superadmin',
        });
      }
    } else {
      Alert.alert('Error', result.message);
    }
    // No navigation needed — AuthStore sets isLoggedIn=true → RootNavigator handles it
  };

  return (
    <SafeAreaView style={[rs.safe, { backgroundColor: P.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={P.teal} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={rs.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={rs.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={rs.backBtn}>
              <Text style={rs.backText}>← Back to Login</Text>
            </TouchableOpacity>
            <Text style={rs.headerTitle}>Create Account</Text>
            <Text style={rs.headerSub}>Join your community — verify later inside the app</Text>
          </View>

          <View style={rs.card}>

            {/* Role selector */}
            <Text style={rs.label}>Register as *</Text>
            <View style={rs.roleGrid}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[rs.roleChip, role === r && rs.roleChipActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[rs.roleChipText, role === r && { color: '#FFF' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {role === 'Vendor' && (
              <>
                <Text style={rs.label}>Vendor Type *</Text>
                <View style={rs.roleGrid}>
                  {[
                    { key: 'business', label: 'Business (Services)' },
                    { key: 'marketplace', label: 'Marketplace (Store)' },
                  ].map((v) => (
                    <TouchableOpacity
                      key={v.key}
                      style={[rs.roleChip, vendorType === v.key && rs.roleChipActive]}
                      onPress={() => setVendorType(v.key)}
                    >
                      <Text style={[rs.roleChipText, vendorType === v.key && { color: '#FFF' }]}>{v.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Full Name */}
            <Text style={rs.label}>Full Name *</Text>
            <TextInput
              style={rs.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={P.textMuted}
              autoCapitalize="words"
            />

            {/* Mobile + OTP */}
            <Text style={rs.label}>Mobile Number *</Text>
            <View style={rs.row}>
              <TextInput
                style={[rs.input, { flex: 1, borderColor: otpVerified ? P.success : P.border }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit mobile"
                placeholderTextColor={P.textMuted}
                keyboardType="numeric"
                maxLength={10}
                editable={!otpVerified}
              />
              <TouchableOpacity
                style={[rs.otpBtn, { backgroundColor: otpVerified ? P.success : P.teal }]}
                onPress={otpVerified ? null : handleSendOtp}
                activeOpacity={otpVerified ? 1 : 0.8}
              >
                <Text style={rs.otpBtnText}>{otpVerified ? '✓ Verified' : 'Send OTP'}</Text>
              </TouchableOpacity>
            </View>

            {otpSent && !otpVerified && (
              <>
                <Text style={[rs.label, { marginTop: 8 }]}>Enter OTP *</Text>
                <View style={rs.row}>
                  <TextInput
                    style={[rs.input, { flex: 1 }]}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="6-digit OTP"
                    placeholderTextColor={P.textMuted}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TouchableOpacity style={[rs.otpBtn, { backgroundColor: P.tealDark }]} onPress={handleVerifyOtp}>
                    <Text style={rs.otpBtnText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Demo skip OTP */}
            {!otpVerified && (
              <TouchableOpacity style={rs.skipBtn} onPress={handleSkipOtp}>
                <Text style={rs.skipBtnText}>⚡ Demo: Skip OTP Verification</Text>
              </TouchableOpacity>
            )}

            {/* Password */}
            <Text style={[rs.label, { marginTop: 8 }]}>Password *</Text>
            <View style={rs.row}>
              <TextInput
                style={[rs.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 characters"
                placeholderTextColor={P.textMuted}
                secureTextEntry={!showPw}
                autoCapitalize="none"
              />
              <TouchableOpacity style={rs.eyeBtn} onPress={() => setShowPw(!showPw)}>
                <Text style={{ fontSize: 18 }}>{showPw ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={rs.label}>Confirm Password *</Text>
            <TextInput
              style={rs.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              placeholderTextColor={P.textMuted}
              secureTextEntry={!showPw}
              autoCapitalize="none"
            />

            {/* Info box */}
            <View style={rs.infoBox}>
              <Text style={rs.infoText}>
                ℹ️ You will enter the dashboard immediately.{'\n'}
                • <Text style={{ fontWeight: '800' }}>Residents/Vendors/Guards:</Text> Go to Profile → Verify Account to upload documents for Admin approval.{'\n'}
                • <Text style={{ fontWeight: '800' }}>Admins/Builders:</Text> Your account will be reviewed by the Super Admin.
              </Text>
            </View>

            <TouchableOpacity style={rs.registerBtn} onPress={handleRegister}>
              <Text style={rs.registerBtnText}>Register & Enter Dashboard →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={rs.loginLink} onPress={() => navigation.navigate('Login')}>
              <Text style={rs.loginLinkText}>
                Already have an account?{'  '}
                <Text style={{ fontWeight: '800', color: P.teal }}>Login</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const rs = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: { backgroundColor: P.teal, padding: 24, paddingTop: 48 },
  backBtn:{ marginBottom: 12 },
  backText:{ color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  card:   { margin: 16, backgroundColor: P.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: P.border },

  label:  { fontSize: 13, fontWeight: '700', color: P.textSub, marginBottom: 6, marginTop: 4 },
  input:  { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, backgroundColor: P.bg, borderColor: P.border, color: P.text, marginBottom: 2 },
  row:    { flexDirection: 'row', gap: 8 },
  otpBtn: { paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12, justifyContent: 'center', minWidth: 100, alignItems: 'center' },
  otpBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  eyeBtn: { backgroundColor: P.bg, borderRadius: 12, padding: 13, borderWidth: 1.5, borderColor: P.border, justifyContent: 'center' },

  roleGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  roleChip:       { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, backgroundColor: P.bg, borderColor: P.border },
  roleChipActive: { backgroundColor: P.teal, borderColor: P.teal },
  roleChipText:   { fontSize: 13, fontWeight: '600', color: P.textMuted },

  skipBtn:     { alignItems: 'center', paddingVertical: 8, marginTop: 4 },
  skipBtnText: { fontSize: 12, color: P.teal, fontWeight: '700' },

  infoBox:  { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 12, marginBottom: 4 },
  infoText: { fontSize: 13, color: '#1D4ED8', lineHeight: 20 },

  registerBtn:     { backgroundColor: P.teal, paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 12, marginBottom: 12 },
  registerBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  loginLink:       { alignItems: 'center', paddingVertical: 8 },
  loginLinkText:   { fontSize: 14, color: P.textMuted },
});
