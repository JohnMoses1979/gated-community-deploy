// import React, { useMemo, useState } from 'react';
// import { useTheme } from '../../../hooks/useTheme';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   StatusBar,
//   TextInput,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';

// export default function VehicleEntryScreen({ navigation }) {
//   const theme = useTheme();
//   const [vehicleNumber, setVehicleNumber] = useState('');
//   const [ownerName, setOwnerName] = useState('');
//   const [flatNumber, setFlatNumber] = useState('');
//   const [vehicleType, setVehicleType] = useState('');
//   const [purpose, setPurpose] = useState('');
//   const [parkingSlot, setParkingSlot] = useState('');
//   const [searchText, setSearchText] = useState('');

//   const [vehicleLogs, setVehicleLogs] = useState([
//     {
//       id: '1',
//       vehicleNumber: 'TS09AB1234',
//       ownerName: 'Ravi Kumar',
//       flatNumber: 'A-102',
//       vehicleType: 'Car',
//       purpose: 'Resident',
//       parkingSlot: '',
//       status: 'Entered',
//       entryTime: '09:10 AM',
//       exitTime: '-',
//     },
//     {
//       id: '2',
//       vehicleNumber: 'TS10XY5678',
//       ownerName: 'Suresh',
//       flatNumber: 'B-203',
//       vehicleType: 'Bike',
//       purpose: 'Visitor',
//       parkingSlot: 'P-07',
//       status: 'Exited',
//       entryTime: '10:05 AM',
//       exitTime: '11:20 AM',
//     },
//   ]);

//   const validateForm = () => {
//     if (!vehicleNumber.trim()) {
//       Alert.alert('Validation', 'Enter vehicle number');
//       return false;
//     }
//     if (!ownerName.trim()) {
//       Alert.alert('Validation', 'Enter owner name');
//       return false;
//     }
//     if (!flatNumber.trim()) {
//       Alert.alert('Validation', 'Enter flat number');
//       return false;
//     }
//     if (!vehicleType.trim()) {
//       Alert.alert('Validation', 'Enter vehicle type');
//       return false;
//     }
//     if (!purpose.trim()) {
//       Alert.alert('Validation', 'Enter purpose');
//       return false;
//     }
//     return true;
//   };

//   const getCurrentTime = () => {
//     return new Date().toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const handleAddVehicleLog = () => {
//     if (!validateForm()) return;

//     const newVehicle = {
//       id: Date.now().toString(),
//       vehicleNumber: vehicleNumber.toUpperCase(),
//       ownerName,
//       flatNumber,
//       vehicleType,
//       purpose,
//       parkingSlot: parkingSlot.trim().toUpperCase() || '',
//       status: 'Entered',
//       entryTime: getCurrentTime(),
//       exitTime: '-',
//     };

//     setVehicleLogs((prev) => [newVehicle, ...prev]);

//     setVehicleNumber('');
//     setOwnerName('');
//     setFlatNumber('');
//     setVehicleType('');
//     setPurpose('');
//     setParkingSlot('');

//     Alert.alert('Success', 'Vehicle entry added successfully');
//   };

//   const handleMarkExit = (id) => {
//     setVehicleLogs((prev) =>
//       prev.map((item) =>
//         item.id === id
//           ? {
//               ...item,
//               status: 'Exited',
//               exitTime: getCurrentTime(),
//             }
//           : item
//       )
//     );
//     Alert.alert('Updated', 'Vehicle marked as exited');
//   };

//   const filteredLogs = useMemo(() => {
//     return vehicleLogs.filter((item) => {
//       const value = searchText.toLowerCase();
//       return (
//         item.vehicleNumber.toLowerCase().includes(value) ||
//         item.ownerName.toLowerCase().includes(value) ||
//         item.flatNumber.toLowerCase().includes(value) ||
//         item.vehicleType.toLowerCase().includes(value) ||
//         item.purpose.toLowerCase().includes(value)
//       );
//     });
//   }, [searchText, vehicleLogs]);

//   return (
//     <SafeAreaView style={_s.root}>
//       <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />
//       <View style={_s.hdr}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={_s.bk}>
//           <Text style={_s.bkTxt}>‹</Text>
//         </TouchableOpacity>
//         <View style={{ flex: 1 }}>
//           <Text style={_s.hdTtl}>Vehicle Entry Log</Text>
//           <Text style={_s.hdSub}>Track vehicle movements</Text>
//         </View>
//       </View>
//       <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
//       <Text style={styles.title}>Vehicle Logs</Text>
//       <Text style={styles.subtitle}>Add vehicle entry and manage exit logs</Text>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Add Vehicle Entry</Text>

//         <Text style={styles.label}>Vehicle Number</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter vehicle number"
//           value={vehicleNumber}
//           onChangeText={setVehicleNumber}
//           autoCapitalize="characters"
//           placeholderTextColor="#777"
//         />

//         <Text style={styles.label}>Owner Name</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter owner name"
//           value={ownerName}
//           onChangeText={setOwnerName}
//           placeholderTextColor="#777"
//         />

//         <Text style={styles.label}>Flat Number</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter flat number"
//           value={flatNumber}
//           onChangeText={setFlatNumber}
//           placeholderTextColor="#777"
//         />

//         <Text style={styles.label}>Vehicle Type</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Car / Bike / EV / Van"
//           value={vehicleType}
//           onChangeText={setVehicleType}
//           placeholderTextColor="#777"
//         />

//         <Text style={styles.label}>Purpose</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Resident / Visitor / Delivery"
//           value={purpose}
//           onChangeText={setPurpose}
//           placeholderTextColor="#777"
//         />

//         <Text style={styles.label}>Parking Slot (Optional)</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="e.g. P-12, B2-05"
//           value={parkingSlot}
//           onChangeText={setParkingSlot}
//           autoCapitalize="characters"
//           placeholderTextColor="#777"
//         />

//         <TouchableOpacity style={styles.primaryBtn} onPress={handleAddVehicleLog}>
//           <Text style={styles.primaryBtnText}>Add Vehicle Log</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Search Vehicle Logs</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Search by vehicle / owner / flat"
//           value={searchText}
//           onChangeText={setSearchText}
//           placeholderTextColor="#777"
//         />
//       </View>

//       <Text style={styles.sectionTitle}>Recent Vehicle Entries</Text>

//       {filteredLogs.length === 0 ? (
//         <View style={styles.emptyCard}>
//           <Text style={styles.emptyText}>No vehicle logs found</Text>
//         </View>
//       ) : (
//         filteredLogs.map((item) => (
//           <View key={item.id} style={styles.logCard}>
//             <View style={styles.rowBetween}>
//               <Text style={styles.vehicleNo}>{item.vehicleNumber}</Text>
//               <Text
//                 style={[
//                   styles.statusBadge,
//                   item.status === 'Entered' ? styles.enteredBadge : styles.exitedBadge,
//                 ]}
//               >
//                 {item.status}
//               </Text>
//             </View>

//             <Text style={styles.logText}>Owner: {item.ownerName}</Text>
//             <Text style={styles.logText}>Flat: {item.flatNumber}</Text>
//             <Text style={styles.logText}>Type: {item.vehicleType}</Text>
//             <Text style={styles.logText}>Purpose: {item.purpose}</Text>
//             {item.parkingSlot ? <Text style={[styles.logText, {color: theme.primary, fontWeight: '700'}]}>Parking Slot: {item.parkingSlot}</Text> : null}
//             <Text style={styles.logText}>Entry: {item.entryTime}</Text>
//             <Text style={styles.logText}>Exit: {item.exitTime}</Text>

//             {item.status === 'Entered' && (
//               <TouchableOpacity
//                 style={styles.secondaryBtn}
//                 onPress={() => handleMarkExit(item.id)}
//               >
//                 <Text style={styles.secondaryBtnText}>Mark Exit</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         ))
//       )}
//     </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#E8F5F5',
//     padding: 16,
//     paddingBottom: 40,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#1A2E2E',
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#7A9E9E',
//     marginBottom: 18,
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E3E3E3',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1A7A7A',
//     marginBottom: 14,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#1A2E2E',
//     marginBottom: 8,
//     marginTop: 4,
//   },
//   input: {
//     backgroundColor: '#E8F5F5',
//     borderWidth: 1,
//     borderColor: '#D6D6D6',
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     fontSize: 15,
//     color: '#1A2E2E',
//     marginBottom: 12,
//   },
//   primaryBtn: {
//     backgroundColor: '#1A7A7A',
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   primaryBtnText: {
//     color: '#1A2E2E',
//     fontSize: 15,
//     fontWeight: '800',
//   },
//   logCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#E3E3E3',
//   },
//   rowBetween: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   vehicleNo: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: '#1A7A7A',
//     marginBottom: 10,
//   },
//   statusBadge: {
//     fontSize: 12,
//     fontWeight: '700',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 20,
//     overflow: 'hidden',
//   },
//   enteredBadge: {
//     backgroundColor: '#FFFFFF',
//     color: '#2E7D32',
//   },
//   exitedBadge: {
//     backgroundColor: '#FDECEC',
//     color: '#C62828',
//   },
//   logText: {
//     fontSize: 14,
//     color: '#444',
//     marginBottom: 6,
//   },
//   secondaryBtn: {
//     marginTop: 12,
//     borderWidth: 1,
//     borderColor: '#1A7A7A',
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   secondaryBtnText: {
//     color: '#1A7A7A',
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   emptyCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#E3E3E3',
//     alignItems: 'center',
//   },
//   emptyText: {
//     color: '#7A9E9E',
//     fontSize: 15,
//   },
// });

// const _s = StyleSheet.create({
//   root:  { flex: 1, backgroundColor: '#E8F5F5' },
//   hdr:   { backgroundColor: '#0D6E6E', paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
//   bk:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
//   bkTxt: { fontSize: 26, color: '#FFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
//   hdTtl: { color: '#FFF', fontSize: 18, fontWeight: '900' },
//   hdSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
// });

















/**
 * VehicleEntryScreen.js — Guard
 *
 * Tracks vehicle entry/exit at the gate.
 * When navigated from VisitorVerificationScreen after parking OTP is verified,
 * route.params.prefill is set with vehicle details and parkingId.
 * Mark Exit calls securityStore.expireGuestParking(parkingId) to mark EXITED and release slot.
 *
 * All guest parking mutations go through securityStore → guestParkingApi.js.
 * No direct fetch() calls — uses existing apiClient pattern.
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { useSecurityStore } from '../../../store/securityStore';
import { useFocusEffect } from '@react-navigation/native';

export default function VehicleEntryScreen({ navigation, route }) {
  const theme = useTheme();

  const guestParking = useSecurityStore(s => s.guestParking) || [];
  const fetchGuestParking = useSecurityStore(s => s.fetchGuestParking);
  const expireGuestParking = useSecurityStore(s => s.expireGuestParking);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [parkingSlot, setParkingSlot] = useState('');
  const [searchText, setSearchText] = useState('');
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [linkedParkingId, setLinkedParkingId] = useState(null);

  // ── Vehicle logs (local session state) ────────────────────────────────────
  const [vehicleLogs, setVehicleLogs] = useState([
    // {
    //   id: '1', vehicleNumber: 'TS09AB1234', ownerName: 'Ravi Kumar',
    //   flatNumber: 'A-102', vehicleType: 'Car', purpose: 'Resident',
    //   parkingSlot: '', status: 'Entered', entryTime: '09:10 AM',
    //   exitTime: '-', parkingId: null,
    // },
    // {
    //   id: '2', vehicleNumber: 'TS10XY5678', ownerName: 'Suresh',
    //   flatNumber: 'B-203', vehicleType: 'Bike', purpose: 'Visitor',
    //   parkingSlot: 'P-07', status: 'Exited', entryTime: '10:05 AM',
    //   exitTime: '11:20 AM', parkingId: null,
    // },
  ]);

  // ── Auto-detect active guest parking not yet in logs ──────────────────────
  const activeParkingPrefill = useMemo(() => {
    const loggedParkingIds = new Set(vehicleLogs.map(l => l.parkingId).filter(Boolean));
    const active = [...guestParking]
      .filter(p => p.status === 'ACTIVE' && !loggedParkingIds.has(p.id))
      .sort((a, b) => new Date(b.startTime || b.requestedAt || 0) - new Date(a.startTime || a.requestedAt || 0));

    if (active.length === 0) return null;
    const latest = active[0];
    return {
      parkingId: latest.id,
      vehicleNumber: latest.vehicleNumber || '',
      ownerName: latest.guestName || '',
      flatNumber: latest.unit || '',
      vehicleType: latest.vehicleType || 'Car',
      purpose: 'Visitor (Guest Parking)',
      parkingSlot: latest.slotNumber || '',
    };
  }, [guestParking, vehicleLogs]);

  // ── Sync ACTIVE guest parking into logs on focus ──────────────────────────
  useFocusEffect(
    useCallback(() => {
      fetchGuestParking?.();
    }, [fetchGuestParking])
  );

  useFocusEffect(
    useCallback(() => {
      const active = guestParking.filter(p => p.status === 'ACTIVE');
      if (active.length === 0) return;
      setVehicleLogs(prev => {
        const existingParkingIds = new Set(prev.map(l => l.parkingId).filter(Boolean));
        const newEntries = active
          .filter(p => !existingParkingIds.has(p.id))
          .map(p => ({
            id: `park-${p.id}`,
            vehicleNumber: p.vehicleNumber,
            ownerName: p.guestName,
            flatNumber: p.unit,
            vehicleType: p.vehicleType || 'Car',
            purpose: 'Visitor (Guest Parking)',
            parkingSlot: p.slotNumber,
            status: 'Entered',
            entryTime: p.startTime
              ? new Date(p.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : getCurrentTime(),
            exitTime: '-',
            parkingId: p.id,
          }));
        return newEntries.length > 0 ? [...newEntries, ...prev] : prev;
      });
    }, [guestParking])
  );

  // ── Pre-fill form from navigation params or active parking ────────────────
  useEffect(() => {
    const prefill = route?.params?.prefill || activeParkingPrefill;
    if (!prefill || prefillApplied) return;
    if (prefill.vehicleNumber) setVehicleNumber(prefill.vehicleNumber);
    if (prefill.ownerName) setOwnerName(prefill.ownerName);
    if (prefill.flatNumber) setFlatNumber(prefill.flatNumber);
    if (prefill.vehicleType) setVehicleType(prefill.vehicleType);
    if (prefill.purpose) setPurpose(prefill.purpose);
    if (prefill.parkingSlot) setParkingSlot(prefill.parkingSlot);
    if (prefill.parkingId) setLinkedParkingId(prefill.parkingId);
    setPrefillApplied(true);
  }, [route?.params?.prefill, activeParkingPrefill, prefillApplied]);

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const validateForm = () => {
    if (!vehicleNumber.trim()) { Alert.alert('Validation', 'Enter vehicle number'); return false; }
    if (!ownerName.trim()) { Alert.alert('Validation', 'Enter owner name'); return false; }
    if (!flatNumber.trim()) { Alert.alert('Validation', 'Enter flat number'); return false; }
    if (!vehicleType.trim()) { Alert.alert('Validation', 'Enter vehicle type'); return false; }
    if (!purpose.trim()) { Alert.alert('Validation', 'Enter purpose'); return false; }
    return true;
  };

  // ── Add / update log ───────────────────────────────────────────────────────
  const handleAddVehicleLog = () => {
    if (!validateForm()) return;

    const newEntry = {
      id: Date.now().toString(),
      vehicleNumber: vehicleNumber.toUpperCase(),
      ownerName,
      flatNumber,
      vehicleType,
      purpose,
      parkingSlot: parkingSlot.trim().toUpperCase() || '',
      status: 'Entered',
      entryTime: getCurrentTime(),
      exitTime: '-',
      parkingId: linkedParkingId || null,
    };

    setVehicleLogs(prev => {
      if (!linkedParkingId) return [newEntry, ...prev];
      const existingIndex = prev.findIndex(item => item.parkingId === linkedParkingId);
      if (existingIndex === -1) return [newEntry, ...prev];
      return prev.map(item =>
        item.parkingId === linkedParkingId
          ? {
            ...item,
            vehicleNumber: newEntry.vehicleNumber,
            ownerName: newEntry.ownerName,
            flatNumber: newEntry.flatNumber,
            vehicleType: newEntry.vehicleType,
            purpose: newEntry.purpose,
            parkingSlot: newEntry.parkingSlot,
          }
          : item
      );
    });

    setVehicleNumber('');
    setOwnerName('');
    setFlatNumber('');
    setVehicleType('');
    setPurpose('');
    setParkingSlot('');
    setLinkedParkingId(null);
    setPrefillApplied(false);

    Alert.alert(
      'Success',
      linkedParkingId ? 'Vehicle entry updated successfully' : 'Vehicle entry added successfully'
    );
  };

  // ── Mark Exit: releases guest parking slot if linked ──────────────────────
  const handleMarkExit = (id) => {
    const log = vehicleLogs.find(item => item.id === id);

    const doExit = async () => {
      if (log?.parkingId) {
        try {
          await expireGuestParking(log.parkingId);
        } catch (e) {
          Alert.alert('Exit Failed', e.message || 'Could not close this parking session. Please try again.');
          return;
        }
      }
      setVehicleLogs(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status: 'Exited', exitTime: getCurrentTime() }
            : item
        )
      );
      if (log?.parkingId) {
        Alert.alert(
          '✅ Exited',
          `${log.vehicleNumber} exited.\nParking slot ${log.parkingSlot} has been released.`
        );
      } else {
        Alert.alert('Updated', 'Vehicle marked as exited');
      }
    };

    if (log?.parkingId) {
      Alert.alert(
        'Confirm Exit',
        `Mark ${log.vehicleNumber} as exited?\nSlot ${log.parkingSlot} will be released.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm Exit', onPress: doExit },
        ]
      );
    } else {
      doExit();
    }
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    if (!searchText.trim()) return vehicleLogs;
    const val = searchText.toLowerCase();
    return vehicleLogs.filter(item =>
      item.vehicleNumber.toLowerCase().includes(val) ||
      item.ownerName.toLowerCase().includes(val) ||
      item.flatNumber.toLowerCase().includes(val) ||
      item.vehicleType.toLowerCase().includes(val) ||
      item.purpose.toLowerCase().includes(val)
    );
  }, [searchText, vehicleLogs]);

  const prefill = route?.params?.prefill || activeParkingPrefill;

  return (
    <SafeAreaView style={_s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />

      <View style={_s.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={_s.bk}>
          <Text style={_s.bkTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={_s.hdTtl}>Vehicle Entry Log</Text>
          <Text style={_s.hdSub}>Track vehicle movements</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Vehicle Logs</Text>
        <Text style={styles.subtitle}>Add vehicle entry and manage exit logs</Text>

        {/* ── Add Form ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add Vehicle Entry</Text>

          {prefill && prefillApplied && (
            <View style={styles.prefillBanner}>
              <Text style={{ fontSize: 20 }}>✅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefillTitle}>Auto-filled from Guest Parking OTP</Text>
                <Text style={styles.prefillSub}>
                  Slot {prefill.parkingSlot} · {prefill.vehicleNumber}
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.label}>Vehicle Number</Text>
          <TextInput
            style={[styles.input, prefill && prefillApplied && vehicleNumber ? styles.inputPrefilled : null]}
            placeholder="Enter vehicle number"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            autoCapitalize="characters"
            placeholderTextColor="#777"
          />

          <Text style={styles.label}>Owner Name</Text>
          <TextInput
            style={[styles.input, prefill && prefillApplied && ownerName ? styles.inputPrefilled : null]}
            placeholder="Enter owner name"
            value={ownerName}
            onChangeText={setOwnerName}
            placeholderTextColor="#777"
          />

          <Text style={styles.label}>Flat Number</Text>
          <TextInput
            style={[styles.input, prefill && prefillApplied && flatNumber ? styles.inputPrefilled : null]}
            placeholder="Enter flat number"
            value={flatNumber}
            onChangeText={setFlatNumber}
            placeholderTextColor="#777"
          />

          <Text style={styles.label}>Vehicle Type</Text>
          <TextInput
            style={[styles.input, prefill && prefillApplied && vehicleType ? styles.inputPrefilled : null]}
            placeholder="Car / Bike / EV / Van"
            value={vehicleType}
            onChangeText={setVehicleType}
            placeholderTextColor="#777"
          />

          <Text style={styles.label}>Purpose</Text>
          <TextInput
            style={[styles.input, prefill && prefillApplied && purpose ? styles.inputPrefilled : null]}
            placeholder="Resident / Visitor / Delivery"
            value={purpose}
            onChangeText={setPurpose}
            placeholderTextColor="#777"
          />

          <Text style={styles.label}>Parking Slot (Optional)</Text>
          <TextInput
            style={[styles.input, prefill && prefillApplied && parkingSlot ? styles.inputPrefilled : null]}
            placeholder="e.g. A-12, B2-05"
            value={parkingSlot}
            onChangeText={setParkingSlot}
            autoCapitalize="characters"
            placeholderTextColor="#777"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleAddVehicleLog}>
            <Text style={styles.primaryBtnText}>Add Vehicle Log</Text>
          </TouchableOpacity>
        </View>

        {/* ── Search ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Search Vehicle Logs</Text>
          <TextInput
            style={styles.input}
            placeholder="Search by vehicle / owner / flat"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#777"
          />
        </View>

        <Text style={styles.sectionTitle}>Recent Vehicle Entries</Text>

        {filteredLogs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No vehicle logs found</Text>
          </View>
        ) : (
          filteredLogs.map(item => (
            <View
              key={item.id}
              style={[styles.logCard, item.parkingId ? styles.logCardParking : null]}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.vehicleNo}>{item.vehicleNumber}</Text>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  {item.parkingId ? (
                    <View style={styles.parkingBadge}>
                      <Text style={styles.parkingBadgeText}>🅿️ Guest</Text>
                    </View>
                  ) : null}
                  <Text style={[
                    styles.statusBadge,
                    item.status === 'Entered' ? styles.enteredBadge : styles.exitedBadge,
                  ]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.logText}>Owner: {item.ownerName}</Text>
              <Text style={styles.logText}>Flat: {item.flatNumber}</Text>
              <Text style={styles.logText}>Type: {item.vehicleType}</Text>
              <Text style={styles.logText}>Purpose: {item.purpose}</Text>
              {item.parkingSlot ? (
                <Text style={[styles.logText, { color: theme.primary || '#1A7A7A', fontWeight: '700' }]}>
                  🅿️ Parking Slot: {item.parkingSlot}
                </Text>
              ) : null}
              <Text style={styles.logText}>Entry: {item.entryTime}</Text>

              <View style={styles.exitRow}>
                <Text style={styles.logText}>Exit:{'  '}</Text>
                {item.status === 'Exited'
                  ? <Text style={styles.exitTimeActual}>{item.exitTime}</Text>
                  : <Text style={styles.exitTimePending}>— Pending —</Text>}
              </View>

              {item.status === 'Entered' && (
                <TouchableOpacity
                  style={[styles.secondaryBtn, item.parkingId ? styles.secondaryBtnParking : null]}
                  onPress={() => handleMarkExit(item.id)}
                >
                  <Text style={[styles.secondaryBtnText, item.parkingId ? styles.secondaryBtnTextParking : null]}>
                    {item.parkingId ? '🚗 Mark Exit & Release Parking Slot' : 'Mark Exit'}
                  </Text>
                </TouchableOpacity>
              )}

              {item.status === 'Exited' && item.parkingId && (
                <View style={styles.releasedNote}>
                  <Text style={styles.releasedNoteText}>✅ Parking slot released</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#E8F5F5', padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A2E2E', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#7A9E9E', marginBottom: 18 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E3E3E3' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A7A7A', marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '700', color: '#1A2E2E', marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: '#E8F5F5', borderWidth: 1, borderColor: '#D6D6D6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, color: '#1A2E2E', marginBottom: 12 },
  inputPrefilled: { borderColor: '#1A7A7A', borderWidth: 1.5, backgroundColor: '#E8F5F0' },
  prefillBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#CCFBF1', borderRadius: 10, padding: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: '#1A7A7A', gap: 10 },
  prefillTitle: { fontSize: 13, fontWeight: '800', color: '#1A7A7A' },
  prefillSub: { fontSize: 11, color: '#3D6E6E', marginTop: 2 },
  primaryBtn: { backgroundColor: '#1A7A7A', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  logCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E3E3E3' },
  logCardParking: { borderColor: '#1565C0', borderWidth: 1.5, borderLeftWidth: 4, borderLeftColor: '#1565C0' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  vehicleNo: { fontSize: 18, fontWeight: '800', color: '#1A7A7A' },
  parkingBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  parkingBadgeText: { fontSize: 10, fontWeight: '800', color: '#1565C0' },
  statusBadge: { fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, overflow: 'hidden' },
  enteredBadge: { backgroundColor: '#DCFCE7', color: '#2E7D32' },
  exitedBadge: { backgroundColor: '#FDECEC', color: '#C62828' },
  logText: { fontSize: 14, color: '#444', marginBottom: 4 },
  exitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  exitTimeActual: { fontSize: 14, color: '#C62828', fontWeight: '700' },
  exitTimePending: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic' },
  secondaryBtn: { marginTop: 12, borderWidth: 1, borderColor: '#1A7A7A', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  secondaryBtnParking: { borderColor: '#1565C0', backgroundColor: '#EFF6FF' },
  secondaryBtnText: { color: '#1A7A7A', fontSize: 14, fontWeight: '700' },
  secondaryBtnTextParking: { color: '#1565C0' },
  releasedNote: { marginTop: 8, backgroundColor: '#DCFCE7', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  releasedNoteText: { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E3E3E3', alignItems: 'center' },
  emptyText: { color: '#7A9E9E', fontSize: 15 },
});

const _s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8F5F5' },
  hdr: { backgroundColor: '#0D6E6E', paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  bk: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  bkTxt: { fontSize: 26, color: '#FFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
  hdTtl: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  hdSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
});
