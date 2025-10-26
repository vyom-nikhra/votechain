// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title VotingNFT
 * @dev NFT contract for issuing voting participation badges
 */
contract VotingNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Strings for uint256;

    // Events
    event BadgeMinted(
        address indexed to,
        uint256 indexed tokenId,
        string badgeType,
        uint256 indexed electionId,
        string metadata
    );

    event BadgeRevoked(uint256 indexed tokenId, string reason);

    // Badge types
    enum BadgeType {
        Voter,           // Basic voting participation
        EarlyVoter,      // Voted in first 24 hours
        FirstTimeVoter,  // First time participating
        ActiveParticipant, // Voted in multiple elections
        ElectionCreator, // Created an election
        HighTurnout     // Participated in high-turnout election
    }

    // Structs
    struct Badge {
        BadgeType badgeType;
        uint256 electionId;
        uint256 issuedAt;
        address recipient;
        bool isActive;
        string customMessage;
    }

    // State variables
    uint256 private _tokenIdCounter;
    
    mapping(uint256 => Badge) public badges;
    mapping(address => uint256[]) public userBadges;
    mapping(address => mapping(BadgeType => uint256)) public userBadgeCount;
    mapping(uint256 => string) private _customTokenURIs;
    
    // Voting contract address (only this contract can mint badges)
    address public votingContract;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    modifier onlyVotingContract() {
        require(msg.sender == votingContract || msg.sender == owner(), "Only voting contract or owner");
        _;
    }

    constructor(string memory _name, string memory _symbol, string memory _baseURI) 
        ERC721(_name, _symbol) 
        Ownable(msg.sender)
    {
        _baseTokenURI = _baseURI;
    }

    /**
     * @dev Set the voting contract address
     */
    function setVotingContract(address _votingContract) external onlyOwner {
        votingContract = _votingContract;
    }

    /**
     * @dev Mint a new voting badge
     */
    function mintBadge(
        address _to,
        BadgeType _badgeType,
        uint256 _electionId,
        string memory _customMessage
    ) public onlyVotingContract returns (uint256) {
        require(_to != address(0), "Cannot mint to zero address");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        // Create badge metadata
        Badge memory newBadge = Badge({
            badgeType: _badgeType,
            electionId: _electionId,
            issuedAt: block.timestamp,
            recipient: _to,
            isActive: true,
            customMessage: _customMessage
        });
        
        badges[tokenId] = newBadge;
        userBadges[_to].push(tokenId);
        userBadgeCount[_to][_badgeType]++;
        
        // Mint NFT
        _safeMint(_to, tokenId);
        
        // Set token URI
        _setTokenURI(tokenId, _generateTokenURI(tokenId));
        
        emit BadgeMinted(_to, tokenId, _getBadgeTypeName(_badgeType), _electionId, _customMessage);
        
        return tokenId;
    }

    /**
     * @dev Mint voter badge (most common type)
     */
    function mintVoterBadge(address _to, uint256 _electionId) external onlyVotingContract returns (uint256) {
        return mintBadge(_to, BadgeType.Voter, _electionId, "Thank you for participating in democracy!");
    }

    /**
     * @dev Mint early voter badge
     */
    function mintEarlyVoterBadge(address _to, uint256 _electionId) external onlyVotingContract returns (uint256) {
        return mintBadge(_to, BadgeType.EarlyVoter, _electionId, "Early bird voter! You help set the momentum.");
    }

    /**
     * @dev Mint first time voter badge
     */
    function mintFirstTimeVoterBadge(address _to, uint256 _electionId) external onlyVotingContract returns (uint256) {
        return mintBadge(_to, BadgeType.FirstTimeVoter, _electionId, "Welcome to democratic participation!");
    }

    /**
     * @dev Mint active participant badge
     */
    function mintActiveParticipantBadge(address _to, uint256 _electionId) external onlyVotingContract returns (uint256) {
        return mintBadge(_to, BadgeType.ActiveParticipant, _electionId, "Dedicated democratic participant!");
    }

    /**
     * @dev Revoke a badge (mark as inactive)
     */
    function revokeBadge(uint256 _tokenId, string memory _reason) external onlyOwner {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        
        badges[_tokenId].isActive = false;
        
        emit BadgeRevoked(_tokenId, _reason);
    }

    /**
     * @dev Get badge details
     */
    function getBadge(uint256 _tokenId) external view returns (Badge memory) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        return badges[_tokenId];
    }

    /**
     * @dev Get all badges owned by user
     */
    function getUserBadges(address _user) external view returns (uint256[] memory) {
        return userBadges[_user];
    }

    /**
     * @dev Get user badge count by type
     */
    function getUserBadgeCount(address _user, BadgeType _badgeType) external view returns (uint256) {
        return userBadgeCount[_user][_badgeType];
    }

    /**
     * @dev Get total supply of badges
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Check if user has specific badge type
     */
    function hasBadgeType(address _user, BadgeType _badgeType) external view returns (bool) {
        return userBadgeCount[_user][_badgeType] > 0;
    }

    /**
     * @dev Set base URI for metadata
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        _baseTokenURI = _baseURI;
    }

    /**
     * @dev Generate token URI with metadata
     */
    function _generateTokenURI(uint256 _tokenId) internal view returns (string memory) {
        Badge memory badge = badges[_tokenId];
        
        string memory badgeName = _getBadgeTypeName(badge.badgeType);
        string memory description = string(abi.encodePacked(
            "Voting participation badge for ",
            badgeName,
            " in election #",
            badge.electionId.toString(),
            ". ",
            badge.customMessage
        ));
        
        // Create JSON metadata
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        badgeName,
                        ' Badge #',
                        _tokenId.toString(),
                        '", "description": "',
                        description,
                        '", "image": "',
                        _baseTokenURI,
                        _getBadgeTypeImage(badge.badgeType),
                        '", "attributes": [',
                        '{"trait_type": "Badge Type", "value": "',
                        badgeName,
                        '"}, ',
                        '{"trait_type": "Election ID", "value": "',
                        badge.electionId.toString(),
                        '"}, ',
                        '{"trait_type": "Issued At", "value": "',
                        badge.issuedAt.toString(),
                        '"}, ',
                        '{"trait_type": "Status", "value": "',
                        badge.isActive ? "Active" : "Revoked",
                        '"}',
                        ']}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /**
     * @dev Get badge type name
     */
    function _getBadgeTypeName(BadgeType _badgeType) internal pure returns (string memory) {
        if (_badgeType == BadgeType.Voter) return "Voter";
        if (_badgeType == BadgeType.EarlyVoter) return "Early Voter";
        if (_badgeType == BadgeType.FirstTimeVoter) return "First Time Voter";
        if (_badgeType == BadgeType.ActiveParticipant) return "Active Participant";
        if (_badgeType == BadgeType.ElectionCreator) return "Election Creator";
        if (_badgeType == BadgeType.HighTurnout) return "High Turnout Participant";
        return "Unknown";
    }

    /**
     * @dev Get badge type image filename
     */
    function _getBadgeTypeImage(BadgeType _badgeType) internal pure returns (string memory) {
        if (_badgeType == BadgeType.Voter) return "voter-badge.svg";
        if (_badgeType == BadgeType.EarlyVoter) return "early-voter-badge.svg";
        if (_badgeType == BadgeType.FirstTimeVoter) return "first-time-voter-badge.svg";
        if (_badgeType == BadgeType.ActiveParticipant) return "active-participant-badge.svg";
        if (_badgeType == BadgeType.ElectionCreator) return "election-creator-badge.svg";
        if (_badgeType == BadgeType.HighTurnout) return "high-turnout-badge.svg";
        return "default-badge.svg";
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Prevent transfers of revoked badges
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) { // Not minting or burning
            require(badges[tokenId].isActive, "Cannot transfer revoked badge");
        }
        return super._update(to, tokenId, auth);
    }
}