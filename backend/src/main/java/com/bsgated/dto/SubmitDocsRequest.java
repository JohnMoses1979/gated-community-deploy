package com.bsgated.dto;

import jakarta.validation.constraints.NotBlank;

public class SubmitDocsRequest {

    @NotBlank(message = "Documents are required")
    private String documents;

    public String getDocuments() {
        return documents;
    }

    public void setDocuments(String documents) {
        this.documents = documents;
    }
}
