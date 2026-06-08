package com.bsgated.controller;

import com.bsgated.exception.ApiException;
import com.bsgated.model.User;
import com.bsgated.model.Project;
import com.bsgated.repository.UserRepository;
import com.bsgated.repository.ProjectRepository;

import jakarta.transaction.Transactional;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.bsgated.security.RoleName;
import com.bsgated.service.AuditService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditService auditService;
    private final ProjectRepository projectRepository;

    public AdminController(UserRepository userRepository, AuditService auditService, ProjectRepository projectRepository) {
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.projectRepository = projectRepository;
    }

    @GetMapping(value = "/projects", produces = "application/json")
    public List<Project> getProjects(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            String normalized = status.trim();
            return projectRepository.findAll()
                    .stream()
                    .filter(p -> p.getApprovalStatus() != null && p.getApprovalStatus().equalsIgnoreCase(normalized))
                    .toList();
        }
        return projectRepository.findAll();
    }

    @PutMapping(value = "/projects/{id}/approve")
    public ResponseEntity<?> approveProject(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        boolean approve = Boolean.TRUE.equals(payload.getOrDefault("approve", Boolean.TRUE));
        String reviewMessage = payload.getOrDefault("reviewMessage", "").toString();

        AuthenticatedUser actor = CurrentUser.get();

        return projectRepository.findById(id).map(project -> {
            project.setApprovalStatus(approve ? "Approved" : "Rejected");
            project.setReviewedAt(java.time.LocalDateTime.now());
            project.setReviewMessage(reviewMessage);
            projectRepository.save(project);

            auditService.record("PROJECT_" + (approve ? "APPROVED" : "REJECTED"),
                    "PROJECT",
                    String.valueOf(project.getId()),
                    "By=" + actor.id());

            return ResponseEntity.ok(project);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/pending", produces = "application/json")
    public List<User> getPendingUsers() {
        return userRepository.findByVerificationStatus("pending")
                .stream()
                .filter(u -> u.getRole() != null && List.of("resident", "vendor", "security").contains(u.getRole().toLowerCase()))
                .toList();
    }

    @GetMapping(value = "/superadmin/pending", produces = "application/json")
    public List<User> getSuperAdminPending() {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getVerificationStatus() != null && List.of("pending", "not_submitted").contains(u.getVerificationStatus().toLowerCase()))
                .filter(u -> u.getRole() != null && List.of("admin", "builder", "superadmin", "super_admin").contains(u.getRole().toLowerCase()))
                .toList();
    }

    @GetMapping(value = "/users", produces = "application/json")
    public List<User> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() != null && List.of("resident", "vendor", "security").contains(u.getRole().toLowerCase()))
                .toList();
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        boolean approve = payload.getOrDefault("approve", true);
        AuthenticatedUser actor = CurrentUser.get();
        
        return userRepository.findById(id).map(user -> {
            ensureApprovalPermission(actor, user);
            if (approve) {
                user.setVerificationStatus("approved");
                user.setApprovalStatus("approved");
            } else {
                user.setVerificationStatus("rejected");
                user.setApprovalStatus("rejected");
            }
            userRepository.save(user);
            auditService.record("USER_" + (approve ? "APPROVED" : "REJECTED"),
                    "USER",
                    String.valueOf(user.getId()),
                    "Target role=" + user.getRole());
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    private void ensureApprovalPermission(AuthenticatedUser actor, User targetUser) {
        String actorRole = RoleName.normalize(actor.role());
        String targetRole = RoleName.normalize(targetUser.getRole());

        if ("ADMIN".equals(actorRole) && List.of("RESIDENT", "VENDOR", "SECURITY").contains(targetRole)) {
            return;
        }

        if ("SUPER_ADMIN".equals(actorRole) && List.of("ADMIN", "BUILDER").contains(targetRole)) {
            return;
        }

        throw new ApiException(HttpStatus.FORBIDDEN, "You are not allowed to approve this user type.");
    }
}
