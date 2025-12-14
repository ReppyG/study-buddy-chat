import { useState } from 'react';
import { 
  Plus, Search, ChevronRight, ChevronDown, FileText, 
  Trash2, MoreHorizontal, Clock, Star, Settings
} from 'lucide-react';
import { NotePage } from '@/types/notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NotesSidebarProps {
  pages: NotePage[];
  activePage: NotePage | null;
  recentPages: NotePage[];
  onSelectPage: (pageId: string) => void;
  onCreatePage: () => void;
  onDeletePage: (pageId: string) => void;
  onSearch: (query: string) => NotePage[];
}

export function NotesSidebar({
  pages,
  activePage,
  recentPages,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onSearch,
}: NotesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    recent: true,
    pages: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const searchResults = searchQuery ? onSearch(searchQuery) : [];
  const rootPages = pages.filter(p => !p.parentId);

  const renderPageItem = (page: NotePage, depth = 0) => {
    const childPages = pages.filter(p => p.parentId === page.id);
    const hasChildren = childPages.length > 0;
    const isExpanded = expandedSections[page.id];

    return (
      <div key={page.id}>
        <div
          className={cn(
            "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
            activePage?.id === page.id 
              ? "bg-accent text-accent-foreground" 
              : "hover:bg-muted"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => onSelectPage(page.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedSections(prev => ({ ...prev, [page.id]: !prev[page.id] }));
              }}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}
          
          <span className="text-lg">{page.icon || '📄'}</span>
          <span className="flex-1 text-sm truncate">{page.title || 'Untitled'}</span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePage(page.id);
                }}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {childPages.map(child => renderPageItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Notes</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCreatePage}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Search Results */}
          {searchQuery && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground px-2 mb-2">
                {searchResults.length} result{searchResults.length !== 1 && 's'}
              </p>
              {searchResults.map(page => (
                <div
                  key={page.id}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                    activePage?.id === page.id 
                      ? "bg-accent text-accent-foreground" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => {
                    onSelectPage(page.id);
                    setSearchQuery('');
                  }}
                >
                  <span className="text-lg">{page.icon || '📄'}</span>
                  <span className="flex-1 text-sm truncate">{page.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent */}
          {!searchQuery && recentPages.length > 0 && (
            <div className="mb-4">
              <button
                className="flex items-center gap-1 text-xs text-muted-foreground px-2 mb-1 hover:text-foreground"
                onClick={() => toggleSection('recent')}
              >
                {expandedSections.recent ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <Clock className="w-3 h-3 mr-1" />
                Recent
              </button>
              
              {expandedSections.recent && (
                <div>
                  {recentPages.slice(0, 5).map(page => (
                    <div
                      key={page.id}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                        activePage?.id === page.id 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-muted"
                      )}
                      onClick={() => onSelectPage(page.id)}
                    >
                      <span className="text-lg">{page.icon || '📄'}</span>
                      <span className="flex-1 text-sm truncate">{page.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Pages */}
          {!searchQuery && (
            <div>
              <button
                className="flex items-center gap-1 text-xs text-muted-foreground px-2 mb-1 hover:text-foreground"
                onClick={() => toggleSection('pages')}
              >
                {expandedSections.pages ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <FileText className="w-3 h-3 mr-1" />
                Pages
              </button>
              
              {expandedSections.pages && (
                <div>
                  {rootPages.map(page => renderPageItem(page))}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground"
          onClick={onCreatePage}
        >
          <Plus className="w-4 h-4 mr-2" />
          New page
        </Button>
      </div>
    </div>
  );
}
