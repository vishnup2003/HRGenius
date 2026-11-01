import API from "./api";

export const getAllEmployees = async () => {
  const response = await API.get("/employees");
  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await API.get(`/employees/${id}`);
  return response.data;
};

export const createEmployee = async (employee) => {
  const response = await API.post("/employees", employee);
  return response.data;
};

export const updateEmployee = async (id, employee) => {
  const response = await API.put(`/employees/${id}`, employee);
  return response.data;
};

export const deleteEmployee = async (id) => {
  await API.delete(`/employees/${id}`);
};
