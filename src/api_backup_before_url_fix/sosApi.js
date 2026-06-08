/**
 * sosApi.js
 *
 * SOS API layer — uses requestJson() and apiUrl() from services/apiClient.js.
 * Token is always passed from AuthStore — never hardcoded.
 *
 * Endpoint map (matches backend SOSAlertController exactly):
 *
 * RESIDENT:
 *   POST /api/sos/create          → triggerSOSApi
 *   GET  /api/sos/my              → fetchMySOSAlertsApi
 *
 * SECURITY GUARD:
 *   GET  /api/sos/active          → fetchActiveSOSAlertsApi
 *   POST /api/sos/{id}/acknowledge → acknowledgeSOSApi
 *   POST /api/sos/{id}/progress   → progressSOSApi
 *   POST /api/sos/{id}/resolve    → resolveSOSApi
 *
 * ADMIN:
 *   GET /api/admin/sos/all        → fetchAllSOSAlertsApi
 *   GET /api/admin/sos/active     → fetchAdminActiveSOSAlertsApi
 */

import { requestJson } from '../services/apiClient';

// ── RESIDENT ──────────────────────────────────────────────────────────────────

/**
 * Resident triggers a new SOS alert.
 * residentId/residentName are overwritten by the backend from JWT.
 * We only send type + description from the UI.
 */
export async function triggerSOSApi(token, { type, description, unit }) {
    const { response, data } = await requestJson('/sos/create', {
        method: 'POST',
        token,
        body: { type, description, unit },
    });
    return { ok: response.ok, data };
}

/**
 * Resident fetches their own SOS alerts.
 * No residentId in URL — backend reads from JWT.
 */
export async function fetchMySOSAlertsApi(token) {
    const { response, data } = await requestJson('/sos/my', {
        method: 'GET',
        token,
    });
    return { ok: response.ok, data };
}

// ── SECURITY GUARD ────────────────────────────────────────────────────────────

/**
 * Guard fetches all non-resolved alerts.
 */
export async function fetchActiveSOSAlertsApi(token) {
    const { response, data } = await requestJson('/sos/active', {
        method: 'GET',
        token,
    });
    return { ok: response.ok, data };
}

/**
 * Guard acknowledges an SOS alert.
 * No guardId/guardName in body — backend reads from JWT.
 */
export async function acknowledgeSOSApi(token, id) {
    const { response, data } = await requestJson(`/sos/${id}/acknowledge`, {
        method: 'POST',
        token,
    });
    return { ok: response.ok, data };
}

/**
 * Guard marks SOS as in-progress.
 * No guardId/guardName in body — backend reads from JWT.
 */
export async function progressSOSApi(token, id) {
    const { response, data } = await requestJson(`/sos/${id}/progress`, {
        method: 'POST',
        token,
    });
    return { ok: response.ok, data };
}

/**
 * Guard resolves an SOS alert.
 * resolution is the only field accepted from the caller.
 * No guardId/guardName in body — backend reads from JWT.
 */
export async function resolveSOSApi(token, id, resolution) {
    const { response, data } = await requestJson(`/sos/${id}/resolve`, {
        method: 'POST',
        token,
        body: { resolution },
    });
    return { ok: response.ok, data };
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────

/**
 * Admin fetches all SOS alerts (full history).
 */
export async function fetchAllSOSAlertsApi(token) {
    const { response, data } = await requestJson('/admin/sos/all', {
        method: 'GET',
        token,
    });
    return { ok: response.ok, data };
}

/**
 * Admin fetches all active (non-resolved) SOS alerts.
 */
export async function fetchAdminActiveSOSAlertsApi(token) {
    const { response, data } = await requestJson('/admin/sos/active', {
        method: 'GET',
        token,
    });
    return { ok: response.ok, data };
}