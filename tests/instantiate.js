require('dotenv').config({ path: '.env.test' });
const Stellar = require('@stellar/stellar-sdk');

async function instantiate() {
    console.log("🏗️  INITIATING SURGICAL XDR DEPLOYMENT...");

    const secret = process.env.TEST_SECRET_KEY;
    const wasmHash = "2cd3b86c921c07f200cfe8b56622c5ab2e3036b15e4c9e29579bb1b92a33dbda"; 
    const pair = Stellar.Keypair.fromSecret(secret);
    
    const rpc = new Stellar.rpc.Server("https://soroban-testnet.stellar.org");

    try {
        const horizon = new Stellar.Horizon.Server("https://horizon-testnet.stellar.org");
        const account = await horizon.loadAccount(pair.publicKey());
        console.log("👤 PILOT VERIFIED: " + pair.publicKey());

        // --- THE SURGICAL FIX: MANUAL XDR PACKING ---
        const address = new Stellar.Address(pair.publicKey());
        
        // Build the Salt by passing 32 bytes of zeros directly into the Uint256 E-Network
        const saltBuffer = Buffer.alloc(32);
        const saltXdr = Stellar.xdr.Uint256.fromXDR(saltBuffer);

        const op = Stellar.Operation.invokeHostFunction({
            func: Stellar.xdr.HostFunction.hostFunctionTypeCreateContract(
                new Stellar.xdr.CreateContractArgs({
                    contractIdPreimage: Stellar.xdr.ContractIdPreimage.contractIdPreimageFromAddress(
                        new Stellar.xdr.ContractIdPreimageFromAddress({
                            address: address.toScAddress(),
                            salt: saltXdr
                        })
                    ),
                    executable: Stellar.xdr.ContractExecutable.contractExecutableWasm(
                        Buffer.from(wasmHash, "hex")
                    )
                })
            )
        });

        const tx = new Stellar.TransactionBuilder(account, { 
            networkPassphrase: Stellar.Networks.TESTNET,
            fee: "90000" // Priority for Bazaar Founder
        })
        .addOperation(op)
        .setTimeout(30)
        .build();

        console.log("🔮 SIMULATING BIRTH OF BAZAAR...");
        const preparedTx = await rpc.prepareTransaction(tx);
        preparedTx.sign(pair);
        
        console.log("📡 TRANSMITTING TO LEDGER...");
        const response = await rpc.sendTransaction(preparedTx);
        
        if (response.status === "SUCCESS" || response.status === "PENDING") {
            console.log("✅ BAZAAR INSTANTIATED!");
            console.log("📝 TX HASH:", response.hash);
            console.log("-------------------------------------------");
            console.log("🚀 PROJECT BAZAAR IS LIVE.");
        }
    } catch (e) {
        console.error("❌ CONSTRUCTION FAILED.");
        console.log("DIAGNOSTIC REASON:", e.message);
    }
}

instantiate();
