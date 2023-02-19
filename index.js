import Promise from "bluebird";
import * as fs from "fs";
import { sprintf } from "sprintf-js";
import download from "./download.js";
import ALBUMS from "./ALBUMS-AJ2.js";
import wget from "node-wget";

const SF_URL_PREFIX = "https://uniim-share.shutterfly.com/v2/procgtaserv/";
const OUT_DIR = "./albums/";

const processPix = async ({ jsonFile, album, folder }) => {
  console.log(jsonFile, album, folder);
  const dataJSON = fs.readFileSync(jsonFile, { encoding: "utf8" });
  const data = JSON.parse(dataJSON);
  const outDir = `${OUT_DIR}${folder}`;
  fs.mkdirSync(outDir, { recursive: true });
  const items = data.result.section.items;
  const itemData = await Promise.all(
    items.map(async (item, idx) => {
      const { captureDate, text, title, shutterflyId: uri } = item;
      const url = SF_URL_PREFIX + uri;
      const [fname, ext] = title.split(".");
      const fName = `${outDir}/${(idx + 1 + "").padStart(4, "0")}.`;
      const imageFName = fName + ext;
      const textFName = fName + "txt";
      await new Promise((resolve, reject) => {
        const dest = imageFName;
        wget({ url, dest }, function (error, response) {
          if (error) {
            console.log("An error happened, whyyyy!", error);
            reject(error);
          }
          resolve(response);
        });
      });
      fs.writeFileSync(textFName, text);
      return { text, title, captureDate };
    })
  );
  console.log(itemData);
};

ALBUMS.albums.forEach((album) => {
  processPix(album);
});
