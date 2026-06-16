export interface IExchangeRateResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string | Date;
  time_next_update_unix: number;
  time_next_update_utc: string | Date;
  base_code: string;
  conversion_rates: Record<string, number>;
}
