// package com.bsgated.repository;
// import com.bsgated.model.Project;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;
// import java.util.List;
// @Repository
// public interface ProjectRepository extends JpaRepository<Project, Long> {
//     /** Correct Spring Data JPA syntax: traverse builder → id */
//     List<Project> findByBuilder_Id(Long builderId);
//     @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"towers", "towers.units"})
//     java.util.List<Project> findAll();
// }
package com.bsgated.repository;

import com.bsgated.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ProjectRepository — Spring Data JPA repository for Project entities.
 *
 * Key query methods: - findByBuilder_Id: builder dashboard — all projects
 * regardless of approval. - findByApprovalStatusAndStatus: customer browsing —
 * only Approved + LIVE projects. - findAll (EntityGraph): admin/superadmin
 * views that need towers + units in one query.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Returns all projects belonging to a specific builder (any approval
     * status). Used by the builder dashboard endpoint.
     */
    List<Project> findByBuilder_Id(Long builderId);

    /**
     * Returns projects matching BOTH approvalStatus AND status. Used by the
     * customer browsing endpoint to show only "Approved" + "LIVE" projects.
     *
     * Example: findByApprovalStatusAndStatus("Approved", "LIVE")
     */
    List<Project> findByApprovalStatusAndStatus(String approvalStatus, String status);

    /**
     * Eagerly fetches towers and their units in one query to avoid N+1 on the
     * builder dashboard or admin views. Not used by the customer endpoints
     * (which intentionally keep projects and towers separate).
     */
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"towers", "towers.units"})
    java.util.List<Project> findAll();
}
