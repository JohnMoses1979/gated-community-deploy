// package com.bsgated.controller;
// import com.bsgated.exception.ApiException;
// import com.bsgated.model.Unit;
// import com.bsgated.model.UnitBooking;
// import com.bsgated.model.User;
// import com.bsgated.repository.UnitBookingRepository;
// import com.bsgated.repository.UnitRepository;
// import com.bsgated.repository.UserRepository;
// import com.bsgated.security.AuthenticatedUser;
// import com.bsgated.security.CurrentUser;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// @RestController
// @RequestMapping("/api/bookings")
// public class BookingController {
//     private final UnitBookingRepository unitBookingRepository;
//     private final UnitRepository unitRepository;
//     private final UserRepository userRepository;
//     public BookingController(UnitBookingRepository unitBookingRepository, UnitRepository unitRepository, UserRepository userRepository) {
//         this.unitBookingRepository = unitBookingRepository;
//         this.unitRepository = unitRepository;
//         this.userRepository = userRepository;
//     }
//     private User getCurrentUser() {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         return userRepository.findById(currentUser.id())
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
//     }
//     @PostMapping("/unit/{unitId}")
//     public ResponseEntity<?> bookUnit(@PathVariable Long unitId, @RequestBody UnitBooking booking) {
//         User customer = getCurrentUser();
//         Unit unit = unitRepository.findById(unitId)
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Unit not found"));
//         if (!"AVAILABLE".equals(unit.getStatus())) {
//             throw new ApiException(HttpStatus.BAD_REQUEST, "Unit is not available for booking.");
//         }
//         booking.setCustomer(customer);
//         booking.setUnit(unit);
//         booking.setStatus("PENDING");
//         // Update unit status
//         unit.setStatus("BOOKED");
//         unitRepository.save(unit);
//         UnitBooking saved = unitBookingRepository.save(booking);
//         return ResponseEntity.ok(saved);
//     }
//     @GetMapping("/my-bookings")
//     public ResponseEntity<?> getMyBookings() {
//         User customer = getCurrentUser();
//         return ResponseEntity.ok(unitBookingRepository.findByCustomerId(customer.getId()));
//     }
//     @PutMapping("/{id}/approve")
//     public ResponseEntity<?> approveBooking(@PathVariable Long id) {
//         // Assume builder approves it
//         UnitBooking booking = unitBookingRepository.findById(id)
//                 .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
//         booking.setStatus("APPROVED");
//         Unit unit = booking.getUnit();
//         unit.setStatus("SOLD");
//         unitRepository.save(unit);
//         return ResponseEntity.ok(unitBookingRepository.save(booking));
//     }
// }
package com.bsgated.controller;

import com.bsgated.dto.booking.BookUnitRequest;
import com.bsgated.dto.booking.BookingStatusRequest;
import com.bsgated.exception.ApiException;
import com.bsgated.model.PaymentTransaction;
import com.bsgated.model.Project;
import com.bsgated.model.Unit;
import com.bsgated.model.UnitBooking;
import com.bsgated.model.User;
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

import java.util.List;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Booking API — unit reservations by customers, approvals / rejections by
 * builders.
 *
 * Security guarantees: - Customer endpoints require ROLE_CUSTOMER (enforced in
 * SecurityConfig). - Builder approval endpoint requires ROLE_BUILDER (enforced
 * in SecurityConfig). - Customer identity is always resolved from the JWT —
 * never from the request body. - A customer can only view their own bookings. -
 * A builder can only approve/reject bookings on units belonging to their
 * projects. - Double-booking is prevented with a pessimistic unit status check
 * inside a
 *
 * @Transactional boundary. - Approving an already-approved booking, or a
 * booking whose unit is already SOLD, is rejected with a clear 409 Conflict
 * error.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final UnitBookingRepository unitBookingRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;

    private final PaymentTransactionRepository transactionRepository;

    public BookingController(
            UnitBookingRepository unitBookingRepository,
            UnitRepository unitRepository,
            UserRepository userRepository,
            PaymentTransactionRepository transactionRepository) {
        this.unitBookingRepository = unitBookingRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    // ── Private helpers ────────────────────────────────────────────────────
    private User requireCurrentUser() {
        AuthenticatedUser currentUser = CurrentUser.get();
        return userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private User requireCurrentBuilder() {
        AuthenticatedUser currentUser = CurrentUser.get();
        if (!"BUILDER".equalsIgnoreCase(currentUser.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only Builders can perform this action.");
        }
        return userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Builder account not found"));
    }

    // ── Customer: book a unit ──────────────────────────────────────────────
    /**
     * POST /api/bookings/unit/{unitId} Customer books a unit. The unit must
     * belong to an Approved + LIVE project, and its status must be AVAILABLE —
     * both checked atomically inside the transaction.
     *
     * The customer is resolved from the JWT; their ID is never taken from the
     * body.
     */
    @PostMapping("/unit/{unitId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> bookUnit(
            @PathVariable Long unitId,
            @Valid @RequestBody BookUnitRequest req) {

        User customer = requireCurrentUser();

        // Pessimistic lock — prevents race condition / double booking
        Unit unit = unitRepository.findByIdForUpdate(unitId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Unit not found"));

        Project parentProject = unit.getTower().getProject();
        if (!"Approved".equals(parentProject.getApprovalStatus())
                || !"LIVE".equals(parentProject.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This unit is not available for booking.");
        }

        if (!"AVAILABLE".equals(unit.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Unit is not available. Current status: " + unit.getStatus());
        }

        UnitBooking booking = new UnitBooking();
        booking.setCustomer(customer);
        booking.setUnit(unit);
        booking.setKycDocumentsJson(req.getKycDocumentsJson());
        booking.setDigitalSignatureUrl(req.getDigitalSignatureUrl());
        booking.setStatus("PENDING");

        unit.setStatus("HOLD");
        unitRepository.save(unit);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toBookingResponse(unitBookingRepository.save(booking)));
    }

    // ── Customer: my bookings ──────────────────────────────────────────────
    /**
     * GET /api/bookings/my-bookings Returns only bookings belonging to the
     * authenticated customer. A customer cannot see another customer's
     * bookings.
     */
    @GetMapping("/my-bookings")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getMyBookings() {
        User customer = requireCurrentUser();
        return ResponseEntity.ok(unitBookingRepository.findByCustomer_Id(customer.getId())
                .stream()
                .map(this::toBookingResponse)
                .toList());
    }

    // ── Builder: list bookings for a unit ─────────────────────────────────
    /**
     * GET /api/bookings/unit/{unitId} Builder views pending bookings for a unit
     * they own.
     */
    @GetMapping("/unit/{unitId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getBookingsForUnit(@PathVariable Long unitId) {
        User builder = requireCurrentBuilder();

        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Unit not found"));

        // IDOR: builder must own the parent project
        if (!unit.getTower().getProject().getBuilder().getId().equals(builder.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this unit.");
        }

        return ResponseEntity.ok(unitBookingRepository.findByUnit_Id(unitId)
                .stream()
                .map(this::toBookingResponse)
                .toList());
    }

    // ── Builder: approve or reject a booking ──────────────────────────────
    /**
     * PUT /api/bookings/{id}/status Builder approves or rejects a booking.
     *
     * Approval rules: - Booking must be in PENDING state (idempotency /
     * double-sell prevention). - Unit must still be in HOLD state. - Builder
     * must own the unit's parent project (IDOR prevention).
     *
     * On APPROVED → unit status moves to SOLD. On REJECTED → unit status
     * reverts to AVAILABLE so other customers can book. On CANCELLED → same
     * reversion as rejected.
     */
    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusRequest req) {

        User builder = requireCurrentBuilder();

        UnitBooking booking = unitBookingRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        Unit unit = booking.getUnit();
        if (!unit.getTower().getProject().getBuilder().getId().equals(builder.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this booking.");
        }

        if (!"PENDING".equals(booking.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Booking is already '" + booking.getStatus() + "' and cannot be changed.");
        }

        String newStatus = req.getStatus();
        booking.setStatus(newStatus);

        if ("APPROVED".equals(newStatus)) {
            if (!"HOLD".equals(unit.getStatus())) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "Unit is no longer on HOLD. Cannot approve.");
            }
            // APPROVED → unit moves to BOOKED (awaiting payment)
            unit.setStatus("BOOKED");
            unitRepository.save(unit);

        } else if ("REJECTED".equals(newStatus) || "CANCELLED".equals(newStatus)) {
            unit.setStatus("AVAILABLE");
            unitRepository.save(unit);
        } else {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Invalid status: " + newStatus);
        }

        return ResponseEntity.ok(toBookingResponse(unitBookingRepository.save(booking)));
    }

    /**
     * PUT /api/bookings/{id}/complete-payment Builder marks payment received →
     * unit moves to SOLD. Booking must be APPROVED and unit must be BOOKED.
     */
    @PutMapping("/{id}/complete-payment")
    @Transactional
    public ResponseEntity<Map<String, Object>> completePayment(@PathVariable Long id) {
        requireCurrentBuilder();
        throw new ApiException(HttpStatus.BAD_REQUEST,
                "Use /api/payments/booking/{bookingId}/check-completion. SOLD is allowed only after persisted installments are fully paid.");
    }

    // In BookingController.java
    /**
     * GET /api/bookings/builder/all Returns all bookings for units belonging to
     * the authenticated builder.
     */
    @GetMapping("/builder/all")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getAllBuilderBookings() {
        User builder = requireCurrentBuilder();
        return ResponseEntity.ok(
                unitBookingRepository.findByUnit_Tower_Project_Builder_Id(builder.getId())
                        .stream()
                        .map(this::toBookingResponse)
                        .toList()
        );
    }

    private Map<String, Object> toBookingResponse(UnitBooking booking) {

        Unit unit = booking.getUnit();
        Project project = unit != null && unit.getTower() != null ? unit.getTower().getProject() : null;
        User customer = booking.getCustomer();
        Map<String, Object> unitMap = Map.of(
                "id", unit != null ? unit.getId() : "",
                "flatNo", unit != null ? nullToEmpty(unit.getFlatNo()) : "",
                "unitNumber", unit != null ? nullToEmpty(unit.getUnitNumber()) : "",
                "unitType", unit != null ? nullToEmpty(unit.getUnitType()) : "",
                "bhkType", unit != null ? nullToEmpty(unit.getBhkType()) : "",
                "price", unit != null ? nullToEmpty(unit.getPrice()) : "",
                "towerName", unit != null && unit.getTower() != null ? nullToEmpty(unit.getTower().getName()) : "",
                "projectId", project != null ? project.getId() : "",
                "projectName", project != null ? nullToEmpty(project.getName()) : ""
        );
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", booking.getId());
        response.put("status", nullToEmpty(booking.getStatus()));
        response.put("customerId", customer != null ? customer.getId() : "");
        response.put("customerName", customer != null ? nullToEmpty(customer.getName()) : "");
        response.put("customerPhone", customer != null ? nullToEmpty(customer.getPhone()) : "");
        response.put("unitId", unit != null ? unit.getId() : "");
        response.put("flatNo", unit != null ? firstNonBlank(unit.getFlatNo(), unit.getUnitNumber()) : "");
        response.put("projectName", project != null ? nullToEmpty(project.getName()) : "");
        response.put("price", unit != null ? nullToEmpty(unit.getPrice()) : "");
        response.put("unit", unitMap);
        response.put("kycDocumentsJson", nullToEmpty(booking.getKycDocumentsJson()));
        response.put("digitalSignatureUrl", nullToEmpty(booking.getDigitalSignatureUrl()));
        response.put("softPossessionStatus", Boolean.TRUE.equals(booking.getSoftPossessionStatus()));
        response.put("possessionLetterUrl", nullToEmpty(booking.getPossessionLetterUrl()));
        response.put("createdAt", booking.getCreatedAt());

        // ADD these lines before the final return:
        response.put("totalAmount", unit != null && unit.getPrice() != null ? unit.getPrice() : "");
        response.put("paidAmount", 0); // actual paid comes from PaymentController; placeholder
        response.put("bookingAmount", unit != null ? unit.getPrice() : "");
        BigDecimal paid = transactionRepository
                .findByInstallment_Booking_Id(booking.getId())
                .stream()
                .map(PaymentTransaction::getAmountPaid)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.put("paidAmount", paid);
        return response;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private String firstNonBlank(String first, String second) {
        return first != null && !first.isBlank() ? first : nullToEmpty(second);
    }
}
