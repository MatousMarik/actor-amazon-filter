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
const dataset = await Actor.openDataset(datasetId);

const items = (await dataset.getData()).items as Offer[];

const filteredItems = items.reduce((acc, curr) => {
    // will throw away product with no offer with no valid price
    const { asin, price: priceString }  = curr;

    if (priceString === "") return acc;
    const price = +priceString.slice(1);

    if (Number.isNaN(price)) return acc;

    const cheapest = acc.has(asin) ? +acc.get(asin)!.price.slice(1) : Number.MAX_VALUE;
    if (!acc.has(asin) || cheapest > price) {
        acc.set(asin, curr);
    }
    return acc;
}, {} as Map<string, Offer>);

await Actor.pushData(Object.values(filteredItems));

await Actor.exit();
