
# A Solana Connected Wallet Visualiser API

I made this project due to me noticing that there was a similar tool
on Ethereum, and it's use in tracking down connected wallets of people
who scam their NFT projects, with the huge amount of 
rugs that happened on Solana, I intended to make a way to visualise this.
However due to time constraints and NFT's volume going lower and lower;
I've decided to create an API using SolScan's API


This will provide a user somewhat enough information
to be able to see all unique sol transfer transactions between Solana wallets.

I do see myself visiting this again once NFT volumes rise again

Made with Express.js & SolScan API



## API Reference

#### Get all Solana Transfers of a wallet

```http
  POST /api/getSolTransfers
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `wallet` | `string` | **Required**. The wallet you're searching |

#### Get all SPL token transfers of a wallet

```http
  POST /api/getSplTransfers
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `wallet`      | `string` | **Required**. The wallet you're searching |


#### Get a sorted view of Solana Transfers of a wallet
```http
  POST /api/getSortedSolTransfers
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `wallet`      | `string` | **Required**. The wallet you're searching |


