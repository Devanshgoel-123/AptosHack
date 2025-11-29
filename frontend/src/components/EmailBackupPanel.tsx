import React, { useState } from "react";

export const EmailBackupPanel: React.FC = () => {
  const [email, setEmail] = useState("");
  const [enabled, setEnabled] = useState(true);

  return (
    <section className="st-card">
      <h2>Backup: Email Reports</h2>
      <p className="st-helper">
        If a person is not awake, don&apos;t miss opportunities. Get a full analysis mailed automatically.
      </p>
      <div className="st-field">
        <label>Email for reports</label>
        <input
          type="email"
          value={email}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="st-switch-row">
        <span>Send report when new trades are triggered</span>
        <label className="st-switch">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span className="slider" />
        </label>
      </div>
      <button className="st-primary-btn" type="button">
        Save backup settings
      </button>
    </section>
  );
};
