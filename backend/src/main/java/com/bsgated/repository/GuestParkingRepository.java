// // package com.bsgated.repository;


// // import org.springframework.data.jpa.repository.JpaRepository;
// // import org.springframework.data.jpa.repository.Query;
// // import org.springframework.stereotype.Repository;

// // import com.bsgated.model.GuestParking;
// // import com.bsgated.model.GuestParkingStatus;

// // import java.util.List;
// // import java.util.Optional;
 
// // @Repository
// // public interface GuestParkingRepository extends JpaRepository<GuestParking, String> {
 
// //     // All requests for a resident, newest first
// //     List<GuestParking> findByResidentIdOrderByRequestedAtDesc(String residentId);
 
// //     // All requests with a given status
// //     List<GuestParking> findByStatusOrderByRequestedAtDesc(GuestParkingStatus status);
 
// //     // All requests, newest first (admin view)
// //     List<GuestParking> findAllByOrderByRequestedAtDesc();
 
// //     // Find by OTP + active-ish status (for guard verify)
// //     Optional<GuestParking> findByParkingOtpAndStatusIn(
// //         String otp, List<GuestParkingStatus> statuses
// //     );
 
// //     // Slots currently occupied (for slot-assignment deduplication)
// //     @Query("SELECT g.slotNumber FROM GuestParking g WHERE g.status IN :statuses")
// //     List<String> findOccupiedSlots(List<GuestParkingStatus> statuses);
// // }
 

// package com.bsgated.repository;

// import com.bsgated.model.GuestParking;
// import com.bsgated.model.GuestParkingStatus;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import java.time.LocalDate;
// import java.util.List;
// import java.util.Optional;

// @Repository
// public interface GuestParkingRepository extends JpaRepository<GuestParking, String> {

//     // Resident queries
//     List<GuestParking> findByResidentIdOrderByRequestedAtDesc(String residentId);

//     // Admin queries
//     List<GuestParking> findAllByOrderByRequestedAtDesc();
//     List<GuestParking> findByStatusOrderByRequestedAtDesc(GuestParkingStatus status);

//     // Guard: OTP verification
//     Optional<GuestParking> findByParkingOtpAndStatusIn(String otp, List<GuestParkingStatus> statuses);

//     /**
//      * Slot-availability check:
//      * Is there already a PENDING/APPROVED/ACTIVE booking for this slot on this date?
//      */
//     boolean existsBySlotNumberAndExpectedDateAndStatusIn(
//         String slotNumber,
//         LocalDate expectedDate,
//         List<GuestParkingStatus> statuses
//     );

//     /**
//      * Used by the frontend "available slots for a date" query:
//      * GET /admin/all?date=2026-05-15&status=ACTIVE,APPROVED,PENDING
//      * Spring parses the status query param; this method is used if you add a
//      * custom @Query endpoint, but you can also use findByExpectedDateAndStatusIn.
//      */
//     List<GuestParking> findByExpectedDateAndStatusIn(
//         LocalDate expectedDate,
//         List<GuestParkingStatus> statuses
//     );
// }


package com.bsgated.repository;

import com.bsgated.model.GuestParking;
import com.bsgated.model.GuestParkingStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GuestParkingRepository
        extends JpaRepository<GuestParking, String> {

    List<GuestParking> findByResidentIdOrderByRequestedAtDesc(
            String residentId
    );

    List<GuestParking> findAllByOrderByRequestedAtDesc();

    List<GuestParking> findByStatusOrderByRequestedAtDesc(
            GuestParkingStatus status
    );

    Optional<GuestParking> findByParkingOtpAndStatusIn(
            String otp,
            List<GuestParkingStatus> statuses
    );

    boolean existsBySlotNumberAndExpectedDateAndStatusIn(
            String slotNumber,
            String expectedDate,
            List<GuestParkingStatus> statuses
    );

    @Query("""
        SELECT g.slotNumber
        FROM GuestParking g
        WHERE g.status IN :statuses
    """)
    List<String> findOccupiedSlots(
            List<GuestParkingStatus> statuses
    );
}
