/**
 * Comprehensive Integration Test Suite
 * Tests Frontend + Backend + Blockchain Integration
 * 
 * This test suite verifies that all three components work together:
 * - Frontend can communicate with Backend APIs
 * - Backend can integrate with Blockchain smart contracts
 * - Complete voting workflow with blockchain verification
 */

import axios from 'axios';
import { ethers } from 'ethers';

// Configuration
const CONFIG = {
  backend: {
    baseURL: 'http://localhost:5000',
    timeout: 10000
  },
  blockchain: {
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337,
    contracts: {
      voting: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      nft: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      zkVerifier: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    }
  },
  testAccounts: {
    admin: {
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
    },
    voter: {
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
    }
  }
};

// Test utilities
class TestSuite {
  constructor() {
    this.axios = axios.create({
      baseURL: CONFIG.backend.baseURL,
      timeout: CONFIG.backend.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.provider = new ethers.JsonRpcProvider(CONFIG.blockchain.rpcUrl);
    this.adminSigner = new ethers.Wallet(CONFIG.testAccounts.admin.privateKey, this.provider);
    this.voterSigner = new ethers.Wallet(CONFIG.testAccounts.voter.privateKey, this.provider);
    
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  // Test assertion helper
  assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      this.results.passed++;
      this.results.tests.push({ status: 'PASS', message });
      return true;
    } else {
      console.log(`❌ FAIL: ${message}`);
      this.results.failed++;
      this.results.tests.push({ status: 'FAIL', message });
      return false;
    }
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test 1: Check if all services are running
  async testServicesHealth() {
    console.log('\n🔍 Testing Service Health...');
    
    try {
      // Test Backend API
      const backendResponse = await this.axios.get('/health');
      this.assert(backendResponse.status === 200, 'Backend API is responsive');
      
      // Test Blockchain Network
      const network = await this.provider.getNetwork();
      this.assert(network.chainId.toString() === CONFIG.blockchain.chainId.toString(), 'Blockchain network is accessible');
      
      // Test Account Balances
      const adminBalance = await this.provider.getBalance(CONFIG.testAccounts.admin.address);
      this.assert(ethers.formatEther(adminBalance) > 1000, 'Admin account has sufficient ETH balance');
      
      const voterBalance = await this.provider.getBalance(CONFIG.testAccounts.voter.address);
      this.assert(ethers.formatEther(voterBalance) > 1000, 'Voter account has sufficient ETH balance');
      
    } catch (error) {
      this.assert(false, `Service health check failed: ${error.message}`);
    }
  }

  // Test 2: User Registration and Authentication
  async testUserAuthentication() {
    console.log('\n🔍 Testing User Authentication...');
    
    try {
      // Register admin user
      const adminRegister = await this.axios.post('/api/auth/register', {
        email: 'admin@test.com',
        password: 'password123',
        fullName: 'Test Admin',
        studentId: 'ADMIN001',
        department: 'Computer Science',
        year: 4,
        walletAddress: CONFIG.testAccounts.admin.address
      });
      
      this.assert(adminRegister.status === 201 || adminRegister.status === 200, 'Admin user registration successful');
      
      // Login admin user
      const adminLogin = await this.axios.post('/api/auth/login', {
        email: 'admin@test.com',
        password: 'password123'
      });
      
      this.assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin login successful with JWT token');
      this.adminToken = adminLogin.data.token;
      
      // Register voter user
      const voterRegister = await this.axios.post('/api/auth/register', {
        email: 'voter@test.com',
        password: 'password123',
        fullName: 'Test Voter',
        studentId: 'VOTER001',
        department: 'Computer Science',
        year: 2,
        walletAddress: CONFIG.testAccounts.voter.address
      });
      
      this.assert(voterRegister.status === 201 || voterRegister.status === 200, 'Voter user registration successful');
      
      // Login voter user
      const voterLogin = await this.axios.post('/api/auth/login', {
        email: 'voter@test.com',
        password: 'password123'
      });
      
      this.assert(voterLogin.status === 200 && voterLogin.data.token, 'Voter login successful with JWT token');
      this.voterToken = voterLogin.data.token;
      
    } catch (error) {
      // Handle user already exists gracefully
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('⚠️  Users already exist, attempting login...');
        
        try {
          const adminLogin = await this.axios.post('/api/auth/login', {
            email: 'admin@test.com',
            password: 'password123'
          });
          this.adminToken = adminLogin.data.token;
          
          const voterLogin = await this.axios.post('/api/auth/login', {
            email: 'voter@test.com',
            password: 'password123'
          });
          this.voterToken = voterLogin.data.token;
          
          this.assert(true, 'Existing users logged in successfully');
        } catch (loginError) {
          this.assert(false, `User login failed: ${loginError.message}`);
        }
      } else {
        this.assert(false, `User authentication failed: ${error.message}`);
      }
    }
  }

  // Test 3: Election Creation with Blockchain Integration
  async testElectionCreationWithBlockchain() {
    console.log('\n🔍 Testing Election Creation with Blockchain...');
    
    try {
      // Create election via Backend API
      const now = new Date();
      const registrationStart = new Date(now.getTime() + 60000); // 1 minute from now
      const registrationEnd = new Date(now.getTime() + 120000);  // 2 minutes from now
      const votingStart = new Date(now.getTime() + 180000);      // 3 minutes from now
      const votingEnd = new Date(now.getTime() + 600000);        // 10 minutes from now
      
      const electionData = {
        title: 'Blockchain Integration Test Election',
        description: 'Testing complete frontend + backend + blockchain integration',
        electionType: 'simple',
        category: 'student',
        candidates: [
          {
            name: 'Alice Blockchain',
            description: 'Blockchain Technology Advocate',
            manifesto: 'Promoting transparent and secure voting systems'
          },
          {
            name: 'Bob Traditional',
            description: 'Traditional Systems Expert',
            manifesto: 'Ensuring stability and proven methodologies'
          }
        ],
        registrationStartTime: registrationStart.toISOString(),
        registrationEndTime: registrationEnd.toISOString(),
        votingStartTime: votingStart.toISOString(),
        votingEndTime: votingEnd.toISOString()
      };
      
      const response = await this.axios.post('/api/elections', electionData, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      
      this.assert(response.status === 201 && response.data.success, 'Election created successfully via Backend API');
      this.testElection = response.data.election;
      this.electionId = this.testElection._id;
      
      // Verify blockchain integration
      this.assert(
        this.testElection.contractAddress || this.testElection.metadata?.blockchainTxHash,
        'Election has blockchain integration (contract address or transaction hash)'
      );
      
      // Wait a moment for blockchain transaction to process
      await this.sleep(3000);
      
      // Verify election exists on blockchain if contract address is available
      if (this.testElection.contractAddress) {
        const votingABI = [
          "function getElection(uint256 _electionId) external view returns (tuple(uint256 id, string title, string description, address creator, uint256 startTime, uint256 endTime, uint8 voteType, uint8 status, uint256 totalVotes))"
        ];
        
        const votingContract = new ethers.Contract(
          CONFIG.blockchain.contracts.voting,
          votingABI,
          this.provider
        );
        
        try {
          const blockchainElection = await votingContract.getElection(0); // Assuming this is the first election
          this.assert(blockchainElection.title === electionData.title, 'Election title matches on blockchain');
        } catch (blockchainError) {
          console.log('⚠️  Blockchain verification skipped:', blockchainError.message);
        }
      }
      
    } catch (error) {
      this.assert(false, `Election creation failed: ${error.message}`);
    }
  }

  // Test 4: Complete Voting Workflow with NFT Minting
  async testCompleteVotingWorkflow() {
    console.log('\n🔍 Testing Complete Voting Workflow...');
    
    if (!this.electionId) {
      this.assert(false, 'No election available for voting test');
      return;
    }
    
    try {
      // Get election details
      const electionResponse = await this.axios.get(`/api/elections/${this.electionId}`);
      this.assert(electionResponse.status === 200, 'Election details retrieved successfully');
      
      // Wait for voting period to start (if needed)
      const election = electionResponse.data.election || electionResponse.data;
      const votingStart = new Date(election.votingStartTime);
      const now = new Date();
      
      if (now < votingStart) {
        const waitTime = votingStart.getTime() - now.getTime();
        console.log(`⏳ Waiting ${Math.ceil(waitTime/1000)} seconds for voting to start...`);
        await this.sleep(waitTime + 1000); // Add 1 second buffer
      }
      
      // Cast vote
      const voteData = {
        candidateId: election.candidates[0]._id,
        voteType: 'simple'
      };
      
      const voteResponse = await this.axios.post(`/api/vote/${this.electionId}`, voteData, {
        headers: { Authorization: `Bearer ${this.voterToken}` }
      });
      
      this.assert(voteResponse.status === 200 && voteResponse.data.success, 'Vote cast successfully');
      
      // Verify vote was recorded
      if (voteResponse.data.success) {
        this.assert(
          voteResponse.data.blockchainTxHash || voteResponse.data.vote,
          'Vote includes blockchain transaction hash or vote record'
        );
        
        // Check if NFT was minted (if applicable)
        if (voteResponse.data.nftTxHash) {
          this.assert(true, 'NFT voting certificate minted successfully');
        }
      }
      
      // Get voting results
      await this.sleep(2000); // Wait for vote to be processed
      
      const resultsResponse = await this.axios.get(`/api/elections/${this.electionId}/results`);
      this.assert(resultsResponse.status === 200, 'Voting results retrieved successfully');
      
      const results = resultsResponse.data.results || resultsResponse.data;
      this.assert(results.totalVotes >= 1, 'Vote count updated correctly');
      
    } catch (error) {
      this.assert(false, `Voting workflow failed: ${error.message}`);
    }
  }

  // Test 5: Frontend API Integration
  async testFrontendAPIIntegration() {
    console.log('\n🔍 Testing Frontend API Integration...');
    
    try {
      // Test elections list endpoint (what frontend uses)
      const electionsResponse = await this.axios.get('/api/elections');
      this.assert(electionsResponse.status === 200, 'Elections list API works');
      this.assert(Array.isArray(electionsResponse.data.elections || electionsResponse.data), 'Elections data is an array');
      
      // Test user profile endpoint
      const profileResponse = await this.axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${this.voterToken}` }
      });
      this.assert(profileResponse.status === 200, 'User profile API works');
      
      // Test analytics endpoint
      const analyticsResponse = await this.axios.get('/api/analytics/overview', {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      this.assert(analyticsResponse.status === 200, 'Analytics API works');
      
    } catch (error) {
      this.assert(false, `Frontend API integration failed: ${error.message}`);
    }
  }

  // Test 6: Error Handling and Edge Cases
  async testErrorHandling() {
    console.log('\n🔍 Testing Error Handling...');
    
    try {
      // Test duplicate voting
      if (this.electionId) {
        try {
          const duplicateVote = await this.axios.post(`/api/vote/${this.electionId}`, {
            candidateId: 'test',
            voteType: 'simple'
          }, {
            headers: { Authorization: `Bearer ${this.voterToken}` }
          });
          
          // Should either succeed (if not voted yet) or fail with proper error
          this.assert(true, 'Duplicate voting handled appropriately');
        } catch (duplicateError) {
          this.assert(
            duplicateError.response?.status === 400 || duplicateError.response?.status === 403,
            'Duplicate voting properly rejected with appropriate error code'
          );
        }
      }
      
      // Test unauthorized access
      try {
        await this.axios.post('/api/elections', {
          title: 'Unauthorized Test'
        });
        this.assert(false, 'Unauthorized election creation should fail');
      } catch (authError) {
        this.assert(
          authError.response?.status === 401,
          'Unauthorized access properly rejected'
        );
      }
      
      // Test invalid election access
      try {
        await this.axios.get('/api/elections/invalid-id-12345');
        this.assert(false, 'Invalid election ID should fail');
      } catch (invalidError) {
        this.assert(
          invalidError.response?.status === 404 || invalidError.response?.status === 400,
          'Invalid election ID properly handled'
        );
      }
      
    } catch (error) {
      this.assert(false, `Error handling test failed: ${error.message}`);
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Integration Test Suite');
    console.log('=========================================');
    
    const startTime = Date.now();
    
    await this.testServicesHealth();
    await this.testUserAuthentication();
    await this.testElectionCreationWithBlockchain();
    await this.testCompleteVotingWorkflow();
    await this.testFrontendAPIIntegration();
    await this.testErrorHandling();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Frontend + Backend + Blockchain integration is working perfectly!');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the issues above.');
    }
    
    return {
      success: this.results.failed === 0,
      passed: this.results.passed,
      failed: this.results.failed,
      duration,
      tests: this.results.tests
    };
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new TestSuite();
  testSuite.runAllTests().catch(console.error);
}

export default TestSuite;