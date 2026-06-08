package com.bsgated.dto;

import com.bsgated.model.Product;
import com.bsgated.model.VendorStore;

import java.time.LocalDateTime;

/**
 * Product response enriched with store metadata.
 * Returned to both vendor (own products) and residents (marketplace feed).
 */
public class ProductResponse {

    private Long id;
    private Long vendorId;
    private Long storeId;
    private String storeName;
    private String storeLogoUrl;
    private String vendorType;
    private String name;
    private String description;
    private String emoji;
    private String imageUrl;
    private Double price;
    private Double originalPrice;
    private Integer stock;
    private String category;
    private String subcategory;
    private String unit;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Build from a Product + its owning VendorStore */
    public static ProductResponse from(Product p, VendorStore store) {
        ProductResponse r = new ProductResponse();
        r.id            = p.getId();
        r.vendorId      = p.getVendorId();
        r.storeId       = p.getStoreId();
        r.storeName     = store != null ? store.getStoreName() : null;
        r.storeLogoUrl  = store != null ? store.getLogoUrl()   : null;
        r.vendorType    = store != null ? store.getVendorType() : null;
        r.name          = p.getName();
        r.description   = p.getDescription();
        r.emoji         = p.getEmoji();
        r.imageUrl      = p.getImageUrl();
        r.price         = p.getPrice();
        r.originalPrice = p.getOriginalPrice();
        r.stock         = p.getStock();
        r.category      = p.getCategory();
        r.subcategory   = p.getSubcategory();
        r.unit          = p.getUnit();
        r.active        = p.isActive();
        r.createdAt     = p.getCreatedAt();
        r.updatedAt     = p.getUpdatedAt();
        return r;
    }

    /** Build from a Product only (store data omitted) */
    public static ProductResponse from(Product p) {
        return from(p, null);
    }

    // Getters

    public Long getId() { return id; }
    public Long getVendorId() { return vendorId; }
    public Long getStoreId() { return storeId; }
    public String getStoreName() { return storeName; }
    public String getStoreLogoUrl() { return storeLogoUrl; }
    public String getVendorType() { return vendorType; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getEmoji() { return emoji; }
    public String getImageUrl() { return imageUrl; }
    public Double getPrice() { return price; }
    public Double getOriginalPrice() { return originalPrice; }
    public Integer getStock() { return stock; }
    public String getCategory() { return category; }
    public String getSubcategory() { return subcategory; }
    public String getUnit() { return unit; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
