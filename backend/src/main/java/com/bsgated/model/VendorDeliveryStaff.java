package com.bsgated.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * VendorDeliveryStaff — operational helper records maintained by a vendor.
 *
 * IMPORTANT: - These are NOT platform users. - NO login credentials, NO
 * password, NO JWT. - Purely sub-records under a vendor for delivery
 * assignment. - vendorId references users.id where role = 'vendor'.
 */
@Entity
@Table(name = "vendor_delivery_staff", indexes = {
    @Index(name = "idx_vds_vendor", columnList = "vendorId"),
    @Index(name = "idx_vds_vendor_active", columnList = "vendorId, active")
})
public class VendorDeliveryStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Owner ─────────────────────────────────────────────────────────────────
    /**
     * FK to users.id (vendor). Vendor manages this helper.
     */
    @Column(nullable = false)
    private Long vendorId;

    // ── Helper identity ───────────────────────────────────────────────────────
    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    /**
     * e.g. "Bike", "Cycle", "Auto", "Walk"
     */
    @Column(length = 50)
    private String vehicleType;

    // ── Status ────────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private boolean active = true;

    // ── Timestamps ────────────────────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() {
        return id;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
