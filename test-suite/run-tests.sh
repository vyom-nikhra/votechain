#!/bin/bash

echo "🚀 VoteChain Integration Test Runner"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if service is running
check_service() {
    local service_name=$1
    local url=$2
    local expected_response=$3
    
    echo -n "Checking $service_name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" == "$expected_response" ]; then
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${RED}❌ Not Running${NC}"
        return 1
    fi
}

# Function to check blockchain network
check_blockchain() {
    echo -n "Checking Hardhat Network... "
    
    response=$(curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        http://127.0.0.1:8545 2>/dev/null)
    
    if [[ "$response" == *"result"* ]]; then
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${RED}❌ Not Running${NC}"
        return 1
    fi
}

# Check all prerequisites
echo "🔍 Checking Prerequisites..."
echo "-----------------------------"

backend_ok=false
blockchain_ok=false
frontend_ok=false

# Check Backend
if check_service "Backend API" "http://localhost:5000/health" "200"; then
    backend_ok=true
fi

# Check Blockchain
if check_blockchain; then
    blockchain_ok=true
fi

# Check Frontend (optional)
if check_service "Frontend" "http://localhost:5173" "200"; then
    frontend_ok=true
fi

echo ""

# Summary of prerequisites
if [ "$backend_ok" = true ] && [ "$blockchain_ok" = true ]; then
    echo -e "${GREEN}✅ All required services are running!${NC}"
    
    if [ "$frontend_ok" = true ]; then
        echo -e "${GREEN}✅ Frontend is also available for manual testing${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend not running - automated tests will still work${NC}"
    fi
    
    echo ""
    echo "🧪 Running Integration Tests..."
    echo "------------------------------"
    
    # Run the integration tests
    if [ -f "test-suite/integration-test.js" ]; then
        node test-suite/integration-test.js
        test_exit_code=$?
        
        echo ""
        if [ $test_exit_code -eq 0 ]; then
            echo -e "${GREEN}🎉 All tests completed! Check the detailed results above.${NC}"
        else
            echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
        fi
    else
        echo -e "${RED}❌ Integration test file not found!${NC}"
        echo "Make sure you're running this from the project root directory."
        exit 1
    fi
    
else
    echo -e "${RED}❌ Prerequisites not met. Please start the required services:${NC}"
    echo ""
    
    if [ "$backend_ok" = false ]; then
        echo -e "${YELLOW}📝 Start Backend:${NC}"
        echo "   cd backend && npm run dev"
        echo ""
    fi
    
    if [ "$blockchain_ok" = false ]; then
        echo -e "${YELLOW}📝 Start Hardhat Network:${NC}"
        echo "   cd blockchain && npx hardhat node"
        echo ""
        echo -e "${YELLOW}📝 Deploy Contracts:${NC}"
        echo "   cd blockchain && npx hardhat run scripts/deploy.js --network localhost"
        echo ""
    fi
    
    echo "Once all services are running, run this script again:"
    echo "./test-suite/run-tests.sh"
    exit 1
fi

echo ""
echo "🔗 Additional Resources:"
echo "------------------------"
echo "📖 Full test documentation: ./test-suite/README.md"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5000"
echo "⛓️  Hardhat Network: http://127.0.0.1:8545"

echo ""
echo "🔐 MetaMask Configuration:"
echo "-------------------------"
echo "Network Name: Hardhat Local"
echo "RPC URL: http://127.0.0.1:8545"
echo "Chain ID: 31337"
echo "Test Account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"