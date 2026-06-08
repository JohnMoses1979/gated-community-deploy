// package com.bsgated.model;
// import jakarta.persistence.*;
// import java.time.LocalDateTime;
// @Entity
// @Table(name = "site_visits")
// public class SiteVisit {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "customer_id")
//     private User customer;
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "project_id")
//     private Project project;
//     private LocalDateTime scheduledDate;
//     private String status = "REQUESTED"; // REQUESTED, CONFIRMED, COMPLETED, CANCELLED
//     private LocalDateTime createdAt = LocalDateTime.now();
//     public SiteVisit() {}
//     // Getters and setters
//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }
//     public User getCustomer() { return customer; }
//     public void setCustomer(User customer) { this.customer = customer; }
//     public Project getProject() { return project; }
//     public void setProject(Project project) { this.project = project; }
//     public LocalDateTime getScheduledDate() { return scheduledDate; }
//     public void setScheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; }
//     public String getStatus() { return status; }
//     public void setStatus(String status) { this.status = status; }
//     public LocalDateTime getCreatedAt() { return createdAt; }
//     public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
// }
package com.bsgated.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * SiteVisit entity — a customer's scheduled visit to a project site.
 *
 * JPA relationship notes: - customer / project: LAZY fetch,
 * @JsonIgnoreProperties to expose only safe fields. - No cascades — deleting a
 * visit must not touch the customer or project records.
 */
@Entity
@Table(name = "site_visits")
public class SiteVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"password", "documentsJson", "approvalStatus", "verificationStatus"})
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"towers", "builder"})
    private Project project;

    private LocalDateTime scheduledDate;

    private Long unitId;

    private String unitNumber;

    private String unitType;

    @Column(columnDefinition = "TEXT")
    private String message;

    /**
     * "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
     */
    private String status = "REQUESTED";

    private LocalDateTime createdAt = LocalDateTime.now();

    public SiteVisit() {
    }

    // ── Convenience JSON properties ────────────────────────────────────────
    @JsonProperty("customerId")
    public Long getCustomerId() {
        return customer != null ? customer.getId() : null;
    }

    @JsonProperty("customerName")
    public String getCustomerName() {
        return customer != null ? customer.getName() : null;
    }

    @JsonProperty("customerPhone")
    public String getCustomerPhone() {
        return customer != null ? customer.getPhone() : null;
    }

    @JsonProperty("projectId")
    public Long getProjectId() {
        return project != null ? project.getId() : null;
    }

    @JsonProperty("projectName")
    public String getProjectName() {
        return project != null ? project.getName() : null;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public Long getUnitId() {
        return unitId;
    }

    public void setUnitId(Long unitId) {
        this.unitId = unitId;
    }

    public String getUnitNumber() {
        return unitNumber;
    }

    public void setUnitNumber(String unitNumber) {
        this.unitNumber = unitNumber;
    }

    public String getUnitType() {
        return unitType;
    }

    public void setUnitType(String unitType) {
        this.unitType = unitType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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
}
