package com.bsgated.dto.builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ComplianceDocumentsRequest {

    @NotBlank(message = "Compliance documents payload is required")
    @Size(max = 50000, message = "Compliance documents payload is too large")
    private String complianceDocumentsJson;

    public String getComplianceDocumentsJson() {
        return complianceDocumentsJson;
    }

    public void setComplianceDocumentsJson(String complianceDocumentsJson) {
        this.complianceDocumentsJson = complianceDocumentsJson;
    }
}
