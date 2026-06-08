// src/main/java/com/bsgated/repository/RealEstateListingRepository.java
package com.bsgated.repository;

import com.bsgated.model.RealEstateListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RealEstateListingRepository extends JpaRepository<RealEstateListing, Long> {

    // All listings by a resident (for "My Listings" tab)
    List<RealEstateListing> findByOwnerIdOrderByCreatedAtDesc(String ownerId);

    // Active listings visible to all residents (Browse tab)
    List<RealEstateListing> findByStatusOrderByCreatedAtDesc(String status);

    // All listings for admin panel
    List<RealEstateListing> findAllByOrderByCreatedAtDesc();

    // Admin filter by status
    List<RealEstateListing> findByStatusInOrderByCreatedAtDesc(List<String> statuses);

    // Check if a resident has submitted ANY listing before (to detect first listing)
    boolean existsByOwnerId(String ownerId);
}