// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Actor } from 'apify';
import { Input, Offer } from './types.js';
// Crawlee - web scraping and browser automation library (Read more at https://crawlee.dev)
// import { CheerioCrawler } from 'crawlee';

// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init()
await Actor.init();

const { datasetId } = await Actor.getInput<Input>() || {};

if (datasetId == undefined) throw new Error("Invalid input.");
const dataset = await Actor.openDataset(datasetId);

// NOTE: How to do this elegantly in a single line
let { items } = await dataset.getData();
items = (items as Offer[]);

const filteredItems = items.reduce((acc, curr) => {
    const { asin, price: priceString }  = (curr as Offer);

    const price = +priceString;

    const cheapest = acc[asin] ? +acc[asin].price : Number.MIN_VALUE;
    if (!acc[asin] || cheapest > price) {
        acc[asin] = curr;
    }
    return acc;
}, {});

await Actor.pushData(Object.values(filteredItems));

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();
