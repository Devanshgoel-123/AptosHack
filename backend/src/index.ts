import express from "express";
import axios from "axios";
import { perpsRoutes } from "./Routes/perps";
import { coingeckoRoutes } from "./Routes/coingecko";

// Initialize axios instance
export const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


const app = express();

app.use(express.json());

app.use("/api/v1/perps", perpsRoutes);
app.use("/api/v1/coingecko", coingeckoRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Perps API available at http://localhost:${PORT}/api/v1/perps`);
  console.log(`Coingecko API available at http://localhost:${PORT}/api/v1/coingecko`);
});
