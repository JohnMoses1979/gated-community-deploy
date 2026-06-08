// package com.bsgated.controller;
// import com.bsgated.model.SOSAlert;
// import com.bsgated.service.SOSAlertService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;
// import java.util.Map;
// @RestController
// @RequestMapping("/api/sos")
// @CrossOrigin(origins = "*")
// public class SOSAlertController {
//     @Autowired
//     private SOSAlertService sosAlertService;
//     @PostMapping("/create")
//     public ResponseEntity<SOSAlert> createSOS(@RequestBody SOSAlert alert) {
//         return ResponseEntity.ok(sosAlertService.createSOS(alert));
//     }
//     @GetMapping("/all")
//     public ResponseEntity<List<SOSAlert>> getAllAlerts() {
//         return ResponseEntity.ok(sosAlertService.getAllAlerts());
//     }
//     @GetMapping("/active")
//     public ResponseEntity<List<SOSAlert>> getActiveAlerts() {
//         return ResponseEntity.ok(sosAlertService.getActiveAlerts());
//     }
//     @GetMapping("/resident/{residentId}")
//     public ResponseEntity<List<SOSAlert>> getAlertsByResident(@PathVariable String residentId) {
//         return ResponseEntity.ok(sosAlertService.getAlertsByResident(residentId));
//     }
//     @PostMapping("/acknowledge/{id}")
//     public ResponseEntity<SOSAlert> acknowledgeSOS(@PathVariable Long id, @RequestBody Map<String, String> payload) {
//         String guardId = payload.get("guardId");
//         String guardName = payload.get("guardName");
//         return ResponseEntity.ok(sosAlertService.acknowledgeSOS(id, guardId, guardName));
//     }
//     @PostMapping("/progress/{id}")
//     public ResponseEntity<SOSAlert> progressSOS(@PathVariable Long id, @RequestBody Map<String, String> payload) {
//         String guardId = payload.get("guardId");
//         String guardName = payload.get("guardName");
//         return ResponseEntity.ok(sosAlertService.progressSOS(id, guardId, guardName));
//     }
//     @PostMapping("/resolve/{id}")
//     public ResponseEntity<SOSAlert> resolveSOS(@PathVariable Long id, @RequestBody Map<String, String> payload) {
//         String guardId = payload.get("guardId");
//         String guardName = payload.get("guardName");
//         String resolution = payload.get("resolution");
//         return ResponseEntity.ok(sosAlertService.resolveSOS(id, guardId, guardName, resolution));
//     }
// }




package com.bsgated.controller;

import com.bsgated.model.SOSAlert;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.bsgated.service.SOSAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * SOSAlertController — fully secured.
 *
 * Security enforced at two levels: 1. SecurityConfig: role-based access per
 * endpoint group. 2. Service layer: ownership validation (resident sees own).
 *
 * Identity always from JWT via CurrentUser.get() — never from request body.
 *
 * Endpoint map:
 *
 * RESIDENT: POST /api/sos/create — trigger SOS alert GET /api/sos/my — view own
 * alerts
 *
 * SECURITY GUARD: GET /api/sos/active — view active alerts POST
 * /api/sos/{id}/acknowledge — acknowledge emergency POST /api/sos/{id}/progress
 * — mark in-progress POST /api/sos/{id}/resolve — resolve emergency
 *
 * ADMIN | SUPER_ADMIN: GET /api/admin/sos/all — all alerts GET
 * /api/admin/sos/active — active alerts
 */
@RestController
public class SOSAlertController {

    private final SOSAlertService sosAlertService;

    public SOSAlertController(SOSAlertService sosAlertService) {
        this.sosAlertService = sosAlertService;
    }

    // ══════════════════════════════════════════════════════════════════
    //  RESIDENT ENDPOINTS
    // ══════════════════════════════════════════════════════════════════
    /**
     * POST /api/sos/create Resident triggers an SOS alert. residentId and
     * residentName resolved from JWT — not from body.
     */
    @PostMapping("/api/sos/create")
    public ResponseEntity<?> createSOS(@RequestBody SOSAlert alert) {
        return ResponseEntity.status(201).body(sosAlertService.createSOS(alert));
    }

    /**
     * GET /api/sos/my Resident fetches their own SOS alerts. residentId from
     * JWT — no path variable to prevent IDOR.
     */
    @GetMapping("/api/sos/my")
    public ResponseEntity<?> getMyAlerts() {
        return ResponseEntity.ok(sosAlertService.getMyAlerts());
    }

    // ══════════════════════════════════════════════════════════════════
    //  SECURITY GUARD ENDPOINTS
    // ══════════════════════════════════════════════════════════════════
    /**
     * GET /api/sos/active Guard views all non-resolved SOS alerts.
     */
    @GetMapping("/api/sos/active")
    public ResponseEntity<?> getActiveAlerts() {
        return ResponseEntity.ok(sosAlertService.getActiveAlerts());
    }

    /**
     * POST /api/sos/{id}/acknowledge Guard acknowledges an SOS alert. guardId
     * and guardName from JWT — not from body.
     */
    @PostMapping("/api/sos/{id}/acknowledge")
    public ResponseEntity<?> acknowledgeSOS(@PathVariable Long id) {
        return ResponseEntity.ok(sosAlertService.acknowledgeSOS(id));
    }

    /**
     * POST /api/sos/{id}/progress Guard marks SOS as in-progress (actively
     * responding). guardId and guardName from JWT — not from body.
     */
    @PostMapping("/api/sos/{id}/progress")
    public ResponseEntity<?> progressSOS(@PathVariable Long id) {
        return ResponseEntity.ok(sosAlertService.progressSOS(id));
    }

    /**
     * POST /api/sos/{id}/resolve Guard resolves an SOS alert with a resolution
     * note. guardId and guardName from JWT — not from body.
     */
    @PostMapping("/api/sos/{id}/resolve")
    public ResponseEntity<?> resolveSOS(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String resolution = body.get("resolution");
        if (resolution == null || resolution.isBlank()) {
            return badRequest("resolution is required.");
        }
        return ResponseEntity.ok(sosAlertService.resolveSOS(id, resolution));
    }

    // ══════════════════════════════════════════════════════════════════
    //  ADMIN ENDPOINTS
    // ══════════════════════════════════════════════════════════════════
    /**
     * GET /api/admin/sos/all Admin views all SOS alerts (full history).
     */
    @GetMapping("/api/admin/sos/all")
    public ResponseEntity<?> adminGetAll() {
        return ResponseEntity.ok(sosAlertService.getAllAlerts());
    }

    /**
     * GET /api/admin/sos/active Admin views all currently active (non-resolved)
     * SOS alerts.
     */
    @GetMapping("/api/admin/sos/active")
    public ResponseEntity<?> adminGetActive() {
        return ResponseEntity.ok(sosAlertService.getActiveAlerts());
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
