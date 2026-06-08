
package  com.bsgated.payload;
/**
 * VisitorPassPayloads — typed request DTOs for all visitor pass endpoints.
 *
 * Replaces the old pattern of accepting raw Map<String, String> bodies or
 * trusting identity fields (guardId, guardName, residentId) from the request
 * body. Identity is always extracted from JWT via CurrentUser.get().
 */
public class VisitorPassPayloads {

    private VisitorPassPayloads() {
    }

    // ── RESIDENT: create visitor pass ─────────────────────────────────────────
    public static class CreatePass {

        private String visitorName;
        private String visitorPhone;
        private String purpose;
        private String vehicleNumber; // optional

        public String getVisitorName() {
            return visitorName;
        }

        public void setVisitorName(String visitorName) {
            this.visitorName = visitorName;
        }

        public String getVisitorPhone() {
            return visitorPhone;
        }

        public void setVisitorPhone(String visitorPhone) {
            this.visitorPhone = visitorPhone;
        }

        public String getPurpose() {
            return purpose;
        }

        public void setPurpose(String purpose) {
            this.purpose = purpose;
        }

        public String getVehicleNumber() {
            return vehicleNumber;
        }

        public void setVehicleNumber(String vehicleNumber) {
            this.vehicleNumber = vehicleNumber;
        }
    }

    // ── SECURITY: verify OTP ──────────────────────────────────────────────────
    public static class OtpVerify {

        private String otp;

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }
    }

    // ── SECURITY: check in ────────────────────────────────────────────────────
    // Only gate label is accepted from body — guard identity comes from JWT.
    public static class CheckIn {

        private String gate; // e.g. "Main Gate", "East Gate" — physical label, not identity

        public String getGate() {
            return gate;
        }

        public void setGate(String gate) {
            this.gate = gate;
        }
    }
}
