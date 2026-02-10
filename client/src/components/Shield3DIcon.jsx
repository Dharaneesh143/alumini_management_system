import React from 'react';

const Shield3DIcon = ({ size = 200 }) => {
    return (
        <div className="auth-3d-icon" style={{ width: size, height: size, margin: '0 auto' }}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 240 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Outer Glow / Shadow */}
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="15" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#991b1b" />
                    </linearGradient>
                </defs>

                {/* Shield Shape */}
                <path
                    d="M120 20L40 50V110C40 160 75 205 120 220C165 205 200 160 200 110V50L120 20Z"
                    fill="url(#shieldGrad)"
                    filter="url(#glow)"
                />

                {/* Inner Shield Detail */}
                <path
                    d="M120 40L60 62V110C60 150 85 186 120 200C155 186 180 150 180 110V62L120 40Z"
                    fill="rgba(255, 255, 255, 0.15)"
                />

                {/* Keyhole / Secure Icon */}
                <circle cx="120" cy="110" r="15" fill="white" />
                <rect x="115" y="120" width="10" height="20" rx="2" fill="white" />

                {/* Reflex Lines */}
                <path
                    d="M90 60L120 50"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.4"
                />
            </svg>
        </div>
    );
};

export default Shield3DIcon;
