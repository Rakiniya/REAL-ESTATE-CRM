import api from "./api";

const leadService = {
  async getLeads(params = {}) {
    const response = await api.get("/leads", {
      params,
    });

    return response.data;
  },

  async getLead(id) {
    const response = await api.get(`/leads/${id}`);

    return response.data;
  },

  async createLead(data) {
    const response = await api.post("/leads", data);

    return response.data;
  },

  async updateLead(id, data) {
    const response = await api.put(`/leads/${id}`, data);

    return response.data;
  },

  async deleteLead(id) {
    const response = await api.delete(`/leads/${id}`);

    return response.data;
  },

  async getNotes(id) {
    const response = await api.get(`/leads/${id}/notes`);

    return response.data;
  },

  async addNote(id, note) {
    const response = await api.post(`/leads/${id}/notes`, {
      note,
    });

    return response.data;
  },
};

export default leadService;