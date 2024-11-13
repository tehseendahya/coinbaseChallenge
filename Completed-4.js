import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();
import newAbi from './abi.js';

// Environment variables for RPC URL and private key
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!BASE_SEPOLIA_RPC_URL || !PRIVATE_KEY) {
  console.error('❌ Please set BASE_SEPOLIA_RPC_URL and PRIVATE_KEY in your .env file');
  process.exit(1);
}

// Initialize the provider using the correct RPC URL
const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);
const devBountyAddress = '0x09d21D696498b1E7D80E462f0d188BD6b984A964'; 


// Initialize the wallet
let wallet;
try {
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('🔑 Wallet initialized:', wallet.address);
} catch (error) {
  console.error('❌ Failed to initialize wallet:', error);
  process.exit(1);
}
console.log(ethers.utils);  // Should print an object with utility methods like keccak256

const devBounty = new ethers.Contract(devBountyAddress, newAbi, wallet);


const participantAddress = wallet.address;

const stage = await devBounty.getCurrentStage(wallet.address);
console.log("Current Stage:", stage.toString());

try {
  const complete = await devBounty.completeChallenge();
  console.log('Challenge completed. Yay! ', complete);
} catch (error) {
  const leaderboard = await devBounty.getLeaderboard();
  console.log("Participants: ", await devBounty.getParticipantList());
  process.exit(1);
}




