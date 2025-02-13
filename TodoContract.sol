// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoContract {
    struct Task {
        bytes32 taskHash;
        address owner;
        bool completed;
        uint256 completedAt;
    }

    mapping(bytes32 => Task) public tasks;

    event TaskVerified(bytes32 indexed taskHash, address indexed owner, uint256 timestamp);

    function verifyTask(bytes32 taskHash) public {
        require(!tasks[taskHash].completed, "Task already verified");

        tasks[taskHash] = Task({
            taskHash: taskHash,
            owner: msg.sender,
            completed: true,
            completedAt: block.timestamp
        });

        emit TaskVerified(taskHash, msg.sender, block.timestamp);
    }

    function isTaskVerified(bytes32 taskHash) public view returns (bool) {
        return tasks[taskHash].completed;
    }

    function getTaskDetails(bytes32 taskHash) public view returns (Task memory) {
        return tasks[taskHash];
    }
}
