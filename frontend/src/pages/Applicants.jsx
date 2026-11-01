import React, { useEffect, useState } from "react";

import {
  getAllApplicants,
  createApplicant,
  updateApplicant,
  updateApplicantStatus,
  deleteApplicant
} from "../services/applicantService";

import {
  Plus,
  Search,
  Users,
  X,
  Trash2,
  Eye,
  RefreshCw,
  Pencil,
  UserCheck
} from "lucide-react";

import "./Applicants.css";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  appliedFor: ""
};

const statuses = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected"
];

function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllApplicants();
      setApplicants(data);
    } catch (err) {
      setError("Unable to load applicants. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (applicant) => {
    setEditingId(applicant.id);

    setForm({
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone || "",
      appliedFor: applicant.appliedFor
    });

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingId) {
        await updateApplicant(editingId, form);
        alert("Applicant updated successfully!");
      } else {
        await createApplicant(form);
        alert("Applicant added successfully!");
      }

      setShowModal(false);
      setForm(initialForm);
      setEditingId(null);

      await fetchApplicants();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to save applicant. Check the details."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateApplicantStatus(id, status);
      await fetchApplicants();
    } catch (err) {
      alert("Unable to update applicant status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this applicant?")) {
      return;
    }

    try {
      await deleteApplicant(id);
      await fetchApplicants();
      alert("Applicant deleted successfully!");
    } catch (err) {
      alert("Unable to delete applicant.");
    }
  };

  const handleView = (applicant) => {
    alert(
      `Applicant Details\n\n` +
      `Name: ${applicant.firstName} ${applicant.lastName}\n` +
      `Email: ${applicant.email}\n` +
      `Phone: ${applicant.phone || "N/A"}\n` +
      `Applied For: ${applicant.appliedFor}\n` +
      `Status: ${applicant.status}\n` +
      `Applied Date: ${applicant.appliedDate || "N/A"}`
    );
  };

  const filteredApplicants = applicants.filter((applicant) =>
    `${applicant.firstName} ${applicant.lastName} ${applicant.email} ${applicant.appliedFor}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const shortlistedCount = applicants.filter(
    (a) => a.status === "Shortlisted"
  ).length;

  const interviewCount = applicants.filter(
    (a) => a.status === "Interview"
  ).length;

  const selectedCount = applicants.filter(
    (a) => a.status === "Selected"
  ).length;

  return (
    <div className="applicants-page">

      <div className="applicants-header">
        <div>
          <h1>Applicants</h1>
          <p>Manage candidates and track their application progress.</p>
        </div>

        <button className="add-applicant-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add Applicant
        </button>
      </div>

      <div className="applicant-stats">

        <div className="applicant-stat-card">
          <div className="applicant-stat-icon blue">
            <Users size={22} />
          </div>
          <div>
            <p>Total Applicants</p>
            <h2>{applicants.length}</h2>
          </div>
        </div>

        <div className="applicant-stat-card">
          <div className="applicant-stat-icon purple">
            <UserCheck size={22} />
          </div>
          <div>
            <p>Shortlisted</p>
            <h2>{shortlistedCount}</h2>
          </div>
        </div>

        <div className="applicant-stat-card">
          <div className="applicant-stat-icon orange">
            <Users size={22} />
          </div>
          <div>
            <p>In Interview</p>
            <h2>{interviewCount}</h2>
          </div>
        </div>

        <div className="applicant-stat-card">
          <div className="applicant-stat-icon green">
            <UserCheck size={22} />
          </div>
          <div>
            <p>Selected</p>
            <h2>{selectedCount}</h2>
          </div>
        </div>

      </div>

      <div className="applicants-table-card">

        <div className="applicants-toolbar">
          <div>
            <h2>All Applicants</h2>
            <p>View and manage candidate applications.</p>
          </div>

          <div className="applicants-actions">
            <div className="applicant-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search applicants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className="applicant-refresh-btn"
              onClick={fetchApplicants}
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {error && <div className="applicant-error">{error}</div>}

        {loading ? (
          <div className="applicant-message">Loading applicants...</div>
        ) : filteredApplicants.length === 0 ? (
          <div className="applicant-message">
            {search
              ? "No applicants found matching your search."
              : "No applicants available. Click Add Applicant to get started."}
          </div>
        ) : (

          <div className="applicant-table-wrapper">
            <table className="applicant-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Applied For</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplicants.map((applicant) => (
                  <tr key={applicant.id}>

                    <td>
                      <div className="applicant-person">
                        <div className="applicant-avatar">
                          {applicant.firstName?.charAt(0)}
                          {applicant.lastName?.charAt(0)}
                        </div>

                        <div>
                          <strong>
                            {applicant.firstName} {applicant.lastName}
                          </strong>
                          <span>{applicant.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{applicant.appliedFor}</td>

                    <td>{applicant.appliedDate || "N/A"}</td>

                    <td>
                      <select
                        className={`applicant-status status-${applicant.status?.toLowerCase()}`}
                        value={applicant.status}
                        onChange={(e) =>
                          handleStatusChange(applicant.id, e.target.value)
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <div className="applicant-row-actions">

                        <button
                          onClick={() => handleView(applicant)}
                          title="View"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => openEditModal(applicant)}
                          title="Edit"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="delete"
                          onClick={() => handleDelete(applicant.id)}
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {showModal && (
        <div
          className="applicant-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="applicant-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="applicant-modal-header">
              <div>
                <h2>
                  {editingId ? "Edit Applicant" : "Add New Applicant"}
                </h2>
                <p>Enter candidate information below.</p>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="applicant-form-grid">

                <div className="applicant-form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="applicant-form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div className="applicant-form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="candidate@example.com"
                    required
                  />
                </div>

                <div className="applicant-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="applicant-form-group full-width">
                  <label>Applied For *</label>
                  <input
                    type="text"
                    name="appliedFor"
                    value={form.appliedFor}
                    onChange={handleChange}
                    placeholder="e.g. Java Backend Developer"
                    required
                  />
                </div>

              </div>

              <div className="applicant-modal-footer">
                <button
                  type="button"
                  className="applicant-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="applicant-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Applicant"
                      : "Add Applicant"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Applicants;
