import { useEffect, useState } from "react";
import {
  getAllPerformance,
  createPerformance,
  updatePerformance,
  updatePerformanceStatus,
  deletePerformance,
} from "../services/performanceService";
import { getAllEmployees } from "../services/employeeService";
import "./Performance.css";

function Performance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const initialForm = {
    employeeId: "",
    reviewPeriod: "Q4-2026",
    communicationRating: 3,
    technicalRating: 3,
    teamworkRating: 3,
    productivityRating: 3,
    goals: "",
    achievements: "",
    managerFeedback: "",
  };

  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [performanceData, employeeData] = await Promise.all([
        getAllPerformance(),
        getAllEmployees(),
      ]);

      setRecords(performanceData);
      setEmployees(employeeData);
    } catch (err) {
      console.error("Error fetching performance data:", err);
      setError("Unable to load performance data. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const averageRating =
    records.length > 0
      ? records.reduce(
          (total, record) => total + Number(record.overallRating || 0),
          0
        ) / records.length
      : 0;

  const reviewedCount = records.filter(
    (record) => record.performanceStatus === "Reviewed"
  ).length;

  const pendingCount = records.filter(
    (record) => record.performanceStatus === "Pending"
  ).length;

  const overallRating =
    (
      (Number(form.communicationRating) +
        Number(form.technicalRating) +
        Number(form.teamworkRating) +
        Number(form.productivityRating)) /
      4
    ).toFixed(2);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const employee = employees.find(
      (item) => String(item.id) === String(form.employeeId)
    );

    if (!editingId && !employee) {
      alert("Please select a valid employee.");
      return;
    }

    const performanceData = {
      employeeId: Number(employee?.id),
      employeeName: employee
        ? `${employee.firstName} ${employee.lastName}`
        : undefined,
      department: employee?.department,
      reviewPeriod: form.reviewPeriod,
      communicationRating: Number(form.communicationRating),
      technicalRating: Number(form.technicalRating),
      teamworkRating: Number(form.teamworkRating),
      productivityRating: Number(form.productivityRating),
      goals: form.goals,
      achievements: form.achievements,
      managerFeedback: form.managerFeedback,
    };

    try {
      if (editingId) {
        await updatePerformance(editingId, performanceData);
        alert("Performance review updated successfully!");
      } else {
        await createPerformance(performanceData);
        alert("Performance review created successfully!");
      }

      resetForm();
      await fetchData();
    } catch (err) {
      console.error("Error saving performance review:", err);
      alert(
        err.response?.data?.message ||
        "Unable to save performance review. Check whether a review already exists for this employee and period."
      );
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);

    setForm({
      employeeId: String(record.employeeId),
      reviewPeriod: record.reviewPeriod,
      communicationRating: record.communicationRating,
      technicalRating: record.technicalRating,
      teamworkRating: record.teamworkRating,
      productivityRating: record.productivityRating,
      goals: record.goals || "",
      achievements: record.achievements || "",
      managerFeedback: record.managerFeedback || "",
    });

    setShowForm(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updatePerformanceStatus(id, status);
      await fetchData();
    } catch (err) {
      console.error("Error updating review status:", err);
      alert(err.response?.data?.message || "Unable to update review status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this performance review?")) {
      return;
    }

    try {
      await deletePerformance(id);
      await fetchData();
    } catch (err) {
      console.error("Error deleting performance review:", err);
      alert("Unable to delete performance review.");
    }
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 3.5) return "Good";
    if (rating >= 2.5) return "Average";
    if (rating >= 1.5) return "Needs Improvement";
    return "Poor";
  };

  return (
    <div className="performance-page">
      <div className="performance-header">
        <div>
          <h1>Performance Management</h1>
          <p>Evaluate employee performance and track achievements.</p>
        </div>

        <button
          className="performance-add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Performance Review
        </button>
      </div>

      {error && <div className="performance-error">{error}</div>}

      <div className="performance-stats">
        <div className="performance-stat-card">
          <span>Total Reviews</span>
          <h2>{records.length}</h2>
        </div>

        <div className="performance-stat-card">
          <span>Average Rating</span>
          <h2>{averageRating.toFixed(2)} / 5</h2>
        </div>

        <div className="performance-stat-card">
          <span>Reviewed</span>
          <h2>{reviewedCount}</h2>
        </div>

        <div className="performance-stat-card">
          <span>Pending Reviews</span>
          <h2>{pendingCount}</h2>
        </div>
      </div>

      {showForm && (
        <div className="performance-form-card">
          <div className="performance-form-header">
            <h2>{editingId ? "Edit Performance Review" : "Add Performance Review"}</h2>
            <button type="button" onClick={resetForm}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="performance-form-grid">
              <div className="performance-field">
                <label>Employee</label>
                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  required
                  disabled={Boolean(editingId)}
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} — {employee.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="performance-field">
                <label>Review Period</label>
                <select
                  name="reviewPeriod"
                  value={form.reviewPeriod}
                  onChange={handleChange}
                  required
                  disabled={Boolean(editingId)}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Q1-2026">Q1-2026</option>
                  <option value="Q2-2026">Q2-2026</option>
                  <option value="Q3-2026">Q3-2026</option>
                  <option value="Q4-2026">Q4-2026</option>
                  <option value="Annual-2026">Annual-2026</option>
                </select>
              </div>

              <div className="performance-field">
                <label>Communication Rating (1–5)</label>
                <select
                  name="communicationRating"
                  value={form.communicationRating}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>{rating} / 5</option>
                  ))}
                </select>
              </div>

              <div className="performance-field">
                <label>Technical Rating (1–5)</label>
                <select
                  name="technicalRating"
                  value={form.technicalRating}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>{rating} / 5</option>
                  ))}
                </select>
              </div>

              <div className="performance-field">
                <label>Teamwork Rating (1–5)</label>
                <select
                  name="teamworkRating"
                  value={form.teamworkRating}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>{rating} / 5</option>
                  ))}
                </select>
              </div>

              <div className="performance-field">
                <label>Productivity Rating (1–5)</label>
                <select
                  name="productivityRating"
                  value={form.productivityRating}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>{rating} / 5</option>
                  ))}
                </select>
              </div>

              <div className="performance-rating-preview">
                <span>Overall Rating</span>
                <h3>{overallRating} / 5</h3>
                <small>{getRatingLabel(Number(overallRating))}</small>
              </div>

              <div className="performance-field">
                <label>Goals</label>
                <textarea
                  name="goals"
                  value={form.goals}
                  onChange={handleChange}
                  placeholder="Enter employee goals..."
                  rows="3"
                />
              </div>

              <div className="performance-field">
                <label>Achievements</label>
                <textarea
                  name="achievements"
                  value={form.achievements}
                  onChange={handleChange}
                  placeholder="Enter employee achievements..."
                  rows="3"
                />
              </div>

              <div className="performance-field">
                <label>Manager Feedback</label>
                <textarea
                  name="managerFeedback"
                  value={form.managerFeedback}
                  onChange={handleChange}
                  placeholder="Enter manager feedback..."
                  rows="3"
                />
              </div>
            </div>

            <div className="performance-form-actions">
              <button
                type="button"
                className="performance-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button type="submit" className="performance-save-btn">
                {editingId ? "Update Review" : "Save Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="performance-table-card">
        <div className="performance-table-header">
          <div>
            <h2>Employee Performance Reviews</h2>
            <p>Review ratings and manager feedback</p>
          </div>
        </div>

        {loading ? (
          <p className="performance-message">Loading performance reviews...</p>
        ) : records.length === 0 ? (
          <p className="performance-message">No performance reviews found.</p>
        ) : (
          <div className="performance-table-wrapper">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Review Period</th>
                  <th>Communication</th>
                  <th>Technical</th>
                  <th>Teamwork</th>
                  <th>Productivity</th>
                  <th>Overall Rating</th>
                  <th>Review Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.employeeName}</strong>
                      <small>ID: {record.employeeId}</small>
                    </td>
                    <td>{record.department}</td>
                    <td>{record.reviewPeriod}</td>
                    <td>{record.communicationRating}/5</td>
                    <td>{record.technicalRating}/5</td>
                    <td>{record.teamworkRating}/5</td>
                    <td>{record.productivityRating}/5</td>
                    <td>
                      <strong>{Number(record.overallRating).toFixed(2)}/5</strong>
                      <small>{getRatingLabel(Number(record.overallRating))}</small>
                    </td>
                    <td>{record.reviewDate || "—"}</td>
                    <td>
                      <span
                        className={`performance-status ${
                          record.performanceStatus === "Reviewed" ? "reviewed" : "pending"
                        }`}
                      >
                        {record.performanceStatus}
                      </span>
                    </td>
                    <td>
                      <div className="performance-actions">
                        <button
                          className="performance-edit-btn"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </button>

                        <select
                          className="performance-status-select"
                          value={record.performanceStatus}
                          onChange={(e) =>
                            handleStatusChange(record.id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Reviewed">Reviewed</option>
                        </select>

                        <button
                          className="performance-delete-btn"
                          onClick={() => handleDelete(record.id)}
                        >
                          Delete
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
    </div>
  );
}

export default Performance;
