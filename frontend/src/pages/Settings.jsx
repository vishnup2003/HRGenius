import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  User,
  Building2,
  Bell,
  Palette,
  ShieldCheck,
  Save,
} from "lucide-react";

import "./Settings.css";

function Settings() {
  const location = useLocation();

  // Navigate to the selected Settings section
  useEffect(() => {
    if (!location.hash) return;

    const sectionId = location.hash.substring(1);

    const targetSection = document.getElementById(sectionId);

    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [location.hash]);

  // PROFILE STATE
  const [profile, setProfile] = useState(() => {
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

  // ORGANIZATION STATE
  const [organization, setOrganization] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hrgenius_organization")) || {
        companyName: "HRGenius",
        website: "",
        location: "",
      };
    } catch {
      return {
        companyName: "HRGenius",
        website: "",
        location: "",
      };
    }
  });

  // PREFERENCES STATE
  const [preferences, setPreferences] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hrgenius_preferences")) || {
        recruitment: true,
        onboarding: true,
        payroll: true,
        attendance: true,
        theme: "light",
      };
    } catch {
      return {
        recruitment: true,
        onboarding: true,
        payroll: true,
        attendance: true,
        theme: "light",
      };
    }
  });

  const [message, setMessage] = useState("");

  // SAVE ALL SETTINGS
  const handleSave = () => {
    localStorage.setItem("hrgenius_profile", JSON.stringify(profile));

    localStorage.setItem(
      "hrgenius_organization",
      JSON.stringify(organization)
    );

    localStorage.setItem(
      "hrgenius_preferences",
      JSON.stringify(preferences)
    );

    // UPDATE THEME AND NOTIFICATION PREFERENCES
    window.dispatchEvent(
      new CustomEvent("hrgenius-preferences-updated", {
        detail: preferences,
      })
    );

    // UPDATE PROFILE INFORMATION IN MAIN LAYOUT
    window.dispatchEvent(
      new CustomEvent("hrgenius-profile-updated", {
        detail: profile,
      })
    );

    setMessage("Settings saved successfully!");

    setTimeout(() => setMessage(""), 3000);
  };

  // UPDATE PROFILE
  const updateProfile = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // UPDATE ORGANIZATION
  const updateOrganization = (field, value) => {
    setOrganization((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // UPDATE PREFERENCES AND APPLY THEME IMMEDIATELY
  const updatePreference = (field, value) => {
    setPreferences((prev) => {
      const updatedPreferences = {
        ...prev,
        [field]: value,
      };

      localStorage.setItem(
        "hrgenius_preferences",
        JSON.stringify(updatedPreferences)
      );

      window.dispatchEvent(
        new CustomEvent("hrgenius-preferences-updated", {
          detail: updatedPreferences,
        })
      );

      return updatedPreferences;
    });
  };

  return (
    <div className="settings-page">
      {/* SETTINGS HEADER */}
      <div className="settings-heading">
        <div>
          <h1>Settings</h1>
          <p>Manage your HRGenius account and preferences.</p>
        </div>

        <button className="settings-save-button" onClick={handleSave}>
          <Save size={17} />
          Save Changes
        </button>
      </div>

      {message && (
        <div className="settings-success-message">
          {message}
        </div>
      )}

      {/* PROFILE SETTINGS */}
      <section
        className="settings-card"
        id="profile-settings"
      >
        <div className="settings-card-heading">
          <User />

          <div>
            <h2>Profile Settings</h2>
            <p>Manage your administrator information.</p>
          </div>
        </div>

        <div className="settings-form-grid">
          <label>
            Full Name

            <input
              value={profile.name}
              onChange={(e) =>
                updateProfile("name", e.target.value)
              }
              placeholder="Enter your name"
            />
          </label>

          <label>
            Email Address

            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                updateProfile("email", e.target.value)
              }
              placeholder="Enter your email"
            />
          </label>

          <label>
            Account Role

            <input
              value={profile.role}
              disabled
            />
          </label>
        </div>
      </section>

      {/* ORGANIZATION SETTINGS */}
      <section className="settings-card">
        <div className="settings-card-heading">
          <Building2 />

          <div>
            <h2>Organization Settings</h2>
            <p>Manage your company information.</p>
          </div>
        </div>

        <div className="settings-form-grid">
          <label>
            Organization Name

            <input
              value={organization.companyName}
              onChange={(e) =>
                updateOrganization("companyName", e.target.value)
              }
            />
          </label>

          <label>
            Website

            <input
              value={organization.website}
              onChange={(e) =>
                updateOrganization("website", e.target.value)
              }
              placeholder="https://example.com"
            />
          </label>

          <label>
            Location

            <input
              value={organization.location}
              onChange={(e) =>
                updateOrganization("location", e.target.value)
              }
              placeholder="City, State"
            />
          </label>
        </div>
      </section>

      {/* NOTIFICATION PREFERENCES */}
      <section className="settings-card">
        <div className="settings-card-heading">
          <Bell />

          <div>
            <h2>Notification Preferences</h2>
            <p>
              Choose which notification categories you want to enable.
            </p>
          </div>
        </div>

        <div className="settings-options">
          {[
            ["recruitment", "Recruitment Notifications"],
            ["onboarding", "Onboarding Notifications"],
            ["payroll", "Payroll Notifications"],
            ["attendance", "Attendance Notifications"],
          ].map(([key, label]) => (
            <label className="settings-toggle-row" key={key}>
              <span>{label}</span>

              <input
                type="checkbox"
                checked={preferences[key]}
                onChange={(e) =>
                  updatePreference(key, e.target.checked)
                }
              />
            </label>
          ))}
        </div>
      </section>

      {/* APPEARANCE SETTINGS */}
      <section className="settings-card">
        <div className="settings-card-heading">
          <Palette />

          <div>
            <h2>Appearance</h2>
            <p>Choose your preferred application theme.</p>
          </div>
        </div>

        <div className="settings-theme-options">
          <button
            type="button"
            className={
              preferences.theme === "light" ? "selected" : ""
            }
            onClick={() => updatePreference("theme", "light")}
          >
            Light Mode
          </button>

          <button
            type="button"
            className={
              preferences.theme === "dark" ? "selected" : ""
            }
            onClick={() => updatePreference("theme", "dark")}
          >
            Dark Mode
          </button>
        </div>

        <p className="settings-note">
          Your selected theme is applied immediately and saved automatically.
        </p>
      </section>

      {/* ACCOUNT SECURITY */}
      <section
        className="settings-card"
        id="account-security"
      >
        <div className="settings-card-heading">
          <ShieldCheck />

          <div>
            <h2>Account & Security</h2>
            <p>
              Administrator account and security information.
            </p>
          </div>
        </div>

        <p className="settings-note">
          Password management and authentication will be available
          after backend authentication is implemented.
        </p>
      </section>
    </div>
  );
}

export default Settings;