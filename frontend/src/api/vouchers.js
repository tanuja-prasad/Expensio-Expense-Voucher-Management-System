import api from "./axios";

export const voucherApi = {
  create: (data) =>
    api.post("/vouchers", data),

  listMine: (status = "") =>
    api.get("/vouchers/my", {
      params: status ? { status } : {},
    }),

  getOne: (id) =>
    api.get(`/vouchers/${id}`),

  update: (id, data) =>
    api.put(`/vouchers/${id}`, data),

  remove: (id) =>
    api.delete(`/vouchers/${id}`),

  uploadSignature: (id, file) => {
    const formData = new FormData();
    formData.append("signature", file);

    return api.post(
      `/vouchers/${id}/signature`,
      formData
    );
  },

  useProfileSignature: (id) => api.post(`/vouchers/${id}/use-profile-signature`),
  submit: (id) =>
    api.post(`/vouchers/${id}/submit`),

  stats: () =>
    api.get("/vouchers/my/stats"),

  signature: (id) =>
    api.get(`/vouchers/${id}/signature`, {
      responseType: "blob",
    }),
};