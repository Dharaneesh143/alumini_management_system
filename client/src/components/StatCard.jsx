import React from 'react';

const StatCard = ({ icon, label, value, trend, trendValue, color = 'primary' }) => {
    return (
        <div className="stat-card">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="text-sm text-secondary font-medium mb-2">{label}</div>
                    <div className="stat-value">{value}</div>
                    {trend && (
                        <div className={`text-xs mt-2 ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
                            {trend === 'up' ? '↑' : '↓'} {trendValue}
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`text-3xl`} style={{ opacity: 0.6 }}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
