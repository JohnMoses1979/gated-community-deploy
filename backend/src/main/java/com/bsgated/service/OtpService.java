package com.bsgated.service;

import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final String accountSid;
    private final String authToken;
    private final String verifySid;
    private final long resendCooldownSeconds;
    private final long expiryMinutes;
    private final int maxAttempts;
    private final ConcurrentHashMap<String, OtpState> otpStates = new ConcurrentHashMap<>();

    public OtpService(
            @Value("${twilio.account.sid}") String accountSid,
            @Value("${twilio.auth.token}") String authToken,
            @Value("${twilio.verify.sid}") String verifySid,
            @Value("${otp.resend-cooldown-seconds}") long resendCooldownSeconds,
            @Value("${otp.expiry-minutes}") long expiryMinutes,
            @Value("${otp.max-attempts}") int maxAttempts) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.verifySid = verifySid;
        this.resendCooldownSeconds = resendCooldownSeconds;
        this.expiryMinutes = expiryMinutes;
        this.maxAttempts = maxAttempts;
    }

    @PostConstruct
    public void init() {
        if (!accountSid.isBlank() && !authToken.isBlank()) {
            Twilio.init(accountSid, authToken);
        }
    }

    public String sendOtp(String phoneNumber) {
        OtpState existing = otpStates.get(phoneNumber);
        LocalDateTime now = LocalDateTime.now();
        if (existing != null && Duration.between(existing.lastSentAt(), now).getSeconds() < resendCooldownSeconds) {
            long retryAfter = resendCooldownSeconds - Duration.between(existing.lastSentAt(), now).getSeconds();
            return "Error: Please wait " + retryAfter + " seconds before requesting another OTP.";
        }

        if (accountSid.isBlank() || authToken.isBlank() || verifySid.isBlank()) {
            return "Error: Twilio credentials are not configured.";
        }

        try {
            Verification verification = Verification.creator(verifySid, phoneNumber, "sms").create();
            otpStates.put(phoneNumber, new OtpState(now, now.plusMinutes(expiryMinutes), 0));
            return verification.getStatus();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    public boolean verifyOtp(String phoneNumber, String otp) {
        OtpState state = otpStates.get(phoneNumber);
        if (state == null || LocalDateTime.now().isAfter(state.expiresAt())) {
            otpStates.remove(phoneNumber);
            return false;
        }
        if (state.attempts() >= maxAttempts) {
            otpStates.remove(phoneNumber);
            return false;
        }

        otpStates.put(phoneNumber, state.incrementAttempts());
        try {
            VerificationCheck verificationCheck = VerificationCheck.creator(verifySid)
                    .setCode(otp)
                    .setTo(phoneNumber)
                    .create();
            boolean approved = "approved".equalsIgnoreCase(verificationCheck.getStatus());
            if (approved) {
                otpStates.remove(phoneNumber);
            }
            return approved;
        } catch (Exception e) {
            return false;
        }
    }

    private record OtpState(LocalDateTime lastSentAt, LocalDateTime expiresAt, int attempts) {

        OtpState incrementAttempts() {
            return new OtpState(lastSentAt, expiresAt, attempts + 1);
        }
    }
}
