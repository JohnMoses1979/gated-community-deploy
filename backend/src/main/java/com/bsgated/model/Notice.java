package com.bsgated.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notices")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    /**
     * notice | event | payment_reminder | emergency
     */
    @Column(nullable = false)
    private String type = "notice";

    /**
     * all | resident | vendor | security
     * The frontend uses these exact strings — keep them in sync.
     */
    @Column(nullable = false)
    private String targetRole = "all";

    private boolean pinned = false;

    private LocalDateTime postedAt = LocalDateTime.now();

    private LocalDateTime expiresAt;

    // Posted-by info (denormalised for quick reads)
    private Long postedById;
    private String postedByName;

    // ── Event-specific fields (null when type != "event") ──────────────────
    private String eventDate;   // ISO date string, e.g. "2026-05-15"
    private String eventTime;   // e.g. "6:00 PM"
    private String eventVenue;

    private boolean rsvpEnabled = false;
    private int     rsvpCount   = 0;

    // ── Getters & setters ─────────────────────────────────────────────────

    public Long getId()                  { return id; }
    public void setId(Long id)           { this.id = id; }

    public String getTitle()             { return title; }
    public void setTitle(String title)   { this.title = title; }

    public String getBody()              { return body; }
    public void setBody(String body)     { this.body = body; }

    public String getType()              { return type; }
    public void setType(String type)     { this.type = type; }

    public String getTargetRole()                { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public boolean isPinned()            { return pinned; }
    public void setPinned(boolean pinned){ this.pinned = pinned; }

    public LocalDateTime getPostedAt()               { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt)  { this.postedAt = postedAt; }

    public LocalDateTime getExpiresAt()              { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt){ this.expiresAt = expiresAt; }

    public Long getPostedById()                  { return postedById; }
    public void setPostedById(Long postedById)   { this.postedById = postedById; }

    public String getPostedByName()                      { return postedByName; }
    public void setPostedByName(String postedByName)     { this.postedByName = postedByName; }

    public String getEventDate()                 { return eventDate; }
    public void setEventDate(String eventDate)   { this.eventDate = eventDate; }

    public String getEventTime()                 { return eventTime; }
    public void setEventTime(String eventTime)   { this.eventTime = eventTime; }

    public String getEventVenue()                { return eventVenue; }
    public void setEventVenue(String eventVenue) { this.eventVenue = eventVenue; }

    public boolean isRsvpEnabled()               { return rsvpEnabled; }
    public void setRsvpEnabled(boolean rsvpEnabled){ this.rsvpEnabled = rsvpEnabled; }

    public int getRsvpCount()              { return rsvpCount; }
    public void setRsvpCount(int rsvpCount){ this.rsvpCount = rsvpCount; }
}