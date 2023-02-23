import { ItemMarketInfo } from "@/types";
import { GetMarketData } from "@/utils/marketDataHelpers";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState } from "react";
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
const columns = headers.map((name, index) => ({
  field: "col" + (index + 1),
  headerName: name,
  width: 150,
}));
export default function Inventory() {
  const [items, SetItems] = useState<Array<ItemMarketInfo>>([]);

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      inventoryText: { value: string };
    };

    const itemIDs: Array<string> = JSON.parse(target.inventoryText.value).map(
      (item: { id: string; amount: string }) => item.id
    );

    let underHundredItems = itemIDs.slice(0, 100);

    console.log(underHundredItems);

    GetMarketData(underHundredItems).then((itemData) => {
      SetItems(itemData);
    });
  }

  return (
    <div id="Inventory" className="h-full w-full p-14 grid grid-cols-2">
      <form onSubmit={handleSubmit} className="cols-span-1 space-y-4 mr-16">
        <h2>Inventory</h2>
        <textarea className="h-3/4 w-full resize-none" name={"inventoryText"} />
        <br />
        <button
          type={"submit"}
          className="w-60 bg-blue-400 rounded-md p-2 text-center"
        >
          Get Market Data
        </button>
      </form>
      <div className="h-full cols-span-1 bg-white mt-10">
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
  );
}
