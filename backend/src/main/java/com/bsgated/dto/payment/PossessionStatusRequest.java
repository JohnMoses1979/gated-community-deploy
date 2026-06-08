package com.bsgated.dto.payment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for builder updating soft-possession status on an approved booking.
 */
public class PossessionStatusRequest {

    @NotNull(message = "Status flag is required")
    private Boolean status;

    @Size(max = 1000, message = "Possession letter URL must not exceed 1000 characters")
    private String letterUrl;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public String getLetterUrl() {
        return letterUrl;
    }

    public void setLetterUrl(String letterUrl) {
        this.letterUrl = letterUrl;
    }
}
