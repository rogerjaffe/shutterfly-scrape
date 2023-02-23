import Promise from "bluebird";
import * as fs from "fs";
import ALBUMS from "./ALBUMS.js";
import wget from "node-wget";
import { format, fromUnixTime } from "date-fns";
import fetch, { Headers } from "node-fetch";
import JSON5 from "json5";

const SF_URL_PREFIX = "https://uniim-share.shutterfly.com/v2/procgtaserv/";
const OUT_DIR = "./albums/";

const mimeTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/webp": "webp",
};

const createIndexHtml = (imageFName, text, idx, date, title) => {
  return `
    <div class="photo">
      <a href="${imageFName}" target="_blank">
        <img src="${imageFName}" />
      </a>
    <p class="caption"><span>&#35;${idx + 1}:</span> ${text}</p>
    <p class="title-date"><span>${title} | ${format(
    fromUnixTime(date),
    "MMM d yyyy h:mm a O"
  )}</span></p>
    </div>
  `;
};

const getJsonData = async (url) => {
  return new Promise((resolve, reject) => {
    const tokens = url.split("/");
    const nodeId = tokens[tokens.length - 1];
    const albumId = tokens[2].split(".")[0];
    const body = new URLSearchParams();
    body.append("startIndex", "0");
    body.append("size", "-1");
    body.append("pageSize", "-1");
    body.append("page", `${albumId}/pictures`);
    body.append("nodeId", `${nodeId}`);
    body.append("layout", "ManagementAlbumPictures");

    const fetchUrl = `https://cmd.shutterfly.com/commands/pictures/getitems?site=${albumId}`;
    fetch(fetchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
      .then((res) => res.text())
      .then((sortOfJson) => {
        const json = JSON5.parse(sortOfJson);
        resolve(json);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const processPix = async (data, name, folder) => {
  const outDir = `${OUT_DIR}${folder}`;
  fs.mkdirSync(outDir, { recursive: true });
  const items = data.result.section.items;
  const itemData = await Promise.map(
    items,
    async (item, idx) => {
      const { captureDate, text = "", title = "", shutterflyId: uri } = item;
      console.log(`${folder} => Retrieving item ${idx + 1}`);
      const url = SF_URL_PREFIX + uri;
      const [fname, _ext] = title.split(".");
      const imageFSpec = `p${(idx + 1 + "").padStart(4, "0")}`;
      const fName = `${outDir}/p${(idx + 1 + "").padStart(4, "0")}`;
      const imageFName = fName; /* + ext*/
      const textFName = fName + ".txt";
      const res = await new Promise((resolve, reject) => {
        const dest = imageFName;
        wget({ url, dest }, function (error, response) {
          if (error) {
            console.log("An error happened, whyyyy!", error);
            reject(error);
          }
          resolve(response);
        });
      });
      const ext = mimeTypes[res.headers["content-type"]] ?? "jpg";
      fs.renameSync(imageFName, imageFName + "." + ext);
      fs.writeFileSync(textFName, text);
      const html = createIndexHtml(
        imageFSpec + "." + ext,
        text,
        idx,
        captureDate,
        title
      );
      return { text, title, captureDate, html };
    },
    { concurrency: 5 }
  );
  const htmlItems = itemData.map((item) => item.html).join("");
  const html = `
    <html><head><style>
    body {background: #eee; font-family: Arial;}
    .photo {width: 80%; margin-left: auto; margin-right: auto; padding-bottom: 20px; margin-bottom: 30px; border-bottom: 2px solid rgba(0,0,0,0.15);}
    img {max-height: 80vh; max-width: 100vw; display:block;margin: 0 auto 20px;}
    .album-title {font-size:3rem; text-align: center; margin: 25px auto; width: 80%; background-color: #ccc; border-radius: 10px; padding: 10px;}
    .caption {font-family: sans-serif; font-size: 1.5em; color: rgba(0,0,0,0.8); text-align: center;}
    .title-date {font-family: sans-serif; font-size: 0.9em; font-style: italic; color: rgba(0,0,0,0.5); text-align: center;}
    </style>
    <link rel="shortcut icon" href="https://cdn.staticsfly.com/shr/images/favicon/favicon.ico"> 
    </head>
    <body>
    <div class="album-title">${name}</div>
    ${htmlItems}
    </body></html>
  `;
  fs.writeFileSync(`${outDir}/index.html`, html);
  return { itemData, count: data.result.section.count };
};

const albumObj = await Promise.map(
  ALBUMS.albums,
  async (album) => {
    console.log(`${album.name} => Retrieve JSON`);
    const jsonData = await getJsonData(album.url);
    console.log(`${album.name} => Processing`);
    const { itemData, count } = await processPix(
      jsonData,
      album.name,
      album.folder
    );
    console.log(`${album.name} => Completed`);
    return { album, itemData, count };
  },
  { concurrency: 2 }
);

// const albumObj = await Promise.map(promises, { concurrency: 2 });

let innerHtml = albumObj.map((album) => {
  console.log(`${album.album.name} => Create album index items`);
  const html = `
    <div class="album-index">
      <p class="album-name"><a href="./${album.album.folder}/index.html">${album.album.name}</a></p>
      <p class="album-count">${album.count} pictures</p></p>
    </div>
  `;
  return html;
});

console.log(`Create album index`);
innerHtml = innerHtml.join("");
const indexHtml = `
  <html><head><style>
    body {background: #eee; font-family: arial;}
    .photo {width: 80%; margin-left: auto; margin-right: auto; padding-bottom: 20px; margin-bottom: 30px; border-bottom: 2px solid rgba(0,0,0,0.15);}
    img {max-height: 80vh; max-width: 100vw; display:block;margin: 0 auto 20px;}
    p {font-size: 1.5em; color: rgba(0,0,0,0.8); text-align: center;}
    .album-index {margin: 20px auto; border-radius: 10px; background-color: #ccc; width: 50vw; border: 2px solid #888;}
    .album-count {font-size: 1.25rem; font-style: italic;}
    .album-name {font-size: 2rem;}
    .title {font-size: 2.5rem; text-align: center; margin: 25px;}
    </style>
    <link rel="shortcut icon" href="https://cdn.staticsfly.com/shr/images/favicon/favicon.ico"> 
    </head>
    <body>
      <div class="title">${ALBUMS.name}</div>
      <div class="contents">${innerHtml}</div>
    </body>
  </html>
`;
fs.writeFileSync(`${OUT_DIR}index.html`, indexHtml);

console.log(`Process complete!`);
