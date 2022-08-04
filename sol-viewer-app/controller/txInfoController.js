const { response } = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

let startTime = new Date().getTime();


let getAllSolTransfers = async(body,res) => {
    const lamports = 1000000000;
    let sol_transfers = [];
    let failed_sol_transfers = []
    

    async function getSignatures() {
        let offset = 0
        let wallet = body.body.wallet
        while (true){
            let resp = await fetch(`https://public-api.solscan.io/account/solTransfers?account=${wallet}&offset=${offset}&limit=50`);
            data = await resp.json()
            for(transfer of data['data']){
                if (transfer.status !== 'Success'){
                    failed_sol_transfers.push(transfer)
                }
                let time = new Date(transfer['blockTime']*1000)
                const st = {
                    source: transfer['src'],
                    destination: transfer['dst'],
                    amount: transfer['lamport']/lamports,
                    date: `${time.toLocaleString('en-GB', { timeZone: 'UTC' })} UTC`,
                    solScanTxLink: `https://solscan.io/tx/${transfer['txHash']}`
                }
                sol_transfers.push(st)
            }
            offset += 50

            if (data['data'].length !== 50 || offset>1000) {
                break
            }
            }
            
        };
        

    await getSignatures()
    console.log(sol_transfers.length)


 
    res.status(200).json(sol_transfers);
};

module.exports = {
    getAllSolTransfers
};
