// package com.bsgated.controller;
// import com.bsgated.exception.ApiException;
// import com.bsgated.model.Project;
// import com.bsgated.model.SiteVisit;
// import com.bsgated.model.User;
// import com.bsgated.repository.ProjectRepository;
// import com.bsgated.repository.SiteVisitRepository;
// import com.bsgated.repository.UserRepository;
// import com.bsgated.security.AuthenticatedUser;
// import com.bsgated.security.CurrentUser;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;
// @RestController
// @RequestMapping("/api/site-visits")
// public class SiteVisitController {
//     private final SiteVisitRepository siteVisitRepository;
//     private final ProjectRepository projectRepository;
//     private final UserRepository userRepository;
//     public SiteVisitController(SiteVisitRepository siteVisitRepository, ProjectRepository projectRepository, UserRepository userRepository) {
//         this.siteVisitRepository = siteVisitRepository;
//         this.projectRepository = projectRepository;
//         this.userRepository = userRepository;
//     }
//     private User getCurrentUser() {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         return userRepository.findById(currentUser.id())
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
//     }
//     @PostMapping("/book/{projectId}")
//     public ResponseEntity<?> bookSiteVisit(@PathVariable Long projectId, @RequestBody SiteVisit siteVisit) {
//         User customer = getCurrentUser();
//         Project project = projectRepository.findById(projectId)
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
//         siteVisit.setCustomer(customer);
//         siteVisit.setProject(project);
//         siteVisit.setStatus("REQUESTED");
//         SiteVisit saved = siteVisitRepository.save(siteVisit);
//         return ResponseEntity.ok(saved);
//     }
//     @GetMapping("/my-visits")
//     public ResponseEntity<?> getMyVisits() {
//         User customer = getCurrentUser();
//         return ResponseEntity.ok(siteVisitRepository.findByCustomerId(customer.getId()));
//     }
//     @GetMapping("/project/{projectId}")
//     public ResponseEntity<?> getProjectVisits(@PathVariable Long projectId) {
//         User builder = getCurrentUser();
//         if (!"BUILDER".equals(builder.getRole().toUpperCase())) {
//             throw new ApiException(HttpStatus.FORBIDDEN, "Only Builders can view this.");
//         }
//         return ResponseEntity.ok(siteVisitRepository.findByProjectId(projectId));
//     }
//     @PutMapping("/{id}/status")
//     public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
//         SiteVisit visit = siteVisitRepository.findById(id)
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Visit not found"));
//         // Allow builder or admin to update status
//         visit.setStatus(payload.get("status"));
//         return ResponseEntity.ok(siteVisitRepository.save(visit));
//     }
// }
package com.bsgated.controller;

import com.bsgated.dto.booking.SiteVisitRequest;
import com.bsgated.dto.booking.SiteVisitStatusRequest;
import com.bsgated.exception.ApiException;
import com.bsgated.model.Project;
import com.bsgated.model.SiteVisit;
import com.bsgated.model.User;
import com.bsgated.repository.ProjectRepository;
import com.bsgated.repository.SiteVisitRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Site visit scheduling API.
 *
 * Security guarantees: - Customer endpoints require ROLE_CUSTOMER (enforced in
 * SecurityConfig). - Builder endpoints require ROLE_BUILDER (enforced in
 * SecurityConfig). - Customer can only view their own visits. - Builder can
 * only view/update visits for projects they own. - Status updates go through a
 * validated DTO with a whitelist pattern — prevents arbitrary status injection.
 */
@RestController
@RequestMapping("/api/site-visits")
public class SiteVisitController {

    private final SiteVisitRepository siteVisitRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public SiteVisitController(
            SiteVisitRepository siteVisitRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository) {
        this.siteVisitRepository = siteVisitRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    // ── Private helpers ────────────────────────────────────────────────────
    private User requireCurrentUser() {
        AuthenticatedUser auth = CurrentUser.get();
        return userRepository.findById(auth.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private User requireBuilder() {
        AuthenticatedUser auth = CurrentUser.get();
        if (!"BUILDER".equalsIgnoreCase(auth.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only Builders can perform this action.");
        }
        return userRepository.findById(auth.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Builder account not found"));
    }

    // ── Customer: book a site visit ────────────────────────────────────────
    /**
     * POST /api/site-visits/book/{projectId} Customer requests a site visit for
     * an approved, live project. Scheduled date must be in the future
     * (validated by @Future on the DTO).
     */
    @PostMapping("/book/{projectId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> bookSiteVisit(
            @PathVariable Long projectId,
            @Valid @RequestBody SiteVisitRequest req) {

        User customer = requireCurrentUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));

        // Only allow visits to approved, live projects
        if (!"Approved".equals(project.getApprovalStatus()) || !"LIVE".equals(project.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Site visits can only be booked for active, approved projects.");
        }

        SiteVisit visit = new SiteVisit();
        visit.setCustomer(customer);
        visit.setProject(project);
        visit.setScheduledDate(req.getScheduledDate());
        visit.setUnitId(req.getUnitId());
        visit.setUnitNumber(req.getUnitNumber());
        visit.setUnitType(req.getUnitType());
        visit.setMessage(req.getMessage());
        visit.setStatus("REQUESTED");

        return ResponseEntity.status(HttpStatus.CREATED).body(toVisitResponse(siteVisitRepository.save(visit)));
    }

    // ── Customer: my visits ────────────────────────────────────────────────
    /**
     * GET /api/site-visits/my-visits Returns only the authenticated customer's
     * own visits.
     */
    @GetMapping("/my-visits")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getMyVisits() {
        User customer = requireCurrentUser();
        return ResponseEntity.ok(siteVisitRepository.findByCustomer_Id(customer.getId())
                .stream()
                .map(this::toVisitResponse)
                .toList());
    }

    // ── Builder: view visits for a project ────────────────────────────────
    /**
     * GET /api/site-visits/project/{projectId} Builder views all visit requests
     * for one of their projects. IDOR: ownership of the project is validated
     * against the JWT.
     */
    @GetMapping("/project/{projectId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getProjectVisits(@PathVariable Long projectId) {
        User builder = requireBuilder();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));

        if (!project.getBuilder().getId().equals(builder.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this project.");
        }

        return ResponseEntity.ok(siteVisitRepository.findByProject_Id(projectId)
                .stream()
                .map(this::toVisitResponse)
                .toList());
    }

    // ── Builder: update visit status ───────────────────────────────────────
    /**
     * PUT /api/site-visits/{id}/status Builder confirms, completes, or cancels
     * a visit. Validates that the visit belongs to one of the builder's
     * projects. Status is validated through a DTO regex — no free-form values
     * allowed.
     */
    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody SiteVisitStatusRequest req) {

        User builder = requireBuilder();

        SiteVisit visit = siteVisitRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Visit not found"));

        // IDOR: builder must own the project linked to this visit
        if (!visit.getProject().getBuilder().getId().equals(builder.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this site visit.");
        }

        visit.setStatus(req.getStatus());
        return ResponseEntity.ok(toVisitResponse(siteVisitRepository.save(visit)));
    }

    /**
     * GET /api/site-visits/builder/all Returns all site visits across all
     * projects owned by the authenticated builder.
     */
    @GetMapping("/builder/all")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getAllBuilderVisits() {
        User builder = requireBuilder();
        return ResponseEntity.ok(
                siteVisitRepository.findByProject_Builder_Id(builder.getId())
                        .stream()
                        .map(this::toVisitResponse)
                        .toList()
        );
    }

    private Map<String, Object> toVisitResponse(SiteVisit visit) {
        User customer = visit.getCustomer();
        Project project = visit.getProject();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", visit.getId());
        response.put("status", nullToEmpty(visit.getStatus()));
        response.put("customerId", customer != null ? customer.getId() : "");
        response.put("customerName", customer != null ? nullToEmpty(customer.getName()) : "");
        response.put("customerPhone", customer != null ? nullToEmpty(customer.getPhone()) : "");
        response.put("projectId", project != null ? project.getId() : "");
        response.put("projectName", project != null ? nullToEmpty(project.getName()) : "");
        response.put("unitId", visit.getUnitId() != null ? visit.getUnitId() : "");
        response.put("unitNumber", nullToEmpty(visit.getUnitNumber()));
        response.put("unitType", nullToEmpty(visit.getUnitType()));
        response.put("message", nullToEmpty(visit.getMessage()));
        response.put("scheduledDate", visit.getScheduledDate());
        response.put("createdAt", visit.getCreatedAt());
        return response;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

}
