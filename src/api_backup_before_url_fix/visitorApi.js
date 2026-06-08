/**
 * visitorApi.js
 *
 * Visitor Pass API endpoints and helpers.
 * Built on top of the project's existing apiClient.js (requestJson / apiUrl).
 *
 * Aligned to VisitorPassController backend contract:
 *   RESIDENT  → POST /visitor/create    (identity from JWT)
 *               GET  /visitor/my        (identity from JWT — NO residentId in path)
 *   SECURITY  → GET  /visitor/all
 *               POST /visitor/verify-otp
 *               POST /visitor/checkin/:id   (body: { gate } only)
 *               POST /visitor/deny/:id
 *               POST /visitor/checkout/:id
 *   ADMIN     → GET  /admin/visitor/all
 *
 * NEVER pass residentId / guardId / adminId in request body or path.
 * Identity is always derived server-side from the JWT via CurrentUser.get().
 */

import { requestJson, apiUrl } from '../services/apiClient';

// ─── Endpoint paths ───────────────────────────────────────────────────────────
export const VISITOR_PATHS = {
    create: '/visitor/create',
    my: '/visitor/my',
    all: '/visitor/all',
    verifyOtp: '/visitor/verify-otp',
    checkIn: (passId) => `/visitor/checkin/${passId}`,
    deny: (passId) => `/visitor/deny/${passId}`,
    checkOut: (passId) => `/visitor/checkout/${passId}`,
    adminAll: '/admin/visitor/all',
};

export const VISITOR_API = {
    create: apiUrl(VISITOR_PATHS.create),
    my: apiUrl(VISITOR_PATHS.my),
    all: apiUrl(VISITOR_PATHS.all),
    verifyOtp: apiUrl(VISITOR_PATHS.verifyOtp),
    checkIn: (passId) => apiUrl(VISITOR_PATHS.checkIn(passId)),
    deny: (passId) => apiUrl(VISITOR_PATHS.deny(passId)),
    checkOut: (passId) => apiUrl(VISITOR_PATHS.checkOut(passId)),
    adminAll: apiUrl(VISITOR_PATHS.adminAll),
};

// ─── RESIDENT: create a visitor pass ─────────────────────────────────────────
// Body: { visitorName, visitorPhone, purpose, vehicleNumber? }
// Identity (hostResidentId, hostUnit, hostResidentName) comes from JWT on server.
export async function createVisitorPass(token, { visitorName, visitorPhone, purpose, vehicleNumber = '' }) {
    return requestJson(VISITOR_PATHS.create, {
        method: 'POST',
        token,
        body: { visitorName, visitorPhone, purpose, vehicleNumber },
    });
}

// ─── RESIDENT: fetch own visitor passes ───────────────────────────────────────
// No residentId in path — server reads identity from JWT.
export async function getMyVisitorPasses(token) {
    return requestJson(VISITOR_PATHS.my, { token });
}

// ─── SECURITY: fetch all visitor passes ──────────────────────────────────────
export async function getAllVisitorPasses(token) {
    return requestJson(VISITOR_PATHS.all, { token });
}

// ─── SECURITY: verify visitor by OTP ─────────────────────────────────────────
// Body: { otp } only — no guardId.
export async function verifyVisitorOtpApi(token, otp) {
    return requestJson(VISITOR_PATHS.verifyOtp, {
        method: 'POST',
        token,
        body: { otp },
    });
}

// ─── SECURITY: check in visitor ──────────────────────────────────────────────
// Body: { gate } only — guard identity from JWT.
export async function checkInVisitorApi(token, passId, gate = 'Main Gate') {
    return requestJson(VISITOR_PATHS.checkIn(passId), {
        method: 'POST',
        token,
        body: { gate },
    });
}

// ─── SECURITY: deny visitor entry ────────────────────────────────────────────
export async function denyVisitorApi(token, passId) {
    return requestJson(VISITOR_PATHS.deny(passId), {
        method: 'POST',
        token,
    });
}

// ─── SECURITY: check out visitor ─────────────────────────────────────────────
export async function checkOutVisitorApi(token, passId) {
    return requestJson(VISITOR_PATHS.checkOut(passId), {
        method: 'POST',
        token,
    });
}

// ─── ADMIN: monitor all visitor activity ─────────────────────────────────────
export async function adminGetAllVisitorPasses(token) {
    return requestJson(VISITOR_PATHS.adminAll, { token });
}
