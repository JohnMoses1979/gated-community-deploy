// // src/main/java/com/bsgated/payload/CreateEVBookingRequest.java
// package com.bsgated.payload;

// public class CreateEVBookingRequest {
//     private String residentId;
//     private String residentName;
//     private String unit;
//     private String slot;
//     private String date;
//     private String startTime;
//     private String endTime;
//     private String vehicleNumber;
//     private String vehicleType;
//     private double depositAmount;
//     private double ratePerUnit = 12.0;

//     public String getResidentId() { return residentId; }
//     public void setResidentId(String residentId) { this.residentId = residentId; }
//     public String getResidentName() { return residentName; }
//     public void setResidentName(String residentName) { this.residentName = residentName; }
//     public String getUnit() { return unit; }
//     public void setUnit(String unit) { this.unit = unit; }
//     public String getSlot() { return slot; }
//     public void setSlot(String slot) { this.slot = slot; }
//     public String getDate() { return date; }
//     public void setDate(String date) { this.date = date; }
//     public String getStartTime() { return startTime; }
//     public void setStartTime(String startTime) { this.startTime = startTime; }
//     public String getEndTime() { return endTime; }
//     public void setEndTime(String endTime) { this.endTime = endTime; }
//     public String getVehicleNumber() { return vehicleNumber; }
//     public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
//     public String getVehicleType() { return vehicleType; }
//     public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
//     public double getDepositAmount() { return depositAmount; }
//     public void setDepositAmount(double depositAmount) { this.depositAmount = depositAmount; }
//     public double getRatePerUnit() { return ratePerUnit; }
//     public void setRatePerUnit(double ratePerUnit) { this.ratePerUnit = ratePerUnit; }
// }































package com.bsgated.payload;

public class CreateEVBookingRequest {
    // residentId, residentName, unit removed — extracted from JWT server-side.

    private String slot;
    private String date;
    private String startTime;
    private String endTime;
    private String vehicleNumber;
    private String vehicleType;
    private double depositAmount;
    private double ratePerUnit = 12.0;

    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public double getDepositAmount() { return depositAmount; }
    public void setDepositAmount(double depositAmount) { this.depositAmount = depositAmount; }
    public double getRatePerUnit() { return ratePerUnit; }
    public void setRatePerUnit(double ratePerUnit) { this.ratePerUnit = ratePerUnit; }
}