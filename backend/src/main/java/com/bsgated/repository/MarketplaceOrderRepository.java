package com.bsgated.repository;

import com.bsgated.model.MarketplaceOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceOrderRepository extends JpaRepository<MarketplaceOrder, Long> {

    /**
     * Resident: my orders, newest first
     */
    List<MarketplaceOrder> findByResidentIdOrderByPlacedAtDesc(Long residentId);

    /**
     * Vendor: orders for my store, newest first
     */
    List<MarketplaceOrder> findByVendorIdOrderByPlacedAtDesc(Long vendorId);

    /**
     * Vendor: orders for a specific store
     */
    List<MarketplaceOrder> findByStoreIdOrderByPlacedAtDesc(Long storeId);

    /**
     * Vendor: filter by status
     */
    List<MarketplaceOrder> findByVendorIdAndStatusOrderByPlacedAtDesc(Long vendorId, String status);

    /**
     * // * Find vendor orders in specific statuses (used for busy-helper check)
     * //
     */
    List<MarketplaceOrder> findByVendorIdAndStatusIn(Long vendorId, List<String> statuses);
}
