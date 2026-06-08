package com.bsgated.dto;

import com.bsgated.model.VendorDeliveryStaff;

import java.time.LocalDateTime;

/**
 * Response for delivery staff — safe to expose, no sensitive fields.
 */
public class VendorDeliveryStaffResponse {

    private Long id;
    private Long vendorId;
    private String name;
    private String phone;
    private String vehicleType;
    private boolean active;
    private LocalDateTime createdAt;

    public static VendorDeliveryStaffResponse from(VendorDeliveryStaff staff) {
        VendorDeliveryStaffResponse r = new VendorDeliveryStaffResponse();
        r.id = staff.getId();
        r.vendorId = staff.getVendorId();
        r.name = staff.getName();
        r.phone = staff.getPhone();
        r.vehicleType = staff.getVehicleType();
        r.active = staff.isActive();
        r.createdAt = staff.getCreatedAt();
        return r;
    }

    public Long getId() {
        return id;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
