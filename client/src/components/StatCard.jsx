import React from 'react';

const StatCard = ({ icon, label, title, value, trend, trendValue, color = 'primary' }) => {
    const displayLabel = label || title;
    return (
        <div className="stat-card">
            <div className="flex items-start gap-3 justify-between">
                <div className="flex-1">
                    <div className="text-sm text-secondary font-medium mb-2">{displayLabel}</div>
                    <div className="stat-value">{value}</div>
                    {trend && (
                        <div className={`text-xs mt-2 ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
                            {trend === 'up' ? '↑' : '↓'} {trendValue}
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 bg-${color}-light rounded-lg text-${color}`}>
                        {typeof icon === 'string' ? (
                            <span className="text-2xl">{icon}</span>
                        ) : (
                            React.createElement(icon, { size: 24 })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
