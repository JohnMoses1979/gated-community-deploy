/**
 * builderApi.js
 * Builder-specific API layer following the exact same pattern as
 * visitorApi.js and sosApi.js — uses requestJson from apiClient.js.
 *
 * Backend endpoints (BuilderProjectController, BookingController,
 * SiteVisitController, ConstructionTrackingController, PaymentController):
 *
 * BUILDER:
 *   GET  /builder/dashboard
 *   GET  /builder/projects
 *   POST /builder/projects
 *   POST /builder/projects/{id}/towers
 *   POST /builder/towers/{id}/units
 *
 * CUSTOMER:
 *   GET  /customer/projects
 *   GET  /customer/projects/{id}
 *   GET  /customer/projects/{id}/towers
 *   GET  /customer/projects/towers/{id}/units
 *
 * BOOKINGS (authenticated):
 *   POST /bookings/unit/{unitId}
 *   GET  /bookings/my-bookings
 *   GET  /bookings/unit/{unitId}
 *   PUT  /bookings/{id}/status
 *
 * SITE VISITS (authenticated):
 *   POST /site-visits/book/{projectId}
 *   GET  /site-visits/my-visits
 *   GET  /site-visits/project/{projectId}
 *   PUT  /site-visits/{id}/status
 *
 * CONSTRUCTION (authenticated):
 *   POST /construction/project/{id}/milestones
 *   POST /construction/milestones/{id}/updates
 *   GET  /construction/project/{id}/milestones
 *   GET  /construction/milestones/{id}/updates
 *
 * PAYMENTS (authenticated):
 *   POST /payments/booking/{id}/installments
 *   GET  /payments/booking/{id}/installments
 *   POST /payments/installments/{id}/pay
 *   PUT  /payments/booking/{id}/possession
 *
 * IDENTITY: Always from JWT — never sent in body.
 */

import { requestJson } from '../services/apiClient';

// ─── Builder: Dashboard ───────────────────────────────────────────────────────
export async function fetchBuilderDashboard(token) {
    return requestJson('/builder/dashboard', { token });
}

// ─── Builder: Projects ────────────────────────────────────────────────────────
export async function fetchBuilderProjects(token) {
    return requestJson('/builder/projects', { token });
}

export async function createBuilderProject(token, payload) {
    return requestJson('/builder/projects', {
        method: 'POST',
        token,
        body: payload,
    });
}

// ─── Builder: Towers ──────────────────────────────────────────────────────────
export async function fetchProjectComplianceDocuments(token, projectId) {
    return requestJson(`/builder/projects/${projectId}/compliance-documents`, { token });
}

export async function updateProjectComplianceDocuments(token, projectId, documents) {
    return requestJson(`/builder/projects/${projectId}/compliance-documents`, {
        method: 'PUT',
        token,
        body: { complianceDocumentsJson: JSON.stringify(documents || []) },
    });
}

export async function createTower(token, projectId, payload) {
    return requestJson(`/builder/projects/${projectId}/towers`, {
        method: 'POST',
        token,
        body: payload,
    });
}

export async function fetchBuilderProjectTowers(token, projectId) {
    return requestJson(`/builder/projects/${projectId}/towers`, { token });
}

// ─── Builder: Units ───────────────────────────────────────────────────────────
export async function createUnit(token, towerId, payload) {
    return requestJson(`/builder/towers/${towerId}/units`, {
        method: 'POST',
        token,
        body: payload,
    });
}

export async function fetchBuilderTowerUnits(token, towerId) {
    return requestJson(`/builder/towers/${towerId}/units`, { token });
}

export async function updateBuilderUnit(token, unitId, payload) {
    return requestJson(`/builder/units/${unitId}`, {
        method: 'PUT',
        token,
        body: payload,
    });
}

export async function deleteBuilderUnit(token, unitId) {
    return requestJson(`/builder/units/${unitId}`, {
        method: 'DELETE',
        token,
    });
}

// ─── Customer: Projects (approved + LIVE only) ────────────────────────────────
export async function fetchApprovedProjects(token) {
    return requestJson('/customer/projects', { token });
}

export async function fetchProjectDetails(token, projectId) {
    return requestJson(`/customer/projects/${projectId}`, { token });
}

export async function fetchProjectTowers(token, projectId) {
    return requestJson(`/customer/projects/${projectId}/towers`, { token });
}

export async function fetchTowerUnits(token, towerId) {
    return requestJson(`/customer/projects/towers/${towerId}/units`, { token });
}

// ─── Bookings: Customer books a unit ─────────────────────────────────────────
// customerId NEVER sent — resolved from JWT on server
export async function bookUnit(token, unitId, payload) {
    return requestJson(`/bookings/unit/${unitId}`, {
        method: 'POST',
        token,
        body: payload,
    });
}

export async function fetchMyBookings(token) {
    return requestJson('/bookings/my-bookings', { token });
}

// ─── Bookings: Builder views / approves / rejects ────────────────────────────
export async function fetchBookingsForUnit(token, unitId) {
    return requestJson(`/bookings/unit/${unitId}`, { token });
}

// status: 'APPROVED' | 'REJECTED' | 'CANCELLED'
export async function updateBookingStatus(token, bookingId, status) {
    return requestJson(`/bookings/${bookingId}/status`, {
        method: 'PUT',
        token,
        body: { status },
    });
}

// ─── Site Visits: Customer books ─────────────────────────────────────────────
// customerId NEVER sent — resolved from JWT on server
export async function bookSiteVisit(token, projectId, scheduledDate) {
    return requestJson(`/site-visits/book/${projectId}`, {
        method: 'POST',
        token,
        body: { scheduledDate },
    });
}

export async function fetchMyVisits(token) {
    return requestJson('/site-visits/my-visits', { token });
}

// ─── Site Visits: Builder views / updates ────────────────────────────────────
export async function fetchProjectVisits(token, projectId) {
    return requestJson(`/site-visits/project/${projectId}`, { token });
}

// status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
export async function updateSiteVisitStatus(token, visitId, status) {
    return requestJson(`/site-visits/${visitId}/status`, {
        method: 'PUT',
        token,
        body: { status },
    });
}

// ─── Construction: Milestones ────────────────────────────────────────────────
export async function createMilestone(token, projectId, payload) {
    return requestJson(`/construction/project/${projectId}/milestones`, {
        method: 'POST',
        token,
        body: payload,
    });
}

export async function fetchProjectMilestones(token, projectId) {
    return requestJson(`/construction/project/${projectId}/milestones`, { token });
}

export async function updateMilestone(token, milestoneId, payload) {
    return requestJson(`/construction/milestones/${milestoneId}`, {
        method: 'PUT',
        token,
        body: payload,
    });
}

// ─── Construction: Updates ───────────────────────────────────────────────────
export async function addConstructionUpdate(token, milestoneId, payload) {
    return requestJson(`/construction/milestones/${milestoneId}/updates`, {
        method: 'POST',
        token,
        body: payload,
    });
}

export async function fetchMilestoneUpdates(token, milestoneId) {
    return requestJson(`/construction/milestones/${milestoneId}/updates`, { token });
}

// ─── Payments: Installments ───────────────────────────────────────────────────
export async function generateInstallments(token, bookingId, installments) {
    return requestJson(`/payments/booking/${bookingId}/installments`, {
        method: 'POST',
        token,
        body: { installments },
    });
}

export async function fetchInstallments(token, bookingId) {
    return requestJson(`/payments/booking/${bookingId}/installments`, { token });
}

export async function payInstallment(token, installmentId, amountPaid, receiptUrl) {
    return requestJson(`/payments/installments/${installmentId}/pay`, {
        method: 'POST',
        token,
        body: { amountPaid, receiptUrl },
    });
}

export async function recordManualCollection(token, bookingId, amountPaid, receiptUrl = '') {
    return requestJson(`/payments/booking/${bookingId}/manual-collection`, {
        method: 'POST',
        token,
        body: { amountPaid, receiptUrl },
    });
}

// ─── Payments: Possession ─────────────────────────────────────────────────────
// status: 'SOFT_POSSESSION' | 'FINAL_POSSESSION'
export async function updatePossessionStatus(token, bookingId, status, letterUrl) {
    return requestJson(`/payments/booking/${bookingId}/possession`, {
        method: 'PUT',
        token,
        body: { status, letterUrl },
    });
}

// WITH:
export const fetchBuilderBookings = (token) =>
    requestJson('/bookings/builder/all', { method: 'GET', token });

export const completeBookingPayment = (token, bookingId) =>
    requestJson(`/payments/booking/${bookingId}/check-completion`, { method: 'POST', token });



// Fetch all site visits across all builder's projects
export const fetchAllBuilderVisits = (token) =>
    requestJson('/site-visits/builder/all', { token });

// Customer: submit a real site visit to backend
export async function submitSiteVisit(token, projectId, payload) {
    return requestJson(`/site-visits/book/${projectId}`, {
        method: 'POST',
        token,
        body: payload,
    });
}

// Customer: fetch their own visit statuses
export const fetchCustomerVisits = (token) =>
    requestJson('/site-visits/my-visits', { token });

// ADD after the existing payInstallment export:

// Builder: fetch installments for a specific booking
export const fetchBookingInstallments = (token, bookingId) =>
    requestJson(`/payments/booking/${bookingId}/installments`, { token });

// Builder: update possession status for a booking
export const markPossessionStatus = (token, bookingId, status, letterUrl) =>
    requestJson(`/payments/booking/${bookingId}/possession`, {
        method: 'PUT',
        token,
        body: { status: status === true, letterUrl: letterUrl || '' },
    });


export const fetchMyInstallments = (token, bookingId) =>
    requestJson(`/payments/booking/${bookingId}/installments`, { token });