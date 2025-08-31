// Token calculation utilities
import { getTotalStakedAmount } from './stakingService.js';

export const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens
export const MAINNET_PHASE_1_LAUNCH = new Date('2024-11-06T17:30:00Z'); // November 6, 2024 12:30PM EST
export const TGE_DATE = new Date('2025-07-16T17:30:00Z'); // July 16, 2025 12:30PM EST
export const BLOCK_TIME_SECONDS = 6;
const BLOCKS_PER_DAY = (24 * 60 * 60) / BLOCK_TIME_SECONDS;

// Initial allocations (at Phase-1 launch)
const ALLOCATIONS = {
  investors: { percent: 21.53, tokens: 215_263_087, vesting: 'cliff12_linear36' },
  team: {
    foundersAndStaff: { percent: 7.14, tokens: 71_426_634, vesting: 'cliff12_linear36' },
    advisors: { percent: 2.35, tokens: 23_478_000, vesting: 'cliff12_linear36' }
  },
  autonomysLabs: {
    devcoTreasury: { percent: 7.00, tokens: 70_000_000, vesting: 'cliff12_linear36' },
    marketLiquidity: { percent: 2.00, tokens: 20_000_000, vesting: 'immediate' }
  },
  vendors: { percent: 1.43, tokens: 14_345_400, vesting: 'cliff12_linear36' },
  subspaceFoundation: {
    operations: { percent: 0.68, tokens: 6_782_580, vesting: 'immediate' },
    nearTermTreasury: { percent: 5.00, tokens: 50_000_000, vesting: 'tbd' },
    longTermTreasury: { percent: 10.00, tokens: 100_000_000, vesting: 'cliff12_linear36' }
  },
  testnets: {
    testnetRewards: { percent: 5.97, tokens: 59_700_000, vesting: 'immediate' },
    stakeWars1: { percent: 0.60, tokens: 6_000_000, vesting: 'immediate' },
    stakeWars2: { percent: 0.30, tokens: 3_000_000, vesting: 'locked' }, // Not yet distributed
  },
  ambassadors: { percent: 1.00, tokens: 10_000_000, vesting: 'variable' },
  farmerRewards: { percent: 35.00, tokens: 350_000_000, vesting: 'farming' }
};

// BlockScience Dynamic Issuance Model - EXACT EQUATION
// Source: https://subnomicon.subspace.network/docs/rewards_fees/
// reference_subsidy = initial_subsidy * e^(-initial_subsidy * (n - decay_block_start) / max_issuance_tokens)
function calculateFarmingRewards(currentDate = new Date()) {
  // Mainnet farming started November 6, 2024 12:30PM EST
  const FARMING_START_DATE = new Date('2024-11-06T17:30:00Z'); 
  
  // Rewards activated when target storage was reached (late November 2024)
  const REWARDS_ACTIVATION_DATE = new Date('2024-11-26T00:00:00Z');
  
  // If before rewards activation, no rewards
  if (currentDate < REWARDS_ACTIVATION_DATE) {
    return 0;
  }
  
  // BlockScience model parameters
  const INITIAL_SUBSIDY = 5.0; // AI3 per block (confirmed from official sources)
  const MAX_ISSUANCE_TOKENS = 350_000_000; // Total farming rewards pool
  
  // For mainnet, decay starts immediately when rewards activate
  // (Unlike testnet which had decay_block_start = 718959)
  const DECAY_START_BLOCK = 0; // Relative to rewards activation
  
  const millisecondsSinceActivation = Math.max(0, currentDate - REWARDS_ACTIVATION_DATE);
  const totalBlocks = Math.floor(millisecondsSinceActivation / (BLOCK_TIME_SECONDS * 1000));
  
  if (totalBlocks === 0) return 0;
  
  let totalRewards = 0;
  
  // Use exact BlockScience equation with efficient chunked calculation
  const CHUNK_SIZE = 50000;
  
  for (let startBlock = 0; startBlock < totalBlocks; startBlock += CHUNK_SIZE) {
    const endBlock = Math.min(startBlock + CHUNK_SIZE, totalBlocks);
    const midBlock = (startBlock + endBlock) / 2;
    
    // EXACT BlockScience Dynamic Issuance Equation:
    // reference_subsidy = initial_subsidy * e^(-initial_subsidy * (n - decay_block_start) / max_issuance_tokens)
    const blockNumber = midBlock;
    const referenceSubsidy = INITIAL_SUBSIDY * Math.exp(
      -INITIAL_SUBSIDY * (blockNumber - DECAY_START_BLOCK) / MAX_ISSUANCE_TOKENS
    );
    
    // Add rewards for all blocks in this chunk
    const blocksInChunk = endBlock - startBlock;
    totalRewards += referenceSubsidy * blocksInChunk;
    
    // Safety check to not exceed max issuance
    if (totalRewards >= MAX_ISSUANCE_TOKENS) {
      return MAX_ISSUANCE_TOKENS;
    }
  }
  
  return Math.floor(totalRewards);
}

// Calculate current daily token production using exact equation
export function calculateDailyTokenProduction(currentDate = new Date()) {
  const REWARDS_ACTIVATION_DATE = new Date('2024-11-26T00:00:00Z');
  
  if (currentDate < REWARDS_ACTIVATION_DATE) {
    return 0;
  }
  
  const millisecondsSinceActivation = Math.max(0, currentDate - REWARDS_ACTIVATION_DATE);
  const currentBlock = Math.floor(millisecondsSinceActivation / (BLOCK_TIME_SECONDS * 1000));
  
  // BlockScience exact equation for current subsidy
  const INITIAL_SUBSIDY = 5.0;
  const MAX_ISSUANCE_TOKENS = 350_000_000;
  const DECAY_START_BLOCK = 0;
  
  const currentSubsidy = INITIAL_SUBSIDY * Math.exp(
    -INITIAL_SUBSIDY * (currentBlock - DECAY_START_BLOCK) / MAX_ISSUANCE_TOKENS
  );
  
  // Daily production = subsidy per block * blocks per day
  return currentSubsidy * BLOCKS_PER_DAY;
}

// Calculate vested amount based on vesting schedule
function calculateVestedAmount(allocation, vestingType, currentDate = new Date(), tgeDate = TGE_DATE) {
  if (vestingType === 'immediate') {
    return allocation;
  }
  
  if (vestingType === 'locked') {
    return 0; // Not yet distributed
  }
  
  if (vestingType === 'farming') {
    return calculateFarmingRewards(currentDate);
  }
  
  if (vestingType === 'tbd' || vestingType === 'variable') {
    return 0; // Conservative assumption
  }
  
  if (vestingType === 'cliff12_linear36') {
    const monthsSinceTGE = Math.max(0, (currentDate - tgeDate) / (1000 * 60 * 60 * 24 * 30.44));
    
    if (monthsSinceTGE < 12) {
      return 0; // Still in cliff period
    }
    
    if (monthsSinceTGE >= 48) {
      return allocation; // Fully vested
    }
    
    // 25% at month 12, then linear over 36 months
    const cliffAmount = allocation * 0.25;
    const linearMonths = monthsSinceTGE - 12;
    const linearAmount = (allocation * 0.75 * linearMonths) / 36;
    
    return cliffAmount + linearAmount;
  }
  
  return 0;
}

// Calculate total circulating supply
export async function calculateCirculatingSupply(currentDate = new Date(), tgeDate = TGE_DATE) {
  // IMPORTANT: Token transferability is disabled at protocol level until TGE
  // Even though tokens are minted at Phase-1, they cannot be transferred until TGE
  const tgeOccurred = currentDate >= tgeDate;
  
  if (!tgeOccurred) {
    // Before TGE, circulating supply is 0 due to protocol-level transfer restrictions
    return 0;
  }
  
  let circulatingSupply = 0;
  
  // After TGE, count unlocked tokens:
  
  // 1. Market Liquidity - unlocked at TGE
  circulatingSupply += ALLOCATIONS.autonomysLabs.marketLiquidity.tokens;
  
  // 2. Foundation Operations - liquid
  circulatingSupply += ALLOCATIONS.subspaceFoundation.operations.tokens;
  
  // 3. Testnet rewards - no lockup (but only transferable after TGE)
  circulatingSupply += ALLOCATIONS.testnets.testnetRewards.tokens;
  circulatingSupply += ALLOCATIONS.testnets.stakeWars1.tokens;
  // Note: stakeWars2 tokens are locked (not yet distributed)
  
  // 4. Vested tokens from cliff + linear schedules (all start from TGE date)
  circulatingSupply += calculateVestedAmount(ALLOCATIONS.investors.tokens, 'cliff12_linear36', currentDate, tgeDate);
  circulatingSupply += calculateVestedAmount(ALLOCATIONS.team.foundersAndStaff.tokens, 'cliff12_linear36', currentDate, tgeDate);
  circulatingSupply += calculateVestedAmount(ALLOCATIONS.team.advisors.tokens, 'cliff12_linear36', currentDate, tgeDate);
  circulatingSupply += calculateVestedAmount(ALLOCATIONS.autonomysLabs.devcoTreasury.tokens, 'cliff12_linear36', currentDate, tgeDate);
  circulatingSupply += calculateVestedAmount(ALLOCATIONS.vendors.tokens, 'cliff12_linear36', currentDate, tgeDate);
  circulatingSupply += calculateVestedAmount(ALLOCATIONS.subspaceFoundation.longTermTreasury.tokens, 'cliff12_linear36', currentDate, tgeDate);
  
  // 5. Farming rewards (minted since Nov 6, 2024, but only transferable after TGE)
  circulatingSupply += calculateFarmingRewards(currentDate);
  
  // 6. Subtract staked tokens (staked tokens are not in circulating supply)
  try {
    const totalStaked = await getTotalStakedAmount();
    circulatingSupply -= totalStaked;
  } catch (error) {
    console.warn('Failed to fetch staking data, proceeding without staked amount deduction:', error.message);
  }
  return Math.floor(circulatingSupply);
}

export async function getTokenDistribution() {
  return {
    totalSupply: TOTAL_SUPPLY,
    allocations: ALLOCATIONS,
    currentCirculating: await calculateCirculatingSupply(),
    lastUpdated: new Date().toISOString()
  };
}

// Export the calculateFarmingRewards function
export { calculateFarmingRewards };