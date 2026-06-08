// // src/main/java/com/bsgated/payload/CreateAmenityBookingRequest.java
// package com.bsgated.payload;

// public class CreateAmenityBookingRequest {
//     private String residentId;
//     private String residentName;
//     private String unit;
//     private String amenityId;
//     private String amenityName;
//     private String amenityEmoji;
//     private String slot;
//     private String date;
//     private int members = 1;
//     private double amount;

//     // Getters & Setters
//     public String getResidentId() { return residentId; }
//     public void setResidentId(String residentId) { this.residentId = residentId; }
//     public String getResidentName() { return residentName; }
//     public void setResidentName(String residentName) { this.residentName = residentName; }
//     public String getUnit() { return unit; }
//     public void setUnit(String unit) { this.unit = unit; }
//     public String getAmenityId() { return amenityId; }
//     public void setAmenityId(String amenityId) { this.amenityId = amenityId; }
//     public String getAmenityName() { return amenityName; }
//     public void setAmenityName(String amenityName) { this.amenityName = amenityName; }
//     public String getAmenityEmoji() { return amenityEmoji; }
//     public void setAmenityEmoji(String amenityEmoji) { this.amenityEmoji = amenityEmoji; }
//     public String getSlot() { return slot; }
//     public void setSlot(String slot) { this.slot = slot; }
//     public String getDate() { return date; }
//     public void setDate(String date) { this.date = date; }
//     public int getMembers() { return members; }
//     public void setMembers(int members) { this.members = members; }
//     public double getAmount() { return amount; }
//     public void setAmount(double amount) { this.amount = amount; }
// }






























package com.bsgated.payload;

public class CreateAmenityBookingRequest {
    // residentId, residentName, unit are intentionally REMOVED.
    // These are now extracted server-side from the JWT via CurrentUser.get()
    // and injected by the service layer before persisting.

    private String amenityId;
    private String amenityName;
    private String amenityEmoji;
    private String slot;
    private String date;
    private int members = 1;
    private double amount;

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
}