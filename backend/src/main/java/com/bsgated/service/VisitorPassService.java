

// package com.bsgated.service;

// import com.bsgated.exception.ApiException;
// import com.bsgated.model.VisitorPass;
// import com.bsgated.payload.VisitorPassPayloads;
// import com.bsgated.repository.VisitorPassRepository;
// import com.bsgated.security.AuthenticatedUser;
// import com.bsgated.security.CurrentUser;
// import org.springframework.http.HttpStatus;
// import org.springframework.stereotype.Service;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Optional;
// import java.util.Random;

// /**
//  * VisitorPassService — identity always from CurrentUser.get(), never from caller arguments.
//  *
//  * Ownership rules enforced here (service layer), matching the pattern in MaintenanceService:
//  *   - Resident sees only their own passes.
//  *   - Guard identity (id, name) is injected from JWT — never trusted from request body.
//  *   - Admin sees all (no ownership filter applied).
//  */
// @Service
// public class VisitorPassService {

//     private final VisitorPassRepository visitorPassRepository;
//     private final EntryLogService entryLogService;

//     public VisitorPassService(
//             VisitorPassRepository visitorPassRepository,
//             EntryLogService entryLogService) {
//         this.visitorPassRepository = visitorPassRepository;
//         this.entryLogService = entryLogService;
//     }

//     // ── RESIDENT: create visitor pass ─────────────────────────────────────────

//     /**
//      * Creates a visitor pass for the calling resident.
//      * hostResidentId and hostResidentName are extracted from JWT — NOT from the request body.
//      * The pass is auto-approved since the resident is the one initiating it.
//      */
//     public VisitorPass createVisitorPass(VisitorPassPayloads.CreatePass req) {
//         AuthenticatedUser currentUser = CurrentUser.get();

//         VisitorPass pass = new VisitorPass();
//         pass.setVisitorName(req.getVisitorName());
//         pass.setVisitorPhone(req.getVisitorPhone());
//         pass.setPurpose(req.getPurpose());
//         pass.setVehicleNumber(req.getVehicleNumber());

//         // Identity from JWT — never from request body
//         pass.setHostResidentId(currentUser.id());
//         pass.setHostResidentName(currentUser.name());
//         pass.setHostUnit(currentUser.unit()); // assumes AuthenticatedUser exposes unit()

//         String otp = generateOtp();
//         pass.setOtp(otp);
//         pass.setStatus("APPROVED"); // resident-initiated passes are auto-approved
//         pass.setApprovedAt(LocalDateTime.now());
//         pass.setCreatedAt(LocalDateTime.now());

//         // Save first to obtain generated ID, then set QR code with stable ID
//         VisitorPass saved = visitorPassRepository.save(pass);
//         saved.setQrCode(generateQrCode(saved.getId(), otp));
//         return visitorPassRepository.save(saved);
//     }

//     // ── RESIDENT: view own passes ─────────────────────────────────────────────

//     /**
//      * Returns all passes belonging to the given resident.
//      * Called from the controller after extracting residentId from JWT.
//      */
//     public List<VisitorPass> getPassesByResident(Long residentId) {
//         return visitorPassRepository.findByHostResidentIdOrderByCreatedAtDesc(residentId);
//     }

//     // ── SECURITY GUARD: view all passes ───────────────────────────────────────

//     public List<VisitorPass> getAllPasses() {
//         return visitorPassRepository.findAllByOrderByCreatedAtDesc();
//     }

//     // ── SECURITY GUARD: verify OTP ────────────────────────────────────────────

//     /**
//      * Looks up a visitor pass by OTP without mutating state.
//      * Guard reviews the returned pass before deciding to check in or deny.
//      */
//     public Optional<VisitorPass> verifyOtp(String otp) {
//         return visitorPassRepository.findByOtpAndStatus(otp, "APPROVED");
//     }

//     // ── SECURITY GUARD: check in ──────────────────────────────────────────────

//     /**
//      * Marks the visitor as CHECKED_IN and records an entry log.
//      * Guard identity (id, name) comes from JWT — NOT from request body.
//      *
//      * @param passId the visitor pass ID from the path variable
//      * @param gate   physical gate label accepted from body (e.g. "Main Gate") — not identity
//      */
//     public Optional<VisitorPass> checkIn(Long passId, String gate) {
//         AuthenticatedUser guard = CurrentUser.get();

//         return visitorPassRepository.findById(passId).map(pass -> {
//             if (!"APPROVED".equals(pass.getStatus())) {
//                 throw new ApiException(
//                         HttpStatus.BAD_REQUEST,
//                         "Pass is not in APPROVED status — current status: " + pass.getStatus());
//             }

//             pass.setStatus("CHECKED_IN");
//             pass.setCheckedInAt(LocalDateTime.now());
//             pass.setVerifiedByGuardId(guard.id());         // from JWT
//             pass.setVerifiedByGuardName(guard.name());     // from JWT
//             pass.setEntryGate(gate);

//             VisitorPass saved = visitorPassRepository.save(pass);

//             // Record entry log — guard identity from JWT
//             entryLogService.addParkingLog(
//                     pass.getVisitorName(),
//                     pass.getHostUnit(),
//                     gate,
//                     String.valueOf(guard.id()),
//                     guard.name(),
//                     "Visitor check-in — purpose: " + pass.getPurpose()
//             );

//             return saved;
//         });
//     }

//     // ── SECURITY GUARD: deny entry ────────────────────────────────────────────

//     public Optional<VisitorPass> denyEntry(Long passId) {
//         return visitorPassRepository.findById(passId).map(pass -> {
//             pass.setStatus("DENIED");
//             return visitorPassRepository.save(pass);
//         });
//     }

//     // ── SECURITY GUARD: check out ─────────────────────────────────────────────

//     /**
//      * Marks visitor as CHECKED_OUT and records exit log.
//      * Guard identity comes from JWT.
//      */
//     public Optional<VisitorPass> checkOut(Long passId) {
//         AuthenticatedUser guard = CurrentUser.get();

//         return visitorPassRepository.findById(passId).map(pass -> {
//             if (!"CHECKED_IN".equals(pass.getStatus())) {
//                 throw new ApiException(
//                         HttpStatus.BAD_REQUEST,
//                         "Pass is not in CHECKED_IN status — current status: " + pass.getStatus());
//             }

//             pass.setStatus("CHECKED_OUT");
//             pass.setCheckedOutAt(LocalDateTime.now());

//             VisitorPass saved = visitorPassRepository.save(pass);

//             // Record exit log — guard identity from JWT
//             entryLogService.addParkingExitLog(
//                     pass.getVisitorName(),
//                     pass.getHostUnit(),
//                     pass.getEntryGate() != null ? pass.getEntryGate() : "Main Gate",
//                     String.valueOf(guard.id()),
//                     guard.name(),
//                     "Visitor check-out — purpose: " + pass.getPurpose()
//             );

//             return saved;
//         });
//     }

//     // ── HELPERS ───────────────────────────────────────────────────────────────

//     private String generateOtp() {
//         return String.format("%06d", new Random().nextInt(999999));
//     }

//     private String generateQrCode(Long id, String otp) {
//         return "VISITOR|" + id + "|" + otp;
//     }
// }
















package com.bsgated.service;

import com.bsgated.exception.ApiException;
import com.bsgated.model.VisitorPass;
import com.bsgated.payload.VisitorPassPayloads;
import com.bsgated.repository.VisitorPassRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

/**
 * VisitorPassService -- identity always from CurrentUser.get(), never from caller arguments.
 *
 * AuthenticatedUser has three fields: id (Long), phone (String), role (String).
 * These match exactly what JwtService.toAuthenticatedUser() produces.
 *
 * hostResidentName is set to phone (the only identity string available in the JWT).
 * hostUnit is set to null -- unit is not in the JWT yet. Both can be upgraded later
 * by adding name/unit claims to JwtService.generateToken() without touching any
 * other existing call site.
 */
@Service
public class VisitorPassService {

    private final VisitorPassRepository visitorPassRepository;
    private final EntryLogService entryLogService;

    public VisitorPassService(
            VisitorPassRepository visitorPassRepository,
            EntryLogService entryLogService) {
        this.visitorPassRepository = visitorPassRepository;
        this.entryLogService = entryLogService;
    }

    // ======================================================================
    //  RESIDENT: create visitor pass
    // ======================================================================

    /**
     * Creates a visitor pass for the calling resident.
     * hostResidentId extracted from JWT -- NOT from the request body.
     * The pass is auto-approved since the resident is the one initiating it.
     */
    public VisitorPass createVisitorPass(VisitorPassPayloads.CreatePass req) {
        AuthenticatedUser currentUser = CurrentUser.get();

        VisitorPass pass = new VisitorPass();
        pass.setVisitorName(req.getVisitorName());
        pass.setVisitorPhone(req.getVisitorPhone());
        pass.setPurpose(req.getPurpose());
        pass.setVehicleNumber(req.getVehicleNumber());

        // Identity from JWT -- never from request body.
        // AuthenticatedUser fields: id, phone, role.
        // hostResidentName = phone (name claim not in JWT yet).
        // hostUnit = null (unit claim not in JWT yet).
        pass.setHostResidentId(currentUser.id());
        pass.setHostResidentName(currentUser.phone());
        pass.setHostUnit(null);

        String otp = generateOtp();
        pass.setOtp(otp);
        pass.setStatus("APPROVED");
        pass.setApprovedAt(LocalDateTime.now());
        pass.setCreatedAt(LocalDateTime.now());

        VisitorPass saved = visitorPassRepository.save(pass);
        saved.setQrCode(generateQrCode(saved.getId(), otp));
        return visitorPassRepository.save(saved);
    }

    // ======================================================================
    //  RESIDENT: view own passes
    // ======================================================================

    public List<VisitorPass> getPassesByResident(Long residentId) {
        return visitorPassRepository.findByHostResidentIdOrderByCreatedAtDesc(residentId);
    }

    // ======================================================================
    //  SECURITY GUARD: view all passes
    // ======================================================================

    public List<VisitorPass> getAllPasses() {
        return visitorPassRepository.findAllByOrderByCreatedAtDesc();
    }

    // ======================================================================
    //  SECURITY GUARD: verify OTP
    // ======================================================================

    /**
     * Looks up a visitor pass by OTP without mutating state.
     * Guard reviews the returned pass before deciding to check in or deny.
     */
    public Optional<VisitorPass> verifyOtp(String otp) {
        return visitorPassRepository.findByOtpAndStatus(otp, "APPROVED");
    }

    // ======================================================================
    //  SECURITY GUARD: check in
    // ======================================================================

    /**
     * Marks the visitor as CHECKED_IN and records an entry log.
     * Guard identity comes from JWT -- NOT from request body.
     * verifiedByGuardId set from JWT id.
     * verifiedByGuardName set from JWT phone (name not in JWT yet).
     *
     * @param passId  visitor pass ID from path variable
     * @param gate    physical gate label from body (e.g. "Main Gate") -- not identity
     */
    public Optional<VisitorPass> checkIn(Long passId, String gate) {
        AuthenticatedUser guard = CurrentUser.get();

        return visitorPassRepository.findById(passId).map(pass -> {
            if (!"APPROVED".equals(pass.getStatus())) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "Pass is not in APPROVED status -- current status: " + pass.getStatus());
            }

            pass.setStatus("CHECKED_IN");
            pass.setCheckedInAt(LocalDateTime.now());
            pass.setVerifiedByGuardId(guard.id());       // from JWT
            pass.setVerifiedByGuardName(guard.phone());  // phone used until name claim added to JWT
            pass.setEntryGate(gate);

            VisitorPass saved = visitorPassRepository.save(pass);

            // Record entry log -- guard identity from JWT
            entryLogService.addParkingLog(
                    pass.getVisitorName(),
                    pass.getHostUnit(),
                    gate,
                    String.valueOf(guard.id()),
                    guard.phone(),
                    "Visitor check-in -- purpose: " + pass.getPurpose()
            );

            return saved;
        });
    }

    // ======================================================================
    //  SECURITY GUARD: deny entry
    // ======================================================================

    public Optional<VisitorPass> denyEntry(Long passId) {
        return visitorPassRepository.findById(passId).map(pass -> {
            pass.setStatus("DENIED");
            return visitorPassRepository.save(pass);
        });
    }

    // ======================================================================
    //  SECURITY GUARD: check out
    // ======================================================================

    /**
     * Marks visitor as CHECKED_OUT and records exit log.
     * Guard identity comes from JWT.
     */
    public Optional<VisitorPass> checkOut(Long passId) {
        AuthenticatedUser guard = CurrentUser.get();

        return visitorPassRepository.findById(passId).map(pass -> {
            if (!"CHECKED_IN".equals(pass.getStatus())) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "Pass is not in CHECKED_IN status -- current status: " + pass.getStatus());
            }

            pass.setStatus("CHECKED_OUT");
            pass.setCheckedOutAt(LocalDateTime.now());

            VisitorPass saved = visitorPassRepository.save(pass);

            // Record exit log -- guard identity from JWT
            entryLogService.addParkingExitLog(
                    pass.getVisitorName(),
                    pass.getHostUnit(),
                    pass.getEntryGate() != null ? pass.getEntryGate() : "Main Gate",
                    String.valueOf(guard.id()),
                    guard.phone(),
                    "Visitor check-out -- purpose: " + pass.getPurpose()
            );

            return saved;
        });
    }

    // ======================================================================
    //  HELPERS
    // ======================================================================

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private String generateQrCode(Long id, String otp) {
        return "VISITOR|" + id + "|" + otp;
    }
}