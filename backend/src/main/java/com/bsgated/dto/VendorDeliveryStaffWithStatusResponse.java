package com.bsgated.dto;

import com.bsgated.model.VendorDeliveryStaff;
import java.time.LocalDateTime;

public class VendorDeliveryStaffWithStatusResponse {

    private Long id;
    private Long vendorId;
    private String name;
    private String phone;
    private String vehicleType;
    private boolean active;
    private boolean busy;   // <-- NEW: true if helper has an in-progress order
    private LocalDateTime createdAt;

    public static VendorDeliveryStaffWithStatusResponse from(
            VendorDeliveryStaff staff, boolean busy) {
        VendorDeliveryStaffWithStatusResponse r = new VendorDeliveryStaffWithStatusResponse();
        r.id = staff.getId();
        r.vendorId = staff.getVendorId();
        r.name = staff.getName();
        r.phone = staff.getPhone();
        r.vehicleType = staff.getVehicleType();
        r.active = staff.isActive();
        r.busy = busy;
        r.createdAt = staff.getCreatedAt();
        return r;
    }

    // getters ...
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

    public boolean isBusy() {
        return busy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
