import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import { parse } from "csv-parse";
const dataPath = path.join(process.cwd(), "data");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const rawData = await fs.readFile(dataPath + "/RecipeLookup.csv", "utf8");
  parse(rawData, { to_line: 3 }, (err, headers) =>
    res.status(200).json(headers)
  );
  // parse(rawData, { columns: true }, (err, data) => res.status(200).json(data));
}
