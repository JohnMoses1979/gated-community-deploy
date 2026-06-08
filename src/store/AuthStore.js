/**
 * AuthStore.js
 *
 * NEW WORKFLOW:
 * 1. registerUser() → saves user, auto-logs in (isLoggedIn=true), verificationStatus='not_submitted'
 *    → goes straight to role dashboard
 * 2. loginUser() (returning user):
 *    - not_submitted / pending → returns status, LoginScreen shows WaitingApproval
 *    - approved               → isLoggedIn=true → dashboard
 *    - any credentials work (demo — backend later)
 * 3. Inside dashboard, Profile > Verify → VerificationScreen → submitVerification → pending
 * 4. Admin/SuperAdmin approves → verificationStatus='approved' → all tabs unlock
 * 5. Demo login() → always straight to dashboard (bypasses all checks)
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestJson } from '../services/apiClient';

export const DEMO_PENDING_USERS = [
  { id: 'demo-res-001', name: 'Priya Sharma', phone: '9876500001', password: 'pass123', role: 'resident', flat: 'B-204', block: 'B', status: 'active', approvalStatus: 'not_submitted', verificationStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'demo-ven-001', name: 'Raju Electricals', phone: '9876500002', password: 'pass123', role: 'vendor', vendorType: 'business', businessName: 'Raju Electricals', status: 'active', approvalStatus: 'not_submitted', verificationStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'demo-ven-002', name: 'Fresh Mart Store', phone: '9876500006', password: 'pass123', role: 'vendor', vendorType: 'marketplace', businessName: 'Fresh Mart Store', status: 'active', approvalStatus: 'not_submitted', verificationStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: 'demo-sec-001', name: 'Mohan Singh', phone: '9876500003', password: 'pass123', role: 'security', gate: 'Main Gate', status: 'active', approvalStatus: 'not_submitted', verificationStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'demo-adm-001', name: 'Kavita Reddy', phone: '9876500004', password: 'pass123', role: 'admin', status: 'active', approvalStatus: 'not_submitted', verificationStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'demo-bld-001', name: 'Suresh Constructions', phone: '9876500005', password: 'pass123', role: 'builder', company: 'Suresh Constructions Pvt Ltd', status: 'active', approvalStatus: 'not_submitted', verificationStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
];

// Demo seed users — always approved, always go straight to dashboard
const SEED_USERS = {
  resident: { id: 'res1', name: 'John Resident', phone: '9876543210', role: 'resident', approvalStatus: 'approved', verificationStatus: 'approved', token: 'token-resident-demo' },
  admin: { id: 'admin1', name: 'Admin User', phone: '9000000001', role: 'admin', approvalStatus: 'approved', verificationStatus: 'approved', token: 'token-admin-demo' },
  superadmin: { id: 'superadmin1', name: 'Super Admin', phone: '9000000000', role: 'superadmin', approvalStatus: 'approved', verificationStatus: 'approved', token: 'token-superadmin-demo' },
  vendor: { id: 'ven1', name: 'Bob Vendor', phone: '8765432100', role: 'vendor', approvalStatus: 'approved', verificationStatus: 'approved', token: 'token-vendor-demo', company: 'Fix-It Pro' },
  security: { id: 'sec1', name: 'Sam Security', phone: '7654321000', role: 'security', approvalStatus: 'approved', verificationStatus: 'approved', token: 'token-security-demo' },
  builder: { id: 'bld1', name: 'Builder Corp', phone: '9988776655', role: 'builder', approvalStatus: 'approved', verificationStatus: 'approved', token: null },
  customer: { id: 'cust1', name: 'Demo Customer', phone: '9000001111', role: 'customer', approvalStatus: 'approved', verificationStatus: 'approved', verified: true, token: 'token-customer-demo' },
};

// ─── Backend API Connection ──────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      approvalStatus: null,
      isLoggedIn: false,
      builderRegistration: null,
      registeredUsers: DEMO_PENDING_USERS,
      superAdminPending: [],
      pendingProjects: [],
      vendorType: null,

      setVendorType: (type) => set({ vendorType: type }),

      // Demo login (bypasses all checks)
      login: (role) => {
        const seed = SEED_USERS[role] || SEED_USERS.resident;
        set({
          user: seed,
          token: seed.token,
          role: seed.role,
          approvalStatus: seed.approvalStatus,
          isLoggedIn: true,
        });
      },

      // ── Twilio OTP Methods ──────────────────────────────────────────────
      sendOtp: async (phoneNumber) => {
        try {
          const { response, data } = await requestJson('/otp/send', {
            method: 'POST',
            body: { phoneNumber },
          });
          return { success: response.ok, status: data.status };
        } catch (error) {
          return { success: false, message: 'Network error. check backend' };
        }
      },

      verifyOtp: async (phoneNumber, otp) => {
        try {
          const { data } = await requestJson('/otp/verify', {
            method: 'POST',
            body: { phoneNumber, otp },
          });
          return { success: data.verified, message: data.message };
        } catch (error) {
          return { success: false, message: 'Network error. check backend' };
        }
      },

      // ── Register — saves user AND auto-logs in → goes to dashboard ────────
      registerUser: async (userData) => {
        try {
          const { response, data } = await requestJson('/auth/register', {
            method: 'POST',
            body: userData,
          });
          if (!response.ok) return { success: false, message: data.message || 'Registration failed' };

          const needsSuperAdminApproval = ['admin', 'builder'].includes(data.role);

          set({
            user: data,
            token: data.token,
            role: data.role,
            approvalStatus: data.approvalStatus,
            isLoggedIn: true, // Always enter dashboard; restricted tabs handle locked state
          });

          // 🔔 Notify Administrative Roles
          try {
            if (!needsSuperAdminApproval) {
              const useAdminStore = require('./adminStore').default;
              useAdminStore.getState().addNotification({
                type: 'user_registration',
                title: '🆕 New Registration',
                body: `${data.name} (${data.role}) registered. Review required.`,
                userId: data.id,
              });
            }
          } catch (e) { console.log('Notify error', e); }

          if (needsSuperAdminApproval) {
            return { success: true, message: 'Registration successful. Waiting for SuperAdmin approval.', user: data };
          }
          return { success: true, user: data };
        } catch (error) {
          return { success: false, message: 'Network error. Please check your backend.' };
        }
      },

      // ── Normal login (returning user) ─────────────────────────────────────
      loginUser: async (phone, password, role) => {
        try {
          const { response, data } = await requestJson('/auth/login', {
            method: 'POST',
            body: { phone, password, role },
          });
          if (!response.ok) return { success: false, status: 'error', message: data.message };

          const vs = data.verificationStatus || 'not_submitted';

          if (vs === 'approved') {
            set({
              user: data,
              token: data.token,
              role: data.role,
              approvalStatus: data.approvalStatus,
              isLoggedIn: true,
            });
          }

          return { success: true, verificationStatus: vs, user: data };
        } catch (error) {
          return { success: false, message: 'Network error. Please check your backend.' };
        }
      },

      // Called from VerificationScreen inside dashboard Profile
      submitVerification: async (userId, docs) => {
        const uid = userId || get().user?.id;
        if (!uid) return;
        try {
          const { response, data } = await requestJson(`/auth/submit-docs/${uid}`, {
            method: 'POST',
            token: get().token,
            body: { documents: JSON.stringify(docs) },
          });
          if (response.ok) {
            set(s => ({
              user: (s.user?.id === uid) ? data : s.user,
              registeredUsers: s.registeredUsers.map(u => u.id === uid ? data : u),
            }));

            // 🔔 Notify Administrative Roles
            try {
              const useAdminStore = require('./adminStore').default;
              useAdminStore.getState().addNotification({
                type: 'document_submission',
                title: '📄 KYC Documents Submitted',
                body: `${get().user?.name} submitted documents. Review required by Admin/Builder/SuperAdmin.`,
                userId: userId,
              });
            } catch (e) { console.log('Admin notify error', e); }
          }
        } catch (error) {
          console.error('Submit docs error:', error);
        }
      },

      // Called from Admin / SuperAdmin approval screens
      approveVerification: async (userId, approve = true) => {
        try {
          const { response, data } = await requestJson(`/admin/approve/${userId}`, {
            method: 'PUT',
            token: get().token,
            body: { approve },
          });
          if (!response.ok) {
            return {
              success: false,
              message: data?.message || 'Unable to update verification status.',
              status: response.status,
            };
          }

          set(s => ({
            registeredUsers: (s.registeredUsers || []).map(u => u.id === userId ? data : u),
            superAdminPending: (s.superAdminPending || []).filter(u => u.id !== userId),
            ...(s.user?.id === userId ? { user: data, approvalStatus: data.approvalStatus } : {}),
          }));
          return { success: true, data };
        } catch (error) {
          console.error('Approve verification error:', error);
          return { success: false, message: 'Network error. Please check your backend.' };
        }
      },

      // Add inside the store definition, after approveVerification:

      fetchPendingProjects: async () => {
        try {
          const { response, data } = await requestJson('/admin/projects?status=Pending', {
            token: get().token,
          });
          if (response && response.ok) {
            set({ pendingProjects: Array.isArray(data) ? data : [] });
            return Array.isArray(data) ? data : [];
          }
          return [];
        } catch (error) {
          console.error('Fetch pending projects error:', error);
          return [];
        }
      },

      fetchAdminProjects: async (status) => {
        try {
          const suffix = status ? `?status=${encodeURIComponent(status)}` : '';
          const { response, data } = await requestJson(`/admin/projects${suffix}`, {
            token: get().token,
          });
          if (response && response.ok) {
            const projects = Array.isArray(data) ? data : [];
            if (!status || status === 'Pending') {
              set({
                pendingProjects: projects.filter(
                  (project) => project?.approvalStatus === 'Pending'
                ),
              });
            }
            return projects;
          }
          return [];
        } catch (error) {
          console.error('Fetch admin projects error:', error);
          return [];
        }
      },

      approveProject: async (projectId, approve = true, reviewMessage = '') => {
        try {
          const { response, data } = await requestJson(
            `/admin/projects/${projectId}/approve`,
            {
              method: 'PUT',
              token: get().token,
              body: { approve, reviewMessage },
            }
          );
          if (!response || !response.ok) {
            return { success: false, message: data?.message || 'Failed to update project' };
          }
          // Refresh builder projects and pending lists to keep UI in sync
          try {
            const builderStore = require('./builderStore').default;
            builderStore.getState().fetchProjects && builderStore.getState().fetchProjects();
          } catch (e) { console.warn('builderStore refresh failed', e); }

          try { await get().fetchPendingProjects(); } catch (e) { console.warn('fetchPendingProjects failed', e); }

          return { success: true, data };
        } catch (error) {
          console.error('Approve project error:', error);
          return { success: false, message: 'Network error' };
        }
      },

      // Refresh pending users from backend
      fetchSuperAdminPending: async () => {
        try {
          const { data } = await requestJson('/admin/superadmin/pending', { token: get().token });
          set({ superAdminPending: Array.isArray(data) ? data : [] });
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Fetch superadmin pending error:', error);
          set({ superAdminPending: [] });
          return [];
        }
      },
      fetchPendingUsers: async () => {
        try {
          const { response, data } = await requestJson('/admin/users', { token: get().token });
          if (response.ok) {
            set({ registeredUsers: data });
          }
        } catch (error) {
          console.error('Fetch pending users error:', error);
        }
      },

      logout: async () => {
        try {
          await AsyncStorage.removeItem('auth-storage');
          await AsyncStorage.removeItem('auth-store');
          await AsyncStorage.removeItem('auth');
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem('auth-storage');
            window.localStorage.removeItem('auth-store');
            window.localStorage.removeItem('auth');
          }
        } catch (error) {
          console.log('Logout storage clear error', error);
        }

        set({
          user: null,
          token: null,
          role: null,
          approvalStatus: null,
          isLoggedIn: false,
          vendorType: null,
          builderRegistration: null,
        });
      },

      setBuilderRegistration: (email, reqId) => set({ builderRegistration: { email, reqId } }),
      clearBuilderRegistration: () => set({ builderRegistration: null }),

      loginAsCustomer: (customerData) =>
        set({
          user: { ...customerData, role: 'customer', approvalStatus: 'approved', verificationStatus: 'approved' },
          token: customerData.token ?? `token-cust-${Date.now()}`,
          role: 'customer', approvalStatus: 'approved', isLoggedIn: true,
        }),

      authenticateCustomerProfile: async (customerData) => {
        const phone = String(customerData?.phone || '').trim();
        const name = String(customerData?.name || 'Property Buyer').trim();
        const password = `customer-${phone}`;

        if (!phone) {
          get().loginAsCustomer(customerData);
          return { success: false, message: 'Missing customer phone.' };
        }

        try {
          // STEP 1: Try customer-session endpoint first
          const sessionResult = await requestJson('/auth/customer-session', {
            method: 'POST',
            body: { name, phone },
          });

          if (sessionResult.response && sessionResult.response.ok) {
            const data = sessionResult.data;
            set({
              user: { ...customerData, ...data, role: 'customer', approvalStatus: 'approved', verificationStatus: 'approved' },
              token: data.token,
              role: 'customer',
              approvalStatus: 'approved',
              isLoggedIn: true,
            });
            return { success: true, data };
          }

          // STEP 2: Try login (handles existing users)
          const loginResult = await requestJson('/auth/login', {
            method: 'POST',
            body: { phone, password, role: 'customer' },
          });

          if (loginResult.response && loginResult.response.ok) {
            const data = loginResult.data;
            set({
              user: { ...customerData, ...data, role: 'customer', approvalStatus: 'approved', verificationStatus: 'approved' },
              token: data.token,
              role: 'customer',
              approvalStatus: 'approved',
              isLoggedIn: true,
            });
            return { success: true, data };
          }

          // STEP 3: Try register (new users only)
          const registerResult = await requestJson('/auth/register', {
            method: 'POST',
            body: { name, phone, password, role: 'customer' },
          });

          if (registerResult.response && registerResult.response.ok) {
            const data = registerResult.data;
            set({
              user: { ...customerData, ...data, role: 'customer', approvalStatus: 'approved', verificationStatus: 'approved' },
              token: data.token,
              role: 'customer',
              approvalStatus: 'approved',
              isLoggedIn: true,
            });
            return { success: true, data };
          }

          // STEP 4: Register failed with "already exists" → try login again
          // This handles the race condition where session+login both fail
          // but register also fails because user exists
          const registerMsg = String(registerResult.data?.message || '').toLowerCase();
          if (registerMsg.includes('already exists') || registerMsg.includes('duplicate')) {
            // Retry login — user exists but login failed earlier, try once more
            const retryLogin = await requestJson('/auth/login', {
              method: 'POST',
              body: { phone, password, role: 'customer' },
            });

            if (retryLogin.response && retryLogin.response.ok) {
              const data = retryLogin.data;
              set({
                user: { ...customerData, ...data, role: 'customer', approvalStatus: 'approved', verificationStatus: 'approved' },
                token: data.token,
                role: 'customer',
                approvalStatus: 'approved',
                isLoggedIn: true,
              });
              return { success: true, data };
            }

            // Login retry also failed — wrong password stored in backend?
            // Force re-register with timestamp to create fresh account
            const freshPassword = `customer-${phone}`;
            const forceLogin = await requestJson('/auth/login', {
              method: 'POST',
              body: { phone, password: freshPassword, role: 'customer' },
            });

            if (forceLogin.response && forceLogin.response.ok) {
              const data = forceLogin.data;
              set({
                user: { ...customerData, ...data, role: 'customer', approvalStatus: 'approved', verificationStatus: 'approved' },
                token: data.token,
                role: 'customer',
                approvalStatus: 'approved',
                isLoggedIn: true,
              });
              return { success: true, data };
            }
          }

          // All attempts failed — fall back to local mode
          get().loginAsCustomer(customerData);
          return {
            success: false,
            message: registerResult.data?.message || loginResult.data?.message || 'Customer backend login failed.',
          };

        } catch (error) {
          get().loginAsCustomer(customerData);
          return { success: false, message: 'Network error. Customer opened in local mode.' };
        }
      },

      loginAsBuilder: (builderRequest) =>
        set({
          builderRegistration: null,
          user: {
            id: builderRequest.id, name: builderRequest.companyName,
            email: builderRequest.email, phone: builderRequest.phone,
            city: builderRequest.city, reraNumber: builderRequest.reraNumber,
            role: 'builder', approvalStatus: 'approved', verificationStatus: 'approved',
          },
          token: builderRequest.token ?? null,
          role: 'builder', approvalStatus: 'approved', isLoggedIn: true,
        }),
    }),
    {
      name: 'bs-auth-v6',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        approvalStatus: state.approvalStatus,
        isLoggedIn: state.isLoggedIn,
        builderRegistration: state.builderRegistration,
        registeredUsers: state.registeredUsers,
        pendingProjects: state.pendingProjects,
        vendorType: state.vendorType,
      }),
    }
  )
);

export default useAuthStore;
