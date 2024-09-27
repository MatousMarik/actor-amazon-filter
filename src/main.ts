import { Actor } from 'apify';

interface Input {
    datasetId: string;
}

interface Offer {
    title: string;
    asin: string;
    itemUrl: string;
    keyword: string;
    price: string;
    description: string;
    sellerName: string;
}

await Actor.init();

const { datasetId } = await Actor.getInput<Input>() || {};

if (datasetId == undefined) throw new Error("Invalid input.");
const dataset = await Actor.openDataset(datasetId, { forceCloud: true });

const filteredItems = await dataset.reduce((acc, curr) => {
    // will throw away product with no offer with no valid price
    const { asin, price: priceString }  = curr;

    if (priceString === "") return acc;
    const price = +priceString.slice(1);

    if (Number.isNaN(price)) return acc;

    const cheapest = acc.has(asin) ? +acc.get(asin)!.price.slice(1) : Number.MAX_VALUE;
    if (!acc.has(asin) || cheapest > price) {
        acc.set(asin, curr as Offer);
    }
    return acc;
}, new Map<string, Offer>());

await Actor.pushData(Array.from(filteredItems.values()));

await Actor.exit();
