package com.bsgated.service;

import com.bsgated.model.EntryLog;
import com.bsgated.repository.EntryLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * EntryLogService — records gate entry and exit events.
 *
 * Explicit constructor replaces @RequiredArgsConstructor to silence the VS Code
 * JDT false positive ("variable repository not initialized in the default
 * constructor"). Behavior is identical — Spring still injects the repository
 * via constructor injection. No logic changed.
 */
@Service
public class EntryLogService {

    private final EntryLogRepository repository;

    public EntryLogService(EntryLogRepository repository) {
        this.repository = repository;
    }

    public void addParkingLog(
            String guestName,
            String unit,
            String gate,
            String guardId,
            String guardName,
            String details) {

        EntryLog log = new EntryLog();

        log.setVisitorName(guestName);
        log.setFlatNumber(unit);
        log.setGateName(gate);
        log.setGuardId(guardId);
        log.setGuardName(guardName);
        log.setPurpose("PARKING_ENTRY: " + details);
        log.setEntryTime(LocalDateTime.now());

        repository.save(log);
    }

    public void addParkingExitLog(
            String guestName,
            String unit,
            String gate,
            String guardId,
            String guardName,
            String details) {

        EntryLog log = new EntryLog();

        log.setVisitorName(guestName);
        log.setFlatNumber(unit);
        log.setGateName(gate);
        log.setGuardId(guardId);
        log.setGuardName(guardName);
        log.setPurpose("PARKING_EXIT: " + details);
        log.setEntryTime(LocalDateTime.now());

        repository.save(log);
    }
}
