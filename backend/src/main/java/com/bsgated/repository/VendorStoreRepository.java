package com.bsgated.repository;

import com.bsgated.model.VendorStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorStoreRepository extends JpaRepository<VendorStore, Long> {

    /** One store per vendor — used to check if vendor already has a store */
    Optional<VendorStore> findByVendorId(Long vendorId);

    /** All stores visible to residents: active + not on vacation */
    @Query("SELECT s FROM VendorStore s WHERE s.isActive = true AND s.vacationMode = false")
    List<VendorStore> findAllActiveStores();

    /** All active stores of a given vendor type (marketplace / business) */
    @Query("SELECT s FROM VendorStore s WHERE s.isActive = true AND s.vacationMode = false AND s.vendorType = :vendorType")
    List<VendorStore> findActiveStoresByType(String vendorType);
}
