package com.bsgated.repository;

import com.bsgated.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByInstallment_Id(Long installmentId);

    List<PaymentTransaction> findByInstallment_Booking_Id(Long bookingId);
}
