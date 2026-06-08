// // src/main/java/com/bsgated/controller/AmenityBookingController.java
// package com.bsgated.controller;

// import com.bsgated.model.AmenityBooking;
// import com.bsgated.payload.CreateAmenityBookingRequest;
// import com.bsgated.payload.OtpVerifyAmenityRequest;
// import com.bsgated.payload.PaymentVerifyRequest;
// import com.bsgated.service.AmenityBookingService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.HashMap;
// import java.util.Map;

// @RestController
// @RequestMapping("/api/amenity-bookings")
// @CrossOrigin(origins = "*")
// public class AmenityBookingController {

//     private final AmenityBookingService service;

//     public AmenityBookingController(AmenityBookingService service) {
//         this.service = service;
//     }

//     /**
//      * POST /api/amenity-bookings/create-order
//      * Creates booking + Razorpay order. Returns orderId + keyId to frontend.
//      */
//     @PostMapping("/create-order")
//     public ResponseEntity<?> createOrder(@RequestBody CreateAmenityBookingRequest req) {
//         try {
//             Map<String, Object> result = service.createBookingWithOrder(req);
//             return ResponseEntity.ok(result);
//         } catch (Exception e) {
//             Map<String, String> err = new HashMap<>();
//             err.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(err);
//         }
//     }

//     /**
//      * POST /api/amenity-bookings/verify-payment
//      * Validates Razorpay signature, marks booking confirmed, returns OTP.
//      */
//     @PostMapping("/verify-payment")
//     public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest req) {
//         try {
//             AmenityBooking booking = service.verifyPaymentAndConfirm(req);
//             return ResponseEntity.ok(booking);
//         } catch (Exception e) {
//             Map<String, String> err = new HashMap<>();
//             err.put("message", e.getMessage());
//             return ResponseEntity.status(400).body(err);
//         }
//     }

//     /**
//      * POST /api/amenity-bookings/verify-otp
//      * Guard verifies resident's OTP to allow amenity entry.
//      */
//     @PostMapping("/verify-otp")
//     public ResponseEntity<?> verifyOtp(@RequestBody OtpVerifyAmenityRequest req) {
//         Map<String, Object> result = service.verifyOtp(req.getOtp(), req.getGuardId(), req.getGuardName());
//         if ((Boolean) result.get("ok")) {
//             return ResponseEntity.ok(result);
//         }
//         return ResponseEntity.status(400).body(result);
//     }

//     /**
//      * GET /api/amenity-bookings/resident/{residentId}
//      * Returns all bookings for a resident.
//      */
//     @GetMapping("/resident/{residentId}")
//     public ResponseEntity<?> getByResident(@PathVariable String residentId) {
//         return ResponseEntity.ok(service.getByResident(residentId));
//     }

//     /**
//      * GET /api/amenity-bookings/resident/{residentId}/stats
//      * Returns booking stats for ResidentReportsScreen.
//      */
//     @GetMapping("/resident/{residentId}/stats")
//     public ResponseEntity<?> getStats(@PathVariable String residentId) {
//         return ResponseEntity.ok(service.getResidentStats(residentId));
//     }

//     /**
//      * POST /api/amenity-bookings/confirm-free
//      * For free amenities — no payment needed, directly confirms and generates OTP.
//      */
//     @PostMapping("/confirm-free")
//     public ResponseEntity<?> confirmFree(@RequestBody CreateAmenityBookingRequest req) {
//         try {
//             AmenityBooking booking = service.confirmFreeBooking(req);
//             return ResponseEntity.ok(booking);
//         } catch (Exception e) {
//             Map<String, String> err = new HashMap<>();
//             err.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(err);
//         }
//     }

//     /**
//      * PATCH /api/amenity-bookings/{id}/cancel
//      * Resident cancels a confirmed booking.
//      * Only allowed if booking is confirmed and not yet checked in.
//      * Updates status to "cancelled" in DB — this is what reports/history reads.
//      */
//     @PatchMapping("/{id}/cancel")
//     public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
//         try {
//             AmenityBooking booking = service.cancelBooking(id);
//             return ResponseEntity.ok(booking);
//         } catch (Exception e) {
//             Map<String, String> err = new HashMap<>();
//             err.put("message", e.getMessage());
//             return ResponseEntity.status(400).body(err);
//         }
//     }
// }































package com.bsgated.controller;

import com.bsgated.exception.ApiException;
import com.bsgated.model.AmenityBooking;
import com.bsgated.payload.CreateAmenityBookingRequest;
import com.bsgated.payload.OtpVerifyAmenityRequest;
import com.bsgated.payload.PaymentVerifyRequest;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.bsgated.service.AmenityBookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/amenity-bookings")
public class AmenityBookingController {

    private final AmenityBookingService service;

    public AmenityBookingController(AmenityBookingService service) {
        this.service = service;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CreateAmenityBookingRequest req) {
        // residentId injected from JWT inside service
        Map<String, Object> result = service.createBookingWithOrder(req);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest req) throws Exception {
        AmenityBooking booking = service.verifyPaymentAndConfirm(req);
        return ResponseEntity.ok(booking);
    }

    /**
     * SECURITY guard verifies resident OTP at amenity entrance.
     * Guard identity extracted from JWT — never trusted from request body.
     * SecurityConfig enforces hasRole("SECURITY") for this endpoint.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerifyAmenityRequest req) throws Exception {
        Map<String, Object> result = service.verifyOtp(req.getOtp());
        if ((Boolean) result.get("ok")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(400).body(result);
    }

    /**
     * Resident fetches their own bookings.
     * residentId comes from JWT — path variable removed to prevent IDOR.
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings() {
        AuthenticatedUser currentUser = CurrentUser.get();
        return ResponseEntity.ok(service.getByResident(String.valueOf(currentUser.id())));
    }

    @GetMapping("/my/stats")
    public ResponseEntity<?> getMyStats() {
        AuthenticatedUser currentUser = CurrentUser.get();
        return ResponseEntity.ok(service.getResidentStats(String.valueOf(currentUser.id())));
    }

    @PostMapping("/confirm-free")
    public ResponseEntity<?> confirmFree(@RequestBody CreateAmenityBookingRequest req) throws Exception {
        AmenityBooking booking = service.confirmFreeBooking(req);
        return ResponseEntity.ok(booking);
    }

    /**
     * Resident cancels their own booking.
     * Ownership validated inside service using JWT identity.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        AmenityBooking booking = service.cancelBooking(id);
        return ResponseEntity.ok(booking);
    }
}