package com.bsgated.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * VendorStore — one store per vendor (vendorId is unique).
 *
 * Marketplace vendors and business vendors have different schemas:
 *  - Marketplace: online store, delivery settings, product catalogue.
 *  - Business:    physical/service shop, service radius, appointment slots.
 *
 * Both share the base fields; type-specific fields are nullable for the
 * other type so a single table can hold both without a join.
 */
@Entity
@Table(name = "vendor_stores")
public class VendorStore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Owner ────────────────────────────────────────────────────────────────
    @Column(nullable = false, unique = true)
    private Long vendorId;                // FK to users.id

    /** "marketplace" | "business" — copied from User.vendorType at creation */
    @Column(nullable = false, length = 20)
    private String vendorType;

    // ── Common fields ────────────────────────────────────────────────────────
    @Column(nullable = false, length = 120)
    private String storeName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 80)
    private String category;              // e.g. "Grocery", "Electronics"

    @Column(length = 80)
    private String subcategory;           // e.g. "Dairy", "Fruits & Veg"

    @Column(length = 500)
    private String logoUrl;

    @Column(length = 500)
    private String bannerUrl;

    @Column(length = 15)
    private String contactPhone;

    @Column(length = 255)
    private String address;

    /** JSON array of operating hours per day, e.g.:
     *  [{"day":"MON","open":"09:00","close":"21:00","closed":false}, ...] */
    @Column(columnDefinition = "TEXT")
    private String timingsJson;

    private boolean isActive = true;
    private boolean vacationMode = false;

    // ── Marketplace-specific ─────────────────────────────────────────────────
    /** km — how far the vendor will deliver */
    private Double deliveryRadiusKm;

    /** ₹ delivery charge per order (0 = free) */
    private Double deliveryCharge;

    /** ₹ minimum order amount to place an order */
    private Double minOrderAmount;

    /** "DELIVERY" | "PICKUP" | "BOTH" */
    @Column(length = 20)
    private String deliveryMode;

    /** Estimated delivery time string, e.g. "30-45 mins" */
    @Column(length = 50)
    private String estimatedDeliveryTime;

    // ── Business-specific ────────────────────────────────────────────────────
    /** km service radius for physical/service vendors */
    private Double serviceRadiusKm;

    /** "APPOINTMENT" | "WALK_IN" | "BOTH" */
    @Column(length = 20)
    private String serviceMode;

    /** JSON array of appointment slot templates */
    @Column(columnDefinition = "TEXT")
    private String appointmentSlotsJson;

    // ── Timestamps ───────────────────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorType() { return vendorType; }
    public void setVendorType(String vendorType) { this.vendorType = vendorType; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getTimingsJson() { return timingsJson; }
    public void setTimingsJson(String timingsJson) { this.timingsJson = timingsJson; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public boolean isVacationMode() { return vacationMode; }
    public void setVacationMode(boolean vacationMode) { this.vacationMode = vacationMode; }

    public Double getDeliveryRadiusKm() { return deliveryRadiusKm; }
    public void setDeliveryRadiusKm(Double deliveryRadiusKm) { this.deliveryRadiusKm = deliveryRadiusKm; }

    public Double getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(Double deliveryCharge) { this.deliveryCharge = deliveryCharge; }

    public Double getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Double minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public String getDeliveryMode() { return deliveryMode; }
    public void setDeliveryMode(String deliveryMode) { this.deliveryMode = deliveryMode; }

    public String getEstimatedDeliveryTime() { return estimatedDeliveryTime; }
    public void setEstimatedDeliveryTime(String estimatedDeliveryTime) { this.estimatedDeliveryTime = estimatedDeliveryTime; }

    public Double getServiceRadiusKm() { return serviceRadiusKm; }
    public void setServiceRadiusKm(Double serviceRadiusKm) { this.serviceRadiusKm = serviceRadiusKm; }

    public String getServiceMode() { return serviceMode; }
    public void setServiceMode(String serviceMode) { this.serviceMode = serviceMode; }

    public String getAppointmentSlotsJson() { return appointmentSlotsJson; }
    public void setAppointmentSlotsJson(String appointmentSlotsJson) { this.appointmentSlotsJson = appointmentSlotsJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
