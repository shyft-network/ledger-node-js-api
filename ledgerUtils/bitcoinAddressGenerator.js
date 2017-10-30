var numAddressesToGenerate = 2;


const ledger = require('../src');
ledger
	.comm_node
	.create_async()
	.then(function(comm) {
		console.log(comm.device.getDeviceInfo());

        var btc = new ledger.btc(comm);
        console.log("btc :: " + JSON.stringify(btc));

    
        getBitcoinAddress(btc, 0, numAddressesToGenerate);

    })
	.catch(function(reason) {
		console.log('An error occured: ', reason);
	});

var allAddresses = [];

function getBitcoinAddress(btc, addressIndex, totalAddresses) {
    btc.getWalletPublicKey_async("44'/0'/0'/"+addressIndex).then(
         function(result) {
             console.log(result);
             var bitcoinAddress = result['bitcoinAddress'];
             console.log('bitcoinAddress');
             console.log(bitcoinAddress);
             console.log("generated address " + (addressIndex + 1) + " of " + totalAddresses);
             allAddresses[addressIndex] = bitcoinAddress;
             if (addressIndex < totalAddresses - 1) {
                 getBitcoinAddress(btc, addressIndex + 1, totalAddresses);
             } else {
                 finalize();
             }
         }).fail(
         function(error) { console.log("error :: " + error); });
}

function finalize() {
    for (var i = 0; i < numAddressesToGenerate; i++) {
        console.log(allAddresses[i]);
    }
    console.log("complete");
}
