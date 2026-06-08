package com.bsgated.controller;

import com.bsgated.payload.OtpRequest;
import com.bsgated.payload.OtpVerificationRequest;
import com.bsgated.service.OtpService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody OtpRequest request) {
        String status = otpService.sendOtp(request.getPhoneNumber());
        Map<String, String> response = new HashMap<>();
        response.put("status", status);
        
        if (status.startsWith("Error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        boolean isVerified = otpService.verifyOtp(request.getPhoneNumber(), request.getOtp());
        Map<String, Object> response = new HashMap<>();
        response.put("verified", isVerified);
        
        if (isVerified) {
            response.put("message", "OTP verified successfully!");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Invalid OTP or expired.");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
