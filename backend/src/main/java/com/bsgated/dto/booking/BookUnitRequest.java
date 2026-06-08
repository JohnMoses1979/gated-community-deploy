package com.bsgated.dto.booking;

import jakarta.validation.constraints.Size;

/**
 * DTO for a customer booking a unit. unitId comes from the path variable —
 * customer identity from JWT. No user ID accepted from body (IDOR prevention).
 */
public class BookUnitRequest {

    /**
     * JSON-encoded KYC document URLs / metadata. Max 10 KB.
     */
    @Size(max = 10_000, message = "KYC documents payload is too large")
    private String kycDocumentsJson;

    @Size(max = 1000, message = "Digital signature URL must not exceed 1000 characters")
    private String digitalSignatureUrl;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public String getKycDocumentsJson() {
        return kycDocumentsJson;
    }

    public void setKycDocumentsJson(String kycDocumentsJson) {
        this.kycDocumentsJson = kycDocumentsJson;
    }

    public String getDigitalSignatureUrl() {
        return digitalSignatureUrl;
    }

    public void setDigitalSignatureUrl(String digitalSignatureUrl) {
        this.digitalSignatureUrl = digitalSignatureUrl;
    }
}
