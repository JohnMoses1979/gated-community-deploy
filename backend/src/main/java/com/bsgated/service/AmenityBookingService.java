// // src/main/java/com/bsgated/service/AmenityBookingService.java
// package com.bsgated.service;

// import com.bsgated.model.AmenityBooking;
// import com.bsgated.payload.CreateAmenityBookingRequest;
// import com.bsgated.payload.PaymentVerifyRequest;
// import com.bsgated.repository.AmenityBookingRepository;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.http.HttpEntity;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import org.springframework.web.client.RestTemplate;

// import javax.crypto.Mac;
// import javax.crypto.spec.SecretKeySpec;
// import java.nio.charset.StandardCharsets;
// import java.time.LocalDateTime;
// import java.util.*;

// @Service
// public class AmenityBookingService {
//     private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

//     @Value("${razorpay.key.id}")
//     private String razorpayKeyId;

//     @Value("${razorpay.key.secret}")
//     private String razorpayKeySecret;

//     private final AmenityBookingRepository repo;

//     public AmenityBookingService(AmenityBookingRepository repo) {
//         this.repo = repo;
//     }

//     // ── Create booking + Razorpay order ───────────────────────────────────

//     @Transactional
//     public Map<String, Object> createBookingWithOrder(CreateAmenityBookingRequest req) throws Exception {
//         List<String> activeStatuses = List.of("confirmed", "payment_pending");
//         boolean alreadyBooked = !repo.findByResidentIdAndAmenityIdAndDateAndStatusIn(
//             req.getResidentId(), req.getAmenityId(), req.getDate(), activeStatuses
//         ).isEmpty();
//         if (alreadyBooked) throw new RuntimeException("Already booked for this amenity on this date.");

//         int amountInPaise = (int) (req.getAmount() * 100);
//         Map<String, Object> rzpOrder = createRazorpayOrder(amountInPaise);

//         AmenityBooking booking = new AmenityBooking();
//         booking.setResidentId(req.getResidentId());
//         booking.setResidentName(req.getResidentName());
//         booking.setUnit(req.getUnit());
//         booking.setAmenityId(req.getAmenityId());
//         booking.setAmenityName(req.getAmenityName());
//         booking.setAmenityEmoji(req.getAmenityEmoji());
//         booking.setSlot(req.getSlot());
//         booking.setDate(req.getDate());
//         booking.setMembers(req.getMembers());
//         booking.setAmount(req.getAmount());
//         booking.setRazorpayOrderId(String.valueOf(rzpOrder.get("id")));
//         booking.setStatus("payment_pending");
//         booking.setPaymentStatus("unpaid");
//         repo.save(booking);

//         Map<String, Object> result = new HashMap<>();
//         result.put("bookingId", booking.getId());
//         result.put("razorpayOrderId", rzpOrder.get("id"));
//         result.put("razorpayKeyId", razorpayKeyId);
//         result.put("amount", amountInPaise);
//         result.put("currency", "INR");
//         return result;
//     }

//     // ── Verify payment + generate OTP ────────────────────────────────────

//     @Transactional
//     public AmenityBooking verifyPaymentAndConfirm(PaymentVerifyRequest req) throws Exception {
//         String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
//         Mac mac = Mac.getInstance("HmacSHA256");
//         SecretKeySpec secret = new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
//         mac.init(secret);
//         byte[] hashBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
//         StringBuilder hexString = new StringBuilder();
//         for (byte b : hashBytes) hexString.append(String.format("%02x", b));
//         String generatedSignature = hexString.toString();

//         if (!generatedSignature.equals(req.getRazorpaySignature())) {
//             throw new RuntimeException("Payment signature verification failed.");
//         }

//         AmenityBooking booking = repo.findByRazorpayOrderId(req.getRazorpayOrderId())
//             .orElseThrow(() -> new RuntimeException("Booking not found for order: " + req.getRazorpayOrderId()));

//         booking.setRazorpayPaymentId(req.getRazorpayPaymentId());
//         booking.setPaymentStatus("paid");
//         booking.setStatus("confirmed");
//         booking.setOtp(generateOtp());
//         return repo.save(booking);
//     }

//     // ── Guard OTP verification ────────────────────────────────────────────

//     @Transactional
//     public Map<String, Object> verifyOtp(String otp, String guardId, String guardName) {
//         Optional<AmenityBooking> opt = repo.findByOtp(otp);
//         Map<String, Object> result = new HashMap<>();

//         if (opt.isEmpty()) {
//             result.put("ok", false);
//             result.put("reason", "OTP not found");
//             return result;
//         }

//         AmenityBooking booking = opt.get();
//         if (booking.isCheckedIn()) {
//             result.put("ok", false);
//             result.put("reason", "OTP already used");
//             return result;
//         }
//         if (!"confirmed".equals(booking.getStatus())) {
//             result.put("ok", false);
//             result.put("reason", "Booking not confirmed");
//             return result;
//         }

//         booking.setCheckedIn(true);
//         booking.setCheckedInBy(guardId + " — " + guardName);
//         booking.setCheckedInAt(LocalDateTime.now());
//         repo.save(booking);

//         result.put("ok", true);
//         result.put("booking", booking);
//         return result;
//     }

//     // ── Cancel booking ────────────────────────────────────────────────────
//     // Sets status = "cancelled" in DB.
//     // Rules: must be confirmed, not yet checked in.
//     // payment_pending bookings are also cancellable (user abandoned payment).

//     @Transactional
//     public AmenityBooking cancelBooking(Long id) {
//         AmenityBooking booking = repo.findById(id)
//             .orElseThrow(() -> new RuntimeException("Booking not found: " + id));

//         if ("cancelled".equals(booking.getStatus())) {
//             throw new RuntimeException("Booking is already cancelled.");
//         }
//         if (booking.isCheckedIn()) {
//             throw new RuntimeException("Cannot cancel a booking that has already been checked in.");
//         }
//         // Allow cancelling confirmed or payment_pending bookings
//         if (!List.of("confirmed", "payment_pending").contains(booking.getStatus())) {
//             throw new RuntimeException("Only confirmed bookings can be cancelled.");
//         }

//         booking.setStatus("cancelled");
//         booking.setCancelledAt(LocalDateTime.now());
//         return repo.save(booking);
//     }

//     // ── Resident queries ──────────────────────────────────────────────────

//     public List<AmenityBooking> getByResident(String residentId) {
//         return repo.findByResidentId(residentId);
//     }

//     public Map<String, Object> getResidentStats(String residentId) {
//         List<AmenityBooking> all = repo.findByResidentId(residentId);
//         long total     = all.size();
//         long confirmed = all.stream().filter(b -> "confirmed".equals(b.getStatus())).count();
//         long cancelled = all.stream().filter(b -> "cancelled".equals(b.getStatus())).count();
//         double spent   = all.stream()
//             .filter(b -> "paid".equals(b.getPaymentStatus()))
//             .mapToDouble(AmenityBooking::getAmount).sum();

//         Map<String, Object> stats = new HashMap<>();
//         stats.put("total", total);
//         stats.put("confirmed", confirmed);
//         stats.put("cancelled", cancelled);
//         stats.put("spent", spent);
//         stats.put("bookings", all);
//         return stats;
//     }

//     @Transactional
//     public AmenityBooking confirmFreeBooking(CreateAmenityBookingRequest req) {
//         List<String> activeStatuses = List.of("confirmed", "payment_pending");
//         boolean alreadyBooked = !repo.findByResidentIdAndAmenityIdAndDateAndStatusIn(
//             req.getResidentId(), req.getAmenityId(), req.getDate(), activeStatuses
//         ).isEmpty();
//         if (alreadyBooked) {
//             throw new RuntimeException("Already booked for this amenity on this date.");
//         }

//         AmenityBooking booking = new AmenityBooking();
//         booking.setResidentId(req.getResidentId());
//         booking.setResidentName(req.getResidentName());
//         booking.setUnit(req.getUnit());
//         booking.setAmenityId(req.getAmenityId());
//         booking.setAmenityName(req.getAmenityName());
//         booking.setAmenityEmoji(req.getAmenityEmoji());
//         booking.setSlot(req.getSlot());
//         booking.setDate(req.getDate());
//         booking.setMembers(req.getMembers());
//         booking.setAmount(0);
//         booking.setStatus("confirmed");
//         booking.setPaymentStatus("free");
//         booking.setOtp(generateOtp());
//         return repo.save(booking);
//     }

//     // ── Helpers ───────────────────────────────────────────────────────────

//     private Map<String, Object> createRazorpayOrder(int amountInPaise) {
//         RestTemplate restTemplate = new RestTemplate();

//         HttpHeaders headers = new HttpHeaders();
//         headers.setContentType(MediaType.APPLICATION_JSON);
//         headers.setBasicAuth(razorpayKeyId, razorpayKeySecret, StandardCharsets.UTF_8);

//         Map<String, Object> orderRequest = new HashMap<>();
//         orderRequest.put("amount", amountInPaise);
//         orderRequest.put("currency", "INR");
//         orderRequest.put("receipt", "amenity_" + System.currentTimeMillis());

//         HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(orderRequest, headers);

//         try {
//             ResponseEntity<Map> response = restTemplate.postForEntity(
//                 RAZORPAY_ORDERS_URL,
//                 requestEntity,
//                 Map.class
//             );
//             Map<String, Object> body = response.getBody();
//             if (body == null || body.get("id") == null) {
//                 throw new RuntimeException("Razorpay did not return an order id.");
//             }
//             return body;
//         } catch (Exception e) {
//             throw new RuntimeException("Unable to create Razorpay order: " + e.getMessage(), e);
//         }
//     }

//     private String generateOtp() {
//         return String.format("%06d", new Random().nextInt(999999));
//     }
// }



























package com.bsgated.service;

import com.bsgated.exception.ApiException;
import com.bsgated.model.AmenityBooking;
import com.bsgated.model.User;
import com.bsgated.payload.CreateAmenityBookingRequest;
import com.bsgated.payload.PaymentVerifyRequest;
import com.bsgated.repository.AmenityBookingRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AmenityBookingService {

    private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final AmenityBookingRepository repo;
    private final UserRepository userRepo;

    public AmenityBookingService(AmenityBookingRepository repo, UserRepository userRepo) {
        this.repo    = repo;
        this.userRepo = userRepo;
    }

    @Transactional
    public Map<String, Object> createBookingWithOrder(CreateAmenityBookingRequest req) {
        AuthenticatedUser currentUser = CurrentUser.get();
        String residentId = String.valueOf(currentUser.id());
        User resident = userRepo.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resident not found."));

        List<String> activeStatuses = List.of("confirmed", "payment_pending");
        boolean alreadyBooked = !repo.findByResidentIdAndAmenityIdAndDateAndStatusIn(
                residentId, req.getAmenityId(), req.getDate(), activeStatuses).isEmpty();
        if (alreadyBooked) {
            throw new ApiException(HttpStatus.CONFLICT, "Already booked for this amenity on this date.");
        }

        int amountInPaise = (int) (req.getAmount() * 100);
        Map<String, Object> rzpOrder = createRazorpayOrder(amountInPaise);

        AmenityBooking booking = new AmenityBooking();
        // Identity from JWT — never from request body
        booking.setResidentId(residentId);
        booking.setResidentName(resident.getName());
        booking.setUnit(resolveUnit(resident));
        booking.setAmenityId(req.getAmenityId());
        booking.setAmenityName(req.getAmenityName());
        booking.setAmenityEmoji(req.getAmenityEmoji());
        booking.setSlot(req.getSlot());
        booking.setDate(req.getDate());
        booking.setMembers(req.getMembers());
        booking.setAmount(req.getAmount());
        booking.setRazorpayOrderId(String.valueOf(rzpOrder.get("id")));
        booking.setStatus("payment_pending");
        booking.setPaymentStatus("unpaid");
        repo.save(booking);

        Map<String, Object> result = new HashMap<>();
        result.put("bookingId", booking.getId());
        result.put("razorpayOrderId", rzpOrder.get("id"));
        result.put("razorpayKeyId", razorpayKeyId);
        result.put("amount", amountInPaise);
        result.put("currency", "INR");
        return result;
    }

    @Transactional
    public AmenityBooking verifyPaymentAndConfirm(PaymentVerifyRequest req) throws Exception {
        String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hashBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : hashBytes) hex.append(String.format("%02x", b));

        if (!hex.toString().equals(req.getRazorpaySignature())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment signature verification failed.");
        }

        AmenityBooking booking = repo.findByRazorpayOrderId(req.getRazorpayOrderId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Booking not found for order: " + req.getRazorpayOrderId()));

        // Ownership check: the booking must belong to the calling resident
        AuthenticatedUser currentUser = CurrentUser.get();
        if (!booking.getResidentId().equals(String.valueOf(currentUser.id()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This booking does not belong to you.");
        }

        booking.setRazorpayPaymentId(req.getRazorpayPaymentId());
        booking.setPaymentStatus("paid");
        booking.setStatus("confirmed");
        booking.setOtp(generateOtp());
        return repo.save(booking);
    }

    /**
     * Guard verifies OTP. Guard identity extracted from JWT — never from request body.
     */
    @Transactional
    public Map<String, Object> verifyOtp(String otp) {
        AuthenticatedUser guard = CurrentUser.get();
        Optional<AmenityBooking> opt = repo.findByOtp(otp);
        Map<String, Object> result = new HashMap<>();

        if (opt.isEmpty()) {
            result.put("ok", false);
            result.put("reason", "OTP not found");
            return result;
        }

        AmenityBooking booking = opt.get();
        if (booking.isCheckedIn()) {
            result.put("ok", false);
            result.put("reason", "OTP already used");
            return result;
        }
        if (!"confirmed".equals(booking.getStatus())) {
            result.put("ok", false);
            result.put("reason", "Booking not confirmed");
            return result;
        }

        // Guard identity from JWT — trusted source
        booking.setCheckedIn(true);
        booking.setCheckedInBy("guardId=" + guard.id());
        booking.setCheckedInAt(LocalDateTime.now());
        repo.save(booking);

        result.put("ok", true);
        result.put("booking", booking);
        return result;
    }

    @Transactional
    public AmenityBooking cancelBooking(Long id) {
        AuthenticatedUser currentUser = CurrentUser.get();
        AmenityBooking booking = repo.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found: " + id));

        // Ownership check — resident can only cancel their own booking
        if (!booking.getResidentId().equals(String.valueOf(currentUser.id()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings.");
        }
        if ("cancelled".equals(booking.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Booking is already cancelled.");
        }
        if (booking.isCheckedIn()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot cancel a booking that has already been checked in.");
        }
        if (!List.of("confirmed", "payment_pending").contains(booking.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only confirmed bookings can be cancelled.");
        }

        booking.setStatus("cancelled");
        booking.setCancelledAt(LocalDateTime.now());
        return repo.save(booking);
    }

    @Transactional
    public AmenityBooking confirmFreeBooking(CreateAmenityBookingRequest req) {
        AuthenticatedUser currentUser = CurrentUser.get();
        String residentId = String.valueOf(currentUser.id());
        User resident = userRepo.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resident not found."));

        List<String> activeStatuses = List.of("confirmed", "payment_pending");
        boolean alreadyBooked = !repo.findByResidentIdAndAmenityIdAndDateAndStatusIn(
                residentId, req.getAmenityId(), req.getDate(), activeStatuses).isEmpty();
        if (alreadyBooked) {
            throw new ApiException(HttpStatus.CONFLICT, "Already booked for this amenity on this date.");
        }

        AmenityBooking booking = new AmenityBooking();
        booking.setResidentId(residentId);
        booking.setResidentName(resident.getName());
        booking.setUnit(resolveUnit(resident));
        booking.setAmenityId(req.getAmenityId());
        booking.setAmenityName(req.getAmenityName());
        booking.setAmenityEmoji(req.getAmenityEmoji());
        booking.setSlot(req.getSlot());
        booking.setDate(req.getDate());
        booking.setMembers(req.getMembers());
        booking.setAmount(0);
        booking.setStatus("confirmed");
        booking.setPaymentStatus("free");
        booking.setOtp(generateOtp());
        return repo.save(booking);
    }

    public List<AmenityBooking> getByResident(String residentId) {
        return repo.findByResidentId(residentId);
    }

    public Map<String, Object> getResidentStats(String residentId) {
        List<AmenityBooking> all = repo.findByResidentId(residentId);
        long confirmed = all.stream().filter(b -> "confirmed".equals(b.getStatus())).count();
        long cancelled = all.stream().filter(b -> "cancelled".equals(b.getStatus())).count();
        double spent   = all.stream()
                .filter(b -> "paid".equals(b.getPaymentStatus()))
                .mapToDouble(AmenityBooking::getAmount).sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total",     all.size());
        stats.put("confirmed", confirmed);
        stats.put("cancelled", cancelled);
        stats.put("spent",     spent);
        stats.put("bookings",  all);
        return stats;
    }

    private Map<String, Object> createRazorpayOrder(int amountInPaise) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(razorpayKeyId, razorpayKeySecret, StandardCharsets.UTF_8);

        Map<String, Object> orderRequest = new HashMap<>();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "amenity_" + System.currentTimeMillis());

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    RAZORPAY_ORDERS_URL, new HttpEntity<>(orderRequest, headers), Map.class);
            Map<String, Object> body = response.getBody();
            if (body == null || body.get("id") == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Razorpay did not return an order id.");
            }
            return body;
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to create Razorpay order: " + e.getMessage());
        }
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private String resolveUnit(User resident) {
        // User entity does not have a unit field — returns a safe fallback.
        // When unit is added to User, replace this.
        return "N/A";
    }
}