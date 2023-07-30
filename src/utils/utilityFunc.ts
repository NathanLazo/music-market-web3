import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SignatureResultCallback,
} from "@solana/web3.js";
import {
  confirmTransactionFromBackend,
  confirmTransactionFromFrontend,
} from "./shift.ts";

import { Cluster } from "@solana/web3.js";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-wallets";

export async function connectTheWallet() {
  // @ts-ignore
  const { solana } = window;
  let res = { success: false, message: "Could not connect wallet", addr: "" };
  if (!solana) {
    alert("Please Install Phantom");
  }
  try {
    const network = "mainnet-beta";
    const phantom = new BackpackWalletAdapter();
    //await phantom.disconnect();
    await phantom.connect();
    const rpcUrl = clusterApiUrl(network);
    const connection = new Connection(rpcUrl, "confirmed");

    const wallet = {
      address: phantom.publicKey?.toBase58(),
    };

    if (wallet.address) {
      const accountInfo = await connection.getAccountInfo(
        new PublicKey(wallet.address),
        "confirmed"
      );
      //console.log(accountInfo);
      console.log("Wallet Connected");
      res.success = true;
      res.message = "Wallet connected successfully";
      res.addr = wallet.address;
    }
  } catch (err) {
    console.log(err);
  }
  return res;
}

export async function signAndConfirmTransaction(
  network: Cluster | undefined,
  transaction: any,
  callback: SignatureResultCallback,
  prvKey: any
) {
  const phantom = new BackpackWalletAdapter();
  await phantom.connect();
  const rpcUrl = clusterApiUrl(network);
  const connection = new Connection(rpcUrl, "confirmed");
  const ret = await confirmTransactionFromBackend(network, transaction, prvKey);
  console.log(ret);

  connection.onSignature(ret, callback, "finalized");
  return ret;
}
export async function signAndConfirmTransactionFe(
  network: Cluster | undefined,
  transaction: any,
  callback: SignatureResultCallback
) {
  const phantom = new BackpackWalletAdapter();
  await phantom.connect();
  const rpcUrl = clusterApiUrl(network);
  const connection = new Connection(rpcUrl, "confirmed");
  //console.log(connection.rpcEndpoint);
  const ret = await confirmTransactionFromFrontend(
    connection,
    transaction,
    phantom
  );
  // const checks = await connection.confirmTransaction({signature:ret},'finalised');
  console.log(ret);
  // console.log(checks);
  // await connection.confirmTransaction({
  //     blockhash: transaction.blockhash,
  //     signature: ret,
  //   });
  connection.onSignature(ret, callback, "finalized");
  return ret;
}
