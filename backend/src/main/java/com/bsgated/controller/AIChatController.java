package com.bsgated.controller;

import com.bsgated.dto.ai.AIChatRequest;
import com.bsgated.model.*;
import com.bsgated.repository.*;
import com.bsgated.security.AuthenticatedUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AIChatController — POST /api/ai/chat
 *
 * Fetches live context from DB for the authenticated user's role, builds a
 * rich system prompt, and proxies the conversation to Groq API.
 * Groq API key stays server-side (never exposed to client).
 */
@RestController
@RequestMapping("/api/ai")
public class AIChatController {

    @Value("${groq.api.key}")
    private String groqApiKey;

    private static final String GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
    private static final String GROQ_MODEL = "llama-3.3-70b-versatile";

    private final UserRepository               userRepository;
    private final MaintenanceRequestRepository maintenanceRepo;
    private final VisitorPassRepository        visitorRepo;
    private final AmenityBookingRepository     amenityRepo;
    private final NoticeRepository             noticeRepo;
    private final SOSAlertRepository           sosRepo;
    private final EVBookingRepository          evRepo;
    private final RestTemplate                 restTemplate;

    public AIChatController(
            UserRepository               userRepository,
            MaintenanceRequestRepository maintenanceRepo,
            VisitorPassRepository        visitorRepo,
            AmenityBookingRepository     amenityRepo,
            NoticeRepository             noticeRepo,
            SOSAlertRepository           sosRepo,
            EVBookingRepository          evRepo
    ) {
        this.userRepository  = userRepository;
        this.maintenanceRepo = maintenanceRepo;
        this.visitorRepo     = visitorRepo;
        this.amenityRepo     = amenityRepo;
        this.noticeRepo      = noticeRepo;
        this.sosRepo         = sosRepo;
        this.evRepo          = evRepo;
        this.restTemplate    = new RestTemplate();
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(
             AIChatRequest request,
             AuthenticatedUser currentUser
    ) {
        try {
            User user = userRepository.findById(currentUser.id())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String systemPrompt = buildSystemPrompt(user, currentUser.role());

            List<Map<String, String>> groqMessages = new ArrayList<>();
            groqMessages.add(Map.of("role", "system", "content", systemPrompt));

            if (request.getMessages() != null) {
                for (AIChatRequest.Message msg : request.getMessages()) {
                    groqMessages.add(Map.of(
                        "role",    msg.getRole()    != null ? msg.getRole()    : "user",
                        "content", msg.getContent() != null ? msg.getContent() : ""
                    ));
                }
            }

            Map<String, Object> groqBody = new LinkedHashMap<>();
            groqBody.put("model",       GROQ_MODEL);
            groqBody.put("messages",    groqMessages);
            groqBody.put("max_tokens",  600);
            groqBody.put("temperature", 0.7);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(groqBody, headers);
            ResponseEntity<Map> groqResponse = restTemplate.exchange(
                    GROQ_URL, HttpMethod.POST, entity, Map.class);

            String reply = extractGroqReply(groqResponse.getBody());

            return ResponseEntity.ok(Map.of(
                "reply",    reply,
                "role",     user.getRole(),
                "userName", user.getName()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "AI service error"));
        }
    }

    // ── System prompt with live DB context ────────────────────────────────────
    private String buildSystemPrompt(User user, String role) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a helpful AI assistant for BSGated — a smart gated community management platform.\n");
        sb.append("You are speaking with ").append(user.getName())
          .append(", who is a ").append(friendlyRole(role)).append(".\n\n");
        sb.append("=== LIVE COMMUNITY DATA (fetched right now from the database) ===\n");

        try {
            switch (role.toUpperCase()) {
                case "RESIDENT"    -> appendResidentContext(sb, user);
                case "ADMIN"       -> appendAdminContext(sb);
                case "SUPER_ADMIN" -> appendAdminContext(sb);
                case "SECURITY"    -> appendGuardContext(sb);
                case "VENDOR"      -> appendVendorContext(sb, user);
                default            -> appendGeneralContext(sb);
            }
        } catch (Exception ex) {
            sb.append("(Live data temporarily unavailable)\n");
        }

        sb.append("\n=== INSTRUCTIONS ===\n");
        sb.append("- Be friendly, concise, and role-appropriate.\n");
        sb.append("- Use the LIVE DATA above to give specific accurate answers.\n");
        sb.append("- Reference exact numbers from the data above when relevant.\n");
        sb.append("- Tell the user which section of the BSGated app to use for actions.\n");
        sb.append("- Keep replies under 150 words unless user asks for detail.\n");
        sb.append("- Never make up data not provided above.\n");

        return sb.toString();
    }

    private void appendResidentContext(StringBuilder sb, User user) {
        String uid = String.valueOf(user.getId());

        // Maintenance
        List<MaintenanceRequest> myMaint = maintenanceRepo.findAll().stream()
                .filter(m -> uid.equals(m.getResidentId()))
                .collect(Collectors.toList());
        long openMaint = myMaint.stream().filter(m -> !"CLOSED".equalsIgnoreCase(m.getStatus())).count();
        sb.append("Your Maintenance Requests: ").append(myMaint.size())
          .append(" total, ").append(openMaint).append(" open.\n");
        myMaint.stream().filter(m -> !"CLOSED".equalsIgnoreCase(m.getStatus())).limit(3)
                .forEach(m -> sb.append("  - [").append(m.getStatus()).append("] ")
                        .append(m.getCategory() != null ? m.getCategory() : "General")
                        .append(": ").append(truncate(m.getDescription(), 60)).append("\n"));

        // Visitor passes
        List<VisitorPass> myVisitors = visitorRepo.findAll().stream()
                .filter(v -> user.getId() != null && user.getId().equals(v.getHostResidentId()))
                .collect(Collectors.toList());
        long activeV = myVisitors.stream()
                .filter(v -> "APPROVED".equalsIgnoreCase(v.getStatus()) || "CREATED".equalsIgnoreCase(v.getStatus()))
                .count();
        sb.append("Your Visitor Passes: ").append(myVisitors.size())
          .append(" total, ").append(activeV).append(" active.\n");

        // Amenity bookings
        List<AmenityBooking> myBooks = amenityRepo.findAll().stream()
                .filter(b -> uid.equals(b.getResidentId())).limit(5).collect(Collectors.toList());
        sb.append("Your Amenity Bookings: ").append(myBooks.size()).append(".\n");
        myBooks.forEach(b -> sb.append("  - ").append(b.getAmenityName())
                .append(" on ").append(b.getDate()).append(" [").append(b.getStatus()).append("]\n"));

        // EV bookings
        long myEV = evRepo.findAll().stream().filter(e -> uid.equals(e.getResidentId())).count();
        sb.append("Your EV Charging Bookings: ").append(myEV).append(".\n");

        // SOS
        List<SOSAlert> activeSOS = sosRepo.findAll().stream()
                .filter(s -> uid.equals(s.getResidentId()) && !"RESOLVED".equalsIgnoreCase(s.getStatus()))
                .collect(Collectors.toList());
        if (!activeSOS.isEmpty())
            sb.append("⚠️ Active SOS Alert: status = ").append(activeSOS.get(0).getStatus()).append(".\n");

        appendRecentNotices(sb);
    }

    private void appendAdminContext(StringBuilder sb) {
        // Pending approvals
        List<User> pending = userRepository.findAll().stream()
                .filter(u -> "pending".equalsIgnoreCase(u.getVerificationStatus())
                          || "not_submitted".equalsIgnoreCase(u.getVerificationStatus()))
                .collect(Collectors.toList());
        sb.append("Pending Approvals: ").append(pending.size()).append(".\n");
        pending.stream().limit(5).forEach(u ->
                sb.append("  - ").append(u.getName()).append(" (").append(u.getRole()).append(")\n"));

        // Maintenance
        List<MaintenanceRequest> all = maintenanceRepo.findAll();
        long open = all.stream().filter(m -> !"CLOSED".equalsIgnoreCase(m.getStatus())).count();
        sb.append("Community Maintenance: ").append(all.size()).append(" total, ").append(open).append(" open.\n");

        // Visitors
        long activeV = visitorRepo.findAll().stream()
                .filter(v -> "CREATED".equalsIgnoreCase(v.getStatus()) || "APPROVED".equalsIgnoreCase(v.getStatus()))
                .count();
        sb.append("Active Visitor Passes: ").append(activeV).append(".\n");

        // SOS
        long activeSOS = sosRepo.findAll().stream()
                .filter(s -> !"RESOLVED".equalsIgnoreCase(s.getStatus())).count();
        if (activeSOS > 0) sb.append("⚠️ Active SOS Alerts: ").append(activeSOS).append(".\n");

        // Residents
        long residents = userRepository.findAll().stream()
                .filter(u -> "resident".equalsIgnoreCase(u.getRole())
                          && "approved".equalsIgnoreCase(u.getVerificationStatus())).count();
        sb.append("Approved Residents: ").append(residents).append(".\n");

        appendRecentNotices(sb);
    }

    private void appendGuardContext(StringBuilder sb) {
        long activeSOS = sosRepo.findAll().stream()
                .filter(s -> !"RESOLVED".equalsIgnoreCase(s.getStatus())).count();
        sb.append("Active SOS Alerts: ").append(activeSOS).append(".\n");

        long pendingVisitors = visitorRepo.findAll().stream()
                .filter(v -> "CREATED".equalsIgnoreCase(v.getStatus())).count();
        sb.append("Visitors Awaiting Verification: ").append(pendingVisitors).append(".\n");

        appendRecentNotices(sb);
    }

    private void appendVendorContext(StringBuilder sb, User user) {
        List<MaintenanceRequest> myJobs = maintenanceRepo.findAll().stream()
                .filter(m -> user.getId() != null && user.getId().equals(m.getVendorId()))
                .collect(Collectors.toList());
        long open = myJobs.stream().filter(m -> !"CLOSED".equalsIgnoreCase(m.getStatus())).count();
        sb.append("Your Assigned Jobs: ").append(myJobs.size()).append(" total, ").append(open).append(" open.\n");
        myJobs.stream().filter(m -> !"CLOSED".equalsIgnoreCase(m.getStatus())).limit(5)
                .forEach(m -> sb.append("  - [").append(m.getStatus()).append("] ")
                        .append(m.getCategory() != null ? m.getCategory() : "General").append("\n"));

        appendRecentNotices(sb);
    }

    private void appendGeneralContext(StringBuilder sb) {
        appendRecentNotices(sb);
        sb.append("Total Platform Users: ").append(userRepository.count()).append(".\n");
    }

    private void appendRecentNotices(StringBuilder sb) {
        List<Notice> notices = noticeRepo.findAll().stream()
                .sorted((a, b) -> {
                    if (a.getPostedAt() == null || b.getPostedAt() == null) return 0;
                    return b.getPostedAt().compareTo(a.getPostedAt());
                }).limit(3).collect(Collectors.toList());
        if (!notices.isEmpty()) {
            sb.append("Recent Notices:\n");
            notices.forEach(n -> sb.append("  - ").append(n.getTitle() != null ? n.getTitle() : "Notice").append("\n"));
        }
    }

    @SuppressWarnings("unchecked")
    private String extractGroqReply(Map groqData) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) groqData.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                if (message != null && message.get("content") != null)
                    return message.get("content").toString().trim();
            }
        } catch (Exception ignored) {}
        return "Sorry, I couldn't get a response. Please try again.";
    }

    private String friendlyRole(String role) {
        return switch (role.toUpperCase()) {
            case "RESIDENT"    -> "resident";
            case "ADMIN"       -> "community admin";
            case "SECURITY"    -> "security guard";
            case "VENDOR"      -> "vendor / service provider";
            case "SUPER_ADMIN" -> "super admin";
            case "BUILDER"     -> "builder";
            case "CUSTOMER"    -> "customer";
            default            -> role.toLowerCase();
        };
    }

    private String truncate(String s, int max) {
        if (s == null) return "No description";
        return s.length() > max ? s.substring(0, max) + "…" : s;
    }
}
