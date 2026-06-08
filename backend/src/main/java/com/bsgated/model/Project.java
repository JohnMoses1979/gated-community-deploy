// package com.bsgated.model;
// import com.fasterxml.jackson.annotation.JsonIgnore;
// import com.fasterxml.jackson.annotation.JsonProperty;
// import jakarta.persistence.*;
// import java.time.LocalDateTime;
// import java.util.Set;
// import java.util.HashSet;
// @Entity
// @Table(name = "projects")
// public class Project {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "builder_id")
//     @JsonIgnore
//     private User builder;
//     private String name;
//     @Column(columnDefinition = "TEXT")
//     private String description;
//     private String location;
//     private String reraNumber;
//     private String layoutPlanUrl;
//     private String nocUrl;
//     private String sanctionsUrl;
//     @Column(columnDefinition = "TEXT")
//     private String specs;
//     private String approvalStatus = "Pending";
//     private Integer towerCount;
//     private Integer totalUnits;
//     private Integer availableUnits;
//     private String priceRange;
//     @Column(length = 1000)
//     private String coverImage;
//     private String completionDate;
//     private String status = "LIVE"; // DRAFT, LIVE
//     private LocalDateTime createdAt = LocalDateTime.now();
//     @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
//     private Set<Tower> towers = new HashSet<>();
//     public Project() {
//     }
//     // Getters and Setters
//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }
//     public User getBuilder() { return builder; }
//     public void setBuilder(User builder) { this.builder = builder; }
//     /** Exposed in JSON for convenience — SuperAdmin screens use this */
//     @JsonProperty("builderId")
//     public Long getBuilderId() { return builder != null ? builder.getId() : null; }
//     @JsonProperty("builderName")
//     public String getBuilderName() { return builder != null ? builder.getName() : null; }
//     @JsonProperty("projectName")
//     public String getName() { return name; }
//     public void setName(String name) { this.name = name; }
//     public String getDescription() { return description; }
//     public void setDescription(String description) { this.description = description; }
//     public String getLocation() { return location; }
//     public void setLocation(String location) { this.location = location; }
//     public String getReraNumber() { return reraNumber; }
//     public void setReraNumber(String reraNumber) { this.reraNumber = reraNumber; }
//     public String getLayoutPlanUrl() { return layoutPlanUrl; }
//     public void setLayoutPlanUrl(String layoutPlanUrl) { this.layoutPlanUrl = layoutPlanUrl; }
//     public String getNocUrl() { return nocUrl; }
//     public void setNocUrl(String nocUrl) { this.nocUrl = nocUrl; }
//     public String getSanctionsUrl() { return sanctionsUrl; }
//     public void setSanctionsUrl(String sanctionsUrl) { this.sanctionsUrl = sanctionsUrl; }
//     public String getSpecs() { return specs; }
//     public void setSpecs(String specs) { this.specs = specs; }
//     public String getApprovalStatus() { return approvalStatus; }
//     public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
//     public Integer getTowerCount() { return towerCount; }
//     public void setTowerCount(Integer towerCount) { this.towerCount = towerCount; }
//     public Integer getTotalUnits() { return totalUnits; }
//     public void setTotalUnits(Integer totalUnits) { this.totalUnits = totalUnits; }
//     public Integer getAvailableUnits() { return availableUnits; }
//     public void setAvailableUnits(Integer availableUnits) { this.availableUnits = availableUnits; }
//     public String getPriceRange() { return priceRange; }
//     public void setPriceRange(String priceRange) { this.priceRange = priceRange; }
//     public String getCoverImage() { return coverImage; }
//     public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
//     public String getCompletionDate() { return completionDate; }
//     public void setCompletionDate(String completionDate) { this.completionDate = completionDate; }
//     public String getStatus() { return status; }
//     public void setStatus(String status) { this.status = status; }
//     public LocalDateTime getCreatedAt() { return createdAt; }
//     public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
//     public Set<Tower> getTowers() { return towers; }
//     public void setTowers(Set<Tower> towers) { this.towers = towers; }
// }
package com.bsgated.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Project entity — represents a real-estate project created by a Builder.
 *
 * JPA relationship notes: - builder: LAZY fetch (never serialised —
 * @JsonIgnore). builderId / builderName are exposed as computed @JsonProperty
 * getters to avoid N+1 and circular refs. - towers: LAZY fetch, cascaded ALL
 * with orphanRemoval=true so deleting a project also deletes its towers and
 * (via Tower cascade) their units. - @JsonIgnore on builder + towers avoids
 * circular serialisation. Towers are intentionally excluded from Project JSON —
 * clients fetch them via /api/customer/projects/{id}/towers or the builder
 * dashboard endpoint.
 */
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Many projects belong to one builder — loaded lazily, never serialised.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "builder_id", nullable = false)
    @JsonIgnore
    private User builder;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String location;

    private String reraNumber;

    @Column(length = 1000)
    private String layoutPlanUrl;

    @Column(length = 1000)
    private String nocUrl;

    @Column(length = 1000)
    private String sanctionsUrl;

    @Column(columnDefinition = "TEXT")
    private String specs;

    /**
     * "Pending" | "Approved" | "Rejected" SuperAdmin controls this. Customers
     * can only see "Approved" projects.
     */
    private String approvalStatus = "Pending";

    private Integer towerCount;
    private Integer totalUnits;
    private Integer availableUnits;
    private String priceRange;

    @Column(length = 1000)
    private String coverImage;

    private String completionDate;

    /**
     * "LIVE" | "DRAFT" Builder controls this. Customers only see "LIVE"
     * projects.
     */
    private String status = "LIVE";

    private LocalDateTime createdAt = LocalDateTime.now();
    // When SuperAdmin reviews a project these fields are set
    private LocalDateTime reviewedAt;
    @Column(columnDefinition = "TEXT")
    private String reviewMessage;

    @Column(columnDefinition = "TEXT")
    private String complianceDocumentsJson;

    /**
     * Towers are excluded from Project JSON — fetched separately to avoid large
     * payloads and potential circular refs. orphanRemoval: deleting the project
     * also removes orphaned towers.
     */
    @OneToMany(mappedBy = "project",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Tower> towers = new HashSet<>();

    public Project() {
    }

    // ── Computed JSON fields ───────────────────────────────────────────────
    /**
     * Exposes builderId without serialising the full User graph.
     */
    @JsonProperty("builderId")
    public Long getBuilderId() {
        return builder != null ? builder.getId() : null;
    }

    /**
     * Exposes builder display name for admin/list views.
     */
    @JsonProperty("builderName")
    public String getBuilderName() {
        return builder != null ? builder.getName() : null;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getBuilder() {
        return builder;
    }

    public void setBuilder(User builder) {
        this.builder = builder;
    }

    @JsonProperty("projectName")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getReraNumber() {
        return reraNumber;
    }

    public void setReraNumber(String reraNumber) {
        this.reraNumber = reraNumber;
    }

    public String getLayoutPlanUrl() {
        return layoutPlanUrl;
    }

    public void setLayoutPlanUrl(String layoutPlanUrl) {
        this.layoutPlanUrl = layoutPlanUrl;
    }

    public String getNocUrl() {
        return nocUrl;
    }

    public void setNocUrl(String nocUrl) {
        this.nocUrl = nocUrl;
    }

    public String getSanctionsUrl() {
        return sanctionsUrl;
    }

    public void setSanctionsUrl(String sanctionsUrl) {
        this.sanctionsUrl = sanctionsUrl;
    }

    public String getSpecs() {
        return specs;
    }

    public void setSpecs(String specs) {
        this.specs = specs;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public Integer getTowerCount() {
        return towerCount;
    }

    public void setTowerCount(Integer towerCount) {
        this.towerCount = towerCount;
    }

    public Integer getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(Integer totalUnits) {
        this.totalUnits = totalUnits;
    }

    public Integer getAvailableUnits() {
        return availableUnits;
    }

    public void setAvailableUnits(Integer availableUnits) {
        this.availableUnits = availableUnits;
    }

    public String getPriceRange() {
        return priceRange;
    }

    public void setPriceRange(String priceRange) {
        this.priceRange = priceRange;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(String completionDate) {
        this.completionDate = completionDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getReviewMessage() {
        return reviewMessage;
    }

    public void setReviewMessage(String reviewMessage) {
        this.reviewMessage = reviewMessage;
    }

    public String getComplianceDocumentsJson() {
        return complianceDocumentsJson;
    }

    public void setComplianceDocumentsJson(String complianceDocumentsJson) {
        this.complianceDocumentsJson = complianceDocumentsJson;
    }

    /**
     * Internal use only — not serialised. Use /towers endpoint instead.
     */
    public Set<Tower> getTowers() {
        return towers;
    }

    public void setTowers(Set<Tower> towers) {
        this.towers = towers;
    }
}
