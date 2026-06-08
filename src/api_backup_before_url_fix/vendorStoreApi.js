/**
 * vendorStoreApi.js
 *
 * Drop-in replacement for all appStore marketplace calls.
 * Every function hits your real Spring Boot API and persists to MySQL.
 *
 * Usage: import { useVendorStore, useMarketplace } from './vendorStoreApi';
 *
 * SETUP (one-time):
 *   1. Copy this file to: src/api/vendorStoreApi.js
 *   2. Set API_BASE_URL below to your backend IP/port.
 *   3. Run: npm install zustand  (already installed if you use AuthStore)
 */

import { create } from 'zustand';
import { useAuthStore } from '../store/AuthStore'; // adjust path

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE_URL = 'http://13.207.106.215:8080/api'; // ← same as your existing api.js

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
    try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }

    if (!res.ok) {
        const msg =
            data?.message ||
            data?.error ||
            `API error ${res.status} on ${method} ${path}`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VENDOR STORE ZUSTAND SLICE
//  Replaces: appStore.getVendorStore / appStore.vendorStores
// ═══════════════════════════════════════════════════════════════════════════════

export const useVendorStoreSlice = create((set, get) => ({
    // ── State ──────────────────────────────────────────────────────────────────
    myStore: null,   // VendorStore object from backend
    storeLoading: false,
    storeError: null,

    myProducts: [],    // ProductResponse[] — vendor's own products
    productsLoading: false,
    productsError: null,

    // ── Store CRUD ─────────────────────────────────────────────────────────────

    /**
     * Fetch the logged-in vendor's store from the backend and cache it.
     * Call this on: mount of VendorStoreController screens, after login.
     */
    fetchMyStore: async () => {
        set({ storeLoading: true, storeError: null });
        try {
            const store = await apiFetch('/vendor/store');
            set({ myStore: store, storeLoading: false });
            return store;
        } catch (err) {
            // 404 = vendor has no store yet — not a real error
            if (err.status === 404) {
                set({ myStore: null, storeLoading: false });
                return null;
            }
            set({ storeError: err.message, storeLoading: false });
            throw err;
        }
    },

    /**
     * Create a new store.
     * storeData: { storeName (required), description?, category?, subcategory?,
     *   logoUrl?, bannerUrl?, contactPhone?, address?, timingsJson?,
     *   deliveryRadiusKm?, deliveryCharge?, minOrderAmount?,
     *   deliveryMode?, estimatedDeliveryTime?,
     *   serviceRadiusKm?, serviceMode?, appointmentSlotsJson? }
     */
    createStore: async (storeData) => {
        set({ storeLoading: true, storeError: null });
        try {
            const store = await apiFetch('/vendor/store', { method: 'POST', body: storeData });
            set({ myStore: store, storeLoading: false });
            return store;
        } catch (err) {
            set({ storeError: err.message, storeLoading: false });
            throw err;
        }
    },

    /**
     * Update the vendor's store. Only non-null fields are overwritten.
     * Pass only the fields you want to change.
     */
    updateStore: async (updates) => {
        set({ storeLoading: true, storeError: null });
        try {
            const store = await apiFetch('/vendor/store', { method: 'PUT', body: updates });
            set({ myStore: store, storeLoading: false });
            return store;
        } catch (err) {
            set({ storeError: err.message, storeLoading: false });
            throw err;
        }
    },

    /**
     * Soft-delete (deactivate) the store.
     * Products disappear from the resident marketplace immediately.
     */
    deactivateStore: async () => {
        set({ storeLoading: true, storeError: null });
        try {
            await apiFetch('/vendor/store', { method: 'DELETE' });
            set({ myStore: null, storeLoading: false });
        } catch (err) {
            set({ storeError: err.message, storeLoading: false });
            throw err;
        }
    },

    /**
     * Toggle vacation mode on/off.
     * @param {boolean} vacationMode
     */
    setVacationMode: async (vacationMode) => {
        const store = await apiFetch('/vendor/store', {
            method: 'PUT',
            body: { vacationMode },
        });
        set({ myStore: store });
        return store;
    },

    // ── Product CRUD ───────────────────────────────────────────────────────────

    /**
     * Fetch all products for the logged-in vendor.
     * Call this on mount of ProductListScreen.
     */
    fetchMyProducts: async () => {
        set({ productsLoading: true, productsError: null });
        try {
            const products = await apiFetch('/vendor/products');
            set({ myProducts: products || [], productsLoading: false });
            return products;
        } catch (err) {
            set({ productsError: err.message, productsLoading: false });
            throw err;
        }
    },

    /**
     * Add a product to the vendor's store.
     * productData: { name, price, stock (required),
     *   description?, emoji?, imageUrl?, originalPrice?,
     *   category?, subcategory?, unit?, active? }
     */
    addProduct: async (productData) => {
        set({ productsLoading: true, productsError: null });
        try {
            const product = await apiFetch('/vendor/products', {
                method: 'POST',
                body: productData,
            });
            set(state => ({
                myProducts: [product, ...state.myProducts],
                productsLoading: false,
            }));
            return product;
        } catch (err) {
            set({ productsError: err.message, productsLoading: false });
            throw err;
        }
    },

    /**
     * Update a product. Send only changed fields.
     */
    updateProduct: async (productId, updates) => {
        set({ productsLoading: true, productsError: null });
        try {
            const product = await apiFetch(`/vendor/products/${productId}`, {
                method: 'PUT',
                body: updates,
            });
            set(state => ({
                myProducts: state.myProducts.map(p =>
                    p.id === productId ? product : p
                ),
                productsLoading: false,
            }));
            return product;
        } catch (err) {
            set({ productsError: err.message, productsLoading: false });
            throw err;
        }
    },

    /**
     * Permanently delete a product.
     */
    deleteProduct: async (productId) => {
        set({ productsLoading: true, productsError: null });
        try {
            await apiFetch(`/vendor/products/${productId}`, { method: 'DELETE' });
            set(state => ({
                myProducts: state.myProducts.filter(p => p.id !== productId),
                productsLoading: false,
            }));
        } catch (err) {
            set({ productsError: err.message, productsLoading: false });
            throw err;
        }
    },

    /**
     * Toggle a product between active and paused.
     */
    toggleProductActive: async (productId) => {
        set({ productsLoading: true, productsError: null });
        try {
            const product = await apiFetch(`/vendor/products/${productId}/toggle`, {
                method: 'PATCH',
            });
            set(state => ({
                myProducts: state.myProducts.map(p =>
                    p.id === productId ? product : p
                ),
                productsLoading: false,
            }));
            return product;
        } catch (err) {
            set({ productsError: err.message, productsLoading: false });
            throw err;
        }
    },

    // ── Reset on logout ────────────────────────────────────────────────────────
    resetVendorState: () => {
        set({
            myStore: null,
            storeLoading: false,
            storeError: null,
            myProducts: [],
            productsLoading: false,
            productsError: null,
        });
    },
}));

// ═══════════════════════════════════════════════════════════════════════════════
//  RESIDENT MARKETPLACE ZUSTAND SLICE
//  Replaces: appStore.marketplaceProducts  for the Shop tab
// ═══════════════════════════════════════════════════════════════════════════════

export const useMarketplaceSlice = create((set, get) => ({
    // ── State ──────────────────────────────────────────────────────────────────
    products: [],   // ProductResponse[] — all resident-visible products
    stores: [],   // VendorStore[]
    productsLoading: false,
    storesLoading: false,
    error: null,

    // ── Fetch ──────────────────────────────────────────────────────────────────

    /**
     * Fetch all resident-visible products (active, in-stock, from active stores).
     * @param {{ category?: string, search?: string }} filters
     */
    fetchProducts: async (filters = {}) => {
        set({ productsLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.search) params.append('search', filters.search);
            const qs = params.toString();
            const products = await apiFetch(`/marketplace/products${qs ? `?${qs}` : ''}`);
            set({ products: products || [], productsLoading: false });
            return products;
        } catch (err) {
            set({ error: err.message, productsLoading: false });
            throw err;
        }
    },

    /**
     * Fetch all active stores.
     * @param {string} [type] — "marketplace" | "business"
     */
    fetchStores: async (type) => {
        set({ storesLoading: true, error: null });
        try {
            const qs = type ? `?type=${encodeURIComponent(type)}` : '';
            const stores = await apiFetch(`/marketplace/stores${qs}`);
            set({ stores: stores || [], storesLoading: false });
            return stores;
        } catch (err) {
            set({ error: err.message, storesLoading: false });
            throw err;
        }
    },

    /**
     * Get a single product's full detail.
     */
    fetchProduct: async (productId) => {
        return apiFetch(`/marketplace/products/${productId}`);
    },

    /**
     * Get a single store's detail.
     */
    fetchStore: async (storeId) => {
        return apiFetch(`/marketplace/stores/${storeId}`);
    },

    // ── Reset ──────────────────────────────────────────────────────────────────
    resetMarketplaceState: () => {
        set({ products: [], stores: [], productsLoading: false, storesLoading: false, error: null });
    },
}));