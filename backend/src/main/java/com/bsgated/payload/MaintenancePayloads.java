// // ─── Payloads for Maintenance Module ─────────────────────────────────────────
// // All in one file for brevity — split into separate files if preferred.
// package com.bsgated.payload;
// // ── 1. Resident submits request ──────────────────────────────────────────────
// class SubmitMaintenanceRequest {
//     private String residentId;
//     private String residentName;
//     private String residentPhone;
//     private String unit;
//     private String title;
//     private String description;
//     private String category;
//     private String priority;
//     private String preferredSlot;
//     private String contactPref;
//     public String getResidentId()    { return residentId; }
//     public void setResidentId(String v) { this.residentId = v; }
//     public String getResidentName()  { return residentName; }
//     public void setResidentName(String v) { this.residentName = v; }
//     public String getResidentPhone() { return residentPhone; }
//     public void setResidentPhone(String v) { this.residentPhone = v; }
//     public String getUnit()          { return unit; }
//     public void setUnit(String v)    { this.unit = v; }
//     public String getTitle()         { return title; }
//     public void setTitle(String v)   { this.title = v; }
//     public String getDescription()   { return description; }
//     public void setDescription(String v) { this.description = v; }
//     public String getCategory()      { return category; }
//     public void setCategory(String v) { this.category = v; }
//     public String getPriority()      { return priority; }
//     public void setPriority(String v) { this.priority = v; }
//     public String getPreferredSlot() { return preferredSlot; }
//     public void setPreferredSlot(String v) { this.preferredSlot = v; }
//     public String getContactPref()   { return contactPref; }
//     public void setContactPref(String v) { this.contactPref = v; }
// }
// // ── 2. Admin assigns vendor ──────────────────────────────────────────────────
// class AssignVendorRequest {
//     private Long   vendorId;
//     private String vendorName;
//     private String vendorPhone;
//     private Long   adminId;
//     public Long getVendorId()        { return vendorId; }
//     public void setVendorId(Long v)  { this.vendorId = v; }
//     public String getVendorName()    { return vendorName; }
//     public void setVendorName(String v) { this.vendorName = v; }
//     public String getVendorPhone()   { return vendorPhone; }
//     public void setVendorPhone(String v) { this.vendorPhone = v; }
//     public Long getAdminId()         { return adminId; }
//     public void setAdminId(Long v)   { this.adminId = v; }
// }
// // ── 3. Vendor submits quote ──────────────────────────────────────────────────
// class SubmitQuoteRequest {
//     private Double  amount;
//     private String  description;
//     private Integer estimatedDays;
//     public Double getAmount()           { return amount; }
//     public void setAmount(Double v)     { this.amount = v; }
//     public String getDescription()      { return description; }
//     public void setDescription(String v){ this.description = v; }
//     public Integer getEstimatedDays()   { return estimatedDays; }
//     public void setEstimatedDays(Integer v) { this.estimatedDays = v; }
// }
// // ── 4. Resident responds to quote ─────────────────────────────────────────────
// class QuoteResponseRequest {
//     private String decision;   // accept | reject
//     private String reason;     // optional, for reject
//     public String getDecision()      { return decision; }
//     public void setDecision(String v){ this.decision = v; }
//     public String getReason()        { return reason; }
//     public void setReason(String v)  { this.reason = v; }
// }
// // ── 5. Guard verifies gate OTP ────────────────────────────────────────────────
// class GateOtpVerifyRequest {
//     private String otp;
//     private String guardId;
//     private String guardName;
//     public String getOtp()           { return otp; }
//     public void setOtp(String v)     { this.otp = v; }
//     public String getGuardId()       { return guardId; }
//     public void setGuardId(String v) { this.guardId = v; }
//     public String getGuardName()     { return guardName; }
//     public void setGuardName(String v){ this.guardName = v; }
// }
// // ── 6. Vendor marks work completed ────────────────────────────────────────────
// class WorkCompleteRequest {
//     private String notes;
//     public String getNotes()         { return notes; }
//     public void setNotes(String v)   { this.notes = v; }
// }
// // ── 7. Vendor raises payment request ──────────────────────────────────────────
// class PaymentRequestPayload {
//     private Double amount;
//     private String notes;
//     public Double getAmount()        { return amount; }
//     public void setAmount(Double v)  { this.amount = v; }
//     public String getNotes()         { return notes; }
//     public void setNotes(String v)   { this.notes = v; }
// }
// // ── 8. Resident pays via Razorpay ─────────────────────────────────────────────
// // Reuses existing PaymentVerifyRequest (razorpayOrderId, razorpayPaymentId, razorpaySignature)
// public class MaintenancePayloads {
//     public static class Submit      extends SubmitMaintenanceRequest {}
//     public static class AssignVendor extends AssignVendorRequest {}
//     public static class SubmitQuote  extends SubmitQuoteRequest {}
//     public static class QuoteResponse extends QuoteResponseRequest {}
//     public static class GateOtpVerify extends GateOtpVerifyRequest {}
//     public static class WorkComplete  extends WorkCompleteRequest {}
//     public static class PaymentRequest extends PaymentRequestPayload {}
// }
package com.bsgated.payload;

/**
 * Payloads for Maintenance Module.
 *
 * SECURITY NOTES: - residentId, residentName, residentPhone, unit REMOVED from
 * Submit — injected from JWT. - adminId REMOVED from AssignVendor,
 * ForwardQuote, GenerateGateOtp, ForwardPayment, CloseJob — injected from JWT.
 * - guardId, guardName REMOVED from GateOtpVerify — injected from JWT. -
 * vendorId kept in AssignVendor because admin is choosing WHICH vendor to
 * assign (lookup data, not identity).
 */
public class MaintenancePayloads {

    // ── 1. Resident submits request ──────────────────────────────────────────
    // residentId, residentName, residentPhone, unit REMOVED — extracted from JWT.
    public static class Submit {

        private String title;
        private String description;
        private String category;
        private String priority;       // Low | Medium | High | Urgent
        private String preferredSlot;
        private String contactPref;

        public String getTitle() {
            return title;
        }

        public void setTitle(String v) {
            this.title = v;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String v) {
            this.description = v;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String v) {
            this.category = v;
        }

        public String getPriority() {
            return priority;
        }

        public void setPriority(String v) {
            this.priority = v;
        }

        public String getPreferredSlot() {
            return preferredSlot;
        }

        public void setPreferredSlot(String v) {
            this.preferredSlot = v;
        }

        public String getContactPref() {
            return contactPref;
        }

        public void setContactPref(String v) {
            this.contactPref = v;
        }
    }

    // ── 2. Admin assigns vendor ──────────────────────────────────────────────
    // adminId REMOVED — extracted from JWT.
    // vendorId kept — admin is specifying WHICH vendor to assign (not their own identity).
    public static class AssignVendor {

        private Long vendorId;
        private String vendorName;
        private String vendorPhone;

        public Long getVendorId() {
            return vendorId;
        }

        public void setVendorId(Long v) {
            this.vendorId = v;
        }

        public String getVendorName() {
            return vendorName;
        }

        public void setVendorName(String v) {
            this.vendorName = v;
        }

        public String getVendorPhone() {
            return vendorPhone;
        }

        public void setVendorPhone(String v) {
            this.vendorPhone = v;
        }
    }

    // ── 3. Vendor submits quote ──────────────────────────────────────────────
    public static class SubmitQuote {

        private Double amount;
        private String description;
        private Integer estimatedDays;

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double v) {
            this.amount = v;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String v) {
            this.description = v;
        }

        public Integer getEstimatedDays() {
            return estimatedDays;
        }

        public void setEstimatedDays(Integer v) {
            this.estimatedDays = v;
        }
    }

    // ── 4. Resident responds to quote ─────────────────────────────────────────
    public static class QuoteResponse {

        private String decision;   // accept | reject
        private String reason;     // optional, for reject

        public String getDecision() {
            return decision;
        }

        public void setDecision(String v) {
            this.decision = v;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String v) {
            this.reason = v;
        }
    }

    // ── 5. Guard verifies gate OTP ────────────────────────────────────────────
    // guardId and guardName REMOVED — extracted from JWT via CurrentUser.get().
    public static class GateOtpVerify {

        private String otp;

        public String getOtp() {
            return otp;
        }

        public void setOtp(String v) {
            this.otp = v;
        }
    }

    // ── 6. Vendor marks work completed ────────────────────────────────────────
    public static class WorkComplete {

        private String notes;

        public String getNotes() {
            return notes;
        }

        public void setNotes(String v) {
            this.notes = v;
        }
    }

    // ── 7. Vendor raises payment request ──────────────────────────────────────
    public static class PaymentRequest {

        private Double amount;
        private String notes;

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double v) {
            this.amount = v;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String v) {
            this.notes = v;
        }
    }

    public static class Rating {

        private Integer rating;
        private String review;
        private String tags;

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer v) {
            this.rating = v;
        }

        public String getReview() {
            return review;
        }

        public void setReview(String v) {
            this.review = v;
        }

        public String getTags() {
            return tags;
        }

        public void setTags(Object v) {
            this.tags = v == null ? null : String.valueOf(v);
        }
    }
}
