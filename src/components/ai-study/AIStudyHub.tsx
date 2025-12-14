// Main AI Study Hub component
import { useState } from 'react';
import { Sparkles, BookOpen, HelpCircle, Calendar, FileText, Brain, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AssignmentSummarizer } from './AssignmentSummarizer';
import { ReadingSummarizer } from './ReadingSummarizer';
import { QuestionGenerator } from './QuestionGenerator';
import { StudyPlanGenerator } from './StudyPlanGenerator';
import { ConceptExplainer } from './ConceptExplainer';
import { useAIStudy } from '@/hooks/useAIStudy';

export function AIStudyHub() {
  const { usage } = useAIStudy();
  const [activeTab, setActiveTab] = useState('summarize');

  const usagePercentage = (usage.count / usage.limit) * 100;

  const features = [
    {
      id: 'summarize',
      icon: FileText,
      label: 'Summarize',
      description: 'Summarize assignments & readings',
    },
    {
      id: 'quiz',
      icon: HelpCircle,
      label: 'Practice',
      description: 'Generate practice questions',
    },
    {
      id: 'plan',
      icon: Calendar,
      label: 'Plan',
      description: 'Create study plans',
    },
    {
      id: 'explain',
      icon: Brain,
      label: 'Explain',
      description: 'Understand concepts',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Study Tools</h2>
            <p className="text-sm text-muted-foreground">
              Powered by Study Buddy AI
            </p>
          </div>
        </div>
        
        {/* Usage Counter */}
        <Card className="w-48">
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Daily Usage
              </span>
              <span className="font-medium">{usage.count}/{usage.limit}</span>
            </div>
            <Progress 
              value={usagePercentage} 
              className={`h-2 ${usagePercentage > 80 ? '[&>div]:bg-destructive' : ''}`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {features.map((feature) => (
            <TabsTrigger key={feature.id} value={feature.id} className="gap-2">
              <feature.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{feature.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Summarize Tab */}
        <TabsContent value="summarize" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Assignment Summarizer
                </CardTitle>
                <CardDescription>
                  Extract key requirements, grading criteria, and time estimates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssignmentSummarizer />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  Reading Summarizer
                </CardTitle>
                <CardDescription>
                  Summarize articles, textbooks, and notes (up to 50,000 words)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReadingSummarizer />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-purple-500" />
                Practice Question Generator
              </CardTitle>
              <CardDescription>
                Generate multiple choice, true/false, short answer, or essay questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Study Plan Generator
              </CardTitle>
              <CardDescription>
                Create personalized day-by-day study plans based on your assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudyPlanGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explain Tab */}
        <TabsContent value="explain">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-amber-500" />
                Concept Explainer
              </CardTitle>
              <CardDescription>
                Get simple explanations for any topic with examples and analogies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConceptExplainer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Pro Tips:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Copy assignment text directly from Canvas for best results</li>
                <li>• Use the "Explain Simpler" button if you don't understand at first</li>
                <li>• Export your study plan to Google Calendar for reminders</li>
                <li>• Generate practice quizzes before tests to check your knowledge</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
