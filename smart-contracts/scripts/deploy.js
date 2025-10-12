const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("Copyright");

  console.log("Deploying contract...");
  const copyright = await Contract.deploy();      // deploys

  await copyright.waitForDeployment();            // wait until mined

  console.log(`Contract deployed to: ${await copyright.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
