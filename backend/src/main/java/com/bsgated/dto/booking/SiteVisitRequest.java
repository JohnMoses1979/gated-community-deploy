package com.bsgated.dto.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * DTO for a customer booking a site visit. projectId comes from the path
 * variable — customer identity from JWT.
 */
public class SiteVisitRequest {

    @NotNull(message = "Scheduled date is required")
    @Future(message = "Scheduled date must be in the future")
    private LocalDateTime scheduledDate;

    private Long unitId;

    @Size(max = 100, message = "Unit number must not exceed 100 characters")
    private String unitNumber;

    @Size(max = 100, message = "Unit type must not exceed 100 characters")
    private String unitType;

    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public Long getUnitId() {
        return unitId;
    }

    public void setUnitId(Long unitId) {
        this.unitId = unitId;
    }

    public String getUnitNumber() {
        return unitNumber;
    }

    public void setUnitNumber(String unitNumber) {
        this.unitNumber = unitNumber;
    }

    public String getUnitType() {
        return unitType;
    }

    public void setUnitType(String unitType) {
        this.unitType = unitType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
