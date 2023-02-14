import { useEffect, useState } from "react";
import useSWR from "swr";
import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import styles from "@/styles/Home.module.css";
import itemData from "../../data/items.json";
import {
  CurrentlyShownView,
  ItemMarketInfo,
  ListingView,
  RecipeItem,
  SaleView,
} from "@/types";

const inter = Inter({ subsets: ["latin"] });

const itemIDs = ["27701", "12108", "5057", "5067", "25796", "6474", "1663"];
const barColours = ["#f44336", "#efbb5aa3", "#088208a3"];
const headers = [
  "Quant. for Sale",
  "Supply Ratio",
  "Lowest Price",
  "Avg Sale Price",
  "Avg Listing Price",
  "Weekly Sales",
  "Trading Volume",
];
const columns: GridColDef[] = [
  { field: "col1", headerName: "Item ID", width: 80 },
  { field: "col2", headerName: "Item Name", width: 150 },
].concat(
  headers.map((name, index) => ({
    field: "col" + (3 + index),
    headerName: name,
    width: 150,
  }))
);
columns[3].renderCell = renderProgress;
function renderProgress(params: any) {
  return <ProgressBar value={Number((1 - params.value) * 100)!} />;
}

function valueToBand(value: number): number {
  switch (true) {
    case value > 70:
      return 2;
    case value > 30:
      return 1;
    default:
      return 0;
  }
}

function ProgressBar(props: { value: number }) {
  const { value } = props;
  return (
    <div className="border border-solid rounded-sm relative overflow-hidden w-full h-6">
      <div className="absolute leading-6 w-full flex justify-center">{`${value.toLocaleString()} %`}</div>
      <div
        className={`h-full bg-[${barColours[valueToBand(value)]}]`}
        style={{ maxWidth: `${value}%` }}
      />
    </div>
  );
}
export default function Home() {
  const [items, SetItems] = useState<Array<ItemMarketInfo>>([]);
  //useEffect(() => {}, []);

  function GetMarketData() {
    const now = new Date(Date.now());
    const lastWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 7
    );

    fetch(
      "api/marketData?itemIDs=" +
        itemIDs.toString() +
        "&fields=items.minPrice,items.averagePrice,items.currentAveragePrice,items.listings&getHistory=true"
    )
      .then((res) => res.json())
      .then(({ items }) =>
        SetItems(
          Object.keys(items).map((key) => {
            const item = items[key];
            const quantForSale = item.listings.reduce(
              (sum: number, currentValue: ListingView) =>
                sum + currentValue.quantity,
              0
            );

            const lastWeekListings: Array<SaleView> = item.recentHistory.filter(
              (sale: SaleView) => {
                const adjustedTime = sale.timestamp * 1000;
                return adjustedTime > lastWeek.getTime();
              }
            );

            let lastWeekSales = 0;
            let lastWeekValue = 0;

            lastWeekListings.forEach((sale) => {
              lastWeekSales += sale.quantity;
              lastWeekValue += sale.pricePerUnit * sale.quantity;
            });

            return {
              itemID: key,
              name: itemData[key as keyof {}]["en"],
              minPrice: item.minPrice,
              averagePrice: item.averagePrice,
              currentAveragePrice: item.currentAveragePrice,
              recentHistory: item.recentHistory,
              quantForSale: quantForSale,
              lastWeekSales: lastWeekSales,
              lastWeekValue: lastWeekValue,
            };
          })
        )
      );
  }

  return (
    <div className="App h-screen w-screen">
      <div className="grid grid-cols-10 h-full">
        <div className="col-span-7 mt-10 ml-20 space-y-3 h-full">
          <button
            className="w-1/2 bg-blue-400 rounded-md p-2 text-center"
            onClick={() => GetMarketData()}
          >
            Get Market Data
          </button>
          <h2>Search</h2>
          <input type="search"></input>
          <br />
          <br />
          <br />
          <div className=" h-1/2 w-3/4 bg-white mt-20">
            <DataGrid
              rows={items.map((item) => {
                return {
                  id: item.itemID,
                  col1: item.itemID,
                  col2: item.name,
                  col3: item.quantForSale,
                  col4: item.quantForSale / item.lastWeekSales,
                  col5: item.minPrice,
                  col6: item.averagePrice,
                  col7: item.currentAveragePrice,
                  col8: item.lastWeekSales,
                  col9: item.lastWeekValue,
                };
              })}
              columns={columns}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
