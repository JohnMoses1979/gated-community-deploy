package com.bsgated.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String phone;

    @JsonIgnore
    private String password;

    private String role; // resident, vendor, security, builder, admin

    private String vendorType; // business, marketplace (optional)

    private String verificationStatus = "not_submitted"; // not_submitted, pending, approved, rejected

    private String approvalStatus = "pending"; // for backward compatibility

    @Column(columnDefinition = "TEXT")
    private String documentsJson;

    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {
    }

    public User(Long id, String name, String phone, String password, String role, String vendorType,
            String verificationStatus, String approvalStatus, String documentsJson, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.password = password;
        this.role = role;
        this.vendorType = vendorType;
        this.verificationStatus = verificationStatus;
        this.approvalStatus = approvalStatus;
        this.documentsJson = documentsJson;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getVendorType() {
        return vendorType;
    }

    public void setVendorType(String vendorType) {
        this.vendorType = vendorType;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public String getDocumentsJson() {
        return documentsJson;
    }

    public void setDocumentsJson(String documentsJson) {
        this.documentsJson = documentsJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
