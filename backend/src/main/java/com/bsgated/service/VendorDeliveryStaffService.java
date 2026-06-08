package com.bsgated.service;

import com.bsgated.dto.VendorDeliveryStaffRequest;
import com.bsgated.dto.VendorDeliveryStaffResponse;
import com.bsgated.dto.VendorDeliveryStaffWithStatusResponse;
import com.bsgated.exception.ApiException;
import com.bsgated.model.MarketplaceOrder;
import com.bsgated.model.VendorDeliveryStaff;
import com.bsgated.repository.MarketplaceOrderRepository;
import com.bsgated.repository.VendorDeliveryStaffRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class VendorDeliveryStaffService {

    private final VendorDeliveryStaffRepository staffRepo;
    private final AuditService auditService;
    private final MarketplaceOrderRepository orderRepo;

    public VendorDeliveryStaffService(
            VendorDeliveryStaffRepository staffRepo,
            AuditService auditService,
            MarketplaceOrderRepository orderRepo) {
        this.staffRepo = staffRepo;
        this.auditService = auditService;
        this.orderRepo = orderRepo;
    }

    // ── Add new delivery helper ───────────────────────────────────────────────
    @Transactional
    public VendorDeliveryStaffResponse addStaff(VendorDeliveryStaffRequest req) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        VendorDeliveryStaff staff = new VendorDeliveryStaff();
        staff.setVendorId(actor.id());
        staff.setName(req.getName().trim());
        staff.setPhone(req.getPhone().trim());
        staff.setVehicleType(req.getVehicleType() != null ? req.getVehicleType().trim() : null);
        staff.setActive(req.getActive() != null ? req.getActive() : true);

        VendorDeliveryStaff saved = staffRepo.save(staff);
        auditService.record("DELIVERY_STAFF_ADDED", "VENDOR_DELIVERY_STAFF",
                String.valueOf(saved.getId()),
                "Vendor=" + actor.id() + " | Helper=" + saved.getName());
        return VendorDeliveryStaffResponse.from(saved);
    }

    // ── Get all helpers for logged-in vendor ──────────────────────────────────
    @Transactional(readOnly = true)
    public List<VendorDeliveryStaffResponse> getMyStaff() {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        return staffRepo.findByVendorIdOrderByCreatedAtDesc(actor.id())
                .stream()
                .map(VendorDeliveryStaffResponse::from)
                .collect(Collectors.toList());
    }

    // ── Get only ACTIVE helpers (used in assign-delivery dropdown) ────────────
    @Transactional(readOnly = true)
    public List<VendorDeliveryStaffResponse> getMyActiveStaff() {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        return staffRepo.findByVendorIdAndActiveTrueOrderByNameAsc(actor.id())
                .stream()
                .map(VendorDeliveryStaffResponse::from)
                .collect(Collectors.toList());
    }

    // ── Update helper ─────────────────────────────────────────────────────────
    @Transactional
    public VendorDeliveryStaffResponse updateStaff(Long staffId, VendorDeliveryStaffRequest req) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        VendorDeliveryStaff staff = getOwnedStaff(staffId, actor.id());

        if (req.getName() != null) {
            staff.setName(req.getName().trim());
        }
        if (req.getPhone() != null) {
            staff.setPhone(req.getPhone().trim());
        }
        if (req.getVehicleType() != null) {
            staff.setVehicleType(req.getVehicleType().trim());
        }
        if (req.getActive() != null) {
            staff.setActive(req.getActive());
        }

        VendorDeliveryStaff saved = staffRepo.save(staff);
        auditService.record("DELIVERY_STAFF_UPDATED", "VENDOR_DELIVERY_STAFF",
                String.valueOf(saved.getId()), "Updated by vendor=" + actor.id());
        return VendorDeliveryStaffResponse.from(saved);
    }

    // ── Soft delete / deactivate ──────────────────────────────────────────────
    @Transactional
    public void deleteStaff(Long staffId) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        VendorDeliveryStaff staff = getOwnedStaff(staffId, actor.id());
        staff.setActive(false);
        staffRepo.save(staff);

        auditService.record("DELIVERY_STAFF_DEACTIVATED", "VENDOR_DELIVERY_STAFF",
                String.valueOf(staffId), "Deactivated by vendor=" + actor.id());
    }

    // ── Toggle active / inactive ──────────────────────────────────────────────
    @Transactional
    public VendorDeliveryStaffResponse toggleActive(Long staffId) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        VendorDeliveryStaff staff = getOwnedStaff(staffId, actor.id());
        staff.setActive(!staff.isActive());

        VendorDeliveryStaff saved = staffRepo.save(staff);
        auditService.record("DELIVERY_STAFF_TOGGLED", "VENDOR_DELIVERY_STAFF",
                String.valueOf(saved.getId()), "Active=" + saved.isActive());
        return VendorDeliveryStaffResponse.from(saved);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────
    /**
     * Used by MarketplaceOrderService to validate that the helper belongs to
     * the vendor and is active before assigning to an order.
     */
    @Transactional(readOnly = true)
    public VendorDeliveryStaff getActiveStaffForVendor(Long staffId, Long vendorId) {
        VendorDeliveryStaff staff = staffRepo.findByIdAndVendorId(staffId, vendorId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                "Delivery helper not found or does not belong to your store."));

        if (!staff.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "This delivery helper is inactive and cannot be assigned to orders. Enable them first.");
        }
        return staff;
    }

    private VendorDeliveryStaff getOwnedStaff(Long staffId, Long vendorId) {
        return staffRepo.findByIdAndVendorId(staffId, vendorId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                "Delivery helper not found or does not belong to your store."));
    }

    private void ensureVendorRole(AuthenticatedUser actor) {
        if (!"VENDOR".equalsIgnoreCase(actor.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only vendors can manage delivery staff.");
        }
    }

    /**
     * // * Returns active helpers with busy=true/false. // * A helper is busy
     * if they have an in-progress marketplace order. // * In-progress = status
     * in { assigned_delivery, out_for_delivery } //
     */
     @Transactional(readOnly = true)
    public List<VendorDeliveryStaffWithStatusResponse> getMyActiveStaffWithStatus() {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);
 
        List<VendorDeliveryStaff> activeStaff =
                staffRepo.findByVendorIdAndActiveTrueOrderByNameAsc(actor.id());
 
        Set<Long> busyStaffIds = orderRepo
                .findByVendorIdAndStatusIn(actor.id(),
                        java.util.List.of("assigned_delivery", "out_for_delivery"))
                .stream()
                .map(com.bsgated.model.MarketplaceOrder::getAssignedDeliveryStaffId)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());
 
        return activeStaff.stream()
                .map(s -> VendorDeliveryStaffWithStatusResponse.from(s, busyStaffIds.contains(s.getId())))
                .collect(java.util.stream.Collectors.toList());
    }
}
