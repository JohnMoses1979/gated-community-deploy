package com.bsgated.repository;

import com.bsgated.model.ConstructionUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConstructionUpdateRepository extends JpaRepository<ConstructionUpdate, Long> {
    List<ConstructionUpdate> findByMilestone_Id(Long milestoneId);
}
