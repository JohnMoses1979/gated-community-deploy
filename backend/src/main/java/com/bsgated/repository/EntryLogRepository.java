package com.bsgated.repository;


import com.bsgated.model.EntryLog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntryLogRepository
        extends JpaRepository<EntryLog, Long> {
}