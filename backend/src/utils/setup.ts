// Import required packages
import dotenv from 'dotenv';
import axios from 'axios';
import { AptosConfig, Aptos, Network, Account,PrivateKey, Ed25519PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";

// Load environment variables from .env file
dotenv.config();

// Setup the client
export const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);
export const formattedPrivateKey = PrivateKey.formatPrivateKey(
    process.env.APTOS_PRIVATEKEY || '',
    'ed25519' as PrivateKeyVariants
);
export const account = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(formattedPrivateKey),
});