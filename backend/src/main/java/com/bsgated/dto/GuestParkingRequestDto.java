// package com.bsgated.dto;
// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.Pattern;
// import jakarta.validation.constraints.Size;
// import lombok.Data;
// @Data
// public class GuestParkingRequestDto {
//     @NotBlank
//     private String residentId;
//     private String residentName;
//     private String unit;
//     @NotBlank
//     @Size(min = 2)
//     private String guestName;
//     @Pattern(
//             regexp = "^$|^[6-9]\\d{9}$",
//             message = "Invalid mobile number"
//     )
//     private String guestPhone;
//     @NotBlank
//     @Pattern(
//             regexp = "^[A-Z]{2}\\d{2}[A-Z]{1,3}\\d{4}$",
//             message = "Invalid vehicle number"
//     )
//     private String vehicleNumber;
//     private String vehicleType = "Car";
//     @NotBlank
//     private String expectedDate;
//     private Integer durationDays = 1;
//     private String slotNumber;
//     @Pattern(
//             regexp = "^$|^\\d{6}$",
//             message = "Invalid parking OTP"
//     )
//     private String parkingOtp;
// }


package com.bsgated.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * GuestParkingRequestDto — request body for POST /api/guest-parking.
 *
 * SECURITY: residentId and residentName are intentionally REMOVED. These are
 * injected server-side from the JWT via CurrentUser.get() inside
 * GuestParkingService — never trusted from the frontend.
 *
 * unit is retained as the resident's apartment/flat number (data, not
 * identity).
 */
@Data
public class GuestParkingRequestDto {

    // residentId and residentName removed — extracted from JWT in service layer.
    private String unit;

    @NotBlank(message = "Guest name is required")
    @Size(min = 2, max = 100, message = "Guest name must be 2-100 characters")
    private String guestName;

    @Pattern(
            regexp = "^$|^[6-9]\\d{9}$",
            message = "Enter a valid 10-digit Indian mobile number"
    )
    private String guestPhone;

    @NotBlank(message = "Vehicle number is required")
    @Pattern(
            regexp = "^[A-Z]{2}\\d{2}[A-Z]{1,3}\\d{4}$",
            message = "Enter a valid Indian vehicle number (e.g. TS09AB1234)"
    )
    private String vehicleNumber;

    private String vehicleType = "Car";

    @NotBlank(message = "Expected date is required")
    private String expectedDate;

    private Integer durationDays = 1;

    // Optional: resident picks a preferred slot; service validates availability.
    // If null, service auto-assigns a free slot.
    private String slotNumber;

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getGuestPhone() {
        return guestPhone;
    }

    public void setGuestPhone(String guestPhone) {
        this.guestPhone = guestPhone;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getExpectedDate() {
        return expectedDate;
    }

    public void setExpectedDate(String expectedDate) {
        this.expectedDate = expectedDate;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }



    
}
