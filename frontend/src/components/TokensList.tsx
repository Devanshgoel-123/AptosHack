import React from "react";

interface Token {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive?: boolean;
}

const MOCK: Token[] = [
  { symbol: "APT", name: "Aptos", price: "$12.45", change: "5.32%", positive: true },
];

export const TokensList: React.FC = () => {
  return (
    <section className="card tokens-card">
      <h3>Tokens</h3>
      <p className="muted small">Select a token to view sentiment analysis</p>
      <div className="tokens-list">
        {MOCK.map((t) => (
          <button key={t.symbol} className="token-row">
            <div className="token-left">
              <strong>{t.symbol}</strong>
              <span className="muted">{t.name}</span>
            </div>
            <div className="token-right">
              <div className="price">{t.price}</div>
              <div className={"delta " + (t.positive ? "up" : "down")}>{t.change}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
