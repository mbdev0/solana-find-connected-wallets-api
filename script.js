const LAMPORTS = 1000000000

function filter_tx(data) {
    function get_transaction(signature) {
        fetch('https://solana-api.projectserum.com', {
                method:'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "getTransaction",
                    "params": [
                      signature,
                      "json"
                    ]
                })
            })
            .then(res => {
                if (res.status === 200){
                   return res.json() 
                }
                return new Error(res.status)
            })
            .then(data => {
                let account_keys = data['result']['transaction']['message']['accountKeys']
                const preBalances = data['result']['meta']['preBalances']
                const postBalances = data['result']['meta']['postBalances']
                let account_info = { 
                    account_from: [account_keys[0], postBalances[0]/LAMPORTS],
                    account_to: [account_keys[1],postBalances[1]/LAMPORTS]
                }
                console.log(`${account_info['account_from'][0]} ${account_info['account_from'][1]}  -- +${(preBalances[0]-postBalances[0])/LAMPORTS} -->  ${account_info['account_to'][0]} ${account_info['account_to'][1]}`)
                console.log(account_info)
            }
            )
            .catch( (error) => {
                if (error.message === '429'){
                    return get_transaction()
                }
                console.log('Error:', error)
            })
    }

    let multiple_tx = data['result']
    for (const tx of multiple_tx){
        get_transaction(tx['signature'])
    }
}
function getSignatures(address){
    fetch('https://solana-api.projectserum.com', {
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getSignaturesForAddress",
            "params": [
            address,
            {
                "limit":1
            }
            ]
        })
    })
        .then(res => {
            if(res.status === 200){
                return res.json()
            }
            throw new Error(res.status)
        })
        .then(data => filter_tx(data))
        .catch( (error) => {
            if (error.message === '429'){
                console.log('ratelimited')
                return getSignatures(address)
            }
            console.log('Error: ',error)
    })
}

const address = 'RhBh8W7dZQbvCzm3bGRCCuf3jvLB8xLxZhQWASsRQEb'
getSignatures(address)



/*

Get Signatures for address

curl https://api.mainnet-beta.solana.com/ -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getSignaturesForAddress",
    "params": [
      "9EW8AJiaY32J4gJYqiK3zbfkekp3mc2n6CVXaopPfdXE",
      {
        "limit": 10
      }
    ]
  }
'
// 3Bxs411Dtc7pkFQj == sol transger
*/
