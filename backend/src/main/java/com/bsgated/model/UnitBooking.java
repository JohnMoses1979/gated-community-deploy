// package com.bsgated.model;
// import jakarta.persistence.*;
// import java.time.LocalDateTime;
// @Entity
// @Table(name = "unit_bookings")
// public class UnitBooking {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "customer_id")
//     private User customer;
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "unit_id")
//     private Unit unit;
//     @Column(columnDefinition = "TEXT")
//     private String kycDocumentsJson;
//     private String digitalSignatureUrl;
//     private String status = "PENDING"; // PENDING, APPROVED, REJECTED, CANCELLED
//     private Boolean softPossessionStatus = false;
//     private String possessionLetterUrl;
//     private LocalDateTime createdAt = LocalDateTime.now();
//     public UnitBooking() {}
//     // Getters and setters
//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }
//     public User getCustomer() { return customer; }
//     public void setCustomer(User customer) { this.customer = customer; }
//     public Unit getUnit() { return unit; }
//     public void setUnit(Unit unit) { this.unit = unit; }
//     public String getKycDocumentsJson() { return kycDocumentsJson; }
//     public void setKycDocumentsJson(String kycDocumentsJson) { this.kycDocumentsJson = kycDocumentsJson; }
//     public String getDigitalSignatureUrl() { return digitalSignatureUrl; }
//     public void setDigitalSignatureUrl(String digitalSignatureUrl) { this.digitalSignatureUrl = digitalSignatureUrl; }
//     public String getStatus() { return status; }
//     public void setStatus(String status) { this.status = status; }
//     public Boolean getSoftPossessionStatus() { return softPossessionStatus; }
//     public void setSoftPossessionStatus(Boolean softPossessionStatus) { this.softPossessionStatus = softPossessionStatus; }
//     public String getPossessionLetterUrl() { return possessionLetterUrl; }
//     public void setPossessionLetterUrl(String possessionLetterUrl) { this.possessionLetterUrl = possessionLetterUrl; }
//     public LocalDateTime getCreatedAt() { return createdAt; }
//     public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
// }



package com.bsgated.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * UnitBooking entity — records a customer's reservation of a unit.
 *
 * JPA relationship notes: - customer / unit: LAZY fetch with
 * @JsonIgnoreProperties to expose only the fields needed by the client,
 * avoiding circular serialisation and over-fetching. - No CascadeType on
 * customer / unit — we never want to accidentally delete a User or Unit by
 * deleting a booking. - installments (OneToMany) are fetched separately via
 * /api/payments endpoints.
 *
 * Status lifecycle: PENDING → APPROVED (unit: HOLD → SOLD) ↘ REJECTED (unit:
 * HOLD → AVAILABLE) ↘ CANCELLED (unit: HOLD → AVAILABLE)
 */
@Entity
@Table(name = "unit_bookings")
public class UnitBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The customer who made the booking.
     *
     * @JsonIgnoreProperties exposes only safe fields — avoids password / full
     * graph leak.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"password", "documentsJson", "approvalStatus", "verificationStatus"})
    private User customer;

    /**
     * The unit being booked.
     *
     * @JsonIgnoreProperties prevents the Tower → Project → Builder chain from
     * serialising.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    @JsonIgnoreProperties({"tower"})
    private Unit unit;

    @Column(columnDefinition = "TEXT")
    private String kycDocumentsJson;

    @Column(length = 1000)
    private String digitalSignatureUrl;

    /**
     * "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
     */
    private String status = "PENDING";

    private Boolean softPossessionStatus = false;

    @Column(length = 1000)
    private String possessionLetterUrl;

    private LocalDateTime createdAt = LocalDateTime.now();

    public UnitBooking() {
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

    @JsonProperty("unitId")
    public Long getUnitId() {
        return unit != null ? unit.getId() : null;
    }

    @JsonProperty("flatNo")
    public String getFlatNo() {
        return unit != null ? unit.getFlatNo() : null;
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

    public Unit getUnit() {
        return unit;
    }

    public void setUnit(Unit unit) {
        this.unit = unit;
    }

    public String getKycDocumentsJson() {
        return kycDocumentsJson;
    }

    public void setKycDocumentsJson(String kycDocumentsJson) {
        this.kycDocumentsJson = kycDocumentsJson;
    }

    public String getDigitalSignatureUrl() {
        return digitalSignatureUrl;
    }

    public void setDigitalSignatureUrl(String digitalSignatureUrl) {
        this.digitalSignatureUrl = digitalSignatureUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getSoftPossessionStatus() {
        return softPossessionStatus;
    }

    public void setSoftPossessionStatus(Boolean softPossessionStatus) {
        this.softPossessionStatus = softPossessionStatus;
    }

    public String getPossessionLetterUrl() {
        return possessionLetterUrl;
    }

    public void setPossessionLetterUrl(String possessionLetterUrl) {
        this.possessionLetterUrl = possessionLetterUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
