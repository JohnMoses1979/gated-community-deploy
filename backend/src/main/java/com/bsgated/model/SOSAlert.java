package com.bsgated.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sos_alerts")
public class SOSAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String residentId;

    private String residentName;
    private String unit;
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status; // TRIGGERED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED

    private LocalDateTime triggeredAt;
    
    private LocalDateTime acknowledgedAt;
    private String acknowledgedById;
    private String acknowledgedByName;
    
    private LocalDateTime inProgressAt;
    
    private LocalDateTime resolvedAt;
    private String resolvedById;
    private String resolvedByName;
    
    @Column(columnDefinition = "TEXT")
    private String resolution;

    @Column(columnDefinition = "JSON")
    private String timelineJson; // To store timeline events

    public SOSAlert() {}

    @PrePersist
    protected void onCreate() {
        this.triggeredAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "TRIGGERED";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTriggeredAt() {
        return triggeredAt;
    }

    public void setTriggeredAt(LocalDateTime triggeredAt) {
        this.triggeredAt = triggeredAt;
    }

    public LocalDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public String getAcknowledgedById() {
        return acknowledgedById;
    }

    public void setAcknowledgedById(String acknowledgedById) {
        this.acknowledgedById = acknowledgedById;
    }

    public String getAcknowledgedByName() {
        return acknowledgedByName;
    }

    public void setAcknowledgedByName(String acknowledgedByName) {
        this.acknowledgedByName = acknowledgedByName;
    }

    public LocalDateTime getInProgressAt() {
        return inProgressAt;
    }

    public void setInProgressAt(LocalDateTime inProgressAt) {
        this.inProgressAt = inProgressAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getResolvedById() {
        return resolvedById;
    }

    public void setResolvedById(String resolvedById) {
        this.resolvedById = resolvedById;
    }

    public String getResolvedByName() {
        return resolvedByName;
    }

    public void setResolvedByName(String resolvedByName) {
        this.resolvedByName = resolvedByName;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public String getTimelineJson() {
        return timelineJson;
    }

    public void setTimelineJson(String timelineJson) {
        this.timelineJson = timelineJson;
    }
}
