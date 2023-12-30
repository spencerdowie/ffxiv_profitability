import {
  ListingView,
  SaleView,
  ItemMarketInfo,
  CurrentlyShownView,
} from "@/types";
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
      : marketDataFields;

  //console.log(history);
  return fetch(
    `../api/marketData?itemIDs=${itemIDs.toString()}&fields=${fields}&getHistory=${history.toString()}`
  )
    .then((res) => {
      //console.log(res);
      return res.json();
    })
    .then((data) => {
      let items = {} as { [ID: string]: CurrentlyShownView };
      if (itemIDs.length > 1) {
        items = data.items;
      } else {
        items = { [itemIDs[0]]: data };
      }
      return Object.keys(items).map((key) => {
        const item = items[key];
        //console.log(item);

        const quantForSale = item.listings?.reduce(
          (sum: number, currentValue: ListingView) =>
            sum + currentValue.quantity,
          0
        );

        const lastWeekListings = item.recentHistory?.filter(
          (sale: SaleView) => {
            const adjustedTime = sale.timestamp * 1000;
            return adjustedTime > lastWeek.getTime();
          }
        );

        let lastWeekUnitVolume = 0;
        let lastWeekGilVolume = 0;

        lastWeekListings?.forEach((sale) => {
          lastWeekUnitVolume += sale.quantity;
          lastWeekGilVolume += sale.pricePerUnit * sale.quantity;
        });

        return {
          itemID: key,
          name: itemData[key as keyof {}]["en"],
          minPrice: item.minPrice,
          averagePrice: item.averagePrice,
          currentAveragePrice: item.currentAveragePrice,
          recentHistory: item.recentHistory,
          quantForSale: quantForSale,
          listings: item.listings,
          lastWeekUnitVolume: lastWeekUnitVolume,
          lastWeekGilVolume: lastWeekGilVolume,
        } as ItemMarketInfo;
      });
    });
}

export function GetItemName(ID: number) {
  return itemData[ID as keyof {}]["en"];
}

export function getStandardDeviation(array: Array<number>, quatity: number) {
  if (array.length < 1) return -1;
  const n = quatity;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );
}

export async function GetMinPrices(
  itemIDs: Array<string>
): Promise<{ [ID: string]: { minPrice: number } }> {
  let fields = itemIDs.length > 1 ? "items.minPrice" : "minPrice";
  return fetch(
    `../api/marketData?itemIDs=${itemIDs.toString()}&fields=${fields}`
  )
    .then((res) => {
      //console.log(res);
      return res.json();
    })
    .then((data) => {
      let items = {} as { [ID: string]: { minPrice: number } };
      if (itemIDs.length > 1) {
        items = data.items;
      } else {
        items = { [itemIDs[0]]: data };
      }
      return items;
    });
}
