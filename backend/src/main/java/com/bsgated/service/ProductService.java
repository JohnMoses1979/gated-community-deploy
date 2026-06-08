package com.bsgated.service;

import com.bsgated.dto.ProductRequest;
import com.bsgated.dto.ProductResponse;
import com.bsgated.exception.ApiException;
import com.bsgated.model.Product;
import com.bsgated.model.VendorStore;
import com.bsgated.repository.ProductRepository;
import com.bsgated.repository.VendorStoreRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepo;
    private final VendorStoreRepository storeRepo;
    private final AuditService auditService;

    public ProductService(ProductRepository productRepo,
                          VendorStoreRepository storeRepo,
                          AuditService auditService) {
        this.productRepo = productRepo;
        this.storeRepo   = storeRepo;
        this.auditService = auditService;
    }

    // ── Vendor: add product ───────────────────────────────────────────────────

    @Transactional
    public ProductResponse addProduct(ProductRequest req) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        VendorStore store = storeRepo.findByVendorId(actor.id())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "You must create a store before adding products. POST /api/vendor/store"));

        if (!store.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Your store is deactivated. Reactivate it first.");
        }

        Product product = new Product();
        product.setVendorId(actor.id());
        product.setStoreId(store.getId());
        applyRequest(product, req);

        Product saved = productRepo.save(product);
        auditService.record("PRODUCT_ADDED", "PRODUCT", String.valueOf(saved.getId()),
                "Product: " + saved.getName() + " | Store: " + store.getStoreName());
        return ProductResponse.from(saved, store);
    }

    // ── Vendor: list own products ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProducts() {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        VendorStore store = storeRepo.findByVendorId(actor.id()).orElse(null);
        List<Product> products = productRepo.findByVendorIdOrderByCreatedAtDesc(actor.id());

        return products.stream()
                .map(p -> ProductResponse.from(p, store))
                .collect(Collectors.toList());
    }

    // ── Vendor: update product ────────────────────────────────────────────────

    @Transactional
    public ProductResponse updateProduct(Long productId, ProductRequest req) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        Product product = productRepo.findByIdAndVendorId(productId, actor.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Product not found or does not belong to you."));

        applyRequest(product, req);
        Product saved = productRepo.save(product);

        VendorStore store = storeRepo.findByVendorId(actor.id()).orElse(null);
        auditService.record("PRODUCT_UPDATED", "PRODUCT", String.valueOf(saved.getId()), "Updated by vendor");
        return ProductResponse.from(saved, store);
    }

    // ── Vendor: delete product ────────────────────────────────────────────────

    @Transactional
    public void deleteProduct(Long productId) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        Product product = productRepo.findByIdAndVendorId(productId, actor.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Product not found or does not belong to you."));

        productRepo.delete(product);
        auditService.record("PRODUCT_DELETED", "PRODUCT", String.valueOf(productId), "Deleted by vendor");
    }

    // ── Vendor: toggle active/paused ─────────────────────────────────────────

    @Transactional
    public ProductResponse toggleActive(Long productId) {
        AuthenticatedUser actor = CurrentUser.get();
        ensureVendorRole(actor);

        Product product = productRepo.findByIdAndVendorId(productId, actor.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Product not found or does not belong to you."));

        product.setActive(!product.isActive());
        Product saved = productRepo.save(product);

        VendorStore store = storeRepo.findByVendorId(actor.id()).orElse(null);
        auditService.record("PRODUCT_TOGGLED", "PRODUCT", String.valueOf(saved.getId()),
                "Active=" + saved.isActive());
        return ProductResponse.from(saved, store);
    }

    // ── Resident-facing: browse marketplace ───────────────────────────────────

    @Transactional(readOnly = true)
    public List<ProductResponse> getResidentVisibleProducts(String category, String search) {
        List<Product> products;

        if (search != null && !search.isBlank()) {
            products = productRepo.searchResidentVisible(search.trim());
        } else if (category != null && !category.isBlank()) {
            products = productRepo.findResidentVisibleByCategory(category.trim());
        } else {
            products = productRepo.findAllResidentVisibleProducts();
        }

        // Batch-load stores to avoid N+1 queries
        Map<Long, VendorStore> storeMap = storeRepo.findAllById(
                products.stream().map(Product::getStoreId).distinct().collect(Collectors.toList())
        ).stream().collect(Collectors.toMap(VendorStore::getId, Function.identity()));

        return products.stream()
                .map(p -> ProductResponse.from(p, storeMap.get(p.getStoreId())))
                .collect(Collectors.toList());
    }

    // ── Resident: single product detail ──────────────────────────────────────

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found."));

        VendorStore store = storeRepo.findById(product.getStoreId()).orElse(null);
        return ProductResponse.from(product, store);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private void ensureVendorRole(AuthenticatedUser actor) {
        if (!"VENDOR".equalsIgnoreCase(actor.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only vendors can manage products.");
        }
    }

    private void applyRequest(Product product, ProductRequest req) {
        if (req.getName()          != null) product.setName(req.getName().trim());
        if (req.getDescription()   != null) product.setDescription(req.getDescription());
        if (req.getEmoji()         != null) product.setEmoji(req.getEmoji());
        if (req.getImageUrl()      != null) product.setImageUrl(req.getImageUrl());
        if (req.getPrice()         != null) product.setPrice(req.getPrice());
        if (req.getOriginalPrice() != null) product.setOriginalPrice(req.getOriginalPrice());
        if (req.getStock()         != null) product.setStock(req.getStock());
        if (req.getCategory()      != null) product.setCategory(req.getCategory());
        if (req.getSubcategory()   != null) product.setSubcategory(req.getSubcategory());
        if (req.getUnit()          != null) product.setUnit(req.getUnit());
        if (req.getActive()        != null) product.setActive(req.getActive());
    }
}
