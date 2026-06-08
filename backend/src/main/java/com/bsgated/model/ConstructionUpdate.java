package com.bsgated.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "construction_updates")
public class ConstructionUpdate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id")
    @JsonIgnore
    private ConstructionMilestone milestone;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String photoUrlsJson;

    @Column(columnDefinition = "TEXT")
    private String videoUrlsJson;

    private LocalDateTime updatedDate = LocalDateTime.now();

    public ConstructionUpdate() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ConstructionMilestone getMilestone() { return milestone; }
    public void setMilestone(ConstructionMilestone milestone) { this.milestone = milestone; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPhotoUrlsJson() { return photoUrlsJson; }
    public void setPhotoUrlsJson(String photoUrlsJson) { this.photoUrlsJson = photoUrlsJson; }
    public String getVideoUrlsJson() { return videoUrlsJson; }
    public void setVideoUrlsJson(String videoUrlsJson) { this.videoUrlsJson = videoUrlsJson; }
    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }
}
