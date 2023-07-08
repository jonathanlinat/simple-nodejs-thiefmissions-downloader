# Simple Node.js ThiefMissions.com Web Scraper & Downloader

This is a very simple Node.js script to retrieve and download Fan Missions from ThiefMissions.com.

## Details

This project uses mainly the `cheerio`, `node-fetch` and `easydl` libraries.

### Prerequisites

- Node v16: [Download](https://nodejs.org/en/download/)
- pnpm: `npm install -g pnpm@latest`

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
