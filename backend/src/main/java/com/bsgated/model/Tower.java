// package com.bsgated.model;
// import com.fasterxml.jackson.annotation.JsonIgnore;
// import jakarta.persistence.*;
// import java.util.Set;
// import java.util.HashSet;
// @Entity
// @Table(name = "towers")
// public class Tower {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "project_id")
//     @JsonIgnore
//     private Project project;
//     private String name;
//     private Integer totalUnits;
//     private String phase;
//     private String status = "ACTIVE";
//     @OneToMany(mappedBy = "tower", cascade = CascadeType.ALL)
//     private Set<Unit> units = new HashSet<>();
//     public Tower() {
//     }
//     // Getters and Setters
//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }
//     public Project getProject() { return project; }
//     public void setProject(Project project) { this.project = project; }
//     public String getName() { return name; }
//     public void setName(String name) { this.name = name; }
//     public Integer getTotalUnits() { return totalUnits; }
//     public void setTotalUnits(Integer totalUnits) { this.totalUnits = totalUnits; }
//     public String getPhase() { return phase; }
//     public void setPhase(String phase) { this.phase = phase; }
//     public String getStatus() { return status; }
//     public void setStatus(String status) { this.status = status; }
//     public Set<Unit> getUnits() { return units; }
//     public void setUnits(Set<Unit> units) { this.units = units; }
// }
package com.bsgated.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Tower entity — a building block (e.g. "Tower A") within a Project.
 *
 * JPA relationship notes: - project: LAZY fetch, @JsonIgnore — no circular
 * serialisation. projectId is exposed as a computed @JsonProperty. - units:
 * LAZY fetch, cascaded ALL with orphanRemoval so deleting a tower also removes
 * its units. @JsonIgnore prevents huge payloads and infinite recursion (Unit →
 * Tower → Project → Tower…). Clients fetch units via
 * /api/customer/projects/towers/{id}/units.
 */
@Entity
@Table(name = "towers")
public class Tower {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;

    @Column(nullable = false)
    private String name;

    private Integer totalUnits;

    private String phase;

    private String status = "ACTIVE";

    @OneToMany(mappedBy = "tower",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Unit> units = new HashSet<>();

    public Tower() {
    }

    // ── Computed JSON fields ───────────────────────────────────────────────
    /**
     * Exposes the parent project ID without loading the full Project graph.
     */
    @JsonProperty("projectId")
    public Long getProjectId() {
        return project != null ? project.getId() : null;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(Integer totalUnits) {
        this.totalUnits = totalUnits;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    /**
     * Internal use only — not serialised.
     */
    public Set<Unit> getUnits() {
        return units;
    }

    public void setUnits(Set<Unit> units) {
        this.units = units;
    }
}
