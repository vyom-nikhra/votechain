# Comprehensive Test Suite for VoteChain Integration

This test suite verifies that Frontend + Backend + Blockchain integration is working correctly.

## Prerequisites

Before running tests, ensure:

1. **Backend server is running** on `http://localhost:5000`
2. **Hardhat network is running** on `http://127.0.0.1:8545`
3. **Smart contracts are deployed** to the local network
4. **MongoDB is running** and accessible
5. **Frontend server is running** on `http://localhost:5173` (optional for integration tests)

## Quick Start

```bash
# 1. Start all services (in separate terminals)
cd backend && npm run dev
cd blockchain && npx hardhat node
cd frontend && npm run dev

# 2. Deploy contracts
cd blockchain && npx hardhat run scripts/deploy.js --network localhost

# 3. Run integration tests
node test-suite/integration-test.js

# 4. Run manual tests (see below)
```

## Automated Integration Tests

The `integration-test.js` file contains comprehensive automated tests:

### Test Categories:
1. **Service Health** - Checks if Backend, Blockchain, and test accounts are ready
2. **User Authentication** - Tests user registration and login with JWT tokens
3. **Election Creation** - Tests election creation with blockchain integration
4. **Voting Workflow** - Tests complete voting process with NFT minting
5. **API Integration** - Tests all frontend-backend API endpoints
6. **Error Handling** - Tests edge cases and error scenarios

### Running Automated Tests:
```bash
cd /home/nuclear-panda/Documents/block-chain
node test-suite/integration-test.js
```

Expected output:
```
🚀 Starting Comprehensive Integration Test Suite
=========================================

🔍 Testing Service Health...
✅ PASS: Backend API is responsive
✅ PASS: Blockchain network is accessible
✅ PASS: Admin account has sufficient ETH balance
✅ PASS: Voter account has sufficient ETH balance

🔍 Testing User Authentication...
✅ PASS: Admin user registration successful
✅ PASS: Admin login successful with JWT token
✅ PASS: Voter user registration successful
✅ PASS: Voter login successful with JWT token

🔍 Testing Election Creation with Blockchain...
✅ PASS: Election created successfully via Backend API
✅ PASS: Election has blockchain integration (contract address or transaction hash)
✅ PASS: Election title matches on blockchain

🔍 Testing Complete Voting Workflow...
✅ PASS: Election details retrieved successfully
✅ PASS: Vote cast successfully
✅ PASS: Vote includes blockchain transaction hash or vote record
✅ PASS: NFT voting certificate minted successfully
✅ PASS: Voting results retrieved successfully
✅ PASS: Vote count updated correctly

🔍 Testing Frontend API Integration...
✅ PASS: Elections list API works
✅ PASS: Elections data is an array
✅ PASS: User profile API works
✅ PASS: Analytics API works

🔍 Testing Error Handling...
✅ PASS: Duplicate voting handled appropriately
✅ PASS: Unauthorized access properly rejected
✅ PASS: Invalid election ID properly handled

📊 Test Results Summary
=======================
✅ Passed: 20
❌ Failed: 0
⏱️  Duration: 15.23 seconds
📈 Success Rate: 100.0%

🎉 ALL TESTS PASSED! Frontend + Backend + Blockchain integration is working perfectly!
```

## Manual Testing Guide

### 1. MetaMask Setup (Required for Frontend Testing)

Add Hardhat network to MetaMask:
- **Network Name:** Hardhat Local
- **RPC URL:** `http://127.0.0.1:8545`
- **Chain ID:** `31337`
- **Currency:** ETH

Import test account:
- **Private Key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Address:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

### 2. Frontend Manual Testing

1. **Open Application:** Visit `http://localhost:5173`
2. **Register/Login:** Create admin and voter accounts
3. **Admin Panel:** 
   - Check blockchain status indicators in overview
   - Create new election - verify blockchain integration
   - View election details with contract addresses
4. **Voting Process:**
   - Navigate to election as voter
   - Verify blockchain verification section shows
   - Cast vote and check for NFT badge notification
   - Verify transaction hashes are displayed

### 3. Backend API Testing

```bash
# Health check
curl http://localhost:5000/health

# Get elections (should show blockchain fields)
curl http://localhost:5000/api/elections

# Create election (requires auth token)
curl -X POST http://localhost:5000/api/elections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Election","description":"Test Description","electionType":"simple","category":"general","candidates":[{"name":"Candidate A","description":"Description A"}],"registrationStartTime":"2025-10-26T06:00:00.000Z","registrationEndTime":"2025-10-26T07:00:00.000Z","votingStartTime":"2025-10-26T08:00:00.000Z","votingEndTime":"2025-10-26T18:00:00.000Z"}'
```

### 4. Blockchain Integration Verification

```bash
# Check Hardhat network status
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://127.0.0.1:8545

# Deploy contracts (if needed)
cd blockchain && npx hardhat run scripts/deploy.js --network localhost

# Check contract deployments
cd blockchain && npx hardhat console --network localhost
```

### 5. Database Verification

```bash
# Check MongoDB for elections with blockchain fields
mongosh
use votechain
db.elections.find({}, {title: 1, contractAddress: 1, "metadata.blockchainTxHash": 1})

# Check votes with blockchain integration
db.votes.find({}, {candidateId: 1, voteHash: 1, nullifierHash: 1})
```

## Expected Results

### ✅ Success Indicators:
- All automated tests pass (20/20)
- Elections show blockchain status in UI
- Contract addresses and transaction hashes visible
- NFT badges appear after voting
- No console errors in browser/backend
- Voting workflow completes end-to-end

### ❌ Failure Indicators:
- Tests failing with network errors
- Elections missing blockchain fields
- Frontend showing "Oops! Something went wrong"
- Backend showing blockchain initialization failures
- MetaMask transaction failures

## Troubleshooting

### Common Issues:

1. **Blockchain initialization failed**
   ```bash
   # Restart Hardhat network
   cd blockchain && npx hardhat node
   
   # Redeploy contracts
   npx hardhat run scripts/deploy.js --network localhost
   ```

2. **Backend not connecting to blockchain**
   ```bash
   # Check if Hardhat is running on port 8545
   curl http://127.0.0.1:8545
   
   # Restart backend
   cd backend && npm run dev
   ```

3. **Frontend not showing blockchain features**
   ```bash
   # Clear browser cache
   # Check browser console for errors
   # Verify API responses include blockchain fields
   ```

4. **MetaMask issues**
   - Reset account in MetaMask
   - Re-import private key
   - Check network configuration

## Performance Benchmarks

Expected performance for successful integration:
- **Backend Response Time:** < 500ms for API calls
- **Blockchain Transaction Time:** < 5 seconds
- **Election Creation:** < 10 seconds (including blockchain deployment)
- **Vote Casting:** < 15 seconds (including NFT minting)
- **Frontend Load Time:** < 3 seconds

## Security Verification

The test suite also verifies:
- JWT token authentication works
- Unauthorized access is blocked
- Duplicate voting is prevented
- Input validation is working
- Error messages don't leak sensitive info

---

## Test Coverage

This comprehensive test suite covers:
- ✅ **Backend APIs** (100% critical endpoints)
- ✅ **Blockchain Integration** (Smart contract interactions)
- ✅ **Authentication & Authorization** (JWT, user roles)
- ✅ **Election Lifecycle** (Creation → Voting → Results)
- ✅ **Error Handling** (Edge cases, validations)
- ✅ **Frontend Integration** (API consumption patterns)
- ✅ **NFT Minting** (Blockchain certificate generation)

**Total Integration Points Tested:** 25+
**Success Criteria:** All tests must pass for production readiness