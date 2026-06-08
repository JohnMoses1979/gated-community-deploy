package com.bsgated.dto.construction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for builder posting a construction update under a milestone. milestoneId
 * comes from path variable — ownership validated server-side.
 */
public class AddConstructionUpdateRequest {

    @NotBlank(message = "Description is required")
    @Size(max = 10_000, message = "Description must not exceed 10,000 characters")
    private String description;

    /**
     * JSON array of photo URLs, stored as text.
     */
    @Size(max = 5000, message = "Photo URLs payload is too large")
    private String photoUrlsJson;

    /**
     * JSON array of video URLs, stored as text.
     */
    @Size(max = 5000, message = "Video URLs payload is too large")
    private String videoUrlsJson;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhotoUrlsJson() {
        return photoUrlsJson;
    }

    public void setPhotoUrlsJson(String photoUrlsJson) {
        this.photoUrlsJson = photoUrlsJson;
    }

    public String getVideoUrlsJson() {
        return videoUrlsJson;
    }

    public void setVideoUrlsJson(String videoUrlsJson) {
        this.videoUrlsJson = videoUrlsJson;
    }
}
