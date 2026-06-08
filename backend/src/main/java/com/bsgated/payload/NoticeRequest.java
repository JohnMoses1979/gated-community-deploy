package com.bsgated.payload;

/**
 * Payload sent by the admin when creating a notice.
 * Mirrors the compose-form fields in AdminNoticeBoardScreen.js.
 */
public class NoticeRequest {

    private String title;
    private String body;
    private String type        = "notice";   // notice | event | payment_reminder | emergency
    private String targetRole  = "all";      // all | resident | vendor | security
    private boolean pinned     = false;
    private int expiryDays     = 7;          // 0 = no expiry

    // Event-specific (only when type == "event")
    private String eventDate;
    private String eventTime;
    private String eventVenue;
    private boolean rsvpEnabled = false;

    // ── Getters & setters ────────────────────────────────────────────────

    public String getTitle()                    { return title; }
    public void setTitle(String title)          { this.title = title; }

    public String getBody()                     { return body; }
    public void setBody(String body)            { this.body = body; }

    public String getType()                     { return type; }
    public void setType(String type)            { this.type = type; }

    public String getTargetRole()               { return targetRole; }
    public void setTargetRole(String targetRole){ this.targetRole = targetRole; }

    public boolean isPinned()                   { return pinned; }
    public void setPinned(boolean pinned)       { this.pinned = pinned; }

    public int getExpiryDays()                  { return expiryDays; }
    public void setExpiryDays(int expiryDays)   { this.expiryDays = expiryDays; }

    public String getEventDate()                { return eventDate; }
    public void setEventDate(String eventDate)  { this.eventDate = eventDate; }

    public String getEventTime()                { return eventTime; }
    public void setEventTime(String eventTime)  { this.eventTime = eventTime; }

    public String getEventVenue()               { return eventVenue; }
    public void setEventVenue(String eventVenue){ this.eventVenue = eventVenue; }

    public boolean isRsvpEnabled()              { return rsvpEnabled; }
    public void setRsvpEnabled(boolean v)       { this.rsvpEnabled = v; }
}