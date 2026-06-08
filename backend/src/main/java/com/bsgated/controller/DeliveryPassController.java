// src/main/java/com/bsgated/controller/DeliveryPassController.java
package com.bsgated.controller;

import com.bsgated.dto.CreateDeliveryPassRequest;
import com.bsgated.dto.VerifyDeliveryOtpRequest;
import com.bsgated.model.DeliveryPass;
import com.bsgated.service.DeliveryPassService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryPassController {

    private final DeliveryPassService service;

    public DeliveryPassController(DeliveryPassService service) {
        this.service = service;
    }

    /**
     * POST /api/deliveries Resident creates a pass. Backend generates OTP.
     * Returns full pass with OTP.
     *
     * Body: { hostResidentId, hostResidentName, hostUnit, provider,
     * expectedWindow, deliveryPersonName?, deliveryPersonPhone? }
     */
    @PostMapping
    public ResponseEntity<DeliveryPass> create(@Valid @RequestBody CreateDeliveryPassRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    /**
     * GET /api/deliveries/my/{residentId} Resident fetches all their own
     * passes.
     */
    @GetMapping("/my/{residentId}")
    public ResponseEntity<List<DeliveryPass>> getMyPasses(@PathVariable String residentId) {
        return ResponseEntity.ok(service.getByCurrentResident());
    }

    @GetMapping("/my")
    public ResponseEntity<List<DeliveryPass>> getMyPasses() {
        return ResponseEntity.ok(service.getByCurrentResident());
    }

    /**
     * GET /api/deliveries/pending Guard fetches all PENDING passes to display
     * on their screen.
     */
    @GetMapping("/pending")
    public ResponseEntity<List<DeliveryPass>> getPending() {
        return ResponseEntity.ok(service.getPending());
    }

    /**
     * POST /api/deliveries/verify-otp Guard enters OTP → backend verifies →
     * returns delivery details.
     *
     * Body: { otp, guardId }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyDeliveryOtpRequest req) {
        return service.verifyOtp(req)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid OTP or pass already verified/cancelled")));
    }

    /**
     * PUT /api/deliveries/{id}/delivered Guard marks delivery complete and
     * person exited.
     *
     * Body: { guardId }
     */
    @PutMapping("/{id}/delivered")
    public ResponseEntity<?> markDelivered(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return service.markDelivered(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest()
                        .body(Map.of("message", "Pass not found or not in OTP_VERIFIED state")));
    }

    /**
     * PUT /api/deliveries/{id}/cancel Resident cancels a PENDING pass.
     *
     * Body: { residentId }
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return service.cancel(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest()
                        .body(Map.of("message", "Pass not found, already processed, or not your pass")));
    }
}
