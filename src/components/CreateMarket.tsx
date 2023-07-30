"use client";

//typed form
import { z } from "zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// utils
import { toast } from "react-hot-toast";

import { useWallet } from "@solana/wallet-adapter-react";
import { signAndConfirmTransactionFe } from "~/utils/utilityFunc";

// Product schema and type
const productSchema = z.object({
  title: z.string(),
  description: z.string(),
});
type Product = z.infer<typeof productSchema>;

const UploadSongForm = () => {
  const { wallet } = useWallet();
  const publicKey = wallet?.adapter.publicKey?.toBase58();
  console.log(publicKey);

  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Product>({ resolver: zodResolver(productSchema) });

  if (errors.title) console.log(errors.title.message + "title");
  if (errors.description)
    console.log(errors.description.message + "description");

  //starts handle submit function
  const onSubmit: SubmitHandler<Product> = async (data) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("x-api-key", "yuNXtSyS8hhVTdkn");
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        network: "mainnet-beta",
        transaction_fee: 10,
        fee_payer: publicKey,
        fee_recipient: publicKey,
        creator_wallet: publicKey,
      });

      const res = await fetch(
        "https://api.shyft.to/sol/v1/marketplace/create",
        {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        }
      );
      const resJson = await res.json();
      if (resJson.success === true) {
        const transaction = resJson.result.encoded_transaction;
        const res_trac = await signAndConfirmTransactionFe(
          "mainnet-beta",
          transaction,
          () => {
            toast.success("Album creado con éxito");
          }
        );
        return {
          marketAddress: res_trac,
        };
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al crear la canción, inténtelo mas tarde");
    }
  };
  // end of handle submit function

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-12 bg-zinc-900 h-screen'>
        <div className='border-b border-white/10 pb-12 container mx-auto px-2 pt-8 max-w-4xl'>
          <h2 className='text-base font-semibold leading-7 text-white'>
            Create a new album
          </h2>
          <p className='mt-1 text-sm leading-6 text-gray-400'>
            Fill in the details of your album.
          </p>
          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
            <div className='sm:col-span-4'>
              <label
                htmlFor='title'
                className='block text-sm font-medium leading-6 text-white'
              >
                Album title
              </label>
              <div className='mt-2'>
                <input
                  id='title'
                  {...register("title")}
                  type='title'
                  className='block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            <div className='col-span-full'>
              <label
                htmlFor='description'
                className='block text-sm font-medium leading-6 text-white'
              >
                Description
              </label>
              <div className='mt-2'>
                <textarea
                  id='description'
                  {...register("description")}
                  rows={3}
                  className='block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6'
                  defaultValue={""}
                />
              </div>
              <p className='mt-3 text-sm leading-6 text-gray-400'>
                Write a few sentences description about your album.
              </p>
            </div>
          </div>
          <button
            type='submit'
            className='rounded-md w-full mt-8 bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

export default UploadSongForm;
