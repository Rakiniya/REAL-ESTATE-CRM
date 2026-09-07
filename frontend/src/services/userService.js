import api from "./api";

const userService = {
  async getUsers() {
    const response = await api.get("/users");

    return response.data;
  },

  async getSalesEmployees() {
    const response = await api.get("/users/sales-employees");

    return response.data;
  },

  async createUser(data) {
    const response = await api.post("/users", data);

    return response.data;
  },
};

export default userService;