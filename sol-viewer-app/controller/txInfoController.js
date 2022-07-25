const { response } = require('express');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
let getAllSolTransfers = async(body,res) => {
    const rpc = 'https://api.mainnet-beta.solana.com';
    const lamports = 1000000000;
    let signatureArr = [];
    
    const headers = {
        'Content-Type':'application/json'
    };
    console.log(body.body['wallet'])

    async function getSignatures() {
        let resp = await fetch(rpc, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "getSignaturesForAddress",
                    "params": [
                    body.body['wallet'],
                    {
                        "limit": 100
                    }
                    ]
                })
            });

        let data = await resp.json();
        for(let result of data['result']){

            if (result['confirmationStatus'] == 'finalized' && result['err'] == null) {
                signatureArr.push(result['signature'])
            }
        }
    };
    await getSignatures()

    async function getSolTransfers() {
        let sol_transfers = [];
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
            console.log(tx.status)
            let tx_info = await tx.json();
            let tx_instructions = tx_info['result']['transaction']['message']['instructions'];
            if (tx_instructions.length == 1 && tx_instructions[0]['programIdIndex']==2 && tx_info['result']['meta']['postBalances'].length == 3){
                //pushes an array = [walletFrom, walletTo, Amount in Sol]
                sol_transfers.push([tx_info['result']['transaction']['message']['accountKeys'][0], tx_info['result']['transaction']['message']['accountKeys'][1], Math.abs(tx_info['result']['meta']['postBalances'][1] - tx_info['result']['meta']['preBalances'][1])/lamports]);
                //console.log('sol-transfer');
            } else {
                console.log('not sol-transfer');
            };
        };
        return sol_transfers;
    };
    let sol_transfers = await getSolTransfers();
    //console.log(signatureArr);
    res.status(200).json(sol_transfers);
};





module.exports = {
    getAllSolTransfers
};
