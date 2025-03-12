"use client";

import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const Appbar = () => {
  const session = useSession();

  return (
    <div className="flex justify-between items-center px-5 m-5 bg-gray-200 rounded-2xl ">
      <div className="text-2xl font-bold">NextMuzi</div>
      <div>
        {session.data?.user && (
          <button
            className="p-3 m-3 bg-amber-400 rounded-2xl cursor-pointer"
            onClick={() => signOut()}
          >
            Log Out
          </button>
        )}
        {!session.data?.user && (
          <button
            className="p-3 m-3 bg-amber-400 rounded-2xl cursor-pointer"
            onClick={() => signIn()}
          >
            Sign-in
          </button>
        )}
      </div>
    </div>
  );
};

export default Appbar;
