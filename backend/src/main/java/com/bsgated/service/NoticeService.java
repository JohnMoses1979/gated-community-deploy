// package com.bsgated.service;

// import com.bsgated.model.Notice;
// import com.bsgated.model.User;
// import com.bsgated.payload.NoticeRequest;
// import com.bsgated.repository.NoticeRepository;
// import com.bsgated.repository.UserRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Optional;

// @Service
// public class NoticeService {

//     @Autowired
//     private NoticeRepository noticeRepository;

//     @Autowired
//     private UserRepository userRepository;

//     // ── Admin: create ──────────────────────────────────────────────────────

//     @Transactional
//     public Notice createNotice(NoticeRequest req, Long adminId) {
//         // Resolve admin name from DB (safe fallback if not found)
//         String adminName = userRepository.findById(adminId)
//                 .map(User::getName)
//                 .orElse("Admin");

//         Notice notice = new Notice();
//         notice.setTitle(req.getTitle().trim());
//         notice.setBody(req.getBody().trim());
//         notice.setType(req.getType());
//         notice.setTargetRole(req.getTargetRole());
//         notice.setPinned(req.isPinned());
//         notice.setPostedAt(LocalDateTime.now());
//         notice.setPostedById(adminId);
//         notice.setPostedByName(adminName);

//         // Expiry: 0 means never expires
//         if (req.getExpiryDays() > 0) {
//             notice.setExpiresAt(LocalDateTime.now().plusDays(req.getExpiryDays()));
//         }

//         // Event-specific fields
//         if ("event".equalsIgnoreCase(req.getType())) {
//             notice.setEventDate(req.getEventDate());
//             notice.setEventTime(req.getEventTime());
//             notice.setEventVenue(req.getEventVenue());
//             notice.setRsvpEnabled(req.isRsvpEnabled());
//         }

//         return noticeRepository.save(notice);
//     }

//     // ── Admin: full list (including expired) ──────────────────────────────

//     public List<Notice> getAllNotices() {
//         return noticeRepository.findAllByOrderByPinnedDescPostedAtDesc();
//     }

//     // ── Resident / vendor / security: filtered list ───────────────────────

//     /**
//      * Returns only notices that:
//      *  1. Target the caller's role (or "all")
//      *  2. Have not yet expired
//      *
//      * If role is null/blank we default to "resident" so the query still works.
//      */
//     public List<Notice> getNoticesForRole(String role) {
//         String effectiveRole = (role != null && !role.isBlank()) ? role.toLowerCase() : "resident";
//         return noticeRepository.findVisibleForRole(effectiveRole, LocalDateTime.now());
//     }

//     // ── Upcoming events ───────────────────────────────────────────────────

//     public List<Notice> getUpcomingEvents() {
//         return noticeRepository.findUpcomingEvents(LocalDateTime.now());
//     }

//     // ── Admin: delete ─────────────────────────────────────────────────────

//     @Transactional
//     public boolean deleteNotice(Long id) {
//         if (noticeRepository.existsById(id)) {
//             noticeRepository.deleteById(id);
//             return true;
//         }
//         return false;
//     }

//     // ── RSVP (resident taps "I'm Going") ─────────────────────────────────

//     @Transactional
//     public Optional<Notice> rsvp(Long noticeId) {
//         return noticeRepository.findById(noticeId).map(notice -> {
//             if (notice.isRsvpEnabled()) {
//                 notice.setRsvpCount(notice.getRsvpCount() + 1);
//                 noticeRepository.save(notice);
//             }
//             return notice;
//         });
//     }

//     // ── Admin: pin toggle ─────────────────────────────────────────────────

//     @Transactional
//     public Optional<Notice> togglePin(Long id) {
//         return noticeRepository.findById(id).map(notice -> {
//             notice.setPinned(!notice.isPinned());
//             return noticeRepository.save(notice);
//         });
//     }
// }





















package com.bsgated.service;

import com.bsgated.model.Notice;
import com.bsgated.payload.NoticeRequest;
import com.bsgated.repository.NoticeRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;

    public NoticeService(NoticeRepository noticeRepository, UserRepository userRepository) {
        this.noticeRepository = noticeRepository;
        this.userRepository   = userRepository;
    }

    @Transactional
    public Notice createNotice(NoticeRequest req) {
        // Admin identity from JWT — never from a query param
        AuthenticatedUser admin = CurrentUser.get();
        String adminName = userRepository.findById(admin.id())
                .map(u -> u.getName())
                .orElse("Admin");

        Notice notice = new Notice();
        notice.setTitle(req.getTitle().trim());
        notice.setBody(req.getBody().trim());
        notice.setType(req.getType());
        notice.setTargetRole(req.getTargetRole());
        notice.setPinned(req.isPinned());
        notice.setPostedAt(LocalDateTime.now());
        notice.setPostedById(admin.id());
        notice.setPostedByName(adminName);

        if (req.getExpiryDays() > 0) {
            notice.setExpiresAt(LocalDateTime.now().plusDays(req.getExpiryDays()));
        }

        if ("event".equalsIgnoreCase(req.getType())) {
            notice.setEventDate(req.getEventDate());
            notice.setEventTime(req.getEventTime());
            notice.setEventVenue(req.getEventVenue());
            notice.setRsvpEnabled(req.isRsvpEnabled());
        }

        return noticeRepository.save(notice);
    }

    public List<Notice> getAllNotices() {
        return noticeRepository.findAllByOrderByPinnedDescPostedAtDesc();
    }

    public List<Notice> getNoticesForRole(String role) {
        String effectiveRole = (role != null && !role.isBlank()) ? role.toLowerCase() : "resident";
        return noticeRepository.findVisibleForRole(effectiveRole, LocalDateTime.now());
    }

    public List<Notice> getUpcomingEvents() {
        return noticeRepository.findUpcomingEvents(LocalDateTime.now());
    }

    @Transactional
    public boolean deleteNotice(Long id) {
        if (noticeRepository.existsById(id)) {
            noticeRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public Optional<Notice> rsvp(Long noticeId) {
        return noticeRepository.findById(noticeId).map(notice -> {
            if (notice.isRsvpEnabled()) {
                notice.setRsvpCount(notice.getRsvpCount() + 1);
                noticeRepository.save(notice);
            }
            return notice;
        });
    }

    @Transactional
    public Optional<Notice> togglePin(Long id) {
        return noticeRepository.findById(id).map(notice -> {
            notice.setPinned(!notice.isPinned());
            return noticeRepository.save(notice);
        });
    }
}