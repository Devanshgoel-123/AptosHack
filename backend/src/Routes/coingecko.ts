import express, { Request, Response } from "express";
import { getFearGreedIndex, getTokenAmountOwnedByAccount, fetchTokenPriceInUsd, getHistoricalPrice } from "../services/coingecko";
import { SUCCESS_CODE, INTERNAL_SERVER_ERROR_CODE, BAD_REQUEST_CODE } from "../utils/constants";
export const coingeckoRoutes = express.Router();
coingeckoRoutes.use(express.json());

coingeckoRoutes.get("/getFearGreedIndex", async (req: Request, res: Response) => {
  try{
    const fearGreedIndex = await getFearGreedIndex();
    return res.status(SUCCESS_CODE).json(fearGreedIndex);
  }catch(error){
    return res.status(INTERNAL_SERVER_ERROR_CODE).json({ message: "Failed to get fear greed index" });
  }
});

coingeckoRoutes.get("/getTokenPriceInUsd", async (req: Request, res: Response) => {
  try{
    const { tokenAddress } = req.body;
    if(!tokenAddress) {
      return res.status(BAD_REQUEST_CODE).json({ message: "Invalid request body" });
    }
    const tokenPriceInUsd = await fetchTokenPriceInUsd(tokenAddress);
    if(!tokenPriceInUsd) {
      return res.status(INTERNAL_SERVER_ERROR_CODE).json({ message: "Failed to get token price in usd" });
    }
    return res.status(SUCCESS_CODE).json(tokenPriceInUsd);
  }catch(error){
    return res.status(INTERNAL_SERVER_ERROR_CODE).json({ message: "Failed to get token price in usd" });
  }
});

coingeckoRoutes.get("/getTokenAmountOwnedByAccount", async (req: Request, res: Response) => {
  try{
    const { userAddress, tokenAddress } = req.body;
    if(!userAddress || !tokenAddress) {
      return res.status(BAD_REQUEST_CODE).json({ message: "Invalid request body" });
    }
    const tokenAmountOwnedByAccount = await getTokenAmountOwnedByAccount(userAddress, tokenAddress);
    return res.status(SUCCESS_CODE).json(tokenAmountOwnedByAccount);
  }catch(error){
    return res.status(INTERNAL_SERVER_ERROR_CODE).json({ message: "Failed to get token amount owned by account" });
  }
});


coingeckoRoutes.get("/getHistoricalPrice", async (req: Request, res: Response) => {
    try{
        const { tokenAddress, startDate, endDate } = req.body;
        if(!tokenAddress || !startDate || !endDate) {
            return res.status(BAD_REQUEST_CODE).json({ message: "Invalid request body" });
        }
        const historicalPrice = await getHistoricalPrice(tokenAddress);
        return res.status(SUCCESS_CODE).json(historicalPrice);
    }catch(error){
        return res.status(INTERNAL_SERVER_ERROR_CODE).json({ message: "Failed to get historical price" });
    }
})