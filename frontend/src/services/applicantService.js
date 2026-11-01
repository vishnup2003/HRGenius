import API from "./api";

export const getAllApplicants = async () => {
  const response = await API.get("/applicants");
  return response.data;
};

export const getApplicantById = async (id) => {
  const response = await API.get(`/applicants/${id}`);
  return response.data;
};

export const createApplicant = async (applicant) => {
  const response = await API.post("/applicants", applicant);
  return response.data;
};

export const updateApplicant = async (id, applicant) => {
  const response = await API.put(`/applicants/${id}`, applicant);
  return response.data;
};

export const updateApplicantStatus = async (id, status) => {
  const response = await API.patch(`/applicants/${id}/status`, {
    status
  });
  return response.data;
};

export const deleteApplicant = async (id) => {
  await API.delete(`/applicants/${id}`);
};
