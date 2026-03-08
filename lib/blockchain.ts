import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { hardhat, polygonAmoy, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// 1. Configure the network you are deploying to.
// We use hardhat for local testing, but you would switch this to baseSepolia or polygon in production.
const currentChain = hardhat; 

// 2. Setting up the Provider (The connection to the blockchain)
const publicClient = createPublicClient({
  chain: currentChain,
  transport: http(), // Default local node is http://127.0.0.1:8545
});

// 3. Setting up the Developer's Wallet (The "Paymaster" or Sponsor)
// In a real app, securely store this in .env (e.g., process.env.SPONSOR_PRIVATE_KEY)
// For local testing with Hardhat, we use the default account #0 private key provided by Hardhat.
const LOCAL_HARDHAT_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; 
const account = privateKeyToAccount((process.env.WEB3_PRIVATE_KEY || LOCAL_HARDHAT_PRIVATE_KEY) as `0x${string}`);

const walletClient = createWalletClient({
  account,
  chain: currentChain,
  transport: http(),
});

// 4. The Smart Contract Details
// This address will be generated after you run `yarn deploy` inside the scaffold-eth folder.
// Be sure to update this with your actual deployed contract address!
export const CIVICPULSE_CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// We extract just the function we need rather than shipping the whole ABI JSON to the client.
const civicPulseAbi = parseAbi([
  "function anchorReport(string memory _id, string memory _hash) public",
  "function markResolved(string memory _id, string memory _resolutionHash) public",
  "function reports(string memory _id) public view returns (string internalId, address reporter, string metadataHash, uint256 timestamp, bool isResolved)",
]);

/**
 * Anchors a CivicPulse API report to the blockchain transparently.
 * User pays $0 gas fee. The app's admin wallet executes the transaction.
 */
export async function anchorReportOnChain(reportId: string, reportData: any) {
  try {
    // A simple way to generate an immutable hash of the report data
    // In reality, this could be an IPFS CID if you uploaded the image to web3.
    const metadataString = JSON.stringify({
      category: reportData.category,
      lat: reportData.lat,
      lng: reportData.lng,
      timestamp: new Date().toISOString(),
    });

    // Create a deterministic hash of the metadata
    const encoder = new TextEncoder();
    const data = encoder.encode(metadataString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const metadataHash = "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    console.log(`⛓️ [Web3] Anchoring Report ${reportId} to blockchain...`);

    // Simulate the transaction first (Best practice in Viem to catch errors early)
    const { request } = await publicClient.simulateContract({
      account,
      address: CIVICPULSE_CONTRACT_ADDRESS,
      abi: civicPulseAbi,
      functionName: "anchorReport",
      args: [reportId, metadataHash],
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(request);
    
    // Wait for the block to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    console.log(`✅ [Web3] Report ${reportId} successfully anchored!`);
    console.log(`🔗 Transaction Hash: ${receipt.transactionHash}`);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      metadataHash: metadataHash
    };
  } catch (error) {
    console.error("❌ [Web3] Failed to anchor report:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Marks a previously anchored report as RESOLVED on the blockchain.
 * Prove to the community that the city actually fixed it.
 */
export async function markReportResolvedOnChain(reportId: string, resolutionHash: string) {
  try {
    console.log(`⛓️ [Web3] Marking Report ${reportId} as resolved on blockchain...`);

    const { request } = await publicClient.simulateContract({
      account,
      address: CIVICPULSE_CONTRACT_ADDRESS,
      abi: civicPulseAbi,
      functionName: "markResolved",
      args: [reportId, resolutionHash],
    });

    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    console.log(`✅ [Web3] Report ${reportId} successfully resolved on-chain!`);
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error("❌ [Web3] Failed to mark report resolved on-chain:", error);
    return { success: false, error: String(error) };
  }
}
