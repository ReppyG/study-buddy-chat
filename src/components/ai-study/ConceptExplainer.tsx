// Concept Explainer component
import { useState } from 'react';
import { Sparkles, ChevronDown, Lightbulb, BookOpen, RefreshCw, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAIStudy } from '@/hooks/useAIStudy';
import type { ConceptExplanation } from '@/types/ai-study';

export function ConceptExplainer() {
  const { isLoading, explainConcept, simplifyMore } = useAIStudy();
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState<ConceptExplanation | null>(null);
  const [simplifications, setSimplifications] = useState<string[]>([]);
  const [isSimplifying, setIsSimplifying] = useState(false);

  const handleExplain = async () => {
    if (!concept.trim()) {
      toast.error('Please enter a concept to explain');
      return;
    }

    const result = await explainConcept(concept);
    if (result) {
      setExplanation(result);
      setSimplifications([]);
      toast.success('Concept explained!');
    }
  };

  const handleSimplify = async () => {
    if (!explanation) return;

    setIsSimplifying(true);
    const currentExplanation = simplifications.length > 0 
      ? simplifications[simplifications.length - 1]
      : explanation.explanation;

    const result = await simplifyMore(concept, currentExplanation);
    setIsSimplifying(false);

    if (result) {
      setSimplifications(prev => [...prev, result.explanation]);
      toast.success('Made it simpler!');
    }
  };

  const copyToClipboard = () => {
    if (!explanation) return;
    const text = `
${concept.toUpperCase()}

${explanation.explanation}

Examples:
${explanation.examples.map(e => `• ${e}`).join('\n')}

${explanation.analogy ? `Analogy: ${explanation.analogy}` : ''}
    `.trim();
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      {!explanation ? (
        <>
          <div className="space-y-2">
            <Input
              placeholder="Enter a concept to explain (e.g., 'photosynthesis', 'supply and demand')"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
            />
            <p className="text-xs text-muted-foreground">
              Ask about any topic and get a simple, student-friendly explanation!
            </p>
          </div>
          <Button 
            onClick={handleExplain} 
            disabled={isLoading || !concept.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Explaining...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Explain This Concept
              </>
            )}
          </Button>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2">
            <p className="text-xs text-muted-foreground w-full">Try these:</p>
            {['Pythagorean theorem', 'Mitosis vs Meiosis', 'Supply and Demand', 'The Scientific Method'].map((suggestion) => (
              <Badge 
                key={suggestion}
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setConcept(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{concept}</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => { setExplanation(null); setConcept(''); }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </div>

          {/* Main Explanation */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {simplifications.length > 0 
                  ? simplifications[simplifications.length - 1]
                  : explanation.explanation
                }
              </p>
            </CardContent>
          </Card>

          {/* Simplify Button */}
          <Button 
            variant="outline" 
            onClick={handleSimplify}
            disabled={isSimplifying}
            className="w-full"
          >
            {isSimplifying ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Simplifying...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Explain Even Simpler
                {simplifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    Level {simplifications.length + 1}
                  </Badge>
                )}
              </>
            )}
          </Button>

          {/* Examples */}
          {explanation.examples && explanation.examples.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Real-World Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {explanation.examples.map((example, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Analogy */}
          {explanation.analogy && (
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Think of it like this...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground italic">"{explanation.analogy}"</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
