import React from 'react';
import { Card } from '../../types';

interface CardInfoProps {
  card: Card;
}

const CardInfo: React.FC<CardInfoProps> = ({ card }) => (
  <div className="card-info">
    <img src={card.image || '/fallback.png'} alt={card.name} className="card-img-large" />
    <h2>{card.name}</h2>
    <div>
      <strong>Set:</strong> {card.set?.name} <br />
      <strong>Category:</strong> {card.category} <br />
      <strong>Rarity:</strong> {card.rarity} <br />
      <strong>Local ID:</strong> {card.localId}
    </div>
    {card.category === 'Pokemon' && (
      <>
        <div><strong>HP:</strong> {card.hp}</div>
        <div><strong>Types:</strong> {card.types?.join(', ')}</div>
        <div><strong>Abilities:</strong> {card.abilities?.map(a => (
          <div key={a.name}><em>{a.name}</em>: {a.effect}</div>
        ))}</div>
        <div><strong>Attacks:</strong> {card.attacks?.map(atk => (
          <div key={atk.name}><em>{atk.name}</em> ({atk.cost.join(', ')}): {atk.damage} - {atk.effect}</div>
        ))}</div>
        <div><strong>Weaknesses:</strong> {card.weaknesses?.map(w => (
          <span key={w.type}>{w.type}: {w.value} </span>
        ))}</div>
        <div><strong>Resistances:</strong> {card.resistances?.map(r => (
          <span key={r.type}>{r.type}: {r.value} </span>
        ))}</div>
        <div><strong>Retreat:</strong> {card.retreat}</div>
        <div><strong>Description:</strong> {card.description}</div>
        <div><strong>Evolve From:</strong> {card.evolveFrom}</div>
      </>
    )}
    {card.category === 'Trainer' && (
      <>
        <div><strong>Effect:</strong> {card.effect}</div>
        <div><strong>Trainer Type:</strong> {card.trainerType}</div>
      </>
    )}
    {card.category === 'Energy' && (
      <>
        <div><strong>Effect:</strong> {card.effect}</div>
        <div><strong>Energy Type:</strong> {card.energyType}</div>
      </>
    )}
    {/* Pricing component */}
    {card.pricing && <div><strong>Pricing:</strong><CardMarket card={card} /></div>}
  </div>
);

export default CardInfo;
