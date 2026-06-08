



import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';

import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import InfoBanner from '../../components/SAInfoBanner';
import COLORS from '../../theme/SAcolors';
import { useAppContext } from './SocietyContext';
import { useAuthStore } from '../../store/AuthStore';
import { useFocusEffect } from '@react-navigation/native';

export default function BuildersScreen({ navigation }) {
  const { builders, builderRequests, projectRequests, builderProjects, refreshProjectRequests } =
    useAppContext();
  const { superAdminPending, fetchSuperAdminPending } = useAuthStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchSuperAdminPending();
      refreshProjectRequests && refreshProjectRequests();
    }, [])
  );

  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [buildersListModalVisible, setBuildersListModalVisible] = useState(false);

  const pendingBuilders = (Array.isArray(superAdminPending) ? superAdminPending : []).filter(
    (item) => item.role === 'builder'
  );

  const pendingProjects = (projectRequests || []).filter(
    item => item.approvalStatus === 'Pending'
  );

  const approvedProjects = (builderProjects || []).filter(
    item => item.approvalStatus === 'Approved'
  );

  const approvedBuilders = (builders || []).filter(
    item => item.status === 'Approved' || item.status === 'Active'
  );

  return (
    <ScreenWrapper>
      <AppHeader
        title="Builder Oversight"
        subtitle="Builder approvals, project approvals, and customer sharing"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <InfoBanner text="Super Admin verifies builder registrations and approves new builder projects. Approved LIVE projects become visible to customers automatically." />

        <View style={styles.topButtonsRow}>
          <TouchableOpacity
            style={styles.topActionBtn}
            onPress={() => setRequestModalVisible(true)}
          >
            <Text style={styles.topActionBtnText}>Builder Requests</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingBuilders.length}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topActionBtn}
            onPress={() => setBuildersListModalVisible(true)}
          >
            <Text style={styles.topActionBtnText}>Builders List</Text>
            <View style={styles.badgeSecondary}>
              <Text style={styles.badgeSecondaryText}>
                {approvedBuilders.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pendingProjects.length}</Text>
            <Text style={styles.statLabel}>Pending Projects</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{approvedProjects.length}</Text>
            <Text style={styles.statLabel}>Approved Projects</Text>
          </View>
        </View>

        <SectionHeader
          title="New Project Approval Requests"
          actionText={`${pendingProjects.length} pending`}
        />

        {pendingProjects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No pending project requests</Text>
            <Text style={styles.emptySub}>
              New projects created by builders will appear here for approval.
            </Text>
          </View>
        ) : (
          pendingProjects.map(project => (
            <TouchableOpacity
              key={project.id}
              activeOpacity={0.9}
              style={styles.requestCard}
              onPress={() =>
                navigation.navigate('ProjectRequestDetails', {
                  projectRequestId: project.id,
                })
              }
            >
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestTitle}>{project.projectName}</Text>
                  <Text style={styles.requestSub}>
                    {project.builderName || 'Builder'} ·{' '}
                    {project.city || 'Hyderabad'}
                    {project.state ? `, ${project.state}` : ''}
                  </Text>
                </View>

                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>Pending</Text>
                </View>
              </View>

              <Text style={styles.requestSub}>RERA: {project.reraNumber}</Text>

              <Text style={styles.requestSub}>
                {project.towerCount || 0} Towers ·{' '}
                {project.totalUnits || project.availableUnits || 0} Flats
              </Text>

              {!!project.location && (
                <Text style={styles.requestSub}>
                  Location: {project.location}
                </Text>
              )}

              {!!project.priceRange && (
                <Text style={styles.requestPrice}>{project.priceRange}</Text>
              )}

              {!!project.possessionType && (
                <Text style={styles.requestSub}>
                  Possession: {project.possessionType}
                </Text>
              )}

              <Text style={styles.tapHint}>Tap to approve or reject project</Text>
            </TouchableOpacity>
          ))
        )}

        <SectionHeader
          title="Approved Builder Projects"
          actionText={`${approvedProjects.length} approved`}
        />

        {approvedProjects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No approved projects yet</Text>
            <Text style={styles.emptySub}>
              Approved projects will appear here. Builder can then share them to
              customers from builder side.
            </Text>
          </View>
        ) : (
          approvedProjects.map(project => (
            <View key={project.id} style={styles.approvedCard}>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestTitle}>{project.projectName}</Text>
                  <Text style={styles.requestSub}>
                    {project.builderName || 'Builder'} · {project.location}
                  </Text>
                </View>

                <View style={styles.approvedBadge}>
                  <Text style={styles.approvedBadgeText}>Approved</Text>
                </View>
              </View>

              <Text style={styles.requestSub}>
                {project.towerCount || 0} Towers ·{' '}
                {project.totalUnits || 0} Flats ·{' '}
                {project.availableUnits || 0} Available
              </Text>

              <Text style={styles.requestPrice}>{project.priceRange}</Text>

              {project.approvalStatus === 'Approved' && (project.status || 'LIVE') === 'LIVE' ? (
                <Text style={styles.sharedText}>Visible to Customers</Text>
              ) : (
                <Text style={styles.notSharedText}>Not visible to Customers</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={requestModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                New Builder Registration Requests
              </Text>

              <TouchableOpacity
                onPress={() => setRequestModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {pendingBuilders.length === 0 ? (
                <View style={styles.emptyCardModal}>
                  <Text style={styles.emptyTitle}>
                    No pending builder requests
                  </Text>
                  <Text style={styles.emptySub}>
                    New builder registrations will appear here.
                  </Text>
                </View>
              ) : (
                pendingBuilders.map(builder => {
                  let docs = {};
                  try {
                    if (builder.documentsJson) {
                      docs = JSON.parse(builder.documentsJson);
                      if (typeof docs === 'string') docs = JSON.parse(docs);
                    }
                  } catch (e) {}

                  return (
                    <TouchableOpacity
                      key={builder.id}
                      activeOpacity={0.9}
                      style={styles.modalCard}
                      onPress={() => {
                        setRequestModalVisible(false);
                        navigation.navigate('BuilderRequestDetails', {
                          builderRequestId: builder.id,
                        });
                      }}
                    >
                      <Text style={styles.requestTitle}>{builder.name}</Text>
                      <Text style={styles.requestSub}>RERA: {docs.rera || 'N/A'}</Text>
                      <Text style={styles.requestSub}>GST: {docs.gst || 'N/A'}</Text>
                      <Text style={styles.requestSub}>Phone: {builder.phone || 'N/A'}</Text>
                      <Text style={styles.tapHint}>
                        Tap to review full details and documents
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={buildersListModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBuildersListModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Registered Builders</Text>

              <TouchableOpacity
                onPress={() => setBuildersListModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {approvedBuilders.length === 0 ? (
                <View style={styles.emptyCardModal}>
                  <Text style={styles.emptyTitle}>No registered builders</Text>
                  <Text style={styles.emptySub}>
                    Approved builders will appear here.
                  </Text>
                </View>
              ) : (
                approvedBuilders.map(builder => (
                  <TouchableOpacity
                    key={builder.id}
                    activeOpacity={0.9}
                    style={styles.modalCard}
                    onPress={() => {
                      setBuildersListModalVisible(false);
                      navigation.navigate('BuilderDetails', { builder });
                    }}
                  >
                    <Text style={styles.requestTitle}>{builder.name}</Text>
                    <Text style={styles.requestSub}>
                      {builder.city} · {builder.projects || 0} active projects
                    </Text>
                    <Text style={styles.requestSub}>RERA: {builder.rera}</Text>
                    <Text style={styles.requestSub}>
                      Collections: {builder.collections || '₹0'}
                    </Text>
                    <Text style={styles.tapHint}>
                      Tap to view builder details
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 14,
    gap: 12,
    paddingHorizontal: 4,
  },
  topActionBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryNavy,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  topActionBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  badge: {
    marginLeft: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeSecondary: {
    marginLeft: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeSecondaryText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    color: COLORS.primaryNavy,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyCardModal: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  emptySub: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },

  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  approvedCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  requestSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  requestPrice: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '900',
    color: '#15803D',
  },
  tapHint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryNavy,
  },

  pendingBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pendingBadgeText: {
    color: '#C2410C',
    fontSize: 11,
    fontWeight: '900',
  },
  approvedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  approvedBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '900',
  },
  sharedText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 10,
  },
  notSharedText: {
    color: '#C2410C',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    paddingRight: 10,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalScrollContent: {
    paddingBottom: 10,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
