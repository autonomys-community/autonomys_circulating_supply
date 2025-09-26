// Token calculation utilities
import { getTotalStakedAmount } from './stakingService.js';
import { getConsensusTokenSupply } from './consensusSupplyService.js';
import { getDomainTokenSupply } from './domainsSupplyService.js';
import { getGuardiansOfGrowthStakingIncentiveFreeBalance } from './GuardiansOfGrowthStakingIncentiveService.js';

export const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens

// Initial allocations (at Phase-1 launch)
const ALLOCATIONS = {
  investors: { percent: 21.53, tokens: 215_263_087, vesting: 'locked' },
  team: {
    foundersAndStaff: { percent: 7.14, tokens: 71_426_634, vesting: 'locked' },
    advisors: { percent: 2.35, tokens: 23_478_000, vesting: 'locked' }
  },
  autonomysLabs: {
    devcoTreasury: { percent: 7.00, tokens: 70_000_000, vesting: 'locked' },
    marketLiquidity: { percent: 2.00, tokens: 20_000_000, vesting: 'unlocked' }
  },
  vendors: { percent: 1.43, tokens: 14_345_400, vesting: 'locked' },
  subspaceFoundation: {
    operations: { percent: 0.68, tokens: 6_782_580, vesting: 'unlocked' },
    nearTermTreasury: { percent: 4.50, tokens: 45_000_000, vesting: 'locked' },
    GuardiansOfGrowthStakingIncentive: { percent: 0.50, tokens: 5_000_000, vesting: 'dynamic' },
    longTermTreasury: { percent: 10.00, tokens: 100_000_000, vesting: 'locked' }
  },
  testnets: {
    testnetRewards: { percent: 5.97, tokens: 59_695_698, vesting: 'unlocked' },
    stakeWars1: { percent: 0.60, tokens: 6_000_000, vesting: 'unlocked' },
    stakeWars2: { percent: 0.30, tokens: 3_000_000, vesting: 'locked' }
  },
  ambassadors: { percent: 1.00, tokens: 10_000_000, vesting: 'locked' },
  farmerRewards: { percent: 35.00, tokens: 350_000_000, vesting: 'dynamic' }
};

// Calculate total locked tokens
function calculateLockedTokens() {
  let lockedAmount = 0;
  
  // Investors
  lockedAmount += ALLOCATIONS.investors.tokens;
  
  // Team
  lockedAmount += ALLOCATIONS.team.foundersAndStaff.tokens;
  lockedAmount += ALLOCATIONS.team.advisors.tokens;
  
  // Autonomys Labs (only devco treasury is locked)
  lockedAmount += ALLOCATIONS.autonomysLabs.devcoTreasury.tokens;
  
  // Vendors
  lockedAmount += ALLOCATIONS.vendors.tokens;
  
  // Subspace Foundation (near-term and long-term treasury are locked)
  lockedAmount += ALLOCATIONS.subspaceFoundation.nearTermTreasury.tokens;
  lockedAmount += ALLOCATIONS.subspaceFoundation.longTermTreasury.tokens;
  
  // Testnets (only stakeWars2 is locked)
  lockedAmount += ALLOCATIONS.testnets.stakeWars2.tokens;
  
  // Ambassadors
  lockedAmount += ALLOCATIONS.ambassadors.tokens;
  
  return lockedAmount;
}


// Calculate total circulating supply
// Formula: (consensusSupply + domainSupply) - stakedTokens - lockedTokens
export async function calculateCirculatingSupply() {
  try {
    // Execute all async calls in parallel for better performance
    const [consensusSupply, domainSupply, totalStaked, guardiansFreeBalance] = await Promise.all([
      getConsensusTokenSupply(),
      getDomainTokenSupply(),
      getTotalStakedAmount(),
      getGuardiansOfGrowthStakingIncentiveFreeBalance(),
    ]);
    
    // Calculate locked tokens (synchronous)
    const lockedTokens = calculateLockedTokens();
    
    // Dynamic lock for Guardians of Growth staking incentive
    const guardiansAllocation = ALLOCATIONS.subspaceFoundation.GuardiansOfGrowthStakingIncentive.tokens;
    const guardiansLocked = Math.max(0, guardiansAllocation - (guardiansFreeBalance || 0));
    
    // Calculate total on-chain supply
    const totalOnChainSupply = consensusSupply + domainSupply;
    
    // Calculate circulating supply
    const circulatingSupply = totalOnChainSupply - totalStaked - lockedTokens - guardiansLocked;
    
    return Math.max(0, Math.floor(circulatingSupply));
    
  } catch (error) {
    console.error('Error calculating circulating supply:', error);
    return 0;
  }
}

export async function getTokenDistribution() {
  return {
    totalSupply: TOTAL_SUPPLY,
    allocations: ALLOCATIONS,
    currentCirculating: await calculateCirculatingSupply(),
    lastUpdated: new Date().toISOString()
  };
}

// Helper function to get locked tokens amount
export function getLockedTokensAmount() {
  return calculateLockedTokens();
}