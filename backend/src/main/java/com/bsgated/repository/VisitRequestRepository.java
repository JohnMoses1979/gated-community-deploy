package com.bsgated.repository;

import com.bsgated.model.VisitRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisitRequestRepository extends JpaRepository<VisitRequest, Long> {
    List<VisitRequest> findByBuilderId(Long builderId);
    List<VisitRequest> findByCustomerId(Long customerId);
}
