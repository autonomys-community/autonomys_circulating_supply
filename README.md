# Autonomys Token Distribution

Simple one-page app showing $AI3 token distribution and circulating supply API for Autonomys Network Consensus Chain.

## Quick Start

```bash
npm install
npm run dev
```

Visit `https://www.ai3-supply.xyz/`

## API

### Full Data Endpoint
**POST** `https://www.ai3-supply.xyz/api/circulating-supply`

```bash
# Current data
curl -X POST https://www.ai3-supply.xyz/api/circulating-supply

# Historical data
curl -X POST https://www.ai3-supply.xyz/api/circulating-supply \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-12-31T00:00:00Z"}'
```

### Simple Value Endpoints
**GET** `https://www.ai3-supply.xyz/api/circulating-supply`
- Returns just the circulating supply number (e.g., `111862763`)

**GET** `https://www.ai3-supply.xyz/api/total-supply`
- Returns the total supply number (`1000000000`)

```bash
# Get current circulating supply
curl https://www.ai3-supply.xyz/api/circulating-supply

# Get total supply
curl https://www.ai3-supply.xyz/api/total-supply
```

## Features

- Real-time circulating supply calculations
- Token distribution breakdown with vesting schedules
- Multiple API endpoints for different use cases
- Mobile-responsive design

## Links

- [Official Tokenomics](https://subspace.foundation/tokenomics)