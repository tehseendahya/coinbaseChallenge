import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!BASE_SEPOLIA_RPC_URL || !PRIVATE_KEY) {
  console.error('❌ Please set BASE_SEPOLIA_RPC_URL and PRIVATE_KEY in your .env file');
  process.exit(1);
}

// Use JsonRpcProvider with explicit chainId 
const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL, {
  chainId: 84532,  // Base Sepolia testnet
  name: 'base-sepolia'
});

const wallet = new ethers.Wallet(PRIVATE_KEY).connect(provider);
console.log('🔑 Wallet initialized:', wallet.address);

// External Contract ABI
const externalAbi = [
  "function resetSolution(address participant) external",
  "function generateSolution(address participant) external",
  "function checkSolutionExists(address participant) external view returns (bool)",
  "function checkSolution(address participant, bytes32 solution) external view returns (bool)",
  "function getHint(address participant) external view returns (uint256)"
];

const externalContract = new ethers.Contract(devBountyAddress, externalAbi, wallet);

// DevBounty Contract
const devBountyAbi = ["function completeExternalChallenge(bytes32 solution) external"];
const devBountyAddress = "0x09d21D696498b1E7D80E462f0d188BD6b984A964"; // Update with your correct contract

const devBountyContract = new ethers.Contract(devBountyAddress, devBountyAbi, wallet);

//get hint in a string format
async function getExternalHint(participantAddress) {
  try {
    const hint = await externalContract.getHint(participantAddress);
    console.log(`💡 Hint: ${hint.toString()}`);
    return hint;
  } catch (error) {
    console.error('❌ Error fetching hint:', error);
    process.exit(1);
  }
}

function computeSolution(hint) {
  return ethers.keccak256(ethers.solidityPacked(['uint256'], [hint]));

}

async function submitSolution(solution) {
  try {
    console.log("the error is here before the function is called")
    const tx = await devBountyContract.completeExternalChallenge(solution);
    console.log('✅ Solution submitted. Tx:', tx.hash);
    await tx.wait();
    console.log('🎉 Challenge Stage 2 Complete!');
  } catch (error) {
    console.error('❌ Error submitting solution:', error);
  }
}

(async () => {
  const participantAddress = wallet.address;
  const hint = await getExternalHint(participantAddress);
  if (hint !== undefined) {
    const solution = computeSolution(hint);
    await submitSolution(solution);
  }
})();











