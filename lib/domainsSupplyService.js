// Domain token supply service using Autonomys Auto SDK
import { activate, parseTokenAmount } from '@autonomys/auto-utils';
import { domains, totalIssuance } from '@autonomys/auto-consensus';

/**
 * Get the total token supply across all domains
 * @param {string} networkId - Network ID (default: 'mainnet')
 * @returns {Promise<number>} Total domain token supply in AI3 units
 */
export async function getDomainTokenSupply(networkId = 'mainnet') {
  try {
    const api = await activate({ networkId });

    try {
      // Get all domain registries
      const domainsList = await domains(api);

      console.log(domainsList, "domainsList");
      
      let totalDomainSupply = 0;
      
      // Iterate through each domain and sum their token issuance
      for (const domain of domainsList) {
        try {
          // Get total issuance for this specific domain
          const domainIssuance = await totalIssuance(domain);
          
          // Convert from shannons to AI3 tokens using Auto SDK precision
          const domainSupplyAI3 = Number(parseTokenAmount(domainIssuance.toString())).toFixed(4);
          
          // Add to total supply
          totalDomainSupply += parseFloat(domainSupplyAI3);
          
        } catch (domainError) {
          console.warn(`Error fetching issuance for domain ${domain.domainId}:`, domainError.message);
          // Continue processing other domains even if one fails
        }
      }
      
      // Return rounded total to match Auto Portal calculation
      return Math.round(totalDomainSupply);

    } finally {
      await api.disconnect();
    }

  } catch (error) {
    console.error('Error fetching domain token supply:', error);
    return 0;
  }
}