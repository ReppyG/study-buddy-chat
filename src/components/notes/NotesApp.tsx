import { useState, useEffect } from 'react';
import { Menu, X, Command } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { NotesSidebar } from './NotesSidebar';
import { PageEditor } from './PageEditor';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function NotesApp() {
  const {
    pages,
    activePage,
    recentPages,
    isLoading,
    setActivePage,
    createNewPage,
    updatePage,
    deletePage,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    searchPages,
  } = useNotes();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isQuickFindOpen, setIsQuickFindOpen] = useState(false);
  const [quickFindQuery, setQuickFindQuery] = useState('');

  // Keyboard shortcut for quick find
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickFindOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const quickFindResults = quickFindQuery ? searchPages(quickFindQuery) : recentPages;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex bg-background">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 lg:relative lg:flex",
        "transform transition-transform duration-200",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:hidden"
      )}>
        <NotesSidebar
          pages={pages}
          activePage={activePage}
          recentPages={recentPages}
          onSelectPage={(id) => {
            setActivePage(id);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          onCreatePage={() => createNewPage()}
          onDeletePage={deletePage}
          onSearch={searchPages}
        />
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick find button */}
        <div className="flex justify-end p-4">
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setIsQuickFindOpen(true)}
          >
            <Command className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Quick Find</span>
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>
        </div>

        {activePage ? (
          <PageEditor
            page={activePage}
            onUpdatePage={(updates) => updatePage(activePage.id, updates)}
            onAddBlock={(afterBlockId, type) => addBlock(activePage.id, afterBlockId, type)}
            onUpdateBlock={(blockId, updates) => updateBlock(activePage.id, blockId, updates)}
            onDeleteBlock={(blockId) => deleteBlock(activePage.id, blockId)}
            onMoveBlock={(blockId, newIndex) => moveBlock(activePage.id, blockId, newIndex)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">No page selected</h2>
            <p className="text-muted-foreground mb-6">
              Select a page from the sidebar or create a new one
            </p>
            <Button onClick={() => createNewPage()}>
              Create new page
            </Button>
          </div>
        )}
      </div>

      {/* Quick Find Dialog */}
      <Dialog open={isQuickFindOpen} onOpenChange={setIsQuickFindOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <Input
              placeholder="Search pages..."
              value={quickFindQuery}
              onChange={(e) => setQuickFindQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-lg"
              autoFocus
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {quickFindResults.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pages found</p>
            ) : (
              quickFindResults.map(page => (
                <button
                  key={page.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left"
                  onClick={() => {
                    setActivePage(page.id);
                    setIsQuickFindOpen(false);
                    setQuickFindQuery('');
                  }}
                >
                  <span className="text-xl">{page.icon || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{page.title || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(page.modifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
