import express from "express";
import axios from "axios";
import { perpsRoutes } from "./Routes/perps";

// Initialize axios instance
export const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


const app = express();

app.use(express.json());

// Mount perps routes at /api/v1/perps
app.use("/api/v1/perps", perpsRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Perps API available at http://localhost:${PORT}/api/v1/perps`);
});
