import React from "react";

export const StrategyPanel: React.FC = () => {
  return (
    <section className="st-card">
      <h2>Strategies &amp; Tokens</h2>
      <div className="st-chip-row">
        <span className="st-chip st-chip-pill">Meme tokens</span>
        <span className="st-chip st-chip-pill">Privacy tokens</span>
      </div>
      <ul className="st-list">
        <li>
          <strong>Option 1: Wallet-based sentiment</strong>
          <p>
            Check the tokens already in the user wallet, pull sentiment + on-chain data, then route orders
            via x402.
          </p>
        </li>
        <li>
          <strong>Option 2: Famous profiles</strong>
          <p>
            Track a curated list of famous people / CT influencers and mirror high-conviction sentiment
            moves with small risk capital.
          </p>
        </li>
      </ul>
    </section>
  );
};
