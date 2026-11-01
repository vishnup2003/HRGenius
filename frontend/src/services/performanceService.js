import API from "./api";

export const getAllPerformance = async () => {
  const response = await API.get("/performance");
  return response.data;
};

export const getPerformanceById = async (id) => {
  const response = await API.get(`/performance/${id}`);
  return response.data;
};

export const getPerformanceByEmployee = async (employeeId) => {
  const response = await API.get(`/performance/employee/${employeeId}`);
  return response.data;
};

export const getPerformanceByDepartment = async (department) => {
  const response = await API.get(`/performance/department/${department}`);
  return response.data;
};

export const createPerformance = async (performanceData) => {
  const response = await API.post("/performance", performanceData);
  return response.data;
};

export const updatePerformance = async (id, performanceData) => {
  const response = await API.put(`/performance/${id}`, performanceData);
  return response.data;
};

export const updatePerformanceStatus = async (id, status) => {
  const response = await API.patch(`/performance/${id}/status`, {
    status,
  });
  return response.data;
};

export const deletePerformance = async (id) => {
  const response = await API.delete(`/performance/${id}`);
  return response.data;
};
