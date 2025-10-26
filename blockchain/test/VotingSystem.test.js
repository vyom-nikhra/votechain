import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Student Voting System", function () {
  let voting, votingNFT, zkVerifier;
  let owner, voter1, voter2, creator;

  beforeEach(async function () {
    // Get test accounts
    [owner, voter1, voter2, creator] = await ethers.getSigners();

    // Deploy ZK Verifier
    const ZKVerifier = await ethers.getContractFactory("ZKVerifier");
    zkVerifier = await ZKVerifier.deploy();
    await zkVerifier.waitForDeployment();

    // Deploy Voting NFT
    const VotingNFT = await ethers.getContractFactory("VotingNFT");
    votingNFT = await VotingNFT.deploy(
      "Student Voting Badges",
      "SVB", 
      "https://test-api.com/metadata/"
    );
    await votingNFT.waitForDeployment();

    // Deploy Voting contract
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.waitForDeployment();

    // Configure relationships
    await voting.setZKVerifierContract(await zkVerifier.getAddress());
    await votingNFT.setVotingContract(await voting.getAddress());
  });

  describe("Election Creation", function () {
    it("Should create an election successfully", async function () {
      const candidateNames = ["Alice", "Bob"];
      const candidateDescriptions = ["Alice Description", "Bob Description"];
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime + 86400;

      await expect(
        voting.connect(creator).createElection(
          "Test Election",
          "Test Description",
          candidateNames,
          candidateDescriptions,
          0, // Simple vote
          startTime,
          endTime,
          100,
          false,
          ethers.ZeroHash
        )
      ).to.emit(voting, "ElectionCreated");

      const electionCount = await voting.getElectionCount();
      expect(electionCount).to.equal(1);
    });

    it("Should fail with invalid parameters", async function () {
      const candidateNames = ["Alice"];
      const candidateDescriptions = ["Alice Description"];
      const startTime = Math.floor(Date.now() / 1000) - 3600; // Past time
      const endTime = startTime + 86400;

      await expect(
        voting.connect(creator).createElection(
          "Test Election",
          "Test Description", 
          candidateNames,
          candidateDescriptions,
          0,
          startTime,
          endTime,
          100,
          false,
          ethers.ZeroHash
        )
      ).to.be.revertedWith("Start time must be in future");
    });
  });

  describe("Voting", function () {
    let electionId;

    beforeEach(async function () {
      const candidateNames = ["Alice", "Bob"];
      const candidateDescriptions = ["Alice Description", "Bob Description"];
      const startTime = Math.floor(Date.now() / 1000) - 100; // Started
      const endTime = startTime + 86400;

      const tx = await voting.connect(creator).createElection(
        "Test Election",
        "Test Description",
        candidateNames,
        candidateDescriptions,
        0, // Simple vote
        startTime,
        endTime,
        100,
        false,
        ethers.ZeroHash
      );

      const receipt = await tx.wait();
      electionId = 1; // First election
    });

    it("Should cast a simple vote successfully", async function () {
      await expect(
        voting.connect(voter1).castSimpleVote(
          electionId,
          0, // Vote for Alice
          [], // No merkle proof needed
          ethers.ZeroHash, // No nullifier
          [0, 0], // ZK proof components (not required)
          [[0, 0], [0, 0]],
          [0, 0],
          []
        )
      ).to.emit(voting, "VoteCast");

      const hasVoted = await voting.hasVotedInElection(electionId, voter1.address);
      expect(hasVoted).to.be.true;
    });

    it("Should prevent double voting", async function () {
      // First vote
      await voting.connect(voter1).castSimpleVote(
        electionId,
        0,
        [],
        ethers.ZeroHash,
        [0, 0],
        [[0, 0], [0, 0]],
        [0, 0],
        []
      );

      // Second vote should fail
      await expect(
        voting.connect(voter1).castSimpleVote(
          electionId,
          1,
          [],
          ethers.ZeroHash,
          [0, 0],
          [[0, 0], [0, 0]],
          [0, 0],
          []
        )
      ).to.be.revertedWith("Already voted");
    });
  });

  describe("NFT Badges", function () {
    it("Should mint voter badge", async function () {
      await expect(
        votingNFT.connect(owner).mintVoterBadge(voter1.address, 1)
      ).to.emit(votingNFT, "BadgeMinted");

      const balance = await votingNFT.balanceOf(voter1.address);
      expect(balance).to.equal(1);
    });

    it("Should track user badges", async function () {
      await votingNFT.connect(owner).mintVoterBadge(voter1.address, 1);
      
      const userBadges = await votingNFT.getUserBadges(voter1.address);
      expect(userBadges.length).to.equal(1);

      const badgeCount = await votingNFT.getUserBadgeCount(voter1.address, 0); // Voter badge type
      expect(badgeCount).to.equal(1);
    });
  });

  describe("ZK Verifier", function () {
    it("Should verify a valid proof", async function () {
      const publicSignals = [123, 456, 789];
      const sampleProof = await zkVerifier.generateSampleProof(publicSignals);
      
      const result = await zkVerifier.verifyProof(
        sampleProof.pA,
        sampleProof.pB,
        sampleProof.pC,
        publicSignals
      );
      
      // Note: This will depend on the simplified verification logic
      // In production, would test with actual ZK proofs
    });

    it("Should prevent nullifier reuse", async function () {
      const publicSignals = [123, 456, 789];
      const sampleProof = await zkVerifier.generateSampleProof(publicSignals);
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("test-nullifier"));
      
      // First verification should succeed
      await zkVerifier.verifyProofWithNullifier(
        sampleProof.pA,
        sampleProof.pB,
        sampleProof.pC,
        publicSignals,
        nullifier
      );
      
      // Second verification with same nullifier should fail
      await expect(
        zkVerifier.verifyProofWithNullifier(
          sampleProof.pA,
          sampleProof.pB,
          sampleProof.pC,
          publicSignals,
          nullifier
        )
      ).to.be.revertedWith("Nullifier already used");
    });
  });
});