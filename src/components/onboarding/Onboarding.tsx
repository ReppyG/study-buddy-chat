import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, BookOpen, CheckSquare, Timer, Bot, FileText,
  ChevronRight, ChevronLeft, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Sparkles,
    title: 'Welcome to Study Buddy',
    description: 'Your all-in-one study companion designed to help you stay organized, focused, and productive.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BookOpen,
    title: 'Canvas Integration',
    description: 'Connect your Canvas LMS to automatically import courses, assignments, and grades.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Timer,
    title: 'Focus Timer',
    description: 'Use the Pomodoro timer to stay focused with timed study sessions and breaks.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Bot,
    title: 'AI Study Assistant',
    description: 'Get help from AI to summarize readings, generate quizzes, and explain concepts.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: FileText,
    title: 'Notes & Databases',
    description: 'Take notes with a powerful block editor and organize everything in flexible databases.',
    color: 'from-indigo-500 to-purple-500',
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="sm" onClick={onComplete}>
          Skip <X className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="max-w-md w-full space-y-8">
        {/* Progress */}
        <Progress value={((currentSlide + 1) / slides.length) * 100} className="h-1" />

        {/* Slide Content */}
        <div className={cn('text-center space-y-6 transition-opacity duration-300', isAnimating && 'opacity-50')}>
          {/* Icon */}
          <div className={cn(
            'w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center',
            slide.color
          )}>
            <Icon className="w-12 h-12 text-white" />
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{slide.title}</h2>
            <p className="text-muted-foreground">{slide.description}</p>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i === currentSlide ? 'w-6 bg-primary' : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button onClick={nextSlide} className="flex-1">
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Hook to manage onboarding state
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('study-buddy-onboarding-complete');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('study-buddy-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
};
