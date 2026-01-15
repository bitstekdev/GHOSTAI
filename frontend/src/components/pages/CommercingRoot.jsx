import React from 'react';
import { useParams } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import CommercingApp from './CommercingApp';

// ==================== ROOT COMPONENT ====================
export const CommercingRoot = () => {
  const { storyId } = useParams();
  return (
    <CartProvider>
      <CommercingApp storyId={storyId} />
    </CartProvider>
  );
};

export default CommercingRoot;
