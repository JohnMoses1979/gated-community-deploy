package com.bsgated.repository;

import com.bsgated.model.Tower;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TowerRepository extends JpaRepository<Tower, Long> {
    List<Tower> findByProject_Id(Long projectId);
}
