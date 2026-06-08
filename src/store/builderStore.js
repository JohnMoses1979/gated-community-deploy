



/**
 * BuilderStore.js — Builder-specific Zustand store
 *
 * Owns:
 *   - dashboardStats       (from /builder/dashboard)
 *   - projects             (from /builder/projects)
 *   - visitRequests        (local state + site-visits API)
 *   - flatBookingRequests  (local state + bookings API)
 *   - builderNotifications (local state)
 *
 * ALL mutations go through builderApi.js → requestJson → JWT Bearer.
 * Identity is NEVER sent in request body — always resolved from JWT on server.
 *
 * Screens that previously used SocietyContext for builder data now use this
 * store directly. SocietyContext is NOT imported here.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TO:
import {
  fetchBuilderDashboard,
  fetchBuilderProjects,
  createBuilderProject,
  fetchProjectComplianceDocuments,
  updateProjectComplianceDocuments,
  createTower,
  createUnit,
  fetchBuilderProjectTowers,
  fetchBuilderTowerUnits,
  updateBuilderUnit,
  deleteBuilderUnit,
  fetchProjectVisits,
  updateSiteVisitStatus,
  fetchBookingsForUnit,
  updateBookingStatus,
  fetchBuilderBookings,
  completeBookingPayment,
  fetchAllBuilderVisits,        // ADD
  fetchBookingInstallments,   // ADD
  markPossessionStatus,
} from '../api/builderApi';
import { useAuthStore } from './AuthStore';

const now = () => new Date().toISOString();
const uid = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const normalizeVisitStatus = (status) => {
  const backendStatus = String(status || 'REQUESTED').toUpperCase();
  return {
    REQUESTED: 'Pending',
    PENDING: 'Pending',
    CONFIRMED: 'Approved',
    APPROVED: 'Approved',
    COMPLETED: 'Completed',
    CANCELLED: 'Rejected',
    REJECTED: 'Rejected',
  }[backendStatus] || 'Pending';
};

const normalizeBookingStatus = (status) => {
  const backendStatus = String(status || 'PENDING').toUpperCase();
  return {
    PENDING: 'Pending Approval',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Rejected',
  }[backendStatus] || 'Pending Approval';
};

const parseBookingDocuments = (booking) => {
  if (Array.isArray(booking?.documents)) return booking.documents;
  if (!booking?.kycDocumentsJson) return [];
  try {
    const parsed = JSON.parse(booking.kycDocumentsJson);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.documents)) return parsed.documents;
    if (Array.isArray(parsed?.files)) return parsed.files;
    return [];
  } catch (err) {
    return [];
  }
};

const toDisplayStatus = (status) => {
  const normalised = String(status || 'AVAILABLE').toUpperCase();
  return {
    AVAILABLE: 'Available',
    HOLD: 'Hold',
    BOOKED: 'Booked',
    SOLD: 'Sold',
  }[normalised] || normalised.charAt(0) + normalised.slice(1).toLowerCase();
};

const toBackendUnitPayload = (payload = {}) => ({
  flatNo: payload.flatNo || payload.unitNumber || payload.unitNo || '',
  unitNumber: payload.unitNumber || payload.flatNo || payload.unitNo || '',
  floor: payload.floor || '',
  facing: payload.facing || payload.direction || '',
  unitType: payload.unitType || payload.type || '',
  bhkType: payload.bhkType || payload.configuration || '',
  superBuiltupArea: payload.superBuiltupArea || payload.superBuiltUpArea || '',
  carpetArea: payload.carpetArea || '',
  price: payload.price || payload.unitPrice || '',
  sqFt: payload.sqFt === '' || payload.sqFt == null ? null : Number(payload.sqFt),
  pricing: payload.pricing || null,
  floorPlanUrl: payload.floorPlanUrl || '',
  description: payload.description || '',
  unitImage: payload.unitImage || payload.image || '',
});

const parseComplianceDocuments = (project = {}) => {
  if (Array.isArray(project.complianceDocuments)) return project.complianceDocuments;
  if (!project.complianceDocumentsJson) return [];
  try {
    const parsed = JSON.parse(project.complianceDocumentsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useBuilderStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────────────────────
      dashboardStats: {
        totalProjects: 0,
        totalTowers: 0,
        totalUnits: 0,
        projects: [],
      },
      projects: [],
      visitRequests: [],
      flatBookingRequests: [],
      builderNotifications: [],
      isLoading: false,
      error: null,

      // ── Dashboard ────────────────────────────────────────────────────────────
      hydrateProjectGraph: async (rawProjects, token) => {
        const projects = Array.isArray(rawProjects) ? rawProjects : [];
        const hydrated = [];

        for (const project of projects) {
          const towerResp = await fetchBuilderProjectTowers(token, project.id);
          const towers = towerResp.response && towerResp.response.ok && Array.isArray(towerResp.data)
            ? towerResp.data
            : [];
          const hydratedTowers = [];
          const flatUnits = [];

          for (const tower of towers) {
            const unitResp = await fetchBuilderTowerUnits(token, tower.id);
            const units = unitResp.response && unitResp.response.ok && Array.isArray(unitResp.data)
              ? unitResp.data.map((unit) => ({
                ...unit,
                tower: tower.name,
                towerId: tower.id,
                projectId: project.id,
                projectName: project.name || project.projectName,
                unitNo: unit.flatNo || unit.unitNumber,
                unitNumber: unit.unitNumber || unit.flatNo,
                type: unit.unitType || unit.bhkType,
                status: toDisplayStatus(unit.status),
                _backendStatus: unit.status,
              }))
              : [];
            hydratedTowers.push({ ...tower, units });
            flatUnits.push(...units);
          }

          hydrated.push({
            ...project,
            projectName: project.projectName || project.name,
            approvalStatus: project.approvalStatus || 'Pending',
            complianceDocuments: parseComplianceDocuments(project),
            towers: hydratedTowers,
            units: flatUnits,
          });
        }

        return hydrated;
      },

      fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await fetchBuilderDashboard(token);
          if (response && response.ok) {
            const projects = await get().hydrateProjectGraph(data.projects || [], token);
            set({
              dashboardStats: { ...data, projects },
              projects,
              isLoading: false,
            });
            return { success: true, data };
          }
          set({ error: data?.message || 'Failed to fetch dashboard', isLoading: false });
          return { success: false, message: data?.message };
        } catch (err) {
          set({ error: 'Network error', isLoading: false });
          return { success: false, message: 'Network error' };
        }
      },

      // ── Projects ──────────────────────────────────────────────────────────────
      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await fetchBuilderProjects(token);
          if (response && response.ok) {
            const normalised = await get().hydrateProjectGraph(data, token);
            set({ projects: normalised, isLoading: false });
            return { success: true, data: normalised };
          }
          set({ error: data?.message || 'Failed to fetch projects', isLoading: false });
          return { success: false, message: data?.message };
        } catch (err) {
          set({ error: 'Network error', isLoading: false });
          return { success: false, message: 'Network error' };
        }
      },

      createProject: async (projectData) => {
        set({ isLoading: true, error: null });
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await createBuilderProject(token, projectData);
          if (response && response.ok) {
            const project = { ...data, approvalStatus: data.approvalStatus || 'Pending' };
            set((s) => ({
              projects: [project, ...s.projects],
              isLoading: false,
            }));
            // Refresh dashboard stats to update totals
            get().fetchDashboardStats();

            // Notify SuperAdmin (local demo flow)
            try {
              const useAdminStore = require('./adminStore').default;
              useAdminStore.getState().addNotification({
                title: '🆕 New Project Submitted',
                message: `${project.builderName || 'A builder'} submitted project ${project.projectName || project.name}. Review required.`,
                builderId: project.builderId || null,
                type: 'info',
                category: 'project',
                targetRole: 'superadmin',
              });
            } catch (e) { console.warn('admin notify failed', e); }

            return { success: true, data: project };
          }
          set({ error: data?.message || 'Failed to create project', isLoading: false });
          return { success: false, message: data?.message || 'Failed to create project' };
        } catch (err) {
          set({ error: 'Network error', isLoading: false });
          return { success: false, message: 'Network error' };
        }
      },

      // ── Towers ────────────────────────────────────────────────────────────────
      fetchComplianceDocuments: async (projectId) => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await fetchProjectComplianceDocuments(token, projectId);
          if (!response || !response.ok) {
            return { success: false, data: [], message: data?.message || 'Failed to fetch documents' };
          }
          const documents = parseComplianceDocuments(data);
          set((s) => ({
            projects: s.projects.map((p) =>
              String(p.id) === String(projectId)
                ? { ...p, complianceDocuments: documents, complianceDocumentsJson: JSON.stringify(documents) }
                : p
            ),
          }));
          return { success: true, data: documents };
        } catch (err) {
          return { success: false, data: [], message: 'Network error' };
        }
      },

      updateComplianceDocuments: async (projectId, documents) => {
        const nextDocuments = Array.isArray(documents) ? documents : [];
        set((s) => ({
          projects: s.projects.map((p) =>
            String(p.id) === String(projectId)
              ? {
                  ...p,
                  complianceDocuments: nextDocuments,
                  complianceDocumentsJson: JSON.stringify(nextDocuments),
                }
              : p
          ),
        }));

        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await updateProjectComplianceDocuments(token, projectId, nextDocuments);
          if (!response || !response.ok) {
            return { success: false, message: data?.message || 'Failed to save documents' };
          }
          const savedDocuments = parseComplianceDocuments(data);
          set((s) => ({
            projects: s.projects.map((p) =>
              String(p.id) === String(projectId)
                ? { ...p, ...data, projectName: data.projectName || data.name, complianceDocuments: savedDocuments }
                : p
            ),
          }));
          return { success: true, data: savedDocuments };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },

      createTower: async (projectId, towerData) => {
        set({ isLoading: true, error: null });
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await createTower(token, projectId, towerData);
          if (response && response.ok) {
            set({ isLoading: false });
            await get().fetchProjects();
            get().fetchDashboardStats();
            return { success: true, data };
          }
          set({ error: data?.message || 'Failed to create tower', isLoading: false });
          return { success: false, message: data?.message };
        } catch (err) {
          set({ error: 'Network error', isLoading: false });
          return { success: false, message: 'Network error' };
        }
      },

      // ── Units ─────────────────────────────────────────────────────────────────
      createUnit: async (towerId, unitData) => {
        set({ isLoading: true, error: null });
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await createUnit(token, towerId, unitData);
          if (response && response.ok) {
            set({ isLoading: false });
            await get().fetchProjects();
            get().fetchDashboardStats();
            return { success: true, data };
          }
          set({ error: data?.message || 'Failed to create unit', isLoading: false });
          return { success: false, message: data?.message };
        } catch (err) {
          set({ error: 'Network error', isLoading: false });
          return { success: false, message: 'Network error' };
        }
      },

      /**
       * addUnitToProject — used by UnitInventory screen.
       * Finds or creates the tower by name, then creates the unit.
       * Tower identity comes from the project structure returned by the backend.
       */
      addUnitToProject: async (projectId, payload) => {
        try {
          // Get the latest project state
          const project = get().projects.find((p) => p.id === projectId);
          if (!project) return { success: false, message: 'Project not found' };

          // Check if tower exists in the project's towers array
          let tower = (project.towers || []).find((t) => t.name === payload.tower);

          // Tower doesn't exist yet — create it
          if (!tower) {
            const tResp = await get().createTower(projectId, { name: payload.tower });
            if (!tResp.success) return tResp;
            tower = tResp.data;
          }

          // Create the unit under this tower
          const uResp = await get().createUnit(tower.id, toBackendUnitPayload(payload));
          if (uResp.success) {
            // Refresh projects to get updated tower/unit list
            await get().fetchProjects();
          }
          return uResp;
        } catch (err) {
          return { success: false, message: 'Failed to add unit to project' };
        }
      },


      updateUnitInProject: async (projectId, unitId, payload) => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await updateBuilderUnit(token, unitId, toBackendUnitPayload(payload));
          if (!response || !response.ok) {
            return { success: false, message: data?.message || 'Failed to update unit' };
          }
          await get().fetchProjects();
          return { success: true, data };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },

      deleteUnitFromProject: async (projectId, unitId) => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await deleteBuilderUnit(token, unitId);
          if (!response || !response.ok) {
            return { success: false, message: data?.message || 'Failed to delete unit' };
          }
          await get().fetchProjects();
          return { success: true, data };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },

      // ── Visit Requests ────────────────────────────────────────────────────────
      // visitRequests are fetched per-project from backend; also stored locally
      // for screens that need them without a project context.
      fetchVisitRequests: async (projectId) => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await fetchProjectVisits(token, projectId);
          if (response && response.ok) {
            set({ visitRequests: Array.isArray(data) ? data : [] });
            return { success: true, data };
          }
          return { success: false };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },

      // ADD: fetches all visits across all projects, replaces fetchVisitRequests
      // for screens that have no project context (BuilderVisitBooking screen)
      fetchAllVisitRequests: async () => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await fetchAllBuilderVisits(token);
          if (response && response.ok) {
            // Normalise backend statuses to frontend display labels
            const normalised = (Array.isArray(data) ? data : []).map((v) => ({
              ...v,
              customerName: v.customer?.name || v.customerName || 'Customer',
              customerPhone: v.customer?.phone || v.customerPhone || '',
              projectName: v.projectName || v.project?.name || '',
              unitNumber: v.unitNumber || v.unitNo || '',
              unitType: v.unitType || 'Unit',
              message: v.message || '',
              // Map backend status → frontend display status
              status: normalizeVisitStatus(v.status),
              _backendStatus: String(v.status || 'REQUESTED').toUpperCase(),
              // Map backend scheduledDate to frontend visitDate/visitTime fields
              visitDate: v.scheduledDate
                ? new Date(v.scheduledDate).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
                : '',
              visitTime: v.scheduledDate
                ? new Date(v.scheduledDate).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit', hour12: true,
                })
                : '',
            }));
            set({ visitRequests: normalised });
            return { success: true };
          }
          return { success: false };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },

      addVisitRequest: (requestData) => {
        // Local optimistic add — used when customer submits via SocietyContext/local flow
        const req = {
          id: uid('VR'),
          ...requestData,
          status: 'Pending',
          submittedAt: now(),
          reviewedAt: null,
          builderMessage: '',
        };
        set((s) => ({ visitRequests: [req, ...s.visitRequests] }));
        get().addBuilderNotification({
          type: 'visit_request',
          title: '📅 New Site Visit Request',
          body: `${requestData.customerName} wants to visit ${requestData.projectName}`,
          requestId: req.id,
          builderId: requestData.builderId,
        });
        return req;
      },

      // REPLACE the existing approveVisitRequest:
      approveVisitRequest: async (requestId, builderMessage = 'Your slot booking is approved.') => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await updateSiteVisitStatus(token, requestId, 'CONFIRMED');
          if (!response || !response.ok) {
            return { success: false, message: data?.message || 'Approval failed' };
          }
          await get().fetchAllVisitRequests();
          return { success: true };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },

      // REPLACE the existing rejectVisitRequest:
      rejectVisitRequest: async (requestId, builderMessage = 'Your slot booking was rejected.') => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await updateSiteVisitStatus(token, requestId, 'CANCELLED');
          if (!response || !response.ok) {
            return { success: false, message: data?.message || 'Rejection failed' };
          }
          await get().fetchAllVisitRequests();
          return { success: true };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },

      // ── Flat Booking Requests ─────────────────────────────────────────────────
      completeVisitRequest: async (requestId) => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await updateSiteVisitStatus(token, requestId, 'COMPLETED');
          if (!response || !response.ok) {
            return { success: false, message: data?.message || 'Completion failed' };
          }
          await get().fetchAllVisitRequests();
          return { success: true, data };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },

      addFlatBookingRequest: (requestData) => {
        const booking = {
          id: uid('FBR'),
          ...requestData,
          status: 'Pending Approval',
          submittedAt: now(),
          reviewedAt: null,
          builderMessage: '',
          documentsVerified: false,
          paidAmount: 0,
          paymentHistory: [],
        };
        set((s) => ({ flatBookingRequests: [booking, ...s.flatBookingRequests] }));
        get().addBuilderNotification({
          type: 'booking_request',
          title: '🏠 New Flat Booking Request',
          body: `${requestData.customerName || requestData.guestName} wants to book ${requestData.unitNumber || 'a unit'} in ${requestData.projectName}`,
          requestId: booking.id,
          builderId: requestData.builderId,
        });
        return booking;
      },

      // REPLACE: no longer silently swallows errors
      approveFlatBookingRequest: async (requestId, builderMessage = 'Your flat booking is approved.') => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await updateBookingStatus(token, requestId, 'APPROVED');
          if (!response || !response.ok) {
            return { success: false, message: data?.message || 'Approval failed' };
          }
          // Refresh from backend to get authoritative state
          await get().fetchFlatBookings();
          return { success: true };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },


      // ADD: fetches real bookings from backend into flatBookingRequests
      fetchFlatBookings: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await fetchBuilderBookings(token);
          if (response && response.ok) {
            // Normalise backend booking shape to match what BookingCard expects
            const normalised = (Array.isArray(data) ? data : []).map((b) => ({
              ...b,
              // map backend field names to frontend field names
              guestName: b.customerName || b.customer?.name || 'Customer',
              customerName: b.customerName || b.customer?.name || 'Customer',
              unitNo: b.flatNo || b.unit?.unitNumber || b.unit?.flatNo || '',
              unitNumber: b.flatNo || b.unit?.unitNumber || b.unit?.flatNo || '',
              unitType: b.unit?.unitType || b.unit?.bhkType || b.unitType || 'Flat',
              projectName: b.projectName || b.unit?.projectName || '',
              phone: b.customerPhone || b.customer?.phone || '',
              documents: parseBookingDocuments(b),
              paymentStatus: b.paymentStatus || (b.unit?.status === 'SOLD' ? 'Received' : 'Pending'),
              // backend status → frontend display status
              status: normalizeBookingStatus(b.status),
              _backendStatus: String(b.status || 'PENDING').toUpperCase(), // preserve for API calls
            }));
            set({ flatBookingRequests: normalised, isLoading: false });
            return { success: true };
          }
          set({ isLoading: false, error: data?.message || 'Failed to fetch bookings' });
          return { success: false };
        } catch (err) {
          set({ isLoading: false, error: 'Network error' });
          return { success: false };
        }
      },

      // REPLACE: no longer silently swallows errors
      rejectFlatBookingRequest: async (requestId, builderMessage = 'Your flat booking was rejected.') => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await updateBookingStatus(token, requestId, 'REJECTED');
          if (!response || !response.ok) {
            return { success: false, message: data?.message || 'Rejection failed' };
          }
          await get().fetchFlatBookings();
          return { success: true };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },

      // ADD: triggers BOOKED → SOLD transition
      completePayment: async (requestId) => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await completeBookingPayment(token, requestId);
          if (!response || !response.ok) {
            return { success: false, message: data?.message || 'Payment completion failed' };
          }
          await get().fetchFlatBookings();
          return { success: true };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },

      // ADD: fetches backend installments for a specific booking
      // Used by BuilderPaymentSchedule to get authoritative paid amounts
      fetchInstallmentsForBooking: async (bookingId) => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await fetchBookingInstallments(token, bookingId);
          if (response && response.ok) {
            return { success: true, data: Array.isArray(data) ? data : [] };
          }
          return { success: false, data: [] };
        } catch (err) {
          return { success: false, data: [] };
        }
      },

      // ADD: triggers softPossessionStatus on backend and refreshes bookings
      updatePossessionStatus: async (bookingId, status, letterUrl = '') => {
        try {
          const token = useAuthStore.getState().token;
          const { response, data } = await markPossessionStatus(token, bookingId, status, letterUrl);
          if (!response || !response.ok) {
            return { success: false, message: data?.message || 'Possession update failed' };
          }
          await get().fetchFlatBookings();
          return { success: true };
        } catch (err) {
          return { success: false, message: 'Network error' };
        }
      },

      verifyFlatBookingDocuments: (requestId) => {
        set((s) => ({
          flatBookingRequests: s.flatBookingRequests.map((b) =>
            b.id === requestId
              ? { ...b, documentStatus: 'Verified', documentsVerified: true }
              : b
          ),
        }));
      },

      markFlatBookingPaymentReceived: (requestId) => {
        set((s) => ({
          flatBookingRequests: s.flatBookingRequests.map((b) =>
            b.id === requestId
              ? { ...b, paymentStatus: 'Received', paymentReceivedAt: now() }
              : b
          ),
        }));
      },

      addCustomerPayment: (bookingId, amount, method = 'UPI') => {
        set((s) => ({
          flatBookingRequests: s.flatBookingRequests.map((b) => {
            if (b.id !== bookingId) return b;
            const newPaid = Number(b.paidAmount || 0) + Number(amount);
            const totalAmount = get().getBookingTotalAmount(b);
            return {
              ...b,
              paidAmount: newPaid,
              paymentHistory: [
                ...(b.paymentHistory || []),
                { amount, method, paidAt: now(), id: uid('PMT') },
              ],
              status: newPaid >= totalAmount ? 'Fully Paid' : b.status,
            };
          }),
        }));
      },

      // ── Payment Helpers ───────────────────────────────────────────────────────
      getBookingTotalAmount: (booking) => {
        if (!booking) return 0;
        if (booking.totalAmount) return Number(booking.totalAmount);
        const priceStr = String(
          booking.unitPrice || booking.price || booking.bookingAmount || '0'
        ).replace(/[₹,]/g, '');
        const base = parseFloat(priceStr) || 0;
        if (priceStr.toLowerCase().includes('cr')) return base * 10000000;
        if (priceStr.toLowerCase().includes('l')) return base * 100000;
        return base;
      },

      getPaymentPercentage: (booking) => {
        if (!booking) return 0;
        const total = get().getBookingTotalAmount(booking);
        if (!total) return 0;
        return Math.min(
          100,
          Math.round((Number(booking.paidAmount || 0) / total) * 100)
        );
      },

      // ── Notifications ─────────────────────────────────────────────────────────
      notifications: [], // alias for BuilderNotificationScreen

      addBuilderNotification: (notif) => {
        const n = { id: uid('BNOTIF'), ...notif, read: false, createdAt: now() };
        set((s) => ({
          builderNotifications: [n, ...s.builderNotifications],
          notifications: [n, ...s.notifications],
        }));
      },

      setNotifications: (updater) => {
        set((s) => {
          const next =
            typeof updater === 'function' ? updater(s.notifications) : updater;
          return { notifications: next, builderNotifications: next };
        });
      },

      markBuilderNotificationRead: (notifId) =>
        set((s) => ({
          builderNotifications: s.builderNotifications.map((n) =>
            n.id === notifId ? { ...n, read: true } : n
          ),
          notifications: s.notifications.map((n) =>
            n.id === notifId ? { ...n, read: true } : n
          ),
        })),

      getUnreadNotificationCount: (builderId) => {
        const notifs = get().builderNotifications;
        if (!builderId) return notifs.filter((n) => !n.read).length;
        return notifs.filter(
          (n) => !n.read && (!n.builderId || n.builderId === builderId)
        ).length;
      },

      // ── Compatibility aliases for screens that use old builderStore shape ─────
      builderProjects: [], // kept for SocietyContext-based screens
      addBuilderProject: (projectData) => get().createProject(projectData),
      addProjectRequest: (projectData) => get().createProject(projectData),
      updateBuilderProject: (projectId, updates) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, ...updates } : p
          ),
        })),
    }),

    {
      name: 'bs-builder-store-v2',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState) => ({
        ...persistedState,
        notifications: persistedState.notifications || persistedState.builderNotifications || [],
        builderNotifications: persistedState.builderNotifications || [],
        visitRequests: persistedState.visitRequests || [],
        flatBookingRequests: persistedState.flatBookingRequests || [],
        projects: persistedState.projects || [],
        dashboardStats: persistedState.dashboardStats || {
          totalProjects: 0, totalTowers: 0, totalUnits: 0, projects: [],
        },
      }),
    }
  )
);

export default useBuilderStore;
