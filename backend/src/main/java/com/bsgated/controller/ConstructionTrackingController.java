// package com.bsgated.controller;
// import com.bsgated.exception.ApiException;
// import com.bsgated.model.ConstructionMilestone;
// import com.bsgated.model.ConstructionUpdate;
// import com.bsgated.model.Project;
// import com.bsgated.model.User;
// import com.bsgated.repository.ConstructionMilestoneRepository;
// import com.bsgated.repository.ConstructionUpdateRepository;
// import com.bsgated.repository.ProjectRepository;
// import com.bsgated.repository.UserRepository;
// import com.bsgated.security.AuthenticatedUser;
// import com.bsgated.security.CurrentUser;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;
// @RestController
// @RequestMapping("/api/construction")
// public class ConstructionTrackingController {
//     private final ConstructionMilestoneRepository milestoneRepository;
//     private final ConstructionUpdateRepository updateRepository;
//     private final ProjectRepository projectRepository;
//     private final UserRepository userRepository;
//     public ConstructionTrackingController(ConstructionMilestoneRepository milestoneRepository, ConstructionUpdateRepository updateRepository, ProjectRepository projectRepository, UserRepository userRepository) {
//         this.milestoneRepository = milestoneRepository;
//         this.updateRepository = updateRepository;
//         this.projectRepository = projectRepository;
//         this.userRepository = userRepository;
//     }
//     private User getCurrentUser() {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         return userRepository.findById(currentUser.id())
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
//     }
//     @PostMapping("/project/{projectId}/milestones")
//     public ResponseEntity<?> createMilestone(@PathVariable Long projectId, @RequestBody ConstructionMilestone milestone) {
//         User builder = getCurrentUser();
//         Project project = projectRepository.findById(projectId)
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
//         if (!project.getBuilder().getId().equals(builder.getId())) {
//             throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this project.");
//         }
//         milestone.setProject(project);
//         return ResponseEntity.ok(milestoneRepository.save(milestone));
//     }
//     @PostMapping("/milestones/{milestoneId}/updates")
//     public ResponseEntity<?> addUpdate(@PathVariable Long milestoneId, @RequestBody ConstructionUpdate update) {
//         User builder = getCurrentUser();
//         ConstructionMilestone milestone = milestoneRepository.findById(milestoneId)
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Milestone not found"));
//         if (!milestone.getProject().getBuilder().getId().equals(builder.getId())) {
//             throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this project.");
//         }
//         update.setMilestone(milestone);
//         return ResponseEntity.ok(updateRepository.save(update));
//     }
//     @GetMapping("/project/{projectId}/milestones")
//     public ResponseEntity<?> getProjectMilestones(@PathVariable Long projectId) {
//         // Available to anyone (customers can see progress)
//         return ResponseEntity.ok(milestoneRepository.findByProjectId(projectId));
//     }
//     @GetMapping("/milestones/{milestoneId}/updates")
//     public ResponseEntity<?> getMilestoneUpdates(@PathVariable Long milestoneId) {
//         return ResponseEntity.ok(updateRepository.findByMilestoneId(milestoneId));
//     }
// }
package com.bsgated.controller;

import com.bsgated.dto.construction.AddConstructionUpdateRequest;
import com.bsgated.dto.construction.CreateMilestoneRequest;
import com.bsgated.exception.ApiException;
import com.bsgated.model.ConstructionMilestone;
import com.bsgated.model.ConstructionUpdate;
import com.bsgated.model.Project;
import com.bsgated.model.User;
import com.bsgated.repository.ConstructionMilestoneRepository;
import com.bsgated.repository.ConstructionUpdateRepository;
import com.bsgated.repository.ProjectRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Construction tracking API — milestones and photo/video updates.
 *
 * Security guarantees: - Milestone/update creation requires ROLE_BUILDER
 * (enforced in SecurityConfig). - Read endpoints are accessible to any
 * authenticated user (customer transparency). - A builder can only post
 * milestones/updates for projects they own — IDOR prevention. - All input goes
 * through validated DTOs — no raw entity binding.
 */
@RestController
@RequestMapping("/api/construction")
public class ConstructionTrackingController {

    private final ConstructionMilestoneRepository milestoneRepository;
    private final ConstructionUpdateRepository updateRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ConstructionTrackingController(
            ConstructionMilestoneRepository milestoneRepository,
            ConstructionUpdateRepository updateRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository) {
        this.milestoneRepository = milestoneRepository;
        this.updateRepository = updateRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    // ── Private helpers ────────────────────────────────────────────────────
    private User requireBuilder() {
        AuthenticatedUser currentUser = CurrentUser.get();
        if (!"BUILDER".equalsIgnoreCase(currentUser.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only Builders can perform this action.");
        }
        return userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Builder account not found"));
    }

    private Project requireOwnedProject(Long projectId, User builder) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!project.getBuilder().getId().equals(builder.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this project.");
        }
        return project;
    }

    private ConstructionMilestone requireOwnedMilestone(Long milestoneId, User builder) {
        ConstructionMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Milestone not found"));
        if (!milestone.getProject().getBuilder().getId().equals(builder.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this milestone.");
        }
        return milestone;
    }

    // ── Builder: create milestone ──────────────────────────────────────────
    /**
     * POST /api/construction/project/{projectId}/milestones Builder creates a
     * milestone on a project they own.
     */
    @PostMapping("/project/{projectId}/milestones")
    @Transactional
    public ResponseEntity<ConstructionMilestone> createMilestone(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateMilestoneRequest req) {

        User builder = requireBuilder();
        Project project = requireOwnedProject(projectId, builder);

        ConstructionMilestone milestone = new ConstructionMilestone();
        milestone.setProject(project);
        milestone.setTitle(req.getTitle());
        milestone.setPercentageCompletion(req.getPercentageCompletion());
        milestone.setExpectedCompletionDate(req.getExpectedCompletionDate());
        milestone.setStatus("PENDING");

        return ResponseEntity.status(HttpStatus.CREATED).body(milestoneRepository.save(milestone));
    }

    // ── Builder: add update to milestone ──────────────────────────────────
    /**
     * POST /api/construction/milestones/{milestoneId}/updates Builder posts a
     * photo/video update under one of their milestones.
     */
    @PostMapping("/milestones/{milestoneId}/updates")
    @Transactional
    public ResponseEntity<ConstructionUpdate> addUpdate(
            @PathVariable Long milestoneId,
            @Valid @RequestBody AddConstructionUpdateRequest req) {

        User builder = requireBuilder();
        ConstructionMilestone milestone = requireOwnedMilestone(milestoneId, builder);

        ConstructionUpdate update = new ConstructionUpdate();
        update.setMilestone(milestone);
        update.setDescription(req.getDescription());
        update.setPhotoUrlsJson(req.getPhotoUrlsJson());
        update.setVideoUrlsJson(req.getVideoUrlsJson());

        return ResponseEntity.status(HttpStatus.CREATED).body(updateRepository.save(update));
    }

    /**
     * PUT /api/construction/milestones/{milestoneId} Builder updates milestone
     * progress metadata for an owned milestone.
     */
    @PutMapping("/milestones/{milestoneId}")
    @Transactional
    public ResponseEntity<ConstructionMilestone> updateMilestone(
            @PathVariable Long milestoneId,
            @Valid @RequestBody CreateMilestoneRequest req) {

        User builder = requireBuilder();
        ConstructionMilestone milestone = requireOwnedMilestone(milestoneId, builder);

        milestone.setTitle(req.getTitle());
        milestone.setPercentageCompletion(req.getPercentageCompletion());
        milestone.setExpectedCompletionDate(req.getExpectedCompletionDate());
        double pct = req.getPercentageCompletion() == null ? 0 : req.getPercentageCompletion();
        milestone.setStatus(pct >= 100 ? "COMPLETED" : pct > 0 ? "IN_PROGRESS" : "PENDING");

        return ResponseEntity.ok(milestoneRepository.save(milestone));
    }

    // ── Public read (authenticated) ────────────────────────────────────────
    /**
     * GET /api/construction/project/{projectId}/milestones Any authenticated
     * user (customer, builder, admin) can read milestones. This is the
     * transparency-facing endpoint for customers tracking progress.
     */
    @GetMapping("/project/{projectId}/milestones")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ConstructionMilestone>> getProjectMilestones(@PathVariable Long projectId) {
        // Verify project exists — avoids leaking a "milestones not found" vs "project not found" distinction
        if (!projectRepository.existsById(projectId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Project not found");
        }
        return ResponseEntity.ok(milestoneRepository.findByProject_Id(projectId));
    }

    /**
     * GET /api/construction/milestones/{milestoneId}/updates Any authenticated
     * user can read updates under a milestone.
     */
    @GetMapping("/milestones/{milestoneId}/updates")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ConstructionUpdate>> getMilestoneUpdates(@PathVariable Long milestoneId) {
        if (!milestoneRepository.existsById(milestoneId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Milestone not found");
        }
        return ResponseEntity.ok(updateRepository.findByMilestone_Id(milestoneId));
    }
}
