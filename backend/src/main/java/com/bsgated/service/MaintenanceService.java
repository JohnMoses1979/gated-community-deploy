// package com.bsgated.service;
// import com.bsgated.model.MaintenanceRequest;
// import com.bsgated.model.User;
// import com.bsgated.payload.MaintenancePayloads;
// import com.bsgated.payload.PaymentVerifyRequest;
// import com.bsgated.repository.MaintenanceRequestRepository;
// import com.bsgated.repository.UserRepository;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.http.*;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import org.springframework.web.client.RestTemplate;
// import javax.crypto.Mac;
// import javax.crypto.spec.SecretKeySpec;
// import java.nio.charset.StandardCharsets;
// import java.time.LocalDateTime;
// import java.util.*;
// /**
//  * MaintenanceService
//  *
//  * ─── Simplified 2-Stage Workflow ───────────────────────────────────────────
//  *
//  * STATUS FLOW:
//  *
//  *   submitted
//  *     ↓ (admin assigns vendor)
//  *   vendor_assigned
//  *     ↓ (vendor submits quote)
//  *   quote_submitted
//  *     ↓ (admin forwards to resident)
//  *   quote_forwarded
//  *     ↓ (resident accepts)                  ← resident rejects → quote_rejected → loop back to vendor_assigned
//  *   quote_accepted
//  *     ↓ (admin generates gate OTP)
//  *   gate_otp_generated
//  *     ↓ (guard verifies OTP)
//  *   work_started         ← STAGE 1
//  *     ↓ (vendor marks complete)
//  *   work_completed       ← STAGE 2
//  *     ↓ (vendor raises payment request)
//  *   payment_requested
//  *     ↓ (admin forwards to resident)
//  *   payment_sent_to_resident
//  *     ↓ (resident pays via Razorpay)
//  *   payment_done
//  *     ↓ (admin confirms, closes job)
//  *   closed
//  *
//  * ───────────────────────────────────────────────────────────────────────────
//  */
// @Service
// public class MaintenanceService {
//     private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";
//     @Value("${razorpay.key.id}")
//     private String razorpayKeyId;
//     @Value("${razorpay.key.secret}")
//     private String razorpayKeySecret;
//     private final MaintenanceRequestRepository repo;
//     private final UserRepository               userRepo;
//     public MaintenanceService(MaintenanceRequestRepository repo, UserRepository userRepo) {
//         this.repo     = repo;
//         this.userRepo = userRepo;
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 1 — Resident submits request
//     //  submitted
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public MaintenanceRequest submit(MaintenancePayloads.Submit req) {
//         MaintenanceRequest mr = new MaintenanceRequest();
//         mr.setResidentId(req.getResidentId());
//         mr.setResidentName(req.getResidentName());
//         mr.setResidentPhone(req.getResidentPhone());
//         mr.setUnit(req.getUnit());
//         mr.setTitle(req.getTitle());
//         mr.setDescription(req.getDescription());
//         mr.setCategory(req.getCategory());
//         mr.setPriority(req.getPriority() != null ? req.getPriority() : "Medium");
//         mr.setPreferredSlot(req.getPreferredSlot());
//         mr.setContactPref(req.getContactPref());
//         mr.setStatus("submitted");
//         mr.setCreatedAt(LocalDateTime.now());
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline("[]",
//             "Resident submitted request",
//             req.getResidentName(), null));
//         return repo.save(mr);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 2 — Admin assigns vendor
//     //  vendor_assigned
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public MaintenanceRequest assignVendor(Long id, MaintenancePayloads.AssignVendor req) {
//         MaintenanceRequest mr = getOrThrow(id);
//         // Allow re-assignment after rejection
//         requireStatus(mr, "submitted", "quote_rejected");
//         String adminName = resolveUserName(req.getAdminId());
//         mr.setVendorId(req.getVendorId());
//         mr.setVendorName(req.getVendorName());
//         mr.setVendorPhone(req.getVendorPhone());
//         mr.setAdminId(req.getAdminId());
//         mr.setAdminName(adminName);
//         mr.setStatus("vendor_assigned");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             "Admin assigned vendor: " + req.getVendorName(),
//             adminName, null));
//         return repo.save(mr);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 3 — Vendor submits quote
//     //  quote_submitted
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public MaintenanceRequest submitQuote(Long id, MaintenancePayloads.SubmitQuote req) {
//         MaintenanceRequest mr = getOrThrow(id);
//         requireStatus(mr, "vendor_assigned");
//         mr.setQuoteAmount(req.getAmount());
//         mr.setQuoteDescription(req.getDescription());
//         mr.setQuoteEstimatedDays(req.getEstimatedDays());
//         mr.setStatus("quote_submitted");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             "Vendor submitted quote: ₹" + req.getAmount(),
//             mr.getVendorName(), null));
//         return repo.save(mr);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 4 — Admin forwards quote to resident
//     //  quote_forwarded
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public MaintenanceRequest forwardQuote(Long id, Long adminId) {
//         MaintenanceRequest mr = getOrThrow(id);
//         requireStatus(mr, "quote_submitted");
//         String adminName = resolveUserName(adminId);
//         mr.setStatus("quote_forwarded");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             "Admin forwarded quote ₹" + mr.getQuoteAmount() + " to resident",
//             adminName, null));
//         return repo.save(mr);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 5 — Resident accepts or rejects quote
//     //  quote_accepted | quote_rejected
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public MaintenanceRequest respondToQuote(Long id, MaintenancePayloads.QuoteResponse req) {
//         MaintenanceRequest mr = getOrThrow(id);
//         requireStatus(mr, "quote_forwarded");
//         boolean accepted = "accept".equalsIgnoreCase(req.getDecision());
//         mr.setStatus(accepted ? "quote_accepted" : "quote_rejected");
//         if (!accepted && req.getReason() != null) {
//             mr.setRejectionReason(req.getReason());
//         }
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             accepted
//                 ? "Resident accepted quote ₹" + mr.getQuoteAmount()
//                 : "Resident rejected quote" + (req.getReason() != null ? ". Reason: " + req.getReason() : ""),
//             mr.getResidentName(), null));
//         return repo.save(mr);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 6a — Admin generates gate OTP for vendor
//     //  gate_otp_generated
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public MaintenanceRequest generateGateOtp(Long id, Long adminId) {
//         MaintenanceRequest mr = getOrThrow(id);
//         requireStatus(mr, "quote_accepted");
//         String adminName = resolveUserName(adminId);
//         String otp = String.format("%06d", new Random().nextInt(999999));
//         mr.setGateOtp(otp);
//         mr.setGateOtpGeneratedAt(LocalDateTime.now());
//         mr.setGateOtpUsed(false);
//         mr.setStatus("gate_otp_generated");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             "Admin generated gate OTP for vendor",
//             adminName, null));
//         return repo.save(mr);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 6b — Guard verifies gate OTP → work_started (STAGE 1)
//     //  work_started
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public Map<String, Object> verifyGateOtp(MaintenancePayloads.GateOtpVerify req) {
//         Map<String, Object> result = new HashMap<>();
//         Optional<MaintenanceRequest> opt = repo.findByGateOtp(req.getOtp());
//         if (opt.isEmpty()) {
//             result.put("ok", false);
//             result.put("reason", "Invalid OTP — no matching maintenance request found.");
//             return result;
//         }
//         MaintenanceRequest mr = opt.get();
//         if (mr.isGateOtpUsed()) {
//             result.put("ok", false);
//             result.put("reason", "OTP has already been used.");
//             return result;
//         }
//         if (!"gate_otp_generated".equals(mr.getStatus())) {
//             result.put("ok", false);
//             result.put("reason", "Request is not in expected state: " + mr.getStatus());
//             return result;
//         }
//         mr.setGateOtpUsed(true);
//         mr.setGateVerifiedBy(req.getGuardId() + " — " + req.getGuardName());
//         mr.setGateVerifiedAt(LocalDateTime.now());
//         mr.setWorkStartedAt(LocalDateTime.now());
//         mr.setStatus("work_started");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             "Guard verified OTP — vendor granted entry. Work started (Stage 1/2).",
//             req.getGuardName(), null));
//         repo.save(mr);
//         result.put("ok", true);
//         result.put("request", mr);
//         return result;
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 7 — Vendor marks work completed (STAGE 2)
//     //  work_completed
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public MaintenanceRequest markWorkCompleted(Long id, MaintenancePayloads.WorkComplete req) {
//         MaintenanceRequest mr = getOrThrow(id);
//         requireStatus(mr, "work_started");
//         mr.setWorkCompletedAt(LocalDateTime.now());
//         mr.setStatus("work_completed");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             "Vendor marked work as completed (Stage 2/2)" +
//                 (req.getNotes() != null && !req.getNotes().isBlank() ? ": " + req.getNotes() : ""),
//             mr.getVendorName(), null));
//         return repo.save(mr);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 8 — Vendor raises payment request
//     //  payment_requested
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public MaintenanceRequest residentApproveWork(Long id) {
//         MaintenanceRequest mr = getOrThrow(id);
//         requireStatus(mr, "work_completed");
//         mr.setStatus("resident_work_approved");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             "Resident approved completed work",
//             mr.getResidentName(), null));
//         return repo.save(mr);
//     }
//     @Transactional
//     public MaintenanceRequest vendorRaisePayment(Long id, MaintenancePayloads.PaymentRequest req) {
//         MaintenanceRequest mr = getOrThrow(id);
//         requireStatus(mr, "resident_work_approved");
//         // Use provided amount or fall back to original quote amount
//         double amount = (req.getAmount() != null && req.getAmount() > 0)
//             ? req.getAmount()
//             : (mr.getQuoteAmount() != null ? mr.getQuoteAmount() : 0);
//         mr.setPaymentAmount(amount);
//         mr.setPaymentNotes(req.getNotes());
//         mr.setStatus("payment_requested");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             "Vendor raised payment request: ₹" + amount,
//             mr.getVendorName(), null));
//         return repo.save(mr);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 9 — Admin forwards payment request to resident
//     //  payment_sent_to_resident
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public MaintenanceRequest forwardPaymentToResident(Long id, Long adminId) {
//         MaintenanceRequest mr = getOrThrow(id);
//         requireStatus(mr, "payment_requested");
//         String adminName = resolveUserName(adminId);
//         mr.setStatus("payment_sent_to_resident");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             "Admin forwarded payment request ₹" + mr.getPaymentAmount() + " to resident",
//             adminName, null));
//         return repo.save(mr);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 10a — Create Razorpay payment order for resident
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public Map<String, Object> createPaymentOrder(Long id) throws Exception {
//         MaintenanceRequest mr = getOrThrow(id);
//         requireStatus(mr, "payment_sent_to_resident");
//         if (mr.getPaymentAmount() == null || mr.getPaymentAmount() <= 0) {
//             throw new RuntimeException("Payment amount not set for this request.");
//         }
//         int amountInPaise = (int) (mr.getPaymentAmount() * 100);
//         Map<String, Object> rzpOrder = createRazorpayOrder(amountInPaise, "maint_" + id);
//         mr.setRazorpayOrderId(String.valueOf(rzpOrder.get("id")));
//         mr.setUpdatedAt(LocalDateTime.now());
//         repo.save(mr);
//         Map<String, Object> result = new HashMap<>();
//         result.put("requestId",       id);
//         result.put("razorpayOrderId", rzpOrder.get("id"));
//         result.put("razorpayKeyId",   razorpayKeyId);
//         result.put("amount",          amountInPaise);
//         result.put("currency",        "INR");
//         result.put("description",     "Maintenance: " + mr.getTitle());
//         return result;
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 10b — Resident verifies Razorpay payment → payment_done
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public MaintenanceRequest verifyPayment(PaymentVerifyRequest req) throws Exception {
//         // Verify Razorpay HMAC-SHA256 signature
//         String payload  = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
//         Mac mac         = Mac.getInstance("HmacSHA256");
//         SecretKeySpec sk = new SecretKeySpec(
//             razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
//         mac.init(sk);
//         byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
//         StringBuilder hex = new StringBuilder();
//         for (byte b : hash) hex.append(String.format("%02x", b));
//         if (!hex.toString().equals(req.getRazorpaySignature())) {
//             throw new RuntimeException("Payment signature verification failed.");
//         }
//         MaintenanceRequest mr = repo.findByRazorpayOrderId(req.getRazorpayOrderId())
//             .orElseThrow(() -> new RuntimeException(
//                 "No maintenance request found for Razorpay order: " + req.getRazorpayOrderId()));
//         mr.setRazorpayPaymentId(req.getRazorpayPaymentId());
//         mr.setStatus("payment_done");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             "Resident paid ₹" + mr.getPaymentAmount() + " via Razorpay",
//             mr.getResidentName(), null));
//         return repo.save(mr);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  STEP 11 — Admin closes job (payment confirmed to vendor)
//     //  closed
//     // ═══════════════════════════════════════════════════════════════════
//     @Transactional
//     public MaintenanceRequest simulatePayment(Long id, String paymentId, String method) {
//         MaintenanceRequest mr = getOrThrow(id);
//         requireStatus(mr, "payment_sent_to_resident");
//         String resolvedPaymentId = (paymentId != null && !paymentId.isBlank())
//             ? paymentId
//             : "pay_demo_" + System.currentTimeMillis();
//         String resolvedMethod = (method != null && !method.isBlank())
//             ? method
//             : "Demo Payment";
//         if (mr.getRazorpayOrderId() == null || mr.getRazorpayOrderId().isBlank()) {
//             mr.setRazorpayOrderId("order_demo_" + id + "_" + System.currentTimeMillis());
//         }
//         mr.setRazorpayPaymentId(resolvedPaymentId);
//         mr.setStatus("payment_done");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(
//             mr.getTimelineJson(),
//             "Resident paid â‚¹" + mr.getPaymentAmount() + " in test mode via " + resolvedMethod,
//             mr.getResidentName(),
//             "Simulated payment id: " + resolvedPaymentId
//         ));
//         return repo.save(mr);
//     }
//     @Transactional
//     public MaintenanceRequest closeJob(Long id, Long adminId) {
//         MaintenanceRequest mr = getOrThrow(id);
//         requireStatus(mr, "payment_done");
//         String adminName = resolveUserName(adminId);
//         mr.setStatus("closed");
//         mr.setUpdatedAt(LocalDateTime.now());
//         mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
//             "Admin confirmed payment to vendor. Job closed.",
//             adminName, null));
//         return repo.save(mr);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  READ QUERIES
//     // ═══════════════════════════════════════════════════════════════════
//     public List<MaintenanceRequest> getAll() {
//         return repo.findAllByOrderByCreatedAtDesc();
//     }
//     public List<MaintenanceRequest> getByStatus(String status) {
//         return repo.findByStatusOrderByCreatedAtDesc(status);
//     }
//     public List<MaintenanceRequest> getByResident(String residentId) {
//         return repo.findByResidentIdOrderByCreatedAtDesc(residentId);
//     }
//     public List<MaintenanceRequest> getByVendor(Long vendorId) {
//         return repo.findByVendorIdOrderByCreatedAtDesc(vendorId);
//     }
//     public Optional<MaintenanceRequest> getById(Long id) {
//         return repo.findById(id);
//     }
//     // ═══════════════════════════════════════════════════════════════════
//     //  PRIVATE HELPERS
//     // ═══════════════════════════════════════════════════════════════════
//     private MaintenanceRequest getOrThrow(Long id) {
//         return repo.findById(id)
//             .orElseThrow(() -> new RuntimeException("Maintenance request not found: " + id));
//     }
//     /**
//      * Validates that mr.status matches one of the allowed values.
//      * Throws a descriptive RuntimeException if not.
//      */
//     private void requireStatus(MaintenanceRequest mr, String... allowed) {
//         for (String s : allowed) {
//             if (s.equals(mr.getStatus())) return;
//         }
//         throw new RuntimeException(
//             "Cannot perform this action. Current status: '" + mr.getStatus() +
//             "'. Allowed: " + String.join(", ", allowed) + ".");
//     }
//     /**
//      * Resolves a user's name from the DB; returns "Admin" if not found.
//      */
//     private String resolveUserName(Long userId) {
//         if (userId == null) return "System";
//         return userRepo.findById(userId)
//             .map(User::getName)
//             .orElse("Admin");
//     }
//     /**
//      * Appends a new entry to the JSON timeline array stored as a plain string.
//      * We avoid pulling in a JSON library by doing simple string manipulation.
//      */
//     private String buildTimeline(String existingJson, String action, String by, String note) {
//         String existing = (existingJson != null && !existingJson.isBlank())
//             ? existingJson.trim() : "[]";
//         String trimmed = existing.endsWith("]")
//             ? existing.substring(0, existing.length() - 1).trim()
//             : existing;
//         String entry = String.format(
//             "{\"action\":\"%s\",\"by\":\"%s\",\"at\":\"%s\"%s}",
//             escape(action),
//             escape(by != null ? by : "System"),
//             LocalDateTime.now(),
//             note != null ? ",\"note\":\"" + escape(note) + "\"" : ""
//         );
//         boolean isEmpty = trimmed.equals("[") || trimmed.equals("");
//         return (isEmpty ? "[" : trimmed + ",") + entry + "]";
//     }
//     private String escape(String s) {
//         if (s == null) return "";
//         return s.replace("\\", "\\\\")
//                 .replace("\"", "\\\"")
//                 .replace("\n", "\\n")
//                 .replace("\r", "");
//     }
//     private Map<String, Object> createRazorpayOrder(int amountInPaise, String receipt) {
//         RestTemplate restTemplate = new RestTemplate();
//         HttpHeaders headers = new HttpHeaders();
//         headers.setContentType(MediaType.APPLICATION_JSON);
//         headers.setBasicAuth(razorpayKeyId, razorpayKeySecret, StandardCharsets.UTF_8);
//         Map<String, Object> orderReq = new HashMap<>();
//         orderReq.put("amount", amountInPaise);
//         orderReq.put("currency", "INR");
//         orderReq.put("receipt", receipt + "_" + System.currentTimeMillis());
//         HttpEntity<Map<String, Object>> entity = new HttpEntity<>(orderReq, headers);
//         try {
//             ResponseEntity<Map> response = restTemplate.postForEntity(
//                 RAZORPAY_ORDERS_URL, entity, Map.class);
//             Map<String, Object> body = response.getBody();
//             if (body == null || body.get("id") == null) {
//                 throw new RuntimeException("Razorpay did not return an order ID.");
//             }
//             return body;
//         } catch (Exception e) {
//             throw new RuntimeException("Unable to create Razorpay order: " + e.getMessage(), e);
//         }
//     }
// }
package com.bsgated.service;

import com.bsgated.exception.ApiException;
import com.bsgated.model.MaintenanceRequest;
import com.bsgated.model.User;
import com.bsgated.payload.MaintenancePayloads;
import com.bsgated.payload.PaymentVerifyRequest;
import com.bsgated.repository.MaintenanceRequestRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

/**
 * MaintenanceService — fully secured.
 *
 * Identity always from CurrentUser.get() — never from payload fields. Ownership
 * validated at every mutation: - Resident operations check residentId matches
 * JWT id. - Vendor operations check vendorId matches JWT id. - Admin operations
 * check role is ADMIN or SUPER_ADMIN.
 *
 * All errors throw ApiException — never bare RuntimeException.
 */
@Service
public class MaintenanceService {

    private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final MaintenanceRequestRepository repo;
    private final UserRepository userRepo;

    public MaintenanceService(MaintenanceRequestRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 1 — Resident submits request
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest submit(MaintenancePayloads.Submit req) {
        // Identity from JWT — never from request body
        AuthenticatedUser currentUser = CurrentUser.get();
        ensureRole(currentUser, "RESIDENT");

        User resident = userRepo.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resident account not found."));

        MaintenanceRequest mr = new MaintenanceRequest();
        // Resident identity set from JWT
        mr.setResidentId(String.valueOf(currentUser.id()));
        mr.setResidentName(resident.getName());
        mr.setResidentPhone(resident.getPhone());
        mr.setUnit("N/A"); // Replace when User entity has unit field
        mr.setTitle(req.getTitle().trim());
        mr.setDescription(req.getDescription().trim());
        mr.setCategory(req.getCategory().trim());
        mr.setPriority(req.getPriority() != null ? req.getPriority() : "Medium");
        mr.setPreferredSlot(req.getPreferredSlot());
        mr.setContactPref(req.getContactPref());
        mr.setStatus("submitted");
        mr.setCreatedAt(LocalDateTime.now());
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline("[]",
                "Resident submitted request",
                resident.getName(), null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 2 — Admin assigns vendor
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest assignVendor(Long id, MaintenancePayloads.AssignVendor req) {
        // Admin identity from JWT
        AuthenticatedUser admin = CurrentUser.get();
        ensureAdminRole(admin);

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "submitted", "quote_rejected");

        String adminName = resolveUserName(admin.id());
        User vendorUser = userRepo.findById(req.getVendorId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Vendor account not found."));
        String vendorName = req.getVendorName() != null && !req.getVendorName().isBlank()
                ? req.getVendorName().trim()
                : vendorUser.getName();
        String vendorPhone = req.getVendorPhone() != null && !req.getVendorPhone().isBlank()
                ? req.getVendorPhone().trim()
                : vendorUser.getPhone();

        mr.setVendorId(req.getVendorId());
        mr.setVendorName(vendorName);
        mr.setVendorPhone(vendorPhone);
        mr.setAdminId(admin.id());
        mr.setAdminName(adminName);
        mr.setStatus("assigned");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Admin assigned vendor: " + vendorName,
                adminName, null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 3 — Vendor submits quote
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest submitQuote(Long id, MaintenancePayloads.SubmitQuote req) {
        // Vendor identity from JWT
        AuthenticatedUser vendor = CurrentUser.get();
        ensureRole(vendor, "VENDOR");

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "assigned");

        // Ownership: only the assigned vendor can submit a quote
        if (!vendor.id().equals(mr.getVendorId())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You are not the assigned vendor for this maintenance request.");
        }

        mr.setQuoteAmount(req.getAmount());
        mr.setQuoteDescription(req.getDescription());
        mr.setQuoteEstimatedDays(req.getEstimatedDays());
        mr.setStatus("quoted");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Vendor submitted quote: ₹" + req.getAmount(),
                mr.getVendorName(), null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 4 — Admin forwards quote to resident
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest forwardQuote(Long id) {
        // Admin identity from JWT — no adminId parameter
        AuthenticatedUser admin = CurrentUser.get();
        ensureAdminRole(admin);

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "quoted");

        String adminName = resolveUserName(admin.id());
        mr.setStatus("quote_sent_to_resident");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Admin forwarded quote ₹" + mr.getQuoteAmount() + " to resident",
                adminName, null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 5 — Resident accepts or rejects quote
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest respondToQuote(Long id, MaintenancePayloads.QuoteResponse req) {
        // Resident identity from JWT
        AuthenticatedUser currentUser = CurrentUser.get();
        ensureRole(currentUser, "RESIDENT");

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "quote_sent_to_resident");

        // Ownership: only the requesting resident can respond
        if (!String.valueOf(currentUser.id()).equals(mr.getResidentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You can only respond to your own maintenance requests.");
        }

        boolean accepted = "accept".equalsIgnoreCase(req.getDecision());
        mr.setStatus(accepted ? "quote_accepted" : "quote_rejected");
        if (!accepted && req.getReason() != null) {
            mr.setRejectionReason(req.getReason());
        }
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                accepted
                        ? "Resident accepted quote ₹" + mr.getQuoteAmount()
                        : "Resident rejected quote" + (req.getReason() != null ? ". Reason: " + req.getReason() : ""),
                mr.getResidentName(), null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 6a — Admin generates gate OTP for vendor
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest generateGateOtp(Long id) {
        // Admin identity from JWT — no adminId parameter
        AuthenticatedUser admin = CurrentUser.get();
        ensureAdminRole(admin);

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "quote_accepted");

        String adminName = resolveUserName(admin.id());
        String otp = String.format("%06d", new Random().nextInt(999999));

        mr.setGateOtp(otp);
        mr.setGateOtpGeneratedAt(LocalDateTime.now());
        mr.setGateOtpUsed(false);
        mr.setStatus("approved_to_start");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Admin generated gate OTP for vendor entry",
                adminName, null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 6b — Guard verifies gate OTP → work_started
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public Map<String, Object> verifyGateOtp(MaintenancePayloads.GateOtpVerify req) {
        // Guard identity from JWT — never from request body
        AuthenticatedUser guard = CurrentUser.get();
        ensureRole(guard, "SECURITY");

        Map<String, Object> result = new HashMap<>();

        Optional<MaintenanceRequest> opt = repo.findByGateOtp(req.getOtp());
        if (opt.isEmpty()) {
            result.put("ok", false);
            result.put("reason", "Invalid OTP — no matching maintenance request found.");
            return result;
        }

        MaintenanceRequest mr = opt.get();

        if (mr.isGateOtpUsed()) {
            result.put("ok", false);
            result.put("reason", "OTP has already been used.");
            return result;
        }
        if (!statusesEquivalent(mr.getStatus(), "approved_to_start")) {
            result.put("ok", false);
            result.put("reason", "Request is not in expected state: " + mr.getStatus());
            return result;
        }

        // Guard identity stored from JWT — trusted source
        mr.setGateOtpUsed(true);
        mr.setGateVerifiedBy("guardId=" + guard.id());
        mr.setGateVerifiedAt(LocalDateTime.now());
        mr.setWorkStartedAt(LocalDateTime.now());
        mr.setStatus("work_in_progress");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Guard verified OTP — vendor granted entry. Work started (Stage 1/2).",
                "Guard #" + guard.id(), null));
        repo.save(mr);

        result.put("ok", true);
        result.put("request", mr);
        return result;
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 7 — Vendor marks work completed
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest markWorkCompleted(Long id, MaintenancePayloads.WorkComplete req) {
        // Vendor identity from JWT
        AuthenticatedUser vendor = CurrentUser.get();
        ensureRole(vendor, "VENDOR");

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "work_in_progress");

        // Ownership: only the assigned vendor can mark complete
        if (!vendor.id().equals(mr.getVendorId())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You are not the assigned vendor for this maintenance request.");
        }

        mr.setWorkCompletedAt(LocalDateTime.now());
        mr.setStatus("work_completed");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Vendor marked work as completed (Stage 2/2)"
                + (req.getNotes() != null && !req.getNotes().isBlank() ? ": " + req.getNotes() : ""),
                mr.getVendorName(), null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 8a — Resident approves completed work
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest residentApproveWork(Long id) {
        // Resident identity from JWT
        AuthenticatedUser currentUser = CurrentUser.get();
        ensureRole(currentUser, "RESIDENT");

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "work_completed");

        // Ownership: only the requesting resident can approve
        if (!String.valueOf(currentUser.id()).equals(mr.getResidentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You can only approve work on your own maintenance requests.");
        }

        mr.setStatus("resident_work_approved");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Resident approved completed work",
                mr.getResidentName(), null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 8b — Vendor raises payment request
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest vendorRaisePayment(Long id, MaintenancePayloads.PaymentRequest req) {
        // Vendor identity from JWT
        AuthenticatedUser vendor = CurrentUser.get();
        ensureRole(vendor, "VENDOR");

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "resident_work_approved");

        // Ownership: only the assigned vendor can raise payment
        if (!vendor.id().equals(mr.getVendorId())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You are not the assigned vendor for this maintenance request.");
        }

        double amount = (req.getAmount() != null && req.getAmount() > 0)
                ? req.getAmount()
                : (mr.getQuoteAmount() != null ? mr.getQuoteAmount() : 0);

        mr.setPaymentAmount(amount);
        mr.setPaymentNotes(req.getNotes());
        mr.setStatus("payment_requested_to_admin");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Vendor raised payment request: ₹" + amount,
                mr.getVendorName(), null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 9 — Admin forwards payment request to resident
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest forwardPaymentToResident(Long id) {
        // Admin identity from JWT — no adminId parameter
        AuthenticatedUser admin = CurrentUser.get();
        ensureAdminRole(admin);

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "payment_requested_to_admin");

        String adminName = resolveUserName(admin.id());
        mr.setStatus("payment_requested_to_resident");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Admin forwarded payment request ₹" + mr.getPaymentAmount() + " to resident",
                adminName, null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 10a — Resident creates Razorpay payment order
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public Map<String, Object> createPaymentOrder(Long id) {
        // Resident identity from JWT
        AuthenticatedUser currentUser = CurrentUser.get();
        ensureRole(currentUser, "RESIDENT");

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "payment_requested_to_resident");

        // Ownership check
        if (!String.valueOf(currentUser.id()).equals(mr.getResidentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You can only pay for your own maintenance requests.");
        }

        if (mr.getPaymentAmount() == null || mr.getPaymentAmount() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Payment amount not set for this request.");
        }

        int amountInPaise = (int) (mr.getPaymentAmount() * 100);
        Map<String, Object> rzpOrder = createRazorpayOrder(amountInPaise, "maint_" + id);

        mr.setRazorpayOrderId(String.valueOf(rzpOrder.get("id")));
        mr.setUpdatedAt(LocalDateTime.now());
        repo.save(mr);

        Map<String, Object> result = new HashMap<>();
        result.put("requestId", id);
        result.put("razorpayOrderId", rzpOrder.get("id"));
        result.put("razorpayKeyId", razorpayKeyId);
        result.put("amount", amountInPaise);
        result.put("currency", "INR");
        result.put("description", "Maintenance: " + mr.getTitle());
        return result;
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 10b — Resident verifies Razorpay payment → payment_done
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest verifyPayment(PaymentVerifyRequest req) {
        // Verify Razorpay HMAC-SHA256 signature
        try {
            String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }

            if (!hex.toString().equals(req.getRazorpaySignature())) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Payment signature verification failed.");
            }
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Payment verification error: " + e.getMessage());
        }

        MaintenanceRequest mr = repo.findByRazorpayOrderId(req.getRazorpayOrderId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                "No maintenance request found for Razorpay order: " + req.getRazorpayOrderId()));

        // Ownership check
        AuthenticatedUser currentUser = CurrentUser.get();
        if (!String.valueOf(currentUser.id()).equals(mr.getResidentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "This payment does not belong to your maintenance request.");
        }

        mr.setRazorpayPaymentId(req.getRazorpayPaymentId());
        mr.setStatus("payment_received");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Resident paid ₹" + mr.getPaymentAmount() + " via Razorpay",
                mr.getResidentName(), null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  STEP 11 — Admin closes the job
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest closeJob(Long id) {
        // Admin identity from JWT — no adminId parameter
        AuthenticatedUser admin = CurrentUser.get();
        ensureAdminRole(admin);

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "payment_received");

        String adminName = resolveUserName(admin.id());
        mr.setStatus("closed");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Admin confirmed payment to vendor. Job closed.",
                adminName, null));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  SIMULATE PAYMENT (dev/test only)
    // ══════════════════════════════════════════════════════════════════
    @Transactional
    public MaintenanceRequest simulatePayment(Long id, String paymentId, String method) {
        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "payment_requested_to_resident");

        String resolvedPaymentId = (paymentId != null && !paymentId.isBlank())
                ? paymentId
                : "pay_demo_" + System.currentTimeMillis();
        String resolvedMethod = (method != null && !method.isBlank())
                ? method
                : "Demo Payment";

        if (mr.getRazorpayOrderId() == null || mr.getRazorpayOrderId().isBlank()) {
            mr.setRazorpayOrderId("order_demo_" + id + "_" + System.currentTimeMillis());
        }

        mr.setRazorpayPaymentId(resolvedPaymentId);
        mr.setStatus("payment_received");
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(
                mr.getTimelineJson(),
                "Resident paid ₹" + mr.getPaymentAmount() + " in test mode via " + resolvedMethod,
                mr.getResidentName(),
                "Simulated payment id: " + resolvedPaymentId
        ));
        return repo.save(mr);
    }

    // ══════════════════════════════════════════════════════════════════
    //  READ QUERIES
    // ══════════════════════════════════════════════════════════════════
    /**
     * Resident: their own requests only. residentId from JWT.
     */
    public List<MaintenanceRequest> getMyRequests() {
        AuthenticatedUser currentUser = CurrentUser.get();
        return repo.findByResidentIdOrderByCreatedAtDesc(String.valueOf(currentUser.id()));
    }

    /**
     * Vendor: their own assigned jobs only. vendorId from JWT.
     */
    public List<MaintenanceRequest> getMyVendorJobs() {
        AuthenticatedUser vendor = CurrentUser.get();
        return repo.findByVendorIdOrderByCreatedAtDesc(vendor.id());
    }

    /**
     * Admin: all requests.
     */
    public List<MaintenanceRequest> getAll() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public List<MaintenanceRequest> getByStatus(String status) {
        return repo.findByStatusOrderByCreatedAtDesc(status);
    }

    public List<MaintenanceRequest> getGateRequests() {
        return repo.findByStatusInOrderByCreatedAtDesc(List.of(
                "approved_to_start",
                "work_in_progress",
                "gate_otp_generated",
                "work_started"
        ));
    }

    @Transactional
    public MaintenanceRequest rateVendor(Long id, MaintenancePayloads.Rating req) {
        AuthenticatedUser currentUser = CurrentUser.get();
        ensureRole(currentUser, "RESIDENT");

        MaintenanceRequest mr = getOrThrow(id);
        requireStatus(mr, "closed");

        if (!String.valueOf(currentUser.id()).equals(mr.getResidentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You can only rate vendors for your own maintenance requests.");
        }

        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5.");
        }

        mr.setRating(req.getRating());
        mr.setReview(req.getReview());
        mr.setTags(req.getTags());
        mr.setUpdatedAt(LocalDateTime.now());
        mr.setTimelineJson(buildTimeline(mr.getTimelineJson(),
                "Resident rated vendor: " + req.getRating() + "/5",
                mr.getResidentName(), null));
        return repo.save(mr);
    }

    /**
     * Single request — accessible by the resident who owns it, the assigned
     * vendor, or admin/super_admin.
     */
    public Optional<MaintenanceRequest> getById(Long id) {
        AuthenticatedUser currentUser = CurrentUser.get();
        String role = currentUser.role();

        return repo.findById(id).map(mr -> {
            // Admin and super_admin can see everything
            if ("ADMIN".equals(role) || "SUPER_ADMIN".equals(role)) {
                return mr;
            }
            // Resident: only their own
            if ("RESIDENT".equals(role)) {
                if (!String.valueOf(currentUser.id()).equals(mr.getResidentId())) {
                    throw new ApiException(HttpStatus.FORBIDDEN,
                            "You can only view your own maintenance requests.");
                }
                return mr;
            }
            // Vendor: only assigned jobs
            if ("VENDOR".equals(role)) {
                if (!currentUser.id().equals(mr.getVendorId())) {
                    throw new ApiException(HttpStatus.FORBIDDEN,
                            "You can only view maintenance jobs assigned to you.");
                }
                return mr;
            }
            // Security guard: can see requests in gate_otp_generated / work_started state
            if ("SECURITY".equals(role)) {
                return mr;
            }
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You are not allowed to view this maintenance request.");
        });
    }

    // ══════════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════════════════════════════════
    private MaintenanceRequest getOrThrow(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                "Maintenance request not found: " + id));
    }

    private void requireStatus(MaintenanceRequest mr, String... allowed) {
        for (String s : allowed) {
            if (statusesEquivalent(mr.getStatus(), s)) {
                return;
            }
        }
        throw new ApiException(HttpStatus.BAD_REQUEST,
                "Cannot perform this action. Current status: '" + mr.getStatus()
                + "'. Allowed: " + String.join(", ", allowed) + ".");
    }

    private boolean statusesEquivalent(String actual, String allowed) {
        return canonicalStatus(actual).equals(canonicalStatus(allowed));
    }

    private String canonicalStatus(String status) {
        if (status == null) {
            return "";
        }
        return switch (status) {
            case "vendor_assigned" -> "assigned";
            case "quote_submitted" -> "quoted";
            case "quote_forwarded" -> "quote_sent_to_resident";
            case "gate_otp_generated" -> "approved_to_start";
            case "work_started" -> "work_in_progress";
            case "payment_requested" -> "payment_requested_to_admin";
            case "payment_sent_to_resident" -> "payment_requested_to_resident";
            case "payment_done" -> "payment_received";
            default -> status;
        };
    }

    private void ensureRole(AuthenticatedUser user, String requiredRole) {
        if (!requiredRole.equalsIgnoreCase(user.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Only " + requiredRole.toLowerCase() + "s can perform this action.");
        }
    }

    private void ensureAdminRole(AuthenticatedUser user) {
        if (!"ADMIN".equalsIgnoreCase(user.role()) && !"SUPER_ADMIN".equalsIgnoreCase(user.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Only admins can perform this action.");
        }
    }

    private String resolveUserName(Long userId) {
        if (userId == null) {
            return "System";
        }
        return userRepo.findById(userId)
                .map(User::getName)
                .orElse("Admin");
    }

    private String buildTimeline(String existingJson, String action, String by, String note) {
        String existing = (existingJson != null && !existingJson.isBlank())
                ? existingJson.trim() : "[]";
        String trimmed = existing.endsWith("]")
                ? existing.substring(0, existing.length() - 1).trim()
                : existing;
        String entry = String.format(
                "{\"action\":\"%s\",\"by\":\"%s\",\"at\":\"%s\"%s}",
                escape(action),
                escape(by != null ? by : "System"),
                LocalDateTime.now(),
                note != null ? ",\"note\":\"" + escape(note) + "\"" : ""
        );
        boolean isEmpty = trimmed.equals("[") || trimmed.isBlank();
        return (isEmpty ? "[" : trimmed + ",") + entry + "]";
    }

    private String escape(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }

    private Map<String, Object> createRazorpayOrder(int amountInPaise, String receipt) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(razorpayKeyId, razorpayKeySecret, StandardCharsets.UTF_8);

        Map<String, Object> orderReq = new HashMap<>();
        orderReq.put("amount", amountInPaise);
        orderReq.put("currency", "INR");
        orderReq.put("receipt", receipt + "_" + System.currentTimeMillis());

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    RAZORPAY_ORDERS_URL,
                    new HttpEntity<>(orderReq, headers),
                    Map.class);
            Map<String, Object> body = response.getBody();
            if (body == null || body.get("id") == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY,
                        "Razorpay did not return an order ID.");
            }
            return body;
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "Unable to create Razorpay order: " + e.getMessage());
        }
    }
}
