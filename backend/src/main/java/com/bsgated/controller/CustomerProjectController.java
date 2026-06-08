// package com.bsgated.controller;
// import com.bsgated.exception.ApiException;
// import com.bsgated.model.Project;
// import com.bsgated.repository.ProjectRepository;
// import com.bsgated.repository.TowerRepository;
// import com.bsgated.repository.UnitRepository;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;
// @RestController
// @RequestMapping("/api/customer/projects")
// public class CustomerProjectController {
//     private final ProjectRepository projectRepository;
//     private final TowerRepository towerRepository;
//     private final UnitRepository unitRepository;
//     public CustomerProjectController(ProjectRepository projectRepository, TowerRepository towerRepository, UnitRepository unitRepository) {
//         this.projectRepository = projectRepository;
//         this.towerRepository = towerRepository;
//         this.unitRepository = unitRepository;
//     }
//     @GetMapping
//     public ResponseEntity<List<Project>> getAllProjects() {
//         return ResponseEntity.ok(projectRepository.findAll());
//     }
//     @GetMapping("/{projectId}")
//     public ResponseEntity<Project> getProjectDetails(@PathVariable Long projectId) {
//         return projectRepository.findById(projectId)
//                 .map(ResponseEntity::ok)
//                 .orElse(ResponseEntity.notFound().build());
//     }
//     @GetMapping("/{projectId}/towers")
//     public ResponseEntity<?> getProjectTowers(@PathVariable Long projectId) {
//         return ResponseEntity.ok(towerRepository.findByProjectId(projectId));
//     }
//     @GetMapping("/towers/{towerId}/units")
//     public ResponseEntity<?> getTowerUnits(@PathVariable Long towerId) {
//         return ResponseEntity.ok(unitRepository.findByTowerId(towerId));
//     }
// }
package com.bsgated.controller;

import com.bsgated.exception.ApiException;
import com.bsgated.model.Project;
import com.bsgated.model.Tower;
import com.bsgated.model.Unit;
import com.bsgated.repository.ProjectRepository;
import com.bsgated.repository.TowerRepository;
import com.bsgated.repository.UnitRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Customer-facing read-only API for browsing projects, towers, and units.
 *
 * Security guarantees: - Project browsing is public read-only in
 * SecurityConfig. - Customers ONLY see projects that are both "Approved" AND
 * "LIVE". Pending / Rejected / DRAFT projects are invisible to customers. - No
 * mutation endpoints exist here — browsing only. - towerId in getTowerUnits
 * uses a path variable that is intentionally prefixed under /towers/ (not
 * /projects/{id}/towers/{id}/units) to keep the URL structure flat and match
 * the builder API.
 */
@RestController
@RequestMapping("/api/customer/projects")
public class CustomerProjectController {

    private final ProjectRepository projectRepository;
    private final TowerRepository towerRepository;
    private final UnitRepository unitRepository;

    public CustomerProjectController(
            ProjectRepository projectRepository,
            TowerRepository towerRepository,
            UnitRepository unitRepository) {
        this.projectRepository = projectRepository;
        this.towerRepository = towerRepository;
        this.unitRepository = unitRepository;
    }

    /**
     * GET /api/customer/projects Returns only projects whose approvalStatus =
     * "Approved" AND status = "LIVE". Pending, Rejected, or DRAFT projects are
     * never exposed to customers.
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Project>> getAllApprovedProjects() {
        List<Project> visible = projectRepository
                .findByApprovalStatusAndStatus("Approved", "LIVE");
        return ResponseEntity.ok(visible);
    }

    /**
     * GET /api/customer/projects/{projectId} Returns a single project only if
     * it is Approved + LIVE. Returns 404 for pending/rejected/draft projects —
     * intentionally ambiguous to avoid leaking project existence to
     * unauthenticated reconnaissance.
     */
    @GetMapping("/{projectId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Project> getProjectDetails(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));

        if (!"Approved".equals(project.getApprovalStatus()) || !"LIVE".equals(project.getStatus())) {
            // Return 404 rather than 403 to avoid leaking project existence
            throw new ApiException(HttpStatus.NOT_FOUND, "Project not found");
        }

        return ResponseEntity.ok(project);
    }

    /**
     * GET /api/customer/projects/{projectId}/towers Returns towers for an
     * approved project. Re-validates project visibility.
     */
    @GetMapping("/{projectId}/towers")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Tower>> getProjectTowers(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));

        if (!"Approved".equals(project.getApprovalStatus()) || !"LIVE".equals(project.getStatus())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Project not found");
        }

        return ResponseEntity.ok(towerRepository.findByProject_Id(projectId));
    }

    /**
     * GET /api/customer/projects/towers/{towerId}/units Returns units for a
     * tower. Tower ownership check ensures the parent project is visible.
     */
    @GetMapping("/towers/{towerId}/units")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Unit>> getTowerUnits(@PathVariable Long towerId) {
        Tower tower = towerRepository.findById(towerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tower not found"));

        // Prevent browsing units of non-approved / non-live projects
        Project parent = tower.getProject();
        if (!"Approved".equals(parent.getApprovalStatus()) || !"LIVE".equals(parent.getStatus())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Tower not found");
        }

        return ResponseEntity.ok(unitRepository.findByTower_IdAndStatus(towerId, "AVAILABLE"));
    }
}
