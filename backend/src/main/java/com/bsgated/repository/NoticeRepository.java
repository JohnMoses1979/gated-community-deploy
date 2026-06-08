package com.bsgated.repository;

import com.bsgated.model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    /**
     * Fetch notices visible to a given role.
     * A notice is visible when:
     *   - targetRole is "all" OR matches the caller's role
     *   - expiresAt is null (no expiry) OR still in the future
     * Results come back pinned-first, then newest-first.
     */
    @Query("""
        SELECT n FROM Notice n
        WHERE (n.targetRole = 'all' OR n.targetRole = :role)
          AND (n.expiresAt IS NULL OR n.expiresAt > :now)
        ORDER BY n.pinned DESC, n.postedAt DESC
        """)
    List<Notice> findVisibleForRole(@Param("role") String role,
                                    @Param("now")  LocalDateTime now);

    /**
     * Admin view — all notices, newest first, including expired.
     */
    List<Notice> findAllByOrderByPinnedDescPostedAtDesc();

    /**
     * Upcoming events only (non-expired events sorted by eventDate asc).
     */
    @Query("""
        SELECT n FROM Notice n
        WHERE n.type = 'event'
          AND (n.expiresAt IS NULL OR n.expiresAt > :now)
        ORDER BY n.eventDate ASC
        """)
    List<Notice> findUpcomingEvents(@Param("now") LocalDateTime now);
}