# Autonomys Token Distribution

Simple one-page app showing $AI3 token distribution and circulating supply API for Autonomys Network Consensus Chain.

## Quick Start

```bash
npm install
npm run dev
```

Visit [https://www.ai3-supply.xyz/](https://www.ai3-supply.xyz/)

## API

### Full Data Endpoint
**POST** `https://www.ai3-supply.xyz/api`

```bash
# Current data
curl -X POST https://www.ai3-supply.xyz/api

# Historical data
curl -X POST https://www.ai3-supply.xyz/api \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-12-31T00:00:00Z"}'
```

### Simple Value Endpoints
**GET** `https://www.ai3-supply.xyz/total-supply`
- Returns just the total supply number (e.g., `1000000000`)

**GET** `https://www.ai3-supply.xyz/circulating-supply`
- Returns just the circulating supply number (e.g., `111862763`)

```bash
# Get current circulating supply
curl https://www.ai3-supply.xyz/circulating-supply

# Get total supply
curl https://www.ai3-supply.xyz/total-supply

# Get total staked amount
curl https://www.ai3-supply.xyz/staking-info

# Get detailed staking information
curl https://www.ai3-supply.xyz/staking-info?detailed=true
```

## Features

- Real-time circulating supply calculations
- Integration with Autonomys Auto SDK for live staking data
- Token distribution breakdown with vesting schedules
- Multiple API endpoints for different use cases
- Mobile-responsive design
- Staking information API for monitoring

## Links

- [Official Tokenomics](https://subspace.foundation/tokenomics)
- [This Code Repository](https://github.com/autonomys-community/autonomys_circulating_supply)
- [BlockScience Research](https://github.com/BlockScience/subspace) - Dynamic reward issuance model
