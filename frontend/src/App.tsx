import React from "react";
import { Header } from "./components/Header";
import { TokensList } from "./components/TokensList";
import { InfluencerTracker } from "./components/InfluencerTracker";

const WalletsCard: React.FC = () => {
  return (
    <section className="card">
      <h4>Wallets</h4>
      <p className="muted small">Your connected wallets</p>
      <div className="wallets">
        <div className="wallet-row">
          <div className="wallet-icon">💼</div>
          <div>
            <strong>Trading Wallet 1</strong>
            <div className="muted tiny">0x1a2b...9b1j</div>
          </div>
          <div className="wallet-value">$15,420.5</div>
        </div>
        <div className="wallet-row">
          <div className="wallet-icon">🧧</div>
          <div>
            <strong>HODLing Wallet</strong>
            <div className="muted tiny">0x9b1j...b8a3</div>
          </div>
          <div className="wallet-value">$42,850.25</div>
        </div>
      </div>
    </section>
  );
};

const AutoTradeCard: React.FC = () => (
  <section className="card">
    <h4>Auto-Trade / Risk</h4>
    <p className="muted small">Configure trading parameters</p>
    <div className="placeholder">Select a token to configure auto-trade settings</div>
  </section>
);

const SignalsCard: React.FC = () => (
  <section className="card">
    <h4>Signals & Backup</h4>
    <p className="muted small">Signals: Buy when sentiment &gt; 0.8 and TVL/liquidity supports entry</p>
    <button className="st-primary-btn full">Backup: Send Analysis</button>
  </section>
);

const App: React.FC = () => {
  return (
    <div className="app-root">
      <Header />
      <main className="layout">
        <div className="main-col">
          <TokensList />
          <InfluencerTracker />
        </div>

        <aside className="right-col">
          <WalletsCard />
          <AutoTradeCard />
          <SignalsCard />
        </aside>
      </main>
    </div>
  );
};

export default App;
