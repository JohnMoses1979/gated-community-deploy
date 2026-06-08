// // src/main/java/com/bsgated/payload/OtpVerifyAmenityRequest.java
// package com.bsgated.payload;

// public class OtpVerifyAmenityRequest {
//     private String otp;
//     private String guardId;
//     private String guardName;

//     public String getOtp() { return otp; }
//     public void setOtp(String otp) { this.otp = otp; }
//     public String getGuardId() { return guardId; }
//     public void setGuardId(String guardId) { this.guardId = guardId; }
//     public String getGuardName() { return guardName; }
//     public void setGuardName(String guardName) { this.guardName = guardName; }
// }












package com.bsgated.payload;

public class OtpVerifyAmenityRequest {
    // guardId and guardName removed — extracted from JWT via CurrentUser.get().
    private String otp;

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}








