import React from "react";

interface SentimentSummaryProps {
  sentimentScore: number; // -100 to 100
  token: string;
}

const getAction = (score: number): string => {
  if (score >= 40) return "Buy (high sentiment)";
  if (score >= 10) return "Light Buy";
  if (score > -10) return "Hold / Wait";
  if (score > -40) return "Light Sell";
  return "Sell (strong negative sentiment)";
};

export const SentimentSummary: React.FC<SentimentSummaryProps> = ({ sentimentScore, token }) => {
  const action = getAction(sentimentScore);

  return (
    <section className="st-card st-summary">
      <h2>Decision Engine</h2>
      <div className="st-summary-main">
        <div>
          <p className="st-label">Token</p>
          <p className="st-value">{token || "-"}</p>
        </div>
        <div>
          <p className="st-label">Sentiment Score</p>
          <p className="st-value">{sentimentScore}</p>
        </div>
        <div>
          <p className="st-label">Action</p>
          <p className="st-value">{action}</p>
        </div>
      </div>
      <p className="st-helper small">
        Sentiment score is a blend of Twitter mentions, profile activity, Fear &amp; Greed Index, and market
        data. Hook this card to your backend model later.
      </p>
    </section>
  );
};
