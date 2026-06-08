// package com.bsgated.controller;

// import com.bsgated.dto.PlaceOrderRequest;
// import com.bsgated.model.MarketplaceOrder;
// import com.bsgated.service.MarketplaceOrderService;
// import jakarta.validation.Valid;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;
// import java.util.Map;

// /**
//  * Marketplace Order lifecycle:
//  *
//  * POST   /api/marketplace/orders                    — resident places order
//  * GET    /api/marketplace/orders/my                 — resident gets own orders
//  *
//  * GET    /api/vendor/orders                         — vendor gets all their orders
//  * GET    /api/vendor/orders?status=pending          — filtered by status
//  * PUT    /api/vendor/orders/{id}/accept             — accept
//  * PUT    /api/vendor/orders/{id}/reject             — reject
//  * PUT    /api/vendor/orders/{id}/assign-delivery    — assign delivery partner
//  * PUT    /api/vendor/orders/{id}/out-for-delivery   — mark out for delivery
//  * PUT    /api/vendor/orders/{id}/delivered          — mark delivered
//  */
// @RestController
// public class MarketplaceOrderController {

//     private final MarketplaceOrderService service;

//     public MarketplaceOrderController(MarketplaceOrderService service) {
//         this.service = service;
//     }

//     // ── Resident endpoints ────────────────────────────────────────────────────

//     @PostMapping(value = "/api/marketplace/orders", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> placeOrder(@Valid @RequestBody PlaceOrderRequest req) {
//         return ResponseEntity.status(HttpStatus.CREATED).body(service.placeOrder(req));
//     }

//     @GetMapping(value = "/api/marketplace/orders/my", produces = "application/json")
//     public ResponseEntity<List<MarketplaceOrder>> getMyOrders() {
//         return ResponseEntity.ok(service.getMyOrders());
//     }

//     // ── Vendor endpoints ──────────────────────────────────────────────────────

//     @GetMapping(value = "/api/vendor/orders", produces = "application/json")
//     public ResponseEntity<List<MarketplaceOrder>> getVendorOrders(
//             @RequestParam(required = false) String status) {
//         if (status != null && !status.isBlank()) {
//             return ResponseEntity.ok(service.getVendorOrdersByStatus(status.trim()));
//         }
//         return ResponseEntity.ok(service.getVendorOrders());
//     }

//     @PutMapping(value = "/api/vendor/orders/{id}/accept", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> acceptOrder(@PathVariable Long id) {
//         return ResponseEntity.ok(service.acceptOrder(id));
//     }

//     @PutMapping(value = "/api/vendor/orders/{id}/reject", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> rejectOrder(@PathVariable Long id) {
//         return ResponseEntity.ok(service.rejectOrder(id));
//     }

//     @PutMapping(value = "/api/vendor/orders/{id}/assign-delivery", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> assignDelivery(
//             @PathVariable Long id,
//             @RequestBody Map<String, String> body) {
//         return ResponseEntity.ok(service.assignDelivery(id, body));
//     }

//     @PutMapping(value = "/api/vendor/orders/{id}/out-for-delivery", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> markOutForDelivery(@PathVariable Long id) {
//         return ResponseEntity.ok(service.markOutForDelivery(id));
//     }

//     @PutMapping(value = "/api/vendor/orders/{id}/delivered", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> markDelivered(@PathVariable Long id) {
//         return ResponseEntity.ok(service.markDelivered(id));
//     }
// }

// package com.bsgated.controller;

// import com.bsgated.dto.PlaceOrderRequest;
// import com.bsgated.model.MarketplaceOrder;
// import com.bsgated.service.MarketplaceOrderService;
// import jakarta.validation.Valid;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;
// import java.util.Map;

// /**
//  * Marketplace Order lifecycle:
//  *
//  * POST   /api/marketplace/orders                         — resident places order
//  * GET    /api/marketplace/orders/my                      — resident gets own orders
//  *
//  * GET    /api/vendor/orders                              — vendor gets all their orders
//  * GET    /api/vendor/orders?status=pending               — filtered by status
//  * PUT    /api/vendor/orders/{id}/accept                  — accept
//  * PUT    /api/vendor/orders/{id}/reject                  — reject
//  * PUT    /api/vendor/orders/{id}/assign-delivery         — assign delivery staff
//  *   Body (NEW): { "deliveryStaffId": 5 }
//  *   Body (LEGACY fallback): { "partnerName": "...", "partnerPhone": "..." }
//  * PUT    /api/vendor/orders/{id}/out-for-delivery        — mark out for delivery
//  * PUT    /api/vendor/orders/{id}/delivered               — mark delivered
//  */
// @RestController
// public class MarketplaceOrderController {

//     private final MarketplaceOrderService service;

//     public MarketplaceOrderController(MarketplaceOrderService service) {
//         this.service = service;
//     }

//     // ── Resident endpoints ────────────────────────────────────────────────────

//     @PostMapping(value = "/api/marketplace/orders", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> placeOrder(@Valid @RequestBody PlaceOrderRequest req) {
//         return ResponseEntity.status(HttpStatus.CREATED).body(service.placeOrder(req));
//     }

//     @GetMapping(value = "/api/marketplace/orders/my", produces = "application/json")
//     public ResponseEntity<List<MarketplaceOrder>> getMyOrders() {
//         return ResponseEntity.ok(service.getMyOrders());
//     }

//     // ── Vendor endpoints ──────────────────────────────────────────────────────

//     @GetMapping(value = "/api/vendor/orders", produces = "application/json")
//     public ResponseEntity<List<MarketplaceOrder>> getVendorOrders(
//             @RequestParam(required = false) String status) {
//         if (status != null && !status.isBlank()) {
//             return ResponseEntity.ok(service.getVendorOrdersByStatus(status.trim()));
//         }
//         return ResponseEntity.ok(service.getVendorOrders());
//     }

//     @PutMapping(value = "/api/vendor/orders/{id}/accept", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> acceptOrder(@PathVariable Long id) {
//         return ResponseEntity.ok(service.acceptOrder(id));
//     }

//     @PutMapping(value = "/api/vendor/orders/{id}/reject", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> rejectOrder(@PathVariable Long id) {
//         return ResponseEntity.ok(service.rejectOrder(id));
//     }

//     /**
//      * Assign delivery to an order.
//      *
//      * NEW body format:   { "deliveryStaffId": 5 }
//      * LEGACY body format: { "partnerName": "Ravi", "partnerPhone": "9876543210" }
//      *
//      * Both are supported. New format performs full validation (ownership + active check).
//      */
//     @PutMapping(value = "/api/vendor/orders/{id}/assign-delivery", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> assignDelivery(
//             @PathVariable Long id,
//             @RequestBody Map<String, String> body) {
//         return ResponseEntity.ok(service.assignDelivery(id, body));
//     }

//     @PutMapping(value = "/api/vendor/orders/{id}/out-for-delivery", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> markOutForDelivery(@PathVariable Long id) {
//         return ResponseEntity.ok(service.markOutForDelivery(id));
//     }

//     @PutMapping(value = "/api/vendor/orders/{id}/delivered", produces = "application/json")
//     public ResponseEntity<MarketplaceOrder> markDelivered(@PathVariable Long id) {
//         return ResponseEntity.ok(service.markDelivered(id));
//     }
// }

















package com.bsgated.controller;

import com.bsgated.dto.PlaceOrderRequest;
import com.bsgated.model.MarketplaceOrder;
import com.bsgated.service.MarketplaceOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Marketplace Order lifecycle:
 *
 * POST   /api/marketplace/orders                         — resident places order
 * GET    /api/marketplace/orders/my                      — resident gets own orders
 * PUT    /api/marketplace/orders/{id}/resident-confirm   — resident confirms delivery received
 * PUT    /api/marketplace/orders/{id}/resident-reject    — resident rejects delivery
 *
 * GET    /api/vendor/orders                              — vendor gets all their orders
 * GET    /api/vendor/orders?status=pending               — filtered by status
 * PUT    /api/vendor/orders/{id}/accept                  — accept
 * PUT    /api/vendor/orders/{id}/reject                  — reject
 * PUT    /api/vendor/orders/{id}/assign-delivery         — assign delivery staff
 * PUT    /api/vendor/orders/{id}/out-for-delivery        — mark out for delivery
 * PUT    /api/vendor/orders/{id}/delivered               — mark delivered
 */
@RestController
public class MarketplaceOrderController {

    private final MarketplaceOrderService service;

    public MarketplaceOrderController(MarketplaceOrderService service) {
        this.service = service;
    }

    // ── Resident endpoints ────────────────────────────────────────────────────

    @PostMapping(value = "/api/marketplace/orders", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> placeOrder(@Valid @RequestBody PlaceOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.placeOrder(req));
    }

    @GetMapping(value = "/api/marketplace/orders/my", produces = "application/json")
    public ResponseEntity<List<MarketplaceOrder>> getMyOrders() {
        return ResponseEntity.ok(service.getMyOrders());
    }

    /**
     * Resident confirms they received and accepted the delivery.
     * Marks order as delivered in the database.
     * This makes it count in vendor earnings.
     */
    @PutMapping(value = "/api/marketplace/orders/{id}/resident-confirm", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> residentConfirm(@PathVariable Long id) {
        return ResponseEntity.ok(service.residentConfirmDelivery(id));
    }

    /**
     * Resident rejects the delivery at the door.
     * Marks order as rejected.
     */
    @PutMapping(value = "/api/marketplace/orders/{id}/resident-reject", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> residentReject(@PathVariable Long id) {
        return ResponseEntity.ok(service.residentRejectDelivery(id));
    }

    // ── Vendor endpoints ──────────────────────────────────────────────────────

    @GetMapping(value = "/api/vendor/orders", produces = "application/json")
    public ResponseEntity<List<MarketplaceOrder>> getVendorOrders(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(service.getVendorOrdersByStatus(status.trim()));
        }
        return ResponseEntity.ok(service.getVendorOrders());
    }

    @PutMapping(value = "/api/vendor/orders/{id}/accept", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> acceptOrder(@PathVariable Long id) {
        return ResponseEntity.ok(service.acceptOrder(id));
    }

    @PutMapping(value = "/api/vendor/orders/{id}/reject", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> rejectOrder(@PathVariable Long id) {
        return ResponseEntity.ok(service.rejectOrder(id));
    }

    /**
     * Assign delivery to an order.
     * NEW body format:   { "deliveryStaffId": 5 }
     * LEGACY body format: { "partnerName": "Ravi", "partnerPhone": "9876543210" }
     */
    @PutMapping(value = "/api/vendor/orders/{id}/assign-delivery", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> assignDelivery(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.assignDelivery(id, body));
    }

    @PutMapping(value = "/api/vendor/orders/{id}/out-for-delivery", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> markOutForDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(service.markOutForDelivery(id));
    }

    @PutMapping(value = "/api/vendor/orders/{id}/delivered", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> markDelivered(@PathVariable Long id) {
        return ResponseEntity.ok(service.markDelivered(id));
    }
}