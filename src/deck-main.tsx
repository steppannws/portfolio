import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import { Deck } from './components/deck/Deck';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Deck />
  </StrictMode>
);
