import { useEffect, useState } from "react";
import useSWR from "swr";
import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import styles from "@/styles/Home.module.css";
import itemData from "../../data/items.json";
import searchCategories from "../../data/SearchCategory.json";
import searchLookup from "../../data/SearchCategoryLookup.json";
import {
  CurrentlyShownView,
  ItemMarketInfo,
  ListingView,
  RecipeItem,
  SaleView,
} from "@/types";
import { GetMarketData } from "@/utils/marketDataHelpers";

const inter = Inter({ subsets: ["latin"] });

const itemIDs = ["27701", "12108", "5057", "5067", "25796", "6474", "1663"];
const barColours = ["#f44336", "#efbb5aa3", "#088208a3"];
const headers = [
  "Item ID",
  "Item Name",
  "Quant. for Sale",
  "Supply Ratio",
  "Lowest Price",
  "Avg Sale Price",
  "Avg Listing Price",
  "Weekly Sales",
  "Trading Volume",
];
const columns: GridColDef[] = headers.map((name, index) => ({
  field: "col" + (index + 1),
  headerName: name,
  width: 150,
}));
columns[0].width = 80;
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
  const [categoryDropdown, SetCategoryDropdown] = useState(false);
  //useEffect(() => {}, []);

  function handleGetMarketData(itemIDs: Array<string>) {
    GetMarketData(itemIDs).then((items) => SetItems(items));
  }

  // function handleCategories() {
  //   fetch(`api/hello`)
  //     .then((res) => res.json())
  //     .then((data) => console.log(data));
  // }

  function CategoryDropdown() {
    if (!categoryDropdown) return null;
    return (
      <ul className="absolute w-1/3 bg-blue-400 ">
        {Object.keys(searchCategories).map((cat) => (
          <li
            key={+cat}
            className="cursor-pointer"
            onClick={() => console.log(searchLookup[cat as keyof {}])}
          >
            {searchCategories[cat as keyof {}]}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="App h-screen w-screen">
      <div className="grid grid-cols-10 h-full">
        <div className="col-span-7 mt-10 ml-20 space-y-3 h-full">
          <button
            className="w-1/3 bg-blue-400 rounded-md p-2 text-center"
            onClick={() => handleGetMarketData(itemIDs)}
          >
            Get Market Data
          </button>
          {/* <button
            className="w-1/3 bg-blue-400 rounded-md p-2 text-center"
            onClick={() => handleCategories()}
          >
            Out Categories
          </button> */}
          <h2>Search</h2>
          <input type="search"></input>
          <br />
          <button
            className="w-1/3 bg-blue-400 rounded-md p-2 text-center"
            onClick={() => SetCategoryDropdown(!categoryDropdown)}
          >
            Categories
          </button>
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
          {CategoryDropdown()}
        </div>
      </div>
    </div>
  );
}
