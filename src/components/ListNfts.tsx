"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { signAndConfirmTransactionFe } from "~/utils/utilityFunc";

const ListNfts = ({}) => {
  const { wallet } = useWallet();
  const publicKey = wallet?.adapter.publicKey?.toBase58();

  // get albums
  const [album, setAlbum] = useState<any>({});
  const [allNfts, setAllNfts] = useState<any>([]);
  useEffect(() => {
    if (!publicKey) return;

    (async () => {
      var myHeaders = new Headers();
      myHeaders.append("x-api-key", "yuNXtSyS8hhVTdkn");

      const nfts = await fetch(
        `https://api.shyft.to/sol/v1/nft/read_all?network=mainnet-beta&address=${publicKey}`,
        {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        }
      );
      const nfts_data = await nfts.json();

      setAllNfts(nfts_data.result);

      const res = await fetch(
        `https://api.shyft.to/sol/v1/marketplace/find?network=mainnet-beta&creator_address=${publicKey.toString()}&currency_address=So11111111111111111111111111111111111111112&authority_address=${publicKey.toString()}`,
        {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        }
      );

      const data = await res.json();
      setAlbum(data.result);
      return;
    })();
  }, [publicKey]);
  const MintNft = async (address: string) => {
    var myHeaders = new Headers();
    myHeaders.append("x-api-key", "yuNXtSyS8hhVTdkn");
    myHeaders.append("Content-Type", "application/json");

    if (!album.address) return toast.error("Please create album first");
    var raw = JSON.stringify({
      network: "mainnet-beta",
      marketplace_address: album.address as string,
      nft_address: address as string,
      price: 0.001,
      seller_wallet: publicKey as string,
    });

    fetch("https://api.shyft.to/sol/v1/marketplace/list", {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    })
      .then((response) => response.json())
      .then(async (result) => {
        if (result.success === true) {
          const transaction = result.result.encoded_transaction;
          const res_trac = await signAndConfirmTransactionFe(
            "mainnet-beta",
            transaction,
            () => {
              console.log("Transaction sent");
            }
          );

          return {
            hash: res_trac,
          };
        }
      })
      .catch((error) => console.log("error", error));
  };
  return (
    <>
      <div className=' m-8'>
        <p className='mt-1 text-sm leading-6 text-zinc-900'>
          If you dont have an album yet, you can create one{" "}
          <Link href='/create' className='font-bold  hover:text-zinc-700'>
            here.{" "}
          </Link>
        </p>
      </div>
      <div className='grid pt-8 grid-cols-1 container mx-auto gap-6 w-full sm:grid-cols-2 lg:grid-cols-3'>
        {allNfts.length > 0 ? (
          allNfts.map((nft: any, index: number) => (
            <div className='w-80 bg-white shadow rounded-md' key={index}>
              <div
                className='h-48 w-full bg-gray-200 flex flex-col justify-between bg-cover rounded-t-md bg-center'
                style={{
                  backgroundImage: `url("${nft.attributes.image}")`,
                }}
              >
                <div>
                  <span className='uppercase text-xs bg-green-50 p-0.5 m-1 border-green-500 border rounded text-green-700 font-medium select-none'>
                    available
                  </span>
                </div>
              </div>
              <div className='p-4 flex flex-col items-center'>
                <p className='text-gray-400 font-light text-xs text-center'>
                  Hammond robotics
                </p>
                <h1 className='text-gray-800 text-center mt-1'>{nft.name}</h1>
                <p className='text-center text-gray-800 mt-1'>
                  ${nft.attributes.price}
                </p>

                <button
                  onClick={() => MintNft(nft.mint)}
                  className='py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 mt-4 w-full flex items-center justify-center'
                >
                  Mint
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6 ml-2'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <>
            <div>
              You dont have nfts yet create one in the /upload page or click{" "}
              <Link href='/upload' className='font-bold   hover:text-zinc-700'>
                here
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
};
export default ListNfts;
