// Reading Summarizer component
import { useState } from 'react';
import { Sparkles, Copy, Download, RefreshCw, BookOpen, Lightbulb, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAIStudy } from '@/hooks/useAIStudy';
import type { AISummary } from '@/types/ai-study';

export function ReadingSummarizer() {
  const { isLoading, summarizeReading, getSavedSummaries } = useAIStudy();
  const [text, setText] = useState('');
  const [summary, setSummary] = useState<AISummary | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const handleSummarize = async () => {
    if (wordCount < 50) {
      toast.error('Please enter at least 50 words to summarize');
      return;
    }
    if (wordCount > 50000) {
      toast.error('Text is too long. Please keep it under 50,000 words.');
      return;
    }

    const result = await summarizeReading(text);
    if (result) {
      setSummary(result);
      toast.success('Reading summarized!');
    }
  };

  const copyToClipboard = () => {
    if (!summary) return;
    const summaryText = `
MAIN IDEAS:
${summary.summary.mainIdeas?.map(idea => `• ${idea}`).join('\n')}

KEY CONCEPTS:
${summary.summary.keyConcepts?.map(concept => `• ${concept}`).join('\n')}

IMPORTANT DETAILS:
${summary.summary.importantDetails?.map(detail => `• ${detail}`).join('\n')}

SUMMARY:
${summary.summary.summaryParagraph}
    `.trim();
    navigator.clipboard.writeText(summaryText);
    toast.success('Copied to clipboard!');
  };

  const downloadAsNote = () => {
    if (!summary) return;
    const content = `
# Reading Summary
Generated: ${new Date().toLocaleString()}

## Main Ideas
${summary.summary.mainIdeas?.map(idea => `- ${idea}`).join('\n')}

## Key Concepts
${summary.summary.keyConcepts?.map(concept => `- ${concept}`).join('\n')}

## Important Details
${summary.summary.importantDetails?.map(detail => `- ${detail}`).join('\n')}

## Summary
${summary.summary.summaryParagraph}
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reading-summary-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded!');
  };

  return (
    <div className="space-y-4">
      {!summary ? (
        <>
          <div className="relative">
            <Textarea
              placeholder="Paste your reading material here (articles, textbook chapters, notes...)&#10;&#10;Supports up to 50,000 words."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {wordCount.toLocaleString()} / 50,000 words
            </div>
          </div>
          <Button 
            onClick={handleSummarize} 
            disabled={isLoading || wordCount < 50}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Summarizing...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Summarize Reading
              </>
            )}
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          {/* Main Ideas */}
          {summary.summary.mainIdeas && summary.summary.mainIdeas.length > 0 && (
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  Main Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.summary.mainIdeas.map((idea, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Key Concepts */}
          {summary.summary.keyConcepts && summary.summary.keyConcepts.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Key Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.summary.keyConcepts.map((concept, i) => (
                    <li key={i} className="p-2 rounded bg-muted/50">{concept}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Important Details */}
          {summary.summary.importantDetails && summary.summary.importantDetails.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Important Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.summary.importantDetails.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Summary Paragraph */}
          {summary.summary.summaryParagraph && (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {summary.summary.summaryParagraph}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={downloadAsNote} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { setSummary(null); setText(''); }}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
