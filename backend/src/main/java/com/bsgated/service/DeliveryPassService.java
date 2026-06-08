// package com.bsgated.service;
// import com.bsgated.dto.CreateDeliveryPassRequest;
// import com.bsgated.dto.VerifyDeliveryOtpRequest;
// import com.bsgated.model.DeliveryPass;
// import com.bsgated.repository.DeliveryPassRepository;
// import com.bsgated.repository.UserRepository;
// import com.bsgated.security.AuthenticatedUser;
// import com.bsgated.security.CurrentUser;
// import org.springframework.stereotype.Service;
// import java.security.SecureRandom;
// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Optional;
// @Service
// public class DeliveryPassService {
//     private final DeliveryPassRepository repo;
//     private final UserRepository userRepository;
//     private final AuditService auditService;
//     private final SecureRandom secureRandom = new SecureRandom();
//     public DeliveryPassService(DeliveryPassRepository repo, UserRepository userRepository, AuditService auditService) {
//         this.repo = repo;
//         this.userRepository = userRepository;
//         this.auditService = auditService;
//     }
//     private String generateOTP() {
//         return String.format("%06d", secureRandom.nextInt(1000000));
//     }
//     public DeliveryPass create(CreateDeliveryPassRequest req) {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         DeliveryPass pass = new DeliveryPass();
//         pass.setHostResidentId(String.valueOf(currentUser.id()));
//         pass.setHostResidentName(resolveResidentName(currentUser, req));
//         pass.setHostUnit(req.getHostUnit());
//         pass.setProvider(req.getProvider());
//         pass.setExpectedWindow(req.getExpectedWindow());
//         pass.setDeliveryPersonName(req.getDeliveryPersonName());
//         pass.setDeliveryPersonPhone(req.getDeliveryPersonPhone());
//         pass.setOtp(generateOTP());
//         pass.setStatus("PENDING");
//         DeliveryPass saved = repo.save(pass);
//         auditService.record("DELIVERY_PASS_CREATED", "DELIVERY_PASS", String.valueOf(saved.getId()), "Provider=" + saved.getProvider());
//         return saved;
//     }
//     public List<DeliveryPass> getByCurrentResident() {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         return repo.findByHostResidentIdOrderByCreatedAtDesc(String.valueOf(currentUser.id()));
//     }
//     public List<DeliveryPass> getPending() {
//         return repo.findByStatusOrderByCreatedAtDesc("PENDING");
//     }
//     public Optional<DeliveryPass> verifyOtp(VerifyDeliveryOtpRequest req) {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         Optional<DeliveryPass> opt = repo.findByOtpAndStatus(req.getOtp(), "PENDING");
//         opt.ifPresent(pass -> {
//             pass.setStatus("OTP_VERIFIED");
//             pass.setOtpVerifiedAt(LocalDateTime.now());
//             pass.setVerifiedByGuardId(String.valueOf(currentUser.id()));
//             repo.save(pass);
//             auditService.record("DELIVERY_OTP_VERIFIED", "DELIVERY_PASS", String.valueOf(pass.getId()), "OTP verified by guard");
//         });
//         return opt;
//     }
//     public Optional<DeliveryPass> markDelivered(Long id) {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         return repo.findById(id)
//                 .filter(pass -> "OTP_VERIFIED".equals(pass.getStatus()))
//                 .map(pass -> {
//                     pass.setStatus("DELIVERED");
//                     pass.setDeliveredAt(LocalDateTime.now());
//                     pass.setVerifiedByGuardId(String.valueOf(currentUser.id()));
//                     DeliveryPass saved = repo.save(pass);
//                     auditService.record("DELIVERY_MARKED_DELIVERED", "DELIVERY_PASS", String.valueOf(saved.getId()), "Delivery completed by guard");
//                     return saved;
//                 });
//     }
//     public Optional<DeliveryPass> cancel(Long id) {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         String residentId = String.valueOf(currentUser.id());
//         return repo.findById(id)
//                 .filter(pass -> "PENDING".equals(pass.getStatus()))
//                 .filter(pass -> residentId.equals(pass.getHostResidentId()))
//                 .map(pass -> {
//                     pass.setStatus("CANCELLED");
//                     pass.setCancelledAt(LocalDateTime.now());
//                     DeliveryPass saved = repo.save(pass);
//                     auditService.record("DELIVERY_PASS_CANCELLED", "DELIVERY_PASS", String.valueOf(saved.getId()), "Cancelled by resident");
//                     return saved;
//                 });
//     }
//     private String resolveResidentName(AuthenticatedUser currentUser, CreateDeliveryPassRequest req) {
//         return userRepository.findById(currentUser.id())
//                 .map(user -> user.getName() != null ? user.getName() : req.getHostResidentName())
//                 .orElse(req.getHostResidentName());
//     }
// }










// package com.bsgated.service;

// import com.bsgated.dto.CreateDeliveryPassRequest;
// import com.bsgated.dto.VerifyDeliveryOtpRequest;
// import com.bsgated.model.DeliveryPass;
// import com.bsgated.model.MarketplaceOrder;
// import com.bsgated.repository.DeliveryPassRepository;
// import com.bsgated.repository.MarketplaceOrderRepository;
// import com.bsgated.repository.UserRepository;
// import com.bsgated.security.AuthenticatedUser;
// import com.bsgated.security.CurrentUser;
// import org.springframework.stereotype.Service;

// import java.security.SecureRandom;
// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Optional;

// /**
//  * DeliveryPassService — MODIFIED
//  *
//  * Key change: When creating a delivery pass for a marketplace order (vendor
//  * assigns helper), the deliveryPersonName and deliveryPersonPhone now come from
//  * the assigned VendorDeliveryStaff snapshot stored in the MarketplaceOrder.
//  *
//  * Guard flow is unchanged — guard sees helper name + phone via delivery pass.
//  */
// @Service
// public class DeliveryPassService {

//     private final DeliveryPassRepository repo;
//     private final UserRepository userRepository;
//     private final MarketplaceOrderRepository orderRepository;
//     private final AuditService auditService;
//     private final SecureRandom secureRandom = new SecureRandom();

//     public DeliveryPassService(
//             DeliveryPassRepository repo,
//             UserRepository userRepository,
//             MarketplaceOrderRepository orderRepository,
//             AuditService auditService) {
//         this.repo = repo;
//         this.userRepository = userRepository;
//         this.orderRepository = orderRepository;
//         this.auditService = auditService;
//     }

//     private String generateOTP() {
//         return String.format("%06d", secureRandom.nextInt(1000000));
//     }

//     // ── Resident: create delivery pass ────────────────────────────────────────
//     public DeliveryPass create(CreateDeliveryPassRequest req) {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         DeliveryPass pass = new DeliveryPass();
//         pass.setHostResidentId(String.valueOf(currentUser.id()));
//         pass.setHostResidentName(resolveResidentName(currentUser, req));
//         pass.setHostUnit(req.getHostUnit());
//         pass.setProvider(req.getProvider());
//         pass.setExpectedWindow(req.getExpectedWindow());
//         pass.setDeliveryPersonName(req.getDeliveryPersonName());
//         pass.setDeliveryPersonPhone(req.getDeliveryPersonPhone());
//         pass.setOtp(generateOTP());
//         pass.setStatus("PENDING");

//         DeliveryPass saved = repo.save(pass);
//         auditService.record("DELIVERY_PASS_CREATED", "DELIVERY_PASS",
//                 String.valueOf(saved.getId()), "Provider=" + saved.getProvider());
//         return saved;
//     }

//     /**
//      * NEW: Create a delivery pass from a marketplace order.
//      *
//      * Called internally when vendor assigns a VendorDeliveryStaff to an order.
//      * deliveryPersonName and deliveryPersonPhone come from the staff snapshot
//      * already stored in the order, so guard verification is accurate.
//      *
//      * @param order the marketplace order with assignedDeliveryStaffName/Phone
//      * populated
//      * @return the created DeliveryPass
//      */
//     public DeliveryPass createFromMarketplaceOrder(MarketplaceOrder order) {
//         DeliveryPass pass = new DeliveryPass();
//         pass.setHostResidentId(String.valueOf(order.getResidentId()));
//         pass.setHostResidentName(order.getResidentName());
//         pass.setHostUnit(order.getUnit());
//         pass.setProvider(order.getStoreName()); // store name as provider label

//         // Use delivery staff snapshot — name + phone from VendorDeliveryStaff record
//         String helperName = order.getAssignedDeliveryStaffName() != null
//                 ? order.getAssignedDeliveryStaffName()
//                 : order.getDeliveryPartnerName();
//         String helperPhone = order.getAssignedDeliveryStaffPhone() != null
//                 ? order.getAssignedDeliveryStaffPhone()
//                 : order.getDeliveryPartnerPhone();

//         pass.setDeliveryPersonName(helperName);
//         pass.setDeliveryPersonPhone(helperPhone);

//         // Reuse the order's OTP so guard can verify the same code shown to resident
//         pass.setOtp(order.getOtp());
//         pass.setStatus("PENDING");

//         DeliveryPass saved = repo.save(pass);
//         auditService.record("DELIVERY_PASS_CREATED_FROM_ORDER", "DELIVERY_PASS",
//                 String.valueOf(saved.getId()),
//                 "OrderId=" + order.getId() + " | Helper=" + helperName);
//         return saved;
//     }

//     // ── Resident: list my passes ──────────────────────────────────────────────
//     public List<DeliveryPass> getByCurrentResident() {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         return repo.findByHostResidentIdOrderByCreatedAtDesc(String.valueOf(currentUser.id()));
//     }

//     // ── Guard: pending passes ─────────────────────────────────────────────────
//     public List<DeliveryPass> getPending() {
//         return repo.findByStatusOrderByCreatedAtDesc("PENDING");
//     }

//     // ── Guard: OTP verify ─────────────────────────────────────────────────────
//     public Optional<DeliveryPass> verifyOtp(VerifyDeliveryOtpRequest req) {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         Optional<DeliveryPass> opt = repo.findByOtpAndStatus(req.getOtp(), "PENDING");
//         opt.ifPresent(pass -> {
//             pass.setStatus("OTP_VERIFIED");
//             pass.setOtpVerifiedAt(LocalDateTime.now());
//             pass.setVerifiedByGuardId(String.valueOf(currentUser.id()));
//             repo.save(pass);
//             auditService.record("DELIVERY_OTP_VERIFIED", "DELIVERY_PASS",
//                     String.valueOf(pass.getId()), "OTP verified by guard");
//         });
//         return opt;
//     }

//     // ── Guard: mark delivered ─────────────────────────────────────────────────
//     public Optional<DeliveryPass> markDelivered(Long id) {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         return repo.findById(id)
//                 .filter(pass -> "OTP_VERIFIED".equals(pass.getStatus()))
//                 .map(pass -> {
//                     pass.setStatus("DELIVERED");
//                     pass.setDeliveredAt(LocalDateTime.now());
//                     pass.setVerifiedByGuardId(String.valueOf(currentUser.id()));
//                     DeliveryPass saved = repo.save(pass);
//                     auditService.record("DELIVERY_MARKED_DELIVERED", "DELIVERY_PASS",
//                             String.valueOf(saved.getId()), "Delivery completed by guard");
//                     return saved;
//                 });
//     }

//     // ── Resident: cancel pass ─────────────────────────────────────────────────
//     public Optional<DeliveryPass> cancel(Long id) {
//         AuthenticatedUser currentUser = CurrentUser.get();
//         String residentId = String.valueOf(currentUser.id());
//         return repo.findById(id)
//                 .filter(pass -> "PENDING".equals(pass.getStatus()))
//                 .filter(pass -> residentId.equals(pass.getHostResidentId()))
//                 .map(pass -> {
//                     pass.setStatus("CANCELLED");
//                     pass.setCancelledAt(LocalDateTime.now());
//                     DeliveryPass saved = repo.save(pass);
//                     auditService.record("DELIVERY_PASS_CANCELLED", "DELIVERY_PASS",
//                             String.valueOf(saved.getId()), "Cancelled by resident");
//                     return saved;
//                 });
//     }

//     // ── Internal helpers ──────────────────────────────────────────────────────
//     private String resolveResidentName(AuthenticatedUser currentUser, CreateDeliveryPassRequest req) {
//         return userRepository.findById(currentUser.id())
//                 .map(user -> user.getName() != null ? user.getName() : req.getHostResidentName())
//                 .orElse(req.getHostResidentName());
//     }
// }





















package com.bsgated.service;

import com.bsgated.dto.CreateDeliveryPassRequest;
import com.bsgated.dto.VerifyDeliveryOtpRequest;
import com.bsgated.model.DeliveryPass;
import com.bsgated.model.MarketplaceOrder;
import com.bsgated.repository.DeliveryPassRepository;
import com.bsgated.repository.MarketplaceOrderRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * DeliveryPassService — MODIFIED
 *
 * Key change: createFromMarketplaceOrder() is now called by MarketplaceOrderService
 * when vendor marks out_for_delivery. This creates a real DeliveryPass that the
 * guard sees in their marketplace delivery verification tab.
 *
 * The pass stores marketplaceOrderId so the guard screen can filter marketplace
 * passes separately from regular resident delivery passes.
 */
@Service
public class DeliveryPassService {

    private final DeliveryPassRepository repo;
    private final UserRepository userRepository;
    private final MarketplaceOrderRepository orderRepository;
    private final AuditService auditService;
    private final SecureRandom secureRandom = new SecureRandom();

    public DeliveryPassService(
            DeliveryPassRepository repo,
            UserRepository userRepository,
            MarketplaceOrderRepository orderRepository,
            AuditService auditService) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.auditService = auditService;
    }

    private String generateOTP() {
        return String.format("%06d", secureRandom.nextInt(1000000));
    }

    // ── Resident: create delivery pass (manual — for Swiggy, Amazon, etc.) ───
    public DeliveryPass create(CreateDeliveryPassRequest req) {
        AuthenticatedUser currentUser = CurrentUser.get();
        DeliveryPass pass = new DeliveryPass();
        pass.setHostResidentId(String.valueOf(currentUser.id()));
        pass.setHostResidentName(resolveResidentName(currentUser, req));
        pass.setHostUnit(req.getHostUnit());
        pass.setProvider(req.getProvider());
        pass.setExpectedWindow(req.getExpectedWindow());
        pass.setDeliveryPersonName(req.getDeliveryPersonName());
        pass.setDeliveryPersonPhone(req.getDeliveryPersonPhone());
        pass.setOtp(generateOTP());
        pass.setStatus("PENDING");
        // marketplaceOrderId stays null — this is a manual resident pass

        DeliveryPass saved = repo.save(pass);
        auditService.record("DELIVERY_PASS_CREATED", "DELIVERY_PASS",
                String.valueOf(saved.getId()), "Provider=" + saved.getProvider());
        return saved;
    }

    /**
     * Create a DeliveryPass from a marketplace order.
     *
     * Called by MarketplaceOrderService.markOutForDelivery().
     * This is the KEY fix: the guard's marketplace delivery section fetches
     * pending DeliveryPass records — now they will exist for marketplace orders.
     *
     * The pass uses the SAME OTP already stored in the order so:
     *   - Resident's order screen shows the OTP (already worked)
     *   - Guard verifies that same OTP (now works via this pass)
     *   - After verification, order.otpVerified = true → resident sees "arrived"
     *
     * @param order the marketplace order with assignedDeliveryStaffName/Phone populated
     * @return the created DeliveryPass
     */
    public DeliveryPass createFromMarketplaceOrder(MarketplaceOrder order) {
        // Check if a pass already exists for this order to avoid duplicates
        // (e.g., if vendor clicks "out for delivery" twice due to network retry)
        Optional<DeliveryPass> existing = repo.findByMarketplaceOrderId(order.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        DeliveryPass pass = new DeliveryPass();
        pass.setHostResidentId(String.valueOf(order.getResidentId()));
        pass.setHostResidentName(order.getResidentName());
        pass.setHostUnit(order.getUnit());
        // Provider = store name so guard sees which store's delivery it is
        pass.setProvider(order.getStoreName());

        // Use delivery staff snapshot fields — these were set during assignDelivery
        String helperName = order.getAssignedDeliveryStaffName() != null
                ? order.getAssignedDeliveryStaffName()
                : order.getDeliveryPartnerName();
        String helperPhone = order.getAssignedDeliveryStaffPhone() != null
                ? order.getAssignedDeliveryStaffPhone()
                : order.getDeliveryPartnerPhone();

        pass.setDeliveryPersonName(helperName);
        pass.setDeliveryPersonPhone(helperPhone);

        // CRITICAL: reuse order's OTP so resident and guard use the same code
        pass.setOtp(order.getOtp());
        pass.setStatus("PENDING");

        // Link back to marketplace order — guard screen uses this to filter
        pass.setMarketplaceOrderId(order.getId());

        DeliveryPass saved = repo.save(pass);
        auditService.record("DELIVERY_PASS_CREATED_FROM_ORDER", "DELIVERY_PASS",
                String.valueOf(saved.getId()),
                "OrderId=" + order.getId()
                        + " | Store=" + order.getStoreName()
                        + " | Helper=" + helperName
                        + " | Unit=" + order.getUnit());
        return saved;
    }

    // ── Resident: list my passes ──────────────────────────────────────────────
    public List<DeliveryPass> getByCurrentResident() {
        AuthenticatedUser currentUser = CurrentUser.get();
        return repo.findByHostResidentIdOrderByCreatedAtDesc(String.valueOf(currentUser.id()));
    }

    // ── Guard: pending passes ─────────────────────────────────────────────────
    public List<DeliveryPass> getPending() {
        return repo.findByStatusOrderByCreatedAtDesc("PENDING");
    }

    // ── Guard: OTP verify ─────────────────────────────────────────────────────
    /**
     * When guard verifies OTP:
     * 1. DeliveryPass status → OTP_VERIFIED
     * 2. If this pass was created from a marketplace order,
     *    also update MarketplaceOrder.otpVerified = true and status → out_for_delivery
     *    so the resident's order tracking screen shows "Arrived at Door" state.
     */
    public Optional<DeliveryPass> verifyOtp(VerifyDeliveryOtpRequest req) {
        AuthenticatedUser currentUser = CurrentUser.get();
        Optional<DeliveryPass> opt = repo.findByOtpAndStatus(req.getOtp(), "PENDING");
        opt.ifPresent(pass -> {
            pass.setStatus("OTP_VERIFIED");
            pass.setOtpVerifiedAt(LocalDateTime.now());
            pass.setVerifiedByGuardId(String.valueOf(currentUser.id()));
            repo.save(pass);

            // If this pass is linked to a marketplace order, update order state
            if (pass.getMarketplaceOrderId() != null) {
                orderRepository.findById(pass.getMarketplaceOrderId()).ifPresent(order -> {
                    order.setOtpVerified(true);
                    // Keep status as out_for_delivery — resident UI reads otpVerified=true
                    // to show "Arrived at Door" banner with accept/reject buttons
                    orderRepository.save(order);
                    auditService.record("ORDER_OTP_VERIFIED_BY_GUARD", "MARKETPLACE_ORDER",
                            String.valueOf(order.getId()),
                            "Guard=" + currentUser.id() + " | Unit=" + order.getUnit());
                });
            }

            auditService.record("DELIVERY_OTP_VERIFIED", "DELIVERY_PASS",
                    String.valueOf(pass.getId()), "OTP verified by guard");
        });
        return opt;
    }

    // ── Guard: mark delivered ─────────────────────────────────────────────────
    public Optional<DeliveryPass> markDelivered(Long id) {
        AuthenticatedUser currentUser = CurrentUser.get();
        return repo.findById(id)
                .filter(pass -> "OTP_VERIFIED".equals(pass.getStatus()))
                .map(pass -> {
                    pass.setStatus("DELIVERED");
                    pass.setDeliveredAt(LocalDateTime.now());
                    pass.setVerifiedByGuardId(String.valueOf(currentUser.id()));
                    DeliveryPass saved = repo.save(pass);
                    auditService.record("DELIVERY_MARKED_DELIVERED", "DELIVERY_PASS",
                            String.valueOf(saved.getId()), "Delivery completed by guard");
                    return saved;
                });
    }

    // ── Resident: cancel pass ─────────────────────────────────────────────────
    public Optional<DeliveryPass> cancel(Long id) {
        AuthenticatedUser currentUser = CurrentUser.get();
        String residentId = String.valueOf(currentUser.id());
        return repo.findById(id)
                .filter(pass -> "PENDING".equals(pass.getStatus()))
                .filter(pass -> residentId.equals(pass.getHostResidentId()))
                .map(pass -> {
                    pass.setStatus("CANCELLED");
                    pass.setCancelledAt(LocalDateTime.now());
                    DeliveryPass saved = repo.save(pass);
                    auditService.record("DELIVERY_PASS_CANCELLED", "DELIVERY_PASS",
                            String.valueOf(saved.getId()), "Cancelled by resident");
                    return saved;
                });
    }

    // ── Internal helpers ──────────────────────────────────────────────────────
    private String resolveResidentName(AuthenticatedUser currentUser, CreateDeliveryPassRequest req) {
        return userRepository.findById(currentUser.id())
                .map(user -> user.getName() != null ? user.getName() : req.getHostResidentName())
                .orElse(req.getHostResidentName());
    }
}