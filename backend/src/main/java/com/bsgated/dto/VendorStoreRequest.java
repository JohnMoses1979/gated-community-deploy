package com.bsgated.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /api/vendor/store  and  PUT /api/vendor/store
 *
 * All fields are optional on update — only non-null values are applied.
 * On create, storeName is required.
 */
public class VendorStoreRequest {

    // ── Common ────────────────────────────────────────────────────────────────
    @NotBlank(message = "Store name is required")
    @Size(max = 120, message = "Store name must be under 120 characters")
    private String storeName;

    @Size(max = 2000, message = "Description must be under 2000 characters")
    private String description;

    @Size(max = 80)
    private String category;

    @Size(max = 80)
    private String subcategory;

    @Size(max = 500)
    private String logoUrl;

    @Size(max = 500)
    private String bannerUrl;

    @Size(max = 15)
    private String contactPhone;

    @Size(max = 255)
    private String address;

    /** JSON string — validated loosely; detailed schema is frontend's responsibility */
    private String timingsJson;

    private Boolean vacationMode;

    // ── Marketplace-specific ─────────────────────────────────────────────────
    private Double deliveryRadiusKm;
    private Double deliveryCharge;
    private Double minOrderAmount;

    /** DELIVERY | PICKUP | BOTH */
    @Size(max = 20)
    private String deliveryMode;

    @Size(max = 50)
    private String estimatedDeliveryTime;

    // ── Business-specific ────────────────────────────────────────────────────
    private Double serviceRadiusKm;

    /** APPOINTMENT | WALK_IN | BOTH */
    @Size(max = 20)
    private String serviceMode;

    private String appointmentSlotsJson;

    // ── Getters & Setters ─────────────────────────────────────────────────────

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

    public Boolean getVacationMode() { return vacationMode; }
    public void setVacationMode(Boolean vacationMode) { this.vacationMode = vacationMode; }

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
}
