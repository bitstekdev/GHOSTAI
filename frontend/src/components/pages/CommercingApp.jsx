import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import StoryFlipbook from './FlipBook';
import Cart from './Cart';
import Checkout from './Checkout';
import Payment from './Payment';
import Success from './Success';

export const CommercingApp = ({ storyId = null }) => {
  const [currentView, setCurrentView] = useState('home');
  const { addToCart } = useCart();

  const handleAddToCart = (story) => {
    addToCart(story);
    setCurrentView('cart');
  };

  const handleOrderNow = (story) => {
    addToCart(story);
    setCurrentView('checkout');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <StoryFlipbook
            storyId={storyId}
            onAddToCart={handleAddToCart}
            onOrderNow={handleOrderNow}
          />
        );
      case 'cart':
        return <Cart onNavigate={setCurrentView} />;
      case 'checkout':
        return <Checkout onNavigate={setCurrentView} />;
      case 'payment':
        return <Payment onNavigate={setCurrentView} />;
      case 'success':
        return <Success onNavigate={setCurrentView} />;
      default:
        return (
          <StoryFlipbook
            storyId={storyId}
            onAddToCart={handleAddToCart}
            onOrderNow={handleOrderNow}
          />
        );
    }
  };

  return renderView();
};

export default CommercingApp;
