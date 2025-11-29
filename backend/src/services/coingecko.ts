import axios from "axios";
import { aptos } from "../utils/setup";
import { GreedIndex } from "../utils/types";
/**
 * @function fetchTokenPriceInUsd
 * @param tokenAddress string
 * @description Fetches the price of a token in USD
 * @throws Error if the price is not found
 * @throws Error if the request fails
 * @returns number
 */
export const fetchTokenPriceInUsd = async (
  tokenAddress: string
): Promise<number | null> => {
  try {
    const url = `https://api.panora.exchange/prices?tokenAddress=${tokenAddress}`;
    const result = await axios.get(url, {
      headers: {
        "x-api-key":
          "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi",
      },
    });
    return result.data[0].usdPrice;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return null;
  }
};

/**
 * @function getTokenAmountOwnedByAccount
 * @param userAddress string
 * @param token_address string
 * @returns number
 * @description Fetches the amount of a token owned by an account
 * @throws Error if the amount is not found
 * @throws Error if the request fails
 * @returns number
 */
export const getTokenAmountOwnedByAccount = async (
  userAddress: string,
  token_address: string
) => {
  try {
    const userOwnedTokens = await aptos.getBalance({
      accountAddress: userAddress,
      asset: token_address as `${string}::${string}::${string}`,
    });
    return userOwnedTokens;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return null;
  }
};

/**
 * @function getFearGreedIndex
 * @returns array of GreedIndex
 * @description Fetches the fear and greed index
 * @throws Error if the index is not found
 * @throws Error if the request fails
 * @returns array of GreedIndex
 */
export const getFearGreedIndex = async () => {
  try {
    const url =
      "https://pro-api.coinmarketcap.com/v3/fear-and-greed/historical?start=1&limit=30";
    const response = await axios.get(url, {
      headers: {
        "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY!,
        Accept: "application/json",
      },
    });
    const data = await response.data.data;
    const answer = data.map((item: GreedIndex) => {
      return {
        value_classification: item.value_classification,
        value: item.value,
      };
    });
    return answer;
  } catch (err) {
    console.log(err);
    return "Error fetching getFearGreedIndex";
  }
};


/**
 * @function getHistoricalPrice
 * @param tokenId string
 * @description Fetches the historical price of a token
 * @throws Error if the price is not found
 * @throws Error if the request fails
 * @returns any
 * @returns 
 */
export const getHistoricalPrice = async (
  tokenId: string,
): Promise<any | null> => {
  try {
    const timeTo = new Date().getTime() / 1000;
    const timeFrom = new Date().getTime() / 1000 - 6 * 30 * 86400;
    const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart/range?vs_currency=usd&from=${timeFrom}&to=${timeTo}&precision=4`;
    const headers = {
      accept: "application/json",
      "x-cg-demo-api-key": `${process.env.HISTORY_API_KEY}`,
    };
    const response = await axios.get(url, { headers });
    console.log(response.data.prices);
    return response.data
  } catch (error) {
    return null;
  }
};
