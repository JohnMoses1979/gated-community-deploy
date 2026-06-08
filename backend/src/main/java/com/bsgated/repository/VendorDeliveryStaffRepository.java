package com.bsgated.repository;

import com.bsgated.model.VendorDeliveryStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorDeliveryStaffRepository extends JpaRepository<VendorDeliveryStaff, Long> {

    /**
     * All helpers (active + inactive) for a vendor
     */
    List<VendorDeliveryStaff> findByVendorIdOrderByCreatedAtDesc(Long vendorId);

    /**
     * Only active helpers — used when vendor assigns delivery
     */
    List<VendorDeliveryStaff> findByVendorIdAndActiveTrueOrderByNameAsc(Long vendorId);

    /**
     * Ownership check — vendor can only access their own staff
     */
    Optional<VendorDeliveryStaff> findByIdAndVendorId(Long id, Long vendorId);
}
