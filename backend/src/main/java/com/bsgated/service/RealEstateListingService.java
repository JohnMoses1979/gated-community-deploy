// // src/main/java/com/bsgated/service/RealEstateListingService.java
// package com.bsgated.service;

// import com.bsgated.model.RealEstateListing;
// import com.bsgated.model.User;
// import com.bsgated.payload.CreateRealEstateListingRequest;
// import com.bsgated.repository.RealEstateListingRepository;
// import com.bsgated.repository.UserRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Optional;

// @Service
// public class RealEstateListingService {

//     @Autowired
//     private RealEstateListingRepository listingRepo;

//     @Autowired
//     private UserRepository userRepo;

//     // ── Resident: submit new listing ──────────────────────────────────────

//     @Transactional
//     public RealEstateListing createListing(CreateRealEstateListingRequest req) {
//         // Detect first-time listing for this resident
//         boolean isFirst = !listingRepo.existsByOwnerId(req.getOwnerId());

//         RealEstateListing listing = new RealEstateListing();
//         listing.setOwnerId(req.getOwnerId());
//         listing.setOwnerName(req.getOwnerName());
//         listing.setOwnerPhone(req.getOwnerPhone());
//         listing.setUnit(req.getUnit());
//         listing.setType(req.getType());
//         listing.setTitle(req.getTitle());
//         listing.setDescription(req.getDescription());
//         listing.setPrice(req.getPrice());
//         listing.setPriceLabel(req.getPriceLabel());
//         listing.setArea(req.getArea());
//         listing.setBedrooms(req.getBedrooms());
//         listing.setBathrooms(req.getBathrooms());
//         listing.setFurnished(req.getFurnished());
//         listing.setAvailability(req.getAvailability());

//         // Convert List<String> amenities → comma-separated string for storage
//         if (req.getAmenities() != null && !req.getAmenities().isEmpty()) {
//             listing.setAmenities(String.join(",", req.getAmenities()));
//         }

//         listing.setFirstListing(isFirst);

//         // First listing always goes to PENDING_APPROVAL
//         // Subsequent listings go live immediately
//         listing.setStatus("PENDING_APPROVAL");
//         listing.setViews(0);
//         listing.setCreatedAt(LocalDateTime.now());
//         listing.setUpdatedAt(LocalDateTime.now());

//         return listingRepo.save(listing);
//     }

//     // ── Resident: get my listings ─────────────────────────────────────────

//     public List<RealEstateListing> getMyListings(String ownerId) {
//         return listingRepo.findByOwnerIdOrderByCreatedAtDesc(ownerId);
//     }

//     // ── Resident: browse active listings ─────────────────────────────────

//     public List<RealEstateListing> getActiveListings() {
//         return listingRepo.findByStatusOrderByCreatedAtDesc("ACTIVE");
//     }

//     // ── Resident: increment view count ───────────────────────────────────

//     @Transactional
//     public void incrementViews(Long id) {
//         listingRepo.findById(id).ifPresent(l -> {
//             l.setViews(l.getViews() + 1);
//             listingRepo.save(l);
//         });
//     }

//     // ── Resident: update listing status (Sold / Rented / Withdrawn) ──────

//     @Transactional
//     public Optional<RealEstateListing> updateStatus(Long id, String ownerId, String newStatus) {
//         return listingRepo.findById(id).map(listing -> {
//             // Ensure the caller is the owner
//             if (!listing.getOwnerId().equals(ownerId)) {
//                 throw new RuntimeException("Not authorised to modify this listing.");
//             }
//             listing.setStatus(newStatus);
//             listing.setUpdatedAt(LocalDateTime.now());
//             return listingRepo.save(listing);
//         });
//     }

//     // ── Admin: get all listings ───────────────────────────────────────────

//     public List<RealEstateListing> getAllListings() {
//         return listingRepo.findAllByOrderByCreatedAtDesc();
//     }

//     // Admin: filter by status (e.g. PENDING_APPROVAL)
//     public List<RealEstateListing> getListingsByStatus(String status) {
//         return listingRepo.findByStatusOrderByCreatedAtDesc(status);
//     }

//     // ── Admin: approve ────────────────────────────────────────────────────

//     @Transactional
//     public Optional<RealEstateListing> approveListing(Long id, Long adminId) {
//         String adminName = userRepo.findById(adminId)
//                 .map(User::getName)
//                 .orElse("Admin");

//         return listingRepo.findById(id).map(listing -> {
//             listing.setStatus("ACTIVE");
//             listing.setApprovedById(adminId);
//             listing.setApprovedByName(adminName);
//             listing.setApprovedAt(LocalDateTime.now());
//             listing.setUpdatedAt(LocalDateTime.now());
//             return listingRepo.save(listing);
//         });
//     }

//     // ── Admin: reject ─────────────────────────────────────────────────────

//     @Transactional
//     public Optional<RealEstateListing> rejectListing(Long id, Long adminId, String reason) {
//         String adminName = userRepo.findById(adminId)
//                 .map(User::getName)
//                 .orElse("Admin");

//         return listingRepo.findById(id).map(listing -> {
//             listing.setStatus("REJECTED");
//             listing.setApprovedById(adminId);
//             listing.setApprovedByName(adminName);
//             listing.setApprovedAt(LocalDateTime.now());
//             listing.setRejectionReason(reason);
//             listing.setUpdatedAt(LocalDateTime.now());
//             return listingRepo.save(listing);
//         });
//     }
// }
































package com.bsgated.service;

import com.bsgated.exception.ApiException;
import com.bsgated.model.RealEstateListing;
import com.bsgated.payload.CreateRealEstateListingRequest;
import com.bsgated.repository.RealEstateListingRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RealEstateListingService {

    private final RealEstateListingRepository listingRepo;
    private final UserRepository userRepo;

    public RealEstateListingService(RealEstateListingRepository listingRepo,
                                    UserRepository userRepo) {
        this.listingRepo = listingRepo;
        this.userRepo    = userRepo;
    }

    @Transactional
    public RealEstateListing createListing(CreateRealEstateListingRequest req) {
        // Owner identity from JWT — never from request body
        AuthenticatedUser currentUser = CurrentUser.get();
        String ownerId = String.valueOf(currentUser.id());

        String ownerName = userRepo.findById(currentUser.id())
                .map(u -> u.getName())
                .orElse("Resident");
        String ownerPhone = userRepo.findById(currentUser.id())
                .map(u -> u.getPhone())
                .orElse("");

        boolean isFirst = !listingRepo.existsByOwnerId(ownerId);

        RealEstateListing listing = new RealEstateListing();
        listing.setOwnerId(ownerId);
        listing.setOwnerName(ownerName);
        listing.setOwnerPhone(ownerPhone);
        listing.setUnit(req.getUnit());
        listing.setType(req.getType());
        listing.setTitle(req.getTitle());
        listing.setDescription(req.getDescription());
        listing.setPrice(req.getPrice());
        listing.setPriceLabel(req.getPriceLabel());
        listing.setArea(req.getArea());
        listing.setBedrooms(req.getBedrooms());
        listing.setBathrooms(req.getBathrooms());
        listing.setFurnished(req.getFurnished());
        listing.setAvailability(req.getAvailability());

        if (req.getAmenities() != null && !req.getAmenities().isEmpty()) {
            listing.setAmenities(String.join(",", req.getAmenities()));
        }

        listing.setFirstListing(isFirst);
        listing.setStatus("PENDING_APPROVAL");
        listing.setViews(0);
        listing.setCreatedAt(LocalDateTime.now());
        listing.setUpdatedAt(LocalDateTime.now());

        return listingRepo.save(listing);
    }

    public List<RealEstateListing> getMyListings(String ownerId) {
        return listingRepo.findByOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    public List<RealEstateListing> getActiveListings() {
        return listingRepo.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }

    @Transactional
    public void incrementViews(Long id) {
        listingRepo.findById(id).ifPresent(l -> {
            l.setViews(l.getViews() + 1);
            listingRepo.save(l);
        });
    }

    /**
     * Resident updates their own listing status.
     * ownerId is now injected from JWT — not trusted from request body.
     */
    @Transactional
    public Optional<RealEstateListing> updateStatus(Long id, String newStatus) {
        AuthenticatedUser currentUser = CurrentUser.get();
        String ownerId = String.valueOf(currentUser.id());

        return listingRepo.findById(id).map(listing -> {
            if (!listing.getOwnerId().equals(ownerId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorised to modify this listing.");
            }
            listing.setStatus(newStatus);
            listing.setUpdatedAt(LocalDateTime.now());
            return listingRepo.save(listing);
        });
    }

    public List<RealEstateListing> getAllListings() {
        return listingRepo.findAllByOrderByCreatedAtDesc();
    }

    public List<RealEstateListing> getListingsByStatus(String status) {
        return listingRepo.findByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional
    public Optional<RealEstateListing> approveListing(Long id) {
        // Admin identity from JWT
        AuthenticatedUser admin = CurrentUser.get();
        String adminName = userRepo.findById(admin.id())
                .map(u -> u.getName())
                .orElse("Admin");

        return listingRepo.findById(id).map(listing -> {
            listing.setStatus("ACTIVE");
            listing.setApprovedById(admin.id());
            listing.setApprovedByName(adminName);
            listing.setApprovedAt(LocalDateTime.now());
            listing.setUpdatedAt(LocalDateTime.now());
            return listingRepo.save(listing);
        });
    }

    @Transactional
    public Optional<RealEstateListing> rejectListing(Long id, String reason) {
        AuthenticatedUser admin = CurrentUser.get();
        String adminName = userRepo.findById(admin.id())
                .map(u -> u.getName())
                .orElse("Admin");

        return listingRepo.findById(id).map(listing -> {
            listing.setStatus("REJECTED");
            listing.setApprovedById(admin.id());
            listing.setApprovedByName(adminName);
            listing.setApprovedAt(LocalDateTime.now());
            listing.setRejectionReason(reason);
            listing.setUpdatedAt(LocalDateTime.now());
            return listingRepo.save(listing);
        });
    }
}