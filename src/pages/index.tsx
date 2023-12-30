import React, { useEffect, useState } from "react";
import { Inter } from "@next/font/google";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import searchCategories from "../../data/SearchCategory.json";
import searchLookup from "../../data/SearchCategoryLookup.json";
import { ItemMarketInfo } from "@/types";
import { GetMarketData } from "@/utils/marketDataHelpers";

const inter = Inter({ subsets: ["latin"] });

const itemIDs = ["27701", "12108", "5057", "5067", "25796", "6474", "1663"];
const barColours = ["bg-red-600", "bg-yellow-400", "bg-green-500"];
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
  align: "right",
  //valueGetter: ({ value }) => parseFloat(value),
}));
columns[0].width = 80;
columns[3].renderCell = renderProgress;
function renderProgress(params: any) {
  return <ProgressBar value={Number(params.value * 100)!} />;
}
columns[0].sortComparator = (v1, v2) =>
  parseInt(v1.replace(/,/g, "")) - parseInt(v2.replace(/,/g, ""));
columns[2].sortComparator = (v1, v2) =>
  parseInt(v1.replace(/,/g, "")) - parseInt(v2.replace(/,/g, ""));
columns[4].sortComparator = (v1, v2) =>
  parseInt(v1.replace(/,/g, "")) - parseInt(v2.replace(/,/g, ""));
columns[5].sortComparator = (v1, v2) =>
  parseInt(v1.replace(/,/g, "")) - parseInt(v2.replace(/,/g, ""));
columns[6].sortComparator = (v1, v2) =>
  parseInt(v1.replace(/,/g, "")) - parseInt(v2.replace(/,/g, ""));
columns[7].sortComparator = (v1, v2) =>
  parseInt(v1.replace(/,/g, "")) - parseInt(v2.replace(/,/g, ""));
columns[8].sortComparator = (v1, v2) =>
  parseInt(v1.replace(/,/g, "")) - parseInt(v2.replace(/,/g, ""));

function valueToBand(value: number): number {
  switch (true) {
    case value > 70:
      return 0;
    case value > 30:
      return 1;
    default:
      return 2;
  }
}
//[${barColours[valueToBand(value)]}]
function ProgressBar(props: { value: number }) {
  const { value } = props;

  //NaN is the only value that != itself
  if (value != value) {
    return (
      <div className="border border-solid rounded-sm relative overflow-hidden w-full h-6">
        <div className="absolute leading-6 w-full flex justify-center">{`No Sales`}</div>
        <div className={`h-full bg-red-600`} style={{ maxWidth: `100%` }} />
      </div>
    );
  }

  return (
    <div className="border border-solid rounded-sm relative overflow-hidden w-full h-6">
      <div className="absolute leading-6 w-full flex justify-center">{`${value.toLocaleString()} %`}</div>
      <div
        className={`h-full ${barColours[valueToBand(value)]}`}
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

  function handleCategories(e: React.ChangeEvent<HTMLSelectElement>) {
    e.preventDefault();
    const selectedCategoryItems = searchLookup[
      e.currentTarget.value as keyof {}
    ] as Array<string>;
    handleGetMarketData(selectedCategoryItems.slice(0, 50));
    //console.log(selectedCategoryItems.slice(0, 20));
  }

  // function CreateData() {
  //   fetch(`../api/hello`)
  //     .then((res) => {
  //       //console.log(res);
  //       return res.json();
  //     })
  //     .then((res) => console.log(res));
  // }

  return (
    <div className="App h-full w-full">
      <div className="w-full h-full pt-10 px-20 space-y-3">
        <button
          className="w-96 bg-blue-400 rounded-md p-2 text-center"
          onClick={() => handleGetMarketData(itemIDs)}
        >
          Get Market Data
        </button>
        {/* <button
          className="w-1/3 bg-blue-400 rounded-md p-2 text-center"
          onClick={() => CreateData()}
        >
          Create Data
        </button> */}
        <h2>Search</h2>
        <input type="search"></input>
        <br />
        <select
          onChange={handleCategories}
          name={"selectedCategory"}
          className="w-96 bg-blue-400 rounded-md p-2 text-center cursor-pointer"
        >
          <option>Categories</option>
          {Object.keys(searchCategories)
            .slice(1)
            .map((category) => (
              <option key={+category} value={category}>
                {searchCategories[category as keyof {}]}
              </option>
            ))}
        </select>
        <br />
        <br />
        <div className="h-2/3 w-full bg-white mt-20">
          <DataGrid
            rows={items.map((item) => {
              return {
                id: item.itemID,
                col1: item.itemID,
                col2: item.name,
                col3: item.quantForSale.toLocaleString(),
                col4: (
                  item.quantForSale / item.lastWeekUnitVolume
                ).toLocaleString(),
                col5: item.minPrice.toLocaleString(),
                col6: item.averagePrice.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                }),
                col7: item.currentAveragePrice.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                }),
                col8: item.lastWeekUnitVolume.toLocaleString(),
                col9: item.lastWeekGilVolume.toLocaleString(),
              };
            })}
            columns={columns}
          />
        </div>
      </div>
    </div>
  );
}
