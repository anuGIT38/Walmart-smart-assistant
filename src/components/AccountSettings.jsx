import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css-modules/AccountSettings.css";
import { useFirebase } from "../firebase";

export default function AccountSettings({ user, onUpdateUser }) {
  const navigate = useNavigate();
  const { updateUserProfile } = useFirebase();

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    try {
      // Only proceed to email change if it differs from current email
      const nameChanged = name !== user.name;
      const emailChanged = email !== user.email;

      if (!nameChanged && !emailChanged) {
        alert("No changes detected.");
        return;
      }

      if (emailChanged && password.trim() === "") {
        alert("⚠️ Please enter your current password to change your email.");
        return;
      }

      await updateUserProfile(name, email, password);

      onUpdateUser({ name, email });
      alert("✅ Account updated successfully.");
      navigate("/home");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        alert("⚠️ Please re-login and try again to change email.");
      } else if (error.code === "auth/email-already-in-use") {
        alert("❌ This email is already in use. Try another one.");
      } else {
        alert("❌ Failed to update profile: " + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-settings">
      <h2>Account Settings</h2>

      <label>Display Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter new display name"
      />

      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter new email"
      />

      <label>
        Confirm Password
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Current password (only if changing name)"
      />

      <div className="button-group">
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button onClick={() => navigate("/home")} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}


/*
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css-modules/AccountSettings.css";

export default function AccountSettings({ user, onUpdateUser }) {
  const navigate = useNavigate();

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");

  const handleSave = () => {
    onUpdateUser({ name, email });
    alert("Account settings updated!");
    navigate("/home");
  };

  return (
    <div className="account-settings">
      <h2>Account Settings</h2>

      <label>Display Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />

      <label>Email</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} disabled />

      <button onClick={handleSave}>Save</button>
      <button onClick={() => navigate("/home")}>Cancel</button>
    </div>
  );
}
 */