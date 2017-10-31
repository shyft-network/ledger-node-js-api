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

var BigNumber = require('bignumber.js');

const ethUtil = require('ethereumjs-util');
const etherUtils = require('./etherUtils.js');
const EthereumTX = require('ethereumjs-tx');


var currentTXParams;

var targetAddress = "0xe2194ed7E7f490cA0BB159Dc5f1B3CBC54526136";

//ledger #1
//account #0: 0xd202e8A4a963a62674CAA98f3AB61d1E06136420, 0.00168212 ETH, 1 
//account #3: 0x0e4ca84C8B7B08b44803323d16fb43E83095fEA1, 0.00336424 ETH, 0
//account #7: 0xF0E1542D8Aa8Ad003DB1050460401C557CEdd21D, 0.00084106 ETH, 0

//1682120000000000
//3364240000000000
//841060000000000
//

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

    
//    var rawTx = {"nonce":"0x00","gasPrice":"0x04e3b29200","gasLimit":"0x5208","to":"0x0e4ca84C8B7B08b44803323d16fb43E83095fEA1","value":"0x0a62abd9cb1000","data":"","chainId":1,"v":"0x26","r":"0xd2ae8d8d4012a595a2e29e3a45eb504105e79a1567ebe33a2aea4e2748ed471c","s":"0x5e502aa54f6562370d7164bc21f1e205b4bb80f0359cc90ccac0c5a72030d9bb"};
//
//    //var rawTx =    {"nonce":"0x01","gasPrice":"0x04e3b29200","gasLimit":"0x5208","to":"0xd202e8A4a963a62674CAA98f3AB61d1E06136420","value":"0x03b2e4a3c4c000","data":"","chainId":1,"v":"0x25","r":"0xaab393f72cd61513b9eef4dae10c325023317c5ae8e9196cef0674af3b60992b","s":"0x737b1ba1aa15ddf7879248ab07b0b1275e7acb978f7dcb86900e6916593b070f"}
//
//    //var rawTx =           {"nonce":"0x01","gasPrice":"0x04e3b29200","gasLimit":"0x5208","to":"0xd202e8A4a963a62674CAA98f3AB61d1E06136420","value":"0x0468cac4b94000","data":"","chainId":1,"v":"0x26","r":"0x3bb0d27cb32046ba3a4adad86f594db50a09a2a50830ee7f6fb262875b23c63c","s":"0x3e00dcde6310f1c60781eefcae6321115f3ce5873dd8651e5ec33a2e67d9a7c5"}
//
//    var tx = new EthereumTX(rawTx);
//    var isValid = tx.verifySignature();
//    
//    console.log("isValid :: " + isValid);
//    return;

    //{"jsonrpc":"2.0","id":1,"result":{"blockHash":"0x949f40920a86f281daccbe8e30dd60a366b22ff270647815f6bfc0402ff38e42","blockNumber":"0xce3","from":"0x047347096a6dc73f8626afb520c383a02efda314","gas":"0x15f90","gasPrice":"0x4a817c800","hash":"0x70a7552c8ab8d2621c80c8a1c149012d10a823c4619cc82235cbdfad0553310b","input":"0x021df6f4000000000000000000000000000000000000000000000000000000000000000d48656c6c6f2c20776f726c642100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d48656c6c6f2c20776f726c642100000000000000000000000000000000000000","nonce":"0x178","to":"0xe2412bb63a0a25d7b8973fc6764fd246ebe62c7a","transactionIndex":"0x0","value":"0x0","v":"0x1b","r":"0xd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042","s":"0x24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354"}}
//
//    var rawTx = {
//        nonce: '178',
//        gasPrice: '4a817c800',
//        gasLimit: '15f90',
//        to: '0xe2412bb63a0a25d7b8973fc6764fd246ebe62c7a',
//        value: '0',
//        data: '021df6f4000000000000000000000000000000000000000000000000000000000000000d48656c6c6f2c20776f726c642100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d48656c6c6f2c20776f726c642100000000000000000000000000000000000000',
//        v: '1b',
//        r: 'd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042',
//        s: '24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354'
//    };
//    
//    var tx = new EthereumTX(rawTx);
//    
//    var m = ethUtil.ecrecover(tx.hash(false), '1b'.toString('hex'), 'd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042'.toString('hex'), '24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354'.toString('hex'));
//    
//
//    console.log("m :: " + m);
//
//    var isValid = tx.verifySignature();
//    
//    console.log("" + tx.serialize().toString('hex'));
//    console.log("isValid :: " + isValid);

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

        var gpBN = new BigNumber(gasPrice);
        var glBN = new BigNumber(gasLimit);

        var gasCostBN = gpBN.mul(glBN);

        //        r.toString();
        console.log("gasCostBN :: " + gasCostBN.toNumber());

        for (var i = 0; i < database.length; i++) {
            var curAddrDict = database[i];

            //@note: use some bignumbers to compare. need to pay for gas to transfer out.
            var accountBalanceBN = new BigNumber(curAddrDict.account_balance);
            console.log("accountBalanceBN :: " + accountBalanceBN.toString(10));
            var sendAmountBN = accountBalanceBN.minus(gasCostBN);
            console.log("sendAmountBN :: " + sendAmountBN.toString(10));
            console.log("decimalToHex :: " + etherUtils.decimalToHex(sendAmountBN.toString(10)));
            
            if (sendAmountBN.comparedTo(0) >= 0) {
                console.log("sending :: " + etherUtils.sanitizeHex(sendAmountBN.toString(16)));
                const txParams = {
                    nonce: etherUtils.sanitizeHex(etherUtils.decimalToHex(curAddrDict.account_nonce)),
                    gasPrice: etherUtils.sanitizeHex(etherUtils.decimalToHex(gasPrice)),
                    gasLimit: etherUtils.sanitizeHex(etherUtils.decimalToHex(gasLimit)),
                    to: targetAddress,
//                    value: etherUtils.sanitizeHex(etherUtils.decimalToHex(curAddrDict.account_balance)),
                    value: etherUtils.sanitizeHex(etherUtils.decimalToHex(sendAmountBN.toString(10))),
                    data: '',
                    chainId: 1
                }

                var tx = new EthereumTX(txParams);
                var serializedUnsignedTX = tx.serialize().toString('hex');
                console.log("txParams :: " + JSON.stringify(txParams));
                console.log("serializedUnsignedTX :: " + serializedUnsignedTX);

                curAddrDict.unsignedTX = serializedUnsignedTX;
                curAddrDict.txParams = txParams;
            } else {
                console.log("error :: account :: " + curAddrDict.account_address + " :: has insufficient balance to cover gas cost :: " + curAddrDict.account_balance);

                foundError = true;
                continue;
            }
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
    //
    //        const tx = new EthereumTx(txParams)
    //        tx.sign(privateKey)
    //        const serializedTx = tx.serialize()
}

//          {"nonce":"0x01","gasPrice":"0x04e3b29200","gasLimit":"0x5208","to":"0xd202e8A4a963a62674CAA98f3AB61d1E06136420","value":"0x5af3107a4000","data":"","chainId":1,"v":"0x26","r":"0x544f9533ac3397b22ab10411153d3b75bac779b60397b926c8c6398aefe335a3","s":"0x4987e8cb88b7e5b0e66708516e7dc964aa29f24569a6c9c0a855e2b7b3033cf4"}


function signAddress(eth, curAddressIndex, totalAddresses) {
    var curAddrDict = database[curAddressIndex];

    //@note: accesses global here since a passthrough is very time consuming.
    currentTXParams = curAddrDict.txParams;
    
    console.log(JSON.stringify(currentTXParams));

    console.log("44'/60'/0'/" + curAddrDict.account_id);
    console.log("[signing address #" + curAddressIndex + " ]");
    eth.signTransaction_async("44'/60'/0'/" + curAddrDict.account_id,
        curAddrDict.unsignedTX).then(function (result) {
        console.log(result);

        //        const txParams = {
        //            nonce: '0x00',
        //            gasPrice: '0x09184e72a000', 
        //            gasLimit: '0x2710',
        //            to: '0x0000000000000000000000000000000000000000', 
        //            value: '0x00', 
        //            data: '',
        //            // EIP 155 chainId - mainnet: 1, ropsten: 3 
        //            chainId: 1,
        //            v: result.v,
        //            r: ethUtil.setLength(result.r, 32),
        //            s: ethUtil.setLength(result.s, 32)
        //        }

        var newTxParams = currentTXParams;
        newTxParams.v = result.v;
        newTxParams.r = ethUtil.setLength(result.r, 32);
        newTxParams.s = ethUtil.setLength(result.s, 32);
        
//        console.log("newTxParams :: " + JSON.stringify(newTxParams, 0, 4));

        var tx = new EthereumTX(currentTXParams);

        var isValid = tx.verifySignature();
        
//        etherUtils.pubToAddress(pub);
//        etherUtils.fromRpcSig(sig)

        var serializedTx = tx.serialize();
        
        var addrBuf = new Buffer(0); 
        
        if (tx._senderPubKey != undefined) {
            addrBuf = ethUtil.pubToAddress(tx._senderPubKey);
        }

        var addr    = ethUtil.bufferToHex(addrBuf);
        tx.pubAddress = addr;

        console.log("isValid :: " + isValid + " :: serializedTx :: " + serializedTx.toString('hex') + " :: senderPubKey :: " + tx._senderPubKey + " :: addr :: " + addr + " :: ");

//        try {
//            var m = ethUtil.ecrecover(tx.hash(false), result.v.toString('hex'), ethUtil.setLength(result.r, 32).toString('hex'), ethUtil.setLength(result.s, 32).toString('hex'));
//
//            console.log("m :: " + m);
//        } catch(err) {
//            console.log(err);
//        }


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