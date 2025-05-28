import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

import CheckoutSummary from "./customerComponent/CheckoutSummary";

import { orderAPI } from "../../services/apiService";
import addressService from "../../services/addressService";
import "./css/checkoutPage.css";
import "./css/checkoutScrollFix.css"; // Fix scrolling issues
import MainHeader from "../../components/shared/MainHeader";
import MainFooter from "../../components/shared/MainFooter";

const CheckoutStepTwo = () => {
  const navigate = useNavigate();
  const { cart, addNotification, clearCart } = useAppContext();
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(30000);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [addressData, setAddressData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Check if cart is empty, redirect to cart page
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
      addNotification("Giỏ hàng của bạn đang trống", "warning");
      return;
    }

    // Retrieve address data from local storage
    const storedAddress = localStorage.getItem("checkoutAddress");
    if (!storedAddress) {
      navigate("/checkout");
      addNotification("Vui lòng nhập thông tin giao hàng trước", "warning");
      return;
    }

    try {
      setAddressData(JSON.parse(storedAddress));
    } catch (error) {
      console.error("Failed to parse address data:", error);
      navigate("/checkout");
      addNotification(
        "Có lỗi xảy ra với thông tin giao hàng, vui lòng thử lại",
        "error"
      );
    }
  }, [cart, navigate, addNotification]);

  // Calculate totals
  useEffect(() => {
    const calculatedSubtotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    setSubtotal(calculatedSubtotal);

    if (calculatedSubtotal >= 1000000) {
      setShipping(0);
    } else {
      setShipping(30000);
    }
  }, [cart]);

  const total = subtotal + shipping;

  // Handle payment selection
  const handlePaymentChange = (method) => {
    setSelectedPayment(method);
  };  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!addressData) {
      addNotification("Vui lòng nhập thông tin giao hàng", "error");
      navigate("/checkout");
      return;
    }

    setIsProcessing(true);

    try {
      // For VietQR payment, show QR code first
      if (selectedPayment === "vietqr") {
        setShowQRCode(true);
        return;
      }

      // Find or create address to prevent duplicates
      const addressPayload = {
        fullName: addressData.fullName,
        phone: addressData.phone,
        address: addressData.address,
        province: addressData.city,
        district: addressData.district,
        ward: addressData.ward,
        notes: addressData.notes || ""
      };

      const addressResponse = await addressService.findOrCreateAddress(addressPayload);
      const finalAddress = addressResponse.address;

      // For COD, create order with pending status
      const orderItems = cart.map((item) => ({
        productId: item.id,
        name: item.name, // Thêm tên sản phẩm
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const orderData = {
        items: orderItems,
        shippingAddress: {
          fullName: finalAddress.fullName,
          phone: finalAddress.phone,
          address: finalAddress.street || finalAddress.address,
          province: finalAddress.city || finalAddress.province,
          district: finalAddress.state || finalAddress.district,
          ward: finalAddress.ward,
          notes: finalAddress.notes || "",
        },
        addressId: finalAddress._id, // Include address ID for reference
        email: addressData.email, // Bổ sung email
        paymentMethod: selectedPayment,
        status: "pending", // For COD, status is pending
        subtotal,
        shippingFee: shipping,
        totalAmount: total, // Đúng tên trường backend yêu cầu
      };

      // Log the order for debugging
      console.log("Submitting order:", orderData);

      // Call API to create order
      const response = await orderAPI.createOrder(orderData);
      if (response.data.success) {
        // Clear cart from context
        clearCart();

        // Clear checkout data
        localStorage.removeItem("checkoutAddress");

        // Navigate to order confirmation
        navigate("/order-success", { state: { orderId: response.data.order._id } });
        addNotification("Đặt hàng thành công!", "success");
      } else {
        throw new Error(response.data.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Order submission error:", error);
      addNotification(
        "Có lỗi xảy ra khi đặt hàng: " + (error.message || "Vui lòng thử lại"),
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  };  // Handle VietQR payment confirmation
  const handleVietQRPaymentConfirm = async () => {
    try {
      setIsProcessing(true);

      // Find or create address to prevent duplicates
      const addressPayload = {
        fullName: addressData.fullName,
        phone: addressData.phone,
        address: addressData.address,
        province: addressData.city,
        district: addressData.district,
        ward: addressData.ward,
        notes: addressData.notes || ""
      };

      const addressResponse = await addressService.findOrCreateAddress(addressPayload);
      const finalAddress = addressResponse.address;

      // Create order object with shipping status for VietQR
      const orderItems = cart.map((item) => ({
        productId: item.id,
        name: item.name, // Thêm tên sản phẩm
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const orderData = {
        items: orderItems,
        shippingAddress: {
          fullName: finalAddress.fullName,
          phone: finalAddress.phone,
          address: finalAddress.street || finalAddress.address,
          province: finalAddress.city || finalAddress.province,
          district: finalAddress.state || finalAddress.district,
          ward: finalAddress.ward,
          notes: finalAddress.notes || "",
        },
        addressId: finalAddress._id, // Include address ID for reference
        email: addressData.email, // Bổ sung email
        paymentMethod: selectedPayment,
        status: "paid", // For VietQR, status is paid after confirmation
        subtotal,
        shippingFee: shipping,
        totalAmount: total, // Đúng tên trường backend yêu cầu
        isPaid: true,
        paidAt: new Date(),
      };

      // Log the order for debugging
      console.log("VietQR payment confirmation - creating order:", orderData);
      // Call API to create order
      const response = await orderAPI.createOrder(orderData);

      if (response.data.success) {
        // Clear cart from context
        clearCart();

        // Clear cart and checkout data
        localStorage.removeItem("checkoutAddress");

        // Navigate to order confirmation
        navigate("/order-success", { state: { orderId: response.data.order._id } });
        addNotification(
          "Thanh toán thành công! Đơn hàng đã được xác nhận.",
          "success"
        );
      } else {
        throw new Error(
          response.data.message || "Failed to create order with VietQR payment"
        );
      }
    } catch (error) {
      console.error("VietQR payment confirmation error:", error);
      addNotification(
        "Có lỗi xảy ra khi xác nhận thanh toán: " +
          (error.message || "Vui lòng thử lại"),
        "error"
      );
      setShowQRCode(false); // Go back to payment selection if there's an error
    } finally {
      setIsProcessing(false);
    }
  };

  if (!addressData) {
    return <div>Loading...</div>;
  }
  return (
    <div className="checkout-page checkout-page-wrapper">
      {" "}
      <MainHeader/>
      <main className="checkout-main">
        <div className="checkout-steps">
          <div className="step completed">
            <div className="step-number">✓</div>
            <div className="step-title">Thông tin giao hàng</div>
          </div>
          <div className="step-connector completed"></div>
          <div className="step active">
            <div className="step-number">2</div>
            <div className="step-title">Phương thức thanh toán</div>
          </div>
        </div>

        {showQRCode ? (
          <div className="vietqr-payment-container">
            <h2>Quét mã QR để thanh toán</h2>
            <div className="qr-code-container">
              <img
                src="https://placeholder.pics/svg/300x300/FFFFFF-DEDEDE/000000/VietQR+Payment"
                alt="VietQR Payment Code"
                className="qr-code-image"
              />
            </div>
            <div className="payment-instructions">
              <h3>Hướng dẫn thanh toán:</h3>
              <ol>
                <li>Mở ứng dụng ngân hàng hoặc ví điện tử của bạn</li>
                <li>Quét mã QR bên trên</li>
                <li>Xác nhận thông tin giao dịch</li>
                <li>Hoàn tất thanh toán</li>
              </ol>
              <p className="payment-amount">
                <strong>Số tiền:</strong> {total.toLocaleString()}đ
              </p>
              <p className="payment-note">
                <strong>Nội dung chuyển khoản:</strong> Thanh toan don hang #
                {Math.floor(Math.random() * 1000000)}
              </p>
            </div>
            <div className="payment-actions">
              <button
                className="back-button"
                onClick={() => setShowQRCode(false)}
              >
                Quay lại
              </button>
              <button
                className="confirm-payment-button"
                onClick={handleVietQRPaymentConfirm}
              >
                Đã thanh toán
              </button>
            </div>
          </div>
        ) : (
          <div className="checkout-content">
            <div className="checkout-form-section">
              <h2>Chọn phương thức thanh toán</h2>

              <div className="payment-methods-selection">
                <div
                  className={`payment-method ${
                    selectedPayment === "cod" ? "selected" : ""
                  }`}
                  onClick={() => handlePaymentChange("cod")}
                >
                  <div className="payment-method-radio">
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      checked={selectedPayment === "cod"}
                      onChange={() => handlePaymentChange("cod")}
                    />
                    <label htmlFor="cod"></label>
                  </div>
                  <div className="payment-method-icon cod-icon">💰</div>
                  <div className="payment-method-details">
                    <h3>Thanh toán khi nhận hàng (COD)</h3>
                    <p>Bạn chỉ phải thanh toán khi nhận được hàng</p>
                  </div>
                </div>

                <div
                  className={`payment-method ${
                    selectedPayment === "vietqr" ? "selected" : ""
                  }`}
                  onClick={() => handlePaymentChange("vietqr")}
                >
                  <div className="payment-method-radio">
                    <input
                      type="radio"
                      id="vietqr"
                      name="payment"
                      checked={selectedPayment === "vietqr"}
                      onChange={() => handlePaymentChange("vietqr")}
                    />
                    <label htmlFor="vietqr"></label>
                  </div>
                  <div className="payment-method-icon vietqr-icon">🏦</div>
                  <div className="payment-method-details">
                    <h3>Chuyển khoản qua VietQR</h3>
                    <p>Chuyển khoản bằng ứng dụng ngân hàng của bạn</p>
                  </div>
                </div>
              </div>

              <div className="shipping-address-review">
                <h3>Thông tin giao hàng</h3>
                <div className="address-details">
                  <p>
                    <strong>{addressData.fullName}</strong> |{" "}
                    {addressData.phone}
                  </p>
                  <p>
                    {addressData.address}, {addressData.ward},{" "}
                    {addressData.district}, {addressData.city}
                  </p>
                  {addressData.notes && (
                    <p>
                      <strong>Ghi chú:</strong> {addressData.notes}
                    </p>
                  )}
                </div>
                <button
                  className="edit-address-button"
                  onClick={() => navigate("/checkout")}
                >
                  Chỉnh sửa
                </button>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="back-button"
                  onClick={() => navigate("/checkout")}
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  className={`place-order-button ${
                    isProcessing ? "processing" : ""
                  }`}
                  onClick={handleSubmitOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
                </button>
              </div>
            </div>

            <CheckoutSummary
              subtotal={subtotal}
              shipping={shipping}
              total={total}
              showPaymentButton={false}
            />
          </div>
        )}
      </main>
      <MainFooter/>
    </div>
  );
};

export default CheckoutStepTwo;
