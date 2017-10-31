var numAddressesToGenerate = 10;

const ledger = require('../src');
ledger
	.comm_node
	.create_async()
	.then(function(comm) {
		console.log(comm.device.getDeviceInfo());

        var eth = new ledger.eth(comm);
        console.log("eth :: " + JSON.stringify(eth));
//        var result = eth.getAppConfiguration(result);
//        console.log(result);
    
        getEthereumAddress(eth, 0, numAddressesToGenerate);
    })
	.catch(function(reason) {
		console.log('An error occured: ', reason);
	});

var allAddresses = [];

function getEthereumAddress(eth, addressIndex, totalAddresses) {
    console.log("44'/60'/0'/" + addressIndex);
    eth.getAddress_async("44'/60'/0'/" + addressIndex).then(
         function(result) {
             //console.log(result);
             console.log("generated address " + (addressIndex + 1) + " of " + totalAddresses);
             allAddresses[addressIndex] = result;
             if (addressIndex < totalAddresses - 1) {
                 getEthereumAddress(eth, addressIndex + 1, totalAddresses);
             } else {
                 finalize();
             }
         }).fail(
         function(error) { console.log("error :: " + error); });
}

function finalize() {
    for (var i = 0; i < numAddressesToGenerate; i++) {
        console.log(allAddresses[i].address);
    }
    console.log("complete");
}
