package com.bsgated.controller;

import com.bsgated.dto.VendorStoreRequest;
import com.bsgated.dto.VendorStoreUpdateRequest;
import com.bsgated.model.VendorStore;
import com.bsgated.service.VendorStoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Vendor-facing store management.
 * All endpoints require ROLE_VENDOR + approved account (enforced by ApprovalRequiredFilter).
 *
 * POST   /api/vendor/store          — create store (once per vendor)
 * GET    /api/vendor/store          — get my store
 * PUT    /api/vendor/store          — update my store
 * DELETE /api/vendor/store          — deactivate my store (soft delete)
 */
@RestController
@RequestMapping("/api/vendor/store")
public class VendorStoreController {

    private final VendorStoreService service;

    public VendorStoreController(VendorStoreService service) {
        this.service = service;
    }

    @PostMapping(produces = "application/json")
    public ResponseEntity<VendorStore> createStore(@Valid @RequestBody VendorStoreRequest req) {
        VendorStore store = service.createStore(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(store);
    }

    @GetMapping(produces = "application/json")
    public ResponseEntity<VendorStore> getMyStore() {
        return ResponseEntity.ok(service.getMyStore());
    }

    @PutMapping(produces = "application/json")
    public ResponseEntity<VendorStore> updateStore(@Valid @RequestBody VendorStoreUpdateRequest req) {
        return ResponseEntity.ok(service.updateStore(req));
    }

    @DeleteMapping(produces = "application/json")
    public ResponseEntity<Map<String, String>> deactivateStore() {
        service.deactivateStore();
        return ResponseEntity.ok(Map.of("message", "Store deactivated successfully."));
    }
}
