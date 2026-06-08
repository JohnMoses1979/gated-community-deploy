// package com.bsgated.service;
// import com.bsgated.model.SOSAlert;
// import com.bsgated.repository.SOSAlertRepository;
// import com.fasterxml.jackson.core.type.TypeReference;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import java.time.LocalDateTime;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.Map;
// import java.util.HashMap;
// @Service
// public class SOSAlertService {
//     @Autowired
//     private SOSAlertRepository sosAlertRepository;
//     private final ObjectMapper objectMapper = new ObjectMapper();
//     public SOSAlert createSOS(SOSAlert alert) {
//         alert.setStatus("TRIGGERED");
//         alert.setTriggeredAt(LocalDateTime.now());
//         List<Map<String, Object>> timeline = new ArrayList<>();
//         timeline.add(createTimelineEvent("SOS TRIGGERED", alert.getResidentName(), "Resident"));
//         try {
//             alert.setTimelineJson(objectMapper.writeValueAsString(timeline));
//         } catch (Exception e) {
//             e.printStackTrace();
//         }
//         return sosAlertRepository.save(alert);
//     }
//     public List<SOSAlert> getAllAlerts() {
//         return sosAlertRepository.findAll();
//     }
//     public List<SOSAlert> getActiveAlerts() {
//         return sosAlertRepository.findByStatusNotOrderByTriggeredAtDesc("RESOLVED");
//     }
//     public List<SOSAlert> getAlertsByResident(String residentId) {
//         return sosAlertRepository.findByResidentIdOrderByTriggeredAtDesc(residentId);
//     }
//     public SOSAlert acknowledgeSOS(Long id, String guardId, String guardName) {
//         SOSAlert alert = sosAlertRepository.findById(id).orElseThrow(() -> new RuntimeException("SOS not found"));
//         alert.setStatus("ACKNOWLEDGED");
//         alert.setAcknowledgedAt(LocalDateTime.now());
//         alert.setAcknowledgedById(guardId);
//         alert.setAcknowledgedByName(guardName);
//         addTimelineEvent(alert, "ACKNOWLEDGED", guardName, "Security Guard");
//         return sosAlertRepository.save(alert);
//     }
//     public SOSAlert progressSOS(Long id, String guardId, String guardName) {
//         SOSAlert alert = sosAlertRepository.findById(id).orElseThrow(() -> new RuntimeException("SOS not found"));
//         alert.setStatus("IN_PROGRESS");
//         alert.setInProgressAt(LocalDateTime.now());
//         addTimelineEvent(alert, "IN PROGRESS - Responding", guardName, "Security Guard");
//         return sosAlertRepository.save(alert);
//     }
//     public SOSAlert resolveSOS(Long id, String guardId, String guardName, String resolution) {
//         SOSAlert alert = sosAlertRepository.findById(id).orElseThrow(() -> new RuntimeException("SOS not found"));
//         alert.setStatus("RESOLVED");
//         alert.setResolvedAt(LocalDateTime.now());
//         alert.setResolvedById(guardId);
//         alert.setResolvedByName(guardName);
//         alert.setResolution(resolution);
//         addTimelineEvent(alert, "RESOLVED", guardName, "Resolution: " + resolution);
//         return sosAlertRepository.save(alert);
//     }
//     private void addTimelineEvent(SOSAlert alert, String action, String byName, String details) {
//         try {
//             List<Map<String, Object>> timeline = new ArrayList<>();
//             if (alert.getTimelineJson() != null) {
//                 timeline = objectMapper.readValue(alert.getTimelineJson(), new TypeReference<List<Map<String, Object>>>(){});
//             }
//             timeline.add(createTimelineEvent(action, byName, details));
//             alert.setTimelineJson(objectMapper.writeValueAsString(timeline));
//         } catch (Exception e) {
//             e.printStackTrace();
//         }
//     }
//     private Map<String, Object> createTimelineEvent(String action, String byName, String details) {
//         Map<String, Object> event = new HashMap<>();
//         event.put("action", action);
//         event.put("byName", byName);
//         event.put("details", details);
//         event.put("at", LocalDateTime.now().toString());
//         return event;
//     }
// }














package com.bsgated.service;

import com.bsgated.model.SOSAlert;
import com.bsgated.repository.SOSAlertRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SOSAlertService {

    private final SOSAlertRepository sosAlertRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SOSAlertService(SOSAlertRepository sosAlertRepository) {
        this.sosAlertRepository = sosAlertRepository;
    }

    // ── RESIDENT ──────────────────────────────────────────────────────
    /**
     * Resident triggers an SOS alert. residentId and residentName are always
     * taken from JWT — never trusted from body. Caller-supplied
     * residentId/residentName in the request body are silently overwritten.
     */
    public SOSAlert createSOS(SOSAlert alert) {
        AuthenticatedUser me = CurrentUser.get();

        // Identity from JWT only — overwrite anything the frontend sent
        alert.setResidentId(String.valueOf(me.id()));
        alert.setResidentName(me.phone()); // phone is the stable identity in the JWT;
        // swap for a name claim if you add one later

        alert.setStatus("TRIGGERED");
        alert.setTriggeredAt(LocalDateTime.now());

        List<Map<String, Object>> timeline = new ArrayList<>();
        timeline.add(createTimelineEvent("SOS TRIGGERED", alert.getResidentName(), "Resident"));

        try {
            alert.setTimelineJson(objectMapper.writeValueAsString(timeline));
        } catch (Exception e) {
            e.printStackTrace();
        }

        return sosAlertRepository.save(alert);
    }

    /**
     * Resident views only their own SOS alerts. residentId from JWT — no path
     * variable, prevents IDOR.
     */
    public List<SOSAlert> getMyAlerts() {
        AuthenticatedUser me = CurrentUser.get();
        return sosAlertRepository.findByResidentIdOrderByTriggeredAtDesc(String.valueOf(me.id()));
    }

    // ── GUARD ────────────────────────────────────────────────────────
    /**
     * Guard acknowledges an active SOS alert. guardId and guardName from JWT —
     * never from request body.
     */
    public SOSAlert acknowledgeSOS(Long id) {
        AuthenticatedUser me = CurrentUser.get();

        SOSAlert alert = sosAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SOS alert not found: " + id));

        alert.setStatus("ACKNOWLEDGED");
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedById(String.valueOf(me.id()));
        alert.setAcknowledgedByName(me.phone()); // swap for name claim when available

        addTimelineEvent(alert, "ACKNOWLEDGED", me.phone(), "Security Guard");

        return sosAlertRepository.save(alert);
    }

    /**
     * Guard marks SOS as actively being responded to. guardId and guardName
     * from JWT — never from request body.
     */
    public SOSAlert progressSOS(Long id) {
        AuthenticatedUser me = CurrentUser.get();

        SOSAlert alert = sosAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SOS alert not found: " + id));

        alert.setStatus("IN_PROGRESS");
        alert.setInProgressAt(LocalDateTime.now());

        addTimelineEvent(alert, "IN PROGRESS - Responding", me.phone(), "Security Guard");

        return sosAlertRepository.save(alert);
    }

    /**
     * Guard resolves an SOS alert. guardId and guardName from JWT — never from
     * request body. resolution text is the only field accepted from the caller.
     */
    public SOSAlert resolveSOS(Long id, String resolution) {
        AuthenticatedUser me = CurrentUser.get();

        SOSAlert alert = sosAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SOS alert not found: " + id));

        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolvedById(String.valueOf(me.id()));
        alert.setResolvedByName(me.phone()); // swap for name claim when available
        alert.setResolution(resolution);

        addTimelineEvent(alert, "RESOLVED", me.phone(), "Resolution: " + resolution);

        return sosAlertRepository.save(alert);
    }

    // ── ADMIN ─────────────────────────────────────────────────────────
    /**
     * Admin views all SOS alerts — full history, no filter.
     */
    public List<SOSAlert> getAllAlerts() {
        return sosAlertRepository.findAll();
    }

    /**
     * Admin / Guard views all non-resolved SOS alerts.
     */
    public List<SOSAlert> getActiveAlerts() {
        return sosAlertRepository.findByStatusNotOrderByTriggeredAtDesc("RESOLVED");
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────
    private void addTimelineEvent(SOSAlert alert, String action, String byName, String details) {
        try {
            List<Map<String, Object>> timeline = new ArrayList<>();
            if (alert.getTimelineJson() != null) {
                timeline = objectMapper.readValue(
                        alert.getTimelineJson(),
                        new TypeReference<List<Map<String, Object>>>() {
                });
            }
            timeline.add(createTimelineEvent(action, byName, details));
            alert.setTimelineJson(objectMapper.writeValueAsString(timeline));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Map<String, Object> createTimelineEvent(String action, String byName, String details) {
        Map<String, Object> event = new HashMap<>();
        event.put("action", action);
        event.put("byName", byName);
        event.put("details", details);
        event.put("at", LocalDateTime.now().toString());
        return event;
    }
}
