package com.bsgated.repository;

import com.bsgated.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /** All products for a vendor (vendor's own product list screen) */
    List<Product> findByVendorIdOrderByCreatedAtDesc(Long vendorId);

    /** All products for a specific store */
    List<Product> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    /**
     * Resident-facing: active products from active, non-vacation stores.
     * Joins to vendor_stores so we only return products whose store is live.
     */
    @Query("""
            SELECT p FROM Product p
            JOIN VendorStore s ON s.id = p.storeId
            WHERE p.active = true
              AND p.stock > 0
              AND s.isActive = true
              AND s.vacationMode = false
            ORDER BY p.createdAt DESC
            """)
    List<Product> findAllResidentVisibleProducts();

    /**
     * Resident-facing filtered by category.
     */
    @Query("""
            SELECT p FROM Product p
            JOIN VendorStore s ON s.id = p.storeId
            WHERE p.active = true
              AND p.stock > 0
              AND s.isActive = true
              AND s.vacationMode = false
              AND LOWER(p.category) = LOWER(:category)
            ORDER BY p.createdAt DESC
            """)
    List<Product> findResidentVisibleByCategory(@Param("category") String category);

    /**
     * Resident-facing search by name or category (case-insensitive).
     */
    @Query("""
            SELECT p FROM Product p
            JOIN VendorStore s ON s.id = p.storeId
            WHERE p.active = true
              AND p.stock > 0
              AND s.isActive = true
              AND s.vacationMode = false
              AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')))
            ORDER BY p.createdAt DESC
            """)
    List<Product> searchResidentVisible(@Param("query") String query);

    /** Find a specific product that belongs to a vendor (ownership check) */
    Optional<Product> findByIdAndVendorId(Long id, Long vendorId);
}
