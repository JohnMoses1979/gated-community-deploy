/**
 * maintenanceApi.js
 *
 * All maintenance backend API calls.
 * Uses your project's requestJson from services/apiClient.js.
 *
 * SECURITY:
 *  - All calls carry Authorization: Bearer <token>
 *  - Identity (residentId, vendorId, adminId, guardId) is NEVER sent in body
 *    — backend reads from JWT via CurrentUser.get()
 *  - Only data fields are sent in request bodies
 */

import { requestJson } from '../services/apiClient';

// ─────────────────────────────────────────────────────────────────────────────
// RESIDENT APIs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/maintenance/submit
 * Resident submits a new maintenance request.
 * residentId/residentName/unit injected from JWT on backend.
 */
export async function submitMaintenanceRequest(token, data) {
    return requestJson('/maintenance/submit', {
        method: 'POST',
        token,
        body: {
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority,
            preferredSlot: data.preferredSlot,
            contactPref: data.contactPref,
        },
    });
}

/**
 * GET /api/maintenance/my
 * Resident fetches their own requests.
 */
export async function getMyMaintenanceRequests(token) {
    return requestJson('/maintenance/my', { token });
}

/**
 * PUT /api/maintenance/{id}/respond-quote
 * Resident accepts or rejects a quote.
 * @param {string} action - 'accept' | 'reject'
 */
export async function respondToQuote(token, id, action) {
    return requestJson(`/maintenance/${id}/respond-quote`, {
        method: 'PUT',
        token,
        body: { decision: action },
    });
}

/**
 * PUT /api/maintenance/{id}/approve-work
 * Resident approves completed work — unlocks vendor payment request.
 */
export async function approveCompletedWork(token, id) {
    return requestJson(`/maintenance/${id}/approve-work`, {
        method: 'PUT',
        token,
    });
}

/**
 * POST /api/maintenance/{id}/create-payment-order
 * Creates a Razorpay order for resident to pay maintenance amount.
 */
export async function createMaintenancePaymentOrder(token, id) {
    return requestJson(`/maintenance/${id}/create-payment-order`, {
        method: 'POST',
        token,
    });
}

/**
 * POST /api/maintenance/verify-payment
 * Verifies Razorpay signature and marks payment received.
 */
export async function verifyMaintenancePayment(token, paymentData) {
    return requestJson('/maintenance/verify-payment', {
        method: 'POST',
        token,
        body: {
            razorpayOrderId: paymentData.razorpay_order_id,
            razorpayPaymentId: paymentData.razorpay_payment_id,
            razorpaySignature: paymentData.razorpay_signature,
        },
    });
}

/**
 * POST /api/maintenance/{id}/rate-vendor
 * Resident submits a vendor rating after job is closed.
 */
export async function submitVendorRating(token, id, ratingData) {
    return requestJson(`/maintenance/${id}/rate-vendor`, {
        method: 'POST',
        token,
        body: {
            rating: ratingData.rating,
            review: ratingData.review || '',
            tags: ratingData.tags || [],
        },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN APIs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/maintenance/all
 * Admin fetches all maintenance requests.
 */
export async function adminGetAllRequests(token) {
    return requestJson('/admin/maintenance', { token });
}

/**
 * GET /api/maintenance/gate
 * Guard fetches only maintenance jobs relevant for gate entry.
 */
export async function guardGetGateRequests(token) {
    return requestJson('/maintenance/gate', { token });
}

/**
 * PUT /api/admin/maintenance/{id}/assign-vendor
 * Admin assigns vendor(s) and sends quote request.
 * vendorIds: array of vendor user IDs
 */
export async function adminAssignVendor(token, id, vendors) {
    const selected = Array.isArray(vendors) ? vendors[0] : vendors;
    const vendorId = typeof selected === 'object' ? selected?.id : selected;
    const vendorName = typeof selected === 'object' ? selected?.name : undefined;
    const vendorPhone = typeof selected === 'object' ? selected?.phone : undefined;

    return requestJson(`/admin/maintenance/${id}/assign-vendor`, {
        method: 'PUT',
        token,
        body: { vendorId, vendorName, vendorPhone },
    });
}

export async function simulateMaintenancePayment(token, id, paymentData = {}) {
    return requestJson(`/maintenance/${id}/simulate-payment`, {
        method: 'POST',
        token,
        body: {
            paymentId: paymentData.razorpay_payment_id,
            method: paymentData.methodLabel || paymentData.method || 'Demo Payment',
        },
    });
}

/**
 * PUT /api/admin/maintenance/{id}/forward-quote
 * Admin forwards vendor quote to resident.
 */
export async function adminForwardQuote(token, id) {
    return requestJson(`/admin/maintenance/${id}/forward-quote`, {
        method: 'PUT',
        token,
    });
}

/**
 * PUT /api/admin/maintenance/{id}/confirm-work-start
 * Admin confirms work can start — generates gate OTP for vendor.
 */
export async function adminConfirmWorkStart(token, id) {
    return requestJson(`/admin/maintenance/${id}/generate-gate-otp`, {
        method: 'PUT',
        token,
    });
}

/**
 * PUT /api/admin/maintenance/{id}/generate-gate-otp
 * Admin generates/regenerates gate OTP for vendor.
 */
export async function adminGenerateGateOTP(token, id) {
    return requestJson(`/admin/maintenance/${id}/generate-gate-otp`, {
        method: 'PUT',
        token,
    });
}

/**
 * PUT /api/admin/maintenance/{id}/request-payment-from-resident
 * Admin requests payment from resident after receiving vendor payment request.
 */
export async function adminRequestPaymentFromResident(token, id) {
    return requestJson(`/admin/maintenance/${id}/forward-payment`, {
        method: 'PUT',
        token,
    });
}

/**
 * PUT /api/admin/maintenance/{id}/pay-vendor
 * Admin marks vendor as paid (after collecting from resident).
 */
export async function adminPayVendor(token, id) {
    return requestJson(`/admin/maintenance/${id}/close`, {
        method: 'PUT',
        token,
    });
}

/**
 * PUT /api/admin/maintenance/{id}/close
 * Admin closes a request manually.
 */
export async function adminCloseRequest(token, id) {
    return requestJson(`/admin/maintenance/${id}/close`, {
        method: 'PUT',
        token,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR APIs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/maintenance/vendor/my
 * Vendor fetches their assigned requests.
 */
export async function vendorGetMyRequests(token) {
    return requestJson('/maintenance/vendor/my', { token });
}

/**
 * PUT /api/maintenance/{id}/submit-quote
 * Vendor submits a quotation.
 */
export async function vendorSubmitQuote(token, id, quoteData) {
    return requestJson(`/maintenance/${id}/submit-quote`, {
        method: 'PUT',
        token,
        body: {
            amount: quoteData.amount,
            description: quoteData.description,
            estimatedDays: quoteData.estimatedDays,
        },
    });
}

/**
 * PUT /api/maintenance/{id}/work-complete
 * Vendor marks work as complete.
 */
export async function vendorMarkWorkComplete(token, id) {
    return requestJson(`/maintenance/${id}/work-complete`, {
        method: 'PUT',
        token,
    });
}

/**
 * PUT /api/maintenance/{id}/request-payment
 * Vendor requests payment from admin (only after resident approves work).
 */
export async function vendorRequestPayment(token, id) {
    return requestJson(`/maintenance/${id}/request-payment`, {
        method: 'PUT',
        token,
        body: {},
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARD APIs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PUT /api/maintenance/verify-gate-otp
 * Guard verifies vendor OTP at gate — starts work_in_progress.
 * guardId extracted from JWT on backend.
 */
export async function guardVerifyGateOTP(token, otp) {
    return requestJson('/maintenance/verify-gate-otp', {
        method: 'PUT',
        token,
        body: { otp },
    });
}
