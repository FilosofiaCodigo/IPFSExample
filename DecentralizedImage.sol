// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

contract DecentralizedImage
{
    string public image_ipfs_hash;

    function setImage(string memory ipfs_path) public
    {
        image_ipfs_hash = ipfs_path;
    }
}