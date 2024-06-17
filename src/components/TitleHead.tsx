import React from "react";

export function TitleHead() {
  return (
    <div className="flex flex-col items-center max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto text-center">
      <picture>
        {/* <img
          className="h-24 border shadow-sm p-4 rounded-2xl"
          src="/oman.png"
          alt=""
        /> */}
      </picture>
      <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl dark:text-white mt-4">
        Welcome to Helpdesk
      </h1>
      <p className="mt-3 text-gray-600 dark:text-gray-400">
        AI-powered support for your queries
      </p>
    </div>
  );
}
