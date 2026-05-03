import Svg, { Path } from 'react-native-svg';

export default function SolarIcon({ color = '#0EA5E9', size = 24 }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="23 29 35 27"
      fill="none"
    >
      <Path
        d="M25.8922 46.1377H55.1078C55.3955 46.1377 55.6793 46.0721 55.9378 45.9459C56.1963 45.8197 56.4226 45.6363 56.5995 45.4096C56.7765 45.1828 56.8994 44.9187 56.959 44.6373C57.0185 44.3559 57.0132 44.0647 56.9433 43.7856L54.105 32.4324C54.0025 32.0232 53.7662 31.66 53.4336 31.4005C53.1011 31.141 52.6914 31 52.2695 31H28.7305C28.3086 31 27.8989 31.141 27.5664 31.4005C27.2338 31.66 26.9975 32.0232 26.895 32.4324L24.0567 43.7856C23.9868 44.0647 23.9815 44.3559 24.041 44.6373C24.1006 44.9187 24.2235 45.1828 24.4005 45.4096C24.5774 45.6363 24.8037 45.8197 25.0622 45.9459C25.3207 46.0721 25.6045 46.1377 25.8922 46.1377Z"
        stroke={color}
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M25.3623 38.5688H55.6376"
        stroke={color}
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M36.7154 31L34.8232 46.1377"
        stroke={color}
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M44.2842 31L46.1764 46.1377"
        stroke={color}
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M40.5 46.1377V53.7065"
        stroke={color}
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M31.0391 53.7065H49.9611"
        stroke={color}
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}