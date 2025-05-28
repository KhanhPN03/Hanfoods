import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
  
import CartItemsList from './customerComponent/CartItemsList';
import CartSummary from './customerComponent/CartSummary';
import EmptyCart from './customerComponent/EmptyCart';
import ProductSuggestions from './customerComponent/ProductSuggestions';
 
import './css/cartPage.css';
import './css/fixScrollbars.css';
import MainFooter from '../../components/shared/MainFooter';
import MainHeader from '../../components/shared/MainHeader';
import UserService from '../../services/userService';

const CartPage = () => {
  const { cart, setCart } = useAppContext();
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(30000); // Default shipping cost
  const [discount, setDiscount] = useState(0);
  
  // Khi user mở CartPage, luôn fetch cart từ backend (nếu đã đăng nhập)
  useEffect(() => {
    const fetchCartFromBackend = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await UserService.syncCart([]); // Luôn fetch từ backend
          setCart(response);
          localStorage.setItem('coconature_cart', JSON.stringify(response));
        } catch (err) {
          setCart([]);
          localStorage.setItem('coconature_cart', '[]');
        }
      }
    };
    fetchCartFromBackend();
  }, [setCart]);

  // Calculate subtotal and shipping whenever cart changes
  useEffect(() => {
    // Calculate subtotal with proper type checking
    const calculatedSubtotal = cart.reduce(
      (total, item) => {
        // Ưu tiên lấy số từ item.price, nếu không có thì lấy từ item.productId?.price
        let price = 0;
        if (typeof item.price === 'number') {
          price = item.price;
        } else if (item.productId && typeof item.productId.price === 'number') {
          price = item.productId.price;
        } else {
          price = Number(item.price) || 0;
        }
        const quantity = Number(item.quantity) || 0;
        return total + price * quantity;
      }, 
      0
    );
    setSubtotal(calculatedSubtotal);
    // Set shipping based on subtotal - free shipping for orders over 1,000,000 VND
    if (calculatedSubtotal >= 1000000) {
      setShipping(0);
    } else {
      setShipping(30000);
    }
  }, [cart]);

  // Calculate final total
  const total = subtotal + shipping - discount;
  return (
    <div className="cart-page">
      <MainHeader />

      <main className="cart-main">
        <h1 className="cart-title">Giỏ Hàng Của Bạn</h1>
        
        {cart.length > 0 ? (
          <div className="cart-content">
            <div className="cart-items-list">
              <CartItemsList cartItems={cart} />
            </div>
            <div className="cart-summary">
              <CartSummary 
                subtotal={subtotal}
                shipping={shipping}
                discount={discount}
                total={total}
                setDiscount={setDiscount}
              />
            </div>
          </div>
        ) : (
          <EmptyCart />
        )}
      </main>
      
      <section className="related-products-section">
        <div className="container">
          <h2 className="section-title">Có thể bạn quan tâm</h2>
          <div className="related-products-wrapper">
            <ProductSuggestions />
          </div>
        </div>
      </section>
      
      <MainFooter />
    </div>
  );
};

export default CartPage;
