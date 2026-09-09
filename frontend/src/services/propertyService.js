import api from "./api";

const propertyService = {
  // =====================================================
  // PROJECTS
  // =====================================================

  async getProjects() {
    const response = await api.get("/properties/projects");
    return response.data;
  },

  async createProject(data) {
    const response = await api.post(
      "/properties/projects",
      data
    );

    return response.data;
  },

  async updateProject(projectId, data) {
    const response = await api.put(
      `/properties/projects/${projectId}`,
      data
    );

    return response.data;
  },

  // =====================================================
  // BUILDINGS
  // =====================================================

  async getBuildings(projectId) {
    const response = await api.get(
      `/properties/projects/${projectId}/buildings`
    );

    return response.data;
  },

  async createBuilding(projectId, data) {
    const response = await api.post(
      `/properties/projects/${projectId}/buildings`,
      data
    );

    return response.data;
  },

  async updateBuilding(buildingId, data) {
    const response = await api.put(
      `/properties/buildings/${buildingId}`,
      data
    );

    return response.data;
  },

  // =====================================================
  // UNITS
  // =====================================================

  async getUnits(buildingId) {
    const response = await api.get(
      `/properties/buildings/${buildingId}/units`
    );

    return response.data;
  },

  async createUnit(buildingId, data) {
    const response = await api.post(
      `/properties/buildings/${buildingId}/units`,
      data
    );

    return response.data;
  },

  async getAllUnits(params = {}) {
    const response = await api.get(
      "/properties/units",
      { params }
    );

    return response.data;
  },

  async getUnit(unitId) {
    const response = await api.get(
      `/properties/units/${unitId}`
    );

    return response.data;
  },

  async updateUnit(unitId, data) {
    const response = await api.put(
      `/properties/units/${unitId}`,
      data
    );

    return response.data;
  },
};

export default propertyService;