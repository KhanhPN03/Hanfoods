import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon: Icon, 
  color = '#667eea',
  className = ''
}) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-card-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
          {Icon && <Icon size={24} />}
        </div>
        <div className="stat-info">
          <h3 className="stat-title">{title}</h3>
          <div className="stat-value">{formatValue(value)}</div>
        </div>
      </div>
      
      {change !== undefined && (
        <div className="stat-footer">
          <div className={`stat-change ${changeType}`}>
            {changeType === 'increase' ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
          <span className="stat-period">so với tháng trước</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
