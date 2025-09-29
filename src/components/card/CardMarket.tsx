import React from 'react';
import { Card } from '../../types';

interface CardMarketProps {
  card: Card;
}

const CardMarket: React.FC<CardMarketProps> = ({ card }) => {
  const tcgplayer = card.pricing?.tcgplayer;
  const cardmarket = card.pricing?.cardmarket;

  return (
    <div className="market-prices">
      <h3>TCGplayer Prices</h3>
      {tcgplayer ? (
        <table>
          <thead>
            <tr>
              <th>Variant</th>
              <th>Market</th>
              <th>Low</th>
              <th>Mid</th>
              <th>High</th>
              <th>Direct Low</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tcgplayer).map(([variant, prices]) =>
              typeof prices === 'object' && prices !== null ? (
                <tr key={variant}>
                  <td>{variant}</td>
                  <td>{prices.marketPrice ?? '-'}</td>
                  <td>{prices.lowPrice ?? '-'}</td>
                  <td>{prices.midPrice ?? '-'}</td>
                  <td>{prices.highPrice ?? '-'}</td>
                  <td>{prices.directLowPrice ?? '-'}</td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      ) : <div>No TCGplayer price found</div>}

      <h3>Cardmarket Prices</h3>
      {cardmarket ? (
        <table>
          <tbody>
            <tr><td>Avg (non-foil):</td><td>{cardmarket.avg ?? '-'}</td></tr>
            <tr><td>Low (non-foil):</td><td>{cardmarket.low ?? '-'}</td></tr>
            <tr><td>Trend (non-foil):</td><td>{cardmarket.trend ?? '-'}</td></tr>
            <tr><td>Avg1 (24h):</td><td>{cardmarket.avg1 ?? '-'}</td></tr>
            <tr><td>Avg7 (7d):</td><td>{cardmarket.avg7 ?? '-'}</td></tr>
            <tr><td>Avg30 (30d):</td><td>{cardmarket.avg30 ?? '-'}</td></tr>
            <tr><td>Avg (foil):</td><td>{cardmarket.avg_holo ?? '-'}</td></tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      ) : <div>No Cardmarket price found</div>}
    </div>
  );
};

export default CardMarket;