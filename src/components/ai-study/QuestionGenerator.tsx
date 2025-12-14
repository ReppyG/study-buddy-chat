// Practice Question Generator component
import { useState } from 'react';
import { Sparkles, Check, X, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAIStudy } from '@/hooks/useAIStudy';
import type { Quiz, QuizQuestion } from '@/types/ai-study';

type QuestionType = 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';

export function QuestionGenerator() {
  const { isLoading, generateQuiz } = useAIStudy();
  const [topic, setTopic] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [questionCount, setQuestionCount] = useState(5);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic or content');
      return;
    }

    const result = await generateQuiz(topic, questionType, questionCount);
    if (result) {
      setQuiz(result);
      setCurrentIndex(0);
      setUserAnswers({});
      setShowResults(false);
      setReviewMode(false);
      toast.success(`Generated ${result.questions.length} questions!`);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!quiz) return;
    
    // Calculate score
    let correct = 0;
    quiz.questions.forEach(q => {
      const userAnswer = userAnswers[q.id]?.toLowerCase().trim();
      const correctAnswer = q.correctAnswer.toLowerCase().trim();
      if (userAnswer === correctAnswer || 
          (q.type === 'multiple_choice' && userAnswer?.charAt(0) === correctAnswer.charAt(0)) ||
          (q.type === 'true_false' && userAnswer === correctAnswer)) {
        correct++;
      }
    });

    setQuiz({
      ...quiz,
      score: Math.round((correct / quiz.questions.length) * 100),
      completedAt: new Date().toISOString(),
    });
    setShowResults(true);
    toast.success(`Quiz completed! Score: ${Math.round((correct / quiz.questions.length) * 100)}%`);
  };

  const currentQuestion = quiz?.questions[currentIndex];
  const progress = quiz ? ((currentIndex + 1) / quiz.questions.length) * 100 : 0;

  const isCorrect = (q: QuizQuestion) => {
    const userAnswer = userAnswers[q.id]?.toLowerCase().trim();
    const correctAnswer = q.correctAnswer.toLowerCase().trim();
    return userAnswer === correctAnswer || 
           (q.type === 'multiple_choice' && userAnswer?.charAt(0) === correctAnswer.charAt(0)) ||
           (q.type === 'true_false' && userAnswer === correctAnswer);
  };

  // Setup view
  if (!quiz) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Topic or Content</Label>
            <Textarea
              placeholder="Enter a topic (e.g., 'The French Revolution') or paste content to generate questions from..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Select value={String(questionCount)} onValueChange={(v) => setQuestionCount(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !topic.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
              Generating Questions...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Practice Quiz
            </>
          )}
        </Button>
      </div>
    );
  }

  // Results view
  if (showResults && !reviewMode) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <Trophy className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
            <p className="text-4xl font-bold text-primary mb-4">{quiz.score}%</p>
            <p className="text-muted-foreground">
              You got {Math.round((quiz.score! / 100) * quiz.questions.length)} out of {quiz.questions.length} correct
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={() => setReviewMode(true)} className="flex-1">
            Review Answers
          </Button>
          <Button variant="outline" onClick={() => setQuiz(null)} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            New Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Review mode
  if (reviewMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Review Answers</h3>
          <Button variant="outline" size="sm" onClick={() => setQuiz(null)}>
            New Quiz
          </Button>
        </div>

        {quiz.questions.map((q, i) => (
          <Card key={q.id} className={isCorrect(q) ? 'border-green-500/30' : 'border-destructive/30'}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm">Question {i + 1}</CardTitle>
                {isCorrect(q) ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                    <Check className="h-3 w-3 mr-1" /> Correct
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <X className="h-3 w-3 mr-1" /> Incorrect
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{q.question}</p>
              
              <div className="grid gap-2 text-sm">
                <div className="p-2 rounded bg-destructive/10 text-destructive">
                  Your answer: {userAnswers[q.id] || 'No answer'}
                </div>
                <div className="p-2 rounded bg-green-500/10 text-green-500">
                  Correct answer: {q.correctAnswer}
                </div>
              </div>

              <div className="p-3 rounded bg-muted text-sm">
                <p className="font-medium mb-1">Explanation:</p>
                <p className="text-muted-foreground">{q.explanation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Quiz view
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit mb-2">
              {currentQuestion.type.replace('_', ' ')}
            </Badge>
            <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') && (
              <RadioGroup
                value={userAnswers[currentQuestion.id] || ''}
                onValueChange={(v) => handleAnswer(currentQuestion.id, v)}
              >
                {currentQuestion.options?.map((option, i) => (
                  <div key={i} className="flex items-center space-x-2 p-3 rounded border hover:bg-muted transition-colors">
                    <RadioGroupItem value={option} id={`option-${i}`} />
                    <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'short_answer' && (
              <Input
                placeholder="Type your answer..."
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              />
            )}

            {currentQuestion.type === 'essay' && (
              <Textarea
                placeholder="Write your essay response..."
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="min-h-[150px]"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
          className="flex-1"
        >
          Previous
        </Button>
        
        {currentIndex < quiz.questions.length - 1 ? (
          <Button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="flex-1"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="flex-1"
          >
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
}
