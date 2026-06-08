package com.bsgated.repository;

import com.bsgated.model.SOSAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SOSAlertRepository extends JpaRepository<SOSAlert, Long> {
    List<SOSAlert> findByResidentIdOrderByTriggeredAtDesc(String residentId);
    List<SOSAlert> findByStatusNotOrderByTriggeredAtDesc(String status);
    List<SOSAlert> findByStatusOrderByTriggeredAtDesc(String status);
}
