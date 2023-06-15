// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract HelloWorld {
    //state var - stored in ETH Blockchain
    uint256 myUnsignedInteger = 100;

    //not negative var
    uint256 public myUnsignedInteger2 = 100;
    uint256 public x = 5**2;

    struct Zombie {
        string name;
        uint256 dna;
    }
    Zombie[] public zombies;
    // another fixed Array, can contain 5 strings:
    string[5] stringArray;

    //memory. This is required for all reference types such as arrays, structs, mappings, and strings.
    function eatHamburgers(string memory _name, uint256 _amount) public {
        Zombie memory satoshi = Zombie(_name, _amount);
        zombies.push(satoshi);
        zombies.push(Zombie("Vitalik", 16));
    }

    string greeting = "What's up dog";

    function sayHello() public view returns (string memory) {
        return greeting;
    }

    //As you can see, we use the keyword private after the function name. And as with function parameters, it's convention to start private function names with an underscore (_).

    //pure functions, which means you're not even accessing any data in the app
    function _generateRandomDna(string memory _str) private view returns (uint) {
        uint rand = uint(keccak256(abi.encodePacked(_str)));
        return rand % dnaModulus;
    }
    
    //Events are a way for your contract to communicate that something happened on the blockchain to your app front-end, which can be 'listening' for certain events and take action when they happen.
    

}
