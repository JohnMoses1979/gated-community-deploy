package com.bsgated.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for updating a site visit status (builder / admin use).
 */
public class SiteVisitStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "CONFIRMED|COMPLETED|CANCELLED",
            message = "Status must be one of: CONFIRMED, COMPLETED, CANCELLED")
    private String status;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
