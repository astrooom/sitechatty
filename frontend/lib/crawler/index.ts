import { PlaywrightCrawler } from 'crawlee';

// PlaywrightCrawler crawls the web using a headless browser controlled by the Playwright library.
const crawler = new PlaywrightCrawler({
  // Use the requestHandler to process each of the crawled pages.
  async requestHandler({ request, page, enqueueLinks, pushData, log }) {
    const title = await page.title();
    log.info(`Title of ${request.loadedUrl} is '${title}'`);

    const content = await page.content();

    // Save results as JSON to `./storage/datasets/default` directory.
    await pushData({ title, content, url: request.loadedUrl });

    // // Extract links from the current page and add them to the crawling queue.
    // await enqueueLinks();
  },

  headless: true,

  // Uncomment this option to see the browser window.
  // headless: false,

  // Comment this option to scrape the full website.
  maxRequestsPerCrawl: 20,
});



export const crawlUrls = async (urls: string[]) => {
  await crawler.run(urls);

  // Or work with the data directly.
  const data = await crawler.getData();
  return data
}