const { response } = require('express');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
let getAllSolTransfers = async(body,res) => {
    const rpc = 'https://api.mainnet-beta.solana.com';
    const lamports = 1000000000;
    let sol_transfers = [];
    let signatureArr = [];
    
    const headers = {
        'Content-Type':'application/json'
    };

    async function getSignatures() {
        let resp = await fetch(rpc, {
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
        for(let result of data['result']){
            //error == null as well
            if (result['confirmationStatus'] == 'finalized') {
                signatureArr.push(result['signature'])
            }
        }
    };
    await getSignatures()

    async function getSolTransfers() {
        for(let signature of signatureArr){
            let tx = await fetch(rpc,{
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
        
            let tx_info = await tx.json();
            let tx_instructions = tx_info['result']['transaction']['message']['instructions'];
            if (tx_instructions.length == 1 && tx_instructions[0]['programIdIndex']==2){
                
                //balance change == console.log(Math.abs(tx_info['result']['meta']['postBalances'][1] - tx_info['result']['meta']['preBalances'][1])/lamports)
                console.log('sol-transfer');
            } else {
                console.log('not sol-transfer');
            };
            //console.log(tx_info['result']['transaction']['message']['instructions'])
        };
    };
    getSolTransfers();
    console.log(signatureArr);
    res.status(200).json(sol_transfers);
};





module.exports = {
    getAllSolTransfers
};
