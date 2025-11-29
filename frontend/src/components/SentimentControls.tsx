import React, { useState } from "react";

interface SentimentControlsProps {
  onUpdate: (params: {
    token: string;
    network: string;
    profileMode: "wallet" | "famous";
    autoTrade: boolean;
  }) => void;
}

export const SentimentControls: React.FC<SentimentControlsProps> = ({ onUpdate }) => {
  const [token, setToken] = useState("DOGE");
  const [network, setNetwork] = useState("Ethereum");
  const [profileMode, setProfileMode] = useState<"wallet" | "famous">("wallet");
  const [autoTrade, setAutoTrade] = useState(true);

  const handleChange = () => {
    onUpdate({ token, network, profileMode, autoTrade });
  };

  return (
    <section className="st-card">
      <h2>Sentiment Input</h2>
      <div className="st-field">
        <label>Token / Ticker</label>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onBlur={handleChange}
          placeholder="e.g. DOGE, PEPE, WIF"
        />
      </div>
      <div className="st-field">
        <label>Network</label>
        <select
          value={network}
          onChange={(e) => {
            setNetwork(e.target.value);
            handleChange();
          }}
        >
          <option>Ethereum</option>
          <option>Solana</option>
          <option>Base</option>
          <option>BNB Chain</option>
        </select>
      </div>
      <div className="st-field">
        <label>Mode</label>
        <div className="st-toggle-group">
          <button
            className={profileMode === "wallet" ? "active" : ""}
            onClick={() => {
              setProfileMode("wallet");
              onUpdate({ token, network, profileMode: "wallet", autoTrade });
            }}
          >
            Wallet-based
          </button>
          <button
            className={profileMode === "famous" ? "active" : ""}
            onClick={() => {
              setProfileMode("famous");
              onUpdate({ token, network, profileMode: "famous", autoTrade });
            }}
          >
            Famous profiles
          </button>
        </div>
      </div>
      <div className="st-switch-row">
        <span>Auto trade via x402</span>
        <label className="st-switch">
          <input
            type="checkbox"
            checked={autoTrade}
            onChange={(e) => {
              setAutoTrade(e.target.checked);
              onUpdate({ token, network, profileMode, autoTrade: e.target.checked });
            }}
          />
          <span className="slider" />
        </label>
      </div>
      <p className="st-helper">
        Tracks Twitter sentiment, DeFiLlama liquidity, CoinMarketCap data and Fear &amp; Greed Index.
      </p>
    </section>
  );
};
