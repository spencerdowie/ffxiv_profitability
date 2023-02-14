import { NextApiRequest, NextApiResponse } from "next";

const MarketUrlBase = "https://universalis.app/api/v2/";

/*fields is passed to universalis api
getHistory will replace recentHistory will full sale history*/
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.query.itemIDs == undefined) {
    res.status(500).json({ error: "No ID provided" });
  } else {
    const itemStr = req.query.itemIDs as string;
    const fieldsStr = "?fields=" + ((req.query.fields as string) ?? "");
    const getHistory = (req.query.getHistory as string) === "true";
    const multi = itemStr.includes(",");

    console.log(fieldsStr);
    console.log(getHistory);

    const itemIDs = itemStr.split(",");
    let fields =
      itemIDs.length > 1
        ? ((req.query.fields as string) ?? "")
            .split(",")
            .map((field) => "items." + field)
            .toString()
        : "";

    console.log(fields);

    //const fieldStr = fields;
    //res.status(200).json(MarketUrlBase + `Behemoth/${itemStr}${fieldStr}`);

    await fetch(MarketUrlBase + `Behemoth/${itemStr}${fieldsStr}`)
      .then((res) => res.json())
      .then((data) => {
        //console.log(data);

        if (getHistory) {
          fetch(`${MarketUrlBase}history/Behemoth/${itemStr}`)
            .then((res) => res.json())
            .then((history) => {
              if (itemIDs.length > 1) {
                itemIDs.forEach(
                  (ID) =>
                    (data.items[ID].recentHistory = history.items[ID].entries)
                );
              } else {
                data.recentHistory = history.entries;
              }
              return res.status(200).json(data);
            });
        } else {
          return res.status(200).json(data);
        }
      });
  }
}
