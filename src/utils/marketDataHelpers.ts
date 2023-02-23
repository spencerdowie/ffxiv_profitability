import { ListingView, SaleView, ItemMarketInfo } from "@/types";
import itemData from "../../data/items.json";

const marketDataFields = [
  "minPrice",
  "averagePrice",
  "currentAveragePrice",
  "listings",
];

export async function GetMarketData(
  itemIDs: Array<string>,
  history: boolean = true
): Promise<Array<ItemMarketInfo>> {
  const now = new Date(Date.now());
  const lastWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 7
  );

  let fields =
    itemIDs.length > 1
      ? marketDataFields.map((field) => "items." + field).toString()
      : "";

  //console.log(history);
  return fetch(
    `api/marketData?itemIDs=${itemIDs.toString()}&fields=${fields}&getHistory=${history.toString()}`
  )
    .then((res) => res.json())
    .then(({ items }) =>
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
        } as ItemMarketInfo;
      })
    );
}

export function GetItemName(ID: number) {
  return itemData[ID as keyof {}]["en"];
}
