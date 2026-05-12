import * as React from 'react';
import Svg, { Path, Defs, Pattern, Image } from 'react-native-svg';

export default function PlantCardBackground() {
  return (
    <Svg width={382} height={163} viewBox="0 0 382 163">
      <Defs>
        <Pattern
          id="pattern0"
          patternUnits="objectBoundingBox"
          width={1}
          height={1}
        >
          <Image
            href={{ uri: 'data:image/jpeg;base64,...' }} // 🔥 paste dari SVG kamu
            width={382}
            height={163}
            preserveAspectRatio="xMidYMid slice"
          />
        </Pattern>
      </Defs>

      <Path
        d="M0 14C0 6.26801 6.26801 0 14 0H368C375.732 0 382 6.26801 382 14V163H0V14Z"
        fill="url(#pattern0)"
      />
    </Svg>
  );
}
