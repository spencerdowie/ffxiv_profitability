export type RecipeItem = {
  ID: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

export type Recipe = {
  ID: number;
  ingredients: { [ID: number]: RecipeItem } | undefined;
  result: RecipeItem;
  craftCost: number;
  craftCostNoCrystal: number;
  price: number;
};

//From import
// type Recipe = {
//   resultItem: number;
//   resultAmount: number;
//   ingredients: Array<{ item: number; amount: number }>;
// };

export enum MarketFields {}

export type histArr = {
  [date: string]: Array<{
    price: number;
    quantity: number;
  }>;
};

export type CraftData = {};

export type ItemMarketInfo = {
  itemID: string;
  name: string;
  minPrice: number;
  averagePrice: number;
  currentAveragePrice: number;
  listings?: Array<ListingView>;
  recentHistory: Array<SaleView>;
  quantForSale: number;
  lastWeekSales: number;
  lastWeekValue: number;
};

//Universalis Types
export interface CurrentlyShownView {
  // The item ID.
  itemID: number; // int32
  // The world ID, if applicable.
  worldID?: number; // int32
  // The last upload time for this endpoint, in milliseconds since the UNIX epoch.
  lastUploadTime: number; // int64
  // The currently-shown listings.
  listings?: ListingView[];
  // The currently-shown sales.
  recentHistory?: SaleView[];
  // The DC name, if applicable.
  dcName?: string;
  // The region name, if applicable.
  regionName?: string;
  // The average listing price, with outliers removed beyond 3 standard deviations of the mean.
  currentAveragePrice: number;
  // The average NQ listing price, with outliers removed beyond 3 standard deviations of the mean.
  currentAveragePriceNQ: number;
  // The average HQ listing price, with outliers removed beyond 3 standard deviations of the mean.
  currentAveragePriceHQ: number;
  // The average number of sales per day, over the past seven days (or the entirety of the shown sales, whichever comes first).
  // This number will tend to be the same for every item, because the number of shown sales is the same and over the same period.
  // This statistic is more useful in historical queries.
  regularSaleVelocity: number;
  // The average number of NQ sales per day, over the past seven days (or the entirety of the shown sales, whichever comes first).
  // This number will tend to be the same for every item, because the number of shown sales is the same and over the same period.
  // This statistic is more useful in historical queries.
  nqSaleVelocity: number;
  // The average number of HQ sales per day, over the past seven days (or the entirety of the shown sales, whichever comes first).
  // This number will tend to be the same for every item, because the number of shown sales is the same and over the same period.
  // This statistic is more useful in historical queries.
  hqSaleVelocity: number;
  // The average sale price, with outliers removed beyond 3 standard deviations of the mean.
  averagePrice: number;
  // The average NQ sale price, with outliers removed beyond 3 standard deviations of the mean.
  averagePriceNQ: number;
  // The average HQ sale price, with outliers removed beyond 3 standard deviations of the mean.
  averagePriceHQ: number;
  // The minimum listing price.
  minPrice: number; // int32
  // The minimum NQ listing price.
  minPriceNQ: number; // int32
  // The minimum HQ listing price.
  minPriceHQ: number; // int32
  // The maximum listing price.
  maxPrice: number; // int32
  // The maximum NQ listing price.
  maxPriceNQ: number; // int32
  // The maximum HQ listing price.
  maxPriceHQ: number; // int32
  // A map of quantities to listing counts, representing the number of listings of each quantity.
  stackSizeHistogram?: Object;
  // A map of quantities to NQ listing counts, representing the number of listings of each quantity.
  stackSizeHistogramNQ?: Object;
  // A map of quantities to HQ listing counts, representing the number of listings of each quantity.
  stackSizeHistogramHQ?: Object;
  // The world name, if applicable.
  worldName?: string;
  // The last upload times in milliseconds since epoch for each world in the response, if this is a DC request.
  worldUploadTimes?: Object;
}

export interface ListingView {
  // The time that this listing was posted, in seconds since the UNIX epoch.
  lastReviewTime: number; // int64
  // The price per unit sold.
  pricePerUnit: number; // int32
  // The stack size sold.
  quantity: number; // int32
  // The ID of the dye on this item.
  stainID: number; // int32
  // The world name, if applicable.
  worldName?: string;
  // The world ID, if applicable.
  worldID?: number; // int32
  // The creator's character name.
  creatorName?: string;
  // A SHA256 hash of the creator's ID.
  creatorID?: string;
  // Whether or not the item is high-quality.
  hq: boolean;
  // Whether or not the item is crafted.
  isCrafted: boolean;
  // A SHA256 hash of the ID of this listing. Due to some current client-side bugs, this will almost always be null.
  listingID?: string;
  // The materia on this item.
  materia?: MateriaView[];
  // Whether or not the item is being sold on a mannequin.
  onMannequin: boolean;
  // The city ID of the retainer.
  // Limsa Lominsa = 1
  // Gridania = 2
  // Ul'dah = 3
  // Ishgard = 4
  // Kugane = 7
  // Crystarium = 10
  retainerCity: number; // int32
  // A SHA256 hash of the retainer's ID.
  retainerID?: string;
  // The retainer's name.
  retainerName?: string;
  // A SHA256 hash of the seller's ID.
  sellerID?: string;
  // The total price.
  total: number; // int32
}

interface MateriaView {
  // The materia slot.
  slotID: number; // int32
  // The materia item ID.
  materiaID: number; // int32
}

export interface SaleView {
  // Whether or not the item was high-quality.
  hq: boolean;
  // The price per unit sold.
  pricePerUnit: number; // int32
  // The stack size sold.
  quantity: number; // int32
  // The sale time, in seconds since the UNIX epoch.
  timestamp: number; // int64
  // Whether or not this was purchased from a mannequin. This may be null.
  onMannequin?: boolean;
  // The world name, if applicable.
  worldName?: string;
  // The world ID, if applicable.
  worldID?: number; // int32
  // The buyer name.
  buyerName?: string;
  // The total price.
  total: number; // int32
}
