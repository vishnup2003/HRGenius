import React, { useEffect, useState } from "react";

import {
  Users,
  BriefcaseBusiness,
  CalendarDays,
  Wallet,
  UserPlus,
  ArrowUpRight,
  Clock,
  CircleDollarSign,
  TrendingUp,
  RefreshCw
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import { Link } from "react-router-dom";
import "./Dashboard.css";

import { getAllEmployees } from "../services/employeeService";
import { getAllApplicants } from "../services/applicantService";
import { getAllJobs } from "../services/jobService";
import { getAllPayroll } from "../services/payrollService";
import { getAllAttendance } from "../services/attendanceService";

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [attendance, setAttendance] = useState([]);

const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState("");

const fetchDashboardData = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    const [
      employeeData,
      applicantData,
      jobData,
      payrollData,
      attendanceData
    ] = await Promise.all([
      getAllEmployees(),
      getAllApplicants(),
      getAllJobs(),
      getAllPayroll(),
      getAllAttendance()
    ]);

    setEmployees(employeeData);
    setApplicants(applicantData);
    setJobs(jobData);
    setPayroll(payrollData);
    setAttendance(attendanceData);

  } catch (err) {
    console.error("Dashboard API error:", err);
    setError("Unable to load dashboard data. Please check your backend connection.");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

useEffect(() => {
  fetchDashboardData();
}, []);

  const today = new Date().toLocaleDateString("en-CA");

  const currentMonth = today.substring(0, 7);

  const totalEmployees = employees.length;

  const totalApplicants = applicants.length;

  const employeesOnLeave = attendance.filter(
    (record) =>
      record.attendanceDate === today &&
      record.status === "Leave"
  ).length;

  const monthlyPayroll = payroll
    .filter((record) => record.payMonth === currentMonth)
    .reduce(
      (total, record) => total + Number(record.netSalary || 0),
      0
    );

  const openPositions = jobs
    .filter((job) => job.status === "Active")
    .reduce(
      (total, job) => total + Number(job.openings || 0),
      0
    );

  const paidPayroll = payroll
    .filter((record) => record.payMonth === currentMonth &&
      record.paymentStatus === "Paid")
    .reduce(
      (total, record) => total + Number(record.netSalary || 0),
      0
    );

  const recentEmployees = [...employees]
    .sort((a, b) =>
      new Date(b.joiningDate || 0) - new Date(a.joiningDate || 0)
    )
    .slice(0, 4);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      color: "blue"
    },
    {
      title: "Job Applicants",
      value: totalApplicants,
      icon: BriefcaseBusiness,
      color: "purple"
    },
    {
      title: "On Leave Today",
      value: employeesOnLeave,
      icon: CalendarDays,
      color: "orange"
    },
    {
      title: "Monthly Payroll",
      value: formatCurrency(monthlyPayroll),
      icon: Wallet,
      color: "green"
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="panel">
          <h3>Loading Dashboard...</h3>
          <p>Please wait while we fetch your HR data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="panel">
          <h3>Dashboard Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div>
          <h2>Good morning, HR Admin! 👋</h2>
          <p>
            Manage your people, track performance and grow your organization.
          </p>
        </div>

<div className="dashboard-actions">
  <button
    className="refresh-button"
    onClick={() => fetchDashboardData(true)}
    disabled={refreshing}
  >
    <RefreshCw
      size={16}
      className={refreshing ? "refresh-spinning" : ""}
    />
    {refreshing ? "Refreshing..." : "Refresh Dashboard"}
  </button>

  <Link to="/employees" className="primary-button">
    <UserPlus size={17} />
    Add Employee
  </Link>
</div>
      </section>

      {/* Statistics Cards */}
      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.title}>
              <div className="stat-top">
                <span>{stat.title}</span>

                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>

              <h2>{stat.value}</h2>

              <div className="stat-change">
                <TrendingUp size={15} />
                <strong>Live Data</strong>
                <span>from database</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Dashboard Charts and Insights */}
      <section className="dashboard-grid">

        <div className="panel employee-chart">
  <div className="panel-heading">
    <div>
      <h3>Employee Overview</h3>
      <p>Current workforce distribution</p>
    </div>
  </div>

  <div className="chart-container">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[
          {
            category: "Active",
            employees: employees.filter(
              (employee) => employee.employmentStatus === "Active"
            ).length
          },
          {
            category: "Other",
            employees: employees.filter(
              (employee) => employee.employmentStatus !== "Active"
            ).length
          }
        ]}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#edf0f5"
        />

        <XAxis
          dataKey="category"
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />

        <Tooltip />

        <Bar
          dataKey="employees"
          fill="#5267e8"
          radius={[7, 7, 0, 0]}
          barSize={65}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

        <div className="panel quick-stats">
          <div className="panel-heading">
            <div>
              <h3>HR Quick Insights</h3>
              <p>Live organizational highlights</p>
            </div>

            <Link to="/recruitment" className="quick-insights-link" title="View Recruitment">
              <ArrowUpRight size={20} />
            </Link>
          </div>

          <div className="insight-item">
            <div className="insight-icon purple">
              <BriefcaseBusiness />
            </div>

            <div>
              <strong>{openPositions} Open Positions</strong>
              <small>Across active job openings</small>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon orange">
              <Clock />
            </div>

            <div>
              <strong>{employeesOnLeave} Employees on Leave</strong>
              <small>Today's attendance records</small>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon green">
              <CircleDollarSign />
            </div>

            <div>
              <strong>{formatCurrency(paidPayroll)} Paid</strong>
              <small>Payroll paid this month</small>
            </div>
          </div>
        </div>

      </section>

      {/* Recent Employees */}
      <section className="panel employees-panel">

        <div className="panel-heading">
          <div>
            <h3>Recent Employees</h3>
            <p>Recently joined employees in your organization</p>
          </div>

          <Link to="/employees" className="view-all">
            View All <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>DESIGNATION</th>
                <th>DEPARTMENT</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {recentEmployees.length > 0 ? (
                recentEmployees.map((employee, index) => {
                  const name = `${employee.firstName} ${employee.lastName}`;

                  return (
                    <tr key={employee.id}>
                      <td>
                        <div className="employee-name">
                          <div className={`avatar employee-avatar avatar-${index}`}>
                            {employee.firstName?.[0]}
                            {employee.lastName?.[0]}
                          </div>

                          <strong>{name}</strong>
                        </div>
                      </td>

                      <td>{employee.designation}</td>
                      <td>{employee.department}</td>

                      <td>
                        <span
                          className={`status ${
                            employee.employmentStatus === "Active"
                              ? "status-active"
                              : "status-leave"
                          }`}
                        >
                          {employee.employmentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </section>

      <footer className="dashboard-footer">
        © 2026 HRGenius. All rights reserved.
      </footer>

    </div>
  );
}

export default Dashboard;
