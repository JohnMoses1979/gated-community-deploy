// src/main/java/com/bsgated/repository/EVBookingRepository.java
package com.bsgated.repository;

import com.bsgated.model.EVBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EVBookingRepository extends JpaRepository<EVBooking, Long> {

    List<EVBooking> findByResidentId(String residentId);

    Optional<EVBooking> findByOtp(String otp);

    Optional<EVBooking> findByRazorpayOrderId(String orderId);

    List<EVBooking> findBySlotAndDateAndStatusIn(
        String slot, String date, List<String> statuses
    );
}