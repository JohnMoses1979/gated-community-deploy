package com.bsgated.dto;

import jakarta.validation.constraints.Size;

/**
 * Used for PUT /api/vendor/store — every field is optional.
 * Only non-null fields overwrite the stored value.
 */
public class VendorStoreUpdateRequest {

    @Size(max = 120)
    private String storeName;

    @Size(max = 2000)
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

    private String timingsJson;
    private Boolean vacationMode;

    // marketplace
    private Double deliveryRadiusKm;
    private Double deliveryCharge;
    private Double minOrderAmount;

    @Size(max = 20)
    private String deliveryMode;

    @Size(max = 50)
    private String estimatedDeliveryTime;

    // business
    private Double serviceRadiusKm;

    @Size(max = 20)
    private String serviceMode;

    private String appointmentSlotsJson;

    // Getters & Setters

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
