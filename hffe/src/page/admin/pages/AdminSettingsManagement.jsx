import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Mail, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import AdminApiService from '../../../services/AdminApiService';
import '../css/Dashboard.css';
import '../css/SettingsManagement.css';

const ImprovedSettingsManagement = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
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
    }
  });

  const [stats, setStats] = useState({
    totalUsers: 156,
    activeUsers: 142,
    systemUptime: '99.9%',
    storageUsed: '75%'
  });

  useEffect(() => {
    fetchSettings();
    fetchSystemStats();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Try to fetch from API, fallback to mock data
      const settingsData = await AdminApiService.getSettings();
      if (settingsData) {
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use mock data as fallback
      showMessage('info', 'Using default settings. API connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setStats({
        totalUsers: 156,
        activeUsers: 142,
        systemUptime: '99.9%',
        storageUsed: '75%'
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Try to save via API
      await AdminApiService.updateSettings(settings);
      showMessage('success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'email', label: 'Email', icon: Mail }
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <RefreshCw className="animate-spin" size={32} />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings Management</h1>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => {
              fetchSettings();
              fetchSystemStats();
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            className="btn-primary"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`message-alert ${message.type}`}>
          {message.type === 'success' && <CheckCircle size={16} />}
          {message.type === 'error' && <AlertCircle size={16} />}
          {message.type === 'info' && <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* System Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={User}
          color="#3b82f6"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={User}
          color="#10b981"
        />
        <StatCard
          title="System Uptime"
          value={stats.systemUptime}
          icon={Database}
          color="#f59e0b"
        />
        <StatCard
          title="Storage Used"
          value={stats.storageUsed}
          icon={Database}
          color="#8b5cf6"
        />
      </div>

      <div className="settings-container">
        {/* Settings Tabs */}
        <div className="settings-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Site Name</label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Site Description</label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Support Phone</label>
                  <input
                    type="tel"
                    value={settings.general.supportPhone}
                    onChange={(e) => handleInputChange('general', 'supportPhone', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Business Address</label>
                  <textarea
                    value={settings.general.address}
                    onChange={(e) => handleInputChange('general', 'address', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Asia/Ho_Chi_Minh">Vietnam Time</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="VND">VND - Vietnamese Dong</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                    />
                    <span>Enable Two-Factor Authentication</span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', e.target.value)}
                    min="5"
                    max="480"
                  />
                </div>
                <div className="form-group">
                  <label>Password Policy</label>
                  <select
                    value={settings.security.passwordPolicy}
                    onChange={(e) => handleInputChange('security', 'passwordPolicy', e.target.value)}
                  >
                    <option value="weak">Weak (6+ characters)</option>
                    <option value="medium">Medium (8+ characters, mixed case)</option>
                    <option value="strong">Strong (12+ characters, mixed case, numbers, symbols)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.security.loginAttempts}
                    onChange={(e) => handleInputChange('security', 'loginAttempts', e.target.value)}
                    min="3"
                    max="10"
                  />
                </div>
                <div className="form-group">
                  <label>API Rate Limit (requests/hour)</label>
                  <input
                    type="number"
                    value={settings.security.apiRateLimit}
                    onChange={(e) => handleInputChange('security', 'apiRateLimit', e.target.value)}
                    min="100"
                    max="10000"
                  />
                </div>
                <div className="form-group">
                  <label>Backup Frequency</label>
                  <select
                    value={settings.security.backupFrequency}
                    onChange={(e) => handleInputChange('security', 'backupFrequency', e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                    />
                    <span>Email Notifications</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsNotifications}
                      onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                    />
                    <span>SMS Notifications</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                    />
                    <span>Push Notifications</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.orderNotifications}
                      onChange={(e) => handleInputChange('notifications', 'orderNotifications', e.target.checked)}
                    />
                    <span>Order Notifications</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.lowStockAlerts}
                      onChange={(e) => handleInputChange('notifications', 'lowStockAlerts', e.target.checked)}
                    />
                    <span>Low Stock Alerts</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.customerSignups}
                      onChange={(e) => handleInputChange('notifications', 'customerSignups', e.target.checked)}
                    />
                    <span>Customer Signup Notifications</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.systemAlerts}
                      onChange={(e) => handleInputChange('notifications', 'systemAlerts', e.target.checked)}
                    />
                    <span>System Alerts</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>Appearance Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Theme</label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Primary Color</label>
                  <input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Secondary Color</label>
                  <input
                    type="color"
                    value={settings.appearance.secondaryColor}
                    onChange={(e) => handleInputChange('appearance', 'secondaryColor', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Logo URL</label>
                  <input
                    type="url"
                    value={settings.appearance.logoUrl}
                    onChange={(e) => handleInputChange('appearance', 'logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="form-group">
                  <label>Favicon URL</label>
                  <input
                    type="url"
                    value={settings.appearance.faviconUrl}
                    onChange={(e) => handleInputChange('appearance', 'faviconUrl', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Custom CSS</label>
                  <textarea
                    value={settings.appearance.customCSS}
                    onChange={(e) => handleInputChange('appearance', 'customCSS', e.target.value)}
                    rows={8}
                    placeholder="/* Custom CSS styles */"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="settings-section">
              <h3>Email Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email.smtpHost}
                    onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>SMTP Port</label>
                  <input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => handleInputChange('email', 'smtpPort', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>SMTP Username</label>
                  <input
                    type="text"
                    value={settings.email.smtpUser}
                    onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>SMTP Password</label>
                  <div className="password-input">
                    <input
                      type={showPassword.smtpPassword ? 'text' : 'password'}
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('smtpPassword')}
                    >
                      {showPassword.smtpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>From Email</label>
                  <input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>From Name</label>
                  <input
                    type="text"
                    value={settings.email.fromName}
                    onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImprovedSettingsManagement;
