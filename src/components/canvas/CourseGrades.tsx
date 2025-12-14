// Course grades tab with grade calculator
import { useState } from 'react';
import { Calculator, TrendingUp, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { CanvasCourse, CanvasAssignment, CanvasGrade } from '@/types/canvas';

interface CourseGradesProps {
  course: CanvasCourse;
  assignments: CanvasAssignment[];
  grades: CanvasGrade[];
}

export function CourseGrades({ course, assignments, grades }: CourseGradesProps) {
  const [goalGrade, setGoalGrade] = useState('90');
  const [finalWeight, setFinalWeight] = useState('20');
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  // Get current score
  const enrollment = course.enrollments?.find(e => e.type === 'student');
  const currentScore = enrollment?.computed_current_score || 0;
  const currentGrade = enrollment?.computed_current_grade || 'N/A';

  // Generate mock grade data for assignments
  const assignmentGrades = assignments.map((a, i) => ({
    id: a.id,
    name: a.name,
    points_possible: a.points_possible || 100,
    score: a.points_possible ? Math.floor(a.points_possible * (0.7 + Math.random() * 0.25)) : null,
    percentage: 70 + Math.random() * 25,
    weight: 100 / assignments.length,
  }));

  // Calculate what's needed on final
  const calculateFinalNeeded = () => {
    const goal = parseFloat(goalGrade);
    const weight = parseFloat(finalWeight) / 100;
    const currentWeight = 1 - weight;
    
    // goal = current * currentWeight + final * weight
    // final = (goal - current * currentWeight) / weight
    const needed = (goal - currentScore * currentWeight) / weight;
    return Math.max(0, Math.min(100, needed)).toFixed(1);
  };

  // Mock trend data
  const trendData = [
    { week: 'Week 1', grade: 85 },
    { week: 'Week 2', grade: 82 },
    { week: 'Week 3', grade: 88 },
    { week: 'Week 4', grade: 86 },
    { week: 'Week 5', grade: 90 },
    { week: 'Week 6', grade: currentScore },
  ];

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-destructive';
  };

  const getLetterGrade = (score: number) => {
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 63) return 'D';
    if (score >= 60) return 'D-';
    return 'F';
  };

  return (
    <div className="space-y-6">
      {/* Grade Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Current Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div>
                <p className={`text-5xl font-bold ${getGradeColor(currentScore)}`}>
                  {currentScore.toFixed(1)}%
                </p>
                <Badge variant="outline" className="mt-2 text-lg">
                  {currentGrade || getLetterGrade(currentScore)}
                </Badge>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progress toward A (90%)</span>
                  <span>{Math.min(100, (currentScore / 90 * 100)).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(100, currentScore / 90 * 100)} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grade Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4" />
              Grade Calculator
            </CardTitle>
            <CardDescription>What do you need on the final?</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={calculatorOpen} onOpenChange={setCalculatorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Target className="mr-2 h-4 w-4" />
                  Calculate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Grade Calculator</DialogTitle>
                  <DialogDescription>
                    Find out what you need on your final exam to reach your goal grade.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Grade</Label>
                    <Input id="current" value={`${currentScore.toFixed(1)}%`} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal Grade (%)</Label>
                    <Input 
                      id="goal" 
                      type="number" 
                      value={goalGrade}
                      onChange={(e) => setGoalGrade(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Final Exam Weight (%)</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      value={finalWeight}
                      onChange={(e) => setFinalWeight(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                  <Card className="bg-muted">
                    <CardContent className="py-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">You need to score</p>
                      <p className={`text-3xl font-bold ${parseFloat(calculateFinalNeeded()) > 100 ? 'text-destructive' : 'text-green-500'}`}>
                        {calculateFinalNeeded()}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">on your final exam</p>
                      {parseFloat(calculateFinalNeeded()) > 100 && (
                        <p className="text-xs text-destructive mt-2">
                          This goal may not be achievable with the current grade.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Grade Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Grade Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  domain={[60, 100]} 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="grade" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Breakdown</CardTitle>
          <CardDescription>Individual assignment scores and weights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">{grade.name}</TableCell>
                    <TableCell className="text-right">
                      {grade.score !== null 
                        ? `${grade.score}/${grade.points_possible}`
                        : <span className="text-muted-foreground">--</span>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      {grade.score !== null ? (
                        <span className={getGradeColor(grade.percentage)}>
                          {grade.percentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {grade.weight.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
