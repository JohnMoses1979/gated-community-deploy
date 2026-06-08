/**
 * guestParkingApi.js
 *
 * Guest Parking API — aligned to GuestParkingController backend contract.
 * Uses requestJson from services/apiClient.js exactly like visitorApi.js.
 *
 * NEVER pass residentId / guardId / adminId in body or path.
 * Identity always from JWT on server via CurrentUser.get().
 *
 * RESIDENT:
 *   POST /api/guest-parking           — create request
 *   GET  /api/guest-parking/my        — own requests (JWT identity)
 *   GET  /api/guest-parking/{id}      — single request
 *
 * ADMIN:
 *   GET  /api/admin/guest-parking     — all requests (?status=PENDING optional)
 *   PUT  /api/admin/guest-parking/{id}/approve
 *   PUT  /api/admin/guest-parking/{id}/reject
 *
 * GUARD (SECURITY):
 *   POST /api/guest-parking/guard/verify-otp  — verify OTP → ACTIVE
 *   PUT  /api/guest-parking/guard/{id}/expire  — mark EXPIRED
 */

import { requestJson } from '../services/apiClient';

// ─── Paths ────────────────────────────────────────────────────────────────────
export const GUEST_PARKING_PATHS = {
    create: '/guest-parking',
    my: '/guest-parking/my',
    byId: (id) => `/guest-parking/${id}`,
    adminAll: '/admin/guest-parking',
    adminApprove: (id) => `/admin/guest-parking/${id}/approve`,
    adminReject: (id) => `/admin/guest-parking/${id}/reject`,
    guardVerifyOtp: '/guest-parking/guard/verify-otp',
    guardExpire: (id) => `/guest-parking/guard/${id}/expire`,
};

// ─── RESIDENT: create guest parking request ───────────────────────────────────
// Body: { unit, guestName, guestPhone, vehicleNumber, vehicleType,
//         expectedDate, durationDays, slotNumber }
// residentId/residentName injected from JWT on server — never sent from frontend.
export async function createGuestParkingRequest(token, payload) {
    return requestJson(GUEST_PARKING_PATHS.create, {
        method: 'POST',
        token,
        body: payload,
    });
}

// ─── RESIDENT: fetch own requests ─────────────────────────────────────────────
// No residentId in path — server reads from JWT.
export async function getMyGuestParkingRequests(token) {
    return requestJson(GUEST_PARKING_PATHS.my, { token });
}

// ─── RESIDENT: fetch single request ──────────────────────────────────────────
export async function getGuestParkingById(token, id) {
    return requestJson(GUEST_PARKING_PATHS.byId(id), { token });
}

// ─── ADMIN: fetch all requests ────────────────────────────────────────────────
// Optional status filter: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'EXPIRED' | 'REJECTED'
export async function adminGetAllGuestParking(token, status) {
    const path = status
        ? `${GUEST_PARKING_PATHS.adminAll}?status=${status}`
        : GUEST_PARKING_PATHS.adminAll;
    return requestJson(path, { token });
}

// ─── ADMIN: approve request ───────────────────────────────────────────────────
// Body: { overrideSlot? } — optional slot override
export async function adminApproveGuestParking(token, id, overrideSlot) {
    return requestJson(GUEST_PARKING_PATHS.adminApprove(id), {
        method: 'PUT',
        token,
        body: overrideSlot ? { overrideSlot } : {},
    });
}

// ─── ADMIN: reject request ────────────────────────────────────────────────────
export async function adminRejectGuestParking(token, id) {
    return requestJson(GUEST_PARKING_PATHS.adminReject(id), {
        method: 'PUT',
        token,
    });
}

// ─── GUARD: verify OTP → mark ACTIVE ─────────────────────────────────────────
// Body: { otp, gate }
// guardId/guardName from JWT on server — NOT sent from frontend.
export async function guardVerifyGuestParkingOtp(token, otp, gate = 'Main Gate') {
    return requestJson(GUEST_PARKING_PATHS.guardVerifyOtp, {
        method: 'POST',
        token,
        body: { otp, gate },
    });
}

// ─── GUARD: mark EXPIRED (vehicle exit) ──────────────────────────────────────
// guardId from JWT on server — not sent from frontend.
export async function guardExpireGuestParking(token, id) {
    return requestJson(GUEST_PARKING_PATHS.guardExpire(id), {
        method: 'PUT',
        token,
    });
}