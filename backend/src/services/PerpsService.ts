import axios from "axios";
import { PERPS_ENDPOINT, USDC_DECIMALS } from "../utils/constants";
import { account, aptos } from "../utils/setup";
import { SimpleTransaction } from "@aptos-labs/ts-sdk";

/**
 * @function CreateDeposit
 * @param userAddress string
 * @param amount
 * @returns SimpleTransaction
 * @description Creates a deposit for a user
 * @throws Error if the deposit is not created
 * @throws Error if the request fails
 */
export const CreateDeposit = async (userAddress: string, amount: number) => {
  try {
    const formattedAmount = parseInt((amount * 10 ** USDC_DECIMALS).toString());
    const params = {
      userAddress: userAddress,
      amount: formattedAmount,
    };
    const response = await axios.get(`${PERPS_ENDPOINT}/deposit`, {
      params,
      headers: {
        "x-api-key": process.env.API_KEY,
      },
    });
    const payloadData = response.data.data;
    const transactionPayload: SimpleTransaction =
      await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: payloadData,
      });
    const executedTransaction = await ExecuteTransaction(transactionPayload);
    return executedTransaction;
  } catch (error) {
    console.error("Error creating deposit:", error);
    return null;
  }
};

export const GetOrderBook = async (
  marketId: number
): Promise<{
  bestAskPrice: number;
  bestBidPrice: number;
    } | null> => {
  try {
    const params = {
      marketId: marketId,
    };
    const response = await axios.get(`${PERPS_ENDPOINT}/getMarketPrice`, {
      params,
      headers: {
        "x-api-key": process.env.API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting order book:", error);
    return null;
  }
};

/**
 * @function PlaceLimitOrder
 * @param marketId number
 * @param size number
 * @param price number
 * @param side string
 * @param leverage number
 * @returns SimpleTransaction
 */
export const PlaceLimitOrder = async (
  marketId: number,
  size: number,
  price: number,
  side: string,
  leverage: number = 1
) => {
  try {
    let sideValue = side.toLowerCase() === "long" ? true : false;
    const params = {
      marketId: marketId,
      size: size,
      price: price,
      side: sideValue,
      leverage: leverage,
    };
    const response = await axios.get(`${PERPS_ENDPOINT}/placeLimitOrder`, {
      params,
      headers: {
        "x-api-key": process.env.API_KEY,
      },
    });
    const payloadData = response.data.data;
    const transactionPayload: SimpleTransaction =
      await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: payloadData,
      });
    const executedTransaction = await ExecuteTransaction(transactionPayload);
    return executedTransaction;
  } catch (error) {
    console.error("Error placing limit order:", error);
    return null;
  }
};

/**
 * @function GetOpenOrders
 * @param userAddress string
 * @returns array of open orders
 * @description Gets the open orders for a user
 * @throws Error if the open orders are not found
 * @throws Error if the request fails
 */
export const GetOrderHistory = async (userAddress: string) => {
  try {
    const params = {
      userAddress: userAddress,
    };
    const response = await axios.get(`${PERPS_ENDPOINT}/getOrderHistory`, {
      params,
      headers: {
        "x-api-key": process.env.API_KEY,
      },
    });
    const openOrders = response.data;
    return openOrders;
  } catch (err) {
    console.error("Error getting open orders:", err);
    return null;
  }
};

/**
 * @function GetPositions
 * @param userAddress string
 * @returns array of positions
 * @description Gets the positions for a user
 * @throws Error if the positions are not found
 * @throws Error if the request fails
 */
export const GetPositions = async (userAddress: string) => {
  try {
    const params = {
      userAddress: userAddress,
    };
    const response = await axios.get(`${PERPS_ENDPOINT}/getPositions`, {
      params,
    });
    const positions = response.data;
    return positions;
  } catch (err) {
    console.error("Error getting positions:", err);
    return null;
  }
};

/**
 * @function GetOrderStatusByOrderId
 * @param marketId number
 * @param orderId string
 * @returns order status
 * @description Gets the order status by order id
 * @throws Error if the order status is not found
 * @throws Error if the request fails
 */
export const GetOrderStatusByOrderId = async (
  marketId: number,
  orderId: string
) => {
  try {
    const params = {
      marketId: marketId,
      orderId: orderId,
    };
    const response = await axios.get(
      `${PERPS_ENDPOINT}/getOrderStatusByOrderId`,
      {
        params,
        headers: {
          "x-api-key": process.env.API_KEY,
        },
      }
    );
    const orderStatus = response.data;
    return orderStatus;
  } catch (err) {
    console.error("Error getting order status by order id:", err);
    return null;
  }
};

/**
 * @function GetDepositWithdrawHistory
 * @param userAddress string
 * @returns array of deposit and withdraw history
 * @description Gets the deposit and withdraw history for a user
 * @throws Error if the deposit and withdraw history are not found
 * @throws Error if the request fails
 */
export const GetDepositWithdrawHistory = async (userAddress: string) => {
  try {
    const params = {
      userAddress: userAddress,
    };
    const response = await axios.get(
      `${PERPS_ENDPOINT}/getDepositAndWithdrawHistory`,
      {
        params,
        headers: {
          "x-api-key": process.env.API_KEY,
        },
      }
    );
    const depositWithdrawHistory = response.data;
    return depositWithdrawHistory;
  } catch (err) {
    console.error("Error getting deposit withdraw history:", err);
    return null;
  }
};

/**
 * @function ExecuteTransaction
 * @param transactionPayload SimpleTransaction
 * @returns void
 * @description Executes a transaction and logs the result
 * @throws Error if the transaction fails
 * @throws Error if the transaction is not found
 */
export const ExecuteTransaction = async (
  transactionPayload: SimpleTransaction
): Promise<boolean> => {
  try {
    const committedTxn = await aptos.transaction.signAndSubmitTransaction({
      transaction: transactionPayload,
      signer: account,
    });
    console.log(`Submitted transaction: ${committedTxn.hash}`);
    const response = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    console.log("response", response.success);
    return response.success;
  } catch (error) {
    console.error("Error executing transaction:", error);
    return null;
  }
};
