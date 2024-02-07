# Live Monitoring of Citizen Wallet Transactions

This is a simple app to display a live monitoring of all transactions happening on the blockchain.

Just append `/:chain/:tokenAddress` to the URL.

E.g.

https://monitor.citizenwallet.xyz/celo/cEUR

## Run locally

Just `git clone` then `npm install` and `npm run dev`.

## Troubleshooting

We use the default RPC endpoints (see `src/data/chains.json`) which may not always be super fast / stable.
Best is to use your own endpoint provided by Infura, Alchemy or alike then set it in your local storage. Just open the console and type `setRPC($RPC_URL)` and hit enter (it will reload the page).

## API

```
CURL -H "Authorization: Bearer x" https://indexer-polygon.internal.citizenwallet.xyz/logs/transfers/0x230542eda83346929e4E54f4a98e1ca1A4BFc0c3?limit=10&offset=0
```
