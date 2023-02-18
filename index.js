import puppeteer from "puppeteer";
import Promise from "bluebird";
import * as fs from "fs";
import { sprintf } from "sprintf-js";
import download from "./download.js";
import ALBUMS from "./ALBUMS.js";

const IMAGE_DIR = "./images/";

const processPix = async (albums) => {
  return Promise.map(albums, async ({ url, album, start, end, forward }) => {
    const rootUri = `${IMAGE_DIR}${album}/IMG_`;
    fs.mkdirSync(`${IMAGE_DIR}${album}`, { recursive: true });
    for (let i = start; i <= end; i++) {
      const picFrameUrl = `${url}${i}`;
      const browser = await puppeteer.launch();
      try {
        const page = await browser.newPage();
        await page.goto(picFrameUrl);
        console.log(picFrameUrl);
        const src = await page.$eval(".detail-img", (n) =>
          n.getAttribute("src")
        );
        const picUrl = src.indexOf("https://") === -1 ? "https:" + src : src;
        const fspec = await page.$eval(".detail-img", (n) =>
          n.getAttribute("alt")
        );
        const [fname, ext] = fspec.split(".");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        let caption = await page.$eval(".pic-img-text", (n) => n.innerText);
        if (caption.trim().length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          caption = await page.$eval(".pic-img-text", (n) => n.innerText);
          console.log("Repeat caption! " + (i + 1));
        }
        const picIdx = sprintf("%04d", forward ? i - start + 1 : end - i + 1);
        const picFName =
          rootUri + picIdx + "_" + fname + "." + ext.toLowerCase();
        const captionFName = rootUri + picIdx + "_" + fname + ".txt";
        await download(picUrl, picFName);
        fs.writeFileSync(captionFName, caption);
        console.log(picFName);
        console.log(captionFName);
      } catch (err) {
        console.log(err);
        console.log("Err: " + i);
      } finally {
        await browser.close();
      }
    }
    return true;
  });
};

processPix(ALBUMS).then((results) => {
  console.log(results);
  process.exit(0);
});
