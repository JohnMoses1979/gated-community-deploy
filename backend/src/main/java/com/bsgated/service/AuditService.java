package com.bsgated.service;

import com.bsgated.model.AuditLog;
import com.bsgated.repository.AuditLogRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void record(String action, String targetType, String targetId, String details) {
        AuthenticatedUser actor;
        try {
            actor = CurrentUser.get();
        } catch (Exception ex) {
            actor = null;
        }
        record(actor, action, targetType, targetId, details);
    }

    public void record(AuthenticatedUser actor, String action, String targetType, String targetId, String details) {
        AuditLog auditLog = new AuditLog();
        if (actor != null) {
            auditLog.setActorUserId(actor.id());
            auditLog.setActorRole(actor.role());
        }
        auditLog.setAction(action);
        auditLog.setTargetType(targetType);
        auditLog.setTargetId(targetId);
        auditLog.setDetails(details);
        repository.save(auditLog);
        log.info("AUDIT action={} actor={} targetType={} targetId={}", action, actor, targetType, targetId);
    }
}
