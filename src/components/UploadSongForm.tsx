"use client";

//typed form
import { z } from "zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// icons
import { MusicalNoteIcon, PhotoIcon } from "@heroicons/react/24/outline";

// utils
import { toast } from "react-hot-toast";

import axios from "axios";
import { signAndConfirmTransactionFe } from "~/utils/utilityFunc";
import Link from "next/link";

//web3
import { useWallet } from "@solana/wallet-adapter-react";

// song constraints for schema
const ACCEPTED_song_TYPES = [
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/m4a",
  "audio/flac",
  "audio/aac",
  "audio/wma",
  "audio/aiff",
  "audio/opus",
  "audio/mpeg",
];
const ACCEPTED_photo_TYPES = ["image/png", "image/jpeg"];

// Product schema and type
const productSchema = z.object({
  title: z.string(),
  name: z.string(),
  genre: z.string(),
  description: z.string(),
  song: z
    .any()
    .refine((files) => files?.[0]?.size <= 15000000, `Max file size is 15MB.`)
    .refine(
      (files) => ACCEPTED_song_TYPES.includes(files?.[0]?.type),
      "Invalid song type only .mp3 .wav .ogg .m4a .flac .aac .wma .aiff .opus .mpeg"
    ),
  photo: z
    .any()
    .refine((files) => files?.[0]?.size <= 10000000, `Max file size is 10MB.`)
    .refine(
      (files) => ACCEPTED_photo_TYPES.includes(files?.[0]?.type),
      "Invalid photo type only .png .jpeg"
    ),
});
type Product = z.infer<typeof productSchema>;

const UploadSongForm = () => {
  const { wallet } = useWallet();
  const publicKey = wallet?.adapter.publicKey?.toBase58();

  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Product>({ resolver: zodResolver(productSchema) });

  if (errors.song) console.log(errors.song.message + "song");
  if (errors.title) console.log(errors.title.message + "title");
  if (errors.name) console.log(errors.name.message + "name");
  if (errors.genre) console.log(errors.genre.message + "genre");
  if (errors.description)
    console.log(errors.description.message + "description");

  //upload song to Cloudinary function
  const uploadSong = async (data: File) => {
    const songForm = new FormData();
    songForm.append("file", data);
    songForm.append("upload_preset", "drg4yuxu");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dtx8ggxrb/video/upload",
      {
        method: "POST",
        body: songForm,
      }
    );
    const songData = await res.json();
    return songData.secure_url as string;
  };
  const uploadImage = async (data: File) => {
    const imageForm = new FormData();
    imageForm.append("file", data);
    imageForm.append("upload_preset", "eiysglfa");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dtx8ggxrb/image/upload",
      {
        method: "POST",
        body: imageForm,
      }
    );
    const imageData = await res.json();
    return imageData.secure_url as string;
  };

  //starts handle submit function
  const onSubmit: SubmitHandler<Product> = async (data) => {
    console.log(
      "🚀 ~ file: UploadSongForm.tsx:97 ~ constonSubmit:SubmitHandler<Product>= ~ data:",
      data
    );
    const song = await uploadSong(data.song[0] as File);
    if (!song)
      return toast.error("Error al subir la canción, inténtelo mas tarde");
    const image = await uploadImage(data.photo[0] as File);
    if (!image)
      return toast.error("Error al subir la imagen, inténtelo mas tarde");

    if (!publicKey)
      return toast.error("Inicia sesión con tu wallet para subir canciones");
    try {
      const formData = new FormData();
      const attrib = [
        {
          trait_type: "price",
          value: "0.0001",
        },
        {
          trait_type: "song",
          value: song,
        },
        {
          trait_type: "author",
          value: data.name,
        },
        {
          trait_type: "image",
          value: image,
        },
      ];
      formData.append("network", "mainnet-beta");
      formData.append("wallet", publicKey as string);
      formData.append("name", data.title);
      formData.append("symbol", "XMNFTS");
      formData.append("description", data.description);
      formData.append("attributes", JSON.stringify(attrib));
      formData.append("external_url", song);
      formData.append(
        "data",
        JSON.stringify({
          song: song,
          image: image,
        })
      );
      formData.append("max_supply", "0");
      formData.append("royalty", ".0001");
      formData.append("file", data.photo[0] as File, "foto.png");
      new Promise((resolve, reject) => {
        axios({
          // Endpoint to send files
          url: "https://api.shyft.to/sol/v1/nft/create_detach",
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            "x-api-key": "yuNXtSyS8hhVTdkn",
            Accept: "*/*",
            "Access-Control-Allow-Origin": "*",
          },
          // Attaching the form data
          data: formData,
        })
          // Handle the response from backend here
          .then(
            async (res: {
              data: { success: boolean; result: { encoded_transaction: any } };
            }) => {
              if (res.data.success === true) {
                const transaction = res.data.result.encoded_transaction;
                const res_trac = await signAndConfirmTransactionFe(
                  "mainnet-beta",
                  transaction,
                  () => {
                    resolve("done");
                  }
                );
                return {
                  hash: res_trac,
                };
              }
            }
          )
          .catch((err: Error) => {
            reject(err);
          });
      });
    } catch (error) {
      console.log(error);
      toast.error("Error al crear la canción, inténtelo mas tarde");
    }
  };
  // end of handle submit function

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-12 bg-zinc-900 '>
        <div className='border-b border-white/10 pb-12 container mx-auto px-2 pt-8 max-w-4xl'>
          <h2 className='text-base font-semibold leading-7 text-white'>
            Create a new song
          </h2>
          <p className='mt-1 text-sm leading-6 text-zinc-400'>
            If you dont have an album yet, you can create one{" "}
            <Link
              href='/create'
              className='font-bold text-white hover:text-zinc-300'
            >
              here.{" "}
            </Link>
          </p>
          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
            <div className='sm:col-span-4'>
              <label
                htmlFor='title'
                className='block text-sm font-medium leading-6 text-white'
              >
                Song title
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
            <div className='sm:col-span-4'>
              <label
                htmlFor='genre'
                className='block text-sm font-medium leading-6 text-white'
              >
                Genre
              </label>
              <div className='mt-2'>
                <input
                  id='genre'
                  {...register("genre")}
                  type='text'
                  className='block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            <div className='sm:col-span-4'>
              <label
                htmlFor='Author'
                className='block text-sm font-medium leading-6 text-white'
              >
                Author name
              </label>
              <div className='mt-2'>
                <input
                  type='text'
                  {...register("name")}
                  id='Author'
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
              <p className='mt-3 text-sm leading-6 text-zinc-400'>
                Write a few sentences description about your song.
              </p>
            </div>

            <div className='col-span-full'>
              <label
                htmlFor='song'
                className='block text-sm font-medium leading-6 text-white'
              >
                Song
              </label>
              <div className='mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10'>
                <div className='text-center flex justify-center flex-col items-center'>
                  <MusicalNoteIcon
                    className='mx-auto h-12 w-12 text-zinc-500'
                    aria-hidden='true'
                  />
                  <div className='mt-4 flex text-sm leading-6 text-zinc-400'>
                    <label
                      htmlFor='song'
                      className='relative cursor-pointer rounded-md bg-zinc-900 font-semibold text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:ring-offset-zinc-900 hover:text-indigo-500'
                    >
                      <input id='song' {...register("song")} type='file' />
                    </label>
                  </div>
                  <p className='text-xs  text-zinc-400 mt-4'>MP3 up to 15MB</p>
                </div>
              </div>
            </div>
            <div className='col-span-full'>
              <label
                htmlFor='photo'
                className='block text-sm font-medium leading-6 text-white'
              >
                Cover photo
              </label>
              <div className='mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10'>
                <div className='text-center flex justify-center flex-col items-center'>
                  <PhotoIcon
                    className='mx-auto h-12 w-12 text-zinc-500'
                    aria-hidden='true'
                  />
                  <div className='mt-4 flex text-sm leading-6 text-zinc-400'>
                    <label
                      htmlFor='photo'
                      className='relative cursor-pointer rounded-md bg-zinc-900 font-semibold text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:ring-offset-zinc-900 hover:text-indigo-500'
                    >
                      <input id='photo' {...register("photo")} type='file' />
                    </label>
                  </div>
                  <p className='text-xs  text-zinc-400 mt-4'>
                    JPEG or PNG up to 10MB
                  </p>
                </div>
              </div>
            </div>
            <button
              type='submit'
              className='rounded-md w-full bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UploadSongForm;
