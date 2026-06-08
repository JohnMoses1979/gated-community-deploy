package com.bsgated.dto;

import lombok.Data;
 
@Data
public class GuestParkingApprovalDto {
    // Empty — admin just taps Approve; no extra input needed.
    // Extend if admin wants to override slot number.
    private String overrideSlot; // optional

    public String getOverrideSlot() {
        return overrideSlot;
    }

    public void setOverrideSlot(String overrideSlot) {
        this.overrideSlot = overrideSlot;
    }


}
 