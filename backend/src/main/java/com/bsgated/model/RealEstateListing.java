package com.bsgated.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "real_estate_listings")
public class RealEstateListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Owner info
    private String ownerId;
    private String ownerName;
    private String ownerPhone;
    private String unit;

    // Listing details
    private String type;           // SALE | RENT
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Long price;
    private String priceLabel;
    private Integer area;
    private String areaUnit = "sqft";
    private Integer bedrooms;
    private Integer bathrooms;
    private String furnished;      // Unfurnished | Semi-furnished | Fully-furnished
    private String availability;   // Immediate | 1 month | 2 months | 3 months

    // Amenities stored as comma-separated string
    @Column(columnDefinition = "TEXT")
    private String amenities;

    /**
     * PENDING_APPROVAL — newly submitted, waiting for admin
     * ACTIVE           — approved and visible to all residents
     * REJECTED         — admin rejected
     * SOLD             — owner marked as sold
     * RENTED           — owner marked as rented
     * WITHDRAWN        — owner withdrew the listing
     */
    private String status = "PENDING_APPROVAL";

    private boolean isFirstListing = false;

    private Integer views = 0;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Admin action fields
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String rejectionReason;

    // ── Getters & Setters ─────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getOwnerPhone() { return ownerPhone; }
    public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }

    public String getPriceLabel() { return priceLabel; }
    public void setPriceLabel(String priceLabel) { this.priceLabel = priceLabel; }

    public Integer getArea() { return area; }
    public void setArea(Integer area) { this.area = area; }

    public String getAreaUnit() { return areaUnit; }
    public void setAreaUnit(String areaUnit) { this.areaUnit = areaUnit; }

    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }

    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }

    public String getFurnished() { return furnished; }
    public void setFurnished(String furnished) { this.furnished = furnished; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isFirstListing() { return isFirstListing; }
    public void setFirstListing(boolean firstListing) { isFirstListing = firstListing; }

    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getApprovedById() { return approvedById; }
    public void setApprovedById(Long approvedById) { this.approvedById = approvedById; }

    public String getApprovedByName() { return approvedByName; }
    public void setApprovedByName(String approvedByName) { this.approvedByName = approvedByName; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
