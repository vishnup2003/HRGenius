import API from "./api";

export const getAllPayroll = async () => {
  const response = await API.get("/payroll");
  return response.data;
};

export const getPayrollById = async (id) => {
  const response = await API.get(`/payroll/${id}`);
  return response.data;
};

export const getPayrollByEmployee = async (employeeId) => {
  const response = await API.get(`/payroll/employee/${employeeId}`);
  return response.data;
};

export const createPayroll = async (payrollData) => {
  const response = await API.post("/payroll", payrollData);
  return response.data;
};

export const updatePayroll = async (id, payrollData) => {
  const response = await API.put(`/payroll/${id}`, payrollData);
  return response.data;
};

export const updatePaymentStatus = async (id, status) => {
  const response = await API.patch(`/payroll/${id}/status`, {
    status,
  });
  return response.data;
};

export const deletePayroll = async (id) => {
  const response = await API.delete(`/payroll/${id}`);
  return response.data;
};
