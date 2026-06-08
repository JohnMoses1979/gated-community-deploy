package com.bsgated.repository;

import com.bsgated.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
// UnitRepository.java
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {

    List<Unit> findByTower_Id(Long towerId);

    List<Unit> findByTower_IdAndStatus(Long towerId, String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM Unit u WHERE u.id = :id")
    Optional<Unit> findByIdForUpdate(@Param("id") Long id);
}
