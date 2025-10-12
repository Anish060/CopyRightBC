const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Copyright Contract", function () {
  let Copyright, copyright, owner, addr1;

  beforeEach(async function () {
    // Get factory
    Copyright = await ethers.getContractFactory("Copyright");
    [owner, addr1] = await ethers.getSigners();

    // Deploy once
    copyright = await Copyright.deploy();

    // Wait until deployed
    await copyright.waitForDeployment();
  });

  it("Should register a work successfully", async function () {
    const ipfsHash = "QmTestHash123";

    await copyright.connect(owner).registerWork(ipfsHash);

    const work = await copyright.getWork(ipfsHash);
    expect(work[0]).to.equal(owner.address); // author
    expect(work[1]).to.be.gt(0);             // timestamp > 0
  });

  it("Should not allow duplicate registration", async function () {
    const ipfsHash = "QmTestHash123";
    await copyright.registerWork(ipfsHash);

    await expect(
      copyright.registerWork(ipfsHash)
    ).to.be.revertedWith("Work already registered");
  });

  it("Should allow different users to query works", async function () {
    const ipfsHash = "QmTestHash456";
    await copyright.registerWork(ipfsHash);

    const [author, timestamp] = await copyright.connect(addr1).getWork(ipfsHash);
    expect(author).to.equal(owner.address);
    expect(timestamp).to.be.gt(0);
  });
});
