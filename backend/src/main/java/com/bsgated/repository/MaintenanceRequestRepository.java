package com.bsgated.repository;

import com.bsgated.model.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {

    List<MaintenanceRequest> findByResidentIdOrderByCreatedAtDesc(String residentId);

    List<MaintenanceRequest> findByVendorIdOrderByCreatedAtDesc(Long vendorId);

    List<MaintenanceRequest> findAllByOrderByCreatedAtDesc();

    List<MaintenanceRequest> findByStatusOrderByCreatedAtDesc(String status);

    List<MaintenanceRequest> findByStatusInOrderByCreatedAtDesc(List<String> statuses);

    Optional<MaintenanceRequest> findByGateOtp(String gateOtp);

    Optional<MaintenanceRequest> findByRazorpayOrderId(String orderId);
}