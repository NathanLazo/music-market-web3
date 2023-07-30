import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
} from "@solana/web3.js";
import { NodeWallet } from "@metaplex/js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { decode } from "bs58";
import { Buffer } from "buffer";
import { Cluster } from "@solana/web3.js";

//import { ShyftWallet } from '../types';

export async function confirmTransactionFromBackend(
  network: Cluster | undefined,
  encodedTransaction:
    | WithImplicitCoercion<string>
    | { [Symbol.toPrimitive](hint: "string"): string },
  privateKey: string
) {
  const connection = new Connection(clusterApiUrl(network), "confirmed");
  const feePayer = Keypair.fromSecretKey(decode(privateKey));
  const wallet = new NodeWallet(feePayer);
  const recoveredTransaction = Transaction.from(
    Buffer.from(encodedTransaction, "base64")
  );
  const signedTx = await wallet.signTransaction(recoveredTransaction);
  const confirmTransaction = await connection.sendRawTransaction(
    signedTx.serialize()
  );
  return confirmTransaction;
}

export async function confirmTransactionFromFrontend(
  connection: { sendRawTransaction: (arg0: any) => any },
  encodedTransaction:
    | WithImplicitCoercion<string>
    | { [Symbol.toPrimitive](hint: "string"): string },
  wallet: { signTransaction: (arg0: Transaction) => any }
) {
  console.log(encodedTransaction);
  const recoveredTransaction = Transaction.from(
    Buffer.from(encodedTransaction, "base64")
  );
  const signedTx = await wallet.signTransaction(recoveredTransaction);
  const confirmTransaction = await connection.sendRawTransaction(
    signedTx.serialize()
  );
  return confirmTransaction;
}
