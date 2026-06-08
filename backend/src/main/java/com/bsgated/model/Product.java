package com.bsgated.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Product — belongs to a VendorStore.
 * Residents see all active products from active, non-vacation stores.
 */
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_vendor",   columnList = "vendorId"),
        @Index(name = "idx_product_store",    columnList = "storeId"),
        @Index(name = "idx_product_active",   columnList = "active"),
        @Index(name = "idx_product_category", columnList = "category")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Owner ────────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private Long vendorId;

    @Column(nullable = false)
    private Long storeId;

    // ── Core details ─────────────────────────────────────────────────────────
    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Emoji icon shown in the UI instead of an image URL */
    @Column(length = 10)
    private String emoji;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private Double price;

    /** MRP / original price (for showing strikethrough discount) */
    private Double originalPrice;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(length = 80)
    private String category;

    @Column(length = 80)
    private String subcategory;

    /** Unit label shown to residents, e.g. "1 kg", "500 ml", "1 pc" */
    @Column(length = 30)
    private String unit;

    private boolean active = true;

    // ── Timestamps ───────────────────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
