package com.bsgated.controller;

import com.bsgated.dto.GuestParkingApprovalDto;
import com.bsgated.dto.GuestParkingOtpVerifyDto;
import com.bsgated.dto.GuestParkingRequestDto;
import com.bsgated.dto.GuestParkingResponseDto;
import com.bsgated.model.GuestParkingStatus;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.bsgated.service.GuestParkingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * GuestParkingController — fully secured.
 *
 * Security enforced at two levels:
 *   1. SecurityConfig: role-based access per endpoint group.
 *   2. Service layer: ownership validation (resident sees own requests only).
 *
 * Identity always from JWT via CurrentUser.get() — never from request body or path variables.
 *
 * Endpoint map:
 *
 * RESIDENT:
 *   POST   /api/guest-parking            — create request (residentId from JWT)
 *   GET    /api/guest-parking/my         — view own requests (no residentId path var → prevents IDOR)
 *   GET    /api/guest-parking/{id}       — view single request (ownership validated in service)
 *
 * ADMIN | SUPER_ADMIN:
 *   GET    /api/admin/guest-parking      — view all requests, optional ?status=PENDING
 *   PUT    /api/admin/guest-parking/{id}/approve  — approve request
 *   PUT    /api/admin/guest-parking/{id}/reject   — reject request
 *
 * SECURITY (guard):
 *   POST   /api/guest-parking/guard/verify-otp    — verify OTP → mark ACTIVE
 *   PUT    /api/guest-parking/guard/{id}/expire   — mark EXPIRED
 */
@RestController
public class GuestParkingController {

    private final GuestParkingService service;

    public GuestParkingController(GuestParkingService service) {
        this.service = service;
    }

    // ══════════════════════════════════════════════════════════════════
    //  RESIDENT ENDPOINTS
    // ══════════════════════════════════════════════════════════════════

    /**
     * POST /api/guest-parking
     * Resident submits a new guest parking request.
     * residentId, residentName injected from JWT inside service — never trusted from body.
     * SecurityConfig enforces hasRole("RESIDENT").
     */
    @PostMapping("/api/guest-parking")
    public ResponseEntity<GuestParkingResponseDto> createRequest(
            @Valid @RequestBody GuestParkingRequestDto dto) {
        GuestParkingResponseDto response = service.createRequest(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/guest-parking/my
     * Resident fetches their own parking requests.
     * residentId comes from JWT — no path variable to prevent IDOR.
     * SecurityConfig enforces hasRole("RESIDENT").
     */
    @GetMapping("/api/guest-parking/my")
    public ResponseEntity<List<GuestParkingResponseDto>> getMyRequests() {
        AuthenticatedUser currentUser = CurrentUser.get();
        return ResponseEntity.ok(service.getByResident(String.valueOf(currentUser.id())));
    }

    /**
     * GET /api/guest-parking/{id}
     * Resident fetches a single request.
     * Ownership validated inside service.
     * SecurityConfig enforces authenticated.
     */
    @GetMapping("/api/guest-parking/{id}")
    public ResponseEntity<GuestParkingResponseDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // ══════════════════════════════════════════════════════════════════
    //  ADMIN ENDPOINTS
    // ══════════════════════════════════════════════════════════════════

    /**
     * GET /api/admin/guest-parking
     * Admin views all requests, optionally filtered by ?status=PENDING.
     * Admin identity from JWT — no adminId param.
     * SecurityConfig enforces hasAnyRole("ADMIN", "SUPER_ADMIN").
     */
    @GetMapping("/api/admin/guest-parking")
    public ResponseEntity<List<GuestParkingResponseDto>> adminGetAll(
            @RequestParam(required = false) GuestParkingStatus status) {
        return ResponseEntity.ok(service.getAll(status));
    }

    /**
     * PUT /api/admin/guest-parking/{id}/approve
     * Admin approves a pending request.
     * Admin identity from JWT — no adminId param.
     * SecurityConfig enforces hasAnyRole("ADMIN", "SUPER_ADMIN").
     */
    @PutMapping("/api/admin/guest-parking/{id}/approve")
    public ResponseEntity<GuestParkingResponseDto> approve(
            @PathVariable String id,
            @RequestBody(required = false) GuestParkingApprovalDto dto) {
        if (dto == null) {
            dto = new GuestParkingApprovalDto();
        }
        return ResponseEntity.ok(service.approve(id, dto));
    }

    /**
     * PUT /api/admin/guest-parking/{id}/reject
     * Admin rejects a pending request.
     * Admin identity from JWT — no adminId param.
     * SecurityConfig enforces hasAnyRole("ADMIN", "SUPER_ADMIN").
     */
    @PutMapping("/api/admin/guest-parking/{id}/reject")
    public ResponseEntity<GuestParkingResponseDto> reject(@PathVariable String id) {
        return ResponseEntity.ok(service.reject(id));
    }

    // ══════════════════════════════════════════════════════════════════
    //  SECURITY GUARD ENDPOINTS
    // ══════════════════════════════════════════════════════════════════

    /**
     * POST /api/guest-parking/guard/verify-otp
     * Guard verifies OTP → marks parking ACTIVE.
     * Guard identity (id, name) extracted from JWT — NOT from request body.
     * SecurityConfig enforces hasRole("SECURITY").
     */
    @PostMapping("/api/guest-parking/guard/verify-otp")
    public ResponseEntity<GuestParkingResponseDto> verifyOtp(
            @Valid @RequestBody GuestParkingOtpVerifyDto dto) {
        return ResponseEntity.ok(service.verifyOtpAndActivate(dto));
    }

    /**
     * PUT /api/guest-parking/guard/{id}/expire
     * Guard marks a parking session as EXPIRED.
     * Guard identity from JWT — no guardId body param.
     * SecurityConfig enforces hasRole("SECURITY").
     */
    @PutMapping("/api/guest-parking/guard/{id}/expire")
    public ResponseEntity<GuestParkingResponseDto> expire(@PathVariable String id) {
        return ResponseEntity.ok(service.markExpired(id));
    }
}