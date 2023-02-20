## Shutterfly Shared Library Picture and Caption downloader

If you're here you already know that Shutterfly is [discontinuing their Shared Photo Album service](https://support.shutterfly.com/s/article/share-site-closure) in late March 2023.

They provide a way to save all of the shared photos to your Shutterfly account, or you can download them one at a time.

Unfortunately, they don't provide a way to download the captions that you've added to the photos. 

This Node program will automate the process and download all of your photos AND captions to your computer.  You'll need Node V16 or higher on your computer and a beginner-level knowledge of how to run Node programs.

I created this program to help a friend who had a lot of photos and captions to download.  I'm sharing it here in case it's useful to anyone else.  There is no warranty with this program -- use it at your own risk!

### How to use

1. Make sure you have Node 16.14 or higher installed on your computer. You can get it from [nodejs.org](https://nodejs.org/en/download/).
2. Clone this repository to your computer.
3. Open a terminal window and navigate to the directory where you cloned the repository.
4. Run `npm install` in the terminal to install the dependencies.
5. Open ALBUMS.js and add your Shutterfly album information to the array.
   * You can get the URLs by going to your Shared Album, click on Pictures or Pictures & Videos, click on the eyeball to show all the pictures, then copy the URL from the browser address bar.
   * `url` is the URL of the album.  This is the URL that you copied from the browser address bar.
   * `folder` is the name of the album.  This will be the name of the folder that the photos and captions will be saved to.
   * `name` is a user-friendly name for the album
6. You can add albums to the array by following the same format as the first two entries. You can do a maximum of 9 albums at a time.
7. Run `node index.js` to start the program.
8. The program download the images and captions from Shutterfly, saving them in the album-named folders.  After it completes, you can open the index.html file in your browser to see all the albums, photos, and captions. 

I hope this is helpful for you!

###### Posted to `https://www.reddit.com/r/photography/comments/105e6yf/shutterfly_shutting_down_share_sites_service`
