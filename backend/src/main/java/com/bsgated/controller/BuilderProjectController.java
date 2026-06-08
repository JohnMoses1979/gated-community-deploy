// package com.bsgated.controller;
// import com.bsgated.exception.ApiException;
// import com.bsgated.model.Project;
// import com.bsgated.model.Tower;
// import com.bsgated.model.Unit;
// import com.bsgated.model.User;
// import com.bsgated.repository.ProjectRepository;
// import com.bsgated.repository.TowerRepository;
// import com.bsgated.repository.UnitRepository;
// import com.bsgated.repository.UserRepository;
// import com.bsgated.security.AuthenticatedUser;
// import com.bsgated.security.CurrentUser;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;
// @RestController
// @RequestMapping("/api/builder")
// public class BuilderProjectController {
//     private final ProjectRepository projectRepository;
//     private final TowerRepository towerRepository;
//     private final UnitRepository unitRepository;
//     private final UserRepository userRepository;
//     public BuilderProjectController(ProjectRepository projectRepository, TowerRepository towerRepository, UnitRepository unitRepository, UserRepository userRepository) {
//         this.projectRepository = projectRepository;
//         this.towerRepository = towerRepository;
//         this.unitRepository = unitRepository;
//         this.userRepository = userRepository;
//     }
//     private User getCurrentBuilder() {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         if (!"BUILDER".equals(currentUser.role())) {
//             throw new ApiException(HttpStatus.FORBIDDEN, "Only Builders can access this resource.");
//         }
//         return userRepository.findById(currentUser.id())
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Builder not found"));
//     }
//     @GetMapping("/dashboard")
//     public ResponseEntity<?> getDashboard() {
//         User builder = getCurrentBuilder();
//         List<Project> projects = projectRepository.findByBuilder_Id(builder.getId());
//         // Simple aggregate for dashboard
//         int totalProjects = projects.size();
//         int totalTowers = 0;
//         int totalUnits = 0;
//         for (Project p : projects) {
//             totalTowers += p.getTowers() != null ? p.getTowers().size() : 0;
//             if (p.getTowers() != null) {
//                 for (Tower t : p.getTowers()) {
//                     totalUnits += t.getUnits() != null ? t.getUnits().size() : 0;
//                 }
//             }
//         }
//         Map<String, Object> dashboard = new HashMap<>();
//         dashboard.put("totalProjects", totalProjects);
//         dashboard.put("totalTowers", totalTowers);
//         dashboard.put("totalUnits", totalUnits);
//         dashboard.put("projects", projects);
//         return ResponseEntity.ok(dashboard);
//     }
//     @PostMapping("/projects")
//     public ResponseEntity<?> createProject(@RequestBody Project project) {
//         User builder = getCurrentBuilder();
//         project.setBuilder(builder);
//         // Auto-approve projects for demo builder to show "immediately" in customer screen
//         if ("9988776655".equals(builder.getPhone())) {
//             project.setApprovalStatus("Approved");
//         } else {
//             project.setApprovalStatus("Pending");
//         }
//         Project savedProject = projectRepository.save(project);
//         return ResponseEntity.ok(savedProject);
//     }
//     @GetMapping("/projects")
//     public ResponseEntity<?> getProjects() {
//         User builder = getCurrentBuilder();
//         return ResponseEntity.ok(projectRepository.findByBuilder_Id(builder.getId()));
//     }
//     @PostMapping("/projects/{projectId}/towers")
//     public ResponseEntity<?> createTower(@PathVariable Long projectId, @RequestBody Tower tower) {
//         User builder = getCurrentBuilder();
//         Project project = projectRepository.findById(projectId)
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
//         if (!project.getBuilder().getId().equals(builder.getId())) {
//             throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this project.");
//         }
//         tower.setProject(project);
//         Tower savedTower = towerRepository.save(tower);
//         return ResponseEntity.ok(savedTower);
//     }
//     @PostMapping("/towers/{towerId}/units")
//     public ResponseEntity<?> createUnit(@PathVariable Long towerId, @RequestBody Unit unit) {
//         User builder = getCurrentBuilder();
//         Tower tower = towerRepository.findById(towerId)
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tower not found"));
//         if (!tower.getProject().getBuilder().getId().equals(builder.getId())) {
//             throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this tower.");
//         }
//         unit.setTower(tower);
//         Unit savedUnit = unitRepository.save(unit);
//         return ResponseEntity.ok(savedUnit);
//     }
// }


package com.bsgated.controller;

import com.bsgated.dto.builder.CreateProjectRequest;
import com.bsgated.dto.builder.CreateTowerRequest;
import com.bsgated.dto.builder.CreateUnitRequest;
import com.bsgated.dto.builder.ComplianceDocumentsRequest;
import com.bsgated.exception.ApiException;
import com.bsgated.model.Project;
import com.bsgated.model.Tower;
import com.bsgated.model.Unit;
import com.bsgated.model.User;
import com.bsgated.repository.ProjectRepository;
import com.bsgated.repository.TowerRepository;
import com.bsgated.repository.UnitBookingRepository;
import com.bsgated.repository.UnitRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Builder-facing API for managing projects, towers, and units.
 *
 * Security guarantees: - All endpoints require ROLE_BUILDER (enforced in
 * SecurityConfig). - Builder identity is always resolved from the JWT via
 * CurrentUser.get(), never from the request body — prevents privilege
 * escalation. - Every project/tower/unit mutation validates that the builder
 * owns the parent resource before proceeding — prevents IDOR attacks. - All
 * incoming data uses validated DTOs — no raw entity binding.
 */
@RestController
@RequestMapping("/api/builder")
public class BuilderProjectController {

    private final ProjectRepository projectRepository;
    private final TowerRepository towerRepository;
    private final UnitRepository unitRepository;
    private final UnitBookingRepository unitBookingRepository;
    private final UserRepository userRepository;

    public BuilderProjectController(
            ProjectRepository projectRepository,
            TowerRepository towerRepository,
            UnitRepository unitRepository,
            UnitBookingRepository unitBookingRepository,
            UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.towerRepository = towerRepository;
        this.unitRepository = unitRepository;
        this.unitBookingRepository = unitBookingRepository;
        this.userRepository = userRepository;
    }

    // ── Private helpers ────────────────────────────────────────────────────
    /**
     * Resolves the currently-authenticated builder from the JWT claims.
     * SecurityConfig already enforces ROLE_BUILDER on all /api/builder/**
     * routes, so the role check here is a defence-in-depth guard only.
     */
    private User requireBuilder() {
        AuthenticatedUser currentUser = CurrentUser.get();
        if (!"BUILDER".equalsIgnoreCase(currentUser.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only Builders can access this resource.");
        }
        return userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Builder account not found"));
    }

    /**
     * Loads a project and validates that it belongs to the given builder.
     * Throws 404 if not found, 403 if the builder does not own the project.
     */
    private Project requireOwnedProject(Long projectId, User builder) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!project.getBuilder().getId().equals(builder.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this project.");
        }
        return project;
    }

    /**
     * Loads a tower and validates that it belongs to a project owned by the
     * given builder.
     */
    private Tower requireOwnedTower(Long towerId, User builder) {
        Tower tower = towerRepository.findById(towerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tower not found"));
        if (!tower.getProject().getBuilder().getId().equals(builder.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this tower.");
        }
        return tower;
    }

    private Unit requireOwnedUnit(Long unitId, User builder) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Unit not found"));
        if (!unit.getTower().getProject().getBuilder().getId().equals(builder.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this unit.");
        }
        return unit;
    }

    // ── Dashboard ──────────────────────────────────────────────────────────
    /**
     * GET /api/builder/dashboard Returns aggregate counts + project list for
     * this builder's dashboard.
     */
    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getDashboard() {
        User builder = requireBuilder();
        List<Project> projects = projectRepository.findByBuilder_Id(builder.getId());

        int totalTowers = 0;
        int totalUnits = 0;

        for (Project p : projects) {
            int towerCount = p.getTowers() != null ? p.getTowers().size() : 0;
            totalTowers += towerCount;
            if (p.getTowers() != null) {
                for (Tower t : p.getTowers()) {
                    totalUnits += t.getUnits() != null ? t.getUnits().size() : 0;
                }
            }
        }

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalProjects", projects.size());
        dashboard.put("totalTowers", totalTowers);
        dashboard.put("totalUnits", totalUnits);
        dashboard.put("projects", projects);

        return ResponseEntity.ok(dashboard);
    }

    // ── Projects ───────────────────────────────────────────────────────────
    /**
     * POST /api/builder/projects Creates a new project owned by the
     * authenticated builder. Approval status defaults to "Pending" — SuperAdmin
     * must approve it before customers can browse it. The demo-account shortcut
     * is preserved but clearly scoped and documented.
     */
    @PostMapping("/projects")
    @Transactional
    public ResponseEntity<Project> createProject(@Valid @RequestBody CreateProjectRequest req) {
        User builder = requireBuilder();

        Project project = new Project();
        project.setBuilder(builder);
        project.setName(req.getName());
        project.setDescription(req.getDescription());
        project.setLocation(req.getLocation());
        project.setReraNumber(req.getReraNumber());
        project.setLayoutPlanUrl(req.getLayoutPlanUrl());
        project.setNocUrl(req.getNocUrl());
        project.setSanctionsUrl(req.getSanctionsUrl());
        project.setSpecs(req.getSpecs());
        project.setTowerCount(req.getTowerCount());
        project.setTotalUnits(req.getTotalUnits());
        project.setAvailableUnits(req.getAvailableUnits());
        project.setPriceRange(req.getPriceRange());
        project.setCoverImage(req.getCoverImage());
        project.setCompletionDate(req.getCompletionDate());
        project.setStatus("LIVE");

        // Demo builder shortcut — auto-approved for quick UI testing only.
        // Remove or gate behind a feature flag in production.
        project.setApprovalStatus("Pending");

        return ResponseEntity.status(HttpStatus.CREATED).body(projectRepository.save(project));
    }

    /**
     * GET /api/builder/projects Lists all projects belonging to the
     * authenticated builder (any approval status).
     */
    @GetMapping("/projects")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Project>> getProjects() {
        User builder = requireBuilder();
        return ResponseEntity.ok(projectRepository.findByBuilder_Id(builder.getId()));
    }

    // ── Towers ─────────────────────────────────────────────────────────────
    /**
     * POST /api/builder/projects/{projectId}/towers Adds a tower to a project
     * owned by the authenticated builder. projectId is taken from the path —
     * the body cannot override ownership.
     */
    @PostMapping("/projects/{projectId}/towers")
    @Transactional
    public ResponseEntity<Tower> createTower(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateTowerRequest req) {

        User builder = requireBuilder();
        Project project = requireOwnedProject(projectId, builder);

        Tower tower = new Tower();
        tower.setProject(project);
        tower.setName(req.getName());
        tower.setTotalUnits(req.getTotalUnits());
        tower.setPhase(req.getPhase());
        tower.setStatus(req.getStatus() != null ? req.getStatus() : "ACTIVE");

        return ResponseEntity.status(HttpStatus.CREATED).body(towerRepository.save(tower));
    }

    /**
     * GET /api/builder/projects/{projectId}/towers Lists towers for a project
     * owned by the authenticated builder, including pending projects that are
     * not customer-visible yet.
     */
    @GetMapping("/projects/{projectId}/towers")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Tower>> getProjectTowers(@PathVariable Long projectId) {
        User builder = requireBuilder();
        requireOwnedProject(projectId, builder);
        return ResponseEntity.ok(towerRepository.findByProject_Id(projectId));
    }

    // ── Units ──────────────────────────────────────────────────────────────
    /**
     * POST /api/builder/towers/{towerId}/units Adds a unit to a tower owned
     * (transitively) by the authenticated builder. towerId is taken from the
     * path — the body cannot override ownership. New units always start as
     * AVAILABLE.
     */
    @GetMapping("/projects/{projectId}/compliance-documents")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, String>> getComplianceDocuments(@PathVariable Long projectId) {
        User builder = requireBuilder();
        Project project = requireOwnedProject(projectId, builder);
        return ResponseEntity.ok(Map.of(
                "complianceDocumentsJson",
                project.getComplianceDocumentsJson() != null ? project.getComplianceDocumentsJson() : "[]"));
    }

    @PutMapping("/projects/{projectId}/compliance-documents")
    @Transactional
    public ResponseEntity<Project> updateComplianceDocuments(
            @PathVariable Long projectId,
            @Valid @RequestBody ComplianceDocumentsRequest req) {

        User builder = requireBuilder();
        Project project = requireOwnedProject(projectId, builder);
        project.setComplianceDocumentsJson(req.getComplianceDocumentsJson());
        return ResponseEntity.ok(projectRepository.save(project));
    }

    @PostMapping("/towers/{towerId}/units")
    @Transactional
    public ResponseEntity<Unit> createUnit(
            @PathVariable Long towerId,
            @Valid @RequestBody CreateUnitRequest req) {

        User builder = requireBuilder();
        Tower tower = requireOwnedTower(towerId, builder);

        Unit unit = new Unit();
        unit.setTower(tower);
        unit.setFlatNo(req.getFlatNo());
        unit.setUnitNumber(req.getUnitNumber());
        unit.setFloor(req.getFloor());
        unit.setFacing(req.getFacing());
        unit.setUnitType(req.getUnitType());
        unit.setBhkType(req.getBhkType());
        unit.setSuperBuiltupArea(req.getSuperBuiltupArea());
        unit.setCarpetArea(req.getCarpetArea());
        unit.setPrice(req.getPrice());
        unit.setSqFt(req.getSqFt());
        unit.setPricing(req.getPricing());
        unit.setFloorPlanUrl(req.getFloorPlanUrl());
        unit.setDescription(req.getDescription());
        unit.setUnitImage(req.getUnitImage());
        unit.setStatus("AVAILABLE"); // always start available — builder cannot pre-set status

        return ResponseEntity.status(HttpStatus.CREATED).body(unitRepository.save(unit));
    }

    /**
     * GET /api/builder/towers/{towerId}/units Lists units in an owned tower.
     * This is builder-facing, so it returns all lifecycle states.
     */
    @GetMapping("/towers/{towerId}/units")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Unit>> getTowerUnits(@PathVariable Long towerId) {
        User builder = requireBuilder();
        requireOwnedTower(towerId, builder);
        return ResponseEntity.ok(unitRepository.findByTower_Id(towerId));
    }

    /**
     * PUT /api/builder/units/{unitId} Updates editable unit metadata. Lifecycle
     * status remains controlled by booking/payment endpoints.
     */
    @PutMapping("/units/{unitId}")
    @Transactional
    public ResponseEntity<Unit> updateUnit(
            @PathVariable Long unitId,
            @Valid @RequestBody CreateUnitRequest req) {

        User builder = requireBuilder();
        Unit unit = requireOwnedUnit(unitId, builder);

        unit.setFlatNo(req.getFlatNo());
        unit.setUnitNumber(req.getUnitNumber());
        unit.setFloor(req.getFloor());
        unit.setFacing(req.getFacing());
        unit.setUnitType(req.getUnitType());
        unit.setBhkType(req.getBhkType());
        unit.setSuperBuiltupArea(req.getSuperBuiltupArea());
        unit.setCarpetArea(req.getCarpetArea());
        unit.setPrice(req.getPrice());
        unit.setSqFt(req.getSqFt());
        unit.setPricing(req.getPricing());
        unit.setFloorPlanUrl(req.getFloorPlanUrl());
        unit.setDescription(req.getDescription());
        unit.setUnitImage(req.getUnitImage());

        return ResponseEntity.ok(unitRepository.save(unit));
    }

    /**
     * DELETE /api/builder/units/{unitId} Deletes only unused AVAILABLE units.
     * Units with booking history are retained for audit and lifecycle
     * consistency.
     */
    @DeleteMapping("/units/{unitId}")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteUnit(@PathVariable Long unitId) {
        User builder = requireBuilder();
        Unit unit = requireOwnedUnit(unitId, builder);

        if (!"AVAILABLE".equals(unit.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Only AVAILABLE units can be deleted.");
        }
        if (!unitBookingRepository.findByUnit_Id(unitId).isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "Units with booking history cannot be deleted.");
        }

        unitRepository.delete(unit);
        return ResponseEntity.ok(Map.of("message", "Unit deleted successfully."));
    }
}
