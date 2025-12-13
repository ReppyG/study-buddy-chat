/*
  FILTER BAR COMPONENT
  ====================
  Controls for filtering and sorting assignments
*/

import { Course, Priority, Status, SortType, FilterState } from '@/types/assignment';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  courses: Course[];
}

export function FilterBar({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  courses,
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      courseId: null,
      status: null,
      priority: null,
      searchQuery: '',
      hideCompleted: false,
    });
  };

  const hasActiveFilters = 
    filters.courseId || 
    filters.status || 
    filters.priority || 
    filters.searchQuery || 
    filters.hideCompleted;

  return (
    <div className="space-y-3">
      {/* Main filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={filters.searchQuery}
            onChange={e => updateFilter('searchQuery', e.target.value)}
            className="pl-9 bg-input"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v: SortType) => onSortChange(v)}>
          <SelectTrigger className="w-[160px] bg-input">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="due-date">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="course">Course</SelectItem>
            <SelectItem value="date-added">Date Added</SelectItem>
          </SelectContent>
        </Select>

        {/* Toggle advanced filters */}
        <Button
          variant={showAdvanced ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="flex items-center gap-3 flex-wrap p-3 bg-secondary/30 rounded-lg animate-fade-in">
          {/* Course filter */}
          <Select
            value={filters.courseId || 'all'}
            onValueChange={v => updateFilter('courseId', v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-[150px] bg-input">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${course.color}`} />
                    {course.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={v => updateFilter('status', v === 'all' ? null : v as Status)}
          >
            <SelectTrigger className="w-[140px] bg-input">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select
            value={filters.priority || 'all'}
            onValueChange={v => updateFilter('priority', v === 'all' ? null : v as Priority)}
          >
            <SelectTrigger className="w-[130px] bg-input">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Hide completed toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="hide-completed"
              checked={filters.hideCompleted}
              onCheckedChange={v => updateFilter('hideCompleted', v)}
            />
            <Label htmlFor="hide-completed" className="text-sm cursor-pointer">
              Hide completed
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
