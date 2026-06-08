package com.bsgated.repository;

import com.bsgated.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByPhone(String phone);

    List<User> findByVerificationStatus(String status);  // keep existing

    List<User> findByRole(String role);                  // keep existing

    // ── ADD THESE THREE ───────────────────────────────────────────────────
    List<User> findByRoleIn(List<String> roles);

    List<User> findByRoleInAndVerificationStatus(List<String> roles, String status);

    List<User> findByRoleInAndVerificationStatusIn(List<String> roles, List<String> statuses);
}
