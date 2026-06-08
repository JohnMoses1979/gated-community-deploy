// package com.bsgated.security;

// import com.bsgated.model.User;
// import com.bsgated.repository.UserRepository;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.MediaType;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.stereotype.Component;
// import org.springframework.web.filter.OncePerRequestFilter;

// import java.io.IOException;
// import java.time.LocalDateTime;
// import java.util.Map;
// import java.util.Set;

// @Component
// public class ApprovalRequiredFilter extends OncePerRequestFilter {

//     private static final Set<String> ROLES_REQUIRING_APPROVAL = Set.of(
//             "SUPER_ADMIN", "ADMIN", "BUILDER", "RESIDENT", "VENDOR", "SECURITY");

//     private final UserRepository userRepository;
//     private final ObjectMapper objectMapper;

//     public ApprovalRequiredFilter(UserRepository userRepository, ObjectMapper objectMapper) {
//         this.userRepository = userRepository;
//         this.objectMapper = objectMapper;
//     }

//     @Override
//     protected void doFilterInternal(
//             HttpServletRequest request,
//             HttpServletResponse response,
//             FilterChain filterChain) throws ServletException, IOException {

//         if (shouldSkip(request)) {
//             filterChain.doFilter(request, response);
//             return;
//         }

//         Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//         if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser currentUser)) {
//             filterChain.doFilter(request, response);
//             return;
//         }

//         String role = RoleName.normalize(currentUser.role());
//         if (!ROLES_REQUIRING_APPROVAL.contains(role)) {
//             writeForbidden(request, response, "This account role is not allowed to access protected workflows.");
//             return;
//         }

//         User user = userRepository.findById(currentUser.id()).orElse(null);
//         if (user == null) {
//             writeForbidden(request, response, "Authenticated account no longer exists.");
//             return;
//         }

//         if (!"approved".equalsIgnoreCase(user.getVerificationStatus())
//                 || !"approved".equalsIgnoreCase(user.getApprovalStatus())) {
//             writeForbidden(request, response, "Your account is pending approval.");
//             return;
//         }

//         filterChain.doFilter(request, response);
//     }

//     private boolean shouldSkip(HttpServletRequest request) {
//         String path = request.getRequestURI();
//         String method = request.getMethod();

//         if ("OPTIONS".equalsIgnoreCase(method)) {
//             return true;
//         }

//         return path.equals("/api/auth/register")
//                 || path.equals("/api/auth/login")
//                 || path.equals("/api/otp/send")
//                 || path.equals("/api/otp/verify")
//                 || path.startsWith("/api/auth/status/")
//                 || path.startsWith("/api/auth/submit-docs/");
//     }

//     private void writeForbidden(HttpServletRequest request, HttpServletResponse response, String message) throws IOException {
//         response.setStatus(HttpStatus.FORBIDDEN.value());
//         response.setContentType(MediaType.APPLICATION_JSON_VALUE);
//         objectMapper.writeValue(response.getWriter(), Map.of(
//                 "timestamp", LocalDateTime.now().toString(),
//                 "status", HttpStatus.FORBIDDEN.value(),
//                 "error", HttpStatus.FORBIDDEN.getReasonPhrase(),
//                 "message", message,
//                 "path", request.getRequestURI()));
//     }
// }









package com.bsgated.security;

import com.bsgated.model.User;
import com.bsgated.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

@Component
public class ApprovalRequiredFilter extends OncePerRequestFilter {

    private static final Set<String> ROLES_REQUIRING_APPROVAL = Set.of(
            "SUPER_ADMIN", "ADMIN", "BUILDER", "RESIDENT", "VENDOR", "SECURITY", "CUSTOMER");

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ApprovalRequiredFilter(UserRepository userRepository, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.objectMapper   = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if (shouldSkip(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser currentUser)) {
            filterChain.doFilter(request, response);
            return;
        }

        String role = RoleName.normalize(currentUser.role());
        if (!ROLES_REQUIRING_APPROVAL.contains(role)) {
            writeForbidden(request, response, "This account role is not allowed to access protected workflows.");
            return;
        }

        User user = userRepository.findById(currentUser.id()).orElse(null);
        if (user == null) {
            writeForbidden(request, response, "Authenticated account no longer exists.");
            return;
        }

        if (!"approved".equalsIgnoreCase(user.getVerificationStatus())
                || !"approved".equalsIgnoreCase(user.getApprovalStatus())) {
            writeForbidden(request, response, "Your account is pending approval.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldSkip(HttpServletRequest request) {
        String path   = request.getRequestURI();
        String method = request.getMethod();

        if ("OPTIONS".equalsIgnoreCase(method)) return true;

        if ("GET".equalsIgnoreCase(method) && path.startsWith("/api/customer/projects")) {
            return true;
        }

        return path.equals("/api/auth/register")
                || path.equals("/api/auth/login")
                || path.equals("/api/otp/send")
                || path.equals("/api/otp/verify")
                || path.startsWith("/api/auth/status/")
                || path.startsWith("/api/auth/submit-docs/");
    }

    private void writeForbidden(HttpServletRequest request, HttpServletResponse response, String message)
            throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status",    HttpStatus.FORBIDDEN.value(),
                "error",     HttpStatus.FORBIDDEN.getReasonPhrase(),
                "message",   message,
                "path",      request.getRequestURI()));
    }
}
