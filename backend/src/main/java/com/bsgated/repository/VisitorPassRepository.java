package com.bsgated.repository;

import com.bsgated.model.VisitorPass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VisitorPassRepository extends JpaRepository<VisitorPass, Long> {

    List<VisitorPass> findByHostResidentIdOrderByCreatedAtDesc(Long hostResidentId);

    Optional<VisitorPass> findByOtpAndStatus(String otp, String status);

    List<VisitorPass> findAllByOrderByCreatedAtDesc();
}
