// src/main/java/com/bsgated/model/AmenityBooking.java
package com.bsgated.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "amenity_bookings")
public class AmenityBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String residentId;
    private String residentName;
    private String unit;

    private String amenityId;
    private String amenityName;
    private String amenityEmoji;

    private String slot;
    private String date;
    private int members = 1;
    private double amount;

    // payment_pending | confirmed | cancelled | no_show
    private String status = "payment_pending";

    // unpaid | paid | free
    private String paymentStatus = "unpaid";

    // Razorpay fields
    private String razorpayOrderId;
    private String razorpayPaymentId;

    // 6-digit OTP for guard verification
    private String otp;

    private boolean checkedIn = false;
    private String checkedInBy;
    private LocalDateTime checkedInAt;

    // Cancellation timestamp — set when resident cancels
    private LocalDateTime cancelledAt;

    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Getters & Setters ─────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getResidentId() { return residentId; }
    public void setResidentId(String residentId) { this.residentId = residentId; }

    public String getResidentName() { return residentName; }
    public void setResidentName(String residentName) { this.residentName = residentName; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getAmenityId() { return amenityId; }
    public void setAmenityId(String amenityId) { this.amenityId = amenityId; }

    public String getAmenityName() { return amenityName; }
    public void setAmenityName(String amenityName) { this.amenityName = amenityName; }

    public String getAmenityEmoji() { return amenityEmoji; }
    public void setAmenityEmoji(String amenityEmoji) { this.amenityEmoji = amenityEmoji; }

    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public int getMembers() { return members; }
    public void setMembers(int members) { this.members = members; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public boolean isCheckedIn() { return checkedIn; }
    public void setCheckedIn(boolean checkedIn) { this.checkedIn = checkedIn; }

    public String getCheckedInBy() { return checkedInBy; }
    public void setCheckedInBy(String checkedInBy) { this.checkedInBy = checkedInBy; }

    public LocalDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}