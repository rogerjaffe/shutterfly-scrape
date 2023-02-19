import puppeteer from "puppeteer";
import Promise from "bluebird";
import * as fs from "fs";
import { sprintf } from "sprintf-js";
import download from "./download.js";
import ALBUMS from "./ALBUMS-AJ.js";

const IMAGE_DIR = "./images/";

/**
 * Get the URLs of the images in the order they're presented on the index page
 * @param urlIdx {string} URL of the index page
 * @returns {Promise}
 */
const getIndex = async (urlIdx) => {
  return new Promise(async (resolve, reject) => {
    // Launch puppeteer and go to the index page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(urlIdx);

    // //////////////////////////////////////////////////////
    // // Get the number of images on the page for debugging
    // const imgCount1 = await page.$$eval("img.pic-img", (els) => els.length);
    // console.log(imgCount1);
    // //////////////////////////////////////////////////////

    // Get the buttons on the page, find the last one (the "All" button), and click it
    await page.$$eval("a.i-medium-btn", (els) => {
      return els.forEach(async (el, idx) => {
        if (el.innerText === "All") {
          // if (idx === els.length - 1) {
          await el.click();
        }
        return el.innerText;
      });
    });

    // Enter a delay loop to wait for all the thumbnails to load in response to
    // clicking the "All" button.  The number of thumbnails will increase until
    // it stops increasing, indicating that all the thumbnails have loaded.
    let oldCount = -1,
      newCount = 0;
    while (oldCount !== newCount) {
      oldCount = newCount;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      newCount = await page.$$eval("img.pic-img", (els) => els.length);
    }

    // Get the URLs of the image pages, then close the browser
    const imgUrls = await page.$$eval(".pic-item a", (els) => {
      return els.map((el) => el.getAttribute("href"));
    });
    await browser.close();
    resolve(imgUrls);
  });
};

/**
 * Process the images in all the albums
 * @param albums
 * @returns {exports<*>}
 */
const processPix = async (albums) => {
  return Promise.map(albums, async ({ urlIdxPage, album }) => {
    // Create the image and caption folder
    console.log(`processing ${album}`);
    const rootUri = `${IMAGE_DIR}${album}/IMG_`;
    fs.mkdirSync(`${IMAGE_DIR}${album}`, { recursive: true });

    // Get the list of image URLs for the pictures in the album
    const picUrls = await getIndex(urlIdxPage);
    console.log(`${album} -> Processing  ${picUrls.length} images`);

    // For each picture in the album
    for (let i = 0; i < picUrls.length; i++) {
      // Get the picture URL and launch a browser
      const picFrameUrl = picUrls[i];
      console.log(`${album} -> Processing ${picFrameUrl}`);
      const browser = await puppeteer.launch();

      try {
        const page = await browser.newPage();
        await page.goto(picFrameUrl);
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
        const picFName = rootUri + i + "_" + fname + "." + ext.toLowerCase();
        const captionFName = rootUri + i + "_" + fname + ".txt";
        await download(picUrl, picFName);
        fs.writeFileSync(captionFName, caption);
        console.log(`${album} -> Completed ${picFrameUrl}`);
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
