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
   * You can get the URLs by going to your Shared Album and copying the URL from the browser address bar.
   * `url` is the URL of the album.  This is the URL that you copied from the browser address bar.
   * `album` is the name of the album.  This will be the name of the folder that the photos and captions will be saved to.
   * `start` and `end` are the starting and ending photo numbers. See below on how to find these numbers.
6. You can add albums to the array by following the same format as the first two entries. You can do a maximum of 9 albums at a time.
7. Run `node index.js` to start the program.
8. The program will list the photo and caption files that it's downloading and will save them to the `images` folder.

### How to find the photo numbers

1. Open the album in your browser
2. Click on the Pictures & Videos tab
3. Click on the first picture. The URL in the browser address bar will end in a number.  This is the photo number of the first photo in the album. Write down this number; this is the `start` number.
4. Go back to the index of photos.
5. If you have more than one page in the index, click on the _All_ link, then click on the last photo.
6. The URL in the browser address bar will end in a number.  This is the photo number of the last photo in the album. Write down this number; this is the `end` number.

I hope this is helpful for you!
