package com.bsgated.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Body for POST /api/marketplace/orders — resident places an order.
 */
public class PlaceOrderRequest {

    @NotNull(message = "storeId is required")
    private Long storeId;

    /** JSON array of cart items: [{ productId, name, emoji, price, qty, unit }] */
    @NotBlank(message = "itemsJson is required")
    private String itemsJson;

    @NotNull(message = "subtotal is required")
    private Double subtotal;

    private Double deliveryCharge = 20.0;

    @NotNull(message = "total is required")
    private Double total;

    /** upi | card | cod | razorpay */
    @NotBlank(message = "paymentMethod is required")
    private String paymentMethod;

    /** Razorpay payment id — required when paymentMethod = "razorpay" */
    private String razorpayPaymentId;

    /** Razorpay order id — optional, for verification */
    private String razorpayOrderId;

    // Getters & Setters

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long v) { this.storeId = v; }

    public String getItemsJson() { return itemsJson; }
    public void setItemsJson(String v) { this.itemsJson = v; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double v) { this.subtotal = v; }

    public Double getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(Double v) { this.deliveryCharge = v; }

    public Double getTotal() { return total; }
    public void setTotal(Double v) { this.total = v; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String v) { this.paymentMethod = v; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String v) { this.razorpayPaymentId = v; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String v) { this.razorpayOrderId = v; }
}
