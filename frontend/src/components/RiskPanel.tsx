import React, { useState } from "react";

interface RiskPanelProps {
  onChange: (risk: { capital: number; maxPerTrade: number; liquidityBias: number }) => void;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({ onChange }) => {
  const [capital, setCapital] = useState(1000);
  const [maxPerTrade, setMaxPerTrade] = useState(10);
  const [liquidityBias, setLiquidityBias] = useState(70);

  const emit = (next: { capital?: number; maxPerTrade?: number; liquidityBias?: number }) => {
    const payload = {
      capital: next.capital ?? capital,
      maxPerTrade: next.maxPerTrade ?? maxPerTrade,
      liquidityBias: next.liquidityBias ?? liquidityBias,
    };
    onChange(payload);
  };

  return (
    <section className="st-card">
      <h2>Risk Controls</h2>
      <div className="st-field">
        <label>Risk Capital (USD)</label>
        <input
          type="number"
          value={capital}
          onChange={(e) => {
            const v = Number(e.target.value || 0);
            setCapital(v);
            emit({ capital: v });
          }}
        />
      </div>
      <div className="st-field">
        <label>Max per trade (% of risk capital)</label>
        <input
          type="number"
          value={maxPerTrade}
          onChange={(e) => {
            const v = Number(e.target.value || 0);
            setMaxPerTrade(v);
            emit({ maxPerTrade: v });
          }}
        />
      </div>
      <div className="st-field">
        <label>Liquidity bias (more liquidity ⇒ more size)</label>
        <input
          type="range"
          min={0}
          max={100}
          value={liquidityBias}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLiquidityBias(v);
            emit({ liquidityBias: v });
          }}
        />
        <span className="st-range-value">{liquidityBias}%</span>
      </div>
      <p className="st-helper">
        Zyada liquidity ⇒ zyada invest. Position size scales with token liquidity &amp; sentiment.
      </p>
    </section>
  );
};
