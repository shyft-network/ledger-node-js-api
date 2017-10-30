var bitcoin = require('bitcoinjs-lib');

var numAddressesToGenerate = 2;

const ledger = require('../src');
ledger
	.comm_node
	.create_async()
	.then(function(comm) {
		console.log(comm.device.getDeviceInfo());

        var btc = new ledger.btc(comm);
        console.log("btc :: " + JSON.stringify(btc));

    
        getBitcoinAddress(btc, 0);

    })
	.catch(function(reason) {
		console.log('An error occured: ', reason);
	});

var allAddresses = [];

function getBitcoinAddress(btc, addressIndex) {
    btc.getWalletPublicKey_async("44'/0'/0'/"+addressIndex).then(
         function(result) {
             console.log(result);

             var publicKey = result['publicKey'];
             var bitcoinAddress = result['bitcoinAddress'];
             console.log('publicKey');
             console.log(publicKey);
             console.log('bitcoinAddress');
             console.log(bitcoinAddress);

             // var tx1 = btc.splitTransaction(publicKey);
             console.log('tx1');
             console.log(tx1);

         }).fail(
         function(error) { console.log("error :: " + error); });
}

function finalize() {
    for (var i = 0; i < numAddressesToGenerate; i++) {
        console.log(allAddresses[i]);
    }
    console.log("complete");
}
