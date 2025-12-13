/*
  MOTIVATION MODAL COMPONENT
  ==========================
  Shows AI-generated encouragement after completing a session
*/

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Coffee, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MotivationModalProps {
  open: boolean;
  onClose: () => void;
  sessionCount: number;
  totalMinutes: number;
  onStartBreak: (isLong: boolean) => void;
  onStudyAgain: () => void;
}

export function MotivationModal({
  open,
  onClose,
  sessionCount,
  totalMinutes,
  onStartBreak,
  onStudyAgain,
}: MotivationModalProps) {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch motivational message when modal opens
  useEffect(() => {
    if (open) {
      fetchMotivation();
    }
  }, [open]);

  const fetchMotivation = async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('motivate', {
        body: { sessionCount, totalMinutes, isBreak: false },
      });

      if (response.error) throw response.error;
      setMessage(response.data?.message || "Great job! You're doing amazing! 🌟");
    } catch (error) {
      console.error('Failed to fetch motivation:', error);
      setMessage("Awesome work completing that session! You're crushing it! 💪🎉");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBreak = (isLong: boolean) => {
    onClose();
    onStartBreak(isLong);
  };

  const handleStudyAgain = () => {
    onClose();
    onStudyAgain();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-[hsl(var(--timer-paused))]" />
            Session Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* AI Message */}
          <div className="bg-secondary/50 rounded-xl p-4 min-h-[80px] flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-foreground text-center leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Stats summary */}
          <div className="flex justify-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold gradient-text">{sessionCount}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-bold gradient-text">{totalMinutes}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground text-center">
              What would you like to do next?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleStartBreak(false)}
                variant="outline"
                className="flex-1 gap-2 border-[hsl(var(--timer-break))] text-[hsl(var(--timer-break))] hover:bg-[hsl(var(--timer-break))]/10"
              >
                <Coffee className="w-4 h-4" />
                5 min break
              </Button>
              <Button
                onClick={() => handleStartBreak(true)}
                variant="outline"
                className="flex-1 gap-2 border-[hsl(var(--timer-break))] text-[hsl(var(--timer-break))] hover:bg-[hsl(var(--timer-break))]/10"
              >
                <Coffee className="w-4 h-4" />
                15 min break
              </Button>
            </div>
            <Button
              onClick={handleStudyAgain}
              className="gradient-bg hover:opacity-90 gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Start another session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
