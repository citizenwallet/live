import React from 'react';
import { PolaroidSlideshow } from '@/components/polaroid-slideshow';
export default async function Page() {
  return <>
    <PolaroidSlideshow images={[
      'https://framerusercontent.com/images/D2k51p7Bl82ElP6u4Px2Rnfg50g.jpeg?scale-down-to=2048',
      'https://framerusercontent.com/images/lgAYRsBuLwwNtiWaPHU2yquluTk.jpeg?scale-down-to=1024'
    ]}/>
  </>;
};
