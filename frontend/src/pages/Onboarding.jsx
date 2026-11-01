import React, { useEffect, useState } from "react";

import {
  getAllOnboarding,
  createOnboarding,
  updateOnboarding,
  updateOnboardingStatus,
  updateDocumentVerification,
  deleteOnboarding
} from "../services/onboardingService";

import { getAllApplicants } from "../services/applicantService";

import {
  Plus,
  Search,
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  X,
  RefreshCw,
  Trash2,
  Pencil,
  FileCheck
} from "lucide-react";

import "./Onboarding.css";

const initialForm = {
  applicantId: "",
  department: "",
  designation: "",
  joiningDate: ""
};

const statuses = ["Not Started", "In Progress", "Completed"];

function Onboarding() {
  const [records, setRecords] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [allApplicants, setAllApplicants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [onboardingData, applicantData] = await Promise.all([
        getAllOnboarding(),
        getAllApplicants()
      ]);

      setRecords(onboardingData);
      setAllApplicants(applicantData);

      const availableApplicants = applicantData.filter(
        (applicant) =>
            !onboardingData.some(
            (record) => record.applicantId === applicant.id
            )
        );

      setApplicants(availableApplicants);
    } catch (err) {
      setError("Unable to load onboarding data. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getApplicant = (applicantId) => {
    return applicants.find(
      (applicant) => applicant.id === applicantId
    );
  };

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

  const openEditModal = async (record) => {
    setEditingId(record.id);

    setForm({
      applicantId: String(record.applicantId),
      department: record.department,
      designation: record.designation,
      joiningDate: record.joiningDate
    });

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingId) {
        const { applicantId, ...updatedDetails } = form;

        await updateOnboarding(editingId, updatedDetails);

        alert("Onboarding details updated successfully!");
      } else {
        const onboardingData = {
          ...form,
          applicantId: Number(form.applicantId)
        };

        await createOnboarding(onboardingData);

        alert("Onboarding record created successfully!");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(initialForm);

      await fetchData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to save onboarding record."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateOnboardingStatus(id, status);
      await fetchData();
    } catch (err) {
      alert("Unable to update onboarding status.");
    }
  };

  const handleDocumentChange = async (id, verified) => {
    try {
      await updateDocumentVerification(id, verified);
      await fetchData();
    } catch (err) {
      alert("Unable to update document verification.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this onboarding record?")) {
      return;
    }

    try {
      await deleteOnboarding(id);
      await fetchData();
      alert("Onboarding record deleted successfully!");
    } catch (err) {
      alert("Unable to delete onboarding record.");
    }
  };

  const filteredRecords = records.filter((record) => {
    const applicant = allApplicants.find(
      (a) => a.id === record.applicantId
    );

    const applicantName = applicant
      ? `${applicant.firstName} ${applicant.lastName}`
      : `Applicant #${record.applicantId}`;

    return `${applicantName} ${record.department} ${record.designation}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const completedCount = records.filter(
    (r) => r.onboardingStatus === "Completed"
  ).length;

  const inProgressCount = records.filter(
    (r) => r.onboardingStatus === "In Progress"
  ).length;

  const documentsVerifiedCount = records.filter(
    (r) => r.documentsVerified === true
  ).length;

  const getApplicantName = (applicantId) => {
  const applicant = allApplicants.find(
    (a) => a.id === applicantId
  );

  if (!applicant) {
    return `Applicant #${applicantId}`;
  }

  return `${applicant.firstName} ${applicant.lastName}`;
};

  return (
    <div className="onboarding-page">

      <div className="onboarding-header">
        <div>
          <h1>Onboarding Management</h1>
          <p>Manage new employee joining and onboarding progress.</p>
        </div>

        <button className="add-onboarding-btn" onClick={openAddModal}>
          <Plus size={18} />
          Start Onboarding
        </button>
      </div>

      <div className="onboarding-stats">

        <div className="onboarding-stat-card">
          <div className="onboarding-stat-icon blue">
            <Users size={22} />
          </div>
          <div>
            <p>Total Onboarding</p>
            <h2>{records.length}</h2>
          </div>
        </div>

        <div className="onboarding-stat-card">
          <div className="onboarding-stat-icon orange">
            <Clock size={22} />
          </div>
          <div>
            <p>In Progress</p>
            <h2>{inProgressCount}</h2>
          </div>
        </div>

        <div className="onboarding-stat-card">
          <div className="onboarding-stat-icon green">
            <CheckCircle size={22} />
          </div>
          <div>
            <p>Completed</p>
            <h2>{completedCount}</h2>
          </div>
        </div>

        <div className="onboarding-stat-card">
          <div className="onboarding-stat-icon purple">
            <FileCheck size={22} />
          </div>
          <div>
            <p>Documents Verified</p>
            <h2>{documentsVerifiedCount}</h2>
          </div>
        </div>

      </div>

      <div className="onboarding-table-card">

        <div className="onboarding-toolbar">
          <div>
            <h2>Onboarding Records</h2>
            <p>Track employee joining and document verification.</p>
          </div>

          <div className="onboarding-actions">
            <div className="onboarding-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search onboarding..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className="onboarding-refresh-btn"
              onClick={fetchData}
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {error && <div className="onboarding-error">{error}</div>}

        {loading ? (
          <div className="onboarding-message">
            Loading onboarding records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="onboarding-message">
            {search
              ? "No matching onboarding records found."
              : "No onboarding records available. Click Start Onboarding to get started."}
          </div>
        ) : (

          <div className="onboarding-table-wrapper">
            <table className="onboarding-table">
              <thead>
                <tr>
                  <th>Employee / Applicant</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th>Documents</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>

                    <td>
                      <div className="onboarding-person">
                        <div className="onboarding-avatar">
                          <UserCheck size={18} />
                        </div>

                        <div>
                          <strong>
                            {getApplicantName(record.applicantId)}
                          </strong>
                          <span>Applicant ID: {record.applicantId}</span>
                        </div>
                      </div>
                    </td>

                    <td>{record.department}</td>

                    <td>{record.designation}</td>

                    <td>{record.joiningDate}</td>

                    <td>
                      <select
                        className={`onboarding-status status-${record.onboardingStatus?.toLowerCase().replace(" ", "-")}`}
                        value={record.onboardingStatus}
                        onChange={(e) =>
                          handleStatusChange(record.id, e.target.value)
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
                      <label className="document-checkbox">
                        <input
                          type="checkbox"
                          checked={Boolean(record.documentsVerified)}
                          onChange={(e) =>
                            handleDocumentChange(record.id, e.target.checked)
                          }
                        />
                        <span>
                          {record.documentsVerified ? "Verified" : "Pending"}
                        </span>
                      </label>
                    </td>

                    <td>
                      <div className="onboarding-row-actions">

                        <button
                          onClick={() => openEditModal(record)}
                          title="Edit"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="delete"
                          onClick={() => handleDelete(record.id)}
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
          className="onboarding-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="onboarding-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="onboarding-modal-header">
              <div>
                <h2>
                  {editingId ? "Edit Onboarding" : "Start New Onboarding"}
                </h2>
                <p>Enter the applicant's joining information.</p>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="onboarding-form-grid">

                {!editingId && (
                  <div className="onboarding-form-group full-width">
                    <label>Select Applicant *</label>

                    <select
                      name="applicantId"
                      value={form.applicantId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose an applicant</option>

                      {applicants.map((applicant) => (
                        <option
                          key={applicant.id}
                          value={applicant.id}
                        >
                          {applicant.firstName} {applicant.lastName}
                          {" — "}
                          {applicant.appliedFor}
                        </option>
                      ))}
                    </select>

                    {applicants.length === 0 && (
                      <small>
                        No available applicants. Add an applicant first.
                      </small>
                    )}
                  </div>
                )}

                <div className="onboarding-form-group">
                  <label>Department *</label>
                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Engineering"
                    required
                  />
                </div>

                <div className="onboarding-form-group">
                  <label>Designation *</label>
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g. Java Developer"
                    required
                  />
                </div>

                <div className="onboarding-form-group full-width">
                  <label>Joining Date *</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="onboarding-modal-footer">
                <button
                  type="button"
                  className="onboarding-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="onboarding-save-btn"
                  disabled={saving || (!editingId && applicants.length === 0)}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Onboarding"
                      : "Start Onboarding"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Onboarding;
