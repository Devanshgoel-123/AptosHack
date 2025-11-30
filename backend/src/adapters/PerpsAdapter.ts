import { fetchTokenPriceInUsd } from "../services/coingecko";
import { APT_TOKEN_ADDRESS, BTC_TOKEN_ADDRESS, APT_MARKET_ID, APT_PRECISION, BTC_PRECISION } from "../utils/constants";
import { CreateDeposit, GetUserWalletBalance, GetOrderHistory, GetPositions, PlaceLimitOrder } from "../services/PerpsService";
export class PerpsAdapter {

  async openLong( marketId: number, leverage: number, address: string): Promise<boolean> {
    const walletBalanceInUSDT= await this.getUserWalletBalance(address);
    if(walletBalanceInUSDT < 1) {
      return true;
    }
    const tokenPriceInUSDT = marketId === APT_MARKET_ID ? await fetchTokenPriceInUsd(APT_TOKEN_ADDRESS) : await fetchTokenPriceInUsd(BTC_TOKEN_ADDRESS);
    const tradeSize = Number((Math.floor(walletBalanceInUSDT)/tokenPriceInUSDT).toFixed(marketId === APT_MARKET_ID ? APT_PRECISION : BTC_PRECISION));
   const position = await PlaceLimitOrder(
      marketId,
      tradeSize,
      "long",
      leverage
    )
    return position;
  };

  async openShort(marketId: number, leverage: number, address: string): Promise<boolean> {
    const walletBalanceInUSDT= await this.getUserWalletBalance(address);
    if(walletBalanceInUSDT < 1) {
      return true;
    }
    const tokenPriceInUSDT = marketId === APT_MARKET_ID ? await fetchTokenPriceInUsd(APT_TOKEN_ADDRESS) : await fetchTokenPriceInUsd(BTC_TOKEN_ADDRESS);
    const tradeSize = Number((Math.floor(walletBalanceInUSDT)/tokenPriceInUSDT).toFixed(marketId === APT_MARKET_ID ? APT_PRECISION : BTC_PRECISION));
  const position = await PlaceLimitOrder(
      marketId,
      tradeSize,
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

  async getUserWalletBalance(address: string): Promise<number> {
    const userWalletBalance = await GetUserWalletBalance(address);
    return Number(userWalletBalance);
  };
}

