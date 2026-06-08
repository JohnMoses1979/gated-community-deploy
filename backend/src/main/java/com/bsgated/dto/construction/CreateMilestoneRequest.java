package com.bsgated.dto.construction;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * DTO for builder creating a construction milestone. projectId comes from path
 * variable — ownership validated server-side.
 */
public class CreateMilestoneRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @DecimalMin(value = "0.0", message = "Percentage completion must be at least 0")
    @DecimalMax(value = "100.0", message = "Percentage completion must not exceed 100")
    private Double percentageCompletion;

    private LocalDate expectedCompletionDate;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Double getPercentageCompletion() {
        return percentageCompletion;
    }

    public void setPercentageCompletion(Double percentageCompletion) {
        this.percentageCompletion = percentageCompletion;
    }

    public LocalDate getExpectedCompletionDate() {
        return expectedCompletionDate;
    }

    public void setExpectedCompletionDate(LocalDate expectedCompletionDate) {
        this.expectedCompletionDate = expectedCompletionDate;
    }
}
