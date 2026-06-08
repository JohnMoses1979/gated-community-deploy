/**
 * GuardNavigator.js — Role: security (guard)
 * All paths point to new feature-folder structure.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleGuard from '../guards/RoleGuard';
import VerifyLockScreen from '../components/common/VerifyLockScreen';

// Dashboard
import GuardDashboard from '../screens/guard/dashboard/GuardDashboard';
// Visitors
import VisitorVerificationScreen from '../screens/guard/visitors/VisitorVerificationScreen';
import WalkInEntryScreen         from '../screens/guard/visitors/WalkInEntryScreen';
// Deliveries
import DeliveryVerificationScreen from '../screens/guard/deliveries/DeliveryVerificationScreen';
// Vehicles
import VehicleEntryScreen from '../screens/guard/vehicles/VehicleEntryScreen';
// SOS
import SOSScreen from '../screens/guard/sos/SOSScreen';
// Utilities
import VendorVerificationScreen from '../screens/guard/utilities/VendorVerificationScreen';
import BlacklistAlertScreen     from '../screens/guard/utilities/BlacklistAlertScreen';
import EntryLogsScreen          from '../screens/guard/utilities/EntryLogsScreen';
// Incidents / Shift
import SecurityIncidentScreen from '../screens/guard/incidents/SecurityIncidentScreen';
import ShiftHandoverScreen    from '../screens/guard/incidents/ShiftHandoverScreen';
import PatrolLogScreen        from '../screens/guard/incidents/PatrolLogScreen';
// Amenities
import AmenityVerificationScreen from '../screens/guard/amenities/AmenityVerificationScreen';
// Biometric
import GuardBiometricScreen from '../screens/guard/biometric/GuardBiometricScreen';
// Notifications
import GuardNotificationsScreen from '../screens/guard/notifications/GuardNotificationsScreen';
// Profile
import GuardProfileScreen from '../screens/guard/profile/GuardProfileScreen';
// Verification
import VerificationScreen from '../screens/auth/VerificationScreen';

const Stack = createNativeStackNavigator();

function withGuardApprovalLock(Component) {
  return function GuardApprovalLockedScreen(props) {
    return (
      <VerifyLockScreen navigation={props.navigation}>
        <Component {...props} />
      </VerifyLockScreen>
    );
  };
}

const LockedVisitorVerificationScreen = withGuardApprovalLock(VisitorVerificationScreen);
const LockedWalkInEntryScreen = withGuardApprovalLock(WalkInEntryScreen);
const LockedDeliveryVerificationScreen = withGuardApprovalLock(DeliveryVerificationScreen);
const LockedVehicleEntryScreen = withGuardApprovalLock(VehicleEntryScreen);
const LockedSOSScreen = withGuardApprovalLock(SOSScreen);
const LockedVendorVerificationScreen = withGuardApprovalLock(VendorVerificationScreen);
const LockedBlacklistAlertScreen = withGuardApprovalLock(BlacklistAlertScreen);
const LockedEntryLogsScreen = withGuardApprovalLock(EntryLogsScreen);
const LockedSecurityIncidentScreen = withGuardApprovalLock(SecurityIncidentScreen);
const LockedShiftHandoverScreen = withGuardApprovalLock(ShiftHandoverScreen);
const LockedPatrolLogScreen = withGuardApprovalLock(PatrolLogScreen);
const LockedAmenityVerificationScreen = withGuardApprovalLock(AmenityVerificationScreen);
const LockedGuardBiometricScreen = withGuardApprovalLock(GuardBiometricScreen);
const LockedGuardNotificationsScreen = withGuardApprovalLock(GuardNotificationsScreen);
const LockedGuardProfileScreen = withGuardApprovalLock(GuardProfileScreen);
const LockedVerificationScreen = withGuardApprovalLock(VerificationScreen);

function GuardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* Dashboard */}
      <Stack.Screen name="GuardDashboard"       component={GuardDashboard} />
      {/* Visitors */}
      <Stack.Screen name="VisitorVerification"  component={LockedVisitorVerificationScreen} />
      <Stack.Screen name="WalkInEntry"          component={LockedWalkInEntryScreen} />
      {/* Deliveries */}
      <Stack.Screen name="DeliveryVerification" component={LockedDeliveryVerificationScreen} />
      {/* Vehicles */}
      <Stack.Screen name="VehicleEntry"         component={LockedVehicleEntryScreen} />
      {/* SOS */}
      <Stack.Screen name="GuardSOS"             component={LockedSOSScreen} />
      {/* Utilities */}
      <Stack.Screen name="VendorVerification"   component={LockedVendorVerificationScreen} />
      <Stack.Screen name="BlacklistAlert"       component={LockedBlacklistAlertScreen} />
      <Stack.Screen name="EntryLogs"            component={LockedEntryLogsScreen} />
      {/* Incidents / Shift */}
      <Stack.Screen name="SecurityIncident"     component={LockedSecurityIncidentScreen} />
      <Stack.Screen name="ShiftHandover"        component={LockedShiftHandoverScreen} />
      <Stack.Screen name="PatrolLog"            component={LockedPatrolLogScreen} />
      {/* Amenities */}
      <Stack.Screen name="AmenityVerification"  component={LockedAmenityVerificationScreen} />
      {/* Biometric */}
      <Stack.Screen name="GuardBiometric"       component={LockedGuardBiometricScreen} />
      {/* Notifications */}
      <Stack.Screen name="GuardNotifications"   component={LockedGuardNotificationsScreen} />
      {/* Profile */}
      <Stack.Screen name="GuardProfile"         component={LockedGuardProfileScreen} />
      {/* Verification */}
      <Stack.Screen name="Verification"         component={LockedVerificationScreen} />
    </Stack.Navigator>
  );
}

export default function GuardNavigator() {
  return (
    <RoleGuard allowed={['security', 'guard']}>
      <GuardStack />
    </RoleGuard>
  );
}
