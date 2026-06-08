package com.bsgated.dto.builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * DTO for builder adding a unit to an owned tower. towerId comes from the path
 * variable — prevents IDOR on tower ownership.
 */
public class CreateUnitRequest {

    @NotBlank(message = "Flat number is required")
    @Size(max = 50, message = "Flat number must not exceed 50 characters")
    private String flatNo;

    @Size(max = 50, message = "Unit number must not exceed 50 characters")
    private String unitNumber;

    @Size(max = 20, message = "Floor must not exceed 20 characters")
    private String floor;

    @Size(max = 50, message = "Facing must not exceed 50 characters")
    private String facing;

    @Size(max = 50, message = "Unit type must not exceed 50 characters")
    private String unitType;

    @Size(max = 20, message = "BHK type must not exceed 20 characters")
    private String bhkType;

    @Size(max = 100, message = "Super built-up area must not exceed 100 characters")
    private String superBuiltupArea;

    @Size(max = 100, message = "Carpet area must not exceed 100 characters")
    private String carpetArea;

    @Size(max = 100, message = "Price string must not exceed 100 characters")
    private String price;

    private Double sqFt;

    private BigDecimal pricing;

    @Size(max = 1000, message = "Floor plan URL must not exceed 1000 characters")
    private String floorPlanUrl;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Size(max = 1000, message = "Unit image URL must not exceed 1000 characters")
    private String unitImage;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public String getFlatNo() {
        return flatNo;
    }

    public void setFlatNo(String flatNo) {
        this.flatNo = flatNo;
    }

    public String getUnitNumber() {
        return unitNumber;
    }

    public void setUnitNumber(String unitNumber) {
        this.unitNumber = unitNumber;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public String getFacing() {
        return facing;
    }

    public void setFacing(String facing) {
        this.facing = facing;
    }

    public String getUnitType() {
        return unitType;
    }

    public void setUnitType(String unitType) {
        this.unitType = unitType;
    }

    public String getBhkType() {
        return bhkType;
    }

    public void setBhkType(String bhkType) {
        this.bhkType = bhkType;
    }

    public String getSuperBuiltupArea() {
        return superBuiltupArea;
    }

    public void setSuperBuiltupArea(String superBuiltupArea) {
        this.superBuiltupArea = superBuiltupArea;
    }

    public String getCarpetArea() {
        return carpetArea;
    }

    public void setCarpetArea(String carpetArea) {
        this.carpetArea = carpetArea;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public Double getSqFt() {
        return sqFt;
    }

    public void setSqFt(Double sqFt) {
        this.sqFt = sqFt;
    }

    public BigDecimal getPricing() {
        return pricing;
    }

    public void setPricing(BigDecimal pricing) {
        this.pricing = pricing;
    }

    public String getFloorPlanUrl() {
        return floorPlanUrl;
    }

    public void setFloorPlanUrl(String floorPlanUrl) {
        this.floorPlanUrl = floorPlanUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUnitImage() {
        return unitImage;
    }

    public void setUnitImage(String unitImage) {
        this.unitImage = unitImage;
    }
}
