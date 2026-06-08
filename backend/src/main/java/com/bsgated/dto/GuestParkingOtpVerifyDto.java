// package com.bsgated.dto;
// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.Size;
// import lombok.Data;
// /**
//  * Used by Guard to verify a parking OTP.
//  * ServiceImpl reads: dto.getOtp(), dto.getGuardId(), dto.getGuardName(), dto.getGate(), dto.getRequestId()
//  */
// @Data
// public class GuestParkingOtpVerifyDto {
//     @NotBlank(message = "OTP is required")
//     @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
//     private String otp;
//     private String guardId;
//     private String guardName;
//     private String gate;  // defaults to "Main Gate" in ServiceImpl if null
//     private String requestId;  // Add this line to include request ID
// }
package com.bsgated.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * GuestParkingOtpVerifyDto — request body for POST
 * /api/guest-parking/guard/verify-otp.
 *
 * SECURITY: guardId and guardName are intentionally REMOVED from this DTO.
 * Guard identity is extracted from JWT via CurrentUser.get() inside
 * GuestParkingService. Never trust guardId or guardName from the request body.
 *
 * gate is the only non-identity field accepted from the guard's request
 * (physical gate label, e.g. "Main Gate" — not identity data).
 */
@Data
public class GuestParkingOtpVerifyDto {

    @NotBlank(message = "OTP is required")
    @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
    private String otp;

    // Physical gate label — not identity. Defaults to "Main Gate" in service if null.
    private String gate;

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getGate() {
        return gate;
    }

    public void setGate(String gate) {
        this.gate = gate;
    }


}
