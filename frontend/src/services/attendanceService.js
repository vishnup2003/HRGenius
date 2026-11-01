import API from "./api";

export const getAllAttendance = async () => {
  const response = await API.get("/attendance");
  return response.data;
};

export const getAttendanceById = async (id) => {
  const response = await API.get(`/attendance/${id}`);
  return response.data;
};

export const getAttendanceByEmployee = async (employeeId) => {
  const response = await API.get(`/attendance/employee/${employeeId}`);
  return response.data;
};

export const getAttendanceByDate = async (date) => {
  const response = await API.get(`/attendance/date/${date}`);
  return response.data;
};

export const createAttendance = async (attendanceData) => {
  const response = await API.post("/attendance", attendanceData);
  return response.data;
};

export const updateAttendance = async (id, attendanceData) => {
  const response = await API.put(`/attendance/${id}`, attendanceData);
  return response.data;
};

export const updateAttendanceStatus = async (id, status) => {
  const response = await API.patch(`/attendance/${id}/status`, {
    status,
  });
  return response.data;
};

export const checkIn = async (id) => {
  const response = await API.patch(`/attendance/${id}/check-in`);
  return response.data;
};

export const checkOut = async (id) => {
  const response = await API.patch(`/attendance/${id}/check-out`);
  return response.data;
};

export const deleteAttendance = async (id) => {
  const response = await API.delete(`/attendance/${id}`);
  return response.data;
};
