package com.bsgated.service;

import com.bsgated.dto.VendorStoreRequest;
import com.bsgated.dto.VendorStoreUpdateRequest;
import com.bsgated.exception.ApiException;
import com.bsgated.model.User;
import com.bsgated.model.VendorStore;
import com.bsgated.repository.UserRepository;
import com.bsgated.repository.VendorStoreRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VendorStoreService {

    private final VendorStoreRepository storeRepo;
    private final UserRepository userRepo;
    private final AuditService auditService;

    public VendorStoreService(VendorStoreRepository storeRepo,
                              UserRepository userRepo,
                              AuditService auditService) {
        this.storeRepo    = storeRepo;
        this.userRepo     = userRepo;
        this.auditService = auditService;
    }

    // ── Vendor: create ────────────────────────────────────────────────────────

    @Transactional
    public VendorStore createStore(VendorStoreRequest req) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        if (storeRepo.findByVendorId(actor.id()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "You already have a store. Use PUT /api/vendor/store to update it.");
        }

        User user = userRepo.findById(actor.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        VendorStore store = new VendorStore();
        store.setVendorId(actor.id());
        store.setVendorType(user.getVendorType() != null ? user.getVendorType() : "marketplace");
        applyRequest(store, req);

        VendorStore saved = storeRepo.save(store);
        auditService.record("STORE_CREATED", "VENDOR_STORE", String.valueOf(saved.getId()), "Vendor created store: " + saved.getStoreName());
        return saved;
    }

    // ── Vendor: read own store ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public VendorStore getMyStore() {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);
        return storeRepo.findByVendorId(actor.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "You don't have a store yet. Use POST /api/vendor/store to create one."));
    }

    // ── Vendor: update ────────────────────────────────────────────────────────

    @Transactional
    public VendorStore updateStore(VendorStoreUpdateRequest req) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        VendorStore store = storeRepo.findByVendorId(actor.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Store not found. Create one first."));

        applyUpdate(store, req);
        VendorStore saved = storeRepo.save(store);
        auditService.record("STORE_UPDATED", "VENDOR_STORE", String.valueOf(saved.getId()), "Vendor updated store");
        return saved;
    }

    // ── Vendor: deactivate (soft delete) ─────────────────────────────────────

    @Transactional
    public void deactivateStore() {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        VendorStore store = storeRepo.findByVendorId(actor.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Store not found."));

        store.setActive(false);
        storeRepo.save(store);
        auditService.record("STORE_DEACTIVATED", "VENDOR_STORE", String.valueOf(store.getId()), "Vendor deactivated store");
    }

    // ── Resident / Public: browse active stores ───────────────────────────────

    @Transactional(readOnly = true)
    public List<VendorStore> getAllActiveStores() {
        return storeRepo.findAllActiveStores();
    }

    @Transactional(readOnly = true)
    public List<VendorStore> getActiveStoresByType(String vendorType) {
        return storeRepo.findActiveStoresByType(vendorType);
    }

    @Transactional(readOnly = true)
    public VendorStore getStoreById(Long storeId) {
        return storeRepo.findById(storeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Store not found."));
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private void ensureVendorRole(AuthenticatedUser actor) {
        String role = actor.role();
        if (!"VENDOR".equalsIgnoreCase(role)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only vendors can manage stores.");
        }
    }

    /** Apply all non-null fields from a create request to a new VendorStore */
    private void applyRequest(VendorStore store, VendorStoreRequest req) {
        store.setStoreName(req.getStoreName().trim());
        if (req.getDescription()            != null) store.setDescription(req.getDescription());
        if (req.getCategory()               != null) store.setCategory(req.getCategory());
        if (req.getSubcategory()            != null) store.setSubcategory(req.getSubcategory());
        if (req.getLogoUrl()                != null) store.setLogoUrl(req.getLogoUrl());
        if (req.getBannerUrl()              != null) store.setBannerUrl(req.getBannerUrl());
        if (req.getContactPhone()           != null) store.setContactPhone(req.getContactPhone());
        if (req.getAddress()                != null) store.setAddress(req.getAddress());
        if (req.getTimingsJson()            != null) store.setTimingsJson(req.getTimingsJson());
        if (req.getVacationMode()           != null) store.setVacationMode(req.getVacationMode());

        // marketplace
        if (req.getDeliveryRadiusKm()       != null) store.setDeliveryRadiusKm(req.getDeliveryRadiusKm());
        if (req.getDeliveryCharge()         != null) store.setDeliveryCharge(req.getDeliveryCharge());
        if (req.getMinOrderAmount()         != null) store.setMinOrderAmount(req.getMinOrderAmount());
        if (req.getDeliveryMode()           != null) store.setDeliveryMode(req.getDeliveryMode());
        if (req.getEstimatedDeliveryTime()  != null) store.setEstimatedDeliveryTime(req.getEstimatedDeliveryTime());

        // business
        if (req.getServiceRadiusKm()        != null) store.setServiceRadiusKm(req.getServiceRadiusKm());
        if (req.getServiceMode()            != null) store.setServiceMode(req.getServiceMode());
        if (req.getAppointmentSlotsJson()   != null) store.setAppointmentSlotsJson(req.getAppointmentSlotsJson());
    }

    /** Apply all non-null fields from an update request to an existing VendorStore */
    private void applyUpdate(VendorStore store, VendorStoreUpdateRequest req) {
        if (req.getStoreName()              != null) store.setStoreName(req.getStoreName().trim());
        if (req.getDescription()            != null) store.setDescription(req.getDescription());
        if (req.getCategory()               != null) store.setCategory(req.getCategory());
        if (req.getSubcategory()            != null) store.setSubcategory(req.getSubcategory());
        if (req.getLogoUrl()                != null) store.setLogoUrl(req.getLogoUrl());
        if (req.getBannerUrl()              != null) store.setBannerUrl(req.getBannerUrl());
        if (req.getContactPhone()           != null) store.setContactPhone(req.getContactPhone());
        if (req.getAddress()                != null) store.setAddress(req.getAddress());
        if (req.getTimingsJson()            != null) store.setTimingsJson(req.getTimingsJson());
        if (req.getVacationMode()           != null) store.setVacationMode(req.getVacationMode());

        // marketplace
        if (req.getDeliveryRadiusKm()       != null) store.setDeliveryRadiusKm(req.getDeliveryRadiusKm());
        if (req.getDeliveryCharge()         != null) store.setDeliveryCharge(req.getDeliveryCharge());
        if (req.getMinOrderAmount()         != null) store.setMinOrderAmount(req.getMinOrderAmount());
        if (req.getDeliveryMode()           != null) store.setDeliveryMode(req.getDeliveryMode());
        if (req.getEstimatedDeliveryTime()  != null) store.setEstimatedDeliveryTime(req.getEstimatedDeliveryTime());

        // business
        if (req.getServiceRadiusKm()        != null) store.setServiceRadiusKm(req.getServiceRadiusKm());
        if (req.getServiceMode()            != null) store.setServiceMode(req.getServiceMode());
        if (req.getAppointmentSlotsJson()   != null) store.setAppointmentSlotsJson(req.getAppointmentSlotsJson());
    }
}
