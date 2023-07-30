"use client";

import { useEffect, useState } from "react";

const Marketplace = ({}) => {
  const [nfts, setNfts] = useState<any>([]);
  console.log("🚀 ~ file: Marketplace.tsx:7 ~ Marketplace ~ nfts:", nfts);

  useEffect(() => {
    const getMarkets = async () => {
      var myHeaders = new Headers();
      myHeaders.append("x-api-key", "yuNXtSyS8hhVTdkn");

      const res = await fetch(
        "https://api.shyft.to/sol/v1/marketplace/my_markets?network=mainnet-beta",
        {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        }
      );

      const data = await res.json();

      const markets = data.result;

      const response = await fetch(
        `https://api.shyft.to/sol/v1/marketplace/active_listings?network=mainnet-beta&marketplace_address=${markets[0].address.toString()}`,
        {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        }
      );

      const nfts = await response.json();
      setNfts(nfts.result);
    };

    getMarkets();
  }, []);

  const buyNfts = async (nft: any) => {
    var myHeaders = new Headers();
    myHeaders.append("x-api-key", "yuNXtSyS8hhVTdkn");

    var raw = JSON.stringify({
      network: "mainnet-beta",
      marketplace_address: nft.marketplace_address,
      nft_address: nft.nft_address,
      price: nft.price,
      seller_wallet: nft.seller_wallet,
      buyer_wallet: nft.buyer_wallet,
    });

    const response = await fetch(
      `https://api.shyft.to/sol/v1/marketplace/buy`,
      {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
        body: raw,
      }
    );
  };

  return (
    <>
      <div className='grid pt-8 grid-cols-1 container mx-auto gap-6 w-full sm:grid-cols-2 lg:grid-cols-3'>
        {nfts.length > 0 ? (
          nfts.map((nft: any, index: number) => (
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

                <button className='py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 mt-4 w-full flex items-center justify-center'>
                  Buy Now
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
              No listed nfts yet - Shyft is having problems on their backend our
              code its perfect :), you can see the issue by going into the /list
              page and try to list some of your nfts
            </div>
          </>
        )}
      </div>
    </>
  );
};
export default Marketplace;
