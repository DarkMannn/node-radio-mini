# Node.js radio mini

## Description
This app is a radio streaming solution made entirely in Node.js. It features a terminal GUI (sections for the playlist, the song queue, the currently playing song and for the keyboard controls) and a http endpoint at which the songs are going to get streamed.

Purpose of the whole project was to have fun and experiment. Production ready radio server should use Shoutcast / Icecast (or similar) for a robust streaming server.

## Requirements
You must have `ffprobe` installed, which is part of `ffmpeg`, on your operating system in order for this app to work, since the javascript code relies on that binary to exist.

## Installation
Clone this repository. Go into the root and run:
```
> npm install
> npm link
```
These commands will make a `node-radio-mini` command available to be run from anywhere in your terminal.

## Usage
Go into a directory that contains music files (for now only mp3 format is supported), and run the command `node-radio-mini`.
```
> node-radio-mini
```
That command is going to read all mp3 files from the current directory and display them on you favorite terminal, similarly like on the image below.

![screenshot](/screenshot.png)

There are four windows. 'Playlist' windows contains all the songs from you current directory. 'Queue' windows contains all queued up and ready to play songs. 'Now playing' windows is showing currently streamed song. 'Controls' window is just a helper for seeing available controls at that point of time.

First song is going to get automatically queued up and played. Songs are streamed to the endpoint `http://process.env.HOST:process.env.PORT/stream`, or if you didn't set any env variables the default would be `http://localhost:8080/stream`.

If you don't have any songs queued up, the last song will be played again.

This app is also serving a single html page that will automatically connect to the streaming endpoint shown above. The page is served at `http://localhost:8080`. You can see how the page appears on the browser in the next screenshot:

![screenshot](/screenshot2.png)

### Commands

When the 'playlist' window is focused available commands are:
- q - switch focus to 'queue' window (or process.env.FOCUS_QUEUE)
- i - scroll up in the playlist (or process.env.UP)
- k - scroll down in the playlist (or process.env.SCROLL_DOWN)
- enter - enqueue selected song (or process.env.QUEUE_ADD)

When the 'queue' window is focused available commands are:
- p - switch focus to 'playlist' window (or process.env.PLAYLIST)
- i - scroll up in the queue (or process.env.SCROLL_UP)
- k - scroll down in the queue (or process.env.SCROLL_DOWN)
- z - dequeue selected song (or process.env.QUEUE_REMOVE)
- w - move selected song up the queue (or process.env.MOVE_UP)
- s - move selected song down the queue (or process.env.MOVE_DOWN)
