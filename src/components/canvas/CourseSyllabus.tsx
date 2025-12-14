// Course syllabus tab
import { useState } from 'react';
import { FileText, Search, Download, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import type { CanvasSyllabus as CanvasSyllabusType } from '@/types/canvas';

interface CourseSyllabusProps {
  syllabus: CanvasSyllabusType | null;
  courseName: string;
}

// Mock syllabus content for demo
const MOCK_SYLLABUS = `
<h2>Course Overview</h2>
<p>Welcome to this course! This syllabus outlines the key information you need for success.</p>

<h2>Learning Objectives</h2>
<ul>
  <li>Understand fundamental concepts and principles</li>
  <li>Apply knowledge to solve real-world problems</li>
  <li>Develop critical thinking and analytical skills</li>
  <li>Collaborate effectively with peers</li>
</ul>

<h2>Required Materials</h2>
<ul>
  <li>Textbook: Introduction to the Subject, 5th Edition</li>
  <li>Calculator (scientific or graphing)</li>
  <li>Notebook for class notes</li>
</ul>

<h2>Grading Policy</h2>
<table>
  <tr><th>Category</th><th>Weight</th></tr>
  <tr><td>Homework</td><td>20%</td></tr>
  <tr><td>Quizzes</td><td>15%</td></tr>
  <tr><td>Midterm Exam</td><td>25%</td></tr>
  <tr><td>Final Exam</td><td>30%</td></tr>
  <tr><td>Participation</td><td>10%</td></tr>
</table>

<h2>Late Work Policy</h2>
<p>Late assignments will be penalized 10% per day, up to a maximum of 3 days. After 3 days, late work will not be accepted without prior approval.</p>

<h2>Academic Integrity</h2>
<p>All work submitted must be your own. Plagiarism and cheating will result in a zero on the assignment and may lead to further disciplinary action.</p>

<h2>Office Hours</h2>
<p>I am available during the following times:</p>
<ul>
  <li>Monday: 2:00 PM - 4:00 PM</li>
  <li>Wednesday: 10:00 AM - 12:00 PM</li>
  <li>Friday: By appointment</li>
</ul>

<h2>Important Dates</h2>
<ul>
  <li>Midterm Exam: October 15, 2024</li>
  <li>Final Exam: December 18, 2024</li>
  <li>No class: November 28-29 (Thanksgiving)</li>
</ul>
`;

export function CourseSyllabus({ syllabus, courseName }: CourseSyllabusProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showToc, setShowToc] = useState(true);

  const syllabusContent = syllabus?.syllabus_body || MOCK_SYLLABUS;

  // Extract headings for table of contents
  const extractHeadings = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');
    return Array.from(headings).map((h, i) => ({
      id: `heading-${i}`,
      text: h.textContent || '',
      level: h.tagName === 'H2' ? 2 : 3,
    }));
  };

  const headings = extractHeadings(syllabusContent);

  // Highlight search matches
  const highlightContent = (html: string) => {
    if (!searchTerm.trim()) return html;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return html.replace(regex, '<mark class="bg-yellow-500/30 text-foreground">$1</mark>');
  };

  const handleExportPDF = () => {
    // In a real app, this would use a library like jsPDF or html2pdf
    toast.info('PDF export would be implemented with a library like jsPDF');
  };

  const scrollToHeading = (id: string) => {
    const index = parseInt(id.split('-')[1]);
    const element = document.querySelector(`.syllabus-content h2:nth-of-type(${index + 1}), .syllabus-content h3:nth-of-type(${index + 1})`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!syllabusContent) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg">No Syllabus Available</h3>
        <p className="text-muted-foreground">The syllabus for this course hasn't been uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Table of Contents - Sidebar */}
      {showToc && headings.length > 0 && (
        <Card className="w-64 shrink-0 hidden lg:block">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <List className="h-4 w-4" />
              Contents
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <ScrollArea className="h-[400px]">
              <nav className="space-y-1">
                {headings.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    className={`
                      block w-full text-left px-2 py-1.5 rounded text-sm transition-colors
                      hover:bg-muted text-muted-foreground hover:text-foreground
                      ${heading.level === 3 ? 'pl-4' : ''}
                    `}
                  >
                    {heading.text}
                  </button>
                ))}
              </nav>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search syllabus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowToc(!showToc)}
            className="hidden lg:flex"
          >
            <List className="h-4 w-4 mr-2" />
            {showToc ? 'Hide' : 'Show'} Contents
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Syllabus Content */}
        <Card>
          <CardHeader>
            <CardTitle>{courseName} - Syllabus</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="syllabus-content prose prose-sm dark:prose-invert max-w-none
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-foreground
                [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
                [&_li]:my-1
                [&_p]:my-3
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-4 [&_th]:py-2 [&_th]:text-left
                [&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2
              "
              dangerouslySetInnerHTML={{ __html: highlightContent(syllabusContent) }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
