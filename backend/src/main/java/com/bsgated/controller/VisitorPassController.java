// package com.bsgated.controller;
// import com.bsgated.model.VisitorPass;
// import com.bsgated.service.VisitorPassService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;
// import java.util.Map;
// @RestController
// @RequestMapping("/api/visitor")
// @CrossOrigin(origins = "*")
// public class VisitorPassController {
//     @Autowired
//     private VisitorPassService visitorPassService;
//     // POST /api/visitor/create
//     // Body: { visitorName, visitorPhone, purpose, vehicleNumber, hostUnit, hostResidentId, hostResidentName }
//     @PostMapping("/create")
//     public ResponseEntity<VisitorPass> createPass(@RequestBody VisitorPass pass) {
//         VisitorPass created = visitorPassService.createVisitorPass(pass);
//         return ResponseEntity.ok(created);
//     }
//     // GET /api/visitor/resident/{residentId}
//     @GetMapping("/resident/{residentId}")
//     public ResponseEntity<List<VisitorPass>> getPassesByResident(@PathVariable Long residentId) {
//         return ResponseEntity.ok(visitorPassService.getPassesByResident(residentId));
//     }
//     // GET /api/visitor/all  (Guard sees all)
//     @GetMapping("/all")
//     public ResponseEntity<List<VisitorPass>> getAllPasses() {
//         return ResponseEntity.ok(visitorPassService.getAllPasses());
//     }
//     // POST /api/visitor/verify-otp
//     // Body: { otp: "123456" }
//     @PostMapping("/verify-otp")
//     public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
//         String otp = body.get("otp");
//         return visitorPassService.verifyOtp(otp)
//                 .map(pass -> ResponseEntity.ok((Object) pass))
//                 .orElse(ResponseEntity.status(404).body(Map.of("message", "Invalid or expired OTP")));
//     }
//     // POST /api/visitor/checkin/{passId}
//     // Body: { guardId, guardName, gate }
//     @PostMapping("/checkin/{passId}")
//     public ResponseEntity<?> checkIn(
//             @PathVariable Long passId,
//             @RequestBody Map<String, String> body) {
//         Long guardId = body.containsKey("guardId") ? Long.parseLong(body.get("guardId")) : 0L;
//         String guardName = body.getOrDefault("guardName", "Guard");
//         String gate = body.getOrDefault("gate", "Main Gate");
//         return visitorPassService.checkIn(passId, guardId, guardName, gate)
//                 .map(pass -> ResponseEntity.ok((Object) pass))
//                 .orElse(ResponseEntity.notFound().build());
//     }
//     // POST /api/visitor/deny/{passId}
//     @PostMapping("/deny/{passId}")
//     public ResponseEntity<?> denyEntry(@PathVariable Long passId) {
//         return visitorPassService.denyEntry(passId)
//                 .map(pass -> ResponseEntity.ok((Object) pass))
//                 .orElse(ResponseEntity.notFound().build());
//     }
//     // POST /api/visitor/checkout/{passId}
//     @PostMapping("/checkout/{passId}")
//     public ResponseEntity<?> checkOut(@PathVariable Long passId) {
//         return visitorPassService.checkOut(passId)
//                 .map(pass -> ResponseEntity.ok((Object) pass))
//                 .orElse(ResponseEntity.notFound().build());
//     }
// }
package com.bsgated.controller;

import com.bsgated.model.VisitorPass;
import com.bsgated.payload.VisitorPassPayloads;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.bsgated.service.VisitorPassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * VisitorPassController — fully secured.
 *
 * Security enforced at two levels: 1. SecurityConfig: role-based access per
 * endpoint group. 2. Service layer: ownership validation (resident sees own
 * passes only).
 *
 * Identity always from JWT via CurrentUser.get() — never from request body or
 * path variables.
 *
 * Endpoint map:
 *
 * RESIDENT: POST /api/visitor/create — create visitor pass (identity from JWT)
 * GET /api/visitor/my — view own visitor passes (no residentId path var →
 * prevents IDOR)
 *
 * SECURITY (guard): POST /api/visitor/verify-otp — look up pass by OTP POST
 * /api/visitor/checkin/{id} — mark CHECKED_IN, log entry (guard identity from
 * JWT) POST /api/visitor/deny/{id} — deny entry POST /api/visitor/checkout/{id}
 * — mark CHECKED_OUT, log exit GET /api/visitor/all — view all passes
 *
 * ADMIN: GET /api/admin/visitor/all — monitor all visitor activity
 */
@RestController
@RequestMapping("/api/visitor")
public class VisitorPassController {

    private final VisitorPassService visitorPassService;

    public VisitorPassController(VisitorPassService visitorPassService) {
        this.visitorPassService = visitorPassService;
    }

    // ══════════════════════════════════════════════════════════════════
    //  RESIDENT ENDPOINTS
    // ══════════════════════════════════════════════════════════════════
    /**
     * POST /api/visitor/create Resident creates a visitor pass. hostResidentId,
     * hostResidentName extracted from JWT — NOT trusted from body.
     * SecurityConfig enforces hasRole("RESIDENT").
     */
    @PostMapping("/create")
    public ResponseEntity<?> createPass(@RequestBody VisitorPassPayloads.CreatePass req) {
        if (req.getVisitorName() == null || req.getVisitorName().isBlank()) {
            return badRequest("visitorName is required.");
        }
        if (req.getVisitorPhone() == null || req.getVisitorPhone().isBlank()) {
            return badRequest("visitorPhone is required.");
        }
        if (req.getPurpose() == null || req.getPurpose().isBlank()) {
            return badRequest("purpose is required.");
        }
        VisitorPass created = visitorPassService.createVisitorPass(req);
        return ResponseEntity.status(201).body(created);
    }

    /**
     * GET /api/visitor/my Resident fetches their own visitor passes. residentId
     * comes from JWT — no path variable to prevent IDOR. SecurityConfig
     * enforces hasRole("RESIDENT").
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyPasses() {
        AuthenticatedUser currentUser = CurrentUser.get();
        return ResponseEntity.ok(visitorPassService.getPassesByResident(currentUser.id()));
    }

    // ══════════════════════════════════════════════════════════════════
    //  SECURITY GUARD ENDPOINTS
    // ══════════════════════════════════════════════════════════════════
    /**
     * GET /api/visitor/all Guard views all visitor passes. SecurityConfig
     * enforces hasRole("SECURITY").
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllPasses() {
        return ResponseEntity.ok(visitorPassService.getAllPasses());
    }

    /**
     * POST /api/visitor/verify-otp Guard looks up a visitor pass by OTP. Does
     * not check in — returns pass details for guard to review first.
     * SecurityConfig enforces hasRole("SECURITY").
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VisitorPassPayloads.OtpVerify req) {
        if (req.getOtp() == null || req.getOtp().isBlank()) {
            return badRequest("otp is required.");
        }
        return visitorPassService.verifyOtp(req.getOtp())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).build());
    }

    /**
     * POST /api/visitor/checkin/{passId} Guard marks the visitor as CHECKED_IN
     * and records entry log. Guard identity (id, name) extracted from JWT — NOT
     * trusted from body. Optional gate name accepted from body (physical gate
     * label, not identity). SecurityConfig enforces hasRole("SECURITY").
     */
    @PostMapping("/checkin/{passId}")
    public ResponseEntity<?> checkIn(
            @PathVariable Long passId,
            @RequestBody(required = false) VisitorPassPayloads.CheckIn req) {
        String gate = (req != null && req.getGate() != null && !req.getGate().isBlank())
                ? req.getGate()
                : "Main Gate";
        return visitorPassService.checkIn(passId, gate)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/visitor/deny/{passId} Guard denies a visitor's entry.
     * SecurityConfig enforces hasRole("SECURITY").
     */
    @PostMapping("/deny/{passId}")
    public ResponseEntity<?> denyEntry(@PathVariable Long passId) {
        return visitorPassService.denyEntry(passId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/visitor/checkout/{passId} Guard marks visitor as CHECKED_OUT
     * and records exit log. SecurityConfig enforces hasRole("SECURITY").
     */
    @PostMapping("/checkout/{passId}")
    public ResponseEntity<?> checkOut(@PathVariable Long passId) {
        return visitorPassService.checkOut(passId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ══════════════════════════════════════════════════════════════════
    //  ADMIN ENDPOINTS
    // ══════════════════════════════════════════════════════════════════
    /**
     * GET /api/admin/visitor/all Admin monitors all visitor activity.
     * SecurityConfig enforces hasAnyRole("ADMIN", "SUPER_ADMIN"). Route is
     * under /api/admin/** so the broad admin rule already covers it, but the
     * explicit rule below makes intent clear.
     */
    @GetMapping("/api/admin/visitor/all")
    public ResponseEntity<?> adminGetAll() {
        return ResponseEntity.ok(visitorPassService.getAllPasses());
    }

    // ══════════════════════════════════════════════════════════════════
    //  HELPER
    // ══════════════════════════════════════════════════════════════════
    private ResponseEntity<Map<String, String>> badRequest(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return ResponseEntity.badRequest().body(body);
    }
}
