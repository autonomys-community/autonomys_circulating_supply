import { useState, useEffect } from 'react';
import { calculateCirculatingSupply, getTokenDistribution, getLockedTokensAmount, getGuardiansStakingIncentiveToVest } from '../lib/tokenCalculations';
import { getNearTermTreasuryWalletBalance } from '../lib/nearTermTreasuryService';
import { getTotalStakedAmount } from '../lib/stakingService';
import { getConsensusTokenSupply } from '../lib/consensusSupplyService';
import { getDomainTokenSupply } from '../lib/domainsSupplyService';

export default function TokenInfo() {
  const [tokenData, setTokenData] = useState(null);
  const [totalStaked, setTotalStaked] = useState(0);
  const [consensusSupply, setConsensusSupply] = useState(0);
  const [domainSupply, setDomainSupply] = useState(0);
  const [lockedTokens, setLockedTokens] = useState(0);
  const [guardiansToVest, setGuardiansToVest] = useState(0);
  const [nearTermTreasuryBalance, setNearTermWalletBalance] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    investors: false,
    team: false,
    autonomysLabs: false,
    subspaceFoundation: false,
    testnets: false,
    partnersAmbassadors: false,
    farmerRewards: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    const loadTokenData = async () => {
      try {
        // Parallelize all async calls using Promise.all
        const [
          data,
          circulating,
          staked,
          consensus,
          domains,
          guardiansToVestAmount,
          nearTermTreasuryBalance
        ] = await Promise.all([
          getTokenDistribution(),
          calculateCirculatingSupply(),
          getTotalStakedAmount(),
          getConsensusTokenSupply(),
          getDomainTokenSupply(),
          getGuardiansStakingIncentiveToVest(),
          getNearTermTreasuryWalletBalance()
        ]);

        // Get locked tokens (synchronous)
        const locked = getLockedTokensAmount();

        // Set all state values
        setTokenData({ ...data, currentCirculating: circulating });
        setTotalStaked(staked);
        setConsensusSupply(consensus);
        setDomainSupply(domains);
        setLockedTokens(locked);
        setGuardiansToVest(guardiansToVestAmount || 0);
        setNearTermWalletBalance(nearTermTreasuryBalance || 0);
      } catch (error) {
        console.error('Error loading token data:', error);
        
        // Fallback: try to get basic data and set zeros for failed calls
        try {
          const data = await getTokenDistribution();
          setTokenData(data);
        } catch (fallbackError) {
          console.error('Failed to load fallback data:', fallbackError);
        }
        
        // Set fallback values
        setTotalStaked(0);
        setConsensusSupply(0);
        setDomainSupply(0);
        setLockedTokens(0);
      }
    };
    
    loadTokenData();
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercent = (num) => {
    return (num / 1000000000 * 100).toFixed(2);
  };

  const formatLockedPercent = (lockedAmount) => {
    const totalOnChainSupply = consensusSupply + domainSupply;
    if (totalOnChainSupply === 0) return '0.00';
    return (lockedAmount / totalOnChainSupply * 100).toFixed(2);
  };

  if (!tokenData) return <div>Loading...</div>;

  const totalOnChainSupply = consensusSupply + domainSupply;
  const a = tokenData.allocations;
  const investors = a.investors;
  const team = a.team;
  const autonomysLabs = a.autonomysLabs;
  const foundation = a.subspaceFoundation;
  const testnets = a.testnets;
  const vendors = a.vendors;
  const ambassadors = a.ambassadors;
  const farmerRewards = a.farmerRewards;

  const teamPercent = (team.foundersAndStaff.percent + team.advisors.percent).toFixed(2);
  const autonomysPercent = (autonomysLabs.devcoTreasury.percent + autonomysLabs.marketLiquidity.percent).toFixed(2);
  const foundationPercent = (
    foundation.operations.percent +
    foundation.nearTermTreasury.percent +
    foundation.GuardiansOfGrowthStakingIncentive.percent +
    foundation.longTermTreasury.percent
  ).toFixed(2);
  const testnetsPercent = (testnets.testnetRewards.percent + testnets.stakeWars1.percent + testnets.stakeWars2.percent).toFixed(2);
  const partnersAmbassadorsPercent = (vendors.percent + ambassadors.percent).toFixed(2);

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      lineHeight: '1.6'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', color: '#2563eb', marginBottom: '10px' }}>
          AI3 Token Distribution
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
          Autonomys Network Native Token Overview
        </p>
        <div style={{ marginTop: '20px' }}>
          <a 
            href="https://subspace.foundation/tokenomics" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              border: '2px solid #2563eb',
              padding: '10px 20px',
              borderRadius: '8px',
              display: 'inline-block',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#2563eb';
            }}
          >
            Official Tokenomics (Source of Truth)
          </a>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
          <a 
            href="https://github.com/autonomys-community/autonomys_circulating_supply" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#6b7280', 
              textDecoration: 'none',
              fontSize: '1rem',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            This Code Repository (GitHub)
          </a>
          <a 
            href="https://github.com/BlockScience/subspace" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#6b7280', 
              textDecoration: 'none',
              fontSize: '1rem',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            BlockScience Research
          </a>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Total Supply</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            {formatNumber(tokenData.totalSupply)}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Consensus Chain Supply</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            {formatNumber(consensusSupply)}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
            On-chain minted tokens
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #ec4899, #be185d)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Domain Token Supply</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            {formatNumber(domainSupply)}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
            Total across all domains
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Staked Tokens</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            {formatNumber(totalStaked)}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
            Locked in domain staking
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #047857)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Circulating Supply</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            {formatNumber(tokenData.currentCirculating)}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
            {formatPercent(tokenData.currentCirculating)}% of total
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Locked Tokens</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            {formatNumber(lockedTokens + totalStaked)}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
            Vesting + Staked
          </p>
        </div>
      </div>

      {/* API Endpoints */}
      <section style={{ 
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
        color: 'white',
        padding: '30px',
        borderRadius: '16px',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          API Endpoints Available
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '25px', opacity: 0.9 }}>
          Four simple endpoints for developers and integrations
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
              <strong>POST /api</strong>
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', opacity: 0.9 }}>
              Full data endpoint
            </p>
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '10px', 
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}>
              curl -X POST https://ai3-supply.xyz/api
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔢</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
              <strong>GET api/total-supply</strong>
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', opacity: 0.9 }}>
              Total supply with optional CoinGecko format
            </p>
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '10px', 
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Default format:</strong><br />
                curl https://ai3-supply.xyz/api/total-supply
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>CoinGecko format:</strong><br />
                curl https://ai3-supply.xyz/api/total-supply?format=coingecko
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
              <strong>GET api/circulating-supply</strong>
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', opacity: 0.9 }}>
              Current circulating supply with optional CoinGecko format
            </p>
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '10px', 
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Default format:</strong><br />
                curl https://ai3-supply.xyz/api/circulating-supply
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>CoinGecko format:</strong><br />
                curl https://ai3-supply.xyz/api/circulating-supply?format=coingecko
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔒</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
              <strong>GET /staking-info</strong>
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', opacity: 0.9 }}>
              Total staked tokens (stake + storage fees)
            </p>
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '10px', 
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}>
              curl https://ai3-supply.xyz/api/staking-info
            </div>
          </div>
        </div>

        <div style={{ 
          marginTop: '25px',
          padding: '15px 25px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.2)',
          maxWidth: '600px',
          margin: '25px auto 0'
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9 }}>
            <strong>💡 Quick Start:</strong> Use GET endpoints for simple integrations, POST for comprehensive data analysis
          </p>
        </div>
      </section>

      {/* Circulating Supply Calculation */}
      <section style={{ 
        background: '#f0f9ff', 
        border: '2px solid #0ea5e9',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '40px'
      }}>
        <h2 style={{ 
          fontSize: '1.3rem', 
          marginBottom: '15px', 
          color: '#0c4a6e'
        }}>
          Circulating Supply Calculation
        </h2>
        <p style={{ color: '#0c4a6e', marginBottom: '15px' }}>
          <strong>How circulating supply is calculated from real on-chain data:</strong>
        </p>
        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '8px' }}>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '1rem', 
            lineHeight: '1.6',
            color: '#1f2937'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Step 1:</strong> Get total on-chain supply
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Consensus Chain: {formatNumber(consensusSupply)} tokens
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • All Domains: {formatNumber(domainSupply)} tokens
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Total On-Chain: {formatNumber(totalOnChainSupply)} tokens
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Step 2:</strong> Subtract staked tokens
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Total Staked: {formatNumber(totalStaked)} tokens
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Step 3:</strong> Subtract locked allocations
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Locked Tokens: {formatNumber(lockedTokens)} tokens
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Guardians of Growth Staking Incentive Program: {formatNumber(guardiansToVest)} tokens
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Near-Term Treasury: {formatNumber(nearTermTreasuryBalance)} tokens
            </div>
            
            <div style={{ 
              background: '#e0f2fe', 
              padding: '15px', 
              borderRadius: '8px',
              border: '1px solid #0ea5e9',
              marginTop: '15px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                Final Calculation:
              </div>
              <div>Circulating Supply = {formatNumber(totalOnChainSupply)} - {formatNumber(totalStaked)} - {formatNumber(lockedTokens)} - {formatNumber(guardiansToVest)} - {formatNumber(nearTermTreasuryBalance)}</div>
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #0ea5e9' }}>
                = {formatNumber(tokenData.currentCirculating)} tokens ({formatPercent(tokenData.currentCirculating)}% of total supply)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Distribution Breakdown */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#1f2937' }}>
          Token Distribution Breakdown
        </h2>
        
        <div style={{ display: 'grid', gap: '25px' }}>
          {/* Investors */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: expandedSections.investors ? '15px' : '0'
            }} onClick={() => toggleSection('investors')}>
              <h3 style={{ color: '#1f2937', margin: 0 }}>
                💼 Investors ({investors.percent.toFixed(2)}%)
              </h3>
              <button style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'transform 0.3s ease'
              }}>
                {expandedSections.investors ? '−' : '+'}
              </button>
            </div>
            {expandedSections.investors && (
              <div style={{ 
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                <p><strong>{formatNumber(investors.tokens)} tokens</strong></p>
                <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                  Locked allocation. Tokens are held in reserve and not yet distributed.
                </p>
              </div>
            )}
          </div>

          {/* Team */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: expandedSections.team ? '15px' : '0'
            }} onClick={() => toggleSection('team')}>
              <h3 style={{ color: '#1f2937', margin: 0 }}>
                👥 Team ({teamPercent}%)
              </h3>
              <button style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'transform 0.3s ease'
              }}>
                {expandedSections.team ? '−' : '+'}
              </button>
            </div>
            {expandedSections.team && (
              <div style={{ 
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ marginLeft: '20px' }}>
                  <p>• <strong>Founders + Staff:</strong> {formatNumber(team.foundersAndStaff.tokens)} tokens ({team.foundersAndStaff.percent.toFixed(2)}%)</p>
                  <p>• <strong>Advisors:</strong> {formatNumber(team.advisors.tokens)} tokens ({team.advisors.percent.toFixed(2)}%)</p>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                  Locked allocations. Tokens are held in reserve and not yet distributed.
                </p>
              </div>
            )}
          </div>

          {/* Autonomys Labs */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: expandedSections.autonomysLabs ? '15px' : '0'
            }} onClick={() => toggleSection('autonomysLabs')}>
              <h3 style={{ color: '#1f2937', margin: 0 }}>
                🏢 Autonomys Labs ({autonomysPercent}%)
              </h3>
              <button style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'transform 0.3s ease'
              }}>
                {expandedSections.autonomysLabs ? '−' : '+'}
              </button>
            </div>
            {expandedSections.autonomysLabs && (
              <div style={{ 
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ marginLeft: '20px' }}>
                  <p>• <strong>DevCo Treasury:</strong> {formatNumber(autonomysLabs.devcoTreasury.tokens)} tokens ({autonomysLabs.devcoTreasury.percent.toFixed(2)}%) - <span style={{color: '#f59e0b'}}>{autonomysLabs.devcoTreasury.vesting === 'locked' ? 'Locked' : 'Unlocked'}</span></p>
                  <p>• <strong>Market Liquidity:</strong> {formatNumber(autonomysLabs.marketLiquidity.tokens)} tokens ({autonomysLabs.marketLiquidity.percent.toFixed(2)}%) - <span style={{color: '#10b981'}}>{autonomysLabs.marketLiquidity.vesting === 'unlocked' ? 'Unlocked' : 'Locked'}</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Subspace Foundation */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: expandedSections.subspaceFoundation ? '15px' : '0'
            }} onClick={() => toggleSection('subspaceFoundation')}>
              <h3 style={{ color: '#1f2937', margin: 0 }}>
                🏛️ Subspace Foundation ({foundationPercent}%)
              </h3>
              <button style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'transform 0.3s ease'
              }}>
                {expandedSections.subspaceFoundation ? '−' : '+'}
              </button>
            </div>
            {expandedSections.subspaceFoundation && (
              <div style={{ 
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ marginLeft: '20px' }}>
                  <p>• <strong>Operations:</strong> {formatNumber(foundation.operations.tokens)} tokens ({foundation.operations.percent.toFixed(2)}%) - <span style={{color: '#10b981'}}>{foundation.operations.vesting === 'unlocked' ? 'Unlocked' : 'Locked'}</span></p>
                  <p>• <strong>Near-Term Treasury:</strong> {formatNumber(foundation.nearTermTreasury.tokens)} tokens ({foundation.nearTermTreasury.percent.toFixed(2)}%) - <span style={{color: '#f59e0b'}}>Dynamic</span></p>
                  <p>• <strong>Guardians of Growth Staking Incentive:</strong> {formatNumber(foundation.GuardiansOfGrowthStakingIncentive.tokens)} tokens ({foundation.GuardiansOfGrowthStakingIncentive.percent.toFixed(2)}%) - <span style={{color: '#f59e0b'}}>Dynamic</span></p>
                  <p>• <strong>Long-Term Treasury:</strong> {formatNumber(foundation.longTermTreasury.tokens)} tokens ({foundation.longTermTreasury.percent.toFixed(2)}%) - <span style={{color: '#f59e0b'}}>{foundation.longTermTreasury.vesting === 'locked' ? 'Locked' : 'Unlocked'}</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Testnets */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: expandedSections.testnets ? '15px' : '0'
            }} onClick={() => toggleSection('testnets')}>
              <h3 style={{ color: '#1f2937', margin: 0 }}>
                🧪 Testnets/Stake Wars ({testnetsPercent}%)
              </h3>
              <button style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'transform 0.3s ease'
              }}>
                {expandedSections.testnets ? '−' : '+'}
              </button>
            </div>
            {expandedSections.testnets && (
              <div style={{ 
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ marginLeft: '20px' }}>
                  <p>• <strong>Testnet Rewards:</strong> {formatNumber(testnets.testnetRewards.tokens)} tokens ({testnets.testnetRewards.percent.toFixed(2)}%) - <span style={{color: '#10b981'}}>{testnets.testnetRewards.vesting === 'unlocked' ? 'Unlocked' : 'Locked'}</span></p>
                  <p>• <strong>Stake Wars 1:</strong> {formatNumber(testnets.stakeWars1.tokens)} tokens ({testnets.stakeWars1.percent.toFixed(2)}%) - <span style={{color: '#10b981'}}>{testnets.stakeWars1.vesting === 'unlocked' ? 'Unlocked' : 'Locked'}</span></p>
                  <p>• <strong>Stake Wars 2:</strong> {formatNumber(testnets.stakeWars2.tokens)} tokens ({testnets.stakeWars2.percent.toFixed(2)}%) - <span style={{color: '#f59e0b'}}>{testnets.stakeWars2.vesting === 'locked' ? 'Locked' : 'Unlocked'}</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Partners & Ambassadors */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: expandedSections.partnersAmbassadors ? '15px' : '0'
            }} onClick={() => toggleSection('partnersAmbassadors')}>
              <h3 style={{ color: '#1f2937', margin: 0 }}>
                🤝 Partners & Ambassadors ({partnersAmbassadorsPercent}%)
              </h3>
              <button style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'transform 0.3s ease'
              }}>
                {expandedSections.partnersAmbassadors ? '−' : '+'}
              </button>
            </div>
            {expandedSections.partnersAmbassadors && (
              <div style={{ 
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ marginLeft: '20px' }}>
                  <p>• <strong>Vendors:</strong> {formatNumber(vendors.tokens)} tokens ({vendors.percent.toFixed(2)}%) - <span style={{color: '#f59e0b'}}>{vendors.vesting === 'locked' ? 'Locked' : 'Unlocked'}</span></p>
                  <p>• <strong>Ambassadors:</strong> {formatNumber(ambassadors.tokens)} tokens ({ambassadors.percent.toFixed(2)}%) - <span style={{color: '#f59e0b'}}>{ambassadors.vesting === 'locked' ? 'Locked' : 'Unlocked'}</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Farmer Rewards */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f0f9ff'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: expandedSections.farmerRewards ? '15px' : '0'
            }} onClick={() => toggleSection('farmerRewards')}>
              <h3 style={{ color: '#1f2937', margin: 0 }}>
                🌾 Farmer Rewards (35.00%)
              </h3>
              <button style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'transform 0.3s ease'
              }}>
                {expandedSections.farmerRewards ? '−' : '+'}
              </button>
            </div>
            {expandedSections.farmerRewards && (
              <div style={{ 
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                <p><strong>{formatNumber(350_000_000)} tokens</strong></p>
                <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                  Minted as block rewards for farmers. The portion already minted appears in the on-chain supply above.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '50px', 
        paddingTop: '30px',
        borderTop: '1px solid #e5e7eb',
        color: '#6b7280'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <a 
            href="https://subspace.foundation/tokenomics" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              marginRight: '30px',
              fontSize: '1.1rem'
            }}
          >
            Official Tokenomics
          </a>
          <a 
            href="https://github.com/autonomys-community/autonomys_circulating_supply" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              fontSize: '1.1rem'
            }}
          >
            Code Repository
          </a>
        </div>
        <p style={{ fontSize: '0.9rem', marginTop: '15px' }}>
          Real-time calculations using on-chain data from consensus and domain layers
        </p>
      </footer>
    </div>
  );
}