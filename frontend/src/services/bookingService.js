import api from "./api";

const bookingService = {
  async getBookings() {
    const response = await api.get("/bookings");
    return response.data;
  },

  async getBooking(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async createBooking(data) {
    const response = await api.post("/bookings", data);
    return response.data;
  },

  async cancelBooking(id) {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
};

export default bookingService;