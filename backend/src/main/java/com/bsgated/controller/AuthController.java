package com.bsgated.controller;

import com.bsgated.dto.LoginRequest;
import com.bsgated.dto.RegisterRequest;
import com.bsgated.dto.SubmitDocsRequest;
import com.bsgated.exception.ApiException;
import com.bsgated.model.User;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.bsgated.security.JwtService;
import com.bsgated.security.RoleName;
import com.bsgated.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Set<String> PUBLIC_REGISTRATION_ROLES = Set.of(
            "ADMIN", "BUILDER", "RESIDENT", "VENDOR", "SECURITY", "CUSTOMER");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    @PostMapping(value = "/register", produces = "application/json")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String normalizedRole = RoleName.normalize(request.getRole());
        if (!PUBLIC_REGISTRATION_ROLES.contains(normalizedRole)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This role is not allowed for public registration.");
        }

        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User already exists with this phone number.");
        }

        String role = RoleName.frontendValue(normalizedRole);
        User user = new User();
        user.setName(request.getName().trim());
        user.setPhone(request.getPhone().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        String requestedVendorType = request.getVendorType();
        if (requestedVendorType == null || requestedVendorType.isBlank()) {
            requestedVendorType = request.getBusinessType();
        }
        if (requestedVendorType == null || requestedVendorType.isBlank()) {
            requestedVendorType = request.getMarketplaceType();
        }
        if ("vendor".equals(role)) {
            if (requestedVendorType == null || requestedVendorType.isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Vendor type is required for vendor registration.");
            }
            String normalizedVendorType = requestedVendorType.trim().toLowerCase();
            if (!"business".equals(normalizedVendorType) && !"marketplace".equals(normalizedVendorType)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Vendor type must be either 'business' or 'marketplace'.");
            }
            user.setVendorType(normalizedVendorType);
        } else {
            user.setVendorType(null);
        }

        if ("customer".equals(role)) {
            user.setVerificationStatus("approved");
        } else if ("admin".equals(role) || "builder".equals(role) || "security".equals(role)) {
            user.setVerificationStatus("pending");
        } else {
            user.setVerificationStatus("not_submitted");
        }
        user.setApprovalStatus(user.getVerificationStatus());

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        auditService.record(new AuthenticatedUser(savedUser.getId(), savedUser.getPhone(), RoleName.normalize(savedUser.getRole())),
                "REGISTER", "USER", String.valueOf(savedUser.getId()), "New " + savedUser.getRole() + " registration");
        return ResponseEntity.ok(toAuthResponse(savedUser, token));
    }

    @PostMapping(value = "/login", produces = "application/json")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest credentials) {
        User user = userRepository.findByPhone(credentials.getPhone())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid phone or password."));

        if (!passwordMatches(credentials.getPassword(), user)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid phone or password.");
        }

        if (credentials.getRole() != null && !credentials.getRole().isBlank()
                && !RoleName.normalize(credentials.getRole()).equals(RoleName.normalize(user.getRole()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This account is not allowed to login through the selected portal.");
        }

        String token = jwtService.generateToken(user);
        auditService.record(new AuthenticatedUser(user.getId(), user.getPhone(), RoleName.normalize(user.getRole())),
                "LOGIN", "USER", String.valueOf(user.getId()), "Successful login");
        return ResponseEntity.ok(toAuthResponse(user, token));
    }

    @PostMapping(value = "/customer-session", produces = "application/json")
    public ResponseEntity<?> customerSession(@RequestBody Map<String, String> request) {
        String phone = request.getOrDefault("phone", "").trim();
        String name = request.getOrDefault("name", "Property Buyer").trim();

        if (!phone.matches("^[0-9]{10,15}$")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Phone number must contain 10 to 15 digits.");
        }
        if (name.isBlank()) {
            name = "Property Buyer";
        }

        User user = userRepository.findByPhone(phone).orElse(null);
        if (user != null && !"CUSTOMER".equals(RoleName.normalize(user.getRole()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This phone number is already registered for another role.");
        }

        if (user == null) {
            user = new User();
            user.setName(name);
            user.setPhone(phone);
            user.setPassword(passwordEncoder.encode("customer-" + phone));
            user.setRole("customer");
            user.setVerificationStatus("approved");
            user.setApprovalStatus("approved");
            user = userRepository.save(user);
            auditService.record(new AuthenticatedUser(user.getId(), user.getPhone(), "CUSTOMER"),
                    "REGISTER", "USER", String.valueOf(user.getId()), "New customer session registration");
        } else {
            boolean changed = false;
            if (user.getName() == null || user.getName().isBlank()) {
                user.setName(name);
                changed = true;
            }
            if (!"approved".equalsIgnoreCase(user.getVerificationStatus())) {
                user.setVerificationStatus("approved");
                changed = true;
            }
            if (!"approved".equalsIgnoreCase(user.getApprovalStatus())) {
                user.setApprovalStatus("approved");
                changed = true;
            }
            if (changed) {
                user = userRepository.save(user);
            }
        }

        String token = jwtService.generateToken(user);
        auditService.record(new AuthenticatedUser(user.getId(), user.getPhone(), "CUSTOMER"),
                "LOGIN", "USER", String.valueOf(user.getId()), "Customer property buyer session");
        return ResponseEntity.ok(toAuthResponse(user, token));
    }

    @GetMapping(value = "/status/{id}", produces = "application/json")
    public ResponseEntity<?> getStatus(@PathVariable Long id) {
        AuthenticatedUser currentUser = CurrentUser.get();
        if (!currentUser.id().equals(id) && !"ADMIN".equals(currentUser.role()) && !"SUPER_ADMIN".equals(currentUser.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only view your own status.");
        }
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(toUserResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/submit-docs/{id}", produces = "application/json")
    public ResponseEntity<?> submitDocs(@PathVariable Long id, @Valid @RequestBody SubmitDocsRequest payload) {
        AuthenticatedUser currentUser = CurrentUser.get();
        if (!currentUser.id().equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only submit documents for your own account.");
        }

        return userRepository.findById(id).map(user -> {
            user.setVerificationStatus("pending");
            user.setApprovalStatus("pending");
            user.setDocumentsJson(payload.getDocuments());
            userRepository.save(user);
            auditService.record("SUBMIT_DOCS", "USER", String.valueOf(user.getId()), "Verification documents submitted");
            return ResponseEntity.ok(toUserResponse(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    private boolean passwordMatches(String rawPassword, User user) {
        String storedPassword = user.getPassword();
        if (storedPassword != null && storedPassword.startsWith("$2") && passwordEncoder.matches(rawPassword, storedPassword)) {
            return true;
        }

        if (storedPassword != null && storedPassword.equals(rawPassword)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return true;
        }

        return false;
    }

    private Map<String, Object> toAuthResponse(User user, String token) {
        Map<String, Object> response = toUserResponse(user);
        response.put("token", token);
        response.put("tokenType", "Bearer");
        return response;
    }

    private Map<String, Object> toUserResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("phone", user.getPhone());
        response.put("role", RoleName.frontendValue(user.getRole()));
        response.put("vendorType", user.getVendorType());
        response.put("verificationStatus", user.getVerificationStatus());
        response.put("approvalStatus", user.getApprovalStatus());
        response.put("documentsJson", user.getDocumentsJson());
        response.put("createdAt", user.getCreatedAt());
        return response;
    }
}
