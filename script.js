function filter_tx(data) {
    let multiple_tx = data['result']

    for (const tx of multiple_tx){
        console.log(tx['signature'])
    }
}

fetch('https://api.mainnet-beta.solana.com/', {
    method:'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getSignaturesForAddress",
        "params": [
          "9EW8AJiaY32J4gJYqiK3zbfkekp3mc2n6CVXaopPfdXE",
          {
            "limit": 5
          }
        ]
    })
})
    .then(res => res.json())
    .then(data => filter_tx(data))
    .catch( (error) => {
        console.log('Error: ',error)
    })

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

*/