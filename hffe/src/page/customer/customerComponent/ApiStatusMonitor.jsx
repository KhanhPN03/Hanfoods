import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/ApiStatusMonitor.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Component theo dõi trạng thái API và hiển thị thông báo nếu có vấn đề
 */
const ApiStatusMonitor = () => {
  const [apiStatus, setApiStatus] = useState({
    isChecking: false,
    isOnline: true,
    lastChecked: null,
    error: null,
    retryCount: 0,
    hidden: true
  });

  // Hàm kiểm tra kết nối đến API health endpoint
  const checkApiStatus = async (showNotification = false) => {
    if (apiStatus.isChecking) return;

    setApiStatus(prev => ({ ...prev, isChecking: true }));    try {
      // Sử dụng endpoint health với timeout ngắn
      await axios.get(`${API_URL}/api/health`, { timeout: 3000 });
      
      setApiStatus({
        isChecking: false,
        isOnline: true,
        lastChecked: new Date(),
        error: null,
        retryCount: 0,
        hidden: !showNotification  // Chỉ hiển thị nếu được yêu cầu
      });
      
      // Auto-hide after 3 seconds if online
      if (showNotification) {
        setTimeout(() => {
          setApiStatus(prev => ({ ...prev, hidden: true }));
        }, 3000);
      }
    } catch (error) {
      console.error("API connection error:", error);
      
      setApiStatus(prev => ({
        isChecking: false, 
        isOnline: false,
        lastChecked: new Date(),
        error: error.message,
        retryCount: prev.retryCount + 1,
        hidden: false  // Luôn hiển thị khi có lỗi
      }));
    }
  };

  // Kiểm tra kết nối khi component mount và mỗi 30 giây
  useEffect(() => {
    // Kiểm tra ban đầu (không hiển thị trừ khi có lỗi)
    checkApiStatus(false);
    
    // Kiểm tra kết nối định kỳ - nhưng chỉ nếu trước đó offline
    // để tránh quá nhiều request không cần thiết
    const intervalId = setInterval(() => {
      if (!apiStatus.isOnline) {
        checkApiStatus(false);
      }
    }, 30000); // 30 giây
    
    return () => clearInterval(intervalId);
  }, []);  // Chỉ chạy một lần khi mount

  // Xử lý khi người dùng nhấn nút thử lại
  const handleRetry = () => {
    checkApiStatus(true);
  };

  // Đóng thông báo khi người dùng nhấn nút đóng
  const handleClose = () => {
    setApiStatus(prev => ({ ...prev, hidden: true }));
  };

  // Nếu trạng thái online và ẩn, không hiển thị gì cả
  if (apiStatus.hidden) {
    return null;
  }

  return (
    <div className={`api-status-monitor ${apiStatus.isOnline ? 'online' : 'offline'}`}>
      <div className="status-icon">
        {apiStatus.isOnline ? '✓' : '✗'}
      </div>
      <div className="status-message">
        {apiStatus.isOnline 
          ? 'Kết nối máy chủ đã được khôi phục.' 
          : `Không thể kết nối đến máy chủ. ${apiStatus.error || 'Vui lòng thử lại sau.'}`}
      </div>
      
      {!apiStatus.isOnline && (
        <button 
          className="retry-button" 
          onClick={handleRetry} 
          disabled={apiStatus.isChecking}>
          {apiStatus.isChecking ? 'Đang thử...' : 'Thử lại'}
        </button>
      )}
      
      <button className="close-button" onClick={handleClose}>×</button>
    </div>
  );
};

export default ApiStatusMonitor;