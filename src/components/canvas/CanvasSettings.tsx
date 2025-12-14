// Canvas LMS connection settings component
import { useState } from 'react';
import { Settings, ExternalLink, Info, Eye, EyeOff, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ConnectionStatus } from './ConnectionStatus';
import { SyncStatus } from './SyncStatus';
import { useCanvas } from '@/hooks/useCanvas';

export function CanvasSettings() {
  const {
    connection,
    connectionStatus,
    testMode,
    testConnection,
    connect,
    disconnect,
    syncState,
    syncAllData,
    canvasData,
  } = useCanvas();

  const [canvasUrl, setCanvasUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);

  const handleTestConnection = async () => {
    if (!canvasUrl.trim() || !apiToken.trim()) {
      toast.error('Please enter both Canvas URL and API token');
      return;
    }

    const result = await testConnection(canvasUrl.trim(), apiToken.trim());
    
    if (result.success) {
      setTestResult({ success: true, message: `Connected! Welcome, ${result.user?.name || 'Student'}` });
      toast.success('Connection successful!');
    } else {
      setTestResult({ success: false, message: result.error || 'Connection failed' });
      toast.error(result.error || 'Connection failed');
    }
  };

  const handleConnect = async () => {
    if (!canvasUrl.trim() || !apiToken.trim()) {
      toast.error('Please enter both Canvas URL and API token');
      return;
    }

    setIsConnecting(true);
    const result = await connect(canvasUrl.trim(), apiToken.trim());
    setIsConnecting(false);

    if (result.success) {
      toast.success('Connected to Canvas!');
      setCanvasUrl('');
      setApiToken('');
      setTestResult(null);
    } else {
      toast.error(result.error || 'Failed to connect');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setDisconnectDialogOpen(false);
    toast.success('Disconnected from Canvas');
  };

  const isConnected = connectionStatus === 'connected';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Canvas LMS Integration</h2>
          <p className="text-sm text-muted-foreground">
            Connect your Canvas account to import assignments automatically
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus 
        status={connectionStatus} 
        userName={connection?.userName}
        canvasUrl={connection?.canvasUrl}
        testMode={testMode}
      />

      {/* Connected View */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sync Status</CardTitle>
            <CardDescription>
              Auto-syncs every 30 minutes. Last sync shows when data was refreshed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SyncStatus 
              syncState={syncState} 
              onSync={syncAllData}
            />

            {canvasData && (
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Courses</p>
                  <p className="text-lg font-semibold">{canvasData.courses.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Assignments</p>
                  <p className="text-lg font-semibold">
                    {Object.values(canvasData.assignments).flat().length}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Announcements</p>
                  <p className="text-lg font-semibold">{canvasData.announcements.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold text-green-500">Active</p>
                </div>
              </div>
            )}

            <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  <Unplug className="mr-2 h-4 w-4" />
                  Disconnect Canvas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Disconnect from Canvas?</DialogTitle>
                  <DialogDescription>
                    This will remove your Canvas connection and clear all synced data. 
                    You can reconnect at any time.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDisconnectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Connection Form */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connect to Canvas</CardTitle>
            <CardDescription>
              Enter your Canvas URL and API access token to connect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Instructions */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-1">How to get your API token:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Log in to Canvas</li>
                  <li>Go to Account → Settings</li>
                  <li>Scroll to "Approved Integrations"</li>
                  <li>Click "+ New Access Token"</li>
                  <li>Give it a name (e.g., "Study App") and click Generate</li>
                  <li>Copy the token and paste it below</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">
                  For testing, use URL: <code className="bg-muted px-1 rounded">test.instructure.com</code> and token: <code className="bg-muted px-1 rounded">test</code>
                </p>
              </AlertDescription>
            </Alert>

            {/* Canvas URL Input */}
            <div className="space-y-2">
              <Label htmlFor="canvasUrl">Canvas URL</Label>
              <Input
                id="canvasUrl"
                placeholder="myschool.instructure.com"
                value={canvasUrl}
                onChange={(e) => setCanvasUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your school's Canvas URL (without https://)
              </p>
            </div>

            {/* API Token Input */}
            <div className="space-y-2">
              <Label htmlFor="apiToken">API Access Token</Label>
              <div className="relative">
                <Input
                  id="apiToken"
                  type={showToken ? 'text' : 'password'}
                  placeholder="Enter your Canvas API token"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your token is stored securely and never logged
              </p>
            </div>

            {/* Test Result */}
            {testResult && (
              <Alert variant={testResult.success ? 'default' : 'destructive'}>
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={connectionStatus === 'testing'}
                className="flex-1"
              >
                {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button 
                onClick={handleConnect}
                disabled={isConnecting || connectionStatus === 'testing'}
                className="flex-1"
              >
                {isConnecting ? 'Connecting...' : 'Connect Canvas'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Link */}
      <a 
        href="https://community.canvaslms.com/t5/Student-Guide/How-do-I-manage-API-access-tokens-as-a-student/ta-p/273"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        Need help? View Canvas documentation
      </a>
    </div>
  );
}
