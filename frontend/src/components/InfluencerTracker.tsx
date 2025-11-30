import React from "react";

const MOCK = [
  { name: "ElonMeme", handle: "@elonmeme", followers: "32.0M", tag: "MEME" },
  { name: "CryptoGuru", handle: "@cryptoguru", followers: "12.0K", tag: "PRIV" },
  { name: "MemeLord", handle: "@memelord", followers: "3.5K", tag: "ZLA" },
];

export const InfluencerTracker: React.FC = () => {
  return (
    <section className="card influencer-card">
      <h3>Influencer Tracker</h3>
      <p className="muted small">Track profiles and get alerts (Mock Data)</p>

      <div className="influencer-search">
        <input placeholder="@username" />
        <button className="st-secondary-btn small">🔍</button>
      </div>

      <div className="influencer-list">
        {MOCK.map((p) => (
          <div key={p.handle} className="influencer-row">
            <div className="avatar">👤</div>
            <div className="info">
              <strong>{p.name}</strong>
              <div className="muted">{p.handle}</div>
            </div>
            <div className="meta">
              <div className="muted">{p.followers} Followers</div>
              <div className="chip">{p.tag}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
