package com.bsgated.repository;

import com.bsgated.model.UnitBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnitBookingRepository extends JpaRepository<UnitBooking, Long> {
    List<UnitBooking> findByCustomer_Id(Long customerId);
    List<UnitBooking> findByUnit_Id(Long unitId);
    List<UnitBooking> findByUnit_Tower_Project_Builder_Id(Long builderId);
}
