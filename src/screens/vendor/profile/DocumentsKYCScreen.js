import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, Divider } from '../../../vendor/components';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store/AuthStore';

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function DocumentsKYCScreen({ navigation }) {
  const theme = useTheme();
  const { user, submitVerification } = useAuthStore();
  
  const [uploaded, setUploaded] = useState({
    aadhar: user?.verificationStatus === 'approved' || user?.verificationStatus === 'pending',
    pan:    user?.verificationStatus === 'approved' || user?.verificationStatus === 'pending',
    trade:  false,
    gst:    false,
  });

  const [loading, setLoading] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState(null);

  const handleUpload = async (key, label) => {
    Alert.alert('Select Document', `How would you like to upload your ${label}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Gallery', onPress: () => pickImage(key, label) },
      { text: 'Files (PDF)', onPress: () => pickDocument(key, label) },
    ]);
  };

  const pickImage = async (key, label) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      validateDocument(key, label, result.assets[0]);
    }
  };

  const pickDocument = async (key, label) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
    });

    if (!result.canceled) {
      validateDocument(key, label, result.assets[0]);
    }
  };

  const validateDocument = (key, label, file) => {
    setVerifyingKey(key);
    // Simulate AI OCR Verification
    setTimeout(() => {
      setVerifyingKey(null);
      
      // Verification Logic:
      // 1. If it's too small (width < 300) -> Reject
      // 2. Mocking a check for "Aadhar" or "PAN"
      if (file.width && file.width < 300) {
        Alert.alert(
          'Verification Failed ❌', 
          `The ${label} photo is too blurry or not suitable. Please upload a clear, high-resolution original document.`
        );
      } else {
        setUploaded(prev => ({ ...prev, [key]: file.uri }));
        Alert.alert('Verified! ✅', `${label} recognized and verified successfully.`);
      }
    }, 2500);
  };

  const handleSubmit = async () => {
    if (!uploaded.aadhar || !uploaded.pan) {
      Alert.alert('Incomplete', 'Please upload at least Aadhar and PAN card.');
      return;
    }

    setLoading(true);
    try {
      await submitVerification(user?.id, uploaded);
      Alert.alert(
        'Success! 🎉', 
        'Your documents have been submitted successfully. Admin will review and approve your profile soon.',
        [{ text: 'Great!', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to submit documents. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const DOCS = [
    { key: 'aadhar', label: 'Aadhar Card',       icon: '🪪' },
    { key: 'pan',    label: 'PAN Card',          icon: '📄' },
    { key: 'trade',  label: 'Trade Certificate', icon: '📋' },
    { key: 'gst',    label: 'GST Certificate',   icon: '🏛️' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Documents & KYC" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.headerSection}>
          <Text style={s.headerTitle}>Verify Your Identity</Text>
          <Text style={s.headerSub}>Current Status: <Text style={{fontWeight:'bold', color: Colors.teal}}>{user?.verificationStatus?.toUpperCase() || 'NOT SUBMITTED'}</Text></Text>
        </View>

        <Card style={{ marginBottom: 20, paddingVertical: 4 }}>
          {DOCS.map((doc, i) => {
            const isDone = uploaded[doc.key];
            const isVerifying = verifyingKey === doc.key;
            return (
              <View key={doc.key}>
                <TouchableOpacity 
                  style={s.docRow} 
                  onPress={() => handleUpload(doc.key, doc.label)}
                  disabled={user?.verificationStatus === 'approved' || isVerifying}
                >
                  <View style={[s.docIconBox, { backgroundColor: isDone ? Colors.greenLight : isVerifying ? Colors.amberLight : '#F1F5F5' }]}>
                    <Text style={{ fontSize: 20 }}>{isVerifying ? '🔍' : doc.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.docLabel}>{doc.label}</Text>
                    <Text style={[s.docStatus, { color: isDone ? Colors.green : isVerifying ? Colors.amber : Colors.text3 }]}>
                      {isVerifying ? 'Verifying with AI...' : isDone ? '✅ Verified & Uploaded' : '❌ Not Uploaded'}
                    </Text>
                  </View>
                  {!isDone && !isVerifying && <Text style={s.uploadLink}>Upload</Text>}
                </TouchableOpacity>
                {i < DOCS.length - 1 && <Divider />}
              </View>
            );
          })}
        </Card>

        {user?.verificationStatus !== 'approved' && (
          <PrimaryButton 
            title={loading ? "Submitting..." : "Submit for Verification"} 
            onPress={handleSubmit}
            disabled={loading}
          />
        )}

        <View style={[s.infoBanner, { marginTop: 20 }]}>
          <Text style={s.infoText}>📌 Note: Verification typically takes 24-48 hours. Please ensure documents are clearly visible.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#E8F5F5' },
  scroll:     { padding: 16, paddingBottom: 40 },
  headerSection: { marginBottom: 20, paddingHorizontal: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1A2E2E' },
  headerSub:   { fontSize: 14, color: '#475569', marginTop: 4 },
  docRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 14 },
  docIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  docLabel:   { fontSize: 15, fontWeight: '700', color: '#1A2E2E' },
  docStatus:  { fontSize: 12, fontWeight: '600', marginTop: 2 },
  uploadLink: { color: Colors.teal, fontWeight: '700', fontSize: 14 },
  infoBanner: { backgroundColor: '#CCFBF1', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#1A7A7A' },
  infoText:   { fontSize: 13, color: '#0F766E', lineHeight: 18 },
});
