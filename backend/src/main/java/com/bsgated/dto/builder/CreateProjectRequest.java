package com.bsgated.dto.builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for builder creating a new project. Decouples HTTP input from the Project
 * entity — prevents mass-assignment attacks.
 */
public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 255, message = "Project name must not exceed 255 characters")
    private String name;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @NotBlank(message = "Location is required")
    @Size(max = 500, message = "Location must not exceed 500 characters")
    private String location;

    @Size(max = 100, message = "RERA number must not exceed 100 characters")
    private String reraNumber;

    @Size(max = 1000, message = "Layout plan URL must not exceed 1000 characters")
    private String layoutPlanUrl;

    @Size(max = 1000, message = "NOC URL must not exceed 1000 characters")
    private String nocUrl;

    @Size(max = 1000, message = "Sanctions URL must not exceed 1000 characters")
    private String sanctionsUrl;

    @Size(max = 5000, message = "Specs must not exceed 5000 characters")
    private String specs;

    private Integer towerCount;
    private Integer totalUnits;
    private Integer availableUnits;

    @Size(max = 200, message = "Price range must not exceed 200 characters")
    private String priceRange;

    @Size(max = 1000, message = "Cover image URL must not exceed 1000 characters")
    private String coverImage;

    @Size(max = 50, message = "Completion date must not exceed 50 characters")
    private String completionDate;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getReraNumber() {
        return reraNumber;
    }

    public void setReraNumber(String reraNumber) {
        this.reraNumber = reraNumber;
    }

    public String getLayoutPlanUrl() {
        return layoutPlanUrl;
    }

    public void setLayoutPlanUrl(String layoutPlanUrl) {
        this.layoutPlanUrl = layoutPlanUrl;
    }

    public String getNocUrl() {
        return nocUrl;
    }

    public void setNocUrl(String nocUrl) {
        this.nocUrl = nocUrl;
    }

    public String getSanctionsUrl() {
        return sanctionsUrl;
    }

    public void setSanctionsUrl(String sanctionsUrl) {
        this.sanctionsUrl = sanctionsUrl;
    }

    public String getSpecs() {
        return specs;
    }

    public void setSpecs(String specs) {
        this.specs = specs;
    }

    public Integer getTowerCount() {
        return towerCount;
    }

    public void setTowerCount(Integer towerCount) {
        this.towerCount = towerCount;
    }

    public Integer getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(Integer totalUnits) {
        this.totalUnits = totalUnits;
    }

    public Integer getAvailableUnits() {
        return availableUnits;
    }

    public void setAvailableUnits(Integer availableUnits) {
        this.availableUnits = availableUnits;
    }

    public String getPriceRange() {
        return priceRange;
    }

    public void setPriceRange(String priceRange) {
        this.priceRange = priceRange;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(String completionDate) {
        this.completionDate = completionDate;
    }
}
