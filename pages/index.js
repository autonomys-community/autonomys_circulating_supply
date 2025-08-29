import { useState, useEffect } from 'react';
import { calculateCirculatingSupply, getTokenDistribution, calculateFarmingRewards, BLOCK_TIME_SECONDS, TGE_DATE } from '../lib/tokenCalculations';

export default function TokenInfo() {
  const [tokenData, setTokenData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tgeDate, setTgeDate] = useState(TGE_DATE); // July 16, 2025 12:30PM EST
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
    const data = getTokenDistribution();
    const circulating = calculateCirculatingSupply(currentDate, tgeDate);
    setTokenData({ ...data, currentCirculating: circulating });
  }, [currentDate, tgeDate]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercent = (num) => {
    return (num / 1000000000 * 100).toFixed(2);
  };

  if (!tokenData) return <div>Loading...</div>;

  const lockedTokens = 1_000_000_000 - tokenData.currentCirculating;

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
          $AI3 Token Distribution
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
            📊 Official Tokenomics published by the Subspace Foundation (Source of Truth) →
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
            🔗 <span>This Code Repository (GitHub)</span>
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
            📚 <span>BlockScience Research (Dynamic Rewards Issuance Model)</span>
          </a>
        </div>
      </header>

      {/* API Quick Info - Top of Page */}
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
          🔌 <span>API Endpoints Available</span>
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '25px', opacity: 0.9 }}>
          Three simple endpoints for developers and integrations
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {/* POST /api */}
          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
              <strong>POST /api</strong>
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', opacity: 0.9 }}>
              Full data + historical queries
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

          {/* GET /total-supply */}
          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔢</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
              <strong>GET /total-supply</strong>
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', opacity: 0.9 }}>
              Total supply only (1B tokens)
            </p>
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '10px', 
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}>
              curl https://ai3-supply.xyz/total-supply
            </div>
          </div>

          {/* GET /circulating-supply */}
          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
              <strong>GET /circulating-supply</strong>
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', opacity: 0.9 }}>
              Current circulating supply
            </p>
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '10px', 
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}>
              curl https://ai3-supply.xyz/circulating-supply
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

      {/* Summary Cards - Moved to Top */}
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
            {tokenData.currentCirculating === 0 && (
              <><br /><small>TGE pending - transfers disabled</small></>
            )}
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
            {formatNumber(lockedTokens)}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
            {formatPercent(lockedTokens)}% of total
          </p>
        </div>
      </div>

      {/* RPC vs Circulating Supply Explanation */}
      <section style={{ 
        background: '#fef3c7', 
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '40px'
      }}>
        <h2 style={{ 
          fontSize: '1.3rem', 
          marginBottom: '15px', 
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          ⚠️ Important: RPC vs Circulating Supply Difference
        </h2>
        <p style={{ color: '#92400e', marginBottom: '15px' }}>
          <strong>Why RPC queries show different numbers:</strong>
        </p>
        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
            • <strong>Consensus Layer RPC:</strong> Shows all minted tokens (~650M+ tokens exist on-chain)
          </p>
          <p style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
            • <strong>Circulating Supply:</strong> Only counts tokens that can actually be transferred
          </p>
          <p style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
            • <strong>Key Difference:</strong> Querying circulating supply on the consensus chain shows tokens that will be moved to the Auto EVM domain chain, where they will be held in publicly auditable unlock contracts as per the schedule in the <a href="https://subspace.foundation/tokenomics" target="_blank" rel="noopener noreferrer" style={{color: '#92400e', textDecoration: 'underline'}}>tokenomics page</a>
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#1f2937', fontSize: '0.95rem' }}>
            <strong>Note:</strong> The consensus layer shows the total supply, but actual transferability and unlock schedules are managed through smart contracts on the EVM layer.
          </p>
        </div>
      </section>

      {/* Circulating Supply Calculation Equation */}
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
          color: '#0c4a6e',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🧮 Circulating Supply Calculation:
        </h2>
        <p style={{ color: '#0c4a6e', marginBottom: '15px' }}>
          <strong>Mathematical breakdown of how we get from 650M minted tokens to current circulating supply:</strong>
        </p>
        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '8px' }}>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '1.1rem', 
            lineHeight: '1.8',
            color: '#1f2937',
            marginBottom: '15px'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Starting Point:</strong> 650,000,000 tokens minted (65% of total supply)
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Step 1:</strong> Subtract all locked tokens
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Investors: 215,263,087 (locked until July 2026)
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Team: 94,904,634 (locked until July 2026)
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Autonomys Labs: 70,000,000 (DevCo Treasury locked)
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Subspace Foundation Treasury: 150,000,000 (locked)
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Subspace Foundation Operations: 6,782,580 (unlocked)
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Vendors & Ambassadors: 24,345,400 (locked)
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Step 2:</strong> Subtract future farming rewards (35% - already farmed)
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Total farming allocation: 350,000,000 tokens
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Already farmed: {formatNumber(calculateFarmingRewards(currentDate))} tokens
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Remaining to farm: {formatNumber(350_000_000 - calculateFarmingRewards(currentDate))} tokens
            </div>
          </div>
          
          <div style={{ 
            background: '#e0f2fe', 
            padding: '15px', 
            borderRadius: '8px',
            border: '1px solid #0ea5e9'
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', marginBottom: '10px' }}>
              <strong>Final Equation:</strong>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
              Circulating Supply = 650,000,000 - 554,513,121 (locked) - {formatNumber(350_000_000 - calculateFarmingRewards(currentDate))} (future farming)
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '1rem', marginTop: '5px' }}>
              = {formatNumber(tokenData.currentCirculating)} tokens ({formatPercent(tokenData.currentCirculating)}% of total)
            </div>
          </div>
          
          <p style={{ 
            color: '#0c4a6e', 
            fontSize: '0.95rem', 
            marginTop: '15px',
            fontStyle: 'italic'
          }}>
            <strong>Note:</strong> Only testnet rewards, stake wars rewards, and market liquidity tokens are currently unlocked and transferable.
          </p>
        </div>
      </section>

      {/* BlockScience Dynamic Issuance Model */}
      <section style={{ 
        background: '#fefce8', 
        border: '2px solid #eab308',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '40px'
      }}>
        <h2 style={{ 
          fontSize: '1.3rem', 
          marginBottom: '15px', 
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📚 BlockScience Dynamic Issuance Model
        </h2>
        <p style={{ color: '#92400e', marginBottom: '15px' }}>
          <strong>Exact mathematical equation for farming rewards calculation:</strong>
        </p>
        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '8px' }}>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '1rem', 
            lineHeight: '1.6',
            color: '#1f2937',
            marginBottom: '15px'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Source:</strong> <a href="https://academy.autonomys.xyz/autonomys-network/rewards-and-fees" target="_blank" rel="noopener noreferrer" style={{color: '#92400e', textDecoration: 'underline'}}>Autonomys Network Academy</a>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Research Repository:</strong> <a href="https://github.com/BlockScience/subspace" target="_blank" rel="noopener noreferrer" style={{color: '#92400e', textDecoration: 'underline'}}>BlockScience Subspace Economic Model</a>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Key Parameters:</strong>
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Initial Subsidy: 5.0 AI3 per block
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Max Issuance: 350,000,000 tokens (35% of total supply)
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Block Time: {BLOCK_TIME_SECONDS} seconds
            </div>
            <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
              • Decay Start: Block 0 (immediate decay from activation)
            </div>
          </div>
          
          <div style={{ 
            background: '#fef3c7', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #f59e0b',
            fontFamily: 'monospace',
            fontSize: '1.1rem'
          }}>
            <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>
              🧮 BlockScience Dynamic Issuance Equation:
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>reference_subsidy = initial_subsidy × e^(-initial_subsidy × (n - decay_block_start) / max_issuance_tokens)</strong>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#92400e', marginBottom: '15px' }}>
              Where: n = current block number, e = Euler's number (≈2.71828)
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Current Daily Production:</strong> {formatNumber(calculateFarmingRewards(currentDate) * BLOCK_TIME_SECONDS / (24 * 60 * 60))} tokens/day
            </div>
            <div style={{ fontSize: '0.9rem', color: '#92400e' }}>
              <strong>Note:</strong> This exponential decay model ensures sustainable token distribution over ~40 years
            </div>
          </div>
          
          <p style={{ 
            color: '#92400e', 
            fontSize: '0.95rem', 
            marginTop: '15px',
            fontStyle: 'italic'
          }}>
            <strong>Implementation:</strong> This equation is implemented in the <a href="https://github.com/autonomys-community/autonomys_circulating_supply" target="_blank" rel="noopener noreferrer" style={{color: '#92400e', textDecoration: 'underline'}}>autonomys_circulating_supply</a> repository using efficient chunked calculations for real-time updates.
          </p>
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
                💼 Investors (21.53%)
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
                <p><strong>{formatNumber(215_263_087)} tokens</strong></p>
                <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                  48-month lockup with 12-month cliff from TGE (July 16, 2025). 25% unlocked July 16, 2026, 
                  remaining 75% released linearly over 36 months.
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
                👥 Team (9.49%)
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
                  <p>• <strong>Founders + Staff:</strong> {formatNumber(71_426_634)} tokens (7.14%)</p>
                  <p>• <strong>Advisors:</strong> {formatNumber(23_478_000)} tokens (2.35%)</p>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                  Same vesting schedule: 12-month cliff from TGE (completed July 16, 2026), then linear release over 36 months.
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
                🏢 Autonomys Labs (9.00%)
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
                  <p>• <strong>DevCo Treasury:</strong> {formatNumber(70_000_000)} tokens (7.00%)</p>
                  <p>• <strong>Market Liquidity:</strong> {formatNumber(20_000_000)} tokens (2.00%) - <span style={{color: '#10b981'}}>Unlocked at TGE</span></p>
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
                🏛️ Subspace Foundation (15.68%)
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
                  <p>• <strong>Operations:</strong> {formatNumber(6_782_580)} tokens (0.68%) - <span style={{color: '#10b981'}}>Liquid</span></p>
                  <p>• <strong>Foundation Treasury:</strong> {formatNumber(150_000_000)} tokens (15.00%) - <span style={{color: '#f59e0b'}}>Locked</span></p>
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
                🧪 Testnets/Stake Wars (6.87%)
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
                  <p>• <strong>Testnet Rewards:</strong> {formatNumber(59_700_000)} tokens (5.97%) - <span style={{color: '#10b981'}}>Unlocked</span></p>
                  <p>• <strong>Stake Wars 1:</strong> {formatNumber(6_000_000)} tokens (0.60%) - <span style={{color: '#10b981'}}>Unlocked</span></p>
                  <p>• <strong>Stake Wars 2:</strong> {formatNumber(3_000_000)} tokens (0.30%) - <span style={{color: '#f59e0b'}}>Locked</span></p>
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
                🤝 Partners & Ambassadors (2.43%)
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
                  <p>• <strong>Vendors:</strong> {formatNumber(14_345_400)} tokens (1.43%)</p>
                  <p>• <strong>Ambassadors:</strong> {formatNumber(10_000_000)} tokens (1.00%)</p>
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
                  Minted as block rewards over ~40 years using BlockScience dynamic issuance model. 
                  Rewards activated November 26, 2024. Currently issued: {formatNumber(calculateFarmingRewards(currentDate))} tokens.
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
            📊 Official Tokenomics →
          </a>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <a 
            href="https://github.com/autonomys-community/autonomys_circulating_supply" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              marginRight: '30px',
              fontSize: '1.1rem'
            }}
          >
            🔗 This Code Repository (GitHub) →
          </a>
          <a 
            href="https://github.com/BlockScience/subspace" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              marginRight: '30px',
              fontSize: '1.1rem'
            }}
          >
            📚 BlockScience Research (Dynamic Rewards Issuance Model) →
          </a>
        </div>
        <p style={{ fontSize: '0.9rem', marginTop: '15px' }}>
          <strong>Note:</strong> API uses POST requests with real-time calculations. 
          Send POST to https://ai3-supply.xyz/api/ for the current data.
        </p>
        <p style={{ fontSize: '0.9rem', marginTop: '10px', color: '#9ca3af' }}>
          <strong>Sources:</strong> Dynamic reward issuance calculations based on <a href="https://github.com/BlockScience/subspace" target="_blank" rel="noopener noreferrer" style={{color: '#6b7280', textDecoration: 'underline'}}>BlockScience's Subspace economic model</a> research.
        </p>
      </footer>
    </div>
  );
}