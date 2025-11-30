import express, { Request, Response } from "express";
export const perpsRoutes = express.Router();
import { PerpsAdapter } from "../adapters/PerpsAdapter";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
  SUCCESS_CODE,
} from "../utils/constants";

perpsRoutes.use(express.json());

const perpsAdapter = new PerpsAdapter();

perpsRoutes.post("/openLong", async (req: Request, res: Response) => {
  try {
    const { marketId, size, leverage } = req.body;
    if (!marketId || !size || !leverage) {
      return res
        .status(BAD_REQUEST_CODE)
        .json({ message: "Invalid request body" });
    }
    const position = await perpsAdapter.openLong(marketId, size, leverage);
    if (!position) {
      return res
        .status(INTERNAL_SERVER_ERROR_CODE)
        .json({ message: "Failed to open long position" });
    }
    return res.status(SUCCESS_CODE).json(position);
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR_CODE)
      .json({ message: "Failed to open long position" });
  }
});

perpsRoutes.get("/getPositions", async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res
        .status(BAD_REQUEST_CODE)
        .json({ message: "Invalid query parameter: address is required" });
    }
    const positions = await perpsAdapter.getPositions(address as string);
    if (!positions) {
      return res
        .status(INTERNAL_SERVER_ERROR_CODE)
        .json({ message: "Failed to get positions" });
    }
    return res.status(SUCCESS_CODE).json(positions);
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR_CODE)
      .json({ message: "Failed to get positions" });
  }
});

perpsRoutes.post("/openShort", async (req: Request, res: Response) => {
  try {
    const { marketId, size, leverage } = req.body;
    if (!marketId || !size || !leverage) {
      return res
        .status(BAD_REQUEST_CODE)
        .json({ message: "Invalid request body" });
    }
    const position = await perpsAdapter.openShort(marketId, size, leverage);
    if (!position) {
      return res
        .status(INTERNAL_SERVER_ERROR_CODE)
        .json({ message: "Failed to open short position" });
    }
    return res.status(SUCCESS_CODE).json(position);
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR_CODE)
      .json({ message: "Failed to open short position" });
  }
});


perpsRoutes.get("/getOrderHistory", async (req: Request, res: Response) => {
  try{
    const { address } = req.query;
    if(!address) {
      return res.status(BAD_REQUEST_CODE).json({ message: "Invalid query parameter: address is required" });
    }
    const orderHistory = await perpsAdapter.getOrderHistory(address as string);
    if(!orderHistory) {
      return res.status(INTERNAL_SERVER_ERROR_CODE).json({ message: "Failed to get order history" });
    }
    return res.status(SUCCESS_CODE).json(orderHistory);
  }catch(error){
    return res.status(INTERNAL_SERVER_ERROR_CODE).json({ message: "Failed to get order history" });
  }
});


perpsRoutes.post("/deposit", async (req: Request, res: Response) => {
  try{
    const { amount, userAddress } = req.body;
    if(!amount || !userAddress) {
      return res.status(BAD_REQUEST_CODE).json({ message: "Invalid request body" });
    }
    const depositStatus = await perpsAdapter.deposit(amount, userAddress);
    if(!depositStatus) {
      return res.status(INTERNAL_SERVER_ERROR_CODE).json({ message: "Failed to deposit" });
    }
    return res.status(SUCCESS_CODE).json(depositStatus);
  }catch(error){
    return res.status(INTERNAL_SERVER_ERROR_CODE).json({ message: "Failed to deposit" });
  }
});