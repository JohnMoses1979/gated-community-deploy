// // src/main/java/com/bsgated/repository/DeliveryPassRepository.java
// package com.bsgated.repository;

// import com.bsgated.model.DeliveryPass;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import java.util.List;
// import java.util.Optional;

// @Repository
// public interface DeliveryPassRepository extends JpaRepository<DeliveryPass, Long> {

//     // Resident: all my passes, newest first
//     List<DeliveryPass> findByHostResidentIdOrderByCreatedAtDesc(String hostResidentId);

//     // Guard: all PENDING passes
//     List<DeliveryPass> findByStatusOrderByCreatedAtDesc(String status);

//     // Guard: OTP verification — only matches PENDING passes
//     Optional<DeliveryPass> findByOtpAndStatus(String otp, String status);
// }
















package com.bsgated.repository;

import com.bsgated.model.DeliveryPass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPassRepository extends JpaRepository<DeliveryPass, Long> {

    // Resident: all my passes, newest first
    List<DeliveryPass> findByHostResidentIdOrderByCreatedAtDesc(String hostResidentId);

    // Guard: all PENDING passes (includes both manual and marketplace passes)
    List<DeliveryPass> findByStatusOrderByCreatedAtDesc(String status);

    // Guard: OTP verification — only matches PENDING passes
    Optional<DeliveryPass> findByOtpAndStatus(String otp, String status);

    /**
     * Find a pass by its linked marketplace order ID.
     * Used by createFromMarketplaceOrder() to prevent duplicate pass creation
     * if vendor retries the out-for-delivery action.
     */
    Optional<DeliveryPass> findByMarketplaceOrderId(Long marketplaceOrderId);

    /**
     * Find all passes linked to marketplace orders (for guard's marketplace tab).
     * Used when guard wants to see only marketplace-originated delivery passes.
     */
    List<DeliveryPass> findByMarketplaceOrderIdIsNotNullAndStatusOrderByCreatedAtDesc(String status);
}