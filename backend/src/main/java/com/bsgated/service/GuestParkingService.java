// package com.bsgated.service;
// import com.bsgated.dto.GuestParkingApprovalDto;
// import com.bsgated.dto.GuestParkingOtpVerifyDto;
// import com.bsgated.dto.GuestParkingRequestDto;
// import com.bsgated.dto.GuestParkingResponseDto;
// import com.bsgated.model.GuestParking;
// import com.bsgated.model.GuestParkingStatus;
// import com.bsgated.repository.GuestParkingRepository;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.http.HttpStatus;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import org.springframework.web.server.ResponseStatusException;
// import java.security.SecureRandom;
// import java.time.LocalDateTime;
// import java.util.ArrayList;
// import java.util.HashSet;
// import java.util.List;
// import java.util.Set;
// import java.util.stream.Collectors;
// @Service
// @RequiredArgsConstructor
// @Slf4j
// @Transactional
// public class GuestParkingService {
//     private static final int TOTAL_SLOTS = 15;
//     private final GuestParkingRepository repo;
//     private final EntryLogService entryLogService;
//     private final SecureRandom random =
//             new SecureRandom();
//     // ───────────────── CREATE REQUEST ─────────────────
//     public GuestParkingResponseDto createRequest(
//             GuestParkingRequestDto dto
//     ) {
//         String slot = dto.getSlotNumber() != null && !dto.getSlotNumber().isBlank()
//                 ? dto.getSlotNumber().trim().toUpperCase()
//                 : assignFreeSlot();
//         if (!slot.matches("^A([1-9]|1[0-5])$")) {
//             throw new ResponseStatusException(
//                     HttpStatus.BAD_REQUEST,
//                     "Invalid parking slot"
//             );
//         }
//         boolean slotTaken = repo.existsBySlotNumberAndExpectedDateAndStatusIn(
//                 slot,
//                 dto.getExpectedDate(),
//                 List.of(
//                         GuestParkingStatus.PENDING,
//                         GuestParkingStatus.APPROVED,
//                         GuestParkingStatus.ACTIVE
//                 )
//         );
//         if (slotTaken) {
//             throw new ResponseStatusException(
//                     HttpStatus.CONFLICT,
//                     "Selected parking slot is already booked for this date"
//             );
//         }
//         GuestParking entity = new GuestParking();
//         entity.setResidentId(dto.getResidentId());
//         entity.setResidentName(dto.getResidentName());
//         entity.setUnit(dto.getUnit());
//         entity.setGuestName(dto.getGuestName());
//         entity.setGuestPhone(dto.getGuestPhone());
//         entity.setVehicleNumber(
//                 dto.getVehicleNumber()
//                         .toUpperCase()
//                         .replace(" ", "")
//         );
//         entity.setVehicleType(dto.getVehicleType());
//         entity.setExpectedDate(
//                 dto.getExpectedDate()
//         );
//         entity.setDurationDays(
//                 dto.getDurationDays() != null
//                         ? dto.getDurationDays()
//                         : 1
//         );
//         entity.setSlotNumber(slot);
//         entity.setParkingOtp(
//                 dto.getParkingOtp() != null && !dto.getParkingOtp().isBlank()
//                         ? dto.getParkingOtp()
//                         : generateOtp()
//         );
//         entity.setStatus(
//                 GuestParkingStatus.PENDING
//         );
//         entity.setRequestedAt(
//                 LocalDateTime.now()
//         );
//         GuestParking saved =
//                 repo.save(entity);
//         log.info(
//                 "Guest parking created: id={}, slot={}",
//                 saved.getId(),
//                 saved.getSlotNumber()
//         );
//         return toDto(saved);
//     }
//     // ───────────────── GET RESIDENT REQUESTS ─────────────────
//     @Transactional(readOnly = true)
//     public List<GuestParkingResponseDto>
//     getByResident(String residentId) {
//         return repo
//                 .findByResidentIdOrderByRequestedAtDesc(
//                         residentId
//                 )
//                 .stream()
//                 .map(this::toDto)
//                 .collect(Collectors.toList());
//     }
//     // ───────────────── GET BY ID ─────────────────
//     @Transactional(readOnly = true)
//     public GuestParkingResponseDto getById(
//             String id
//     ) {
//         return toDto(findOrThrow(id));
//     }
//     // ───────────────── GET ALL ─────────────────
//     @Transactional(readOnly = true)
//     public List<GuestParkingResponseDto>
//     getAll(GuestParkingStatus status) {
//         List<GuestParking> list;
//         if (status == null) {
//             list =
//                     repo.findAllByOrderByRequestedAtDesc();
//         } else {
//             list =
//                     repo.findByStatusOrderByRequestedAtDesc(
//                             status
//                     );
//         }
//         return list.stream()
//                 .map(this::toDto)
//                 .collect(Collectors.toList());
//     }
//     // ───────────────── APPROVE ─────────────────
//     public GuestParkingResponseDto approve(
//             String id,
//             GuestParkingApprovalDto dto
//     ) {
//         GuestParking p = findOrThrow(id);
//         if (p.getStatus()
//                 != GuestParkingStatus.PENDING) {
//             throw new ResponseStatusException(
//                     HttpStatus.BAD_REQUEST,
//                     "Only pending requests can be approved"
//             );
//         }
//         if (dto != null
//                 && dto.getOverrideSlot() != null
//                 && !dto.getOverrideSlot().isBlank()) {
//             p.setSlotNumber(
//                     dto.getOverrideSlot()
//             );
//         }
//         p.setStatus(
//                 GuestParkingStatus.APPROVED
//         );
//         p.setApprovedAt(
//                 LocalDateTime.now()
//         );
//         return toDto(repo.save(p));
//     }
//     // ───────────────── REJECT ─────────────────
//     public GuestParkingResponseDto reject(
//             String id
//     ) {
//         GuestParking p = findOrThrow(id);
//         if (p.getStatus()
//                 != GuestParkingStatus.PENDING) {
//             throw new ResponseStatusException(
//                     HttpStatus.BAD_REQUEST,
//                     "Only pending requests can be rejected"
//             );
//         }
//         p.setStatus(
//                 GuestParkingStatus.REJECTED
//         );
//         p.setRejectedAt(
//                 LocalDateTime.now()
//         );
//         return toDto(repo.save(p));
//     }
//     // ───────────────── VERIFY OTP ─────────────────
// //     public GuestParkingResponseDto
// //     verifyOtpAndActivate(
// //             GuestParkingOtpVerifyDto dto
// //     ) {
// //         GuestParking p =
// //                 repo.findByParkingOtpAndStatusIn(
// //                                 dto.getOtp(),
// //                                 List.of(
// //                                         GuestParkingStatus.PENDING,
// //                                         GuestParkingStatus.APPROVED
// //                                 )
// //                         )
// //                         .orElseThrow(() ->
// //                                 new ResponseStatusException(
// //                                         HttpStatus.NOT_FOUND,
// //                                         "Invalid OTP"
// //                                 )
// //                         );
// //         LocalDateTime now =
// //                 LocalDateTime.now();
// //         p.setStatus(
// //                 GuestParkingStatus.ACTIVE
// //         );
// //         p.setStartTime(now);
// //         int days =
// //                 p.getDurationDays() != null
// //                         ? p.getDurationDays()
// //                         : 1;
// //         p.setEndTime(
// //                 now.plusDays(days)
// //         );
// //         p.setVerifiedByGuardId(
// //                 dto.getGuardId()
// //         );
// //         p.setVerifiedByGuardName(
// //                 dto.getGuardName()
// //         );
// //         p.setEntryGate(
// //                 dto.getGate() != null
// //                         ? dto.getGate()
// //                         : "Main Gate"
// //         );
// //         GuestParking saved =
// //                 repo.save(p);
// //         entryLogService.addParkingLog(
// //                 saved.getGuestName(),
// //                 saved.getUnit(),
// //                 saved.getEntryGate(),
// //                 dto.getGuardId(),
// //                 dto.getGuardName(),
// //                 saved.getVehicleNumber()
// //                         + " · Slot P-"
// //                         + saved.getSlotNumber()
// //         );
// //         log.info(
// //                 "Parking activated: guest={}, slot={}",
// //                 saved.getGuestName(),
// //                 saved.getSlotNumber()
// //         );
// //         return toDto(saved);
// //     }
// //     // ───────────────── EXPIRE ─────────────────
// //     public GuestParkingResponseDto
// //     markExpired(String id) {
// //         GuestParking p = findOrThrow(id);
// //         p.setStatus(
// //                 GuestParkingStatus.EXPIRED
// //         );
// //         p.setExitTime(
// //                 LocalDateTime.now()
// //         );
// //         return toDto(repo.save(p));
// //     }
// public GuestParkingResponseDto verifyOtpAndActivate(GuestParkingOtpVerifyDto dto) {
//     GuestParking p = repo.findByParkingOtpAndStatusIn(
//                     dto.getOtp(),
//                     // ❌ REMOVED PENDING — only APPROVED can be activated
//                     List.of(GuestParkingStatus.APPROVED)
//             )
//             .orElseThrow(() -> new ResponseStatusException(
//                     HttpStatus.NOT_FOUND,
//                     "Invalid OTP or parking not yet approved"
//             ));
//     // rest of the method stays exactly the same ↓
//     LocalDateTime now = LocalDateTime.now();
//     p.setStatus(GuestParkingStatus.ACTIVE);
//     p.setStartTime(now);
//     int days = p.getDurationDays() != null ? p.getDurationDays() : 1;
//     p.setEndTime(now.plusDays(days));
//     p.setVerifiedByGuardId(dto.getGuardId());
//     p.setVerifiedByGuardName(dto.getGuardName());
//     p.setEntryGate(dto.getGate() != null ? dto.getGate() : "Main Gate");
//     GuestParking saved = repo.save(p);
//     entryLogService.addParkingLog(
//             saved.getGuestName(),
//             saved.getUnit(),
//             saved.getEntryGate(),
//             dto.getGuardId(),
//             dto.getGuardName(),
//             saved.getVehicleNumber() + " - Slot " + saved.getSlotNumber()
//     );
//     log.info("Parking activated: guest={}, slot={}", saved.getGuestName(), saved.getSlotNumber());
//     return toDto(saved);
// }
// public GuestParkingResponseDto markExpired(String id) {
//     GuestParking p = findOrThrow(id);
//     p.setStatus(GuestParkingStatus.EXPIRED);
//     p.setExitTime(LocalDateTime.now());
//     GuestParking saved = repo.save(p);
//     entryLogService.addParkingExitLog(
//             saved.getGuestName(),
//             saved.getUnit(),
//             saved.getEntryGate() != null ? saved.getEntryGate() : "Main Gate",
//             saved.getVerifiedByGuardId(),
//             saved.getVerifiedByGuardName(),
//             saved.getVehicleNumber() + " - Slot " + saved.getSlotNumber()
//     );
//     log.info("Parking expired: guest={}, slot={}", saved.getGuestName(), saved.getSlotNumber());
//     return toDto(saved);
// }
//     // ───────────────── HELPERS ─────────────────
//     private GuestParking findOrThrow(
//             String id
//     ) {
//         return repo.findById(id)
//                 .orElseThrow(() ->
//                         new ResponseStatusException(
//                                 HttpStatus.NOT_FOUND,
//                                 "Parking request not found"
//                         )
//                 );
//     }
//     private String generateOtp() {
//         return String.format(
//                 "%06d",
//                 random.nextInt(1000000)
//         );
//     }
//     private String assignFreeSlot() {
//         List<String> occupied =
//                 repo.findOccupiedSlots(
//                         List.of(
//                                 GuestParkingStatus.PENDING,
//                                 GuestParkingStatus.APPROVED,
//                                 GuestParkingStatus.ACTIVE
//                         )
//                 );
//         Set<String> taken =
//                 new HashSet<>(occupied);
//         List<String> free =
//                 new ArrayList<>();
//         for (int i = 1; i <= TOTAL_SLOTS; i++) {
//             String slot = "A" + i;
//             if (!taken.contains(slot)) {
//                 free.add(slot);
//             }
//         }
//         if (free.isEmpty()) {
//             throw new ResponseStatusException(
//                     HttpStatus.CONFLICT,
//                     "All parking slots occupied"
//             );
//         }
//         return free.get(
//                 random.nextInt(free.size())
//         );
//     }
//     // ───────────────── DTO MAPPER ─────────────────
//     private GuestParkingResponseDto toDto(
//             GuestParking p
//     ) {
//         return GuestParkingResponseDto.builder()
//                 .id(p.getId())
//                 .residentId(
//                         p.getResidentId()
//                 )
//                 .residentName(
//                         p.getResidentName()
//                 )
//                 .unit(p.getUnit())
//                 .guestName(
//                         p.getGuestName()
//                 )
//                 .guestPhone(
//                         p.getGuestPhone()
//                 )
//                 .vehicleNumber(
//                         p.getVehicleNumber()
//                 )
//                 .vehicleType(
//                         p.getVehicleType()
//                 )
//                 .expectedDate(
//                         p.getExpectedDate()
//                 )
//                 .durationDays(
//                         p.getDurationDays()
//                 )
//                 .slotNumber(
//                         p.getSlotNumber()
//                 )
//                 .parkingOtp(
//                         p.getParkingOtp()
//                 )
//                 .status(
//                         p.getStatus()
//                 )
//                 .requestedAt(
//                         p.getRequestedAt()
//                 )
//                 .approvedAt(
//                         p.getApprovedAt()
//                 )
//                 .rejectedAt(
//                         p.getRejectedAt()
//                 )
//                 .startTime(
//                         p.getStartTime()
//                 )
//                 .endTime(
//                         p.getEndTime()
//                 )
//                 .exitTime(
//                         p.getExitTime()
//                 )
//                 .entryGate(
//                         p.getEntryGate()
//                 )
//                 .verifiedByGuardName(
//                         p.getVerifiedByGuardName()
//                 )
//                 .build();
//     }
// }
package com.bsgated.service;

import com.bsgated.dto.GuestParkingApprovalDto;
import com.bsgated.dto.GuestParkingOtpVerifyDto;
import com.bsgated.dto.GuestParkingRequestDto;
import com.bsgated.dto.GuestParkingResponseDto;
import com.bsgated.exception.ApiException;
import com.bsgated.model.GuestParking;
import com.bsgated.model.GuestParkingStatus;
import com.bsgated.model.User;
import com.bsgated.repository.GuestParkingRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * GuestParkingService — fully secured.
 *
 * Identity always from CurrentUser.get() — never from DTO fields. Ownership
 * validated at every mutation: - Resident operations check residentId matches
 * JWT id. - Guard operations inject guardId/guardName from JWT — never from
 * body. - Admin operations enforced at SecurityConfig + controller layer.
 *
 * All errors throw ApiException — matches GlobalExceptionHandler pattern.
 */
@Service
@Transactional
public class GuestParkingService {

    private static final Logger log = LoggerFactory.getLogger(GuestParkingService.class);
    private static final int TOTAL_SLOTS = 15;

    private final GuestParkingRepository repo;
    private final UserRepository userRepo;
    private final EntryLogService entryLogService;
    private final SecureRandom random = new SecureRandom();

    public GuestParkingService(
            GuestParkingRepository repo,
            UserRepository userRepo,
            EntryLogService entryLogService) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.entryLogService = entryLogService;
    }

    // ══════════════════════════════════════════════════════════════════
    //  RESIDENT: create request
    // ══════════════════════════════════════════════════════════════════
    /**
     * Resident submits a new guest parking request. residentId and residentName
     * are extracted from JWT — never from DTO.
     */
    public GuestParkingResponseDto createRequest(GuestParkingRequestDto dto) {
        // Identity from JWT — always trusted source
        AuthenticatedUser currentUser = CurrentUser.get();
        String residentId = String.valueOf(currentUser.id());

        User resident = userRepo.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resident account not found."));

        // Determine slot: use resident-requested slot or auto-assign
        String slot;
        if (dto.getSlotNumber() != null && !dto.getSlotNumber().isBlank()) {
            slot = dto.getSlotNumber().trim().toUpperCase();
            if (!slot.matches("^A([1-9]|1[0-5])$")) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Invalid parking slot. Valid slots are A1 through A15.");
            }
        } else {
            slot = assignFreeSlot();
        }

        // Slot availability check
        boolean slotTaken = repo.existsBySlotNumberAndExpectedDateAndStatusIn(
                slot,
                dto.getExpectedDate(),
                List.of(GuestParkingStatus.PENDING, GuestParkingStatus.APPROVED, GuestParkingStatus.ACTIVE)
        );
        if (slotTaken) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Selected parking slot is already booked for this date.");
        }

        GuestParking entity = new GuestParking();

        // Identity from JWT — never from DTO
        entity.setResidentId(residentId);
        entity.setResidentName(resident.getName());

        // Data fields from DTO (not identity)
        entity.setUnit(dto.getUnit());
        entity.setGuestName(dto.getGuestName());
        entity.setGuestPhone(dto.getGuestPhone());
        entity.setVehicleNumber(
                dto.getVehicleNumber().toUpperCase().replace(" ", ""));
        entity.setVehicleType(dto.getVehicleType() != null ? dto.getVehicleType() : "Car");
        entity.setExpectedDate(dto.getExpectedDate());
        entity.setDurationDays(dto.getDurationDays() != null ? dto.getDurationDays() : 1);
        entity.setSlotNumber(slot);
        entity.setParkingOtp(generateOtp());
        entity.setStatus(GuestParkingStatus.PENDING);
        entity.setRequestedAt(LocalDateTime.now());

        GuestParking saved = repo.save(entity);
        log.info("Guest parking created: id={}, residentId={}, slot={}", saved.getId(), residentId, saved.getSlotNumber());
        return toDto(saved);
    }

    // ══════════════════════════════════════════════════════════════════
    //  RESIDENT: read own requests
    // ══════════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<GuestParkingResponseDto> getByResident(String residentId) {
        return repo.findByResidentIdOrderByRequestedAtDesc(residentId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GuestParkingResponseDto getById(String id) {
        GuestParking parking = findOrThrow(id);

        // Ownership check: resident can only see their own; admin/guard can see all.
        AuthenticatedUser currentUser = CurrentUser.get();
        String role = currentUser.role();

        if ("RESIDENT".equals(role)) {
            if (!parking.getResidentId().equals(String.valueOf(currentUser.id()))) {
                throw new ApiException(HttpStatus.FORBIDDEN,
                        "You can only view your own parking requests.");
            }
        }
        // ADMIN, SUPER_ADMIN, SECURITY can view any request

        return toDto(parking);
    }

    // ══════════════════════════════════════════════════════════════════
    //  ADMIN: read all requests
    // ══════════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<GuestParkingResponseDto> getAll(GuestParkingStatus status) {
        List<GuestParking> list = (status == null)
                ? repo.findAllByOrderByRequestedAtDesc()
                : repo.findByStatusOrderByRequestedAtDesc(status);

        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════════════
    //  ADMIN: approve request
    // ══════════════════════════════════════════════════════════════════
    public GuestParkingResponseDto approve(String id, GuestParkingApprovalDto dto) {
        GuestParking p = findOrThrow(id);

        if (p.getStatus() != GuestParkingStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Only pending requests can be approved.");
        }

        // Admin may optionally override the slot
        if (dto != null && dto.getOverrideSlot() != null && !dto.getOverrideSlot().isBlank()) {
            p.setSlotNumber(dto.getOverrideSlot().trim().toUpperCase());
        }

        p.setStatus(GuestParkingStatus.APPROVED);
        p.setApprovedAt(LocalDateTime.now());

        return toDto(repo.save(p));
    }

    // ══════════════════════════════════════════════════════════════════
    //  ADMIN: reject request
    // ══════════════════════════════════════════════════════════════════
    public GuestParkingResponseDto reject(String id) {
        GuestParking p = findOrThrow(id);

        if (p.getStatus() != GuestParkingStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Only pending requests can be rejected.");
        }

        p.setStatus(GuestParkingStatus.REJECTED);
        p.setRejectedAt(LocalDateTime.now());

        return toDto(repo.save(p));
    }

    // ══════════════════════════════════════════════════════════════════
    //  GUARD: verify OTP → mark ACTIVE
    // ══════════════════════════════════════════════════════════════════
    /**
     * Guard verifies the parking OTP and marks parking ACTIVE. Guard identity
     * (id) extracted from JWT — never from request body. Only APPROVED requests
     * can be activated (not PENDING).
     */
    public GuestParkingResponseDto verifyOtpAndActivate(GuestParkingOtpVerifyDto dto) {
        // Guard identity from JWT — trusted source
        AuthenticatedUser guard = CurrentUser.get();

        GuestParking p = repo.findByParkingOtpAndStatusIn(
                dto.getOtp(),
                List.of(GuestParkingStatus.APPROVED))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                "Invalid OTP or parking not yet approved."));

        LocalDateTime now = LocalDateTime.now();
        p.setStatus(GuestParkingStatus.ACTIVE);
        p.setStartTime(now);

        int days = p.getDurationDays() != null ? p.getDurationDays() : 1;
        p.setEndTime(now.plusDays(days));

        // Guard identity from JWT — never from DTO body
        p.setVerifiedByGuardId(String.valueOf(guard.id()));
        p.setVerifiedByGuardName(guard.phone()); // swap for name claim when added to JWT

        // Physical gate label from body — not identity
        String gate = (dto.getGate() != null && !dto.getGate().isBlank())
                ? dto.getGate()
                : "Main Gate";
        p.setEntryGate(gate);

        GuestParking saved = repo.save(p);

        // Record entry log — integrates with existing EntryLogService
        entryLogService.addParkingLog(
                saved.getGuestName(),
                saved.getUnit(),
                saved.getEntryGate(),
                String.valueOf(guard.id()),
                guard.phone(),
                saved.getVehicleNumber() + " - Slot " + saved.getSlotNumber()
        );

        log.info("Parking activated: id={}, guest={}, slot={}, guard={}",
                saved.getId(), saved.getGuestName(), saved.getSlotNumber(), guard.id());

        return toDto(saved);
    }

    // ══════════════════════════════════════════════════════════════════
    //  GUARD: mark EXITED
    // ══════════════════════════════════════════════════════════════════
    /**
     * Guard marks an ACTIVE/OVERSTAY parking session as EXITED. Guard identity from JWT
     * — no guardId body param needed.
     */
    public GuestParkingResponseDto markExpired(String id) {
        AuthenticatedUser guard = CurrentUser.get();

        GuestParking p = findOrThrow(id);

        if (p.getStatus() == GuestParkingStatus.EXITED || p.getStatus() == GuestParkingStatus.EXPIRED) {
            return toDto(p);
        }

        if (p.getStatus() != GuestParkingStatus.ACTIVE && p.getStatus() != GuestParkingStatus.OVERSTAY) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Only active or overstayed parking sessions can be marked as exited.");
        }

        p.setStatus(GuestParkingStatus.EXPIRED);
        p.setExitTime(LocalDateTime.now());

        GuestParking saved = repo.save(p);

        // Record exit log — integrates with existing EntryLogService
        entryLogService.addParkingExitLog(
                saved.getGuestName(),
                saved.getUnit(),
                saved.getEntryGate() != null ? saved.getEntryGate() : "Main Gate",
                String.valueOf(guard.id()),
                guard.phone(),
                saved.getVehicleNumber() + " - Slot " + saved.getSlotNumber()
        );

        log.info("Parking exited: id={}, guest={}, slot={}, guard={}",
                saved.getId(), saved.getGuestName(), saved.getSlotNumber(), guard.id());

        return toDto(saved);
    }

    // ══════════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════════════════════════════════
    private GuestParking findOrThrow(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                "Parking request not found: " + id));
    }

    private String generateOtp() {
        return String.format("%06d", random.nextInt(1000000));
    }

    private String assignFreeSlot() {
        List<String> occupied = repo.findOccupiedSlots(
                List.of(GuestParkingStatus.PENDING, GuestParkingStatus.APPROVED, GuestParkingStatus.ACTIVE)
        );

        Set<String> taken = new HashSet<>(occupied);
        List<String> free = new ArrayList<>();

        for (int i = 1; i <= TOTAL_SLOTS; i++) {
            String slot = "A" + i;
            if (!taken.contains(slot)) {
                free.add(slot);
            }
        }

        if (free.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "All parking slots are currently occupied. Please try a different date.");
        }

        return free.get(random.nextInt(free.size()));
    }

    private GuestParkingResponseDto toDto(GuestParking p) {

        GuestParkingResponseDto dto = new GuestParkingResponseDto(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

        dto.setId(p.getId());
        dto.setResidentId(p.getResidentId());
        dto.setResidentName(p.getResidentName());
        dto.setUnit(p.getUnit());
        dto.setGuestName(p.getGuestName());
        dto.setGuestPhone(p.getGuestPhone());
        dto.setVehicleNumber(p.getVehicleNumber());
        dto.setVehicleType(p.getVehicleType());
        dto.setExpectedDate(p.getExpectedDate());
        dto.setDurationDays(p.getDurationDays());
        dto.setSlotNumber(p.getSlotNumber());
        dto.setParkingOtp(p.getParkingOtp());
        dto.setStatus(p.getStatus() == GuestParkingStatus.EXPIRED
                ? GuestParkingStatus.EXITED
                : p.getStatus());
        dto.setRequestedAt(p.getRequestedAt());
        dto.setApprovedAt(p.getApprovedAt());
        dto.setRejectedAt(p.getRejectedAt());
        dto.setStartTime(p.getStartTime());
        dto.setEndTime(p.getEndTime());
        dto.setExitTime(p.getExitTime());
        dto.setEntryGate(p.getEntryGate());
        dto.setVerifiedByGuardName(p.getVerifiedByGuardName());

        return dto;
    }
}
