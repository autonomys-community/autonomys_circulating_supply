import React from 'react';
import { totalIssuance, domains, query } from '@autonomys/auto-consensus';
import { activate } from '@autonomys/auto-utils';

const NETWORK_ID = 'mainnet';
const SHANNONS_PER_TOKEN = 10n ** 18n;

function formatTokens(shannons) {
  const whole = shannons / SHANNONS_PER_TOKEN;
  const fraction = (shannons % SHANNONS_PER_TOKEN) * 100n / SHANNONS_PER_TOKEN;
  return `${whole.toString()}.${fraction.toString().padStart(2, '0')}`;
}

function formatWithCommas(str) {
  const [intPart, decPart] = str.split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart ? `${formatted}.${decPart}` : formatted;
}

async function fetchDomainData(api, domain) {
  try {
    // Try multiple approaches to get domain token data
    let issuance = null;
    
    // Approach 1: Query domain-specific balances module
    try {
      issuance = await query(api, 'domains.domainRuntimeInfo', [domain.domainId]);
      if (issuance?.totalIssuance) {
        issuance = issuance.totalIssuance;
      }
    } catch (e1) {
      // Approach 2: Try querying domain block info
      try {
        const domainBlock = await query(api, 'domains.latestConfirmedDomainBlock', [domain.domainId]);
        if (domainBlock?.executionReceipt?.totalIssuance) {
          issuance = domainBlock.executionReceipt.totalIssuance;
        }
      } catch (e2) {
        // Approach 3: Try direct domain execution environment query
        try {
          issuance = await query(api, 'domains.executionReceipt', [domain.domainId]);
          if (issuance?.totalIssuance) {
            issuance = issuance.totalIssuance;
          }
        } catch (e3) {
          // All approaches failed
          issuance = null;
        }
      }
    }
    
    const tokens = issuance ? formatTokens(BigInt(issuance.toString())) : 'N/A';
    
    return {
      id: domain.domainId,
      name: domain.domainConfig?.domainName || `Domain ${domain.domainId}`,
      tokens
    };
  } catch (error) {
    return {
      id: domain.domainId,
      name: domain.domainConfig?.domainName || `Domain ${domain.domainId}`,
      tokens: 'N/A'
    };
  }
}

export async function getServerSideProps() {
  let consensusTokens = '0.00';
  let domainsData = [];
  let error = null;

  try {
    // Get consensus chain token issuance
    const consensusIssuance = await totalIssuance(NETWORK_ID);
    const issuanceAmount = BigInt(consensusIssuance.toString());
    consensusTokens = formatTokens(issuanceAmount);

    // Get domain data
    const api = await activate({ networkId: NETWORK_ID });
    const domainsList = await domains(api);
    domainsData = await Promise.all(domainsList.map(domain => fetchDomainData(api, domain)));
    await api.disconnect();

  } catch (e) {
    error = e.message || String(e);
  }

  return {
    props: {
      consensusTokens,
      domainsData,
      error,
      generatedAt: new Date().toISOString()
    }
  };
}

export default function NetworkStatsPage({ consensusTokens, domainsData, error, generatedAt }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#2563eb', marginBottom: '8px' }}>
          Network Statistics
        </h1>
        <p style={{ color: '#6b7280' }}>Autonomys Mainnet</p>
      </header>

      {error && (
        <div style={{ 
          background: '#fee2e2', 
          border: '1px solid #ef4444', 
          color: '#991b1b', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #10b981, #047857)', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '0.95rem', marginBottom: '6px' }}>Consensus Chain Tokens</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{formatWithCommas(consensusTokens)}</div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '0.95rem', marginBottom: '6px' }}>Total Domains</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{domainsData.length}</div>
        </div>
      </div>

      {domainsData.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#374151', marginBottom: '12px' }}>Domains</h2>
          <div style={{ display: 'grid', gap: '8px' }}>
            {domainsData.map((domain, index) => (
              <div key={index} style={{ 
                background: '#f9fafb', 
                border: '1px solid #e5e7eb', 
                padding: '12px 16px', 
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '500' }}>{domain.name}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>ID: {domain.id}</span>
                </div>
                <div style={{ 
                  color: domain.tokens !== 'N/A' ? '#10b981' : '#6b7280', 
                  fontSize: '0.95rem',
                  fontWeight: domain.tokens !== 'N/A' ? '500' : 'normal',
                  fontStyle: domain.tokens === 'N/A' ? 'italic' : 'normal'
                }}>
                  {domain.tokens !== 'N/A' 
                    ? `Tokens: ${formatWithCommas(domain.tokens)}` 
                    : 'Token data unavailable'
                  }
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ marginTop: '12px', color: '#6b7280', fontSize: '0.9rem' }}>
        Generated: {generatedAt}
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <a href="/" style={{ 
          color: '#2563eb', 
          textDecoration: 'none', 
          border: '1px solid #2563eb', 
          padding: '8px 14px', 
          borderRadius: '8px' 
        }}>
          ← Back to main page
        </a>
      </div>
    </div>
  );
}