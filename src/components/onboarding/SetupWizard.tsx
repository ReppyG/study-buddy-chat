import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useCanvas } from '@/hooks/useCanvas';
import { useApp } from '@/contexts/AppContext';
import {
  BookOpen, Palette, Bell, CheckCircle, ArrowRight, ArrowLeft, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SetupWizardProps {
  onComplete: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [canvasUrl, setCanvasUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect, connectionStatus } = useCanvas();
  const { settings, updateSettings } = useApp();

  const steps = [
    { title: 'Canvas', icon: BookOpen },
    { title: 'Theme', icon: Palette },
    { title: 'Notifications', icon: Bell },
    { title: 'Done', icon: CheckCircle },
  ];

  const handleCanvasConnect = async () => {
    if (!canvasUrl || !apiToken) {
      toast.error('Please enter both Canvas URL and API token');
      return;
    }

    setIsConnecting(true);
    try {
      const result = await connect(canvasUrl, apiToken);
      if (result.success) {
        toast.success('Canvas connected successfully!');
        setStep(1);
      } else {
        toast.error(result.error || 'Failed to connect');
      }
    } catch (error) {
      toast.error('Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Connect Canvas LMS</h3>
              <p className="text-sm text-muted-foreground">
                Import your courses, assignments, and grades
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="canvas-url">Canvas URL</Label>
                <Input
                  id="canvas-url"
                  placeholder="school.instructure.com"
                  value={canvasUrl}
                  onChange={(e) => setCanvasUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-token">API Token</Label>
                <Input
                  id="api-token"
                  type="password"
                  placeholder="Enter your Canvas API token"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Find this in Canvas → Account → Settings → New Access Token
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Skip for now
              </Button>
              <Button
                className="flex-1"
                onClick={handleCanvasConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Choose Your Theme</h3>
              <p className="text-sm text-muted-foreground">
                Pick a look that works for you
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'auto'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateSettings({ theme })}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-center',
                    settings.theme === theme
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full mx-auto mb-2',
                    theme === 'light' ? 'bg-white border' : theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-r from-white to-gray-900'
                  )} />
                  <span className="text-sm capitalize">{theme}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1">
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Choose how you want to be notified
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Assignment Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified before due dates</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Study Session Alerts</p>
                  <p className="text-sm text-muted-foreground">Daily study reminders</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Canvas Updates</p>
                  <p className="text-sm text-muted-foreground">New assignments and grades</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold">You&apos;re all set!</h3>
            <p className="text-muted-foreground">
              Study Buddy is ready to help you succeed. Let&apos;s get started!
            </p>
            <Button onClick={onComplete} className="w-full mt-4">
              Start Using Study Buddy
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    'w-8 h-0.5 mx-1',
                    i < step ? 'bg-primary' : 'bg-muted'
                  )} />
                )}
              </div>
            ))}
          </div>
          <Progress value={((step + 1) / steps.length) * 100} className="h-1" />
        </CardHeader>
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};
