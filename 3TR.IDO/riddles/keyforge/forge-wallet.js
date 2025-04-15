const ethers = require("ethers");

async function forge() {
  const wallet = ethers.Wallet.createRandom();
  console.log("📜 Seed Phrase:\n", wallet.mnemonic.phrase);
  console.log("🔐 Address: ", wallet.address);
  console.log("🔑 Private Key: ", wallet.privateKey);
}

forge();
