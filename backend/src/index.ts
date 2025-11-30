import express from "express";
import cors from "cors";
import axios from "axios";
import { perpsRoutes } from "./Routes/perps";
import { coingeckoRoutes } from "./Routes/coingecko";
import { PerpsAdapter } from "./adapters/PerpsAdapter";
import { APT_MARKET_ID, USER_ADDRESS } from "./utils/constants";
// Initialize axios instance
export const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api/v1/perps", perpsRoutes);
app.use("/api/v1/coingecko", coingeckoRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Perps API available at http://localhost:${PORT}/api/v1/perps`);
  console.log(
    `Coingecko API available at http://localhost:${PORT}/api/v1/coingecko`
  );
});

const main = async () => {
  const perpsAdapter = new PerpsAdapter();
  const positions = await perpsAdapter.getUserWalletBalance(USER_ADDRESS)
  console.log("Deposit successful");
  console.log("Transaction hash:", positions);
};

main();
