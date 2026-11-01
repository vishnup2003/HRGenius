
import { useEffect, useState } from "react";
import {
  getAllAttendance,
  createAttendance,
  updateAttendance,
  updateAttendanceStatus,
  checkIn,
  checkOut,
  deleteAttendance,
} from "../services/attendanceService";
import { getAllEmployees } from "../services/employeeService";
import "./Attendance.css";

function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState("");

  const initialForm = {
    employeeId: "",
    attendanceDate: new Date().toISOString().slice(0, 10),
    status: "Present",
    remarks: "",
  };

  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [attendanceData, employeeData] = await Promise.all([
        getAllAttendance(),
        getAllEmployees(),
      ]);

      setRecords(attendanceData);
      setEmployees(employeeData);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Unable to load attendance data. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const dailyRecords = records.filter(
    (record) => record.attendanceDate === selectedDate
  );

  const presentCount = dailyRecords.filter(
    (record) => record.status === "Present"
  ).length;

  const absentCount = dailyRecords.filter(
    (record) => record.status === "Absent"
  ).length;

  const halfDayCount = dailyRecords.filter(
    (record) => record.status === "Half-day"
  ).length;

  const leaveCount = dailyRecords.filter(
    (record) => record.status === "Leave"
  ).length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...initialForm,
      attendanceDate: selectedDate,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const employee = employees.find(
      (item) => String(item.id) === String(form.employeeId)
    );

    if (!employee) {
      alert("Please select a valid employee.");
      return;
    }

    const attendanceData = {
      employeeId: Number(employee.id),
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      attendanceDate: form.attendanceDate,
      status: form.status,
      remarks: form.remarks,
    };

    try {
      if (editingId) {
        await updateAttendance(editingId, attendanceData);
        alert("Attendance updated successfully!");
      } else {
        await createAttendance(attendanceData);
        alert("Attendance marked successfully!");
      }

      resetForm();
      await fetchData();
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert(
        err.response?.data?.message ||
        "Unable to save attendance. A record may already exist for this employee and date."
      );
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);

    setForm({
      employeeId: String(record.employeeId),
      attendanceDate: record.attendanceDate,
      status: record.status,
      remarks: record.remarks || "",
    });

    setShowForm(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAttendanceStatus(id, status);
      await fetchData();
    } catch (err) {
      console.error("Error updating attendance status:", err);
      alert(err.response?.data?.message || "Unable to update status.");
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await checkIn(id);
      await fetchData();
    } catch (err) {
      console.error("Check-in error:", err);
      alert(err.response?.data?.message || "Unable to check in.");
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await checkOut(id);
      await fetchData();
    } catch (err) {
      console.error("Check-out error:", err);
      alert(err.response?.data?.message || "Unable to check out.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    try {
      await deleteAttendance(id);
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Unable to delete attendance record.");
    }
  };

  const formatTime = (time) => {
    if (!time) return "—";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h1>Attendance Management</h1>
          <p>Track employee attendance, check-in and check-out.</p>
        </div>

        <button
          className="attendance-add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Mark Attendance
        </button>
      </div>

      {error && <div className="attendance-error">{error}</div>}

      <div className="attendance-date-filter">
        <label>Attendance Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="attendance-stats">
        <div className="attendance-stat-card">
          <span>Present</span>
          <h2>{presentCount}</h2>
        </div>

        <div className="attendance-stat-card">
          <span>Absent</span>
          <h2>{absentCount}</h2>
        </div>

        <div className="attendance-stat-card">
          <span>Half-day</span>
          <h2>{halfDayCount}</h2>
        </div>

        <div className="attendance-stat-card">
          <span>On Leave</span>
          <h2>{leaveCount}</h2>
        </div>
      </div>

      {showForm && (
        <div className="attendance-form-card">
          <div className="attendance-form-header">
            <h2>{editingId ? "Edit Attendance" : "Mark Attendance"}</h2>
            <button type="button" onClick={resetForm}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="attendance-form-grid">
              <div className="attendance-field">
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

              <div className="attendance-field">
                <label>Attendance Date</label>
                <input
                  type="date"
                  name="attendanceDate"
                  value={form.attendanceDate}
                  onChange={handleChange}
                  required
                  disabled={Boolean(editingId)}
                />
              </div>

              <div className="attendance-field">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>

              <div className="attendance-field">
                <label>Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  placeholder="Optional remarks"
                />
              </div>
            </div>

            <div className="attendance-form-actions">
              <button
                type="button"
                className="attendance-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button type="submit" className="attendance-save-btn">
                {editingId ? "Update Attendance" : "Save Attendance"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="attendance-table-card">
        <div className="attendance-table-header">
          <div>
            <h2>Daily Attendance Records</h2>
            <p>{dailyRecords.length} records for {selectedDate}</p>
          </div>
        </div>

        {loading ? (
          <p className="attendance-message">Loading attendance...</p>
        ) : dailyRecords.length === 0 ? (
          <p className="attendance-message">
            No attendance records found for this date.
          </p>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {dailyRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.employeeName}</strong>
                      <small>ID: {record.employeeId}</small>
                    </td>
                    <td>{record.department}</td>
                    <td>{formatTime(record.checkIn)}</td>
                    <td>{formatTime(record.checkOut)}</td>
                    <td>
                      <span
                        className={`attendance-status ${record.status
                          .toLowerCase()
                          .replace("-", "")}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>{record.remarks || "—"}</td>
                    <td>
                      <div className="attendance-actions">
                        <button
                          className="attendance-edit-btn"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </button>

                        {record.status === "Present" && !record.checkIn && (
                          <button
                            className="attendance-checkin-btn"
                            onClick={() => handleCheckIn(record.id)}
                          >
                            Check-in
                          </button>
                        )}

                        {record.status === "Present" &&
                          record.checkIn &&
                          !record.checkOut && (
                            <button
                              className="attendance-checkout-btn"
                              onClick={() => handleCheckOut(record.id)}
                            >
                              Check-out
                            </button>
                          )}

                        <select
                          className="attendance-status-select"
                          value={record.status}
                          onChange={(e) =>
                            handleStatusChange(record.id, e.target.value)
                          }
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Half-day">Half-day</option>
                          <option value="Leave">Leave</option>
                        </select>

                        <button
                          className="attendance-delete-btn"
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

export default Attendance;
