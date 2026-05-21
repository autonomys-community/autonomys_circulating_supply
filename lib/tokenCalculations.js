// Token calculation utilities
import { getTotalStakedAmount } from './stakingService.js';
import { getConsensusTokenSupply } from './consensusSupplyService.js';
import { getDomainTokenSupply } from './domainsSupplyService.js';
import { getGuardiansOfGrowthStakingIncentiveWalletBalance } from './GuardiansOfGrowthStakingIncentiveService.js';
import { getNearTermTreasuryWalletBalance } from './nearTermTreasuryService.js';
import { getSubspaceFoundationOperationsWalletBalance } from './subspaceFoundationOperationsService.js';
import { getAmbassadorsWalletBalance, getHedgeyAdminAi3Balance, getWrappedAi3TotalSupplyAI3 } from './ambassadorsService.js';
import { getSubspaceFoundationAutoEvmTotalBalance } from './subspaceFoundationAutoEvmService.js';
import { getLockedWalletsConsensusTotalBalance } from './lockedWalletsConsensusService.js';

export const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens

// Allocation metadata (for UI display — actual locked amounts are fetched live)
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
    nearTermTreasury: { percent: 4.50, tokens: 45_000_000, vesting: 'dynamic' },
    GuardiansOfGrowthStakingIncentive: { percent: 0.50, tokens: 5_000_000, vesting: 'dynamic' },
    longTermTreasury: { percent: 10.00, tokens: 100_000_000, vesting: 'locked' }
  },
  testnets: {
    testnetRewards: { percent: 5.97, tokens: 59_695_698, vesting: 'unlocked' },
    stakeWars1: { percent: 0.60, tokens: 6_000_000, vesting: 'unlocked' },
    stakeWars2: { percent: 0.30, tokens: 3_000_000, vesting: 'locked' }
  },
  ambassadors: { percent: 1.00, tokens: 10_000_000, vesting: 'dynamic' },
  farmerRewards: { percent: 35.00, tokens: 350_000_000, vesting: 'dynamic' }
};


// Calculate total circulating supply
// Formula: (consensusSupply + domainSupply) - stakedTokens - lockedTokens
export async function calculateCirculatingSupply() {
  try {
    // Execute all async calls in parallel for better performance
    const [consensusSupply, domainSupply, totalStaked, guardiansOfGrowthBalance, nearTermTreasuryBalance, subspaceFoundationOperationsBalance, ambassadorsWalletBalance, wrappedAi3TotalSupply, hedgeySfAdminNativeAi3Balance, sfAutoEvmBalance, lockedTokens] = await Promise.all([
      getConsensusTokenSupply(),
      getDomainTokenSupply(),
      getTotalStakedAmount(),
      getGuardiansOfGrowthStakingIncentiveWalletBalance(),
      getNearTermTreasuryWalletBalance(),
      getSubspaceFoundationOperationsWalletBalance(),
      getAmbassadorsWalletBalance(),
      getWrappedAi3TotalSupplyAI3(),
      getHedgeyAdminAi3Balance(),
      getSubspaceFoundationAutoEvmTotalBalance(),
      getLockedWalletsConsensusTotalBalance(),
    ]);
    
    // Dynamic lock for Guardians of Growth staking incentive = allocation - current free balance
    const guardiansAllocation = ALLOCATIONS.subspaceFoundation.GuardiansOfGrowthStakingIncentive.tokens;
    const guardiansStakingIncentiveToVest = Math.max(0, guardiansAllocation - (guardiansAllocation - guardiansOfGrowthBalance || 0));
    
    // Calculate total on-chain supply
    const totalOnChainSupply = consensusSupply + domainSupply;
    
    // Calculate circulating supply
    // Dynamic lock for Guardians of Growth staking incentive and Near-Term SF treasury

    // Ambassadors:
    // - Allocation is dynamic
    // - Tokens remaining in ambassadors wallet on consensus chain are locked (non-circulating)
    // - All wrapped AI3 tokens on Auto EVM are treated as non-circulating
    const ambassadorsAllocation = ALLOCATIONS.ambassadors.tokens;
    // - Additionally, Hedgey Subspace Foundation admin wallet holding wrapped AI3 is treated as non-circulating for Ambassadors
    const ambassadorsLockedRaw =
      (ambassadorsWalletBalance || 0) +
      (wrappedAi3TotalSupply || 0) +
      (hedgeySfAdminNativeAi3Balance || 0);
    const ambassadorsLocked = Math.max(0, Math.min(ambassadorsAllocation, ambassadorsLockedRaw));

    const circulatingSupply =
      totalOnChainSupply -
      totalStaked -
      lockedTokens -
      guardiansStakingIncentiveToVest -
      nearTermTreasuryBalance -
      subspaceFoundationOperationsBalance -
      ambassadorsLocked -
      sfAutoEvmBalance;
    
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

// Helper function to get locked tokens amount (live from chain)
export async function getLockedTokensAmount() {
  return getLockedWalletsConsensusTotalBalance();
}

// Helper to get current Guardians of Growth staking incentive to vest amount
export async function getGuardiansStakingIncentiveToVest() {
  try {
    const guardiansOfGrowthBalance = await getGuardiansOfGrowthStakingIncentiveWalletBalance();
    const guardiansAllocation = ALLOCATIONS.subspaceFoundation.GuardiansOfGrowthStakingIncentive.tokens;
    // Keep calculation consistent with calculateCirculatingSupply
    const guardiansStakingIncentiveToVest = Math.max(
      0,
      guardiansAllocation - (guardiansAllocation - guardiansOfGrowthBalance || 0)
    );
    return guardiansStakingIncentiveToVest;
  } catch (e) {
    console.error('Error calculating Guardians of Growth to vest amount:', e);
    return 0;
  }
}