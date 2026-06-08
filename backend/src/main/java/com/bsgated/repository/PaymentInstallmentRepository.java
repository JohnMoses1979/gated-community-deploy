package com.bsgated.repository;

import com.bsgated.model.PaymentInstallment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentInstallmentRepository extends JpaRepository<PaymentInstallment, Long> {
    List<PaymentInstallment> findByBooking_Id(Long bookingId);
}
