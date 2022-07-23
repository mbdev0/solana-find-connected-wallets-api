const { response } = require('express');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
let getAllSolTransfers = async(body,res) => {
    let sol_transfers = [];
    let tx = [];
    
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
                        "limit": 3
                    }
                    ]
                })
            });

        let data = await resp.json();
        for(let result of data['result']){
            if (result['confirmationStatus'] == 'finalized') {
                tx.push(result['signature'])
            }
        }
    };
    await getSignatures()
    // let signatureInfo = await fetch('https://api.mainnet-beta.solana.com',{
    //                     method: 'POST',
    //                     headers:headers,
    //                     body: JSON.stringify(
    //                         {
    //                             "jsonrpc": "2.0",
    //                             "id": 1,
    //                             "method": "getTransaction",
    //                             "params": [
    //                               await getSignatures(),
    //                               "json"
    //                             ]
    //                         }
    //                     )});
    console.log(tx)
    //let signatureInfoRes = await signatureInfo.json();
    //console.log(signatureInfoRes);
    res.status(200).json(sol_transfers);
};





module.exports = {
    getAllSolTransfers
};
