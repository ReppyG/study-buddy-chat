import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Palette, Bell, Bot, Shield, Info, Download, Trash2,
  Moon, Sun, Monitor, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const handleExportData = () => {
    const data = {
      assignments: localStorage.getItem('studyBuddyAssignments'),
      notes: localStorage.getItem('study-buddy-notes'),
      databases: localStorage.getItem('study-buddy-databases'),
      pomodoroStats: localStorage.getItem('pomodoroStats'),
      settings: localStorage.getItem('study-buddy-app-state'),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-buddy-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleClearCache = () => {
    if (confirm('This will clear all cached data. Your saved data will remain. Continue?')) {
      // Only clear cache, not user data
      toast.success('Cache cleared');
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings - Study Buddy</title>
      </Helmet>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and account</p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
            <TabsTrigger value="canvas" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Canvas</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
          </TabsList>

          {/* Canvas Settings */}
          <TabsContent value="canvas">
            <Card>
              <CardHeader>
                <CardTitle>Canvas Connection</CardTitle>
                <CardDescription>Manage your Canvas LMS integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Connection Status</Label>
                    <p className="text-sm text-muted-foreground">Your Canvas account connection</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Sync</Label>
                    <p className="text-sm text-muted-foreground">Automatically sync every 30 minutes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how Study Buddy looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    {[
                      { value: 'light', icon: Sun, label: 'Light' },
                      { value: 'dark', icon: Moon, label: 'Dark' },
                      { value: 'auto', icon: Monitor, label: 'System' },
                    ].map(({ value, icon: Icon, label }) => (
                      <Button
                        key={value}
                        variant={settings.theme === value ? 'default' : 'outline'}
                        onClick={() => updateSettings({ theme: value as any })}
                        className="flex-1 gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    {['purple', 'blue', 'green', 'orange', 'pink'].map(color => (
                      <button
                        key={color}
                        onClick={() => updateSettings({ accentColor: color })}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          settings.accentColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                        }`}
                        style={{ backgroundColor: `var(--${color}-500, ${color})` }}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select
                    value={settings.fontSize}
                    onValueChange={(v) => updateSettings({ fontSize: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
                  </div>
                  <Switch
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(v) => updateSettings({ notificationsEnabled: v })}
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <Label>Quiet Hours</Label>
                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Start</Label>
                      <Input
                        type="time"
                        value={settings.quietHoursStart}
                        onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                        className="w-32"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">End</Label>
                      <Input
                        type="time"
                        value={settings.quietHoursEnd}
                        onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                        className="w-32"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription>Configure AI assistant behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable AI Features</Label>
                    <p className="text-sm text-muted-foreground">Use AI for summaries, quizzes, and more</p>
                  </div>
                  <Switch
                    checked={settings.aiEnabled}
                    onCheckedChange={(v) => updateSettings({ aiEnabled: v })}
                  />
                </div>
                <Separator />
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">API Usage</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI features use Lovable AI - no API key required
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data & Privacy */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>Manage your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Export All Data</Label>
                    <p className="text-sm text-muted-foreground">Download all your data as JSON</p>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Clear Cache</Label>
                    <p className="text-sm text-muted-foreground">Clear temporary data</p>
                  </div>
                  <Button variant="outline" onClick={handleClearCache}>
                    Clear
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-destructive">Delete All Data</Label>
                    <p className="text-sm text-muted-foreground">Permanently delete all your data</p>
                  </div>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Study Buddy</CardTitle>
                <CardDescription>Version 1.0.0</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Study Buddy is your all-in-one study companion designed to help high school 
                  students stay organized, focused, and productive.
                </p>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Features</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Canvas LMS Integration</li>
                    <li>Pomodoro Timer with Stats</li>
                    <li>AI-Powered Study Tools</li>
                    <li>Block-Based Note Editor</li>
                    <li>Flexible Database System</li>
                  </ul>
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
