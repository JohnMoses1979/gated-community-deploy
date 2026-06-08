package com.bsgated.config;

import com.bsgated.security.ApprovalRequiredFilter;
import com.bsgated.security.JwtAuthenticationFilter;
import com.bsgated.security.RestAccessDeniedHandler;
import com.bsgated.security.RestAuthenticationEntryPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * SecurityConfig — central HTTP security policy.
 *
 * ── UNCHANGED COMPONENTS ─────────────────────────────────────────────────────
 * JwtAuthenticationFilter, JwtService, CurrentUser, AuthenticatedUser,
 * RoleName, ApprovalRequiredFilter, RestAuthenticationEntryPoint,
 * RestAccessDeniedHandler are ALL untouched. Only the authorizeHttpRequests
 * rule set has been extended.
 *
 * ── BUILDER MODULE ADDITIONS (clearly marked below) ─────────────────────────
 * All new rules are guarded with hasRole("BUILDER") or authenticated() as
 * appropriate. They are inserted BEFORE the catch-all
 * .anyRequest().authenticated() rule.
 *
 * IMPORTANT — Spring Security evaluates rules top-to-bottom, first-match wins.
 * More specific patterns must always appear before broader wildcard patterns.
 * The new builder rules follow this principle throughout.
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ApprovalRequiredFilter approvalRequiredFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;
    private final String allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            ApprovalRequiredFilter approvalRequiredFilter,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler,
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.approvalRequiredFilter = approvalRequiredFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                // ── Preflight ──────────────────────────────────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // ── Public auth & OTP ──────────────────────────────────────
                .requestMatchers(
                        "/api/auth/register",
                        "/api/auth/login",
                        "/api/auth/customer-session",
                        "/api/otp/send",
                        "/api/otp/verify").permitAll()
                // ── Super-admin only ───────────────────────────────────────
                .requestMatchers("/api/admin/superadmin/**").hasRole("SUPER_ADMIN")
                // ── Admin approval ─────────────────────────────────────────
                .requestMatchers("/api/admin/approve/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // ── Notice board admin actions ─────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/admin/notices").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/admin/notices").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/admin/notices/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/admin/notices/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // ── Real estate admin actions ──────────────────────────────
                .requestMatchers("/api/admin/real-estate/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // ── Visitor admin monitoring ───────────────────────────────
                .requestMatchers("/api/admin/visitor/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/admin/guest-parking").hasAnyRole("ADMIN", "SUPER_ADMIN", "SECURITY")
                .requestMatchers(HttpMethod.PUT, "/api/admin/guest-parking/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // ── General admin management ───────────────────────────────
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // ── Security guard — deliveries ────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/deliveries/pending").hasRole("SECURITY")
                .requestMatchers(
                        "/api/deliveries/verify-otp",
                        "/api/deliveries/*/delivered").hasRole("SECURITY")
                // ── Amenity booking — guard OTP verify ─────────────────────
                .requestMatchers("/api/amenity-bookings/verify-otp").hasRole("SECURITY")
                // ── EV booking — guard OTP verify ──────────────────────────
                .requestMatchers("/api/ev-bookings/verify-otp").hasRole("SECURITY")
                // ── Visitor passes — guard (security) endpoints ────────────
                .requestMatchers(HttpMethod.GET, "/api/visitor/all").hasRole("SECURITY")
                .requestMatchers(HttpMethod.POST, "/api/visitor/verify-otp").hasRole("SECURITY")
                .requestMatchers(HttpMethod.POST, "/api/visitor/checkin/**").hasRole("SECURITY")
                .requestMatchers(HttpMethod.POST, "/api/visitor/deny/**").hasRole("SECURITY")
                .requestMatchers(HttpMethod.POST, "/api/visitor/checkout/**").hasRole("SECURITY")
                // ── Visitor passes — resident endpoints ────────────────────
                .requestMatchers(HttpMethod.POST, "/api/visitor/create").hasRole("RESIDENT")
                .requestMatchers(HttpMethod.GET, "/api/visitor/my").hasRole("RESIDENT")
                // ── Amenity booking — resident actions ─────────────────────
                .requestMatchers("/api/amenity-bookings/**").hasAnyRole("RESIDENT")
                // ── EV booking — resident actions ──────────────────────────
                .requestMatchers("/api/ev-bookings/**").hasRole("RESIDENT")
                // ── Delivery passes (resident) ─────────────────────────────
                .requestMatchers("/api/deliveries/**").hasRole("RESIDENT")
                // ── Real estate — resident actions ─────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/real-estate/listings/active").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/real-estate/listings/*/view").authenticated()
                .requestMatchers("/api/real-estate/**").hasRole("RESIDENT")
                // ── Notice board — any authenticated user can read ──────────
                .requestMatchers(HttpMethod.GET, "/api/notices/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/notices/*/rsvp").authenticated()
                // ── Vendor: store, products, delivery staff, orders ─────────
                .requestMatchers("/api/vendor/store/**").hasRole("VENDOR")
                .requestMatchers("/api/vendor/products/**").hasRole("VENDOR")
                .requestMatchers("/api/vendor/delivery-staff/**").hasRole("VENDOR")
                .requestMatchers("/api/vendor/orders/**").hasRole("VENDOR")
                // ── Marketplace — resident confirm/reject ──────────────────
                .requestMatchers(
                        "/api/marketplace/orders/*/resident-confirm",
                        "/api/marketplace/orders/*/resident-reject").hasRole("RESIDENT")
                // ── Marketplace browsing (any authenticated + approved) ──────
                .requestMatchers("/api/marketplace/**").authenticated()
                // ── Maintenance — guard OTP verify ────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/maintenance/gate").hasRole("SECURITY")
                .requestMatchers(HttpMethod.PUT, "/api/maintenance/verify-gate-otp").hasRole("SECURITY")
                // ── SOS — guard endpoints ─────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/sos/active").hasRole("SECURITY")
                .requestMatchers(HttpMethod.POST, "/api/sos/*/acknowledge").hasRole("SECURITY")
                .requestMatchers(HttpMethod.POST, "/api/sos/*/progress").hasRole("SECURITY")
                .requestMatchers(HttpMethod.POST, "/api/sos/*/resolve").hasRole("SECURITY")
                // ── SOS — resident endpoints ──────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/sos/create").hasRole("RESIDENT")
                .requestMatchers(HttpMethod.GET, "/api/sos/my").hasRole("RESIDENT")
                // ── SOS — admin endpoints ─────────────────────────────────────────
                .requestMatchers("/api/admin/sos/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // ── Maintenance — admin endpoints ─────────────────────────────────
                .requestMatchers("/api/admin/maintenance/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // ── Maintenance — vendor endpoints ────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/maintenance/vendor/my").hasRole("VENDOR")
                .requestMatchers(HttpMethod.PUT, "/api/maintenance/*/submit-quote").hasRole("VENDOR")
                .requestMatchers(HttpMethod.PUT, "/api/maintenance/*/work-complete").hasRole("VENDOR")
                .requestMatchers(HttpMethod.PUT, "/api/maintenance/*/request-payment").hasRole("VENDOR")
                // ── Maintenance — resident endpoints ──────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/maintenance/submit").hasRole("RESIDENT")
                .requestMatchers(HttpMethod.GET, "/api/maintenance/my").hasRole("RESIDENT")
                .requestMatchers(HttpMethod.PUT, "/api/maintenance/*/respond-quote").hasRole("RESIDENT")
                .requestMatchers(HttpMethod.PUT, "/api/maintenance/*/approve-work").hasRole("RESIDENT")
                .requestMatchers(HttpMethod.POST, "/api/maintenance/*/create-payment-order").hasRole("RESIDENT")
                .requestMatchers(HttpMethod.POST, "/api/maintenance/verify-payment").hasRole("RESIDENT")
                .requestMatchers(HttpMethod.POST, "/api/maintenance/*/simulate-payment").hasRole("RESIDENT")
                .requestMatchers(HttpMethod.POST, "/api/maintenance/*/rate-vendor").hasRole("RESIDENT")
                // ── Maintenance — single request (resident/vendor/admin all need access)
                .requestMatchers(HttpMethod.GET, "/api/maintenance/*").authenticated()
                // ── Guest Parking — guard endpoints ───────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/guest-parking/guard/verify-otp").hasRole("SECURITY")
                .requestMatchers(HttpMethod.PUT, "/api/guest-parking/guard/**").hasRole("SECURITY")
                // ── Guest Parking — admin endpoints ───────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/admin/guest-parking").hasAnyRole("ADMIN", "SUPER_ADMIN", "SECURITY")
                .requestMatchers(HttpMethod.PUT, "/api/admin/guest-parking/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // ── Guest Parking — resident endpoints ────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/guest-parking").hasRole("RESIDENT")
                .requestMatchers(HttpMethod.GET, "/api/guest-parking/my").hasRole("RESIDENT")
                // ── Guest Parking — single request (resident/admin/guard all need) ─
                .requestMatchers(HttpMethod.GET, "/api/guest-parking/*").authenticated()
                // ── Auth status & doc submission ───────────────────────────
                .requestMatchers(
                        "/api/auth/status/**",
                        "/api/auth/submit-docs/**").authenticated()
                // ════════════════════════════════════════════════════════════
                // ══  BUILDER MODULE — NEW RULES (added in this refactor)  ══
                // ════════════════════════════════════════════════════════════

                // ── Builder: project management ────────────────────────────
                // POST   /api/builder/projects              — create project
                // GET    /api/builder/projects              — list own projects
                // POST   /api/builder/projects/{id}/towers  — add tower to owned project
                // POST   /api/builder/towers/{id}/units     — add unit to owned tower
                // GET    /api/builder/dashboard             — builder dashboard
                .requestMatchers("/api/builder/**").hasRole("BUILDER")
                // ── Customer: project browsing (public read-only catalog) ───
                // GET    /api/customer/projects             — browse Approved+LIVE projects
                // GET    /api/customer/projects/{id}        — single project details
                // GET    /api/customer/projects/{id}/towers — towers for a project
                // GET    /api/customer/projects/towers/{id}/units — units for a tower
                .requestMatchers(HttpMethod.GET, "/api/customer/projects/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/customer/projects").permitAll()
                .requestMatchers("/api/customer/**").authenticated()
                // ── Bookings ───────────────────────────────────────────────
                // POST   /api/bookings/unit/{unitId}        — customer books a unit     [CUSTOMER]
                // GET    /api/bookings/my-bookings          — customer's own bookings   [CUSTOMER]
                // GET    /api/bookings/unit/{unitId}        — builder sees bookings     [BUILDER]
                // PUT    /api/bookings/{id}/status          — builder approves/rejects  [BUILDER]
                //
                // Both BUILDER and CUSTOMER need access to /api/bookings/**.
                // Role-level separation is enforced inside the controller via
                // requireCurrentBuilder() / requireCurrentUser().
                .requestMatchers("/api/bookings/**").authenticated()
                // ── Site visits ────────────────────────────────────────────
                // POST   /api/site-visits/book/{projectId}  — customer books visit
                // GET    /api/site-visits/my-visits         — customer's visits
                // GET    /api/site-visits/project/{id}      — builder views project visits
                // PUT    /api/site-visits/{id}/status       — builder confirms/completes visit
                .requestMatchers("/api/site-visits/**").authenticated()
                // ── Construction tracking ──────────────────────────────────
                // POST   /api/construction/project/{id}/milestones           [BUILDER]
                // POST   /api/construction/milestones/{id}/updates           [BUILDER]
                // GET    /api/construction/project/{id}/milestones           [any auth]
                // GET    /api/construction/milestones/{id}/updates           [any auth]
                //
                // Read endpoints are open to all authenticated users (customer transparency).
                // Write access is enforced inside the controller via requireBuilder().
                .requestMatchers("/api/construction/**").authenticated()
                // ── Payments ───────────────────────────────────────────────
                // POST   /api/payments/booking/{id}/installments             [BUILDER]
                // GET    /api/payments/booking/{id}/installments             [BUILDER or CUSTOMER]
                // POST   /api/payments/installments/{id}/pay                [CUSTOMER]
                // PUT    /api/payments/booking/{id}/possession               [BUILDER]
                //
                // Mixed-role endpoint — role-level enforcement is inside the controller.
                .requestMatchers("/api/payments/**").authenticated()
                // ════════════════════════════════════════════════════════════
                // ══  END BUILDER MODULE RULES                             ══
                // ════════════════════════════════════════════════════════════

                // ── AI Chat — any authenticated + approved user ──────────────────
                .requestMatchers(HttpMethod.POST, "/api/ai/chat").authenticated()
                .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(approvalRequiredFilter, JwtAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
