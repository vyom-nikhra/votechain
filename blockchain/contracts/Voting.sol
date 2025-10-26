// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title Voting
 * @dev Smart contract for decentralized student voting system with multiple voting types
 */
contract Voting is ReentrancyGuard, Ownable, Pausable {

    // Events
    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        address indexed creator,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed electionId,
        address indexed voter,
        bytes32 voteHash,
        VoteType voteType
    );
    
    event ElectionFinalized(
        uint256 indexed electionId,
        uint256 totalVotes,
        uint256 winnerCandidateId
    );
    
    event ZKProofVerified(
        uint256 indexed electionId,
        address indexed voter,
        bytes32 nullifierHash
    );

    // Enums
    enum VoteType { Simple, Ranked, Quadratic }
    enum ElectionStatus { Active, Paused, Finalized, Cancelled }

    // Structs
    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 voteCount;
        uint256 quadraticScore;
    }

    struct RankedVote {
        uint256 candidateId;
        uint256 rank;
    }

    struct QuadraticAllocation {
        uint256 candidateId;
        uint256 credits;
        uint256 votes; // sqrt(credits)
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        address creator;
        Candidate[] candidates;
        VoteType voteType;
        uint256 startTime;
        uint256 endTime;
        uint256 totalVotes;
        uint256 maxQuadraticCredits;
        bool requiresZKProof;
        bytes32 merkleRoot; // For eligibility verification
        ElectionStatus status;
        mapping(address => bool) hasVoted;
        mapping(bytes32 => bool) nullifierUsed; // For ZK proofs
        mapping(uint256 => uint256[]) candidateRankings; // candidateId => ranks received
        bool isFinalized;
        uint256 winnerCandidateId;
    }

    struct Vote {
        address voter;
        uint256 electionId;
        VoteType voteType;
        bytes32 voteHash;
        bytes32 nullifierHash;
        uint256 timestamp;
        bool isValid;
    }

    // State variables
    uint256 private _electionIds;
    uint256 private _voteIds;
    
    mapping(uint256 => Election) public elections;
    mapping(uint256 => Vote) public votes;
    mapping(address => uint256[]) public voterHistory;
    
    // ZK Proof verification contract address
    address public zkVerifierContract;
    
    // Modifiers
    modifier electionExists(uint256 _electionId) {
        require(_electionId > 0 && _electionId <= _electionIds, "Election does not exist");
        _;
    }
    
    modifier electionActive(uint256 _electionId) {
        Election storage election = elections[_electionId];
        require(election.status == ElectionStatus.Active, "Election not active");
        require(block.timestamp >= election.startTime, "Election not started");
        require(block.timestamp <= election.endTime, "Election ended");
        _;
    }
    
    modifier hasNotVoted(uint256 _electionId) {
        require(!elections[_electionId].hasVoted[msg.sender], "Already voted");
        _;
    }
    
    modifier onlyElectionCreator(uint256 _electionId) {
        require(elections[_electionId].creator == msg.sender, "Not election creator");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new election
     */
    function createElection(
        string memory _title,
        string memory _description,
        string[] memory _candidateNames,
        string[] memory _candidateDescriptions,
        VoteType _voteType,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxQuadraticCredits,
        bool _requiresZKProof,
        bytes32 _merkleRoot
    ) external whenNotPaused returns (uint256) {
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_candidateNames.length >= 2, "At least 2 candidates required");
        require(_candidateNames.length == _candidateDescriptions.length, "Names and descriptions length mismatch");
        
        _electionIds++;
        uint256 newElectionId = _electionIds;
        
        Election storage newElection = elections[newElectionId];
        newElection.id = newElectionId;
        newElection.title = _title;
        newElection.description = _description;
        newElection.creator = msg.sender;
        newElection.voteType = _voteType;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.maxQuadraticCredits = _maxQuadraticCredits;
        newElection.requiresZKProof = _requiresZKProof;
        newElection.merkleRoot = _merkleRoot;
        newElection.status = ElectionStatus.Active;
        
        // Add candidates
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            newElection.candidates.push(Candidate({
                id: i,
                name: _candidateNames[i],
                description: _candidateDescriptions[i],
                voteCount: 0,
                quadraticScore: 0
            }));
        }
        
        emit ElectionCreated(newElectionId, _title, msg.sender, _startTime, _endTime);
        return newElectionId;
    }

    /**
     * @dev Cast a simple vote
     */
    function castSimpleVote(
        uint256 _electionId,
        uint256 _candidateId,
        bytes32[] memory _merkleProof,
        bytes32 _nullifierHash,
        uint256[2] memory _zkProofA,
        uint256[2][2] memory _zkProofB,
        uint256[2] memory _zkProofC,
        uint256[] memory _zkPublicSignals
    ) external 
        nonReentrant 
        whenNotPaused 
        electionExists(_electionId) 
        electionActive(_electionId) 
        hasNotVoted(_electionId) 
    {
        Election storage election = elections[_electionId];
        require(_candidateId < election.candidates.length, "Invalid candidate ID");
        require(election.voteType == VoteType.Simple, "Not a simple voting election");
        
        // Verify eligibility using Merkle proof
        if (election.merkleRoot != bytes32(0)) {
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            require(MerkleProof.verify(_merkleProof, election.merkleRoot, leaf), "Not eligible to vote");
        }
        
        // Verify ZK proof if required
        if (election.requiresZKProof) {
            require(zkVerifierContract != address(0), "ZK verifier not set");
            require(!election.nullifierUsed[_nullifierHash], "Nullifier already used");
            
            // Verify ZK proof (placeholder - would call actual verifier)
            require(_verifyZKProof(_zkProofA, _zkProofB, _zkProofC, _zkPublicSignals), "Invalid ZK proof");
            
            election.nullifierUsed[_nullifierHash] = true;
            emit ZKProofVerified(_electionId, msg.sender, _nullifierHash);
        }
        
        // Cast vote
        election.candidates[_candidateId].voteCount++;
        election.totalVotes++;
        election.hasVoted[msg.sender] = true;
        
        // Record vote
        _voteIds++;
        uint256 voteId = _voteIds;
        bytes32 voteHash = keccak256(abi.encodePacked(_electionId, _candidateId, msg.sender, block.timestamp));
        
        votes[voteId] = Vote({
            voter: msg.sender,
            electionId: _electionId,
            voteType: VoteType.Simple,
            voteHash: voteHash,
            nullifierHash: _nullifierHash,
            timestamp: block.timestamp,
            isValid: true
        });
        
        voterHistory[msg.sender].push(voteId);
        
        emit VoteCast(_electionId, msg.sender, voteHash, VoteType.Simple);
    }

    /**
     * @dev Cast a ranked choice vote
     */
    function castRankedVote(
        uint256 _electionId,
        RankedVote[] memory _rankings,
        bytes32[] memory _merkleProof,
        bytes32 _nullifierHash,
        uint256[2] memory _zkProofA,
        uint256[2][2] memory _zkProofB,
        uint256[2] memory _zkProofC,
        uint256[] memory _zkPublicSignals
    ) external 
        nonReentrant 
        whenNotPaused 
        electionExists(_electionId) 
        electionActive(_electionId) 
        hasNotVoted(_electionId) 
    {
        Election storage election = elections[_electionId];
        require(election.voteType == VoteType.Ranked, "Not a ranked voting election");
        require(_rankings.length > 0, "Must provide rankings");
        require(_rankings.length <= election.candidates.length, "Too many rankings");
        
        // Verify eligibility
        if (election.merkleRoot != bytes32(0)) {
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            require(MerkleProof.verify(_merkleProof, election.merkleRoot, leaf), "Not eligible to vote");
        }
        
        // Verify ZK proof if required
        if (election.requiresZKProof) {
            require(!election.nullifierUsed[_nullifierHash], "Nullifier already used");
            require(_verifyZKProof(_zkProofA, _zkProofB, _zkProofC, _zkPublicSignals), "Invalid ZK proof");
            election.nullifierUsed[_nullifierHash] = true;
        }
        
        // Validate rankings (no duplicates, valid candidates, valid ranks)
        bool[] memory candidateRanked = new bool[](election.candidates.length);
        for (uint256 i = 0; i < _rankings.length; i++) {
            require(_rankings[i].candidateId < election.candidates.length, "Invalid candidate ID");
            require(_rankings[i].rank > 0 && _rankings[i].rank <= _rankings.length, "Invalid rank");
            require(!candidateRanked[_rankings[i].candidateId], "Duplicate candidate ranking");
            candidateRanked[_rankings[i].candidateId] = true;
            
            // Store ranking for candidate
            election.candidateRankings[_rankings[i].candidateId].push(_rankings[i].rank);
        }
        
        election.totalVotes++;
        election.hasVoted[msg.sender] = true;
        
        // Record vote
        _voteIds++;
        uint256 voteId = _voteIds;
        bytes32 voteHash = keccak256(abi.encode(_electionId, _rankings, msg.sender, block.timestamp));
        
        votes[voteId] = Vote({
            voter: msg.sender,
            electionId: _electionId,
            voteType: VoteType.Ranked,
            voteHash: voteHash,
            nullifierHash: _nullifierHash,
            timestamp: block.timestamp,
            isValid: true
        });
        
        voterHistory[msg.sender].push(voteId);
        
        emit VoteCast(_electionId, msg.sender, voteHash, VoteType.Ranked);
    }

    /**
     * @dev Cast a quadratic vote
     */
    function castQuadraticVote(
        uint256 _electionId,
        QuadraticAllocation[] memory _allocations,
        bytes32[] memory _merkleProof,
        bytes32 _nullifierHash,
        uint256[2] memory _zkProofA,
        uint256[2][2] memory _zkProofB,
        uint256[2] memory _zkProofC,
        uint256[] memory _zkPublicSignals
    ) external 
        nonReentrant 
        whenNotPaused 
        electionExists(_electionId) 
        electionActive(_electionId) 
        hasNotVoted(_electionId) 
    {
        Election storage election = elections[_electionId];
        require(election.voteType == VoteType.Quadratic, "Not a quadratic voting election");
        require(_allocations.length > 0, "Must provide allocations");
        
        // Verify eligibility
        if (election.merkleRoot != bytes32(0)) {
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            require(MerkleProof.verify(_merkleProof, election.merkleRoot, leaf), "Not eligible to vote");
        }
        
        // Verify ZK proof if required
        if (election.requiresZKProof) {
            require(!election.nullifierUsed[_nullifierHash], "Nullifier already used");
            require(_verifyZKProof(_zkProofA, _zkProofB, _zkProofC, _zkPublicSignals), "Invalid ZK proof");
            election.nullifierUsed[_nullifierHash] = true;
        }
        
        uint256 totalCredits = 0;
        bool[] memory candidateAllocated = new bool[](election.candidates.length);
        
        for (uint256 i = 0; i < _allocations.length; i++) {
            require(_allocations[i].candidateId < election.candidates.length, "Invalid candidate ID");
            require(!candidateAllocated[_allocations[i].candidateId], "Duplicate candidate allocation");
            require(_allocations[i].credits > 0, "Credits must be positive");
            
            candidateAllocated[_allocations[i].candidateId] = true;
            totalCredits += _allocations[i].credits;
            
            // Calculate votes as square root of credits (simplified)
            uint256 voteCount = _sqrt(_allocations[i].credits);
            election.candidates[_allocations[i].candidateId].quadraticScore += voteCount;
        }
        
        require(totalCredits <= election.maxQuadraticCredits, "Exceeds maximum credits");
        
        election.totalVotes++;
        election.hasVoted[msg.sender] = true;
        
        // Record vote
        _voteIds++;
        uint256 voteId = _voteIds;
        bytes32 voteHash = keccak256(abi.encode(_electionId, _allocations, msg.sender, block.timestamp));
        
        votes[voteId] = Vote({
            voter: msg.sender,
            electionId: _electionId,
            voteType: VoteType.Quadratic,
            voteHash: voteHash,
            nullifierHash: _nullifierHash,
            timestamp: block.timestamp,
            isValid: true
        });
        
        voterHistory[msg.sender].push(voteId);
        
        emit VoteCast(_electionId, msg.sender, voteHash, VoteType.Quadratic);
    }

    /**
     * @dev Finalize election and determine winner
     */
    function finalizeElection(uint256 _electionId) 
        external 
        electionExists(_electionId) 
        onlyElectionCreator(_electionId) 
    {
        Election storage election = elections[_electionId];
        require(block.timestamp > election.endTime, "Election still active");
        require(!election.isFinalized, "Election already finalized");
        
        uint256 winnerCandidateId = 0;
        uint256 maxVotes = 0;
        
        if (election.voteType == VoteType.Simple) {
            // Simple plurality winner
            for (uint256 i = 0; i < election.candidates.length; i++) {
                if (election.candidates[i].voteCount > maxVotes) {
                    maxVotes = election.candidates[i].voteCount;
                    winnerCandidateId = i;
                }
            }
        } else if (election.voteType == VoteType.Quadratic) {
            // Highest quadratic score wins
            for (uint256 i = 0; i < election.candidates.length; i++) {
                if (election.candidates[i].quadraticScore > maxVotes) {
                    maxVotes = election.candidates[i].quadraticScore;
                    winnerCandidateId = i;
                }
            }
        } else if (election.voteType == VoteType.Ranked) {
            // Simplified ranked choice - candidate with most #1 ranks wins
            // In production, implement instant runoff voting
            winnerCandidateId = _calculateRankedWinner(_electionId);
        }
        
        election.isFinalized = true;
        election.winnerCandidateId = winnerCandidateId;
        election.status = ElectionStatus.Finalized;
        
        emit ElectionFinalized(_electionId, election.totalVotes, winnerCandidateId);
    }

    /**
     * @dev Get election details
     */
    function getElection(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId) 
        returns (
            uint256 id,
            string memory title,
            address creator,
            VoteType voteType,
            uint256 startTime,
            uint256 endTime,
            uint256 totalVotes,
            ElectionStatus status,
            bool isFinalized,
            uint256 winnerCandidateId
        ) 
    {
        Election storage election = elections[_electionId];
        return (
            election.id,
            election.title,
            election.creator,
            election.voteType,
            election.startTime,
            election.endTime,
            election.totalVotes,
            election.status,
            election.isFinalized,
            election.winnerCandidateId
        );
    }

    /**
     * @dev Get election candidates
     */
    function getElectionCandidates(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId) 
        returns (Candidate[] memory) 
    {
        return elections[_electionId].candidates;
    }

    /**
     * @dev Get voter's voting history
     */
    function getVoterHistory(address _voter) external view returns (uint256[] memory) {
        return voterHistory[_voter];
    }

    /**
     * @dev Check if address has voted in election
     */
    function hasVotedInElection(uint256 _electionId, address _voter) 
        external 
        view 
        electionExists(_electionId) 
        returns (bool) 
    {
        return elections[_electionId].hasVoted[_voter];
    }

    /**
     * @dev Get current election count
     */
    function getElectionCount() external view returns (uint256) {
        return _electionIds;
    }

    /**
     * @dev Set ZK verifier contract address (only owner)
     */
    function setZKVerifierContract(address _zkVerifierContract) external onlyOwner {
        zkVerifierContract = _zkVerifierContract;
    }

    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // Internal functions
    
    /**
     * @dev Verify ZK proof (placeholder implementation)
     */
    function _verifyZKProof(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[] memory _publicSignals
    ) internal pure returns (bool) {
        // Placeholder - in production would call ZK verifier contract
        return _a.length == 2 && _b.length == 2 && _c.length == 2 && _publicSignals.length > 0;
    }

    /**
     * @dev Calculate winner for ranked choice election
     */
    function _calculateRankedWinner(uint256 _electionId) internal view returns (uint256) {
        Election storage election = elections[_electionId];
        uint256 winnerCandidateId = 0;
        uint256 maxFirstRankVotes = 0;
        
        // Count #1 rank votes for each candidate
        for (uint256 i = 0; i < election.candidates.length; i++) {
            uint256 firstRankVotes = 0;
            uint256[] memory rankings = election.candidateRankings[i];
            
            for (uint256 j = 0; j < rankings.length; j++) {
                if (rankings[j] == 1) {
                    firstRankVotes++;
                }
            }
            
            if (firstRankVotes > maxFirstRankVotes) {
                maxFirstRankVotes = firstRankVotes;
                winnerCandidateId = i;
            }
        }
        
        return winnerCandidateId;
    }

    /**
     * @dev Calculate square root (simplified implementation)
     */
    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        
        return y;
    }
}