package com.bsgated.controller;

import com.bsgated.dto.ProductResponse;
import com.bsgated.model.VendorStore;
import com.bsgated.service.ProductService;
import com.bsgated.service.VendorStoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Resident-facing marketplace browsing.
 * Requires authentication + approved account (no vendor-role restriction).
 *
 * GET /api/marketplace/products          — all active products
 * GET /api/marketplace/products?category=Grocery
 * GET /api/marketplace/products?search=rice
 * GET /api/marketplace/products/{id}     — single product detail
 * GET /api/marketplace/stores            — all active stores
 * GET /api/marketplace/stores/{id}       — single store detail
 * GET /api/marketplace/stores?type=marketplace
 */
@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceController {

    private final ProductService productService;
    private final VendorStoreService storeService;

    public MarketplaceController(ProductService productService, VendorStoreService storeService) {
        this.productService = productService;
        this.storeService   = storeService;
    }

    // ── Products ──────────────────────────────────────────────────────────────

    @GetMapping(value = "/products", produces = "application/json")
    public ResponseEntity<List<ProductResponse>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.getResidentVisibleProducts(category, search));
    }

    @GetMapping(value = "/products/{id}", produces = "application/json")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // ── Stores ────────────────────────────────────────────────────────────────

    @GetMapping(value = "/stores", produces = "application/json")
    public ResponseEntity<List<VendorStore>> getStores(
            @RequestParam(required = false) String type) {
        if (type != null && !type.isBlank()) {
            return ResponseEntity.ok(storeService.getActiveStoresByType(type.trim().toLowerCase()));
        }
        return ResponseEntity.ok(storeService.getAllActiveStores());
    }

    @GetMapping(value = "/stores/{id}", produces = "application/json")
    public ResponseEntity<VendorStore> getStore(@PathVariable Long id) {
        return ResponseEntity.ok(storeService.getStoreById(id));
    }
}
