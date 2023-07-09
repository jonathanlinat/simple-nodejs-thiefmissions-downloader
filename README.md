# Simple Node.js ThiefMissions.com Web Scraper & Downloader

This is a very simple Node.js script to retrieve and download Fan Missions from ThiefMissions.com.

## Details

This project uses mainly the `cheerio`, `yauzl`, `node-fetch` and `easydl` libraries.

### Prerequisites

- Node v18: [Download](https://nodejs.org/en/download/)
- pnpm v7: `npm install -g pnpm@7`

### Disclaimers

The source code of the project includes a modified compiled version of [EasyDl](https://github.com/andresusanto/easydl) to address a very specific [memory leak issue](https://github.com/andresusanto/easydl/issues/10).

## First steps

Clone the repository locally.

```bash
cd <path/to/your/desired/folder/>
git clone git@github.com:jonathanlinat/simple-nodejs-thiefmissions-downloader.git
```

Install the dependencies.

```bash
cd simple-nodejs-thiefmissions-downloader/
pnpm install
```

### Specific commands

Run the script.

```bash
pnpm run scrape
```

The downloaded Fan Missions will be available in the `files` directory, sorted by game.
