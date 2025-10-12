// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Copyright {
    struct Work {
        address author;
        string ipfsHash;
        uint256 timestamp;
    }

    mapping(string => Work) public works;

    event WorkRegistered(address indexed author, string ipfsHash, uint256 timestamp);

    function registerWork(string memory ipfsHash) public {
        require(works[ipfsHash].timestamp == 0, "Work already registered");

        works[ipfsHash] = Work(msg.sender, ipfsHash, block.timestamp);

        emit WorkRegistered(msg.sender, ipfsHash, block.timestamp);
    }

    function getWork(string memory ipfsHash) public view returns (address, uint256) {
        require(works[ipfsHash].timestamp != 0, "Work not found");
        Work memory w = works[ipfsHash];
        return (w.author, w.timestamp);
    }
}
