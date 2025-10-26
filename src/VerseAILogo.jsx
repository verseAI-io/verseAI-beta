import React from 'react';

const VerseAILogo = ({ width = 400, height = 200, className = '', style = {} }) => {
  return (
    <svg 
      viewBox="0 0 800 400" 
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
      style={style}
    >
      <defs>
        {/* Gradient for verse sparkle */}
        <linearGradient id="verseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor:"#FF9933", stopOpacity:1}}>
            <animate attributeName="stop-color" values="#FF9933;#138808;#000080;#FF9933" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style={{stopColor:"#138808", stopOpacity:1}}>
            <animate attributeName="stop-color" values="#138808;#000080;#FF9933;#138808" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style={{stopColor:"#000080", stopOpacity:1}}>
            <animate attributeName="stop-color" values="#000080;#FF9933;#138808;#000080" dur="3s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
        
        {/* Gradient for AI sparkle */}
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor:"#FF9933", stopOpacity:1}}>
            <animate attributeName="stop-color" values="#FF9933;#138808;#000080;#FF9933" dur="3s" repeatCount="indefinite" begin="0.3s"/>
          </stop>
          <stop offset="50%" style={{stopColor:"#138808", stopOpacity:1}}>
            <animate attributeName="stop-color" values="#138808;#000080;#FF9933;#138808" dur="3s" repeatCount="indefinite" begin="0.3s"/>
          </stop>
          <stop offset="100%" style={{stopColor:"#000080", stopOpacity:1}}>
            <animate attributeName="stop-color" values="#000080;#FF9933;#138808;#000080" dur="3s" repeatCount="indefinite" begin="0.3s"/>
          </stop>
        </linearGradient>
        
        {/* Gradient for .io sparkle */}
        <linearGradient id="ioGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor:"#FF9933", stopOpacity:1}}>
            <animate attributeName="stop-color" values="#FF9933;#138808;#000080;#FF9933" dur="3s" repeatCount="indefinite" begin="0.6s"/>
          </stop>
          <stop offset="50%" style={{stopColor:"#138808", stopOpacity:1}}>
            <animate attributeName="stop-color" values="#138808;#000080;#FF9933;#138808" dur="3s" repeatCount="indefinite" begin="0.6s"/>
          </stop>
          <stop offset="100%" style={{stopColor:"#000080", stopOpacity:1}}>
            <animate attributeName="stop-color" values="#000080;#FF9933;#138808;#000080" dur="3s" repeatCount="indefinite" begin="0.6s"/>
          </stop>
        </linearGradient>
        
        {/* Sparkle animation */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background - transparent for integration */}
      <rect width="800" height="400" fill="transparent"/>
      
      {/* Text with sparkling verse and AI */}
      <text x="400" y="220" 
            fontFamily="Arial, sans-serif" 
            fontSize="80" 
            fontWeight="bold" 
            textAnchor="middle">
        <tspan fill="url(#verseGradient)" filter="url(#glow)">verse</tspan>
        <tspan fill="url(#aiGradient)" filter="url(#glow)">AI</tspan>
        <tspan fill="url(#ioGradient)" filter="url(#glow)">.io</tspan>
      </text>
      
      {/* Sparkle stars around verse */}
      <g opacity="0.8">
        <circle cx="200" cy="190" r="3" fill="#FF9933">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="225" cy="205" r="2" fill="#138808">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s"/>
        </circle>
        <circle cx="215" cy="220" r="2.5" fill="#000080">
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.3s"/>
        </circle>
        <circle cx="190" cy="210" r="2" fill="#FF9933">
          <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" begin="0.8s"/>
        </circle>
      </g>
      
      {/* Sparkle stars around AI */}
      <g opacity="0.8">
        <circle cx="470" cy="190" r="3" fill="#FF9933">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.4s"/>
        </circle>
        <circle cx="495" cy="205" r="2" fill="#138808">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.9s"/>
        </circle>
        <circle cx="485" cy="220" r="2.5" fill="#000080">
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.7s"/>
        </circle>
        <circle cx="505" cy="195" r="2" fill="#FF9933">
          <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" begin="1.2s"/>
        </circle>
      </g>
      
      {/* Sparkle stars around .io */}
      <g opacity="0.8">
        <circle cx="540" cy="190" r="3" fill="#FF9933">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
        </circle>
        <circle cx="565" cy="205" r="2" fill="#138808">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1.1s"/>
        </circle>
        <circle cx="555" cy="220" r="2.5" fill="#000080">
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.9s"/>
        </circle>
        <circle cx="575" cy="195" r="2" fill="#FF9933">
          <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" begin="1.4s"/>
        </circle>
      </g>
    </svg>
  );
};

export default VerseAILogo;
