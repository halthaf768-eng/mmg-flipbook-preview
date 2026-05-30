import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070d',
        midnight: '#091528',
        aurora: '#2f80ed',
        bullion: '#f7c45f'
      },
      boxShadow: {
        glow: '0 0 42px rgba(47, 128, 237, 0.3), 0 0 24px rgba(247, 196, 95, 0.18)'
      },
      backgroundImage: {
        'comic-grid':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
      },
      animation: {
        'slow-pulse': 'slowPulse 3s ease-in-out infinite',
        'rise-in': 'riseIn 540ms ease-out both'
      },
      keyframes: {
        slowPulse: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' }
        },
        riseIn: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};

export default config;
