
import React, { useEffect, useState } from "react";

import {
  getAllJobs,
  createJob,
  updateJobStatus,
  deleteJob
} from "../services/jobService";

import {
  BriefcaseBusiness,
  Plus,
  Search,
  Users,
  X,
  MapPin,
  Trash2,
  Eye,
  RefreshCw
} from "lucide-react";

import "./Recruitment.css";

const initialForm = {
  title: "",
  department: "",
  location: "",
  employmentType: "Full Time",
  openings: 1
};

function Recruitment() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);

  // FETCH JOBS FROM BACKEND
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllJobs();
      setJobs(data);
    } catch (err) {
      setError("Unable to load jobs. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // HANDLE FORM INPUTS
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // CREATE JOB
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const jobData = {
        ...form,
        openings: Number(form.openings)
      };

      await createJob(jobData);

      setShowModal(false);
      setForm(initialForm);

      await fetchJobs();

      alert("Job opening created successfully!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to create job opening."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE JOB
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      await deleteJob(id);
      await fetchJobs();

      alert("Job deleted successfully!");
    } catch (err) {
      alert("Failed to delete job.");
    }
  };

  // CLOSE OR REOPEN JOB
  const toggleStatus = async (job) => {
    const newStatus =
      job.status === "Active" ? "Closed" : "Active";

    try {
      await updateJobStatus(job.id, newStatus);
      await fetchJobs();

      alert(`Job ${newStatus.toLowerCase()} successfully!`);
    } catch (err) {
      alert("Failed to update job status.");
    }
  };

  // SEARCH JOBS
  const filteredJobs = jobs.filter((job) =>
    `${job.title} ${job.department} ${job.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // DASHBOARD STATISTICS
  const totalApplicants = jobs.reduce(
    (total, job) => total + (job.applicants || 0),
    0
  );

  const activeJobs = jobs.filter(
    (job) => job.status === "Active"
  ).length;

  const totalOpenings = jobs
    .filter((job) => job.status === "Active")
    .reduce(
      (total, job) => total + (job.openings || 0),
      0
    );

  // VIEW JOB DETAILS
  const handleView = (job) => {
    alert(
      `Job Details\n\n` +
      `Title: ${job.title}\n` +
      `Department: ${job.department}\n` +
      `Location: ${job.location}\n` +
      `Employment Type: ${job.employmentType}\n` +
      `Openings: ${job.openings}\n` +
      `Applicants: ${job.applicants || 0}\n` +
      `Status: ${job.status}\n` +
      `Posted Date: ${job.postedDate || "N/A"}`
    );
  };

  return (
    <div className="recruitment-page">

      {/* PAGE HEADER */}
      <div className="recruitment-header">
        <div>
          <h1>Recruitment Management</h1>
          <p>Manage job openings and track your hiring process.</p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>

          <button
            className="refresh-button"
            onClick={fetchJobs}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="add-job-button"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            Create Job Opening
          </button>

        </div>
      </div>

      {/* STATISTICS */}
      <div className="recruitment-stats">

        <div className="recruitment-stat-card">
          <div className="recruitment-stat-icon purple">
            <BriefcaseBusiness size={23} />
          </div>

          <div>
            <h2>{jobs.length}</h2>
            <p>Total Job Openings</p>
          </div>
        </div>

        <div className="recruitment-stat-card">
          <div className="recruitment-stat-icon green">
            <BriefcaseBusiness size={23} />
          </div>

          <div>
            <h2>{activeJobs}</h2>
            <p>Active Jobs</p>
          </div>
        </div>

        <div className="recruitment-stat-card">
          <div className="recruitment-stat-icon blue">
            <Users size={23} />
          </div>

          <div>
            <h2>{totalApplicants}</h2>
            <p>Total Applicants</p>
          </div>
        </div>

        <div className="recruitment-stat-card">
          <div className="recruitment-stat-icon orange">
            <Users size={23} />
          </div>

          <div>
            <h2>{totalOpenings}</h2>
            <p>Available Positions</p>
          </div>
        </div>

      </div>

      {/* JOB LIST */}
      <div className="recruitment-table-card">

        <div className="recruitment-toolbar">
          <h3>All Job Openings</h3>

          <div className="recruitment-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="employee-message">
            Loading job openings...
          </p>
        ) : error ? (
          <div>
            <p className="employee-error">{error}</p>

            <button onClick={fetchJobs}>
              Try Again
            </button>
          </div>
        ) : (
          <div className="recruitment-table-wrapper">

            <table className="recruitment-table">

              <thead>
                <tr>
                  <th>JOB TITLE</th>
                  <th>DEPARTMENT</th>
                  <th>LOCATION</th>
                  <th>OPENINGS</th>
                  <th>APPLICANTS</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {filteredJobs.map((job) => (
                  <tr key={job.id}>

                    <td>
                      <strong>{job.title}</strong>
                      <small>{job.employmentType}</small>
                    </td>

                    <td>{job.department}</td>

                    <td>
                      <span className="job-location">
                        <MapPin size={14} />
                        {job.location}
                      </span>
                    </td>

                    <td>{job.openings}</td>

                    <td>
                      <span className="applicant-count">
                        <Users size={15} />
                        {job.applicants || 0}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`job-status ${
                          job.status === "Active"
                            ? "active"
                            : "closed"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td>
                      <div className="job-actions">

                        <button
                          className="view-job-button"
                          title="View job details"
                          onClick={() => handleView(job)}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          className="toggle-job-button"
                          onClick={() => toggleStatus(job)}
                          title="Change job status"
                        >
                          {job.status === "Active"
                            ? "Close"
                            : "Reopen"}
                        </button>

                        <button
                          className="delete-job-button"
                          title="Delete job"
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

                {filteredJobs.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="recruitment-empty"
                    >
                      No job openings found.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>

          </div>
        )}
      </div>

      {/* CREATE JOB MODAL */}
      {showModal && (
        <div
          className="recruitment-modal-overlay"
          onClick={() => !saving && setShowModal(false)}
        >

          <div
            className="recruitment-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="recruitment-modal-header">
              <div>
                <h2>Create Job Opening</h2>
                <p>Add a new vacancy to your organization.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="recruitment-close"
                disabled={saving}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="recruitment-form-grid">

                <div className="recruitment-form-group full">
                  <label>Job Title *</label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Java Developer"
                    required
                  />
                </div>

                <div className="recruitment-form-group">
                  <label>Department *</label>

                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="IT">IT</option>
                  </select>
                </div>

                <div className="recruitment-form-group">
                  <label>Location *</label>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Noida / Remote"
                    required
                  />
                </div>

                <div className="recruitment-form-group">
                  <label>Employment Type *</label>

                  <select
                    name="employmentType"
                    value={form.employmentType}
                    onChange={handleChange}
                    required
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div className="recruitment-form-group">
                  <label>Number of Openings *</label>

                  <input
                    type="number"
                    name="openings"
                    value={form.openings}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

              </div>

              <div className="recruitment-modal-actions">

                <button
                  type="button"
                  className="recruitment-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="recruitment-submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Create Job"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Recruitment;
