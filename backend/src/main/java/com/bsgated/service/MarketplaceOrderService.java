package com.bsgated.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bsgated.dto.PlaceOrderRequest;
import com.bsgated.exception.ApiException;
import com.bsgated.model.MarketplaceOrder;
import com.bsgated.model.User;
import com.bsgated.model.VendorDeliveryStaff;
import com.bsgated.model.VendorStore;
import com.bsgated.repository.MarketplaceOrderRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.repository.VendorStoreRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;

@Service
public class MarketplaceOrderService {

    private final MarketplaceOrderRepository orderRepo;
    private final VendorStoreRepository storeRepo;
    private final UserRepository userRepo;
    private final AuditService auditService;
    private final VendorDeliveryStaffService deliveryStaffService;
    private final DeliveryPassService deliveryPassService;
    private final SecureRandom secureRandom = new SecureRandom();

    public MarketplaceOrderService(
            MarketplaceOrderRepository orderRepo,
            VendorStoreRepository storeRepo,
            UserRepository userRepo,
            AuditService auditService,
            VendorDeliveryStaffService deliveryStaffService,
            @Lazy DeliveryPassService deliveryPassService) {
        this.orderRepo = orderRepo;
        this.storeRepo = storeRepo;
        this.userRepo = userRepo;
        this.auditService = auditService;
        this.deliveryStaffService = deliveryStaffService;
        this.deliveryPassService = deliveryPassService;
    }

    private String generateOtp() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }

    // ── Resident: place order ─────────────────────────────────────────────────
    @Transactional
    public MarketplaceOrder placeOrder(PlaceOrderRequest req) {
        AuthenticatedUser actor = CurrentUser.get();

        User resident = userRepo.findById(actor.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resident not found."));

        VendorStore store = storeRepo.findById(req.getStoreId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Store not found."));

        if (!store.isActive() || store.isVacationMode()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This store is currently unavailable.");
        }

        MarketplaceOrder order = new MarketplaceOrder();
        order.setResidentId(actor.id());
        order.setResidentName(resident.getName() != null ? resident.getName() : "Resident");
        order.setUnit(resolveUnit(resident));
        order.setVendorId(store.getVendorId());
        order.setStoreId(store.getId());
        order.setStoreName(store.getStoreName());
        order.setItemsJson(req.getItemsJson());
        order.setSubtotal(req.getSubtotal());
        order.setDeliveryCharge(req.getDeliveryCharge() != null ? req.getDeliveryCharge() : 20.0);
        order.setTotal(req.getTotal());
        order.setPaymentMethod(req.getPaymentMethod());
        order.setRazorpayPaymentId(req.getRazorpayPaymentId());
        order.setRazorpayOrderId(req.getRazorpayOrderId());
        order.setPaymentStatus(
                "razorpay".equalsIgnoreCase(req.getPaymentMethod()) ? "paid"
                : "cod".equalsIgnoreCase(req.getPaymentMethod()) ? "cod" : "pending");
        order.setOtp(generateOtp());
        order.setOtpVerified(false);
        order.setStatus("pending");

        MarketplaceOrder saved = orderRepo.save(order);
        auditService.record("MARKETPLACE_ORDER_PLACED", "MARKETPLACE_ORDER",
                String.valueOf(saved.getId()),
                "Store=" + store.getStoreName() + " | Total=₹" + saved.getTotal());
        return saved;
    }

    // ── Resident: get my orders ───────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MarketplaceOrder> getMyOrders() {
        AuthenticatedUser actor = CurrentUser.get();
        return orderRepo.findByResidentIdOrderByPlacedAtDesc(actor.id());
    }

    /**
     * Resident confirms they received the delivery at the door.
     *
     * This is called when resident taps "Accept Delivery" on the app.
     * Marks the order as delivered in the database so:
     *   - Resident's order shows status=delivered (buttons disappear permanently)
     *   - Vendor's Delivered tab count goes up
     *   - Vendor's Earnings screen counts this order's total in revenue
     *
     * Security: resident can only confirm their own orders.
     */
    @Transactional
    public MarketplaceOrder residentConfirmDelivery(Long orderId) {
        AuthenticatedUser actor = CurrentUser.get();

        MarketplaceOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found."));

        // Ensure this order belongs to the calling resident
        if (!order.getResidentId().equals(actor.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only confirm your own orders.");
        }

        // Only allow confirming orders that are out_for_delivery
        if (!"out_for_delivery".equals(order.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Order must be out for delivery before confirming receipt.");
        }

        order.setStatus("delivered");
        order.setDeliveredAt(LocalDateTime.now());

        MarketplaceOrder saved = orderRepo.save(order);
        auditService.record("ORDER_DELIVERED_BY_RESIDENT", "MARKETPLACE_ORDER",
                String.valueOf(orderId),
                "Resident=" + actor.id() + " confirmed delivery");
        return saved;
    }

    /**
     * Resident rejects the delivery at the door.
     *
     * Security: resident can only reject their own orders.
     */
    @Transactional
    public MarketplaceOrder residentRejectDelivery(Long orderId) {
        AuthenticatedUser actor = CurrentUser.get();

        MarketplaceOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!order.getResidentId().equals(actor.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only reject your own orders.");
        }

        if (!"out_for_delivery".equals(order.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Order must be out for delivery before rejecting.");
        }

        order.setStatus("rejected");

        MarketplaceOrder saved = orderRepo.save(order);
        auditService.record("ORDER_REJECTED_BY_RESIDENT", "MARKETPLACE_ORDER",
                String.valueOf(orderId),
                "Resident=" + actor.id() + " rejected delivery at door");
        return saved;
    }

    // ── Vendor: get orders ────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MarketplaceOrder> getVendorOrders() {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);
        return orderRepo.findByVendorIdOrderByPlacedAtDesc(actor.id());
    }

    @Transactional(readOnly = true)
    public List<MarketplaceOrder> getVendorOrdersByStatus(String status) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);
        return orderRepo.findByVendorIdAndStatusOrderByPlacedAtDesc(actor.id(), status);
    }

    // ── Vendor: accept order ──────────────────────────────────────────────────
    @Transactional
    public MarketplaceOrder acceptOrder(Long orderId) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);
        MarketplaceOrder order = getVendorOrder(orderId, actor.id());

        if (!"pending".equals(order.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending orders can be accepted.");
        }

        order.setStatus("accepted");
        order.setAcceptedAt(LocalDateTime.now());
        MarketplaceOrder saved = orderRepo.save(order);
        auditService.record("ORDER_ACCEPTED", "MARKETPLACE_ORDER", String.valueOf(orderId), "Accepted by vendor");
        return saved;
    }

    // ── Vendor: reject order ──────────────────────────────────────────────────
    @Transactional
    public MarketplaceOrder rejectOrder(Long orderId) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);
        MarketplaceOrder order = getVendorOrder(orderId, actor.id());

        if (!"pending".equals(order.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending orders can be rejected.");
        }

        order.setStatus("rejected");
        MarketplaceOrder saved = orderRepo.save(order);
        auditService.record("ORDER_REJECTED", "MARKETPLACE_ORDER", String.valueOf(orderId), "Rejected by vendor");
        return saved;
    }

    // ── Vendor: assign delivery staff ─────────────────────────────────────────
    @Transactional
    public MarketplaceOrder assignDelivery(Long orderId, Map<String, String> body) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);
        MarketplaceOrder order = getVendorOrder(orderId, actor.id());

        if (!"accepted".equals(order.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Order must be accepted before assigning delivery.");
        }

        String deliveryStaffIdStr = body.get("deliveryStaffId");

        if (deliveryStaffIdStr != null && !deliveryStaffIdStr.isBlank()) {
            Long staffId;
            try {
                staffId = Long.parseLong(deliveryStaffIdStr);
            } catch (NumberFormatException e) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid deliveryStaffId format.");
            }

            VendorDeliveryStaff staff = deliveryStaffService.getActiveStaffForVendor(staffId, actor.id());

            order.setAssignedDeliveryStaffId(staff.getId());
            order.setAssignedDeliveryStaffName(staff.getName());
            order.setAssignedDeliveryStaffPhone(staff.getPhone());
            order.setAssignedVehicleType(staff.getVehicleType());

            order.setDeliveryPartnerName(staff.getName());
            order.setDeliveryPartnerPhone(staff.getPhone());

            auditService.record("DELIVERY_STAFF_ASSIGNED", "MARKETPLACE_ORDER",
                    String.valueOf(orderId),
                    "StaffId=" + staff.getId() + " | Name=" + staff.getName()
                    + " | Phone=" + staff.getPhone());
        } else {
            String partnerName = body.get("partnerName");
            String partnerPhone = body.get("partnerPhone");
            order.setDeliveryPartnerName(partnerName);
            order.setDeliveryPartnerPhone(partnerPhone);
            auditService.record("DELIVERY_ASSIGNED", "MARKETPLACE_ORDER",
                    String.valueOf(orderId), "Partner=" + partnerName);
        }

        order.setStatus("assigned_delivery");
        order.setAssignedAt(LocalDateTime.now());
        return orderRepo.save(order);
    }

    // ── Vendor: mark out for delivery ─────────────────────────────────────────
    @Transactional
    public MarketplaceOrder markOutForDelivery(Long orderId) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);
        MarketplaceOrder order = getVendorOrder(orderId, actor.id());

        if (!"assigned_delivery".equals(order.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Delivery must be assigned first.");
        }

        order.setStatus("out_for_delivery");
        order.setOutForDeliveryAt(LocalDateTime.now());
        MarketplaceOrder saved = orderRepo.save(order);

        // Create a DeliveryPass for the guard to verify at the gate
        try {
            deliveryPassService.createFromMarketplaceOrder(saved);
        } catch (Exception e) {
            auditService.record("DELIVERY_PASS_CREATE_FAILED", "MARKETPLACE_ORDER",
                    String.valueOf(orderId),
                    "DeliveryPass creation failed: " + e.getMessage());
        }

        auditService.record("ORDER_OUT_FOR_DELIVERY", "MARKETPLACE_ORDER", String.valueOf(orderId),
                "DeliveryPass created for guard verification");
        return saved;
    }

    // ── Vendor: mark delivered (vendor-side) ──────────────────────────────────
    @Transactional
    public MarketplaceOrder markDelivered(Long orderId) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);
        MarketplaceOrder order = getVendorOrder(orderId, actor.id());

        if (!"out_for_delivery".equals(order.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order must be out for delivery first.");
        }

        order.setStatus("delivered");
        order.setDeliveredAt(LocalDateTime.now());
        MarketplaceOrder saved = orderRepo.save(order);
        auditService.record("ORDER_DELIVERED", "MARKETPLACE_ORDER", String.valueOf(orderId), "");
        return saved;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private MarketplaceOrder getVendorOrder(Long orderId, Long vendorId) {
        MarketplaceOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found."));
        if (!order.getVendorId().equals(vendorId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This order does not belong to your store.");
        }
        return order;
    }

    private void ensureVendorRole(AuthenticatedUser actor) {
        if (!"VENDOR".equalsIgnoreCase(actor.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only vendors can manage orders.");
        }
    }

    private String resolveUnit(User resident) {
        return "N/A";
    }
}