// package com.bsgated.dto;


// import lombok.Builder;
// import lombok.Data;
// import java.time.LocalDateTime;

// import com.bsgated.model.GuestParkingStatus;
 
// @Data
// @Builder
// public class GuestParkingResponseDto {
//     private String              id;
//     private String              residentId;
//     private String              residentName;
//     private String              unit;
//     private String              guestName;
//     private String              guestPhone;
//     private String              vehicleNumber;
//     private String              vehicleType;
//     private String              expectedDate;
//     private Integer             durationDays;
//     private String              slotNumber;
//     private String              parkingOtp;
//     private GuestParkingStatus  status;
//     private LocalDateTime       requestedAt;
//     private LocalDateTime       approvedAt;
//     private LocalDateTime       rejectedAt;
//     private LocalDateTime       startTime;
//     private LocalDateTime       endTime;
//     private LocalDateTime       exitTime;
//     private String              entryGate;
//     private String              verifiedByGuardName;
// }
 

package com.bsgated.dto;

import com.bsgated.model.GuestParkingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GuestParkingResponseDto {

    private String id;

    private String residentId;

    private String residentName;

    private String unit;

    private String guestName;

    private String guestPhone;

    private String vehicleNumber;

    private String vehicleType;

    private String expectedDate;

    private Integer durationDays;

    private String slotNumber;

    private String parkingOtp;

    private GuestParkingStatus status;

    private LocalDateTime requestedAt;

    private LocalDateTime approvedAt;

    private LocalDateTime rejectedAt;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime exitTime;

    private String entryGate;

    private String verifiedByGuardName;

    public GuestParkingResponseDto(LocalDateTime approvedAt, Integer durationDays, LocalDateTime endTime, String entryGate, LocalDateTime exitTime, String expectedDate, String guestName, String guestPhone, String id, String parkingOtp, LocalDateTime rejectedAt, LocalDateTime requestedAt, String residentId, String residentName, String slotNumber, LocalDateTime startTime, GuestParkingStatus status, String unit, String vehicleNumber, String vehicleType, String verifiedByGuardName) {
        this.approvedAt = approvedAt;
        this.durationDays = durationDays;
        this.endTime = endTime;
        this.entryGate = entryGate;
        this.exitTime = exitTime;
        this.expectedDate = expectedDate;
        this.guestName = guestName;
        this.guestPhone = guestPhone;
        this.id = id;
        this.parkingOtp = parkingOtp;
        this.rejectedAt = rejectedAt;
        this.requestedAt = requestedAt;
        this.residentId = residentId;
        this.residentName = residentName;
        this.slotNumber = slotNumber;
        this.startTime = startTime;
        this.status = status;
        this.unit = unit;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
        this.verifiedByGuardName = verifiedByGuardName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getResidentId() {
        return residentId;
    }

    public void setResidentId(String residentId) {
        this.residentId = residentId;
    }

    public String getResidentName() {
        return residentName;
    }

    public void setResidentName(String residentName) {
        this.residentName = residentName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getGuestPhone() {
        return guestPhone;
    }

    public void setGuestPhone(String guestPhone) {
        this.guestPhone = guestPhone;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getExpectedDate() {
        return expectedDate;
    }

    public void setExpectedDate(String expectedDate) {
        this.expectedDate = expectedDate;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public String getParkingOtp() {
        return parkingOtp;
    }

    public void setParkingOtp(String parkingOtp) {
        this.parkingOtp = parkingOtp;
    }

    public GuestParkingStatus getStatus() {
        return status;
    }

    public void setStatus(GuestParkingStatus status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getRejectedAt() {
        return rejectedAt;
    }

    public void setRejectedAt(LocalDateTime rejectedAt) {
        this.rejectedAt = rejectedAt;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public LocalDateTime getExitTime() {
        return exitTime;
    }

    public void setExitTime(LocalDateTime exitTime) {
        this.exitTime = exitTime;
    }

    public String getEntryGate() {
        return entryGate;
    }

    public void setEntryGate(String entryGate) {
        this.entryGate = entryGate;
    }

    public String getVerifiedByGuardName() {
        return verifiedByGuardName;
    }

    public void setVerifiedByGuardName(String verifiedByGuardName) {
        this.verifiedByGuardName = verifiedByGuardName;
    }


    
}