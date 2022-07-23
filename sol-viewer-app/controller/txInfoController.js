const { response } = require('express');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
let getAllSolTransfers = async(body,res) => {
    let sol_transfers = [];
    let signatureArr = [];
    
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
                signatureArr.push(result['signature'])
            }
        }
    };
    await getSignatures()

    async function getSolTransfers() {
        for(let signature of signatureArr){
            let tx = await fetch('https://api.mainnet-beta.solana.com',{
                    method: 'POST',
                    headers:headers,
                    body: JSON.stringify(
                        {
                            "jsonrpc": "2.0",
                            "id": 1,
                            "method": "getTransaction",
                            "params": [
                            signature,
                            "json"
                            ]
                        }
                    )});
        
            let tx_info = await tx.json()
            console.log(tx_info)
        }
    };
    getSolTransfers();

    console.log(signatureArr)
    //let signatureInfoRes = await signatureInfo.json();
    //console.log(signatureInfoRes);
    res.status(200).json(sol_transfers);
};





module.exports = {
    getAllSolTransfers
};
