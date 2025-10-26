import { ethers, upgrades } from "hardhat";
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("Starting deployment of Student Voting System contracts...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  // Deploy ZK Verifier first
  console.log("\n1. Deploying ZK Verifier...");
  const ZKVerifier = await ethers.getContractFactory("ZKVerifier");
  const zkVerifier = await ZKVerifier.deploy();
  await zkVerifier.waitForDeployment();
  const zkVerifierAddress = await zkVerifier.getAddress();
  console.log("✅ ZKVerifier deployed to:", zkVerifierAddress);

  // Deploy Voting NFT contract
  console.log("\n2. Deploying Voting NFT...");
  const VotingNFT = await ethers.getContractFactory("VotingNFT");
  const votingNFT = await VotingNFT.deploy(
    "Student Voting Badges", 
    "SVB",
    "https://voting-system-api.com/metadata/" // Base URI for metadata
  );
  await votingNFT.waitForDeployment();
  const votingNFTAddress = await votingNFT.getAddress();
  console.log("✅ VotingNFT deployed to:", votingNFTAddress);

  // Deploy main Voting contract
  console.log("\n3. Deploying main Voting contract...");
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();
  const votingAddress = await voting.getAddress();
  console.log("✅ Voting contract deployed to:", votingAddress);

  // Configure contract relationships
  console.log("\n4. Configuring contract relationships...");
  
  // Set ZK Verifier in Voting contract
  console.log("Setting ZK Verifier in Voting contract...");
  const setZKVerifierTx = await voting.setZKVerifierContract(zkVerifierAddress);
  await setZKVerifierTx.wait();
  console.log("✅ ZK Verifier set in Voting contract");

  // Set Voting contract in NFT contract
  console.log("Setting Voting contract in NFT contract...");
  const setVotingContractTx = await votingNFT.setVotingContract(votingAddress);
  await setVotingContractTx.wait();
  console.log("✅ Voting contract set in NFT contract");

  // Verify deployments
  console.log("\n5. Verifying deployments...");
  
  // Test Voting contract
  const electionCount = await voting.getElectionCount();
  console.log("Initial election count:", electionCount.toString());
  
  // Test NFT contract
  const nftName = await votingNFT.name();
  const nftSymbol = await votingNFT.symbol();
  console.log(`NFT Contract: ${nftName} (${nftSymbol})`);
  
  // Test ZK Verifier
  const zkOwner = await zkVerifier.owner();
  console.log("ZK Verifier owner:", zkOwner);

  // Create a test election (optional - for testing)
  if (process.env.CREATE_TEST_ELECTION === "true") {
    console.log("\n6. Creating test election...");
    
    const candidateNames = ["Alice Johnson", "Bob Smith", "Carol Davis"];
    const candidateDescriptions = [
      "Experienced student leader focused on campus sustainability",
      "Tech enthusiast advocating for digital innovation in education", 
      "Community organizer working on student welfare initiatives"
    ];
    
    const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const endTime = startTime + 86400; // 24 hours duration
    
    const createElectionTx = await voting.createElection(
      "Student Council President Election 2025",
      "Annual election for student council president position",
      candidateNames,
      candidateDescriptions,
      0, // VoteType.Simple
      startTime,
      endTime,
      100, // maxQuadraticCredits
      false, // requiresZKProof
      ethers.ZeroHash // merkleRoot (no restrictions)
    );
    
    const receipt = await createElectionTx.wait();
    const electionId = receipt.logs[0]?.args?.electionId || 1;
    console.log("✅ Test election created with ID:", electionId.toString());
  }

  // Output deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("Contract Addresses:");
  console.log("├─ Voting Contract:    ", votingAddress);
  console.log("├─ VotingNFT Contract: ", votingNFTAddress);
  console.log("└─ ZKVerifier Contract:", zkVerifierAddress);
  console.log("");
  console.log("Network:", (await deployer.provider.getNetwork()).name);
  console.log("Chain ID:", (await deployer.provider.getNetwork()).chainId);
  console.log("");
  console.log("Next steps:");
  console.log("1. Update backend/.env with contract addresses");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Verify contracts on PolygonScan (if on testnet)");
  console.log("4. Set up IPFS metadata endpoint");
  console.log("=".repeat(60));

  // Save addresses to file for easy access
  const deploymentInfo = {
    network: (await deployer.provider.getNetwork()).name,
    chainId: Number((await deployer.provider.getNetwork()).chainId),
    contracts: {
      Voting: votingAddress,
      VotingNFT: votingNFTAddress,
      ZKVerifier: zkVerifierAddress
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await deployer.provider.getBlockNumber()
  };

  // Write deployment info to file
  
  const deploymentPath = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }
  
  const filename = `deployment-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentPath, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`📄 Deployment info saved to: deployments/${filename}`);
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });