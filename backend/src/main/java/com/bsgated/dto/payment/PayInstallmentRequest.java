package com.bsgated.dto.payment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * DTO for a customer paying a single installment.
 * installmentId comes from path variable — ownership validated server-side.
 * transactionId is generated server-side (UUID); never accepted from client.
 */
public class PayInstallmentRequest {

    @NotNull(message = "Amount paid is required")
    @Positive(message = "Amount paid must be positive")
    private BigDecimal amountPaid;

    @Size(max = 1000, message = "Receipt URL must not exceed 1000 characters")
    private String receiptUrl;

    // ── Getters & Setters ──────────────────────────────────────────────────

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }
}