package com.bsgated.controller;

import com.bsgated.dto.ProductRequest;
import com.bsgated.dto.ProductResponse;
import com.bsgated.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Vendor-facing product management.
 * All endpoints require ROLE_VENDOR + approved account.
 *
 * POST   /api/vendor/products                — add product
 * GET    /api/vendor/products                — list my products
 * PUT    /api/vendor/products/{id}           — update product
 * DELETE /api/vendor/products/{id}           — delete product
 * PATCH  /api/vendor/products/{id}/toggle    — toggle active/paused
 */
@RestController
@RequestMapping("/api/vendor/products")
public class VendorProductController {

    private final ProductService service;

    public VendorProductController(ProductService service) {
        this.service = service;
    }

    @PostMapping(produces = "application/json")
    public ResponseEntity<ProductResponse> addProduct(@Valid @RequestBody ProductRequest req) {
        ProductResponse product = service.addProduct(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    @GetMapping(produces = "application/json")
    public ResponseEntity<List<ProductResponse>> getMyProducts() {
        return ResponseEntity.ok(service.getMyProducts());
    }

    @PutMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(service.updateProduct(id, req));
    }

    @DeleteMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully."));
    }

    @PatchMapping(value = "/{id}/toggle", produces = "application/json")
    public ResponseEntity<ProductResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleActive(id));
    }
}
