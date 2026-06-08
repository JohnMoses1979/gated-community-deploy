package com.bsgated.repository;

import com.bsgated.model.SiteVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteVisitRepository extends JpaRepository<SiteVisit, Long> {

    List<SiteVisit> findByCustomer_Id(Long customerId);

    List<SiteVisit> findByProject_Id(Long projectId);

    List<SiteVisit> findByProject_Builder_Id(Long builderId);
}
