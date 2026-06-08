// // src/main/java/com/bsgated/controller/RealEstateListingController.java
// package com.bsgated.controller;

// import com.bsgated.model.RealEstateListing;
// import com.bsgated.payload.CreateRealEstateListingRequest;
// import com.bsgated.service.RealEstateListingService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;

// @RestController
// @CrossOrigin(origins = "*")
// public class RealEstateListingController {

//     @Autowired
//     private RealEstateListingService service;

//     // ════════════════════════════════════════════════════════════════════════
//     //  RESIDENT ENDPOINTS  — /api/real-estate/**
//     // ════════════════════════════════════════════════════════════════════════

//     /**
//      * POST /api/real-estate/listings
//      * Resident submits a new listing.
//      * - First listing → PENDING_APPROVAL  (response: isFirstListing = true)
//      * - Subsequent   → ACTIVE immediately (response: isFirstListing = false)
//      */
//     @PostMapping(value = "/api/real-estate/listings", produces = "application/json")
//     public ResponseEntity<?> createListing(@RequestBody CreateRealEstateListingRequest req) {
//         if (req.getOwnerId() == null || req.getOwnerId().isBlank()) {
//             return badRequest("ownerId is required.");
//         }
//         if (req.getTitle() == null || req.getTitle().isBlank()) {
//             return badRequest("title is required.");
//         }
//         if (req.getPrice() == null) {
//             return badRequest("price is required.");
//         }
//         RealEstateListing listing = service.createListing(req);
//         return ResponseEntity.status(201).body(listing);
//     }

//     /**
//      * GET /api/real-estate/listings/active
//      * Returns all ACTIVE listings for the Browse tab.
//      */
//     @GetMapping(value = "/api/real-estate/listings/active", produces = "application/json")
//     public List<RealEstateListing> getActiveListings() {
//         return service.getActiveListings();
//     }

//     /**
//      * GET /api/real-estate/listings/my?ownerId=res1
//      * Returns all listings (any status) submitted by this resident.
//      */
//     @GetMapping(value = "/api/real-estate/listings/my", produces = "application/json")
//     public ResponseEntity<?> getMyListings(@RequestParam String ownerId) {
//         if (ownerId == null || ownerId.isBlank()) {
//             return badRequest("ownerId is required.");
//         }
//         return ResponseEntity.ok(service.getMyListings(ownerId));
//     }

//     /**
//      * PATCH /api/real-estate/listings/{id}/status
//      * Resident closes their own listing: SOLD / RENTED / WITHDRAWN.
//      * Body: { "status": "SOLD", "ownerId": "res1" }
//      */
//     @PatchMapping(value = "/api/real-estate/listings/{id}/status", produces = "application/json")
//     public ResponseEntity<?> updateStatus(
//             @PathVariable Long id,
//             @RequestBody Map<String, String> body) {

//         String ownerId   = body.get("ownerId");
//         String newStatus = body.get("status");

//         if (ownerId == null || newStatus == null) {
//             return badRequest("ownerId and status are required.");
//         }
//         List<String> allowed = List.of("SOLD", "RENTED", "WITHDRAWN");
//         if (!allowed.contains(newStatus)) {
//             return badRequest("status must be one of: SOLD, RENTED, WITHDRAWN.");
//         }

//         return service.updateStatus(id, ownerId, newStatus)
//                 .map(ResponseEntity::ok)
//                 .orElse(ResponseEntity.notFound().build());
//     }

//     /**
//      * POST /api/real-estate/listings/{id}/view
//      * Increments the view counter when a resident opens a listing detail.
//      */
//     @PostMapping(value = "/api/real-estate/listings/{id}/view", produces = "application/json")
//     public ResponseEntity<?> incrementView(@PathVariable Long id) {
//         service.incrementViews(id);
//         Map<String, String> resp = new HashMap<>();
//         resp.put("message", "View recorded.");
//         return ResponseEntity.ok(resp);
//     }

//     // ════════════════════════════════════════════════════════════════════════
//     //  ADMIN ENDPOINTS  — /api/admin/real-estate/**
//     // ════════════════════════════════════════════════════════════════════════

//     /**
//      * GET /api/admin/real-estate/listings
//      * Returns all listings for the admin panel.
//      * Optional ?status=PENDING_APPROVAL filter.
//      */
//     @GetMapping(value = "/api/admin/real-estate/listings", produces = "application/json")
//     public List<RealEstateListing> adminGetAllListings(
//             @RequestParam(required = false) String status) {
//         if (status != null && !status.isBlank()) {
//             return service.getListingsByStatus(status);
//         }
//         return service.getAllListings();
//     }

//     /**
//      * POST /api/admin/real-estate/listings/{id}/approve
//      * Admin approves a pending listing → status becomes ACTIVE.
//      * Param: adminId (Long)
//      */
//     @PostMapping(value = "/api/admin/real-estate/listings/{id}/approve", produces = "application/json")
//     public ResponseEntity<?> approveListing(
//             @PathVariable Long id,
//             @RequestParam Long adminId) {

//         return service.approveListing(id, adminId)
//                 .map(ResponseEntity::ok)
//                 .orElse(ResponseEntity.notFound().build());
//     }

//     /**
//      * POST /api/admin/real-estate/listings/{id}/reject
//      * Admin rejects a pending listing → status becomes REJECTED.
//      * Body: { "reason": "Incomplete information" }  (optional)
//      * Param: adminId (Long)
//      */
//     @PostMapping(value = "/api/admin/real-estate/listings/{id}/reject", produces = "application/json")
//     public ResponseEntity<?> rejectListing(
//             @PathVariable Long id,
//             @RequestParam Long adminId,
//             @RequestBody(required = false) Map<String, String> body) {

//         String reason = (body != null) ? body.getOrDefault("reason", "") : "";
//         return service.rejectListing(id, adminId, reason)
//                 .map(ResponseEntity::ok)
//                 .orElse(ResponseEntity.notFound().build());
//     }

//     // ── Helper ─────────────────────────────────────────────────────────────

//     private ResponseEntity<Map<String, String>> badRequest(String message) {
//         Map<String, String> err = new HashMap<>();
//         err.put("message", message);
//         return ResponseEntity.badRequest().body(err);
//     }
// }






























package com.bsgated.controller;

import com.bsgated.exception.ApiException;
import com.bsgated.model.RealEstateListing;
import com.bsgated.payload.CreateRealEstateListingRequest;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.bsgated.service.RealEstateListingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Real Estate Listing endpoints.
 *
 * Resident endpoints  → /api/real-estate/**       (SecurityConfig: RESIDENT)
 * Admin endpoints     → /api/admin/real-estate/**  (SecurityConfig: ADMIN | SUPER_ADMIN)
 *
 * Owner identity and admin identity are extracted from JWT via CurrentUser.get().
 * No ownerId or adminId params — those were a pre-security pattern and are removed.
 */
@RestController
public class RealEstateListingController {

    private final RealEstateListingService service;

    public RealEstateListingController(RealEstateListingService service) {
        this.service = service;
    }

    // ── Resident endpoints ────────────────────────────────────────────────────

    @PostMapping(value = "/api/real-estate/listings", produces = "application/json")
    public ResponseEntity<?> createListing(@RequestBody CreateRealEstateListingRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            return badRequest("title is required.");
        }
        if (req.getPrice() == null) {
            return badRequest("price is required.");
        }
        // ownerId injected from JWT inside service
        RealEstateListing listing = service.createListing(req);
        return ResponseEntity.status(201).body(listing);
    }

    @GetMapping(value = "/api/real-estate/listings/active", produces = "application/json")
    public List<RealEstateListing> getActiveListings() {
        return service.getActiveListings();
    }

    /**
     * Resident fetches their own listings.
     * ownerId from JWT — no query param to prevent IDOR.
     */
    @GetMapping(value = "/api/real-estate/listings/my", produces = "application/json")
    public ResponseEntity<?> getMyListings() {
        AuthenticatedUser currentUser = CurrentUser.get();
        return ResponseEntity.ok(service.getMyListings(String.valueOf(currentUser.id())));
    }

    /**
     * Resident updates status of their own listing.
     * Ownership validated inside service using JWT identity.
     * ownerId in body is removed — never trusted from frontend.
     */
    @PatchMapping(value = "/api/real-estate/listings/{id}/status", produces = "application/json")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null) {
            return badRequest("status is required.");
        }
        List<String> allowed = List.of("SOLD", "RENTED", "WITHDRAWN");
        if (!allowed.contains(newStatus)) {
            return badRequest("status must be one of: SOLD, RENTED, WITHDRAWN.");
        }
        // ownerId injected from JWT inside service
        return service.updateStatus(id, newStatus)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/api/real-estate/listings/{id}/view", produces = "application/json")
    public ResponseEntity<?> incrementView(@PathVariable Long id) {
        service.incrementViews(id);
        return ResponseEntity.ok(Map.of("message", "View recorded."));
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    @GetMapping(value = "/api/admin/real-estate/listings", produces = "application/json")
    public List<RealEstateListing> adminGetAllListings(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return service.getListingsByStatus(status);
        }
        return service.getAllListings();
    }

    /**
     * Admin approves a pending listing.
     * Admin identity from JWT — no adminId query param.
     */
    @PostMapping(value = "/api/admin/real-estate/listings/{id}/approve", produces = "application/json")
    public ResponseEntity<?> approveListing(@PathVariable Long id) {
        return service.approveListing(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Admin rejects a pending listing.
     * Admin identity from JWT — no adminId query param.
     */
    @PostMapping(value = "/api/admin/real-estate/listings/{id}/reject", produces = "application/json")
    public ResponseEntity<?> rejectListing(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null) ? body.getOrDefault("reason", "") : "";
        return service.rejectListing(id, reason)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private ResponseEntity<Map<String, String>> badRequest(String message) {
        Map<String, String> err = new HashMap<>();
        err.put("message", message);
        return ResponseEntity.badRequest().body(err);
    }
}