/**
 * RootNavigator.js
 *
 * Simple routing — only two states:
 *   isLoggedIn=false → AuthNavigator
 *     (Login → Register → Verification → WaitingApproval all live here)
 *   isLoggedIn=true  → RoleNavigator (Dashboard)
 *     (Only approved users ever reach isLoggedIn=true)
 *
 * loginUser() in AuthStore only sets isLoggedIn=true for approved users.
 * All other status routing (not_submitted, pending, rejected) is handled
 * inside LoginScreen using navigation.navigate() within AuthNavigator.
 *
 * GlobalAIProvider wraps the NavigationContainer so the floating AI button
 * and chat modal appear on EVERY screen for EVERY role after login.
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { useAuthStore }    from '../store/AuthStore';
import AuthNavigator       from './AuthNavigator';
import AdminNavigator      from './AdminNavigator';
import ResidentNavigator   from './ResidentNavigator';
import VendorNavigator     from './VendorNavigator';
import GuardNavigator      from './GuardNavigator';
import SuperAdminNavigator from './SuperAdminNavigator';
import BuilderNavigator    from './BuilderNavigator';
import CustomerNavigator   from './CustomerNavigator';

// Global AI floating button + chat modal (works across all roles & screens)
import { GlobalAIProvider } from '../components/ai/GlobalAIButton';

function RoleNavigator({ role }) {
  switch (role) {
    case 'admin':      return <AdminNavigator />;
    case 'resident':   return <ResidentNavigator />;
    case 'vendor':     return <VendorNavigator />;
    case 'security':   return <GuardNavigator />;
    case 'superadmin': return <SuperAdminNavigator />;
    case 'builder':    return <BuilderNavigator />;
    case 'customer':   return <CustomerNavigator />;
    default:           return <AuthNavigator />;
  }
}

export default function RootNavigator() {
  const user       = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const role       = useAuthStore((s) => s.role);

  // Zustand persist hydration delay guard — prevents white screen
  if (isLoggedIn && !role) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5F5' }}>
        <ActivityIndicator size="large" color="#1A7A7A" />
      </View>
    );
  }

  return (
    <GlobalAIProvider>
      <NavigationContainer>
        {!isLoggedIn
          ? <AuthNavigator />
          : <RoleNavigator role={role} />
        }
      </NavigationContainer>
    </GlobalAIProvider>
  );
}
