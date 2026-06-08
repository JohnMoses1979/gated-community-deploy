// package com.bsgated.controller;

// import com.bsgated.model.Notice;
// import com.bsgated.payload.NoticeRequest;
// import com.bsgated.service.NoticeService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;

// /**
//  * Notice Board endpoints.
//  *
//  * Admin endpoints  → /api/admin/notices/**
//  * Resident/shared  → /api/notices/**
//  *
//  * Authentication is intentionally kept simple (adminId passed as a
//  * query param) so it integrates with your existing auth pattern.
//  * Replace with JWT / session extraction when you add Spring Security.
//  */
// @RestController
// @CrossOrigin(origins = "*")
// public class NoticeController {

//     @Autowired
//     private NoticeService noticeService;

//     // ════════════════════════════════════════════════════════════════════════
//     //  ADMIN ENDPOINTS
//     // ════════════════════════════════════════════════════════════════════════

//     /**
//      * POST /api/admin/notices
//      *
//      * Admin posts a new announcement.
//      * Body: NoticeRequest JSON
//      * Param: adminId (Long) — the logged-in admin's user ID
//      *
//      * Returns 201 + the saved Notice, or 400 if title/body are empty.
//      */
//     @PostMapping(value = "/api/admin/notices", produces = "application/json")
//     public ResponseEntity<?> createNotice(
//             @RequestBody NoticeRequest request,
//             @RequestParam Long adminId) {

//         // Basic validation
//         if (request.getTitle() == null || request.getTitle().isBlank()) {
//             return badRequest("Title is required.");
//         }
//         if (request.getBody() == null || request.getBody().isBlank()) {
//             return badRequest("Message body is required.");
//         }

//         Notice saved = noticeService.createNotice(request, adminId);
//         return ResponseEntity.status(201).body(saved);
//     }

//     /**
//      * GET /api/admin/notices
//      *
//      * Returns ALL notices (including expired) — for the admin board view.
//      */
//     @GetMapping(value = "/api/admin/notices", produces = "application/json")
//     public List<Notice> getAllNotices() {
//         return noticeService.getAllNotices();
//     }

//     /**
//      * DELETE /api/admin/notices/{id}
//      *
//      * Admin deletes a notice.
//      */
//     @DeleteMapping("/api/admin/notices/{id}")
//     public ResponseEntity<?> deleteNotice(@PathVariable Long id) {
//         boolean deleted = noticeService.deleteNotice(id);
//         if (deleted) {
//             Map<String, String> resp = new HashMap<>();
//             resp.put("message", "Notice deleted.");
//             return ResponseEntity.ok(resp);
//         }
//         return ResponseEntity.notFound().build();
//     }

//     /**
//      * PUT /api/admin/notices/{id}/pin
//      *
//      * Toggle pinned state.
//      */
//     @PutMapping(value = "/api/admin/notices/{id}/pin", produces = "application/json")
//     public ResponseEntity<?> togglePin(@PathVariable Long id) {
//         return noticeService.togglePin(id)
//                 .map(ResponseEntity::ok)
//                 .orElse(ResponseEntity.notFound().build());
//     }

//     // ════════════════════════════════════════════════════════════════════════
//     //  RESIDENT / SHARED ENDPOINTS
//     // ════════════════════════════════════════════════════════════════════════

//     /**
//      * GET /api/notices?role=resident
//      *
//      * Returns live (non-expired) notices for the caller's role.
//      * role param: resident | vendor | security  (defaults to "resident")
//      *
//      * This is what NoticeBoardScreen.js and NotificationScreen.js poll.
//      */
//     @GetMapping(value = "/api/notices", produces = "application/json")
//     public List<Notice> getNoticesForRole(
//             @RequestParam(defaultValue = "resident") String role) {
//         return noticeService.getNoticesForRole(role);
//     }

//     /**
//      * GET /api/notices/events/upcoming
//      *
//      * Returns upcoming (future, non-expired) events sorted by eventDate.
//      * Used by the "Upcoming Events" banner in NoticeBoardScreen.
//      */
//     @GetMapping(value = "/api/notices/events/upcoming", produces = "application/json")
//     public List<Notice> getUpcomingEvents() {
//         return noticeService.getUpcomingEvents();
//     }

//     /**
//      * POST /api/notices/{id}/rsvp
//      *
//      * Resident RSVPs for an event. Increments rsvpCount on the notice.
//      * In production: store (noticeId, userId) pairs to prevent double-RSVP.
//      */
//     @PostMapping(value = "/api/notices/{id}/rsvp", produces = "application/json")
//     public ResponseEntity<?> rsvp(@PathVariable Long id) {
//         return noticeService.rsvp(id)
//                 .map(ResponseEntity::ok)
//                 .orElse(ResponseEntity.notFound().build());
//     }

//     // ── Helper ─────────────────────────────────────────────────────────────

//     private ResponseEntity<Map<String, String>> badRequest(String message) {
//         Map<String, String> body = new HashMap<>();
//         body.put("message", message);
//         return ResponseEntity.badRequest().body(body);
//     }
// }


































package com.bsgated.controller;

import com.bsgated.model.Notice;
import com.bsgated.payload.NoticeRequest;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.bsgated.service.NoticeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Notice Board endpoints.
 *
 * Admin endpoints  → /api/admin/notices/**  (SecurityConfig: ADMIN | SUPER_ADMIN)
 * Read endpoints   → /api/notices/**        (SecurityConfig: authenticated)
 *
 * Admin identity is extracted from JWT via CurrentUser.get().
 * No adminId query params — those were a pre-security pattern and are removed.
 */
@RestController
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    @PostMapping(value = "/api/admin/notices", produces = "application/json")
    public ResponseEntity<?> createNotice(@RequestBody NoticeRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            return badRequest("Title is required.");
        }
        if (request.getBody() == null || request.getBody().isBlank()) {
            return badRequest("Message body is required.");
        }
        // Admin identity from JWT — not from query param
        Notice saved = noticeService.createNotice(request);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping(value = "/api/admin/notices", produces = "application/json")
    public List<Notice> getAllNotices() {
        return noticeService.getAllNotices();
    }

    @DeleteMapping("/api/admin/notices/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id) {
        boolean deleted = noticeService.deleteNotice(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Notice deleted."));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping(value = "/api/admin/notices/{id}/pin", produces = "application/json")
    public ResponseEntity<?> togglePin(@PathVariable Long id) {
        return noticeService.togglePin(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Resident / Shared endpoints ───────────────────────────────────────────

    @GetMapping(value = "/api/notices", produces = "application/json")
    public List<Notice> getNoticesForRole(
            @RequestParam(defaultValue = "resident") String role) {
        return noticeService.getNoticesForRole(role);
    }

    @GetMapping(value = "/api/notices/events/upcoming", produces = "application/json")
    public List<Notice> getUpcomingEvents() {
        return noticeService.getUpcomingEvents();
    }

    /**
     * RSVP — authenticated user RSVPs. In a future iteration, store
     * (noticeId, userId) pair to prevent double-RSVP.
     */
    @PostMapping(value = "/api/notices/{id}/rsvp", produces = "application/json")
    public ResponseEntity<?> rsvp(@PathVariable Long id) {
        return noticeService.rsvp(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private ResponseEntity<Map<String, String>> badRequest(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return ResponseEntity.badRequest().body(body);
    }
}