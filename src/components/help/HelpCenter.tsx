import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  HelpCircle, Book, Video, MessageSquare, Keyboard, Sparkles, Search,
  ExternalLink, ChevronRight
} from 'lucide-react';

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['⌘', 'N'], description: 'New note' },
  { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
  { keys: ['⌘', 'S'], description: 'Save current item' },
  { keys: ['⌘', '/'], description: 'Open slash commands' },
  { keys: ['⌘', 'Enter'], description: 'Submit/send' },
  { keys: ['Esc'], description: 'Close modal/panel' },
  { keys: ['Tab'], description: 'Navigate forward' },
  { keys: ['Shift', 'Tab'], description: 'Navigate backward' },
];

const faqs = [
  {
    question: 'How do I connect Canvas?',
    answer: 'Go to Settings → Canvas and enter your school Canvas URL and API token. You can find your API token in Canvas under Account → Settings → New Access Token.',
  },
  {
    question: 'Is my data private?',
    answer: 'Yes! All your data is stored locally on your device. We do not send your personal data to any servers except for Canvas sync and AI features.',
  },
  {
    question: 'How does the AI assistant work?',
    answer: 'The AI assistant uses Lovable AI to help you study. It can summarize readings, generate practice questions, explain concepts, and create study plans.',
  },
  {
    question: 'Can I use Study Buddy offline?',
    answer: 'Most features work offline since data is stored locally. However, Canvas sync and AI features require an internet connection.',
  },
  {
    question: 'How do I export my notes?',
    answer: 'Open any note, click the menu icon, and select Export. You can export as Markdown, PDF, or plain text.',
  },
];

export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground">Find answers and learn how to use Study Buddy</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="getting-started" className="gap-2">
            <Book className="w-4 h-4" />
            <span className="hidden sm:inline">Getting Started</span>
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className="gap-2">
            <Keyboard className="w-4 h-4" />
            <span className="hidden sm:inline">Shortcuts</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-2">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="whats-new" className="gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">What&apos;s New</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-primary" />
                  Connect Canvas
                </CardTitle>
                <CardDescription>Learn how to import your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Step-by-step guide to connecting your Canvas LMS account and syncing your data.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  Video Tutorials
                </CardTitle>
                <CardDescription>Watch quick tutorial videos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Short video guides covering all major features of Study Buddy.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Using AI Features
                </CardTitle>
                <CardDescription>Get the most out of AI assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Learn how to use AI for summaries, quizzes, study plans, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Contact Support
                </CardTitle>
                <CardDescription>Need more help?</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Reach out to our support team for personalized assistance.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shortcuts">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>Speed up your workflow with these shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, j) => (
                        <kbd key={j} className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                    <h4 className="font-medium mb-2">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whats-new">
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s New</CardTitle>
              <CardDescription>Latest updates and improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">v1.0.0</span>
                    <span className="text-sm text-muted-foreground">December 2024</span>
                  </div>
                  <h4 className="font-medium mb-2">Initial Release</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Canvas LMS integration</li>
                    <li>Pomodoro timer with stats</li>
                    <li>AI-powered study tools</li>
                    <li>Block-based note editor</li>
                    <li>Flexible database system</li>
                    <li>Smart chat assistant</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
