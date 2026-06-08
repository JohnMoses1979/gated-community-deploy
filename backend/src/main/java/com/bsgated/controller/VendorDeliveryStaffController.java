package com.bsgated.controller;

import com.bsgated.dto.VendorDeliveryStaffRequest;
import com.bsgated.dto.VendorDeliveryStaffResponse;
import com.bsgated.dto.VendorDeliveryStaffWithStatusResponse;
import com.bsgated.service.VendorDeliveryStaffService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Vendor Delivery Staff management.
 *
 * All endpoints require ROLE_VENDOR + approved account. Delivery helpers are
 * NOT platform users — no login, no JWT. They are purely operational records
 * maintained by vendor.
 *
 * POST /api/vendor/delivery-staff — add helper GET /api/vendor/delivery-staff —
 * list all helpers (active + inactive) GET /api/vendor/delivery-staff/active —
 * list only active helpers (for assign dropdown) PUT
 * /api/vendor/delivery-staff/{id} — update helper DELETE
 * /api/vendor/delivery-staff/{id} — soft deactivate helper PATCH
 * /api/vendor/delivery-staff/{id}/toggle — enable / disable helper
 */
@RestController
@RequestMapping("/api/vendor/delivery-staff")
public class VendorDeliveryStaffController {

    private final VendorDeliveryStaffService service;

    public VendorDeliveryStaffController(VendorDeliveryStaffService service) {
        this.service = service;
    }

    /**
     * Add a new delivery helper to my roster
     */
    @PostMapping(produces = "application/json")
    public ResponseEntity<VendorDeliveryStaffResponse> addStaff(
            @Valid @RequestBody VendorDeliveryStaffRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addStaff(req));
    }

    /**
     * List ALL helpers (active + inactive) for the logged-in vendor
     */
    @GetMapping(produces = "application/json")
    public ResponseEntity<List<VendorDeliveryStaffResponse>> getMyStaff() {
        return ResponseEntity.ok(service.getMyStaff());
    }

    /**
     * List only ACTIVE helpers — used in assign-delivery screen dropdown
     */
    @GetMapping(value = "/active", produces = "application/json")
    public ResponseEntity<List<VendorDeliveryStaffResponse>> getMyActiveStaff() {
        return ResponseEntity.ok(service.getMyActiveStaff());
    }

    /**
     * Update helper details
     */
    @PutMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<VendorDeliveryStaffResponse> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody VendorDeliveryStaffRequest req) {
        return ResponseEntity.ok(service.updateStaff(id, req));
    }

    /**
     * Soft-deactivate a helper (does not delete from DB, preserves order
     * history)
     */
    @DeleteMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Map<String, String>> deleteStaff(@PathVariable Long id) {
        service.deleteStaff(id);
        return ResponseEntity.ok(Map.of("message", "Delivery helper deactivated successfully."));
    }

    /**
     * Toggle helper active/inactive
     */
    @PatchMapping(value = "/{id}/toggle", produces = "application/json")
    public ResponseEntity<VendorDeliveryStaffResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleActive(id));
    }

    /**
     * // * List only ACTIVE helpers WITH busy status (used in assign-delivery
     * dropdown). // * A helper is BUSY if they have an order currently in: 
     * assigned_delivery | out_for_delivery 
     */
    @GetMapping(value = "/active/with-status", produces = "application/json")
    public ResponseEntity<List<VendorDeliveryStaffWithStatusResponse>> getMyActiveStaffWithStatus() {
        return ResponseEntity.ok(service.getMyActiveStaffWithStatus());
    }
}
