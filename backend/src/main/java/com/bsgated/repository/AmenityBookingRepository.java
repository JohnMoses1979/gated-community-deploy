// src/main/java/com/bsgated/repository/AmenityBookingRepository.java
package com.bsgated.repository;

import com.bsgated.model.AmenityBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmenityBookingRepository extends JpaRepository<AmenityBooking, Long> {

    List<AmenityBooking> findByResidentId(String residentId);

    Optional<AmenityBooking> findByOtp(String otp);

    Optional<AmenityBooking> findByRazorpayOrderId(String orderId);

    List<AmenityBooking> findByAmenityIdAndDateAndSlotAndStatusIn(
        String amenityId, String date, String slot, List<String> statuses
    );

    List<AmenityBooking> findByResidentIdAndAmenityIdAndDateAndStatusIn(
        String residentId, String amenityId, String date, List<String> statuses
    );
}