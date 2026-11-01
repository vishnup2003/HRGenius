
import React, { useEffect, useState } from "react";

import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from "../services/employeeService";

import {
  Users,
  Search,
  Trash2,
  RefreshCw,
  Plus,
  X,
  Pencil
} from "lucide-react";

import "./Employees.css";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  employmentStatus: "Active",
  joiningDate: "",
  salary: ""
};

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  // FETCH EMPLOYEES
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllEmployees();
      setEmployees(data);
    } catch (err) {
      setError("Unable to load employees. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // HANDLE FORM INPUTS
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // OPEN ADD EMPLOYEE MODAL
  const handleAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  // OPEN EDIT EMPLOYEE MODAL
  const handleEdit = (employee) => {
    setEditingId(employee.id);

    setForm({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "",
      designation: employee.designation || "",
      employmentStatus: employee.employmentStatus || "Active",
      joiningDate: employee.joiningDate
        ? employee.joiningDate.substring(0, 10)
        : "",
      salary: employee.salary ?? ""
    });

    setShowModal(true);
  };

  // CLOSE MODAL
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
  };

  // ADD OR UPDATE EMPLOYEE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const employeeData = {
        ...form,
        salary: Number(form.salary)
      };

      if (editingId !== null) {
        await updateEmployee(editingId, employeeData);
        alert("Employee updated successfully!");
      } else {
        await createEmployee(employeeData);
        alert("Employee added successfully!");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(initialForm);

      await fetchEmployees();

    } catch (err) {
      alert(
        err.response?.data?.message ||
        `Failed to ${editingId !== null ? "update" : "add"} employee. Please check your details.`
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE EMPLOYEE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await deleteEmployee(id);
      await fetchEmployees();

      alert("Employee deleted successfully!");
    } catch (err) {
      alert("Failed to delete employee.");
    }
  };

  // SEARCH EMPLOYEES
  const filteredEmployees = employees.filter((employee) =>
    `${employee.firstName} ${employee.lastName} ${employee.department} ${employee.email} ${employee.designation}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="employees-page">

      {/* HEADER */}
      <div className="employees-header">
        <div>
          <h1>Employee Management</h1>
          <p>Manage and monitor your organization's workforce.</p>
        </div>

        <div className="header-buttons">
          <button
            className="refresh-button"
            onClick={fetchEmployees}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="add-employee-button"
            onClick={handleAdd}
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      {/* EMPLOYEE COUNT */}
      <div className="employee-summary">
        <Users size={25} />

        <div>
          <h2>{employees.length}</h2>
          <p>Total Employees</p>
        </div>
      </div>

      {/* EMPLOYEE TABLE */}
      <div className="employees-table-card">

        <div className="employee-toolbar">
          <h3>All Employees</h3>

          <div className="employee-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="employee-message">Loading employees...</p>
        ) : error ? (
          <p className="employee-error">{error}</p>
        ) : (
          <div className="employee-table-wrapper">
            <table className="employee-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>EMPLOYEE</th>
                  <th>EMAIL</th>
                  <th>DEPARTMENT</th>
                  <th>DESIGNATION</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>

                    <td>{employee.id}</td>

                    <td>
                      <strong>
                        {employee.firstName} {employee.lastName}
                      </strong>
                    </td>

                    <td>{employee.email}</td>
                    <td>{employee.department}</td>
                    <td>{employee.designation}</td>

                    <td>
                      <span className="employee-status">
                        {employee.employmentStatus}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">

                        <button
                          className="edit-button"
                          onClick={() => handleEdit(employee)}
                          title="Edit employee"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleDelete(employee.id)}
                          title="Delete employee"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-message">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT EMPLOYEE MODAL */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >
          <div
            className="employee-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="modal-header">
              <div>
                <h2>
                  {editingId !== null
                    ? "Edit Employee"
                    : "Add New Employee"}
                </h2>

                <p>
                  {editingId !== null
                    ? "Update employee information below."
                    : "Enter employee information below."}
                </p>
              </div>

              <button
                className="close-modal"
                onClick={closeModal}
                type="button"
                disabled={saving}
              >
                <X size={22} />
              </button>
            </div>

            {/* EMPLOYEE FORM */}
            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="employee@company.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="form-group">
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
                    <option value="Design">Design</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Sales">Sales</option>
                    <option value="IT">IT</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Designation *</label>
                  <input
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Joining Date *</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Employment Status *</label>
                  <select
                    name="employmentStatus"
                    value={form.employmentStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Annual Salary (₹) *</label>
                  <input
                    type="number"
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    placeholder="Enter annual salary"
                    min="1"
                    required
                  />
                </div>

              </div>

              {/* MODAL ACTIONS */}
              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Employee"
                      : "Save Employee"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Employees;
