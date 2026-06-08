// package com.bsgated.controller;
// import com.bsgated.exception.ApiException;
// import com.bsgated.model.PaymentInstallment;
// import com.bsgated.model.PaymentTransaction;
// import com.bsgated.model.UnitBooking;
// import com.bsgated.model.User;
// import com.bsgated.repository.PaymentInstallmentRepository;
// import com.bsgated.repository.PaymentTransactionRepository;
// import com.bsgated.repository.UnitBookingRepository;
// import com.bsgated.repository.UserRepository;
// import com.bsgated.security.AuthenticatedUser;
// import com.bsgated.security.CurrentUser;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;
// import java.util.Map;
// import java.util.UUID;
// @RestController
// @RequestMapping("/api/payments")
// public class PaymentController {
//     private final PaymentInstallmentRepository installmentRepository;
//     private final PaymentTransactionRepository transactionRepository;
//     private final UnitBookingRepository bookingRepository;
//     private final UserRepository userRepository;
//     public PaymentController(PaymentInstallmentRepository installmentRepository, PaymentTransactionRepository transactionRepository, UnitBookingRepository bookingRepository, UserRepository userRepository) {
//         this.installmentRepository = installmentRepository;
//         this.transactionRepository = transactionRepository;
//         this.bookingRepository = bookingRepository;
//         this.userRepository = userRepository;
//     }
//     private User getCurrentUser() {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         return userRepository.findById(currentUser.id())
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
//     }
//     @PostMapping("/booking/{bookingId}/installments")
//     public ResponseEntity<?> generateInstallments(@PathVariable Long bookingId, @RequestBody List<PaymentInstallment> installments) {
//         User builder = getCurrentUser();
//         if (!"BUILDER".equals(builder.getRole().toUpperCase())) {
//             throw new ApiException(HttpStatus.FORBIDDEN, "Only Builders can generate installments.");
//         }
//         UnitBooking booking = bookingRepository.findById(bookingId)
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
//         installments.forEach(inst -> {
//             inst.setBooking(booking);
//             inst.setStatus("PENDING");
//             installmentRepository.save(inst);
//         });
//         return ResponseEntity.ok(installments);
//     }
//     @GetMapping("/booking/{bookingId}/installments")
//     public ResponseEntity<?> getInstallments(@PathVariable Long bookingId) {
//         return ResponseEntity.ok(installmentRepository.findByBookingId(bookingId));
//     }
//     @PostMapping("/installments/{installmentId}/pay")
//     public ResponseEntity<?> payInstallment(@PathVariable Long installmentId, @RequestBody PaymentTransaction transaction) {
//         User customer = getCurrentUser();
//         PaymentInstallment installment = installmentRepository.findById(installmentId)
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Installment not found"));
//         if (!installment.getBooking().getCustomer().getId().equals(customer.getId())) {
//             throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this booking.");
//         }
//         // Mocking payment
//         transaction.setInstallment(installment);
//         transaction.setTransactionId(UUID.randomUUID().toString());
//         PaymentTransaction savedTx = transactionRepository.save(transaction);
//         // Update installment status
//         installment.setStatus("PAID");
//         installmentRepository.save(installment);
//         // Check for soft possession (e.g., 80% paid)
//         // Simplified check: builder updates it manually or we calculate percentage
//         return ResponseEntity.ok(savedTx);
//     }
//     @PutMapping("/booking/{bookingId}/possession")
//     public ResponseEntity<?> updatePossessionStatus(@PathVariable Long bookingId, @RequestBody Map<String, String> payload) {
//         User builder = getCurrentUser();
//         if (!"BUILDER".equals(builder.getRole().toUpperCase())) {
//             throw new ApiException(HttpStatus.FORBIDDEN, "Only Builders can update possession status.");
//         }
//         UnitBooking booking = bookingRepository.findById(bookingId)
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
//         booking.setSoftPossessionStatus(Boolean.parseBoolean(payload.get("status")));
//         if (payload.containsKey("letterUrl")) {
//             booking.setPossessionLetterUrl(payload.get("letterUrl"));
//         }
//         return ResponseEntity.ok(bookingRepository.save(booking));
//     }
// }
package com.bsgated.controller;

import com.bsgated.dto.payment.GenerateInstallmentsRequest;
import com.bsgated.dto.payment.PayInstallmentRequest;
import com.bsgated.dto.payment.PossessionStatusRequest;
import com.bsgated.exception.ApiException;
import com.bsgated.model.PaymentInstallment;
import com.bsgated.model.PaymentTransaction;
import com.bsgated.model.UnitBooking;
import com.bsgated.model.User;
import com.bsgated.repository.PaymentInstallmentRepository;
import com.bsgated.repository.PaymentTransactionRepository;
import com.bsgated.repository.UnitBookingRepository;
import com.bsgated.repository.UnitRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.math.BigDecimal;

/**
 * Payment API — installment generation (builder) and payment processing
 * (customer).
 *
 * Security guarantees: - Builder endpoints require ROLE_BUILDER (enforced in
 * SecurityConfig). - Customer payment endpoint requires ROLE_CUSTOMER (enforced
 * in SecurityConfig). - Builder can only generate installments for bookings on
 * units in their projects. - Customer can only pay installments on their own
 * bookings. - transactionId is always generated server-side (UUID) — never
 * accepted from client. - Paying an already-PAID installment is rejected with
 * 409 Conflict. - Possession status can only be updated by the builder who owns
 * the booking's project.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentInstallmentRepository installmentRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final UnitBookingRepository bookingRepository;
    private final UserRepository userRepository;
    // In PaymentController, ADD field:
    private final UnitRepository unitRepository;

   public PaymentController(
        PaymentInstallmentRepository installmentRepository,
        PaymentTransactionRepository transactionRepository,
        UnitBookingRepository bookingRepository,
        UserRepository userRepository,
        UnitRepository unitRepository) {        // ADD
    this.installmentRepository = installmentRepository;
    this.transactionRepository = transactionRepository;
    this.bookingRepository = bookingRepository;
    this.userRepository = userRepository;
    this.unitRepository = unitRepository;       // ADD
}

    // ── Private helpers ────────────────────────────────────────────────────
    private User requireCurrentUser() {
        AuthenticatedUser auth = CurrentUser.get();
        return userRepository.findById(auth.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private User requireBuilder() {
        AuthenticatedUser auth = CurrentUser.get();
        if (!"BUILDER".equalsIgnoreCase(auth.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only Builders can perform this action.");
        }
        return userRepository.findById(auth.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Builder account not found"));
    }

    /**
     * Loads a booking and validates it belongs to a project owned by the given
     * builder.
     */
    private UnitBooking requireBuilderOwnedBooking(Long bookingId, User builder) {
        UnitBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        Long projectBuilderId = booking.getUnit().getTower().getProject().getBuilder().getId();
        if (!projectBuilderId.equals(builder.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this booking.");
        }
        return booking;
    }

    /**
     * Loads a booking and validates it belongs to the given customer.
     */
    private UnitBooking requireCustomerOwnedBooking(Long bookingId, User customer) {
        UnitBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this booking.");
        }
        return booking;
    }

    private BigDecimal getTotalPaid(Long bookingId) {
        return transactionRepository.findByInstallment_Booking_Id(bookingId)
                .stream()
                .map(PaymentTransaction::getAmountPaid)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ── Builder: generate installments for a booking ───────────────────────
    /**
     * POST /api/payments/booking/{bookingId}/installments Builder generates the
     * payment schedule for an approved booking. Only the builder who owns the
     * project can generate installments.
     */
    @PostMapping("/booking/{bookingId}/installments")
    @Transactional
    public ResponseEntity<List<PaymentInstallment>> generateInstallments(
            @PathVariable Long bookingId,
            @Valid @RequestBody GenerateInstallmentsRequest req) {

        User builder = requireBuilder();
        UnitBooking booking = requireBuilderOwnedBooking(bookingId, builder);

        // Only generate installments for approved bookings
        if (!"APPROVED".equals(booking.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Installments can only be generated for APPROVED bookings. Current status: "
                    + booking.getStatus());
        }

        List<PaymentInstallment> saved = new ArrayList<>();
        for (GenerateInstallmentsRequest.InstallmentEntry entry : req.getInstallments()) {
            PaymentInstallment inst = new PaymentInstallment();
            inst.setBooking(booking);
            inst.setMilestoneName(entry.getMilestoneName());
            inst.setPercentage(entry.getPercentage());
            inst.setAmount(entry.getAmount());
            inst.setDueDate(entry.getDueDate());
            inst.setStatus("PENDING");
            saved.add(installmentRepository.save(inst));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── Customer / Builder: view installments ──────────────────────────────
    /**
     * GET /api/payments/booking/{bookingId}/installments Returns installments
     * for a booking. Customer can only see installments on their own bookings.
     * Builder can see installments on bookings for their projects.
     */
    @GetMapping("/booking/{bookingId}/installments")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentInstallment>> getInstallments(@PathVariable Long bookingId) {
        AuthenticatedUser auth = CurrentUser.get();
        User user = userRepository.findById(auth.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        UnitBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        boolean isCustomerOwner = booking.getCustomer().getId().equals(user.getId());
        boolean isBuilderOwner = "BUILDER".equalsIgnoreCase(auth.role())
                && booking.getUnit().getTower().getProject().getBuilder().getId().equals(user.getId());

        if (!isCustomerOwner && !isBuilderOwner) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to view these installments.");
        }

        return ResponseEntity.ok(installmentRepository.findByBooking_Id(bookingId));
    }

    // ── Customer: pay an installment ───────────────────────────────────────
    /**
     * POST /api/payments/installments/{installmentId}/pay Customer pays a
     * pending installment on their own booking.
     *
     * - transactionId is generated server-side (UUID). - Paying an already-paid
     * installment is rejected with 409. - This is a mock payment flow;
     * integrate a real payment gateway before production.
     */
    @PostMapping("/installments/{installmentId}/pay")
    @Transactional
    public ResponseEntity<PaymentTransaction> payInstallment(
            @PathVariable Long installmentId,
            @Valid @RequestBody PayInstallmentRequest req) {

        AuthenticatedUser auth = CurrentUser.get();
        User actor = userRepository.findById(auth.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        PaymentInstallment installment = installmentRepository.findById(installmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Installment not found"));

        boolean isCustomerOwner = installment.getBooking().getCustomer().getId().equals(actor.getId());
        boolean isBuilderOwner = "BUILDER".equalsIgnoreCase(auth.role())
                && installment.getBooking().getUnit().getTower().getProject().getBuilder().getId().equals(actor.getId());

        if (!isCustomerOwner && !isBuilderOwner) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this installment.");
        }

        // Idempotency: prevent double-payment
        if ("PAID".equals(installment.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "This installment has already been paid.");
        }

        PaymentTransaction tx = new PaymentTransaction();
        tx.setInstallment(installment);
        tx.setAmountPaid(req.getAmountPaid());
        tx.setReceiptUrl(req.getReceiptUrl());
        tx.setTransactionId(UUID.randomUUID().toString()); // server-generated — never from client

        PaymentTransaction savedTx = transactionRepository.save(tx);

        installment.setStatus("PAID");
        installmentRepository.save(installment);

        return ResponseEntity.ok(savedTx);
    }

    /**
     * POST /api/payments/booking/{bookingId}/manual-collection
     * Builder records an offline/manual collection against an APPROVED booking.
     * This creates a DB-backed paid installment plus transaction, so refresh,
     * relogin, and customer/builder views keep the same payment truth.
     */
    @PostMapping("/booking/{bookingId}/manual-collection")
    @Transactional
    public ResponseEntity<PaymentTransaction> recordManualCollection(
            @PathVariable Long bookingId,
            @Valid @RequestBody PayInstallmentRequest req) {

        User builder = requireBuilder();
        UnitBooking booking = requireBuilderOwnedBooking(bookingId, builder);

        if (!"APPROVED".equals(booking.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Manual collection can only be recorded for APPROVED bookings.");
        }

        PaymentInstallment inst = new PaymentInstallment();
        inst.setBooking(booking);
        inst.setMilestoneName("Manual Collection");
        inst.setPercentage(0.0);
        inst.setAmount(req.getAmountPaid());
        inst.setDueDate(java.time.LocalDate.now());
        inst.setStatus("PAID");
        PaymentInstallment savedInst = installmentRepository.save(inst);

        PaymentTransaction tx = new PaymentTransaction();
        tx.setInstallment(savedInst);
        tx.setAmountPaid(req.getAmountPaid());
        tx.setReceiptUrl(req.getReceiptUrl());
        tx.setTransactionId(UUID.randomUUID().toString());

        return ResponseEntity.ok(transactionRepository.save(tx));
    }

    // ── Builder: update possession status ─────────────────────────────────
    /**
     * PUT /api/payments/booking/{bookingId}/possession Builder marks soft
     * possession and optionally attaches a possession letter URL. Only the
     * builder who owns the project may call this endpoint.
     */
    @PutMapping("/booking/{bookingId}/possession")
    @Transactional
    public ResponseEntity<UnitBooking> updatePossessionStatus(
            @PathVariable Long bookingId,
            @Valid @RequestBody PossessionStatusRequest req) {

        User builder = requireBuilder();
        UnitBooking booking = requireBuilderOwnedBooking(bookingId, builder);

        // Possession only makes sense on approved bookings
        if (!"APPROVED".equals(booking.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Possession can only be set on APPROVED bookings.");
        }

        booking.setSoftPossessionStatus(req.getStatus());
        if (req.getLetterUrl() != null && !req.getLetterUrl().isBlank()) {
            booking.setPossessionLetterUrl(req.getLetterUrl());
        }

        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    // ADD in PaymentController.java after the payInstallment method:
    /**
     * GET /api/payments/booking/{bookingId}/payment-complete Checks if all
     * installments are paid; if so, marks unit as SOLD. Can be called by
     * builder after reviewing payments.
     */
    @PostMapping("/booking/{bookingId}/check-completion")
    @Transactional
    public ResponseEntity<Map<String, Object>> checkPaymentCompletion(
            @PathVariable Long bookingId) {

        User builder = requireBuilder();
        UnitBooking booking = requireBuilderOwnedBooking(bookingId, builder);

        List<PaymentInstallment> installments = installmentRepository.findByBooking_Id(bookingId);

        BigDecimal totalDue = installments.stream()
                .map(PaymentInstallment::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPaid = getTotalPaid(bookingId);
        boolean allPaid = totalDue.compareTo(BigDecimal.ZERO) > 0
                && totalPaid.compareTo(totalDue) >= 0
                && installments.stream().allMatch(i -> "PAID".equals(i.getStatus()));

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("allPaid", allPaid);
        result.put("totalInstallments", installments.size());
        result.put("paidCount", installments.stream().filter(i -> "PAID".equals(i.getStatus())).count());
        result.put("totalDue", totalDue);
        result.put("totalPaid", totalPaid);

        if (allPaid && "BOOKED".equals(booking.getUnit().getStatus())) {
            booking.getUnit().setStatus("SOLD");
            unitRepository.save(booking.getUnit());
            result.put("unitMarkedSold", true);
        } else {
            result.put("unitMarkedSold", false);
        }

        return ResponseEntity.ok(result);
    }
}
