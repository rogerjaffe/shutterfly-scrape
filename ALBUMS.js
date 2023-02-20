/**
 * Album definitions go here
 * Find the URL by going to the shared Shutterfly album, click on the Pictures or
 * Pictures & Videos link, then click All to show all the picture thumbnails.
 * Copy the URL from the browser address bar and paste it here as the value of url
 * @input {string} url - URL of Shutterfly album index page
 * @input {string} name - Name of album
 * @input {string} folder - Folder name to save images to
 *
 * @type {{albums: [{folder: string, name: string, url: string},{folder: string, name: string, url: string}], name: string}}
 */
const ALBUMS = {
  name: "Bert and Ernie's Photo Albums",
  albums: [
    {
      url: "URL OF SHUTTERFLY ALBUM INDEX SHOWING ALL ALBUMS #1",
      name: "Album 1",
      folder: "Album1",
    },
    {
      url: "URL OF SHUTTERFLY ALBUM INDEX SHOWING ALL ALBUMS #2",
      name: "Album 2",
      folder: "Album2",
    },
  ],
};

export default ALBUMS;
