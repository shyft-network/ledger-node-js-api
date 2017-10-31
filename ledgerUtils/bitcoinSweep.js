var bitcoin = require('bitcoinjs-lib');

const ledger = require('../src');

var targetAddress = "15X54yXgxD9QC3dKaSWv7HumxZpEjyRg13";

var allAddresses = [];

var database = [
    {ledger_id: 0, 
     account_id: 0, 
     account_address: "1JThSBm1WMUAPqsP1mLsTwfByfQuu3DA31", 
     account_balance: "200000", 
     account_utxos: [{tx_hash: "a993ddd61c3b875698c1d4e115f8d85be605e40822ea75b5171de87562547cb5",
                      tx_output_n: 0,
                      value: 100000}//,
//                     {tx_hash: "e0ed8d8c944bb54673233b938952245e384591c1d0af68d6dc9340f162672d58",
//                      tx_output_n: 0,
//                      value: 100000}
                    ], 
     unsignedTX: []}];


function init() {
    console.log("[init]");
    console.log("target address :: " + targetAddress);
    var isValidAddress = bitcoin.address.toOutputScript(targetAddress, bitcoin.networks.bitcoin);
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

        var isValidAddress = bitcoin.address.toOutputScript(curAddrDict.account_address, bitcoin.networks.bitcoin);
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
        
        var miningFee = 34112;

        for (var i = 0; i < database.length; i++) {
            var curAddrDict = database[i];

            var allInputs = [];

            var tx = new bitcoin.TransactionBuilder();
            var totalValue = 0;

            for (var j = 0; j < curAddrDict.account_utxos.length; j++) {
                var curUtxo = curAddrDict.account_utxos[j];
                // Add the input (who is paying):
                // [previous transaction hash, index of the output to use]
                
                var txId = curUtxo.tx_hash;
                
                var txOutputIndex = curUtxo.tx_output_n;
                
                totalValue += parseInt(curUtxo.value);
                
                console.log("adding input #" + j + " :: txId :: " + txId);
                console.log("txOutputIndex :: " + txOutputIndex);
                tx.addInput(txId, txOutputIndex);
            }
            
            console.log("miningFee :: " + miningFee);
            console.log("totalValue :: " + totalValue);
            console.log("sentValue :: " + (totalValue - miningFee));
            // Add the output (who to pay to):
            // [payee's address, amount in satoshis]
            tx.addOutput(targetAddress, totalValue - miningFee);

            console.log("tx :: " + JSON.stringify(tx));
            
            var serializedUnsignedTX = tx.buildIncomplete().toHex();
            curAddrDict.unsignedTX.push(serializedUnsignedTX);

            console.log("serializedUnsignedTX :: " + serializedUnsignedTX);

           
           
           //ledger reference //01000000014ea60aeac5252c14291d428915bd7ccd1bfc4af009f4d4dc57ae597ed0420b71010000008a47304402201f36a12c240dbf9e566bc04321050b1984cd6eaf6caee8f02bb0bfec08e3354b022012ee2aeadcbbfd1e92959f57c15c1c6debb757b798451b104665aa3010569b49014104090b15bde569386734abf2a2b99f9ca6a50656627e77de663ca7325702769986cf26cc9dd7fdea0af432c8e2becc867c932e1b9dd742f2a108997c2252e2bdebffffffff0281b72e00000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88aca0860100000000001976a9144533f5fb9b4817f713c48f0bfe96b9f50c476c9b88ac00000000
            
           
           //own build //0100000001b57c546275e81d17b575ea2208e405e65bd8f815e1d4c19856873b1cd6dd93a90000000000ffffffff0160010100000000001976a914319060d35d322bba55b78ed7a3b05303371fd9af88ac00000000
        }
    }
    

    if (!foundError) {

        console.log("[signing]");
        ledger.comm_node.create_async().then(function(comm) {
            console.log(comm.device.getDeviceInfo());

            var btc = new ledger.btc(comm);
//            console.log("btc :: " + JSON.stringify(btc));

            signAddress(btc, 0, database.length);
        }).catch(function(reason) {
            console.log('An error occured: ', reason);
        });
    }    
}


function signAddress(btc, curAddressIndex, totalAddresses) {
    var curAddrDict = database[curAddressIndex];
    
    //@note: reference number.
    var serialStr = "01000000014ea60aeac5252c14291d428915bd7ccd1bfc4af009f4d4dc57ae597ed0420b71010000008a47304402201f36a12c240dbf9e566bc04321050b1984cd6eaf6caee8f02bb0bfec08e3354b022012ee2aeadcbbfd1e92959f57c15c1c6debb757b798451b104665aa3010569b49014104090b15bde569386734abf2a2b99f9ca6a50656627e77de663ca7325702769986cf26cc9dd7fdea0af432c8e2becc867c932e1b9dd742f2a108997c2252e2bdebffffffff0281b72e00000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88aca0860100000000001976a9144533f5fb9b4817f713c48f0bfe96b9f50c476c9b88ac00000000";
    
    var tx = bitcoin.Transaction.fromHex(serialStr);
    
    console.log("build tx :: " + JSON.stringify(tx));
    
//    btc.displayTransactionDebug(serialStr);
    
    
    console.log(curAddrDict.account_utxos[0].tx_hash);
    
    
    
//    var splitTransaction = btc.splitTransaction(curAddrDict.unsignedTX[0]);

//    console.log("adding input #" + 0 + " :: splitTransaction :: " + JSON.stringify(splitTransaction));
    
    //    var splitTransaction = btc.splitTransaction("01000000014ea60aeac5252c14291d428915bd7ccd1bfc4af009f4d4dc57ae597ed0420b71010000008a47304402201f36a12c240dbf9e566bc04321050b1984cd6eaf6caee8f02bb0bfec08e3354b022012ee2aeadcbbfd1e92959f57c15c1c6debb757b798451b104665aa3010569b49014104090b15bde569386734abf2a2b99f9ca6a50656627e77de663ca7325702769986cf26cc9dd7fdea0af432c8e2becc867c932e1b9dd742f2a108997c2252e2bdebffffffff0281b72e00000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88aca0860100000000001976a9144533f5fb9b4817f713c48f0bfe96b9f50c476c9b88ac00000000");
    var txSplit = bitcoin.Transaction.fromHex(curAddrDict.unsignedTX[0]);

    console.log("txSplit :: " + JSON.stringify(txSplit));

//    return;
    
    
    
    var curUnsignedTx = curAddrDict.unsignedTX[0];
    
//    var tx1 = btc.splitTransaction(serialStr);
    var tx1 = btc.splitTransaction(curUnsignedTx);
    var outputScript = btc.serializeTransactionOutputs(tx1).toString('hex');

    try {
        btc.createPaymentTransactionNew_async(
            [ [tx1, 0] ], 
            ["44'/0'/0'/" + curAddressIndex], 
            undefined, 
            outputScript).then(
            function(result) { console.log("result :: " + result);}).fail(
            function(error) { console.log("error :: " + error); });
    } catch (err) {
        console.log("err :: " + err);
    }
    
    return;
    
    
    
    
    
    var allTransactions = [];

    //@note: setup the inputs
    for (var i = 0; i < curAddrDict.account_utxos.length; i++) {
        var curUtxo = curAddrDict.account_utxos[i];
        //@note: these should map 1:1 so using the account_utxos length is correct for both.
        var curUnsignedTx = curAddrDict.unsignedTX[i];
        
        var tx = btc.splitTransaction(curUnsignedTx);
        var newTx = [tx, curUtxo.tx_output_n];
        
        allTransactions.push(newTx);
    }
    
    //@note: setup the outputs
    var serializedOutputScripts = "";

    for (var i = 0; i < curAddrDict.unsignedTX.length; i++) {
        var curUnsignedTx = curAddrDict.unsignedTX[i];

        var tx = btc.splitTransaction(curUnsignedTx);
        var outputScript = btc.serializeTransactionOutputs(tx).toString('hex');

        console.log("tx :: " + JSON.stringify(tx));
        console.log("outputScript :: " + outputScript);

        serializedOutputScripts += outputScript;
    }
//    "44'/0'/0'/"+addressIndex
    
    
//    "0'/0/0"
    var allKeySets = ["0'/0/0"];//["0'/0/0" + curAddressIndex];

//    0140850000000000001976a914319060d35d322bba55b78ed7a3b05303371fd9af88ac
//    01905f0100000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac
    
    console.log("allTransactions :: " + JSON.stringify(allTransactions));
    console.log("serializedOutputScripts :: " + JSON.stringify(serializedOutputScripts));
    //    console.log(JSON.stringify(allKeySets));

    btc.createPaymentTransactionNew_async(
        allTransactions, 
        allKeySets,
        undefined,
        serializedOutputScripts).then(function(result) { 
        
        
            console.log("result :: " + result);
        
        
        }).fail(function(error) {
        console.log("error :: " + error);
    });
    
    
    return;

//    for (var i = 0; i < curAddrDict.account_utxos.length; i++) {
//        curAddrDict.unsignedTX.sign(i, ledgerKey);
//    }
//    
//    // Initialize a private key using WIF
//    var privateKeyWIF = 'L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy'
//    var keyPair = bitcoin.ECPair.fromWIF(privateKeyWIF)
// 
//    // Sign the first input with the new key
//    tx.sign(0, keyPair)
//    
//    console.log("[signing address #" + curAddressIndex + " ]");
//    btc.signTransaction_async("44'/0'/0'/" + curAddrDict.account_id, curAddrDict.unsignedTX).then(function (result) {
//        console.log(result);
//
//        if (curAddressIndex < totalAddresses - 1) {
//            signAddress(btc, curAddressIndex + 1, totalAddresses);
//        } else {
//            console.log("");
//
//            console.log("[complete]");
//        }
//    }).fail(function(err) {
//        console.log("error :: " + err);
//        console.log("[failure in signing address #" + curAddressIndex + ", aborting]");
//    });
}

init();