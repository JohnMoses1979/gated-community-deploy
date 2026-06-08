// src/main/java/com/bsgated/dto/VerifyDeliveryOtpRequest.java
package com.bsgated.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyDeliveryOtpRequest {

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be a 6 digit code")
    private String otp;

    private String guardId;

    public String getOtp() {
        return otp;
    }

    public void setOtp(String v) {
        this.otp = v;
    }

    public String getGuardId() {
        return guardId;
    }

    public void setGuardId(String v) {
        this.guardId = v;
    }
}
