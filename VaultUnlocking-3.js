import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();
import newAbi from './abi.js';

// Environment variables
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Initialize provider
const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);
console.log(provider);

// Initialize wallet
let wallet;
try {
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('🔑 Wallet initialized:', wallet.address);
} catch (error) {
  console.error('❌ Failed to initialize wallet:', error);
  process.exit(1);
}
console.log(ethers.utils);  // Should print an object with utility methods like keccak256


// The contract address and ABI for the DevBounty contract
const devBountyAddress = '0x09d21D696498b1E7D80E462f0d188BD6b984A964';  

const vaultAbi = [
  "function unlock(bytes32 password) external returns (bool)",
  "function locked() external view returns (bool)"
];

// Instantiate the DevBounty contract
const devBounty = new ethers.Contract(devBountyAddress, newAbi, wallet);


// Function to complete the Vault Unlocking stage
  try {
    const participantAddress = wallet.address;  // Your address or the participant's address

    // Get the vault address for the participant
    const vaultAddress = await devBounty.getVaultAddress(participantAddress);
    console.log('🔐 Vault address:', vaultAddress);

    // Instantiate the Vault contract
    const vault = new ethers.Contract(vaultAddress, vaultAbi, wallet);

    // Check if the vault is locked
    const isLocked = await vault.locked();
    console.log('🔒 Is vault locked?', isLocked);

    if (!isLocked) {
      console.log('✅ Vault is already unlocked!');
      //break;
    }
    

    // Retrieve the hint (which could be used to generate the password)
    const hint = await devBounty.getHint(participantAddress);
    console.log('💡 Hint:', hint.toString());
    //console.log('Datatype:', typeof hint.toString());
     // Check if hint is a BigNumber, if so convert it to string
     

    // Generate password hash using keccak256
    //const password = ethers.keccak256(ethers.toUtf8Bytes(hint.toString()));
    const password = await provider.getStorage(vaultAddress, 1);
    console.log('🔑 Generated password:', password);
    

    // Unlock the vault using the computed password
    const unlockTx = await vault.unlock(password);
    console.log('🔓 Unlock transaction sent:', unlockTx.hash);

    // Wait for the transaction to be mined
    const receipt = await unlockTx.wait();
    console.log('📜 Transaction receipt:', receipt);

    // Check if the vault was unlocked successfully
    const isVaultUnlocked = await vault.locked();
    if (!isVaultUnlocked) {
      console.log('✅ Vault unlocked successfully!');
    } else {
      console.log('❌ Failed to unlock the vault.');
    }
  } catch (error) {
    console.error('❌ Error during Vault Unlocking:', error);
  }


// Complete the challenge
const completeIt = await devBounty.completeVaultUnlocking();
console.log("✅ step 3 completed", completeIt)

const stage = await devBounty.getCurrentStage(wallet.address);
console.log("Current Stage:", stage.toString());


console.log(devBounty.getLeaderboard());


