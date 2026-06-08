package com.bsgated.security;

/**
 * AuthenticatedUser — immutable value object populated from the JWT by JwtService.
 *
 * Fields match exactly what JwtService.toAuthenticatedUser() and AuthController
 * construct:
 *   id    → "userId" claim (Long)
 *   phone → JWT subject (String)
 *   role  → "role" claim, normalised via RoleName.normalize() (String)
 *
 * unit is intentionally absent — it is not in the JWT or User entity yet.
 * VisitorPassService sets hostUnit to null; it can be wired in later by adding
 * a "unit" claim to generateToken() and a unit field here without touching any
 * other existing call site.
 */
public record AuthenticatedUser(
        Long   id,
        String phone,
        String role
) {}