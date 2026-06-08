package com.bsgated.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request body for PUT /api/vendor/orders/{id}/assign-delivery
 *
 * Vendor sends the delivery staff ID. Backend resolves name, phone, vehicleType
 * from the VendorDeliveryStaff table and stores a snapshot into the order.
 */
public class AssignDeliveryStaffRequest {

    @NotNull(message = "deliveryStaffId is required")
    private Long deliveryStaffId;

    public Long getDeliveryStaffId() {
        return deliveryStaffId;
    }

    public void setDeliveryStaffId(Long deliveryStaffId) {
        this.deliveryStaffId = deliveryStaffId;
    }
}
