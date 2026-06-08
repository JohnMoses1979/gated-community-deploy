// /**
//  * noticeApi.js
//  *
//  * Import and call these helpers from screens or stores.
//  * Backend base URL now comes from src/services/api.js.
//  */

// import { apiUrl } from '../services/api';

// export async function apiPostNotice(noticeData, adminId) {
//   const res = await fetch(`${apiUrl('/admin/notices')}?adminId=${adminId}`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(noticeData),
//   });
//   if (!res.ok) { 
//     const err = await res.json();
//     throw new Error(err.message || 'Failed to post notice');
//   }
//   return res.json();
// }

// export async function apiDeleteNotice(noticeId) {
//   const res = await fetch(apiUrl(`/admin/notices/${noticeId}`), {
//     method: 'DELETE',
//   });
//   if (!res.ok) throw new Error('Failed to delete notice');
//   return res.json();
// }

// export async function apiGetAllNotices() {
//   const res = await fetch(apiUrl('/admin/notices'));
//   if (!res.ok) throw new Error('Failed to fetch notices');
//   return res.json();
// }

// export async function apiGetNotices(role = 'resident') {
//   const res = await fetch(`${apiUrl('/notices')}?role=${role}`);
//   if (!res.ok) throw new Error('Failed to fetch notices');
//   return res.json();
// }

// export async function apiRsvp(noticeId) {
//   const res = await fetch(apiUrl(`/notices/${noticeId}/rsvp`), {
//     method: 'POST',
//   });
//   if (!res.ok) throw new Error('RSVP failed');
//   return res.json();
// }

// export async function apiGetUpcomingEvents() {
//   const res = await fetch(apiUrl('/notices/events/upcoming'));
//   if (!res.ok) throw new Error('Failed to fetch events');
//   return res.json();
// }

























/**
 * noticeApi.js
 *
 * SECURITY FIX (merged):
 *  - apiPostNotice no longer sends ?adminId= query param
 *    (backend derives admin identity from JWT via CurrentUser.get())
 *  - All mutating calls require caller to pass token for Authorization header
 *  - Read endpoints (/notices) are authenticated but need token too
 *
 * Usage from screens:
 *   import { apiPostNotice } from '../../../Api/noticeApi';
 *   const token = useAuthStore(s => s.token);
 *   await apiPostNotice(data, token);
 */

import { apiUrl } from '../services/apiClient';

/**
 * POST /api/admin/notices
 * FIX: adminId param removed — backend reads admin identity from JWT
 * @param {object} noticeData
 * @param {string} token  - JWT bearer token from useAuthStore(s => s.token)
 */
export async function apiPostNotice(noticeData, token) {
  const res = await fetch(apiUrl('/admin/notices'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(noticeData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to post notice');
  }
  return res.json();
}

/**
 * DELETE /api/admin/notices/{noticeId}
 * @param {number|string} noticeId
 * @param {string} token
 */
export async function apiDeleteNotice(noticeId, token) {
  const res = await fetch(apiUrl(`/admin/notices/${noticeId}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete notice');
  return res.json();
}

/**
 * GET /api/admin/notices  (admin view — all notices)
 * @param {string} token
 */
export async function apiGetAllNotices(token) {
  const res = await fetch(apiUrl('/admin/notices'), {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch notices');
  return res.json();
}

/**
 * GET /api/notices?role=resident  (resident/guard/vendor view)
 * @param {string} role  - 'resident' | 'security' | 'vendor' | 'all'
 * @param {string} token
 */
export async function apiGetNotices(role = 'resident', token) {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const res = await fetch(`${apiUrl('/notices')}?role=${role}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch notices');
  return res.json();
}

/**
 * POST /api/notices/{noticeId}/rsvp
 * @param {number|string} noticeId
 * @param {string} token
 */
export async function apiRsvp(noticeId, token) {
  const res = await fetch(apiUrl(`/notices/${noticeId}/rsvp`), {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('RSVP failed');
  return res.json();
}

/**
 * GET /api/notices/events/upcoming
 * @param {string} token
 */
export async function apiGetUpcomingEvents(token) {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const res = await fetch(apiUrl('/notices/events/upcoming'), { headers });
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}