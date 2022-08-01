const { response } = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

let startTime = new Date().getTime();


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
                signatureArr.push(result)
            }
        }

        if (signatureArr.length==0){
            await fetchreq({"limit":1000});
        }
        let prevArr = [];
        while (prevArr.length<signatureArr.length){
            prevArr = [...signatureArr]
            await fetchreq({"limit":1000,"before":signatureArr[signatureArr.length-1]['signature']});
            console.log("signatureArr: ", signatureArr.length)
            console.log("prevArr: ", prevArr.length)

        }

        signatureArr = signatureArr.filter(result => result['confirmationStatus'] === 'finalized' && result['err'] === null)


    };
    await getSignatures()

    let getSignaturesTime = new Date().getTime();
    console.log("get all signatures time: ", getSignaturesTime-startTime)

    /*
    Idea:

    IF promises.length == 100{
        then promise.all()
        then push all responses to a new array
    }

    filter array out for sol transfers only
    fin
    */

    async function getSolTransfers() {
        let promises = [];
        let sol_transfers = [];
        let toPushText = [];
        let allT = [];
        for(let signature of signatureArr){
            
            if (promises.length === 10) {
                let subP = await Promise.allSettled(promises)
                const fulfilled = subP.filter(result => result.status === 'fulfilled').map(result => result.value)
                for(let x of fulfilled){
                    toPushText.push(x.text())
                }
                allT.push(await Promise.allSettled(toPushText))
                promises.length = 0                
                toPushText.length = 0
            }

            let tx = fetch(rpc,{
                    method: 'POST',
                    headers:headers,
                    body: JSON.stringify(
                        {
                            "jsonrpc": "2.0",
                            "id": 1,
                            "method": "getTransaction",
                            "params": [
                            signature['signature'],
                            "json"
                            ]
                        }
                    )});
            promises.push(tx);
            // let tx_info = await tx.json();
            
        };
        //console.log(allT)
        let solTransfersTimePromises = new Date().getTime();
        console.log("Sol transfer time for pushing promises: ",solTransfersTimePromises-getSignaturesTime)

        // textPromises = [];

        let solTransferFetch = new Date().getTime();
        console.log("Time taken for all fetch for transactions: ", solTransferFetch-solTransfersTimePromises)

        // const fulfilled = allPromises.filter(result => result.status === 'fulfilled').map(result => result.value)
        // for(let x of fulfilled){
        //     textPromises.push(x.text())
        // }
        //console.log(fulfilled)
        // const getTextPromise = allPromises.map((response) => response.text());
        // console.log('before doing text promises')
        // const allTextPromises = await Promise.allSettled(textPromises);

        let textPromiseTime = new Date().getTime();
        console.log("Time taken to get text for all the promises: ", textPromiseTime - solTransferFetch)

        console.log('before filtering')

        for(let all of allT){
            for(let p of all){
                let tx_info = JSON.parse(p['value'])
                console.log(tx_info)
                if(tx_info['result'] == null){continue}
                let tx_instructions = tx_info['result']['transaction']['message']['instructions'];
                if (tx_instructions.length == 1 && tx_instructions[0]['programIdIndex']==2 && tx_info['result']['meta']['postBalances'].length == 3){
                    let solAmount = Math.abs(tx_info['result']['meta']['postBalances'][1] - tx_info['result']['meta']['preBalances'][1])/lamports
                    if (solAmount==0){continue};
                    //pushes an array = [walletFrom, walletTo, Amount in Sol]
                    sol_transfers.push([tx_info['result']['transaction']['message']['accountKeys'][0], tx_info['result']['transaction']['message']['accountKeys'][1], solAmount]);
                    console.log('sol-transfer');
                } else {
                    console.log('not sol-transfer');
                };
            }
        }

        let filterSolTransfers = new Date().getTime();
        console.log("Time taken to get filter sol transfers: ", filterSolTransfers-textPromiseTime )

        return sol_transfers;
    };
    let sol_transfers = await getSolTransfers();
    //console.log(signatureArr);
    res.status(200).json(sol_transfers);
};

module.exports = {
    getAllSolTransfers
};
