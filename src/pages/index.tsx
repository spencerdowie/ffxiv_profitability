import { useEffect, useState } from "react";
import useSWR from "swr";
import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import itemData from "../../data/items.json";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="App">
      <div className="grid grid-cols-10">
        <div className="col-span-7 mt-10 ml-20 space-y-3">
          <h2>Search</h2>
          <input type="search"></input>
        </div>
      </div>
    </div>
  );
}
