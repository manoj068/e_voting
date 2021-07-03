pragma solidity ^0.5.16; 

contract e_voting{

 struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(address => string) public store_hash;

    // Keeps track that an address voted
    mapping(address => bool) public voters;
    // Keeps track of candidates
    mapping(uint => Candidate) public candidates;
    // Keeps track of candidates to compare ids
    uint public candidatesCount;

    // voted event
    // event votedEvent (
    //     uint indexed _candidateId
    // );

    constructor() public {
        addCandidate("MR. LEWIS HAMILTON");
        addCandidate("MRS. ANGELA MAX");
        addCandidate("MR. SEBASTIAN VETTEL");

    }

    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId, string memory ip_hash) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that candidate has voted
        voters[msg.sender] = true;

        //store hash of the sender
        store_hash[msg.sender] = ip_hash;

        // update candidate vote counter
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        // emit votedEvent(_candidateId);
    }

    function getHash(address addr) view public returns(string memory){
        return store_hash[addr];
    }

}
