package com.bsgated.controller;

import com.bsgated.model.MaintenanceRequest;
import com.bsgated.payload.MaintenancePayloads;
import com.bsgated.payload.PaymentVerifyRequest;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.bsgated.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MaintenanceController — fully secured.
 *
 * Security enforced at two levels: 1. SecurityConfig: role-based access per
 * endpoint group. 2. Service layer: ownership validation (resident sees own,
 * vendor sees own).
 *
 * Identity always from JWT via CurrentUser.get() — never from request body or
 * query params.
 *
 * Endpoint map:
 *
 * RESIDENT: POST /api/maintenance/submit — create request GET
 * /api/maintenance/my — view own requests GET /api/maintenance/{id} — view
 * single (ownership validated in service) PUT
 * /api/maintenance/{id}/respond-quote — accept/reject quote PUT
 * /api/maintenance/{id}/approve-work — approve completed work POST
 * /api/maintenance/{id}/create-payment-order — initiate Razorpay POST
 * /api/maintenance/verify-payment — verify Razorpay payment
 *
 * VENDOR: GET /api/maintenance/vendor/my — view own assigned jobs PUT
 * /api/maintenance/{id}/submit-quote — submit quotation PUT
 * /api/maintenance/{id}/work-complete — mark work done PUT
 * /api/maintenance/{id}/request-payment — raise payment request
 *
 * ADMIN | SUPER_ADMIN: GET /api/admin/maintenance — view all requests GET
 * /api/admin/maintenance?status=submitted — filtered PUT
 * /api/admin/maintenance/{id}/assign-vendor — assign vendor PUT
 * /api/admin/maintenance/{id}/forward-quote — forward quote to resident PUT
 * /api/admin/maintenance/{id}/generate-gate-otp — generate entry OTP PUT
 * /api/admin/maintenance/{id}/forward-payment — forward payment to resident PUT
 * /api/admin/maintenance/{id}/close — close completed job
 *
 * SECURITY (guard): PUT /api/maintenance/verify-gate-otp — verify vendor entry
 * OTP
 */
@RestController
public class MaintenanceController {

    private final MaintenanceService service;

    public MaintenanceController(MaintenanceService service) {
        this.service = service;
    }

    // ══════════════════════════════════════════════════════════════════
    //  RESIDENT ENDPOINTS
    // ══════════════════════════════════════════════════════════════════
    /**
     * POST /api/maintenance/submit Resident creates a new maintenance request.
     * Identity (residentId, name, phone) extracted from JWT — not from body.
     */
    @PostMapping("/api/maintenance/submit")
    public ResponseEntity<?> submit(@RequestBody MaintenancePayloads.Submit req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            return badRequest("title is required.");
        }
        if (req.getDescription() == null || req.getDescription().isBlank()) {
            return badRequest("description is required.");
        }
        if (req.getCategory() == null || req.getCategory().isBlank()) {
            return badRequest("category is required.");
        }

        return ResponseEntity.status(201).body(service.submit(req));
    }

    /**
     * GET /api/maintenance/my Resident fetches their own requests. residentId
     * from JWT — no path variable to prevent IDOR.
     */
    @GetMapping("/api/maintenance/my")
    public ResponseEntity<?> getMyRequests() {
        return ResponseEntity.ok(service.getMyRequests());
    }

    /**
     * GET /api/maintenance/{id} Fetch single request — ownership validated
     * inside service. Resident sees own, vendor sees assigned, admin sees all.
     */
    @GetMapping("/api/maintenance/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/maintenance/{id}/respond-quote Resident accepts or rejects the
     * forwarded quote. Ownership validated inside service.
     */
    @PutMapping("/api/maintenance/{id}/respond-quote")
    public ResponseEntity<?> respondToQuote(
            @PathVariable Long id,
            @RequestBody MaintenancePayloads.QuoteResponse req) {
        String decision = req.getDecision();
        if (!"accept".equalsIgnoreCase(decision) && !"reject".equalsIgnoreCase(decision)) {
            return badRequest("decision must be 'accept' or 'reject'.");
        }
        return ResponseEntity.ok(service.respondToQuote(id, req));
    }

    /**
     * PUT /api/maintenance/{id}/approve-work Resident approves completed work
     * before vendor raises payment. Ownership validated inside service.
     */
    @PutMapping("/api/maintenance/{id}/approve-work")
    public ResponseEntity<?> approveWork(@PathVariable Long id) {
        return ResponseEntity.ok(service.residentApproveWork(id));
    }

    /**
     * POST /api/maintenance/{id}/create-payment-order Resident initiates
     * Razorpay payment order. Ownership validated inside service.
     */
    @PostMapping("/api/maintenance/{id}/create-payment-order")
    public ResponseEntity<?> createPaymentOrder(@PathVariable Long id) {
        return ResponseEntity.ok(service.createPaymentOrder(id));
    }

    /**
     * POST /api/maintenance/verify-payment Resident verifies Razorpay payment
     * signature → marks payment_done.
     */
    @PostMapping("/api/maintenance/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest req) {
        if (req.getRazorpayOrderId() == null || req.getRazorpayOrderId().isBlank()) {
            return badRequest("razorpayOrderId is required.");
        }
        if (req.getRazorpayPaymentId() == null || req.getRazorpayPaymentId().isBlank()) {
            return badRequest("razorpayPaymentId is required.");
        }
        if (req.getRazorpaySignature() == null || req.getRazorpaySignature().isBlank()) {
            return badRequest("razorpaySignature is required.");
        }
        return ResponseEntity.ok(service.verifyPayment(req));
    }

    @PostMapping("/api/maintenance/{id}/rate-vendor")
    public ResponseEntity<?> rateVendor(
            @PathVariable Long id,
            @RequestBody MaintenancePayloads.Rating req) {
        return ResponseEntity.ok(service.rateVendor(id, req));
    }

    // ══════════════════════════════════════════════════════════════════
    //  VENDOR ENDPOINTS
    // ══════════════════════════════════════════════════════════════════
    /**
     * GET /api/maintenance/vendor/my Vendor fetches jobs assigned to them.
     * vendorId from JWT — no path variable to prevent IDOR.
     */
    @GetMapping("/api/maintenance/vendor/my")
    public ResponseEntity<?> getMyVendorJobs() {
        return ResponseEntity.ok(service.getMyVendorJobs());
    }

    /**
     * PUT /api/maintenance/{id}/submit-quote Vendor submits quotation for an
     * assigned job. Vendor ownership validated inside service.
     */
    @PutMapping("/api/maintenance/{id}/submit-quote")
    public ResponseEntity<?> submitQuote(
            @PathVariable Long id,
            @RequestBody MaintenancePayloads.SubmitQuote req) {
        if (req.getAmount() == null || req.getAmount() <= 0) {
            return badRequest("quote amount must be greater than 0.");
        }
        return ResponseEntity.ok(service.submitQuote(id, req));
    }

    /**
     * PUT /api/maintenance/{id}/work-complete Vendor marks work as completed.
     * Vendor ownership validated inside service.
     */
    @PutMapping("/api/maintenance/{id}/work-complete")
    public ResponseEntity<?> workComplete(
            @PathVariable Long id,
            @RequestBody(required = false) MaintenancePayloads.WorkComplete req) {
        if (req == null) {
            req = new MaintenancePayloads.WorkComplete();
        }
        return ResponseEntity.ok(service.markWorkCompleted(id, req));
    }

    /**
     * PUT /api/maintenance/{id}/request-payment Vendor raises payment request
     * after work is approved. Vendor ownership validated inside service.
     */
    @PutMapping("/api/maintenance/{id}/request-payment")
    public ResponseEntity<?> requestPayment(
            @PathVariable Long id,
            @RequestBody MaintenancePayloads.PaymentRequest req) {
        return ResponseEntity.ok(service.vendorRaisePayment(id, req));
    }

    // ══════════════════════════════════════════════════════════════════
    //  ADMIN ENDPOINTS
    // ══════════════════════════════════════════════════════════════════
    /**
     * GET /api/admin/maintenance GET /api/admin/maintenance?status=submitted
     * Admin views all maintenance requests, optionally filtered by status.
     */
    @GetMapping("/api/admin/maintenance")
    public ResponseEntity<?> adminGetAll(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(service.getByStatus(status));
        }
        return ResponseEntity.ok(service.getAll());
    }

    /**
     * PUT /api/admin/maintenance/{id}/assign-vendor Admin assigns a vendor to a
     * submitted request. Admin identity from JWT — no adminId param.
     */
    @PutMapping("/api/admin/maintenance/{id}/assign-vendor")
    public ResponseEntity<?> assignVendor(
            @PathVariable Long id,
            @RequestBody MaintenancePayloads.AssignVendor req) {
        if (req.getVendorId() == null) {
            return badRequest("vendorId is required.");
        }
        return ResponseEntity.ok(service.assignVendor(id, req));
    }

    /**
     * PUT /api/admin/maintenance/{id}/forward-quote Admin forwards the vendor's
     * quote to the resident. Admin identity from JWT — no adminId param.
     */
    @PutMapping("/api/admin/maintenance/{id}/forward-quote")
    public ResponseEntity<?> forwardQuote(@PathVariable Long id) {
        return ResponseEntity.ok(service.forwardQuote(id));
    }

    /**
     * PUT /api/admin/maintenance/{id}/generate-gate-otp Admin generates a
     * 6-digit OTP for the vendor's gate entry. Admin identity from JWT — no
     * adminId param.
     */
    @PutMapping("/api/admin/maintenance/{id}/generate-gate-otp")
    public ResponseEntity<?> generateGateOtp(@PathVariable Long id) {
        return ResponseEntity.ok(service.generateGateOtp(id));
    }

    /**
     * PUT /api/admin/maintenance/{id}/forward-payment Admin forwards vendor's
     * payment request to the resident. Admin identity from JWT — no adminId
     * param.
     */
    @PutMapping("/api/admin/maintenance/{id}/forward-payment")
    public ResponseEntity<?> forwardPayment(@PathVariable Long id) {
        return ResponseEntity.ok(service.forwardPaymentToResident(id));
    }

    /**
     * PUT /api/admin/maintenance/{id}/close Admin closes the job after
     * confirming payment to vendor. Admin identity from JWT — no adminId param.
     */
    @PutMapping("/api/admin/maintenance/{id}/close")
    public ResponseEntity<?> closeJob(@PathVariable Long id) {
        return ResponseEntity.ok(service.closeJob(id));
    }

    // ══════════════════════════════════════════════════════════════════
    //  SECURITY GUARD ENDPOINTS
    // ══════════════════════════════════════════════════════════════════
    /**
     * PUT /api/maintenance/verify-gate-otp Guard verifies vendor's gate entry
     * OTP. Guard identity extracted from JWT — guardId and guardName NOT in
     * body. SecurityConfig enforces hasRole("SECURITY").
     */
    @PutMapping("/api/maintenance/verify-gate-otp")
    public ResponseEntity<?> verifyGateOtp(@RequestBody MaintenancePayloads.GateOtpVerify req) {
        if (req.getOtp() == null || req.getOtp().isBlank()) {
            return badRequest("otp is required.");
        }
        Map<String, Object> result = service.verifyGateOtp(req);
        if ((Boolean) result.get("ok")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(400).body(result);
    }

    @GetMapping("/api/maintenance/gate")
    public ResponseEntity<?> getGateRequests() {
        return ResponseEntity.ok(service.getGateRequests());
    }

    // ══════════════════════════════════════════════════════════════════
    //  SIMULATE PAYMENT (dev/test only)
    // ══════════════════════════════════════════════════════════════════
    @PostMapping("/api/maintenance/{id}/simulate-payment")
    public ResponseEntity<?> simulatePayment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> req) {
        String paymentId = req != null ? req.get("paymentId") : null;
        String method = req != null ? req.get("method") : null;
        return ResponseEntity.ok(service.simulatePayment(id, paymentId, method));
    }

    // ══════════════════════════════════════════════════════════════════
    //  HELPER
    // ══════════════════════════════════════════════════════════════════
    private ResponseEntity<Map<String, String>> badRequest(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return ResponseEntity.badRequest().body(body);
    }
}
