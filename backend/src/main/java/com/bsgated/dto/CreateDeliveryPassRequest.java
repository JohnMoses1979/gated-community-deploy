// src/main/java/com/bsgated/dto/CreateDeliveryPassRequest.java
package com.bsgated.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateDeliveryPassRequest {

    private String hostResidentId;

    private String hostResidentName;

    @NotBlank(message = "Host unit is required")
    @Size(max = 50, message = "Host unit must be under 50 characters")
    private String hostUnit;

    @NotBlank(message = "Provider is required")
    @Size(max = 80, message = "Provider must be under 80 characters")
    private String provider;

    @Size(max = 80, message = "Expected window must be under 80 characters")
    private String expectedWindow;

    // Optional
    @Size(max = 100, message = "Delivery person name must be under 100 characters")
    private String deliveryPersonName;

    @Size(max = 20, message = "Delivery person phone must be under 20 characters")
    private String deliveryPersonPhone;

    public String getHostResidentId() {
        return hostResidentId;
    }

    public void setHostResidentId(String v) {
        this.hostResidentId = v;
    }

    public String getHostResidentName() {
        return hostResidentName;
    }

    public void setHostResidentName(String v) {
        this.hostResidentName = v;
    }

    public String getHostUnit() {
        return hostUnit;
    }

    public void setHostUnit(String v) {
        this.hostUnit = v;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String v) {
        this.provider = v;
    }

    public String getExpectedWindow() {
        return expectedWindow;
    }

    public void setExpectedWindow(String v) {
        this.expectedWindow = v;
    }

    public String getDeliveryPersonName() {
        return deliveryPersonName;
    }

    public void setDeliveryPersonName(String v) {
        this.deliveryPersonName = v;
    }

    public String getDeliveryPersonPhone() {
        return deliveryPersonPhone;
    }

    public void setDeliveryPersonPhone(String v) {
        this.deliveryPersonPhone = v;
    }
}
