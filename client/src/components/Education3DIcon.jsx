import React from 'react';

const Education3DIcon = ({ size = 200 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="auth-3d-icon"
        >
            {/* Shadow */}
            <ellipse cx="100" cy="180" rx="60" ry="8" fill="rgba(0,0,0,0.2)" />

            {/* Book Base */}
            <rect x="50" y="100" width="100" height="70" rx="4" fill="#fff" opacity="0.95" />
            <rect x="50" y="100" width="100" height="70" rx="4" fill="url(#bookGradient)" opacity="0.3" />

            {/* Book Pages */}
            <line x1="100" y1="100" x2="100" y2="170" stroke="rgba(102, 126, 234, 0.3)" strokeWidth="2" />
            <line x1="70" y1="115" x2="130" y2="115" stroke="rgba(102, 126, 234, 0.2)" strokeWidth="1.5" />
            <line x1="70" y1="125" x2="130" y2="125" stroke="rgba(102, 126, 234, 0.2)" strokeWidth="1.5" />
            <line x1="70" y1="135" x2="130" y2="135" stroke="rgba(102, 126, 234, 0.2)" strokeWidth="1.5" />

            {/* Graduation Cap */}
            <g transform="translate(100, 60)">
                {/* Cap Board */}
                <path d="M-40,-10 L0,-25 L40,-10 L0,5 Z" fill="#fff" opacity="0.95" />
                <path d="M-40,-10 L0,-25 L40,-10 L0,5 Z" fill="url(#capGradient)" opacity="0.4" />

                {/* Cap Top */}
                <path d="M-40,-10 L-40,0 L0,15 L40,0 L40,-10" fill="#fff" opacity="0.9" />
                <path d="M-40,-10 L-40,0 L0,15 L40,0 L40,-10" fill="url(#capGradient)" opacity="0.3" />

                {/* Tassel */}
                <line x1="35" y1="-10" x2="45" y2="-15" stroke="#fff" strokeWidth="2" opacity="0.9" />
                <circle cx="48" cy="-17" r="4" fill="#fff" opacity="0.95" />
            </g>

            {/* Floating Elements */}
            <circle cx="30" cy="50" r="6" fill="#fff" opacity="0.6">
                <animate attributeName="cy" values="50;45;50" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="170" cy="80" r="4" fill="#fff" opacity="0.5">
                <animate attributeName="cy" values="80;75;80" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="160" cy="140" r="5" fill="#fff" opacity="0.6">
                <animate attributeName="cy" values="140;135;140" dur="3.5s" repeatCount="indefinite" />
            </circle>

            {/* Gradients */}
            <defs>
                <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
                <linearGradient id="capGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4facfe" />
                    <stop offset="100%" stopColor="#667eea" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export default Education3DIcon;
