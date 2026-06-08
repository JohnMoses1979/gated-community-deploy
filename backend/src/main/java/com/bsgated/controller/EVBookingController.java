// // src/main/java/com/bsgated/controller/EVBookingController.java
// package com.bsgated.controller;

// import com.bsgated.model.EVBooking;
// import com.bsgated.payload.CreateEVBookingRequest;
// import com.bsgated.payload.OtpVerifyAmenityRequest;
// import com.bsgated.payload.PaymentVerifyRequest;
// import com.bsgated.service.EVBookingService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.HashMap;
// import java.util.Map;

// @RestController
// @RequestMapping("/api/ev-bookings")
// @CrossOrigin(origins = "*")
// public class EVBookingController {

//     private final EVBookingService service;

//     public EVBookingController(EVBookingService service) {
//         this.service = service;
//     }

//     @PostMapping("/create-order")
//     public ResponseEntity<?> createOrder(@RequestBody CreateEVBookingRequest req) {
//         try {
//             return ResponseEntity.ok(service.createBookingWithOrder(req));
//         } catch (Exception e) {
//             Map<String, String> err = new HashMap<>();
//             err.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(err);
//         }
//     }

//     @PostMapping("/verify-payment")
//     public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest req) {
//         try {
//             EVBooking booking = service.verifyPaymentAndConfirm(req);
//             return ResponseEntity.ok(booking);
//         } catch (Exception e) {
//             Map<String, String> err = new HashMap<>();
//             err.put("message", e.getMessage());
//             return ResponseEntity.status(400).body(err);
//         }
//     }

//     @PostMapping("/verify-otp")
//     public ResponseEntity<?> verifyOtp(@RequestBody OtpVerifyAmenityRequest req) {
//         Map<String, Object> result = service.verifyOtp(
//             req.getOtp(), req.getGuardId(), req.getGuardName()
//         );
//         return (Boolean) result.get("ok")
//             ? ResponseEntity.ok(result)
//             : ResponseEntity.status(400).body(result);
//     }

//     @GetMapping("/resident/{residentId}")
//     public ResponseEntity<?> getByResident(@PathVariable String residentId) {
//         return ResponseEntity.ok(service.getByResident(residentId));
//     }

//     @GetMapping("/resident/{residentId}/stats")
//     public ResponseEntity<?> getStats(@PathVariable String residentId) {
//         return ResponseEntity.ok(service.getResidentStats(residentId));
//     }
// }
































package com.bsgated.controller;

import com.bsgated.model.EVBooking;
import com.bsgated.payload.CreateEVBookingRequest;
import com.bsgated.payload.OtpVerifyAmenityRequest;
import com.bsgated.payload.PaymentVerifyRequest;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.bsgated.service.EVBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ev-bookings")
public class EVBookingController {

    private final EVBookingService service;

    public EVBookingController(EVBookingService service) {
        this.service = service;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CreateEVBookingRequest req) throws Exception {
        return ResponseEntity.ok(service.createBookingWithOrder(req));
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest req) throws Exception {
        EVBooking booking = service.verifyPaymentAndConfirm(req);
        return ResponseEntity.ok(booking);
    }

    /**
     * Guard verifies OTP — identity extracted from JWT.
     * SecurityConfig enforces hasRole("SECURITY").
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerifyAmenityRequest req) throws Exception {
        Map<String, Object> result = service.verifyOtp(req.getOtp());
        return (Boolean) result.get("ok")
                ? ResponseEntity.ok(result)
                : ResponseEntity.status(400).body(result);
    }

    /**
     * Resident fetches their own EV bookings.
     * residentId from JWT — no path variable to prevent IDOR.
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
}