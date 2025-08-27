import { useState, useEffect } from 'react';
import { calculateCirculatingSupply, getTokenDistribution, calculateFarmingRewards, BLOCK_TIME_SECONDS, TGE_DATE } from '../lib/tokenCalculations';

export default function TokenInfo() {
  const [tokenData, setTokenData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tgeDate, setTgeDate] = useState(TGE_DATE); // July 16, 2025 12:30PM EST

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
      </header>

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
            • <strong>RPC/Consensus Layer:</strong> Shows all minted tokens (~650M+ tokens exist on-chain)
          </p>
          <p style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
            • <strong>Circulating Supply:</strong> Only counts tokens that can actually be transferred
          </p>
          <p style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
            • <strong>Key Difference:</strong> Most tokens are locked on the EVM layer with smart contracts, even though they appear "unlocked" on the consensus layer
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '50px'
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
            <h3 style={{ color: '#1f2937', margin: '0 0 15px 0' }}>
              💼 Investors (21.53%)
            </h3>
            <p><strong>{formatNumber(215_300_000)} tokens</strong></p>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              48-month lockup with 12-month cliff from TGE (July 16, 2025). 25% unlocked July 16, 2026, 
              remaining 75% released linearly over 36 months.
            </p>
          </div>

          {/* Team */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f9fafb'
          }}>
            <h3 style={{ color: '#1f2937', margin: '0 0 15px 0' }}>
              👥 Team (9.49%)
            </h3>
            <div style={{ marginLeft: '20px' }}>
              <p>• <strong>Founders:</strong> {formatNumber(20_000_000)} tokens (2.00%)</p>
              <p>• <strong>Advisors:</strong> {formatNumber(23_500_000)} tokens (2.35%)</p>
              <p>• <strong>Staff:</strong> {formatNumber(51_400_000)} tokens (5.14%)</p>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Same vesting schedule: 12-month cliff from TGE (completed July 16, 2026), then linear release over 36 months.
            </p>
          </div>

          {/* Autonomys Labs */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f9fafb'
          }}>
            <h3 style={{ color: '#1f2937', margin: '0 0 15px 0' }}>
              🏢 Autonomys Labs (9.00%)
            </h3>
            <div style={{ marginLeft: '20px' }}>
              <p>• <strong>DevCo Treasury:</strong> {formatNumber(70_000_000)} tokens (7.00%)</p>
              <p>• <strong>Market Liquidity:</strong> {formatNumber(20_000_000)} tokens (2.00%) - <span style={{color: '#10b981'}}>Unlocked at TGE</span></p>
            </div>
          </div>

          {/* Subspace Foundation */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f9fafb'
          }}>
            <h3 style={{ color: '#1f2937', margin: '0 0 15px 0' }}>
              🏛️ Subspace Foundation (15.68%)
            </h3>
            <div style={{ marginLeft: '20px' }}>
              <p>• <strong>Operations:</strong> {formatNumber(6_800_000)} tokens (0.68%) - <span style={{color: '#10b981'}}>Liquid</span></p>
              <p>• <strong>Near-Term Treasury:</strong> {formatNumber(50_000_000)} tokens (5.00%) - <span style={{color: '#f59e0b'}}>TBD</span></p>
              <p>• <strong>Long-Term Treasury:</strong> {formatNumber(100_000_000)} tokens (10.00%) - 4-year lockup</p>
            </div>
          </div>

          {/* Testnets */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f9fafb'
          }}>
            <h3 style={{ color: '#1f2937', margin: '0 0 15px 0' }}>
              🧪 Testnets/Stake Wars (6.87%)
            </h3>
            <div style={{ marginLeft: '20px' }}>
              <p>• <strong>Testnet Rewards:</strong> {formatNumber(59_700_000)} tokens (5.97%) - <span style={{color: '#10b981'}}>Unlocked</span></p>
              <p>• <strong>Stake Wars 1:</strong> {formatNumber(6_000_000)} tokens (0.60%) - <span style={{color: '#10b981'}}>Unlocked</span></p>
              <p>• <strong>Stake Wars 2:</strong> {formatNumber(3_000_000)} tokens (0.30%) - <span style={{color: '#10b981'}}>Unlocked</span></p>
            </div>
          </div>

          {/* Partners & Ambassadors */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f9fafb'
          }}>
            <h3 style={{ color: '#1f2937', margin: '0 0 15px 0' }}>
              🤝 Partners & Ambassadors (2.43%)
            </h3>
            <div style={{ marginLeft: '20px' }}>
              <p>• <strong>Partners:</strong> {formatNumber(14_300_000)} tokens (1.43%)</p>
              <p>• <strong>Ambassadors:</strong> {formatNumber(10_000_000)} tokens (1.00%)</p>
            </div>
          </div>

          {/* Farmer Rewards */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#f0f9ff'
          }}>
            <h3 style={{ color: '#1f2937', margin: '0 0 15px 0' }}>
              🌾 Farmer Rewards (35.00%)
            </h3>
            <p><strong>{formatNumber(350_000_000)} tokens</strong></p>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Minted as block rewards over ~40 years using BlockScience dynamic issuance model. 
              Rewards activated November 26, 2024. Currently issued: {formatNumber(calculateFarmingRewards(currentDate))} tokens.
            </p>
          </div>
        </div>
      </section>

      {/* Key Information */}
      <section style={{ 
        background: '#f8fafc', 
        padding: '30px', 
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          Key Information
        </h2>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong>Mainnet Phase-1:</strong> Launched November 6, 2024 - Storage & consensus layers
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Token Minting:</strong> 65% of supply (650M tokens) minted at Phase-1 launch
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Token Transferability:</strong> Disabled at protocol level until TGE (Mainnet Phase-2)
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>TGE date:</strong>  Mainnet Phase-2 launch (enabled transferability) on July 16, 2025.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Block Time:</strong> {BLOCK_TIME_SECONDS} seconds per block
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Farming Started:</strong> November 6, 2024 (rewards accumulating but not transferable until TGE)
          </li>
          <li>
            <strong>Vesting:</strong> Most allocations follow 12-month cliff + 36-month linear schedule (starts at TGE)
          </li>
        </ul>
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
        <p style={{ fontSize: '0.9rem', marginTop: '15px' }}>
          <strong>Note:</strong> API uses POST requests with real-time calculations. 
          Send POST to /api/circulating-supply for current data.
        </p>
      </footer>
    </div>
  );
}