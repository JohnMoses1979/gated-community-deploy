
/**
 * maintenanceStore.js
 *
 * Zustand store for maintenance workflow.
 * ALL state comes from the backend — no fake local transitions.
 * Uses maintenanceApi.js for all API calls.
 * Token always comes from AuthStore.
 *
 * Pattern:
 *   - fetch* actions hit backend, update local cache
 *   - mutation actions hit backend, re-fetch or patch local cache on success
 *   - screens call useAuthStore(s => s.token) themselves OR pass token in
 */

import { create } from 'zustand';
import {
  submitMaintenanceRequest,
  getMyMaintenanceRequests,
  respondToQuote,
  approveCompletedWork,
  createMaintenancePaymentOrder,
  verifyMaintenancePayment,
  simulateMaintenancePayment,
  submitVendorRating,
  adminGetAllRequests,
  adminAssignVendor,
  adminForwardQuote,
  adminConfirmWorkStart,
  adminRequestPaymentFromResident,
  adminPayVendor,
  adminCloseRequest,
  guardGetGateRequests,
  vendorGetMyRequests,
  vendorSubmitQuote,
  vendorMarkWorkComplete,
  vendorRequestPayment,
  guardVerifyGateOTP,
} from '../services/maintenanceApi';

const STATUS_ALIASES = {
  vendor_assigned: 'assigned',
  quote_submitted: 'quoted',
  quote_forwarded: 'quote_sent_to_resident',
  gate_otp_generated: 'approved_to_start',
  work_started: 'work_in_progress',
  payment_requested: 'payment_requested_to_admin',
  payment_sent_to_resident: 'payment_requested_to_resident',
  payment_done: 'payment_received',
  paid_to_vendor: 'closed',
};

function parseTimeline(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeMaintenanceRequest(req) {
  if (!req || typeof req !== 'object') return req;

  const status = STATUS_ALIASES[req.status] || req.status;
  const quoteAmount = req.quote?.amount ?? req.quoteAmount;
  const quote = quoteAmount != null
    ? {
        amount: quoteAmount,
        description: req.quote?.description ?? req.quoteDescription,
        estimatedDays: req.quote?.estimatedDays ?? req.quoteEstimatedDays,
      }
    : req.quote;

  const ratingValue = req.vendorRating?.rating ?? req.rating;
  const vendorRating = ratingValue != null
    ? {
        rating: ratingValue,
        review: req.vendorRating?.review ?? req.review,
        tags: req.vendorRating?.tags ?? req.tags,
      }
    : req.vendorRating;

  return {
    ...req,
    status,
    quote,
    finalAmount: req.finalAmount ?? req.paymentAmount ?? quoteAmount,
    assignedVendorId: req.assignedVendorId ?? req.vendorId,
    assignedVendorName: req.assignedVendorName ?? req.vendorName,
    vendorName: req.vendorName ?? req.assignedVendorName,
    vendorGateOTP: req.vendorGateOTP ?? req.gateOtp,
    timeline: parseTimeline(req.timeline ?? req.timelineJson),
    vendorRating,
  };
}

function normalizeList(data) {
  return Array.isArray(data) ? data.map(normalizeMaintenanceRequest) : [];
}

const useMaintenanceStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  requests:     [],   // resident's own requests (or admin's all requests)
  vendorJobs:   [],   // vendor's assigned jobs
  loading:      false,
  error:        null,

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  _setLoading: (loading) => set({ loading }),
  _setError:   (error)   => set({ error }),

  // Patch a single request in local cache by id
  _patchRequest: (updated) => {
    const normalized = normalizeMaintenanceRequest(updated);
    if (!normalized?.id) return;
    set(s => ({
      requests:   s.requests.map(r   => String(r.id) === String(normalized.id) ? { ...r, ...normalized } : r),
      vendorJobs: s.vendorJobs.map(r => String(r.id) === String(normalized.id) ? { ...r, ...normalized } : r),
    }));
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // RESIDENT ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetch resident's own maintenance requests from backend.
   * @param {string} token
   */
  fetchMyRequests: async (token) => {
    set({ loading: true, error: null });
    try {
      const { response, data } = await getMyMaintenanceRequests(token);
      if (response.ok) {
        set({ requests: normalizeList(data), loading: false });
      } else {
        set({ error: data?.message || 'Failed to load requests', loading: false });
      }
    } catch (e) {
      set({ error: 'Network error', loading: false });
    }
  },

  /**
   * Submit a new maintenance request.
   * Returns the created request or throws.
   */
  submitRequest: async (token, formData) => {
    set({ loading: true, error: null });
    try {
      const { response, data } = await submitMaintenanceRequest(token, formData);
      if (!response.ok) {
        const msg = data?.message || 'Failed to submit request';
        set({ error: msg, loading: false });
        throw new Error(msg);
      }
      // Add to local cache
      const created = normalizeMaintenanceRequest(data);
      set(s => ({ requests: [created, ...s.requests], loading: false }));
      return created;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  /**
   * Resident accepts or rejects a vendor quote.
   * @param {string} action - 'accept' | 'reject'
   */
  respondToQuote: async (token, id, action) => {
    try {
      const { response, data } = await respondToQuote(token, id, action);
      if (response.ok) get()._patchRequest(data);
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  /**
   * Resident approves completed work — unlocks vendor payment request.
   */
  approveCompletedWork: async (token, id) => {
    try {
      const { response, data } = await approveCompletedWork(token, id);
      if (response.ok) get()._patchRequest(data);
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  /**
   * Create a Razorpay order for resident payment.
   * Returns { razorpayOrderId, razorpayKeyId, amount, currency }
   */
  createPaymentOrder: async (token, id) => {
    try {
      const { response, data } = await createMaintenancePaymentOrder(token, id);
      if (!response.ok) throw new Error(data?.message || 'Failed to create order');
      return data;
    } catch (e) {
      throw e;
    }
  },

  /**
   * Verify payment after Razorpay success.
   */
  verifyPayment: async (token, paymentData) => {
    try {
      const { response, data } = await verifyMaintenancePayment(token, paymentData);
      if (!response.ok) throw new Error(data?.message || 'Payment verification failed');
      get()._patchRequest(data);
      return data;
    } catch (e) {
      throw e;
    }
  },

  /**
   * Submit vendor rating after job completion.
   */
  submitRating: async (token, id, ratingData) => {
    try {
      const { response, data } = await submitVendorRating(token, id, ratingData);
      if (response.ok) get()._patchRequest(data);
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ADMIN ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Admin fetches all requests.
   */
  adminFetchAll: async (token) => {
    set({ loading: true, error: null });
    try {
      const { response, data } = await adminGetAllRequests(token);
      if (response.ok) {
        set({ requests: normalizeList(data), loading: false });
      } else {
        set({ error: data?.message || 'Failed to load', loading: false });
      }
    } catch (e) {
      set({ error: 'Network error', loading: false });
    }
  },

  /**
   * Admin assigns vendor(s) and sends quote request.
   */
  adminAssignVendor: async (token, id, vendors) => {
    try {
      const { response, data } = await adminAssignVendor(token, id, vendors);
      if (response.ok) get()._patchRequest(data);
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  /**
   * Admin forwards vendor quote to resident.
   */
  adminForwardQuote: async (token, id) => {
    try {
      const { response, data } = await adminForwardQuote(token, id);
      if (response.ok) get()._patchRequest(data);
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  /**
   * Admin confirms work start — generates gate OTP.
   */
  adminConfirmWorkStart: async (token, id) => {
    try {
      const { response, data } = await adminConfirmWorkStart(token, id);
      if (response.ok) get()._patchRequest(data);
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  /**
   * Admin requests payment from resident (after vendor payment request).
   */
  adminRequestPaymentFromResident: async (token, id) => {
    try {
      const { response, data } = await adminRequestPaymentFromResident(token, id);
      if (response.ok) get()._patchRequest(data);
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  /**
   * Admin pays vendor (closes the job).
   */
  adminPayVendor: async (token, id) => {
    try {
      const { response, data } = await adminPayVendor(token, id);
      if (response.ok) get()._patchRequest(data);
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  /**
   * Admin closes a request manually.
   */
  adminCloseRequest: async (token, id) => {
    try {
      const { response, data } = await adminCloseRequest(token, id);
      if (response.ok) get()._patchRequest(data);
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // VENDOR ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Vendor fetches their assigned jobs.
   */
  vendorFetchMyJobs: async (token) => {
    set({ loading: true, error: null });
    try {
      const { response, data } = await vendorGetMyRequests(token);
      if (response.ok) {
        set({ vendorJobs: normalizeList(data), loading: false });
      } else {
        set({ error: data?.message || 'Failed to load jobs', loading: false });
      }
    } catch (e) {
      set({ error: 'Network error', loading: false });
    }
  },

  /**
   * Vendor submits a quote.
   */
  vendorSubmitQuote: async (token, id, quoteData) => {
    try {
      const { response, data } = await vendorSubmitQuote(token, id, quoteData);
      if (response.ok) {
        get()._patchRequest(data);
      }
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  /**
   * Vendor marks work as complete.
   */
  vendorMarkWorkComplete: async (token, id) => {
    try {
      const { response, data } = await vendorMarkWorkComplete(token, id);
      if (response.ok) {
        get()._patchRequest(data);
      }
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  /**
   * Vendor requests payment from admin.
   */
  vendorRequestPayment: async (token, id) => {
    try {
      const { response, data } = await vendorRequestPayment(token, id);
      if (response.ok) {
        get()._patchRequest(data);
      }
      return { ok: response.ok, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // GUARD ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Guard verifies vendor gate OTP.
   * Returns { ok, request, reason }
   */
  guardVerifyGateOTP: async (token, otp) => {
    try {
      const { response, data } = await guardVerifyGateOTP(token, otp);
      if (response.ok && data?.request) {
        get()._patchRequest(data.request);
      }
      return { ok: response.ok, ...data, request: normalizeMaintenanceRequest(data?.request) };
    } catch (e) {
      return { ok: false, reason: 'Network error' };
    }
  },

  simulatePayment: async (token, id, paymentData) => {
    try {
      const { response, data } = await simulateMaintenancePayment(token, id, paymentData);
      if (!response.ok) throw new Error(data?.message || 'Payment failed');
      get()._patchRequest(data);
      return data;
    } catch (e) {
      throw e;
    }
  },

  fetchGateRequests: async (token) => {
    set({ loading: true, error: null });
    try {
      const { response, data } = await guardGetGateRequests(token);
      if (response.ok) {
        set({ requests: normalizeList(data), loading: false });
      } else {
        set({ error: data?.message || 'Failed to load gate requests', loading: false });
      }
    } catch (e) {
      set({ error: 'Network error', loading: false });
    }
  },

  // ─── Local helpers for optimistic UI ─────────────────────────────────────────
  clearError: () => set({ error: null }),
}));

export default useMaintenanceStore;
