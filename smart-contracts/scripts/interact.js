const hre = require("hardhat");

async function main() {
  // The address of your deployed contract
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 

  // Get the contract factory for your contract
  const ContractFactory = await hre.ethers.getContractFactory("Copyright");

  // Attach to the deployed contract using its address
  const copyright = await ContractFactory.attach(contractAddress);

  console.log("Attached to contract at:", await copyright.getAddress());

  // Example: Call a view function on the contract
  const ipfsHashToQuery = "QmExampleHash123";
  try {
    const [author, timestamp] = await copyright.getWork(ipfsHashToQuery);
    console.log(`Work found! Author: ${author}, Timestamp: ${timestamp}`);
  } catch (error) {
    console.error("Error fetching work:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});