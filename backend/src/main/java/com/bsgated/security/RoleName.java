package com.bsgated.security;

import java.util.Locale;

public final class RoleName {

    private RoleName() {
    }

    public static String normalize(String role) {
        if (role == null || role.isBlank()) {
            return "";
        }
        String normalized = role.trim().replace('-', '_').toUpperCase(Locale.ROOT);
        if ("GUARD".equals(normalized)) {
            return "SECURITY";
        }
        if ("SUPERADMIN".equals(normalized)) {
            return "SUPER_ADMIN";
        }
        return normalized;
    }

    public static String frontendValue(String role) {
        String normalized = normalize(role);
        if ("SUPER_ADMIN".equals(normalized)) {
            return "superadmin";
        }
        return normalized.toLowerCase(Locale.ROOT);
    }
}
