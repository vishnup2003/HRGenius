import API from "./api";

// Get all job openings
export const getAllJobs = async () => {
  const response = await API.get("/jobs");
  return response.data;
};

// Get job by ID
export const getJobById = async (id) => {
  const response = await API.get(`/jobs/${id}`);
  return response.data;
};

// Create new job
export const createJob = async (job) => {
  const response = await API.post("/jobs", job);
  return response.data;
};

// Update job
export const updateJob = async (id, job) => {
  const response = await API.put(`/jobs/${id}`, job);
  return response.data;
};

// Update job status
export const updateJobStatus = async (id, status) => {
  const response = await API.patch(`/jobs/${id}/status`, {
    status
  });
  return response.data;
};

// Delete job
export const deleteJob = async (id) => {
  await API.delete(`/jobs/${id}`);
};
