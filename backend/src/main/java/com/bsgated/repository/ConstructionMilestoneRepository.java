package com.bsgated.repository;

import com.bsgated.model.ConstructionMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConstructionMilestoneRepository extends JpaRepository<ConstructionMilestone, Long> {
    List<ConstructionMilestone> findByProject_Id(Long projectId);
}
