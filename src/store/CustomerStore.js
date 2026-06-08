/**
 * CustomerStore.js
 * Fetches live approved projects and units for the customer home screen.
 * Uses the exact same requestJson pattern as visitorApi.js and sosApi.js.
 *
 * Backend: GET /customer/projects → approved+LIVE projects with towers+units
 * GET /customer/projects/towers/{id}/units
 */

import { create } from 'zustand';
import { fetchApprovedProjects, fetchProjectTowers, fetchTowerUnits, fetchCustomerVisits } from '../api/builderApi';
import { useAuthStore } from './AuthStore';

const parseComplianceDocuments = (project = {}) => {
    if (Array.isArray(project.complianceDocuments)) return project.complianceDocuments;
    if (!project.complianceDocumentsJson) return [];
    try {
        const parsed = JSON.parse(project.complianceDocumentsJson);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        return [];
    }
};

const useCustomerStore = create((set, get) => ({
    projects: [],
    units: [],
    myVisits: [],
    isLoading: false,
    error: null,

    fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const { response, data } = await fetchApprovedProjects(token);

            if (!response || !response.ok) {
                set({ isLoading: false, error: 'Failed to fetch projects' });
                return;
            }

            const projects = Array.isArray(data) ? data : [];

            // Flatten all units from all towers across all approved projects.
            // Project.towers is intentionally not serialized by the backend, so
            // towers must be fetched from the customer tower endpoint.
            const allUnits = [];
            const hydratedProjects = [];
            for (const project of projects) {
                const complianceDocuments = parseComplianceDocuments(project);
                const towerResp = await fetchProjectTowers(token, project.id);
                const towers = towerResp.response && towerResp.response.ok && Array.isArray(towerResp.data)
                    ? towerResp.data
                    : [];
                const hydratedTowers = [];
                for (const tower of towers) {
                    const unitResp = await fetchTowerUnits(token, tower.id);
                    const units = unitResp.response && unitResp.response.ok && Array.isArray(unitResp.data)
                        ? unitResp.data
                        : [];
                    hydratedTowers.push({ ...tower, units });
                    if (unitResp.response && unitResp.response.ok && Array.isArray(unitResp.data)) {
                        unitResp.data.forEach((unit) => {
                            allUnits.push({
                                ...unit,
                                tower: tower.name,
                                towerId: tower.id,
                                projectId: project.id,
                                projectName: project.name || project.projectName,
                                projectLocation: project.location,
                                projectCoverImage: project.coverImage,
                                builderId: project.builderId || project.builder?.id,
                                builderName: project.builderName || project.builder?.name,
                                reraNumber: project.reraNumber,
                                complianceDocuments,
                                // Normalise status to match UI expectations
                                status: (unit.status || 'AVAILABLE').charAt(0).toUpperCase()
                                    + (unit.status || 'AVAILABLE').slice(1).toLowerCase(),
                            });
                        });
                    }
                }
                hydratedProjects.push({ ...project, complianceDocuments, towers: hydratedTowers });
            }

            set({ projects: hydratedProjects, units: allUnits, isLoading: false });
        } catch (err) {
            set({ isLoading: false, error: 'Network error' });
        }
    },
    // ADD: lets customer screens query their visit statuses independently
    fetchMyVisits: async () => {
        try {
            const token = useAuthStore.getState().token;
            const { response, data } = await fetchCustomerVisits(token);
            if (response && response.ok && Array.isArray(data)) {
                set({ myVisits: data });
                return { success: true, data };
            }
            return { success: false };
        } catch (err) {
            return { success: false };
        }
    },
}));

export default useCustomerStore;
