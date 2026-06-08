// package com.bsgated.model;
// import com.fasterxml.jackson.annotation.JsonIgnore;
// import jakarta.persistence.*;
// import java.math.BigDecimal;
// @Entity
// @Table(name = "units")
// public class Unit {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "tower_id")
//     @JsonIgnore
//     private Tower tower;
//     private String flatNo;
//     private String unitNumber; // Added to match frontend
//     private String floor;
//     private String facing;
//     private String unitType;
//     private String bhkType;
//     private String superBuiltupArea;
//     private String carpetArea;
//     private String price; // Use String for flexibility with currency symbols/formatted text
//     private Double sqFt;
//     private BigDecimal pricing;
//     private String floorPlanUrl;
//     private String description;
//     private String unitImage;
//     private String status = "AVAILABLE"; // AVAILABLE, BOOKED, HOLD
//     public Unit() {
//     }
//     // Getters and Setters
//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }
//     public Tower getTower() { return tower; }
//     public void setTower(Tower tower) { this.tower = tower; }
//     public String getFlatNo() { return flatNo; }
//     public void setFlatNo(String flatNo) { this.flatNo = flatNo; }
//     public String getUnitNumber() { return unitNumber; }
//     public void setUnitNumber(String unitNumber) { this.unitNumber = unitNumber; }
//     public String getFloor() { return floor; }
//     public void setFloor(String floor) { this.floor = floor; }
//     public String getFacing() { return facing; }
//     public void setFacing(String facing) { this.facing = facing; }
//     public String getUnitType() { return unitType; }
//     public void setUnitType(String unitType) { this.unitType = unitType; }
//     public String getBhkType() { return bhkType; }
//     public void setBhkType(String bhkType) { this.bhkType = bhkType; }
//     public String getSuperBuiltupArea() { return superBuiltupArea; }
//     public void setSuperBuiltupArea(String superBuiltupArea) { this.superBuiltupArea = superBuiltupArea; }
//     public String getCarpetArea() { return carpetArea; }
//     public void setCarpetArea(String carpetArea) { this.carpetArea = carpetArea; }
//     public String getPrice() { return price; }
//     public void setPrice(String price) { this.price = price; }
//     public Double getSqFt() { return sqFt; }
//     public void setSqFt(Double sqFt) { this.sqFt = sqFt; }
//     public BigDecimal getPricing() { return pricing; }
//     public void setPricing(BigDecimal pricing) { this.pricing = pricing; }
//     public String getFloorPlanUrl() { return floorPlanUrl; }
//     public void setFloorPlanUrl(String floorPlanUrl) { this.floorPlanUrl = floorPlanUrl; }
//     public String getDescription() { return description; }
//     public void setDescription(String description) { this.description = description; }
//     public String getUnitImage() { return unitImage; }
//     public void setUnitImage(String unitImage) { this.unitImage = unitImage; }
//     public String getStatus() { return status; }
//     public void setStatus(String status) { this.status = status; }
// }



package com.bsgated.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.math.BigDecimal;

/**
 * Unit entity — a single flat / apartment within a Tower.
 *
 * JPA relationship notes: - tower: LAZY fetch, @JsonIgnore — the full Tower (→
 * Project → Builder) graph is not serialised. towerId and towerName are exposed
 * as computed properties. - status lifecycle: AVAILABLE → HOLD (on booking) →
 * SOLD (on approval) ↘ AVAILABLE (on rejection/cancellation)
 */
@Entity
@Table(name = "units")
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tower_id", nullable = false)
    @JsonIgnore
    private Tower tower;

    private String flatNo;
    private String unitNumber;
    private String floor;
    private String facing;
    private String unitType;
    private String bhkType;
    private String superBuiltupArea;
    private String carpetArea;

    /**
     * Human-readable price string (e.g. "₹85 L").
     */
    private String price;

    private Double sqFt;

    /**
     * Numeric price for calculations / sorting.
     */
    private BigDecimal pricing;

    @Column(length = 1000)
    private String floorPlanUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 1000)
    private String unitImage;

    /**
     * "AVAILABLE" | "HOLD" | "SOLD" HOLD is used while a booking awaits builder
     * approval (prevents double-booking).
     */
    private String status = "AVAILABLE";

    public Unit() {
    }

    // ── Computed JSON fields ───────────────────────────────────────────────
    /**
     * Exposes parent tower ID without loading the Tower graph.
     */
    @JsonProperty("towerId")
    public Long getTowerId() {
        return tower != null ? tower.getId() : null;
    }

    @JsonProperty("towerName")
    public String getTowerName() {
        return tower != null ? tower.getName() : null;
    }

    @JsonProperty("projectName")
    public String getProjectName() {
        return tower != null && tower.getProject() != null ? tower.getProject().getName() : null;
    }

    @JsonProperty("projectId")
    public Long getProjectId() {
        return tower != null && tower.getProject() != null ? tower.getProject().getId() : null;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Tower getTower() {
        return tower;
    }

    public void setTower(Tower tower) {
        this.tower = tower;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
