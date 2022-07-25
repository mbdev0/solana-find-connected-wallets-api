const { response } = require('express');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
let getAllSolTransfers = async(body,res) => {
    const rpc = 'https://coin98.genesysgo.net/';
    const lamports = 1000000000;
    let signatureArr = [];
    
    const headers = {
        'Content-Type':'application/json'
    };

    async function getSignatures() {
        
        let fetchreq = async (params) => {
            let resp = await fetch(rpc, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "getSignaturesForAddress",
                    "params": [
                    body.body['wallet'],
                    params
                    ]
                })
            });
        
            let data = await resp.json();
            for(let result of data['result']){
                //if (result['confirmationStatus'] == 'finalized' && result['err'] == null) {
                    signatureArr.push(result['signature'])
                //}
            }
        }

        if (signatureArr.length==0){
            await fetchreq({"limit":1000});
        }
        let prevArr = [];
        while (true){
            await fetchreq({"limit":1000,"before":signatureArr[signatureArr.length-1]});
            console.log("signatureArr: ", signatureArr.length)
            console.log("prevArr: ", prevArr.length)
            if (prevArr.length == signatureArr.length){
                console.log('They are equal')
                break
            }
            prevArr = [...signatureArr];
        }
    };
    await getSignatures()

    async function getSolTransfers() {
        let promises = [];
        let sol_transfers = [];
        for(let signature of signatureArr){
            let tx = fetch(rpc,{
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
            promises.push(tx);
            // let tx_info = await tx.json();
            
        };
        const allPromises = await Promise.all(promises);
        const getTextPromise = allPromises.map((response) => response.text());
        const allTextPromises = await Promise.allSettled(getTextPromise);

        for(let p of allTextPromises){
            let tx_info = JSON.parse(p['value'])
            if(tx_info['result'] == null){continue}
            let tx_instructions = tx_info['result']['transaction']['message']['instructions'];
            if (tx_instructions.length == 1 && tx_instructions[0]['programIdIndex']==2 && tx_info['result']['meta']['postBalances'].length == 3){
                let solAmount = Math.abs(tx_info['result']['meta']['postBalances'][1] - tx_info['result']['meta']['preBalances'][1])/lamports
                if (solAmount==0){continue};
                //pushes an array = [walletFrom, walletTo, Amount in Sol]
                sol_transfers.push([tx_info['result']['transaction']['message']['accountKeys'][0], tx_info['result']['transaction']['message']['accountKeys'][1], solAmount]);
                //console.log('sol-transfer');
            } else {
                console.log('not sol-transfer');
            };
        }

        return sol_transfers;
    };
    //let sol_transfers = await getSolTransfers();
    //console.log(signatureArr);
    res.status(200)
    //.json(sol_transfers);
};





module.exports = {
    getAllSolTransfers
};
