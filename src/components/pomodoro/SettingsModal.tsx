/*
  SETTINGS MODAL COMPONENT
  ========================
  Allows customizing timer durations
*/

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';
import { TimerSettings, DEFAULT_SETTINGS } from '@/types/pomodoro';

interface SettingsModalProps {
  settings: TimerSettings;
  onSave: (settings: TimerSettings) => void;
}

export function SettingsModal({ settings, onSave }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Focus duration */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Focus Duration</Label>
              <span className="text-sm text-muted-foreground">{localSettings.focusDuration} min</span>
            </div>
            <Slider
              value={[localSettings.focusDuration]}
              onValueChange={([value]) => setLocalSettings(s => ({ ...s, focusDuration: value }))}
              min={5}
              max={60}
              step={5}
              className="w-full"
            />
          </div>

          {/* Short break */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Short Break</Label>
              <span className="text-sm text-muted-foreground">{localSettings.shortBreakDuration} min</span>
            </div>
            <Slider
              value={[localSettings.shortBreakDuration]}
              onValueChange={([value]) => setLocalSettings(s => ({ ...s, shortBreakDuration: value }))}
              min={1}
              max={15}
              step={1}
              className="w-full"
            />
          </div>

          {/* Long break */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Long Break</Label>
              <span className="text-sm text-muted-foreground">{localSettings.longBreakDuration} min</span>
            </div>
            <Slider
              value={[localSettings.longBreakDuration]}
              onValueChange={([value]) => setLocalSettings(s => ({ ...s, longBreakDuration: value }))}
              min={5}
              max={30}
              step={5}
              className="w-full"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleSave} className="flex-1 gradient-bg hover:opacity-90">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
