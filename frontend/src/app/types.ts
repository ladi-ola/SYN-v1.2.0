export interface ApiMarket {
  market_id: string;
  question: string;
  category: string;
  yes_price: number;
  no_price: number;
  volume: number;
  volume_24h: number;
  liquidity: number;
  end_date: string;
  market_url: string;
  time_bucket: string;
  historical_accuracy: number;
  volume_score: number;
  price_score: number;
  final_score: number;
}

export interface ApiMarketsResponse {
  count: number;
  markets: ApiMarket[];
  updated_at: string;
}
