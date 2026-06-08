// // src/main/java/com/bsgated/service/EVBookingService.java
// package com.bsgated.service;

// import com.bsgated.model.EVBooking;
// import com.bsgated.payload.CreateEVBookingRequest;
// import com.bsgated.payload.PaymentVerifyRequest;
// import com.bsgated.repository.EVBookingRepository;
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
// public class EVBookingService {

//     private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

//     @Value("${razorpay.key.id}")
//     private String razorpayKeyId;

//     @Value("${razorpay.key.secret}")
//     private String razorpayKeySecret;

//     private final EVBookingRepository repo;

//     public EVBookingService(EVBookingRepository repo) {
//         this.repo = repo;
//     }

//     @Transactional
//     public Map<String, Object> createBookingWithOrder(CreateEVBookingRequest req) throws Exception {
//         // Check if slot already booked for same date
//         List<String> activeStatuses = List.of("booked", "active", "payment_pending");
//         boolean slotTaken = !repo.findBySlotAndDateAndStatusIn(
//             req.getSlot(), req.getDate(), activeStatuses
//         ).isEmpty();
//         if (slotTaken) throw new RuntimeException("This EV slot is already booked for the selected date.");

//         int amountInPaise = (int) (req.getDepositAmount() * 100);
//         Map<String, Object> rzpOrder = createRazorpayOrder(amountInPaise);

//         EVBooking booking = new EVBooking();
//         booking.setResidentId(req.getResidentId());
//         booking.setResidentName(req.getResidentName());
//         booking.setUnit(req.getUnit());
//         booking.setSlot(req.getSlot());
//         booking.setDate(req.getDate());
//         booking.setStartTime(req.getStartTime());
//         booking.setEndTime(req.getEndTime());
//         booking.setVehicleNumber(req.getVehicleNumber());
//         booking.setVehicleType(req.getVehicleType());
//         booking.setDepositAmount(req.getDepositAmount());
//         booking.setRatePerUnit(req.getRatePerUnit());
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

//     @Transactional
//     public EVBooking verifyPaymentAndConfirm(PaymentVerifyRequest req) throws Exception {
//         String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
//         Mac mac = Mac.getInstance("HmacSHA256");
//         SecretKeySpec secret = new SecretKeySpec(
//             razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"
//         );
//         mac.init(secret);
//         byte[] hashBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
//         StringBuilder hex = new StringBuilder();
//         for (byte b : hashBytes) hex.append(String.format("%02x", b));

//         if (!hex.toString().equals(req.getRazorpaySignature())) {
//             throw new RuntimeException("Payment signature verification failed.");
//         }

//         EVBooking booking = repo.findByRazorpayOrderId(req.getRazorpayOrderId())
//             .orElseThrow(() -> new RuntimeException("Booking not found for order: " + req.getRazorpayOrderId()));

//         booking.setRazorpayPaymentId(req.getRazorpayPaymentId());
//         booking.setPaymentStatus("paid");
//         booking.setStatus("booked");
//         booking.setOtp(generateOtp());
//         booking.setQrCode("EV-QR-" + booking.getId() + "-" + System.currentTimeMillis());
//         return repo.save(booking);
//     }

//     @Transactional
//     public Map<String, Object> verifyOtp(String otp, String guardId, String guardName) {
//         Optional<EVBooking> opt = repo.findByOtp(otp);
//         Map<String, Object> result = new HashMap<>();

//         if (opt.isEmpty()) {
//             result.put("ok", false);
//             result.put("reason", "OTP not found");
//             return result;
//         }

//         EVBooking booking = opt.get();
//         if (booking.isCheckedIn()) {
//             result.put("ok", false);
//             result.put("reason", "OTP already used");
//             return result;
//         }
//         if (!"booked".equals(booking.getStatus()) && !"active".equals(booking.getStatus())) {
//             result.put("ok", false);
//             result.put("reason", "Booking not confirmed");
//             return result;
//         }

//         booking.setCheckedIn(true);
//         booking.setCheckedInBy(guardId + " — " + guardName);
//         booking.setCheckedInAt(LocalDateTime.now());
//         booking.setStatus("active");
//         repo.save(booking);

//         result.put("ok", true);
//         result.put("booking", booking);
//         return result;
//     }

//     public List<EVBooking> getByResident(String residentId) {
//         return repo.findByResidentId(residentId);
//     }

//     public Map<String, Object> getResidentStats(String residentId) {
//         List<EVBooking> all = repo.findByResidentId(residentId);
//         long total     = all.size();
//         long active    = all.stream().filter(b -> "booked".equals(b.getStatus()) || "active".equals(b.getStatus())).count();
//         long completed = all.stream().filter(b -> "completed".equals(b.getStatus())).count();
//         double spent   = all.stream()
//             .filter(b -> "paid".equals(b.getPaymentStatus()))
//             .mapToDouble(EVBooking::getDepositAmount).sum();

//         Map<String, Object> stats = new HashMap<>();
//         stats.put("total", total);
//         stats.put("active", active);
//         stats.put("completed", completed);
//         stats.put("spent", spent);
//         stats.put("bookings", all);
//         return stats;
//     }

//     private Map<String, Object> createRazorpayOrder(int amountInPaise) {
//         RestTemplate restTemplate = new RestTemplate();
//         HttpHeaders headers = new HttpHeaders();
//         headers.setContentType(MediaType.APPLICATION_JSON);
//         headers.setBasicAuth(razorpayKeyId, razorpayKeySecret, StandardCharsets.UTF_8);

//         Map<String, Object> orderRequest = new HashMap<>();
//         orderRequest.put("amount", amountInPaise);
//         orderRequest.put("currency", "INR");
//         orderRequest.put("receipt", "ev_" + System.currentTimeMillis());

//         HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(orderRequest, headers);
//         try {
//             ResponseEntity<Map> response = restTemplate.postForEntity(
//                 RAZORPAY_ORDERS_URL, requestEntity, Map.class
//             );
//             Map<String, Object> body = response.getBody();
//             if (body == null || body.get("id") == null)
//                 throw new RuntimeException("Razorpay did not return an order id.");
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
import com.bsgated.model.EVBooking;
import com.bsgated.model.User;
import com.bsgated.payload.CreateEVBookingRequest;
import com.bsgated.payload.PaymentVerifyRequest;
import com.bsgated.repository.EVBookingRepository;
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
public class EVBookingService {

    private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final EVBookingRepository repo;
    private final UserRepository userRepo;

    public EVBookingService(EVBookingRepository repo, UserRepository userRepo) {
        this.repo    = repo;
        this.userRepo = userRepo;
    }

    @Transactional
    public Map<String, Object> createBookingWithOrder(CreateEVBookingRequest req) {
        AuthenticatedUser currentUser = CurrentUser.get();
        String residentId = String.valueOf(currentUser.id());
        User resident = userRepo.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resident not found."));

        List<String> activeStatuses = List.of("booked", "active", "payment_pending");
        boolean slotTaken = !repo.findBySlotAndDateAndStatusIn(
                req.getSlot(), req.getDate(), activeStatuses).isEmpty();
        if (slotTaken) {
            throw new ApiException(HttpStatus.CONFLICT, "This EV slot is already booked for the selected date.");
        }

        int amountInPaise = (int) (req.getDepositAmount() * 100);
        Map<String, Object> rzpOrder = createRazorpayOrder(amountInPaise);

        EVBooking booking = new EVBooking();
        // Identity from JWT
        booking.setResidentId(residentId);
        booking.setResidentName(resident.getName());
        booking.setUnit("N/A"); // replace when User entity has unit field
        booking.setSlot(req.getSlot());
        booking.setDate(req.getDate());
        booking.setStartTime(req.getStartTime());
        booking.setEndTime(req.getEndTime());
        booking.setVehicleNumber(req.getVehicleNumber());
        booking.setVehicleType(req.getVehicleType());
        booking.setDepositAmount(req.getDepositAmount());
        booking.setRatePerUnit(req.getRatePerUnit());
        booking.setRazorpayOrderId(String.valueOf(rzpOrder.get("id")));
        booking.setStatus("payment_pending");
        booking.setPaymentStatus("unpaid");
        repo.save(booking);

        Map<String, Object> result = new HashMap<>();
        result.put("bookingId",       booking.getId());
        result.put("razorpayOrderId", rzpOrder.get("id"));
        result.put("razorpayKeyId",   razorpayKeyId);
        result.put("amount",          amountInPaise);
        result.put("currency",        "INR");
        return result;
    }

    @Transactional
    public EVBooking verifyPaymentAndConfirm(PaymentVerifyRequest req) throws Exception {
        String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hashBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : hashBytes) hex.append(String.format("%02x", b));

        if (!hex.toString().equals(req.getRazorpaySignature())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment signature verification failed.");
        }

        EVBooking booking = repo.findByRazorpayOrderId(req.getRazorpayOrderId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Booking not found for order: " + req.getRazorpayOrderId()));

        AuthenticatedUser currentUser = CurrentUser.get();
        if (!booking.getResidentId().equals(String.valueOf(currentUser.id()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This booking does not belong to you.");
        }

        booking.setRazorpayPaymentId(req.getRazorpayPaymentId());
        booking.setPaymentStatus("paid");
        booking.setStatus("booked");
        booking.setOtp(generateOtp());
        booking.setQrCode("EV-QR-" + booking.getId() + "-" + System.currentTimeMillis());
        return repo.save(booking);
    }

    /**
     * Guard verifies OTP. Guard identity from JWT.
     */
    @Transactional
    public Map<String, Object> verifyOtp(String otp) {
        AuthenticatedUser guard = CurrentUser.get();
        Optional<EVBooking> opt = repo.findByOtp(otp);
        Map<String, Object> result = new HashMap<>();

        if (opt.isEmpty()) {
            result.put("ok", false);
            result.put("reason", "OTP not found");
            return result;
        }

        EVBooking booking = opt.get();
        if (booking.isCheckedIn()) {
            result.put("ok", false);
            result.put("reason", "OTP already used");
            return result;
        }
        if (!"booked".equals(booking.getStatus()) && !"active".equals(booking.getStatus())) {
            result.put("ok", false);
            result.put("reason", "Booking not confirmed");
            return result;
        }

        booking.setCheckedIn(true);
        booking.setCheckedInBy("guardId=" + guard.id());
        booking.setCheckedInAt(LocalDateTime.now());
        booking.setStatus("active");
        repo.save(booking);

        result.put("ok", true);
        result.put("booking", booking);
        return result;
    }

    public List<EVBooking> getByResident(String residentId) {
        return repo.findByResidentId(residentId);
    }

    public Map<String, Object> getResidentStats(String residentId) {
        List<EVBooking> all = repo.findByResidentId(residentId);
        long active    = all.stream().filter(b -> "booked".equals(b.getStatus()) || "active".equals(b.getStatus())).count();
        long completed = all.stream().filter(b -> "completed".equals(b.getStatus())).count();
        double spent   = all.stream()
                .filter(b -> "paid".equals(b.getPaymentStatus()))
                .mapToDouble(EVBooking::getDepositAmount).sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total",     all.size());
        stats.put("active",    active);
        stats.put("completed", completed);
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
        orderRequest.put("amount",  amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "ev_" + System.currentTimeMillis());

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
}