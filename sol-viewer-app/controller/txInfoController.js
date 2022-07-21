const { response } = require('express');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
let getAllSolTransfers = async(body,res) => {
    let sol_transfers = [];
    
    const headers = {
        'Content-Type':'application/json'
    };

    async function getSignatures() {
    let resp = await fetch('https://api.mainnet-beta.solana.com', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getSignaturesForAddress",
                "params": [
                   "9EW8AJiaY32J4gJYqiK3zbfkekp3mc2n6CVXaopPfdXE",
                   {
                     "limit": 1
                   }
                 ]
            })
        });

    let data = await resp.json();
    return data['result'][0]['signature']
    }


    console.log(await getSignatures())
        
    res.status(200).json(sol_transfers);
};



module.exports = {
    getAllSolTransfers
};
