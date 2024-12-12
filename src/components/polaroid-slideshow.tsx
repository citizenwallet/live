'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  images: string[],
  duration?: number
}

export function PolaroidSlideshow({ images, duration = 5000 }: Props): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, duration);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const goToPrevious = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const togglePlay = (): void => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className={'w-full min-w-full h-screen min-h-screen'}>
      <CardContent>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Polaroid ${currentIndex + 1}`}
            className="w-screen h-screen object-cover"
            initial={{ opacity: 0, y: 20, rotate: 10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -20, rotate: -10 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        <div className="mt-8 flex items-center space-x-4">
          <Button onClick={goToPrevious} variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={togglePlay} variant="outline">
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={goToNext} variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </CardContent>
    </Card>
  );
}
