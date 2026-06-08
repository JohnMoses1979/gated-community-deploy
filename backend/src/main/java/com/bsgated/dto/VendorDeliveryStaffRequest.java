package com.bsgated.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /api/vendor/delivery-staff and PUT
 * /api/vendor/delivery-staff/{id}
 */
public class VendorDeliveryStaffRequest {

    @NotBlank(message = "Helper name is required")
    @Size(max = 120, message = "Name must be under 120 characters")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone must contain 10 to 15 digits")
    private String phone;

    /**
     * e.g. "Bike", "Cycle", "Auto", "Walk"
     */
    @Size(max = 50, message = "Vehicle type must be under 50 characters")
    private String vehicleType;

    /**
     * Default true — can be set to false on update to deactivate
     */
    private Boolean active;

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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
