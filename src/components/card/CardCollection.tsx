import React from 'react';
import { Card } from '../../types';

interface CardCollectionProps {
  cards: Card[];
}

const CardCollection: React.FC<CardCollectionProps> = ({ cards }) => (
  <div className="card-grid">
    {cards.map(card => (
      <div key={card.id} className="card-tile">
        <img src={card.image || '/fallback.png'} alt={card.name} className="card-img" />
        <div className="card-details">
          <div className="card-name">{card.name}</div>
          <div className="card-set">{card.set?.name}</div>
          <div className="card-category">{card.category}</div>
          <div className="card-rarity">{card.rarity}</div>
          {/* Optionally list variants */}
          <div className="card-variants">
            {card.variants.normal && <span>Normal</span>}
            {card.variants.holo && <span>Holofoil</span>}
            {card.variants.reverse && <span>Reverse Holo</span>}
            {card.variants.firstEdition && <span>1st Edition</span>}
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default CardCollection;
