// // src/main/java/com/bsgated/payload/CreateRealEstateListingRequest.java
// package com.bsgated.payload;

// import java.util.List;

// public class CreateRealEstateListingRequest {

//     private String ownerId;
//     private String ownerName;
//     private String ownerPhone;
//     private String unit;

//     private String type;           // SALE | RENT
//     private String title;
//     private String description;

//     private Long price;
//     private String priceLabel;
//     private Integer area;
//     private Integer bedrooms;
//     private Integer bathrooms;
//     private String furnished;
//     private String availability;
//     private List<String> amenities;

//     // ── Getters & Setters ─────────────────────────────────────────────────

//     public String getOwnerId() { return ownerId; }
//     public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

//     public String getOwnerName() { return ownerName; }
//     public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

//     public String getOwnerPhone() { return ownerPhone; }
//     public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }

//     public String getUnit() { return unit; }
//     public void setUnit(String unit) { this.unit = unit; }

//     public String getType() { return type; }
//     public void setType(String type) { this.type = type; }

//     public String getTitle() { return title; }
//     public void setTitle(String title) { this.title = title; }

//     public String getDescription() { return description; }
//     public void setDescription(String description) { this.description = description; }

//     public Long getPrice() { return price; }
//     public void setPrice(Long price) { this.price = price; }

//     public String getPriceLabel() { return priceLabel; }
//     public void setPriceLabel(String priceLabel) { this.priceLabel = priceLabel; }

//     public Integer getArea() { return area; }
//     public void setArea(Integer area) { this.area = area; }

//     public Integer getBedrooms() { return bedrooms; }
//     public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }

//     public Integer getBathrooms() { return bathrooms; }
//     public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }

//     public String getFurnished() { return furnished; }
//     public void setFurnished(String furnished) { this.furnished = furnished; }

//     public String getAvailability() { return availability; }
//     public void setAvailability(String availability) { this.availability = availability; }

//     public List<String> getAmenities() { return amenities; }
//     public void setAmenities(List<String> amenities) { this.amenities = amenities; }
// }





































package com.bsgated.payload;

import java.util.List;

public class CreateRealEstateListingRequest {
    // ownerId, ownerName, ownerPhone removed — extracted from JWT server-side.
    // unit is retained as the resident's apartment/flat unit number (data, not identity).

    private String unit;
    private String type;
    private String title;
    private String description;
    private Long price;
    private String priceLabel;
    private Integer area;
    private Integer bedrooms;
    private Integer bathrooms;
    private String furnished;
    private String availability;
    private List<String> amenities;

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
    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }
    public String getFurnished() { return furnished; }
    public void setFurnished(String furnished) { this.furnished = furnished; }
    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }
    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }
}