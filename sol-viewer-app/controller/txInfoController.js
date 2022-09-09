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
    }


const getAllSolTransfers = async (body, res) => {
    try {
        await allSolTransfers(body)
        return res.status(200).json(sol_transfers);
    } 
    catch(err){
        return res.status(404).send({message:'Make sure wallet is correct'})
    }
};

const getAllSplTransfers = async(body,res) => {
    let offset = 0
    const wallet = body.body.wallet
    console.log(wallet)
    try{
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
    return res.status(200).json(spl_transfers)
    } catch(err) {
        return res.status(404).send({message: 'Please check your wallet'})
    }
}

const getSortedSolTransfers = async(body,res) => {
    let sortedTransfers = {
        walletToSearch: body.body.wallet,
        totalOfSolTransactions: 0,
        wallets: {}
        };
    let visited = [];
    try {
        await allSolTransfers(body)
    }
    catch(err) {
        return res.status(404).send({message: 'Please check your wallet'})
    }
    sortedTransfers.totalOfSolTransactions = sol_transfers.length
    // if the wallet is not in the sortedTransfers -> add object key as wallet and then push [{tx info}] as value
        // else : add tx to wallet it corresponds with
    for(let tx of sol_transfers){
            if (tx.source != body.body.wallet){
                if (!(visited.includes(tx.source))) {
                    visited.push(tx.source)
                    sortedTransfers.wallets[tx.source] = { 
                        numberOfSolTransactions: 0,
                        transactions: [tx]}
                    
                    sortedTransfers.wallets[tx.source].numberOfSolTransactions = sortedTransfers.wallets[tx.source].transactions.length
                }
                else{
                sortedTransfers.wallets[tx.source].transactions.push(tx)
                sortedTransfers.wallets[tx.source].numberOfSolTransactions = sortedTransfers.wallets[tx.source].transactions.length
                }
            }

            if (tx.destination != body.body.wallet) {
                if (!(visited.includes(tx.destination))){
                    visited.push(tx.destination)
                    sortedTransfers.wallets[tx.destination] = { 
                        numberOfSolTransactions: 0,
                        transactions: [tx]}
                    
                    sortedTransfers.wallets[tx.destination].numberOfSolTransactions = sortedTransfers.wallets[tx.destination].transactions.length
                }
                else{    
                sortedTransfers.wallets[tx.destination].transactions.push(tx)
                sortedTransfers.wallets[tx.destination].numberOfSolTransactions = sortedTransfers.wallets[tx.destination].transactions.length
                }
            }
        }

    console.log(visited)

    return res.status(200).json(sortedTransfers)
}


module.exports = {
    getAllSolTransfers,
    getAllSplTransfers,
    getSortedSolTransfers
};