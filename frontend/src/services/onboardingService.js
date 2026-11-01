import API from "./api";

export const getAllOnboarding = async () => {
  const response = await API.get("/onboarding");
  return response.data;
};

export const getOnboardingById = async (id) => {
  const response = await API.get(`/onboarding/${id}`);
  return response.data;
};

export const createOnboarding = async (onboarding) => {
  const response = await API.post("/onboarding", onboarding);
  return response.data;
};

export const updateOnboarding = async (id, onboarding) => {
  const response = await API.put(`/onboarding/${id}`, onboarding);
  return response.data;
};

export const updateOnboardingStatus = async (id, status) => {
  const response = await API.patch(`/onboarding/${id}/status`, {
    status
  });
  return response.data;
};

export const updateDocumentVerification = async (id, verified) => {
  const response = await API.patch(`/onboarding/${id}/documents`, {
    verified
  });
  return response.data;
};

export const deleteOnboarding = async (id) => {
  await API.delete(`/onboarding/${id}`);
};
