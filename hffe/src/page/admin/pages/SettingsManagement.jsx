import React, { useState, useEffect } from 'react';
import { Settings, User, Shield, Bell, Palette, Database, Mail, Globe, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';
import StatCard from '../components/StatCard';
import '../css/Dashboard.css';

const SettingsManagement = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'HangNgoo Store',
      siteDescription: 'Premium E-commerce Platform',
      contactEmail: 'admin@hangngoo.com',
      supportPhone: '+1-234-567-8900',
      address: '123 Business Street, City, State 12345',
      timezone: 'UTC',
      currency: 'USD',
      language: 'en'
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 60,
      passwordPolicy: 'strong',
      loginAttempts: 5,
      apiRateLimit: 1000,
      allowedIPs: '',
      backupFrequency: 'daily'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderNotifications: true,
      lowStockAlerts: true,
      customerSignups: true,
      systemAlerts: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      logoUrl: '',
      faviconUrl: '',
      customCSS: ''
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@hangngoo.com',
      fromName: 'HangNgoo Store'
    },
    payment: {
      stripeEnabled: true,
      stripePublishableKey: '',
      stripeSecretKey: '',
      paypalEnabled: true,
      paypalClientId: '',
      paypalClientSecret: '',
      currency: 'USD'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});

  const settingsTabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payment', label: 'Payment', icon: Globe }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch('/api/admin/settings');
      // const data = await response.json();
      // setSettings(data);
      console.log('Settings loaded');
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>General Settings</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>Site Name</label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="setting-item">
          <label>Site Description</label>
          <textarea
            value={settings.general.siteDescription}
            onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
            className="form-input"
            rows="3"
          />
        </div>
        
        <div className="setting-item">
          <label>Contact Email</label>
          <input
            type="email"
            value={settings.general.contactEmail}
            onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="setting-item">
          <label>Support Phone</label>
          <input
            type="tel"
            value={settings.general.supportPhone}
            onChange={(e) => updateSetting('general', 'supportPhone', e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="setting-item full-width">
          <label>Business Address</label>
          <textarea
            value={settings.general.address}
            onChange={(e) => updateSetting('general', 'address', e.target.value)}
            className="form-input"
            rows="2"
          />
        </div>
        
        <div className="setting-item">
          <label>Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
            className="form-input"
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time</option>
            <option value="PST">Pacific Time</option>
            <option value="GMT">Greenwich Mean Time</option>
          </select>
        </div>
        
        <div className="setting-item">
          <label>Default Currency</label>
          <select
            value={settings.general.currency}
            onChange={(e) => updateSetting('general', 'currency', e.target.value)}
            className="form-input"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="VND">VND - Vietnamese Dong</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Security Settings</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
            />
            Enable Two-Factor Authentication
          </label>
        </div>
        
        <div className="setting-item">
          <label>Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
            className="form-input"
            min="15"
            max="480"
          />
        </div>
        
        <div className="setting-item">
          <label>Password Policy</label>
          <select
            value={settings.security.passwordPolicy}
            onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
            className="form-input"
          >
            <option value="weak">Weak (6+ characters)</option>
            <option value="medium">Medium (8+ characters, mixed case)</option>
            <option value="strong">Strong (8+ characters, mixed case, numbers, symbols)</option>
          </select>
        </div>
        
        <div className="setting-item">
          <label>Max Login Attempts</label>
          <input
            type="number"
            value={settings.security.loginAttempts}
            onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
            className="form-input"
            min="3"
            max="10"
          />
        </div>
        
        <div className="setting-item">
          <label>API Rate Limit (requests/hour)</label>
          <input
            type="number"
            value={settings.security.apiRateLimit}
            onChange={(e) => updateSetting('security', 'apiRateLimit', parseInt(e.target.value))}
            className="form-input"
            min="100"
            max="10000"
          />
        </div>
        
        <div className="setting-item">
          <label>Backup Frequency</label>
          <select
            value={settings.security.backupFrequency}
            onChange={(e) => updateSetting('security', 'backupFrequency', e.target.value)}
            className="form-input"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Notification Settings</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
            />
            Email Notifications
          </label>
        </div>
        
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
            />
            SMS Notifications
          </label>
        </div>
        
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
            />
            Push Notifications
          </label>
        </div>
        
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications.orderNotifications}
              onChange={(e) => updateSetting('notifications', 'orderNotifications', e.target.checked)}
            />
            New Order Alerts
          </label>
        </div>
        
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications.lowStockAlerts}
              onChange={(e) => updateSetting('notifications', 'lowStockAlerts', e.target.checked)}
            />
            Low Stock Alerts
          </label>
        </div>
        
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications.customerSignups}
              onChange={(e) => updateSetting('notifications', 'customerSignups', e.target.checked)}
            />
            Customer Signup Notifications
          </label>
        </div>
        
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications.systemAlerts}
              onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
            />
            System Alerts
          </label>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="settings-section">
      <h3>Email Configuration</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>SMTP Host</label>
          <input
            type="text"
            value={settings.email.smtpHost}
            onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
            className="form-input"
            placeholder="smtp.gmail.com"
          />
        </div>
        
        <div className="setting-item">
          <label>SMTP Port</label>
          <input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
            className="form-input"
            placeholder="587"
          />
        </div>
        
        <div className="setting-item">
          <label>SMTP Username</label>
          <input
            type="text"
            value={settings.email.smtpUser}
            onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
            className="form-input"
            placeholder="your-email@gmail.com"
          />
        </div>
        
        <div className="setting-item">
          <label>SMTP Password</label>
          <div className="password-input">
            <input
              type={showPasswords.smtp ? "text" : "password"}
              value={settings.email.smtpPassword}
              onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
              className="form-input"
              placeholder="App password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('smtp')}
              className="password-toggle"
            >
              {showPasswords.smtp ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <div className="setting-item">
          <label>From Email</label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
            className="form-input"
            placeholder="noreply@yourstore.com"
          />
        </div>
        
        <div className="setting-item">
          <label>From Name</label>
          <input
            type="text"
            value={settings.email.fromName}
            onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
            className="form-input"
            placeholder="Your Store Name"
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="settings-section">
      <h3>Payment Gateway Settings</h3>
      <div className="payment-providers">
        <div className="provider-section">
          <div className="provider-header">
            <h4>Stripe Configuration</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.payment.stripeEnabled}
                onChange={(e) => updateSetting('payment', 'stripeEnabled', e.target.checked)}
              />
              Enable Stripe
            </label>
          </div>
          
          {settings.payment.stripeEnabled && (
            <div className="provider-settings">
              <div className="setting-item">
                <label>Publishable Key</label>
                <input
                  type="text"
                  value={settings.payment.stripePublishableKey}
                  onChange={(e) => updateSetting('payment', 'stripePublishableKey', e.target.value)}
                  className="form-input"
                  placeholder="pk_live_..."
                />
              </div>
              <div className="setting-item">
                <label>Secret Key</label>
                <div className="password-input">
                  <input
                    type={showPasswords.stripeSecret ? "text" : "password"}
                    value={settings.payment.stripeSecretKey}
                    onChange={(e) => updateSetting('payment', 'stripeSecretKey', e.target.value)}
                    className="form-input"
                    placeholder="sk_live_..."
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('stripeSecret')}
                    className="password-toggle"
                  >
                    {showPasswords.stripeSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="provider-section">
          <div className="provider-header">
            <h4>PayPal Configuration</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.payment.paypalEnabled}
                onChange={(e) => updateSetting('payment', 'paypalEnabled', e.target.checked)}
              />
              Enable PayPal
            </label>
          </div>
          
          {settings.payment.paypalEnabled && (
            <div className="provider-settings">
              <div className="setting-item">
                <label>Client ID</label>
                <input
                  type="text"
                  value={settings.payment.paypalClientId}
                  onChange={(e) => updateSetting('payment', 'paypalClientId', e.target.value)}
                  className="form-input"
                  placeholder="AXxxx..."
                />
              </div>
              <div className="setting-item">
                <label>Client Secret</label>
                <div className="password-input">
                  <input
                    type={showPasswords.paypalSecret ? "text" : "password"}
                    value={settings.payment.paypalClientSecret}
                    onChange={(e) => updateSetting('payment', 'paypalClientSecret', e.target.value)}
                    className="form-input"
                    placeholder="EXxxx..."
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('paypalSecret')}
                    className="password-toggle"
                  >
                    {showPasswords.paypalSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'email':
        return renderEmailSettings();
      case 'payment':
        return renderPaymentSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={fetchSettings}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Reset
          </button>
          <button 
            className="btn-primary"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saved && (
        <div className="success-message">
          Settings saved successfully!
        </div>
      )}

      <div className="settings-container">
        <div className="settings-sidebar">
          {settingsTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="settings-content">
          <div className="content-card">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
