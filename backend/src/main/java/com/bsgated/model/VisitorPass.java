package com.bsgated.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "visitor_passes")
public class VisitorPass {

    public VisitorPass() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String visitorName;
    private String visitorPhone;
    private String purpose;
    private String vehicleNumber;

    private String hostUnit;
    private Long hostResidentId;
    private String hostResidentName;

    private String otp;
    private String qrCode;

    // CREATED, APPROVED, CHECKED_IN, CHECKED_OUT, DENIED
    private String status = "CREATED";

    private Long verifiedByGuardId;
    private String verifiedByGuardName;
    private String entryGate;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime approvedAt;
    private LocalDateTime checkedInAt;
    private LocalDateTime checkedOutAt;

    public VisitorPass(LocalDateTime approvedAt, LocalDateTime checkedInAt, LocalDateTime checkedOutAt, String entryGate, Long hostResidentId, String hostResidentName, String hostUnit, Long id, String otp, String purpose, String qrCode, String vehicleNumber, Long verifiedByGuardId, String verifiedByGuardName, String visitorName, String visitorPhone) {
        this.approvedAt = approvedAt;
        this.checkedInAt = checkedInAt;
        this.checkedOutAt = checkedOutAt;
        this.entryGate = entryGate;
        this.hostResidentId = hostResidentId;
        this.hostResidentName = hostResidentName;
        this.hostUnit = hostUnit;
        this.id = id;
        this.otp = otp;
        this.purpose = purpose;
        this.qrCode = qrCode;
        this.vehicleNumber = vehicleNumber;
        this.verifiedByGuardId = verifiedByGuardId;
        this.verifiedByGuardName = verifiedByGuardName;
        this.visitorName = visitorName;
        this.visitorPhone = visitorPhone;
    }
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVisitorName() {
        return visitorName;
    }

    public void setVisitorName(String visitorName) {
        this.visitorName = visitorName;
    }

    public String getVisitorPhone() {
        return visitorPhone;
    }

    public void setVisitorPhone(String visitorPhone) {
        this.visitorPhone = visitorPhone;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getHostUnit() {
        return hostUnit;
    }

    public void setHostUnit(String hostUnit) {
        this.hostUnit = hostUnit;
    }

    public Long getHostResidentId() {
        return hostResidentId;
    }

    public void setHostResidentId(Long hostResidentId) {
        this.hostResidentId = hostResidentId;
    }

    public String getHostResidentName() {
        return hostResidentName;
    }

    public void setHostResidentName(String hostResidentName) {
        this.hostResidentName = hostResidentName;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getVerifiedByGuardId() {
        return verifiedByGuardId;
    }

    public void setVerifiedByGuardId(Long verifiedByGuardId) {
        this.verifiedByGuardId = verifiedByGuardId;
    }

    public String getVerifiedByGuardName() {
        return verifiedByGuardName;
    }

    public void setVerifiedByGuardName(String verifiedByGuardName) {
        this.verifiedByGuardName = verifiedByGuardName;
    }

    public String getEntryGate() {
        return entryGate;
    }

    public void setEntryGate(String entryGate) {
        this.entryGate = entryGate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getCheckedInAt() {
        return checkedInAt;
    }

    public void setCheckedInAt(LocalDateTime checkedInAt) {
        this.checkedInAt = checkedInAt;
    }

    public LocalDateTime getCheckedOutAt() {
        return checkedOutAt;
    }

    public void setCheckedOutAt(LocalDateTime checkedOutAt) {
        this.checkedOutAt = checkedOutAt;
    }
}
