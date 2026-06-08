import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
// ADD at top with other imports:
import useCustomerStore from '../../store/CustomerStore';
import { useFocusEffect } from '@react-navigation/native';
// ADD to imports at top
// ADD alongside existing imports:
import { bookUnit, submitSiteVisit, fetchCustomerVisits } from '../../api/builderApi';
import { useAuthStore } from '../../store/AuthStore';
import { isBackendToken } from '../../services/apiClient';

const DEFAULT_UNIT_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

export default function CustomerHomeScreen({ navigation }) {
  useFocusEffect(
    React.useCallback(() => {
      fetchProjects();
      // Fetch customer's visit statuses so they can see builder approval
      const token = useAuthStore.getState().token;
      if (isBackendToken(token)) {
        fetchCustomerVisits(token).then(({ response, data }) => {
          if (response && response.ok && Array.isArray(data)) {
            setMyVisits(data);
          }
        }).catch(() => { });
      }
    }, [])
  );

  const [modalType, setModalType] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  // Inside the component, ADD after existing useState declarations:
  const { units: liveUnits, fetchProjects, isLoading: isLiveLoading, error: liveError } = useCustomerStore();

  // ADD:
  const [myVisits, setMyVisits] = useState([]);
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [message, setMessage] = useState("");

  const HIDDEN_STATUSES = ['Hold', 'Booked', 'Sold'];
  // Customer-visible units are backend-driven only.
  const customerUnits = useMemo(() => {
    return (liveUnits || []).filter(
      (u) => !HIDDEN_STATUSES.includes(u.status)
    );
  }, [liveUnits]);
  const pendingVisits = myVisits.filter((visit) => {
    const status = String(visit.status || "").toUpperCase();
    return status === "REQUESTED" || status === "PENDING";
  }).length;

  const formatDate = (date) =>
    date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatBackendLocalDateTime = (date) => {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  const getUnitNo = (unit) =>
    unit?.unitNumber || unit?.unitNo || unit?.flatNo || unit?.name || "Unit";

  const getUnitImage = (unit) =>
    unit?.unitImage || unit?.images?.[0] || unit?.projectCoverImage || DEFAULT_UNIT_IMAGE;

  const openModal = (type, unit) => {
    const nextSlot = new Date();
    nextSlot.setMinutes(nextSlot.getMinutes() + 30);
    setSelectedUnit(unit);
    setModalType(type);
    setVisitDate(nextSlot);
    setVisitTime(nextSlot);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUnit(null);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setVisitDate(new Date());
    setVisitTime(new Date());
    setBookingName("");
    setBookingPhone("");
    setMessage("");
  };

  const validateCustomer = () => {
    if (!bookingName.trim()) {
      Alert.alert("Validation", "Please enter your name");
      return false;
    }

    if (bookingPhone.replace(/\D/g, "").length !== 10) {
      Alert.alert("Validation", "Please enter valid phone number");
      return false;
    }

    return true;
  };

  const ensureCustomerBackendToken = async () => {
    const state = useAuthStore.getState();
    const formPhone = bookingPhone.trim();
    const sessionPhone = String(state.user?.phone || "").trim();

    // If already have valid token and phone matches, use it
    if (isBackendToken(state.token) && (!formPhone || formPhone === sessionPhone)) {
      return state.token;
    }

    // Use form phone if provided, else fall back to session phone
    const phoneToUse = formPhone || sessionPhone;
    const nameToUse = bookingName.trim() || state.user?.name || "Property Buyer";

    if (!phoneToUse) {
      Alert.alert('Phone Required', 'Please enter your phone number.');
      return null;
    }

    const result = await state.authenticateCustomerProfile({
      ...(state.user || {}),
      name: nameToUse,
      phone: phoneToUse,
      verified: true,
    });

    // Read token AFTER authenticateCustomerProfile updates store
    const refreshedToken = useAuthStore.getState().token;

    if (isBackendToken(refreshedToken)) {
      return refreshedToken;
    }

    // Last resort — if backend auth failed but we have form data,
    // try direct login
    console.log('Auth failed, result:', result);
    Alert.alert(
      'Authentication Failed',
      result?.message || 'Could not verify your account. Please try again.'
    );
    return null;
  };

  // REPLACE the existing submitVisit:
  const submitVisit = async () => {
    if (!selectedUnit || !validateCustomer()) return;

    const token = await ensureCustomerBackendToken();
    if (!token) {
      Alert.alert('Login Required', 'Please reopen Property Buyer login and verify your phone before submitting a visit request.');
      return;
    }

    // scheduledDate: combine visitDate + visitTime into ISO string
    const combined = new Date(visitDate);
    combined.setHours(visitTime.getHours(), visitTime.getMinutes(), 0, 0);
    const minimumVisitTime = new Date(Date.now() + 5 * 60 * 1000);
    if (combined <= minimumVisitTime) {
      Alert.alert('Validation', 'Please choose a visit time at least 5 minutes from now.');
      return;
    }

    try {
      const { response, data } = await submitSiteVisit(token, selectedUnit.projectId, {
        scheduledDate: formatBackendLocalDateTime(combined),
        unitId: selectedUnit.id,
        unitNumber: getUnitNo(selectedUnit),
        unitType: selectedUnit.bhkType || selectedUnit.unitType || selectedUnit.type || "Unit",
        message: message.trim(),
      });

      if (!response || !response.ok) {
        const fieldMessage = data?.errors?.scheduledDate || Object.values(data?.errors || {})[0];
        Alert.alert('Error', fieldMessage || data?.message || 'Visit request failed. Please try again.');
        return;
      }

      Alert.alert('Success', 'Slot visit request sent to builder.');
      fetchProjects();
      fetchCustomerVisits(token).then(({ response, data }) => {
        if (response && response.ok && Array.isArray(data)) {
          setMyVisits(data);
        }
      }).catch(() => { });
      closeModal();
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  // REPLACE submitBooking:
  const submitBooking = async () => {
    if (!selectedUnit || !validateCustomer()) return;

    const token = await ensureCustomerBackendToken();
    if (!token) {
      Alert.alert('Login Required', 'Please reopen Property Buyer login and verify your phone before submitting a booking request.');
      return;
    }

    try {
      const { response, data } = await bookUnit(token, selectedUnit.id, {
        kycDocumentsJson: JSON.stringify({ submittedVia: 'CustomerHomeScreen' }),
        digitalSignatureUrl: '',
      });

      if (!response || !response.ok) {
        Alert.alert('Error', data?.message || 'Booking failed. Unit may no longer be available.');
        return;
      }

      Alert.alert('Success', 'Flat booking request sent to builder.');
      fetchProjects(); // refresh unit statuses
      closeModal();
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const onDateChange = (_, selectedDate) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selectedDate) setVisitDate(selectedDate);
  };

  const onTimeChange = (_, selectedTime) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (selectedTime) setVisitTime(selectedTime);
  };

  const getStatusStyle = (status) => {
    if (status === "Sold" || status === "Booked") return { bg: "#FEE2E2", color: "#B91C1C" };
    if (status === "Hold") return { bg: "#FFEDD5", color: "#C2410C" };
    return { bg: "#DCFCE7", color: "#15803D" };
  };

  const renderUnitCard = (unit) => {
    const statusStyle = getStatusStyle(unit.status || "Available");
    const unitNo = getUnitNo(unit);
    const area = unit.superBuiltupArea || unit.carpetArea || unit.size || unit.area || "Area not set";
    const buyerDocuments = (unit.complianceDocuments || []).filter(
      (doc) => doc.visibleToCustomer && (doc.file || doc.status === "Uploaded" || doc.status === "Verified")
    );

    return (
      <View key={unit.id} style={styles.unitCard}>
        <ImageBackground
          source={{ uri: getUnitImage(unit) }}
          style={styles.unitImage}
          imageStyle={styles.unitImageStyle}
        >
          <View style={styles.imageOverlay}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {unit.status || "Available"}
              </Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.unitBody}>
          <Text style={styles.unitName}>
            {unit.bhkType || unit.type || "Premium Unit"} • {unitNo}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={styles.locationText}>
              {unit.projectName} • {unit.projectLocation || "Location"}
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <MaterialCommunityIcons name="office-building-outline" size={20} color="#2563EB" />
              <Text style={styles.detailLabel}>Unit No</Text>
              <Text style={styles.detailValue}>{unitNo}</Text>
            </View>

            <View style={styles.detailBox}>
              <Ionicons name="business-outline" size={20} color="#2563EB" />
              <Text style={styles.detailLabel}>Tower</Text>
              <Text style={styles.detailValue}>{unit.tower || "N/A"}</Text>
            </View>

            <View style={styles.detailBox}>
              <Ionicons name="layers-outline" size={20} color="#2563EB" />
              <Text style={styles.detailLabel}>Floor</Text>
              <Text style={styles.detailValue}>{unit.floor || "N/A"}</Text>
            </View>

            <View style={styles.detailBox}>
              <Ionicons name="resize-outline" size={20} color="#2563EB" />
              <Text style={styles.detailLabel}>Area</Text>
              <Text style={styles.detailValue}>{area}</Text>
            </View>
          </View>

          <Text style={styles.price}>{unit.price || "Price on request"}</Text>

          <Text style={styles.description}>
            {unit.description ||
              "Premium unit with spacious rooms, ventilation, parking, lift, security, and community facilities."}
          </Text>

          {buyerDocuments.length > 0 && (
            <View style={styles.buyerDocsBox}>
              <Text style={styles.buyerDocsTitle}>Property Buyer Documents</Text>
              {buyerDocuments.slice(0, 4).map((doc) => (
                <View key={doc.id || doc.title} style={styles.buyerDocRow}>
                  <Ionicons name="document-text-outline" size={16} color="#1A7A7A" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.buyerDocName}>{doc.title}</Text>
                    <Text style={styles.buyerDocMeta}>
                      {doc.file?.name || doc.category || "Document"} · {doc.status || "Uploaded"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.visitBtn}
              onPress={() => openModal("visit", unit)}
            >
              <Ionicons name="calendar-outline" size={17} color="#FFFFFF" />
              <Text style={styles.actionText}>Slot Visit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookingBtn}
              onPress={() => openModal("booking", unit)}
            >
              <Ionicons name="home-outline" size={17} color="#FFFFFF" />
              <Text style={styles.actionText}>Flat Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Welcome Customer</Text>
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate("CustomerProfileScreen")}
        >
          <Ionicons name="person" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.dashboardCard}>
          <View style={styles.dashboardTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dashboardTitle}>Property Buyer Dashboard</Text>
              <Text style={styles.dashboardSub}>
                Browse approved units, send visit requests and start booking after builder approval.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => Alert.alert("Updates", "Visit and booking updates will appear here.")}
            >
              <Text style={styles.bellButtonText}>Open Bell</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{customerUnits.length}</Text>
              <Text style={styles.statLabel}>Units Live</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pendingVisits}</Text>
              <Text style={styles.statLabel}>Visit Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Booking Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Payment Ready</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Browse Units</Text>

        {customerUnits.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="home-outline" size={42} color="#64748B" />
            <Text style={styles.emptyTitle}>{isLiveLoading ? "Loading units..." : "No units available"}</Text>
            <Text style={styles.emptySub}>
              {liveError
                ? "Unable to load approved builder units from backend. Please check API/server connection."
                : "Units will appear automatically once builder adds them to approved projects."}
            </Text>
          </View>
        ) : (
          customerUnits.map(renderUnitCard)
        )}
      </ScrollView>

      <Modal visible={modalType === "visit"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Slot Visit Form</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Unit: {getUnitNo(selectedUnit)} • {selectedUnit?.projectName}
            </Text>

            <Text style={styles.label}>Customer Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
              value={bookingName}
              onChangeText={setBookingName}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#94A3B8"
              value={bookingPhone}
              onChangeText={setBookingPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <Text style={styles.label}>Preferred Visit Date</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={19} color="#2563EB" />
              <Text style={styles.pickerText}>{formatDate(visitDate)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={visitDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={onDateChange}
              />
            )}

            <Text style={styles.label}>Preferred Visit Time</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={19} color="#2563EB" />
              <Text style={styles.pickerText}>{formatTime(visitTime)}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={visitTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onTimeChange}
              />
            )}

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write message to builder"
              placeholderTextColor="#94A3B8"
              value={message}
              onChangeText={setMessage}
              multiline
            />

            <TouchableOpacity style={styles.submitBtn} onPress={submitVisit}>
              <Text style={styles.submitText}>Submit Visit Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalType === "booking"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Flat Booking Form</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Unit: {getUnitNo(selectedUnit)} • {selectedUnit?.projectName}
            </Text>

            <Text style={styles.label}>Customer Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
              value={bookingName}
              onChangeText={setBookingName}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#94A3B8"
              value={bookingPhone}
              onChangeText={setBookingPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <Text style={styles.label}>Booking Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write message to builder"
              placeholderTextColor="#94A3B8"
              value={message}
              onChangeText={setMessage}
              multiline
            />

            <TouchableOpacity style={styles.submitBtn} onPress={submitBooking}>
              <Text style={styles.submitText}>Submit Booking Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E8F5F5" },
  topHeader: {
    height: 64,
    backgroundColor: "#0D6E6E",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 21, fontWeight: "900" },
  profileIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 30 },
  dashboardCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  dashboardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dashboardTitle: {
    color: "#1A2E2E",
    fontSize: 17,
    fontWeight: "900",
  },
  dashboardSub: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "700",
  },
  bellButton: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: "#0D6E6E",
    alignItems: "center",
    justifyContent: "center",
  },
  bellButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  statValue: {
    color: "#0D6E6E",
    fontSize: 21,
    fontWeight: "900",
  },
  statLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
  },
  sectionTitle: { color: "#1A2E2E", fontSize: 20, fontWeight: "900", marginBottom: 12 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: { color: "#1A2E2E", fontSize: 18, fontWeight: "900", marginTop: 10 },
  emptySub: { color: "#64748B", fontSize: 13, textAlign: "center", lineHeight: 20, marginTop: 6 },
  unitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    marginBottom: 18,
  },
  unitImage: { height: 190 },
  unitImageStyle: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  imageOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.20)",
    padding: 14,
    alignItems: "flex-end",
  },
  statusBadge: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: "900" },
  unitBody: { padding: 16 },
  unitName: { color: "#0F172A", fontSize: 21, fontWeight: "900" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  locationText: { color: "#64748B", marginLeft: 5, fontSize: 13, flex: 1, fontWeight: "700" },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 15 },
  detailBox: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  detailLabel: { color: "#64748B", fontSize: 11, marginTop: 6, fontWeight: "700" },
  detailValue: { color: "#0F172A", fontSize: 14, fontWeight: "900", marginTop: 2 },
  price: { color: "#15803D", fontSize: 20, fontWeight: "900", marginTop: 4 },
  description: { color: "#64748B", fontSize: 13, lineHeight: 20, marginTop: 8 },
  buyerDocsBox: {
    marginTop: 12,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    borderRadius: 16,
    padding: 12,
  },
  buyerDocsTitle: {
    color: "#134E4A",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },
  buyerDocRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: "#CCFBF1",
  },
  buyerDocName: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "900",
  },
  buyerDocMeta: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  actionRow: { flexDirection: "row", marginTop: 18 },
  visitBtn: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#1A7A7A",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginRight: 8,
  },
  bookingBtn: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#387d3a",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  actionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginLeft: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { color: "#1A2E2E", fontSize: 20, fontWeight: "900" },
  modalSub: { color: "#3D6E6E", fontSize: 13, fontWeight: "800", marginTop: 8, marginBottom: 8 },
  label: { color: "#0F172A", fontSize: 13, fontWeight: "900", marginTop: 12, marginBottom: 7 },
  input: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    color: "#0F172A",
    fontSize: 14,
  },
  pickerButton: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  pickerText: { color: "#1A7A7A", fontSize: 14, fontWeight: "800", marginLeft: 10 },
  textArea: { height: 88, paddingTop: 12, textAlignVertical: "top" },
  submitBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#1A7A7A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
});
