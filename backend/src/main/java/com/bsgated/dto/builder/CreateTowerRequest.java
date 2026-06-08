package com.bsgated.dto.builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * DTO for builder adding a tower to an owned project. projectId comes from the
 * path variable, not from request body — prevents IDOR.
 */
public class CreateTowerRequest {

    @NotBlank(message = "Tower name is required")
    @Size(max = 255, message = "Tower name must not exceed 255 characters")
    private String name;

    @Positive(message = "Total units must be a positive number")
    private Integer totalUnits;

    @Size(max = 100, message = "Phase must not exceed 100 characters")
    private String phase;

    @Size(max = 50, message = "Status must not exceed 50 characters")
    private String status;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(Integer totalUnits) {
        this.totalUnits = totalUnits;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
