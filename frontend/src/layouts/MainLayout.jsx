import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  UserPlus,
  Wallet,
  ChartNoAxesCombined,
  CalendarDays,
  Settings,
  Bell,
  Search,
  X,
} from "lucide-react";

import { getAllEmployees } from "../services/employeeService";
import { getAllApplicants } from "../services/applicantService";
import { getAllJobs } from "../services/jobService";
import { getAllOnboarding } from "../services/onboardingService";
import { getAllPayroll } from "../services/payrollService";
import { getAllAttendance } from "../services/attendanceService";

import "./MainLayout.css";

function MainLayout() {
  const navigate = useNavigate();

  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const sidebarProfileRef = useRef(null);

  // SEARCH STATES
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // NOTIFICATION STATES
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // LOAD SAVED NOTIFICATION PREFERENCES
  const [notificationPreferences, setNotificationPreferences] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("hrgenius_preferences")) || {
          recruitment: true,
          onboarding: true,
          payroll: true,
          attendance: true,
        }
      );
    } catch {
      return {
        recruitment: true,
        onboarding: true,
        payroll: true,
        attendance: true,
      };
    }
  });

  // LOAD READ NOTIFICATIONS
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("hrgenius_read_notifications") || "[]"
      );
    } catch {
      return [];
    }
  });

  // PROFILE STATES
  const [showProfile, setShowProfile] = useState(false);
  const [showSidebarProfile, setShowSidebarProfile] = useState(false);

  // LOAD ADMIN PROFILE FROM SETTINGS
  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hrgenius_profile")) || {
        name: "HR Admin",
        email: "",
        role: "Administrator",
      };
    } catch {
      return {
        name: "HR Admin",
        email: "",
        role: "Administrator",
      };
    }
  });

  // GENERATE INITIALS FROM THE SAVED PROFILE NAME
  const adminInitials = (adminProfile.name || "HR Admin")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "HA";

  // LISTEN FOR SETTINGS PREFERENCE CHANGES
  useEffect(() => {
    const handlePreferencesUpdate = (event) => {
      setNotificationPreferences(event.detail);
    };

    window.addEventListener(
      "hrgenius-preferences-updated",
      handlePreferencesUpdate
    );

    return () => {
      window.removeEventListener(
        "hrgenius-preferences-updated",
        handlePreferencesUpdate
      );
    };
  }, []);

  // LISTEN FOR PROFILE UPDATES FROM SETTINGS
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setAdminProfile(event.detail);
      }
    };

    window.addEventListener("hrgenius-profile-updated", handleProfileUpdate);

    return () => {
      window.removeEventListener(
        "hrgenius-profile-updated",
        handleProfileUpdate
      );
    };
  }, []);

  // FILTER NOTIFICATIONS USING SETTINGS
  const filteredNotifications = notifications.filter((item) => {
    const category = item.category.toLowerCase();
    return notificationPreferences[category] !== false;
  });

  // COUNT ONLY VISIBLE UNREAD NOTIFICATIONS
  const unreadCount = filteredNotifications.filter(
    (item) => !readNotifications.includes(item.id)
  ).length;

  // GLOBAL SEARCH
  useEffect(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      setSearchResults([]);
      setShowResults(false);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;

    const searchRecords = async () => {
      setSearchLoading(true);
      setShowResults(true);

      try {
        const [employees, applicants, jobs] = await Promise.all([
          getAllEmployees(),
          getAllApplicants(),
          getAllJobs(),
        ]);

        if (cancelled) return;

        const results = [];

        employees.forEach((employee) => {
          const name = `${employee.firstName || ""} ${
            employee.lastName || ""
          }`.trim();

          const searchableText = [
            name,
            employee.email,
            employee.department,
            employee.designation,
            employee.phone,
          ]
            .join(" ")
            .toLowerCase();

          if (searchableText.includes(query)) {
            results.push({
              id: `employee-${employee.id}`,
              title: name || "Unnamed Employee",
              subtitle: `${employee.designation || "Employee"} • ${
                employee.department || "No Department"
              }`,
              type: "Employee",
              path: "/employees",
            });
          }
        });

                applicants.forEach((applicant) => {
          const name = `${applicant.firstName || ""} ${
            applicant.lastName || ""
          }`.trim();

          const searchableText = [
            name,
            applicant.email,
            applicant.appliedFor,
            applicant.status,
            applicant.phone,
          ]
            .join(" ")
            .toLowerCase();

          if (searchableText.includes(query)) {
            results.push({
              id: `applicant-${applicant.id}`,
              title: name || "Unnamed Applicant",
              subtitle: `${applicant.appliedFor || "Applicant"} • ${
                applicant.status || "Applied"
              }`,
              type: "Applicant",
              path: "/applicants",
            });
          }
        });

        jobs.forEach((job) => {
          const searchableText = [
            job.title,
            job.department,
            job.location,
            job.employmentType,
            job.status,
          ]
            .join(" ")
            .toLowerCase();

          if (searchableText.includes(query)) {
            results.push({
              id: `job-${job.id}`,
              title: job.title || "Untitled Job",
              subtitle: `${job.department || "Department"} • ${
                job.location || "Location not specified"
              }`,
              type: "Job",
              path: "/recruitment",
            });
          }
        });

        setSearchResults(results);
      } catch (error) {
        if (!cancelled) {
          console.error("Global search failed:", error);
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    };

    searchRecords();

    return () => {
      cancelled = true;
    };
  }, [searchText]);

  // FETCH NOTIFICATIONS
  useEffect(() => {
    let cancelled = false;

    const fetchNotifications = async () => {
      setNotificationLoading(true);

      try {
        const [applicants, onboarding, payroll, attendance] =
          await Promise.all([
            getAllApplicants(),
            getAllOnboarding(),
            getAllPayroll(),
            getAllAttendance(),
          ]);

        if (cancelled) return;

        const generatedNotifications = [];

        // NEW APPLICANTS
        applicants
          .filter((applicant) => applicant.status === "Applied")
          .forEach((applicant) => {
            generatedNotifications.push({
              id: `applicant-${applicant.id}`,
              title: "New Applicant",
              message: `${applicant.firstName} ${applicant.lastName} has applied for ${applicant.appliedFor}.`,
              category: "Recruitment",
            });
          });

        // PENDING ONBOARDING
        onboarding
          .filter((record) => record.onboardingStatus !== "Completed")
          .forEach((record) => {
            generatedNotifications.push({
              id: `onboarding-${record.id}`,
              title: "Onboarding Pending",
              message: `Onboarding for Applicant #${record.applicantId} is ${record.onboardingStatus}.`,
              category: "Onboarding",
            });
          });

        // PENDING PAYROLL
        payroll
          .filter((record) => record.paymentStatus === "Pending")
          .forEach((record) => {
            generatedNotifications.push({
              id: `payroll-${record.id}`,
              title: "Payroll Pending",
              message: `Payment for ${record.employeeName} (${record.payMonth}) is pending.`,
              category: "Payroll",
            });
          });

        // TODAY'S ATTENDANCE ALERTS
        const today = new Date().toLocaleDateString("en-CA");

        attendance
          .filter(
            (record) =>
              record.attendanceDate === today &&
              ["Absent", "Leave"].includes(record.status)
          )
          .forEach((record) => {
            generatedNotifications.push({
              id: `attendance-${record.id}`,
              title: `Attendance: ${record.status}`,
              message: `${record.employeeName} is marked ${record.status} today.`,
              category: "Attendance",
            });
          });

        setNotifications(generatedNotifications);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch notifications:", error);
        }
      } finally {
        if (!cancelled) {
          setNotificationLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  // SAVE READ NOTIFICATIONS PERMANENTLY IN BROWSER STORAGE
  useEffect(() => {
    localStorage.setItem(
      "hrgenius_read_notifications",
      JSON.stringify(readNotifications)
    );
  }, [readNotifications]);

  // CLOSE DROPDOWNS ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }

      if (
        sidebarProfileRef.current &&
        !sidebarProfileRef.current.contains(event.target)
      ) {
        setShowSidebarProfile(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowResults(false);
        setShowNotifications(false);
        setShowProfile(false);
        setShowSidebarProfile(false);
        setSearchText("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // SEARCH RESULT CLICK
  const handleResultClick = (path) => {
    navigate(path);
    setSearchText("");
    setSearchResults([]);
    setShowResults(false);
  };

  // MARK SINGLE NOTIFICATION AS READ
  const markAsRead = (id) => {
    setReadNotifications((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  };

  // MARK ALL VISIBLE NOTIFICATIONS AS READ
  const markAllAsRead = () => {
    setReadNotifications((prev) => [
      ...new Set([
        ...prev,
        ...filteredNotifications.map((item) => item.id),
      ]),
    ]);
  };

  return (
    <div
      className={`hrms-layout ${
        notificationPreferences.theme === "dark" ? "dark-theme" : ""
      }`}
    >
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">H</div>
          <span>
            HR<span className="brand-highlight">Genius</span>
          </span>
        </div>

        <p className="menu-label">MAIN MENU</p>

        <nav className="sidebar-nav">
          <NavLink to="/" end className="nav-item">
            <LayoutDashboard /> Dashboard
          </NavLink>

          <NavLink to="/employees" className="nav-item">
            <Users /> Employees
          </NavLink>

          <NavLink to="/recruitment" className="nav-item">
            <BriefcaseBusiness /> Recruitment
          </NavLink>

          <NavLink to="/applicants" className="nav-item">
            <Users /> Applicants
          </NavLink>

          <NavLink to="/onboarding" className="nav-item">
            <UserPlus /> Onboarding
          </NavLink>

          <NavLink to="/payroll" className="nav-item">
            <Wallet /> Payroll
          </NavLink>

          <NavLink to="/performance" className="nav-item">
            <ChartNoAxesCombined /> Performance
          </NavLink>

          <NavLink to="/attendance" className="nav-item">
            <CalendarDays /> Attendance
          </NavLink>
        </nav>

                {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">
          <button
            type="button"
            className="nav-item"
            onClick={() => navigate("/settings")}
          >
            <Settings /> Settings
          </button>

          {/* SIDEBAR ADMIN PROFILE */}
          <div className="sidebar-profile-menu" ref={sidebarProfileRef}>
            <button
              type="button"
              className="profile sidebar-profile-trigger"
              aria-label="Open HR Admin profile menu"
              aria-expanded={showSidebarProfile}
              onClick={() => {
                setShowSidebarProfile((prev) => !prev);
                setShowProfile(false);
                setShowNotifications(false);
              }}
            >
              <div className="avatar">{adminInitials}</div>

              <div className="sidebar-profile-details">
                <strong>{adminProfile.name || "HR Admin"}</strong>
                <small>{adminProfile.role || "Administrator"}</small>
              </div>
            </button>

            {showSidebarProfile && (
              <div className="sidebar-profile-dropdown">
                <div className="sidebar-profile-dropdown-header">
                  <div className="avatar">{adminInitials}</div>

                  <div>
                    <strong>{adminProfile.name || "HR Admin"}</strong>
                    <small>{adminProfile.role || "Administrator"}</small>
                  </div>
                </div>

                <div className="profile-dropdown-divider"></div>

                <p className="sidebar-profile-description">
                  Manage your HRGenius profile and account preferences.
                </p>

                <button
                  type="button"
                  className="profile-dropdown-item"
                  onClick={() => {
                    setShowSidebarProfile(false);
                    navigate("/settings#profile-settings");
                  }}
                >
                  <Users size={17} />
                  View / Edit Profile
                </button>

                <button
                  type="button"
                  className="profile-dropdown-item"
                  onClick={() => {
                    setShowSidebarProfile(false);
                    navigate("/settings#account-security");
                  }}
                >
                  <Settings size={17} />
                  Account Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-area">
        <header className="topbar">
          {/* GLOBAL SEARCH */}
          <div className="topbar-search-wrapper" ref={searchRef}>
            <div className="topbar-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search employees, applicants, jobs..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onFocus={() => {
                  if (searchText.trim()) setShowResults(true);
                }}
              />

              {searchText && (
                <button
                  className="search-clear"
                  onClick={() => setSearchText("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {showResults && (
              <div className="search-results">
                {searchLoading ? (
                  <p className="search-message">Searching...</p>
                ) : searchResults.length > 0 ? (
                  <>
                    <p className="search-results-heading">
                      Search Results ({searchResults.length})
                    </p>

                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        className="search-result-item"
                        onClick={() => handleResultClick(result.path)}
                      >
                        <div className="search-result-icon">
                          {result.type === "Employee" ? (
                            <Users size={18} />
                          ) : result.type === "Applicant" ? (
                            <UserPlus size={18} />
                          ) : (
                            <BriefcaseBusiness size={18} />
                          )}
                        </div>

                        <div className="search-result-details">
                          <strong>{result.title}</strong>
                          <small>{result.subtitle}</small>
                        </div>

                        <span className="search-result-type">
                          {result.type}
                        </span>
                      </button>
                    ))}
                  </>
                ) : (
                  <p className="search-message">
                    No matching records found.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="notification-wrapper" ref={notificationRef}>
            <button
              type="button"
              className="notification"
              aria-label="Notifications"
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowProfile(false);
              }}
            >
              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="notification-dot"></span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <div>
                    <strong>Notifications</strong>
                    <small>{unreadCount} unread</small>
                  </div>

                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Mark all read
                  </button>
                </div>

                <div className="notification-list">
                  {notificationLoading ? (
                    <p className="notification-empty">
                      Loading notifications...
                    </p>
                  ) : filteredNotifications.length === 0 ? (
                    <p className="notification-empty">
                      You're all caught up! No notifications.
                    </p>
                  ) : (
                    filteredNotifications.map((item) => {
                      const isRead = readNotifications.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`notification-item ${
                            isRead ? "read" : "unread"
                          }`}
                        >
                          <div className="notification-item-content">
                            <strong>{item.title}</strong>
                            <p>{item.message}</p>
                            <small>{item.category}</small>
                          </div>

                          {!isRead && (
                            <button
                              className="mark-read-button"
                              onClick={() => markAsRead(item.id)}
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

                    {/* TOP-RIGHT PROFILE */}
          <div className="profile-menu-wrapper" ref={profileRef}>
            <button
              type="button"
              className="avatar profile-avatar-button"
              onClick={() => {
                setShowProfile((prev) => !prev);
                setShowNotifications(false);
              }}
              aria-label="Open profile menu"
            >
              {adminInitials}
            </button>

            {showProfile && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="avatar">{adminInitials}</div>

                  <div>
                    <strong>{adminProfile.name || "HR Admin"}</strong>
                    <small>{adminProfile.role || "Administrator"}</small>
                  </div>
                </div>

                <div className="profile-dropdown-divider"></div>

                <div className="profile-dropdown-info">
                  <small>Account</small>
                  <p>{adminProfile.email || "HRGenius Administrator"}</p>
                </div>

                <button
                  type="button"
                  className="profile-dropdown-item"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/settings#profile-settings");
                  }}
                >
                  <Settings size={17} />
                  Settings
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;