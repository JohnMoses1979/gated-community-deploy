// import React from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';

// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import COLORS from '../../theme/SAcolors';
// import SPACING from '../../theme/spacing';
// import { useAppContext } from '../superadmin/SocietyContext';

// export default function SuperAdminNotificationsScreen({ navigation }) {
//   const { notifications, setNotifications } = useAppContext();

//   const handlePress = (item) => {
//     // mark as read
//     setNotifications((prev) =>
//       prev.map((n) =>
//         n.id === item.id ? { ...n, read: true } : n
//       )
//     );

//     // 🔥 navigation based on category
//     switch (item.category) {
//       case 'registration':
//         navigation.navigate('Builders');
//         break;

//       case 'project':
//         navigation.navigate('ProjectRequests');
//         break;

//       case 'visit':
//         navigation.navigate('VisitRequests');
//         break;

//       case 'booking':
//         navigation.navigate('FlatBookings');
//         break;

//       default:
//         break;
//     }
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={[
//         styles.card,
//         { backgroundColor: item.read ? '#F1F5F9' : COLORS.white },
//       ]}
//       onPress={() => handlePress(item)}
//     >
//       <Text style={styles.title}>{item.title}</Text>
//       <Text style={styles.message}>{item.message}</Text>
//       <Text style={styles.time}>{item.time}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title="Notifications"
//         subtitle="All system alerts"
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <FlatList
//         data={notifications}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ padding: SPACING.lg }}
//         ListEmptyComponent={
//           <Text style={{ textAlign: 'center', marginTop: 40 }}>
//             No notifications
//           </Text>
//         }
//       />
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   title: {
//     fontWeight: '800',
//     fontSize: 14,
//     color: COLORS.text,
//   },
//   message: {
//     fontSize: 12,
//     color: COLORS.subText,
//     marginTop: 4,
//   },
//   time: {
//     fontSize: 10,
//     color: '#94A3B8',
//     marginTop: 6,
//   },
// });  





















import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import COLORS from '../../theme/SAcolors';
import SPACING from '../../theme/spacing';
import { useAppContext } from '../superadmin/SocietyContext';
import { useAuthStore } from '../../store/AuthStore';
import { useFocusEffect } from '@react-navigation/native';

export default function SuperAdminNotificationsScreen({ navigation }) {
  const { notifications, setNotifications, refreshProjectRequests } = useAppContext();
  const { approveVerification } = useAuthStore();

  useFocusEffect(
    React.useCallback(() => {
      refreshProjectRequests && refreshProjectRequests();
    }, [])
  );

  const superAdminNotifications = (notifications || []).filter(
    (item) => !item.targetRole || item.targetRole === 'superadmin'
  );

  const handleApprove = async (item) => {
    if (!item.userId) {
      Alert.alert('Error', 'User ID missing in notification.');
      return;
    }
    const result = await approveVerification(item.userId, true);
    if (!result?.success) {
      Alert.alert('Approval Failed', result?.message || 'Could not approve this user.');
      return;
    }
    Alert.alert('Success', 'User approved successfully.');
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true, approved: true } : n))
    );
  };

  const handleReject = async (item) => {
    if (!item.userId) {
      Alert.alert('Error', 'User ID missing in notification.');
      return;
    }
    const result = await approveVerification(item.userId, false);
    if (!result?.success) {
      Alert.alert('Reject Failed', result?.message || 'Could not reject this user.');
      return;
    }
    Alert.alert('Success', 'User request rejected.');
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true, rejected: true } : n))
    );
  };

  const handlePress = (item) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === item.id ? { ...n, read: true } : n
      )
    );

    if (item.screen) {
      navigation.navigate(item.screen, item.screenParams || {});
      return;
    }

    switch (item.category) {
      case 'admin_registration':
        navigation.navigate('NewAdminRequest');
        break;

      case 'registration':
        navigation.navigate('Builders');
        break;

      case 'project':
        navigation.navigate('Builders');
        break;

      case 'visit':
        navigation.navigate('VisitRequests');
        break;

      case 'booking':
        navigation.navigate('FlatBookings');
        break;

      default:
        break;
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: item.read ? '#F1F5F9' : COLORS.white },
      ]}
    >
      <TouchableOpacity onPress={() => handlePress(item)}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </TouchableOpacity>

      {item.category === 'admin_registration' && !item.approved && !item.rejected && (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, styles.approveBtn]}
            onPress={() => handleApprove(item)}
          >
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.rejectBtn]}
            onPress={() => handleReject(item)}
          >
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.approved && <Text style={styles.statusLabel}>Approved ✅</Text>}
      {item.rejected && <Text style={styles.statusLabel}>Rejected ❌</Text>}
    </View>
  );

  return (
    <ScreenWrapper>
      <AppHeader
        title="Notifications"
        subtitle="All system alerts"
        showBack
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={superAdminNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: SPACING.lg }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40 }}>
            No notifications
          </Text>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontWeight: '800',
    fontSize: 14,
    color: COLORS.text,
  },
  message: {
    fontSize: 12,
    color: COLORS.subText,
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  btnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    color: '#64748B',
  },
});
