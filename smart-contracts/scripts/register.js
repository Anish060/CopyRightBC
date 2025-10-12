const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  const ContractFactory = await hre.ethers.getContractFactory("Copyright");
  const copyright = await ContractFactory.attach(contractAddress);

  // Register a new work with a specific IPFS hash
  const ipfsHashToRegister = "QmExampleHash123";
  console.log(`Registering work with IPFS hash: ${ipfsHashToRegister}`);
  const tx = await copyright.registerWork(ipfsHashToRegister);
  await tx.wait(); // Wait for the transaction to be mined
  console.log("Work registered successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});