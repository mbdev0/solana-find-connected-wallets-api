const {
    response
} = require('express');
const fetch = (...args) => import('node-fetch').then(({
    default: fetch
}) => fetch(...args));

let sol_transfers =[];
let spl_transfers = [];
let failed_sol_transfers =[];
const lamports = 1000000000


const allSolTransfers = async(body) => {
    sol_transfers = []
    let offset = 0
    let wallet = body.body.wallet
    while (true) {
        let resp = await fetch(`https://public-api.solscan.io/account/solTransfers?account=${wallet}&offset=${offset}&limit=50`);
        data = await resp.json()
        for (transfer of data['data']) {
            if (transfer.status !== 'Success') {
                failed_sol_transfers.push(transfer)
            }
            let time = new Date(transfer['blockTime'] * 1000)

            let amount
            if (transfer['src'] === wallet){
                amount = `-${transfer['lamport'] / lamports}`
            } else {
                amount = `+${transfer['lamport'] / lamports} `
            }

            const st = {
                source: transfer['src'],
                destination: transfer['dst'],
                amount: amount,
                date: `${time.toLocaleString('en-GB', { timeZone: 'UTC' })} UTC`,
                solScanTxLink: `https://solscan.io/tx/${transfer['txHash']}`
            }
            sol_transfers.push(st)
        }
        offset += 50

        if (data['data'].length !== 50 || offset > 2000) {
            break
        }
    }
    //console.log(sol_transfers.length)

}

const getAllSolTransfers = async (body, res) => {
    await allSolTransfers(body)
    res.status(200).json(sol_transfers);
};

const getAllSplTransfers = async(body,res) => {
    let offset = 0
    const wallet = body.body.wallet
    console.log(wallet)

    while (true){
        let resp = await fetch(`https://public-api.solscan.io/account/splTransfers?account=${wallet}&offset=${offset}&limit=50`)
        let data = await resp.json()
        for (let splTransfer of data.data){
            spl_transfers.push(splTransfer)
        }
        offset += 50

        if (data['data'].length !== 50 || offset > 2000) {
            break
        }
    }
    res.status(200).json(spl_transfers)
}

const getSortedSolTransfers = async(body,res) => {
    let sortedTransfers = [];
    await allSolTransfers(body)

    
    res.status(200).json(sortedTransfers)
}


module.exports = {
    getAllSolTransfers,
    getAllSplTransfers,
    getSortedSolTransfers
};