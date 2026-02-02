export const DUMMY_TRENDING_COINS: TrendingCoin[] = [
  {
    item: {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      market_cap_rank: 1,
      thumb: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      data: {
        price: 43250.5,
        price_change_percentage_24h: { usd: 2.34 },
      },
    },
  },
  {
    item: {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      market_cap_rank: 2,
      thumb: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      large: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      data: {
        price: 2280.75,
        price_change_percentage_24h: { usd: -1.2 },
      },
    },
  },
  {
    item: {
      id: 'tether',
      name: 'Tether',
      symbol: 'USDT',
      market_cap_rank: 3,
      thumb: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
      large: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
      data: {
        price: 1.0,
        price_change_percentage_24h: { usd: 0.01 },
      },
    },
  },
  {
    item: {
      id: 'binancecoin',
      name: 'BNB',
      symbol: 'BNB',
      market_cap_rank: 4,
      thumb: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
      large: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      data: {
        price: 315.42,
        price_change_percentage_24h: { usd: 3.15 },
      },
    },
  },
  {
    item: {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      market_cap_rank: 5,
      thumb: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
      large: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      data: {
        price: 98.25,
        price_change_percentage_24h: { usd: 5.67 },
      },
    },
  },
  {
    item: {
      id: 'ripple',
      name: 'XRP',
      symbol: 'XRP',
      market_cap_rank: 6,
      thumb: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
      large: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
      data: {
        price: 0.52,
        price_change_percentage_24h: { usd: -0.45 },
      },
    },
  },
]

export const DUMMY_CATEGORIES: Category[] = [
  {
    name: 'DeFi',
    top_3_coins: ['ethereum', 'uniswap', 'aave'],
    market_cap_change_24h: 4.2,
    market_cap: 45000000000,
    volume_24h: 3200000000,
  },
  {
    name: 'Layer 1',
    top_3_coins: ['ethereum', 'solana', 'avalanche-2'],
    market_cap_change_24h: 2.8,
    market_cap: 280000000000,
    volume_24h: 15000000000,
  },
  {
    name: 'Meme',
    top_3_coins: ['dogecoin', 'shiba-inu', 'pepe'],
    market_cap_change_24h: 12.5,
    market_cap: 18000000000,
    volume_24h: 4200000000,
  },
]
