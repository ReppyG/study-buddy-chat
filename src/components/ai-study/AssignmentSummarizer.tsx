// Assignment Summarizer component
import { useState } from 'react';
import { Sparkles, Copy, Save, RefreshCw, Clock, Target, CheckSquare, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAIStudy } from '@/hooks/useAIStudy';
import type { AISummary } from '@/types/ai-study';

interface AssignmentSummarizerProps {
  initialText?: string;
  assignmentId?: number;
  onClose?: () => void;
}

export function AssignmentSummarizer({ initialText = '', assignmentId, onClose }: AssignmentSummarizerProps) {
  const { isLoading, summarizeAssignment } = useAIStudy();
  const [text, setText] = useState(initialText);
  const [summary, setSummary] = useState<AISummary | null>(null);

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error('Please enter assignment text to summarize');
      return;
    }

    const result = await summarizeAssignment(text, assignmentId);
    if (result) {
      setSummary(result);
      toast.success('Assignment summarized!');
    }
  };

  const copyToClipboard = () => {
    if (!summary) return;
    const text = `
Main Objective: ${summary.summary.mainObjective}

Key Requirements:
${summary.summary.keyRequirements?.map(r => `• ${r}`).join('\n')}

Grading Criteria:
${summary.summary.gradingCriteria?.map(c => `• ${c}`).join('\n')}

Estimated Time: ${summary.summary.estimatedTime}
Difficulty: ${summary.summary.difficulty}
    `.trim();
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {!summary ? (
        <>
          <Textarea
            placeholder="Paste your assignment description here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] resize-none"
          />
          <Button 
            onClick={handleSummarize} 
            disabled={isLoading || !text.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Summarize Assignment
              </>
            )}
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          {/* Main Objective */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Main Objective
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{summary.summary.mainObjective}</p>
            </CardContent>
          </Card>

          {/* Key Requirements */}
          {summary.summary.keyRequirements && summary.summary.keyRequirements.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-blue-500" />
                  Key Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.summary.keyRequirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Grading Criteria */}
          {summary.summary.gradingCriteria && summary.summary.gradingCriteria.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Grading Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.summary.gradingCriteria.map((crit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Time & Difficulty */}
          <div className="flex gap-4">
            <Card className="flex-1">
              <CardContent className="py-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Time</p>
                  <p className="font-medium">{summary.summary.estimatedTime || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="py-4 flex items-center gap-3">
                <Badge className={getDifficultyColor(summary.summary.difficulty)}>
                  {summary.summary.difficulty || 'Unknown'}
                </Badge>
                <p className="text-xs text-muted-foreground">Difficulty</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSummary(null)}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Summary
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
