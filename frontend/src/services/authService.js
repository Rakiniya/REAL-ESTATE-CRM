import api from "./api";

const authService = {
  async login(email, password) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { access_token } = response.data;

    localStorage.setItem("access_token", access_token);

    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get("/auth/me");

    localStorage.setItem("user", JSON.stringify(response.data));

    return response.data;
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },

  getStoredUser() {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem("access_token"));
  },
};

export default authService;