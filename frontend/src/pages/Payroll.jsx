import { useEffect, useState } from "react";
import {
  getAllPayroll,
  createPayroll,
  updatePayroll,
  updatePaymentStatus,
  deletePayroll,
} from "../services/payrollService";
import { getAllEmployees } from "../services/employeeService";
import "./Payroll.css";

function Payroll() {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const initialForm = {
    employeeId: "",
    basicSalary: "",
    allowances: 0,
    deductions: 0,
    payMonth: new Date().toISOString().slice(0, 7),
  };

  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [payrollData, employeeData] = await Promise.all([
        getAllPayroll(),
        getAllEmployees(),
      ]);

      setPayrollRecords(payrollData);
      setEmployees(employeeData);
    } catch (err) {
      console.error("Error fetching payroll data:", err);
      setError("Unable to load payroll data. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPayroll = payrollRecords.reduce(
    (total, record) => total + Number(record.netSalary || 0),
    0
  );

  const paidRecords = payrollRecords.filter(
    (record) => record.paymentStatus === "Paid"
  );

  const pendingRecords = payrollRecords.filter(
    (record) => record.paymentStatus === "Pending"
  );

  const paidAmount = paidRecords.reduce(
    (total, record) => total + Number(record.netSalary || 0),
    0
  );

  const pendingAmount = pendingRecords.reduce(
    (total, record) => total + Number(record.netSalary || 0),
    0
  );

  const netSalary =
    Number(form.basicSalary || 0) +
    Number(form.allowances || 0) -
    Number(form.deductions || 0);

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

    if (!employee) {
      alert("Please select a valid employee.");
      return;
    }

    if (
      Number(form.basicSalary) < 0 ||
      Number(form.allowances) < 0 ||
      Number(form.deductions) < 0 ||
      netSalary < 0
    ) {
      alert("Please enter valid salary amounts.");
      return;
    }

    const payrollData = {
      employeeId: Number(employee.id),
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      basicSalary: Number(form.basicSalary),
      allowances: Number(form.allowances),
      deductions: Number(form.deductions),
      payMonth: form.payMonth,
    };

    try {
      if (editingId) {
        await updatePayroll(editingId, payrollData);
        alert("Payroll updated successfully!");
      } else {
        await createPayroll(payrollData);
        alert("Payroll created successfully!");
      }

      resetForm();
      await fetchData();
    } catch (err) {
      console.error("Error saving payroll:", err);
      alert(
        err.response?.data?.message ||
        "Unable to save payroll. Check whether payroll already exists for this employee and month."
      );
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);

    setForm({
      employeeId: String(record.employeeId),
      basicSalary: record.basicSalary,
      allowances: record.allowances ?? 0,
      deductions: record.deductions ?? 0,
      payMonth: record.payMonth,
    });

    setShowForm(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updatePaymentStatus(id, status);
      await fetchData();
    } catch (err) {
      console.error("Error updating payment status:", err);
      alert("Unable to update payment status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payroll record?")) {
      return;
    }

    try {
      await deletePayroll(id);
      await fetchData();
    } catch (err) {
      console.error("Error deleting payroll:", err);
      alert("Unable to delete payroll record.");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  return (
    <div className="payroll-page">
      <div className="payroll-header">
        <div>
          <h1>Payroll Management</h1>
          <p>Manage employee salaries and monthly payments.</p>
        </div>

        <button
          className="payroll-add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Generate Payroll
        </button>
      </div>

      {error && <div className="payroll-error">{error}</div>}

      <div className="payroll-stats">
        <div className="payroll-stat-card">
          <span>Total Payroll</span>
          <h2>{formatCurrency(totalPayroll)}</h2>
          <small>{payrollRecords.length} records</small>
        </div>

        <div className="payroll-stat-card">
          <span>Paid Amount</span>
          <h2>{formatCurrency(paidAmount)}</h2>
          <small>{paidRecords.length} paid records</small>
        </div>

        <div className="payroll-stat-card">
          <span>Pending Amount</span>
          <h2>{formatCurrency(pendingAmount)}</h2>
          <small>{pendingRecords.length} pending records</small>
        </div>
      </div>

      {showForm && (
        <div className="payroll-form-card">
          <div className="payroll-form-header">
            <h2>{editingId ? "Edit Payroll" : "Generate New Payroll"}</h2>
            <button type="button" onClick={resetForm}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="payroll-form-grid">
              <div className="payroll-field">
                <label>Employee</label>
                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={(e) => {
                    const selected = employees.find(
                      (item) => String(item.id) === e.target.value
                    );

                    setForm((previous) => ({
                      ...previous,
                      employeeId: e.target.value,
                      basicSalary: selected?.salary ?? previous.basicSalary,
                    }));
                  }}
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

              <div className="payroll-field">
                <label>Pay Month</label>
                <input
                  type="month"
                  name="payMonth"
                  value={form.payMonth}
                  onChange={handleChange}
                  required
                  disabled={Boolean(editingId)}
                />
              </div>

              <div className="payroll-field">
                <label>Basic Salary (₹)</label>
                <input
                  type="number"
                  name="basicSalary"
                  value={form.basicSalary}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="payroll-field">
                <label>Allowances (₹)</label>
                <input
                  type="number"
                  name="allowances"
                  value={form.allowances}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="payroll-field">
                <label>Deductions (₹)</label>
                <input
                  type="number"
                  name="deductions"
                  value={form.deductions}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="payroll-field payroll-net-preview">
                <label>Net Salary</label>
                <h3>{formatCurrency(netSalary)}</h3>
              </div>
            </div>

            <div className="payroll-form-actions">
              <button type="button" className="payroll-cancel-btn" onClick={resetForm}>
                Cancel
              </button>

              <button type="submit" className="payroll-save-btn">
                {editingId ? "Update Payroll" : "Generate Payroll"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="payroll-table-card">
        <div className="payroll-table-header">
          <div>
            <h2>Salary Records</h2>
            <p>Employee-wise monthly payroll details</p>
          </div>
        </div>

        {loading ? (
          <p className="payroll-message">Loading payroll records...</p>
        ) : payrollRecords.length === 0 ? (
          <p className="payroll-message">No payroll records found.</p>
        ) : (
          <div className="payroll-table-wrapper">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Pay Month</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {payrollRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.employeeName}</strong>
                      <small className="payroll-employee-id">
                        ID: {record.employeeId}
                      </small>
                    </td>
                    <td>{record.department}</td>
                    <td>{record.payMonth}</td>
                    <td>{formatCurrency(record.basicSalary)}</td>
                    <td>{formatCurrency(record.allowances)}</td>
                    <td>{formatCurrency(record.deductions)}</td>
                    <td>
                      <strong>{formatCurrency(record.netSalary)}</strong>
                    </td>
                    <td>
                      <span
                        className={`payroll-status ${
                          record.paymentStatus === "Paid" ? "paid" : "pending"
                        }`}
                      >
                        {record.paymentStatus}
                      </span>
                    </td>
                    <td>{record.paymentDate || "—"}</td>
                    <td>
                      <div className="payroll-actions">
                        <button
                          className="payroll-edit-btn"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </button>

                        <select
                          className="payroll-status-select"
                          value={record.paymentStatus}
                          onChange={(e) =>
                            handleStatusChange(record.id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                        </select>

                        <button
                          className="payroll-delete-btn"
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

export default Payroll;
