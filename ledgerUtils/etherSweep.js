//@note: this file is a node.js utility to enable a database of addresses + values to be swept
//into another single address.
//
//All such database entries will need metadata to specify:
//1: ledger_id : integer (should be clearly visible in indelible ink on the devices)
//2: account_id : integer (based on the bip32 hd tree structure)
//3: account_address : hex (hex format ethereum address with the 0x... prefix)
//4: account_balance : string (256 bit number, in wei)
//5: account_nonce :  integer (sum of # of outgoing transactions from this address)
//

const ledger = require('../src');

const etherUtils = require('./etherUtils.js');
const EthereumTX = require('ethereumjs-tx');

var targetAddress = "0xe2194ed7E7f490cA0BB159Dc5f1B3CBC54526136";

//ledger #1
//account #0: 0xd202e8A4a963a62674CAA98f3AB61d1E06136420, 0.00168212 ETH, 1 
//account #3: 0x0e4ca84C8B7B08b44803323d16fb43E83095fEA1, 0.00336424 ETH, 0
//account #7: 0xF0E1542D8Aa8Ad003DB1050460401C557CEdd21D, 0.00084106 ETH, 0

//1682120000000000
//3364240000000000
//841060000000000

var database = [
    {ledger_id: 0, account_id: 0, account_address: "0xd202e8A4a963a62674CAA98f3AB61d1E06136420", account_balance: "1682120000000000", account_nonce: 1, unsignedTX: ""},
    {ledger_id: 0, account_id: 3, account_address: "0x0e4ca84C8B7B08b44803323d16fb43E83095fEA1", account_balance: "3364240000000000", account_nonce: 0, unsignedTX: ""},
    {ledger_id: 0, account_id: 7, account_address: "0xF0E1542D8Aa8Ad003DB1050460401C557CEdd21D", account_balance: "841060000000000", account_nonce: 0, unsignedTX: ""}];

function init() {
    console.log("[init]");
    console.log("target address :: " + targetAddress);
    var isValidAddress = etherUtils.validateEtherAddress(targetAddress);
    if (!isValidAddress) {
        console.log("address is not valid :: " + targetAddress);
        return;
    }
    
    console.log("");
    console.log("[pre-processing]");

    var foundError = false;
    
    for (var i = 0; i < database.length; i++) {
        var curAddrDict = database[i];
        
//        console.log("");
//        console.log("entry :: " + JSON.stringify(curAddrDict));
        
        var isValidAddress = etherUtils.validateEtherAddress(curAddrDict.account_address);
        if (!isValidAddress) {
            console.log("error :: address is not valid :: " + curAddrDict.account_address);
            
            foundError = true;
            continue;
        }
    }
    
    if (!foundError) {
        console.log("no errors in addresses detected.. proceeding with transaction signing.");
        console.log("");

        console.log("[serializing]");
        
        var gasPrice = 5000000000; //@note: this is good as of oct 27/2017
        var gasLimit = 21000; //@note: since we're only sending to a regular account. this should be ~100,000 for a contract address.
        
        for (var i = 0; i < database.length; i++) {
            var curAddrDict = database[i];
            
            const txParams = {
                nonce: etherUtils.sanitizeHex(etherUtils.decimalToHex(curAddrDict.account_nonce)),
                gasPrice: etherUtils.sanitizeHex(etherUtils.decimalToHex(gasPrice)),
                gasLimit: etherUtils.sanitizeHex(etherUtils.decimalToHex(gasLimit)),
                to: targetAddress,
                value: etherUtils.sanitizeHex(etherUtils.decimalToHex(curAddrDict.account_balance)),
                data: ''
            }
            
            var tx = new EthereumTX(txParams);
            var serializedUnsignedTX = tx.serialize().toString('hex');
            console.log("txParams :: " + JSON.stringify(txParams));
            console.log("serializedUnsignedTX :: " + serializedUnsignedTX);

            curAddrDict.unsignedTX = serializedUnsignedTX;
        }
    }
    
    if (!foundError) {

        console.log("[signing]");
        ledger.comm_node.create_async().then(function(comm) {
            console.log(comm.device.getDeviceInfo());

            var eth = new ledger.eth(comm);
            console.log("eth :: " + JSON.stringify(eth));

            signAddress(eth, 0, database.length);
        }).catch(function(reason) {
            console.log('An error occured: ', reason);
        });
    }
        
//        const privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')
// 
//        const txParams = {
//          nonce: '0x00',
//          gasPrice: '0x09184e72a000', 
//          gasLimit: '0x2710',
//          to: '0x0000000000000000000000000000000000000000', 
//          value: '0x00', 
//          data: '',
//          // EIP 155 chainId - mainnet: 1, ropsten: 3 
//          chainId: 3
//        }
//
//        const tx = new EthereumTx(txParams)
//        tx.sign(privateKey)
//        const serializedTx = tx.serialize()
}

function signAddress(eth, curAddressIndex, totalAddresses) {
    var curAddrDict = database[curAddressIndex];
    
    console.log("[signing address #" + curAddressIndex + " ]");
    eth.signTransaction_async("44'/60'/0'/" + curAddrDict.account_id, curAddrDict.unsignedTX).then(function (result) {
        console.log(result);

        if (curAddressIndex < totalAddresses - 1) {
            signAddress(eth, curAddressIndex + 1, totalAddresses);
        } else {
            console.log("");

            console.log("[complete]");
        }
    }).fail(function(err) {
        console.log("error :: " + err);
        console.log("[failure in signing address #" + curAddressIndex + ", aborting]");
    });
}

init();