import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'
import AppContextProvider from './context/AppContext.jsx'
import { CartProvider } from './context/CartContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <CartProvider>
        <App />
        </CartProvider> 
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
