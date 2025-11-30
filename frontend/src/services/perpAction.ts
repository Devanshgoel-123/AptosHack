import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Map token symbol to market ID
 */
export const getMarketId = (token: string): number | null => {
  const tokenUpper = token.toUpperCase();
  const marketMap: Record<string, number> = {
    APT: 14,
    BTC: 15,
    // Add more mappings as needed
  };
  return marketMap[tokenUpper] || null;
};

export interface OpenPositionParams {
  marketId: number;
  size: number;
  leverage: number;
}

export interface Position {          
  address: string;
  available_order_size: number;     // raw.available_order_size
  entry_price: number;             // raw.entry_price
  leverage: number;
  liq_price: number;               // raw.liq_price
  margin: number;
  market_id: number;                 // raw.margin
  size:string;
  trade_id:string;         // raw.value
  trade_side:boolean;
  value:string;
}
export interface OrderHistoryItem {
  id?: string;
  marketId?: number;
  side?: "LONG" | "SHORT";
  size?: number;
  price?: number;
  timestamp?: string;
  status?: string;
  [key: string]: any;
}

export interface DepositParams {
  amount: number;
  userAddress: string;
}

/**
 * Open a long position
 */
export const openLong = async (
  marketId: number,
  address: string,
  leverage: number
): Promise<Position> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/perps/openLong`,
      {
        marketId,
        leverage,
        address
      }
    );
    console.log("openLong response", response.data);
    return response.data;
  } catch (err: any) {
    console.log("openLong error", err.response?.data?.message);
    throw new Error(
      err.response?.data?.message || "Failed to open long position"
    );
  }
};

/**
 * Open a short position
 */
export const openShort = async (
  marketId: number,
  address: string,
  leverage: number
): Promise<Position> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/perps/openShort`,
      {
        marketId,
        address,
        leverage,
      }
    );
    console.log("openShort response", response.data);
    return response.data;
  } catch (err: any) {
    console.log("openShort error", err.response?.data?.message);
    throw new Error(
      err.response?.data?.message || "Failed to open short position"
    );
  }
};

/**
 * Get all positions for a given address
 */
export const getPositions = async (address: string): Promise<Position[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/perps/getPositions`,
      {
        params: {
          address,
        },
      }
    );
    console.log("getPositions response", response.data);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to get positions");
  }
};

/**
 * Get order history for a given address
 */
export const getOrderHistory = async (
  address: string
): Promise<OrderHistoryItem[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/perps/getOrderHistory`,
      {
        params: {
          address,
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Failed to get order history"
    );
  }
};

/**
 * Deposit funds to the perps account
 */
export const deposit = async (
  amount: number,
  userAddress: string
): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/perps/deposit`, {
      amount,
      userAddress,
    });
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to deposit");
  }
};
