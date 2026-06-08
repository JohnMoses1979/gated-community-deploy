package com.bsgated.dto.payment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * DTO wrapping the list of installments a builder wants to generate for a
 * booking. bookingId comes from the path variable — ownership validated
 * server-side.
 */
public class GenerateInstallmentsRequest {

    @NotEmpty(message = "At least one installment is required")
    @Valid
    private List<InstallmentEntry> installments;

    public List<InstallmentEntry> getInstallments() {
        return installments;
    }

    public void setInstallments(List<InstallmentEntry> installments) {
        this.installments = installments;
    }

    // ── Nested DTO for a single installment line ───────────────────────────
    public static class InstallmentEntry {

        @jakarta.validation.constraints.NotBlank(message = "Milestone name is required")
        @jakarta.validation.constraints.Size(max = 255)
        private String milestoneName;

        @jakarta.validation.constraints.DecimalMin(value = "0.01", message = "Percentage must be positive")
        @jakarta.validation.constraints.DecimalMax(value = "100.0", message = "Percentage cannot exceed 100")
        private Double percentage;

        @jakarta.validation.constraints.NotNull(message = "Amount is required")
        @jakarta.validation.constraints.Positive(message = "Amount must be positive")
        private java.math.BigDecimal amount;

        private java.time.LocalDate dueDate;

        // Getters & Setters
        public String getMilestoneName() {
            return milestoneName;
        }

        public void setMilestoneName(String milestoneName) {
            this.milestoneName = milestoneName;
        }

        public Double getPercentage() {
            return percentage;
        }

        public void setPercentage(Double percentage) {
            this.percentage = percentage;
        }

        public java.math.BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(java.math.BigDecimal amount) {
            this.amount = amount;
        }

        public java.time.LocalDate getDueDate() {
            return dueDate;
        }

        public void setDueDate(java.time.LocalDate dueDate) {
            this.dueDate = dueDate;
        }
    }
}
