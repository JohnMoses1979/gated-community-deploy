package com.bsgated.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for a builder approving or rejecting a booking. Accepts only a safe
 * whitelist of status values.
 */
public class BookingStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "APPROVED|REJECTED|CANCELLED",
            message = "Status must be one of: APPROVED, REJECTED, CANCELLED")
    private String status;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
