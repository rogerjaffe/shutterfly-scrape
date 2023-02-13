import * as fs from "fs";
import * as client from "https";

const download = (url, filepath) => {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        res
          .pipe(fs.createWriteStream(filepath))
          .on("error", reject)
          .once("close", () => resolve(true));
      } else {
        // Consume response data to free up memory
        res.resume();
        reject(
          new Error(`Request Failed With a Status Code: ${res.statusCode}`)
        );
      }
    });
  });
};

export default download;

// import request from "request";
// import * as fs from "fs";
//
// const download = async (uri, filename, callback) => {
//   if (uri.indexOf("https://") === -1) {
//     uri = "https:" + uri;
//   }
//   request.head(uri, function (err, res, body) {
//     request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
//   });
// };
//
