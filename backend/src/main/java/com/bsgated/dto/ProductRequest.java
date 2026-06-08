package com.bsgated.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /api/vendor/products  and  PUT /api/vendor/products/{id}
 */
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 150, message = "Product name must be under 150 characters")
    private String name;

    @Size(max = 2000)
    private String description;

    /** Emoji icon, e.g. "🍚" — shown in UI */
    @Size(max = 10)
    private String emoji;

    @Size(max = 500)
    private String imageUrl;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be 0 or greater")
    private Double price;

    @Min(value = 0, message = "Original price must be 0 or greater")
    private Double originalPrice;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock must be 0 or greater")
    private Integer stock;

    @Size(max = 80)
    private String category;

    @Size(max = 80)
    private String subcategory;

    /** e.g. "1 kg", "500 ml", "1 pc" */
    @Size(max = 30)
    private String unit;

    private Boolean active;

    // Getters & Setters

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

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
