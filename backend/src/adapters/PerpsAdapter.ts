import { CreateDeposit, GetOrderBook, GetOrderHistory, GetPositions, PlaceLimitOrder } from "../services/PerpsService";
export class PerpsAdapter {

  async openLong( marketId: number, size: number, leverage: number): Promise<boolean> {
   const position = await PlaceLimitOrder(
      marketId,
      size,
      "long",
      leverage
    )
    return position;
  };

  async openShort(marketId: number, size: number, leverage: number): Promise<boolean> {
    // const {
    //   bestAskPrice,
    //   bestBidPrice
    // }= await GetOrderBook(marketId);
    // if (!bestAskPrice || !bestBidPrice) {
    //   throw new Error("Failed to get order book");
    // }
   // const price = parseInt(((bestAskPrice+bestBidPrice)/2).toString());
    const position = await PlaceLimitOrder(
      marketId,
      size,
      "short",
      leverage
    )
    return position;
  };

  async getPositions(address: string): Promise<any> {
    const positions = await GetPositions(address);
    return positions;
  };

  async getOrderHistory(address: string): Promise<any> {
    const orderHistory = await GetOrderHistory(address);
    return orderHistory;
  };

  
  async deposit(amount: number, userAddress: string): Promise<boolean> {
    const depositStatus = await CreateDeposit(userAddress, amount);
    return depositStatus;
  };
}

