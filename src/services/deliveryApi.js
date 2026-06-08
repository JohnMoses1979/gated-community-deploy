import useAuthStore from '../store/AuthStore';
import { requestJson } from './apiClient';

function token() {
    return useAuthStore.getState().token;
}

export async function createDeliveryPass({
    hostResidentId,
    hostResidentName,
    hostUnit,
    provider,
    expectedWindow,
    deliveryPersonName = '',
    deliveryPersonPhone = '',
}) {
    try {
        const { response, data } = await requestJson('/deliveries', {
            method: 'POST',
            token: token(),
            body: {
                hostResidentId,
                hostResidentName,
                hostUnit,
                provider,
                expectedWindow,
                deliveryPersonName,
                deliveryPersonPhone,
            },
        });
        if (!response.ok) {
            const validationErrors = data?.validationErrors;
            const firstValidationError =
                validationErrors && typeof validationErrors === 'object'
                    ? Object.values(validationErrors)[0]
                    : null;
            return {
                ok: false,
                data: null,
                error: firstValidationError || data?.message || 'Failed to create pass',
            };
        }
        return { ok: true, data, error: null };
    } catch (e) {
        return { ok: false, data: null, error: 'Network error. Check your connection.' };
    }
}

export async function fetchMyDeliveryPasses(residentId) {
    try {
        const { response, data } = await requestJson(`/deliveries/my/${residentId}`, { token: token() });
        if (!response.ok) return { ok: false, data: [], error: 'Failed to load passes' };
        return { ok: true, data, error: null };
    } catch (e) {
        return { ok: false, data: [], error: 'Network error. Check your connection.' };
    }
}

export async function fetchPendingDeliveries() {
    try {
        const { response, data } = await requestJson('/deliveries/pending', { token: token() });
        if (!response.ok) return { ok: false, data: [], error: 'Failed to load deliveries' };
        return { ok: true, data, error: null };
    } catch (e) {
        return { ok: false, data: [], error: 'Network error. Check your connection.' };
    }
}

export async function verifyDeliveryOtp(otp, guardId) {
    try {
        const { response, data } = await requestJson('/deliveries/verify-otp', {
            method: 'POST',
            token: token(),
            body: { otp, guardId },
        });
        if (!response.ok) return { ok: false, data: null, error: data.message || 'OTP verification failed' };
        return { ok: true, data, error: null };
    } catch (e) {
        return { ok: false, data: null, error: 'Network error. Check your connection.' };
    }
}

export async function markDeliveryDelivered(passId, guardId) {
    try {
        const { response, data } = await requestJson(`/deliveries/${passId}/delivered`, {
            method: 'PUT',
            token: token(),
            body: { guardId },
        });
        if (!response.ok) {
            return { ok: false, error: data.message || 'Failed to mark delivered' };
        }
        return { ok: true, error: null };
    } catch (e) {
        return { ok: false, error: 'Network error. Check your connection.' };
    }
}

export async function cancelDeliveryPass(passId, residentId) {
    try {
        const { response, data } = await requestJson(`/deliveries/${passId}/cancel`, {
            method: 'PUT',
            token: token(),
            body: { residentId },
        });
        if (!response.ok) {
            return { ok: false, error: data.message || 'Failed to cancel pass' };
        }
        return { ok: true, error: null };
    } catch (e) {
        return { ok: false, error: 'Network error. Check your connection.' };
    }
}
