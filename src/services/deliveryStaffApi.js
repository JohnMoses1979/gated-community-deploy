// /**
//  * deliveryStaffApi.js
//  *
//  * API layer for:
//  *   1. VendorDeliveryStaff CRUD  → /api/vendor/delivery-staff
//  *   2. Updated order assignment  → /api/vendor/orders/{id}/assign-delivery
//  *      Now sends { deliveryStaffId } instead of dummy partner strings
//  *
//  * Drop at: src/services/deliveryStaffApi.js
//  */

// import { useAuthStore } from '../store/AuthStore'; // adjust path if needed
// import { create } from 'zustand';

// const API_BASE_URL = 'http://13.207.106.215:8080/api'; // same as your existing api.js

// // ─── Internal fetch helper ────────────────────────────────────────────────────
// async function apiFetch(path, { method = 'GET', body } = {}) {
//   const token =
//     useAuthStore.getState().token ||
//     useAuthStore.getState().user?.token ||
//     null;

//   const headers = {
//     'Content-Type': 'application/json',
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };

//   const res = await fetch(`${API_BASE_URL}${path}`, {
//     method,
//     headers,
//     ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
//   });

//   const text = await res.text();
//   let data = null;
//   try {
//     data = text ? JSON.parse(text) : null;
//   } catch {
//     data = { message: text };
//   }

//   if (!res.ok) {
//     const msg = data?.message || data?.error || `API error ${res.status} on ${method} ${path}`;
//     const err = new Error(msg);
//     err.status = res.status;
//     err.data = data;
//     throw err;
//   }
//   return data;
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// //  DELIVERY STAFF ZUSTAND SLICE
// // ═══════════════════════════════════════════════════════════════════════════════

// export const useDeliveryStaffSlice = create((set, get) => ({
//   // ── State ──────────────────────────────────────────────────────────────────
//   staff: [],          // all helpers (active + inactive)
//   activeStaff: [],    // only active helpers — for assign dropdown
//   loading: false,
//   error: null,

//   // ── Fetch all helpers (list screen) ───────────────────────────────────────
//   fetchStaff: async () => {
//     set({ loading: true, error: null });
//     try {
//       const staff = await apiFetch('/vendor/delivery-staff');
//       set({ staff: staff || [], loading: false });
//       return staff;
//     } catch (err) {
//       set({ error: err.message, loading: false });
//       throw err;
//     }
//   },

//   // ── Fetch only active helpers (assign-delivery dropdown) ──────────────────
//   fetchActiveStaff: async () => {
//     set({ loading: true, error: null });
//     try {
//       const activeStaff = await apiFetch('/vendor/delivery-staff/active');
//       set({ activeStaff: activeStaff || [], loading: false });
//       return activeStaff;
//     } catch (err) {
//       set({ error: err.message, loading: false });
//       throw err;
//     }
//   },

//   // ── Add new helper ─────────────────────────────────────────────────────────
//   addStaff: async ({ name, phone, vehicleType }) => {
//     set({ loading: true, error: null });
//     try {
//       const newStaff = await apiFetch('/vendor/delivery-staff', {
//         method: 'POST',
//         body: { name, phone, vehicleType, active: true },
//       });
//       set(state => ({
//         staff: [newStaff, ...state.staff],
//         activeStaff: newStaff.active
//           ? [newStaff, ...state.activeStaff]
//           : state.activeStaff,
//         loading: false,
//       }));
//       return newStaff;
//     } catch (err) {
//       set({ error: err.message, loading: false });
//       throw err;
//     }
//   },

//   // ── Update helper ──────────────────────────────────────────────────────────
//   updateStaff: async (staffId, updates) => {
//     set({ loading: true, error: null });
//     try {
//       const updated = await apiFetch(`/vendor/delivery-staff/${staffId}`, {
//         method: 'PUT',
//         body: updates,
//       });
//       set(state => ({
//         staff: state.staff.map(s => s.id === staffId ? updated : s),
//         activeStaff: state.activeStaff
//           .map(s => s.id === staffId ? updated : s)
//           .filter(s => s.active),
//         loading: false,
//       }));
//       return updated;
//     } catch (err) {
//       set({ error: err.message, loading: false });
//       throw err;
//     }
//   },

//   // ── Toggle active/inactive ─────────────────────────────────────────────────
//   toggleStaff: async (staffId) => {
//     set({ loading: true, error: null });
//     try {
//       const updated = await apiFetch(`/vendor/delivery-staff/${staffId}/toggle`, {
//         method: 'PATCH',
//       });
//       set(state => ({
//         staff: state.staff.map(s => s.id === staffId ? updated : s),
//         activeStaff: updated.active
//           ? [...state.activeStaff.filter(s => s.id !== staffId), updated]
//           : state.activeStaff.filter(s => s.id !== staffId),
//         loading: false,
//       }));
//       return updated;
//     } catch (err) {
//       set({ error: err.message, loading: false });
//       throw err;
//     }
//   },

//   // ── Soft delete (deactivate) ───────────────────────────────────────────────
//   deleteStaff: async (staffId) => {
//     set({ loading: true, error: null });
//     try {
//       await apiFetch(`/vendor/delivery-staff/${staffId}`, { method: 'DELETE' });
//       set(state => ({
//         staff: state.staff.map(s =>
//           s.id === staffId ? { ...s, active: false } : s
//         ),
//         activeStaff: state.activeStaff.filter(s => s.id !== staffId),
//         loading: false,
//       }));
//     } catch (err) {
//       set({ error: err.message, loading: false });
//       throw err;
//     }
//   },

//   reset: () => set({ staff: [], activeStaff: [], loading: false, error: null }),
// }));

// // ═══════════════════════════════════════════════════════════════════════════════
// //  STANDALONE API FUNCTIONS (for use outside Zustand / in existing screens)
// // ═══════════════════════════════════════════════════════════════════════════════

// /**
//  * Fetch all delivery staff for logged-in vendor.
//  * @returns {Promise<Array>}
//  */
// export async function fetchDeliveryStaff() {
//   return apiFetch('/vendor/delivery-staff');
// }

// /**
//  * Fetch only ACTIVE delivery staff (for assign-delivery dropdown).
//  * @returns {Promise<Array>}
//  */
// export async function fetchActiveDeliveryStaff() {
//   return apiFetch('/vendor/delivery-staff/active');
// }

// /**
//  * Add a new delivery helper.
//  * @param {{ name: string, phone: string, vehicleType?: string }} data
//  * @returns {Promise<Object>}
//  */
// export async function addDeliveryStaff(data) {
//   return apiFetch('/vendor/delivery-staff', { method: 'POST', body: data });
// }

// /**
//  * Update a delivery helper.
//  * @param {number} staffId
//  * @param {{ name?: string, phone?: string, vehicleType?: string, active?: boolean }} updates
//  * @returns {Promise<Object>}
//  */
// export async function updateDeliveryStaff(staffId, updates) {
//   return apiFetch(`/vendor/delivery-staff/${staffId}`, { method: 'PUT', body: updates });
// }

// /**
//  * Toggle a helper active/inactive.
//  * @param {number} staffId
//  * @returns {Promise<Object>}
//  */
// export async function toggleDeliveryStaff(staffId) {
//   return apiFetch(`/vendor/delivery-staff/${staffId}/toggle`, { method: 'PATCH' });
// }

// /**
//  * Soft-delete (deactivate) a delivery helper.
//  * @param {number} staffId
//  * @returns {Promise<void>}
//  */
// export async function deleteDeliveryStaff(staffId) {
//   return apiFetch(`/vendor/delivery-staff/${staffId}`, { method: 'DELETE' });
// }

// /**
//  * Assign a delivery staff member to an order.
//  * Sends { deliveryStaffId } — backend validates ownership + active status.
//  *
//  * @param {number} orderId
//  * @param {number} deliveryStaffId
//  * @returns {Promise<MarketplaceOrder>}
//  */
// export async function assignDeliveryStaffToOrder(orderId, deliveryStaffId) {
//   return apiFetch(`/vendor/orders/${orderId}/assign-delivery`, {
//     method: 'PUT',
//     body: { deliveryStaffId: String(deliveryStaffId) },
//   });
// }

// /**
//  * Mark an order as out for delivery.
//  * @param {number} orderId
//  * @returns {Promise<MarketplaceOrder>}
//  */
// export async function markOrderOutForDelivery(orderId) {
//   return apiFetch(`/vendor/orders/${orderId}/out-for-delivery`, { method: 'PUT' });
// }


































/**
 * deliveryStaffApi.js — FIXED & COMPLETE
 *
 * Changes from previous version:
 *  1. fetchActiveStaff now calls GET /api/vendor/delivery-staff/active/with-status
 *     (new endpoint that also returns busy:true/false based on active orders)
 *     Falls back to /active if the new endpoint isn't deployed yet.
 *  2. assignDeliveryStaffToOrder now sends { deliveryStaffId } not dummy strings
 *  3. Zustand store updated: activeStaff entries now have a `busy` field
 *  4. assignDelivery in the vendor order slice updated to send { deliveryStaffId }
 *
 * Drop at: src/services/deliveryStaffApi.js
 */

import { useAuthStore } from '../store/AuthStore'; // adjust path if needed
import { create } from 'zustand';

const API_BASE_URL = 'http://13.207.106.215:8080/api'; // same as your existing api.js

// ─── Internal fetch helper ────────────────────────────────────────────────────
async function apiFetch(path, { method = 'GET', body } = {}) {
    const token =
        useAuthStore.getState().token ||
        useAuthStore.getState().user?.token ||
        null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { message: text };
    }

    if (!res.ok) {
        const msg = data?.message || data?.error || `API error ${res.status} on ${method} ${path}`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DELIVERY STAFF ZUSTAND SLICE
// ═══════════════════════════════════════════════════════════════════════════════

export const useDeliveryStaffSlice = create((set, get) => ({
    // ── State ──────────────────────────────────────────────────────────────────
    staff: [],          // all helpers (active + inactive)
    activeStaff: [],    // only active helpers — with busy:true/false
    loading: false,
    error: null,

    // ── Fetch all helpers (list screen) ───────────────────────────────────────
    fetchStaff: async () => {
        set({ loading: true, error: null });
        try {
            const staff = await apiFetch('/vendor/delivery-staff');
            set({ staff: staff || [], loading: false });
            return staff;
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    // ── Fetch only active helpers with busy status (assign-delivery dropdown) ──
    // Tries the new /active/with-status endpoint first.
    // Falls back to /active (without busy flag) if not available yet.
    fetchActiveStaff: async () => {
        set({ loading: true, error: null });
        try {
            let activeStaff;
            try {
                // New endpoint: returns [{ id, name, phone, vehicleType, busy: true/false }]
                activeStaff = await apiFetch('/vendor/delivery-staff/active/with-status');
            } catch (e) {
                // Fallback: old endpoint without busy field
                activeStaff = await apiFetch('/vendor/delivery-staff/active');
                // Add busy: false for all since we can't determine it
                activeStaff = (activeStaff || []).map(s => ({ ...s, busy: false }));
            }
            set({ activeStaff: activeStaff || [], loading: false });
            return activeStaff;
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    // ── Add new helper ─────────────────────────────────────────────────────────
    addStaff: async ({ name, phone, vehicleType }) => {
        set({ loading: true, error: null });
        try {
            const newStaff = await apiFetch('/vendor/delivery-staff', {
                method: 'POST',
                body: { name, phone, vehicleType, active: true },
            });
            set(state => ({
                staff: [newStaff, ...state.staff],
                activeStaff: newStaff.active
                    ? [{ ...newStaff, busy: false }, ...state.activeStaff]
                    : state.activeStaff,
                loading: false,
            }));
            return newStaff;
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    // ── Update helper ──────────────────────────────────────────────────────────
    updateStaff: async (staffId, updates) => {
        set({ loading: true, error: null });
        try {
            const updated = await apiFetch(`/vendor/delivery-staff/${staffId}`, {
                method: 'PUT',
                body: updates,
            });
            set(state => ({
                staff: state.staff.map(s => s.id === staffId ? updated : s),
                activeStaff: state.activeStaff
                    .map(s => s.id === staffId ? { ...updated, busy: s.busy } : s)
                    .filter(s => s.active),
                loading: false,
            }));
            return updated;
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    // ── Toggle active/inactive ─────────────────────────────────────────────────
    toggleStaff: async (staffId) => {
        set({ loading: true, error: null });
        try {
            const updated = await apiFetch(`/vendor/delivery-staff/${staffId}/toggle`, {
                method: 'PATCH',
            });
            set(state => ({
                staff: state.staff.map(s => s.id === staffId ? updated : s),
                activeStaff: updated.active
                    ? [...state.activeStaff.filter(s => s.id !== staffId), { ...updated, busy: false }]
                    : state.activeStaff.filter(s => s.id !== staffId),
                loading: false,
            }));
            return updated;
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    // ── Soft delete (deactivate) ───────────────────────────────────────────────
    deleteStaff: async (staffId) => {
        set({ loading: true, error: null });
        try {
            await apiFetch(`/vendor/delivery-staff/${staffId}`, { method: 'DELETE' });
            set(state => ({
                staff: state.staff.map(s =>
                    s.id === staffId ? { ...s, active: false } : s
                ),
                activeStaff: state.activeStaff.filter(s => s.id !== staffId),
                loading: false,
            }));
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    // ── Locally mark a helper as busy (optimistic update after assignment) ─────
    markHelperBusy: (staffId) => {
        set(state => ({
            activeStaff: state.activeStaff.map(s =>
                s.id === staffId ? { ...s, busy: true } : s
            ),
        }));
    },

    // ── Locally mark a helper as available (optimistic update after delivery) ──
    markHelperAvailable: (staffId) => {
        set(state => ({
            activeStaff: state.activeStaff.map(s =>
                s.id === staffId ? { ...s, busy: false } : s
            ),
        }));
    },

    reset: () => set({ staff: [], activeStaff: [], loading: false, error: null }),
}));

// ═══════════════════════════════════════════════════════════════════════════════
//  STANDALONE API FUNCTIONS (for use outside Zustand / in existing screens)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch all delivery staff for logged-in vendor.
 * @returns {Promise<Array>}
 */
export async function fetchDeliveryStaff() {
    return apiFetch('/vendor/delivery-staff');
}

/**
 * Fetch only ACTIVE delivery staff with busy status.
 * Returns [{ id, name, phone, vehicleType, busy: boolean }]
 * @returns {Promise<Array>}
 */
export async function fetchActiveDeliveryStaff() {
    try {
        return await apiFetch('/vendor/delivery-staff/active/with-status');
    } catch {
        // Fallback
        const staff = await apiFetch('/vendor/delivery-staff/active');
        return (staff || []).map(s => ({ ...s, busy: false }));
    }
}

/**
 * Add a new delivery helper.
 * @param {{ name: string, phone: string, vehicleType?: string }} data
 * @returns {Promise<Object>}
 */
export async function addDeliveryStaff(data) {
    return apiFetch('/vendor/delivery-staff', { method: 'POST', body: data });
}

/**
 * Update a delivery helper.
 * @param {number} staffId
 * @param {{ name?: string, phone?: string, vehicleType?: string, active?: boolean }} updates
 * @returns {Promise<Object>}
 */
export async function updateDeliveryStaff(staffId, updates) {
    return apiFetch(`/vendor/delivery-staff/${staffId}`, { method: 'PUT', body: updates });
}

/**
 * Toggle a helper active/inactive.
 * @param {number} staffId
 * @returns {Promise<Object>}
 */
export async function toggleDeliveryStaff(staffId) {
    return apiFetch(`/vendor/delivery-staff/${staffId}/toggle`, { method: 'PATCH' });
}

/**
 * Soft-delete (deactivate) a delivery helper.
 * @param {number} staffId
 * @returns {Promise<void>}
 */
export async function deleteDeliveryStaff(staffId) {
    return apiFetch(`/vendor/delivery-staff/${staffId}`, { method: 'DELETE' });
}

/**
 * Assign a delivery staff member to an order.
 * Sends { deliveryStaffId } — backend validates ownership + active status.
 * On success, helper becomes BUSY (tracked via active orders on backend).
 *
 * @param {number} orderId
 * @param {number} deliveryStaffId
 * @returns {Promise<MarketplaceOrder>}
 */
export async function assignDeliveryStaffToOrder(orderId, deliveryStaffId) {
    return apiFetch(`/vendor/orders/${orderId}/assign-delivery`, {
        method: 'PUT',
        body: { deliveryStaffId: String(deliveryStaffId) },
    });
}

/**
 * Mark an order as out for delivery.
 * @param {number} orderId
 * @returns {Promise<MarketplaceOrder>}
 */
export async function markOrderOutForDelivery(orderId) {
    return apiFetch(`/vendor/orders/${orderId}/out-for-delivery`, { method: 'PUT' });
}