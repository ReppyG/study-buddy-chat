import { useState, useEffect, useCallback } from 'react';
import type { NotePage, Block, NotesState } from '@/types/notes';

const STORAGE_KEY = 'study-buddy-notes';

const createBlock = (type: Block['type'] = 'text', content = ''): Block => ({
  id: crypto.randomUUID(),
  type,
  content,
  metadata: {
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
});

const createPage = (title = 'Untitled', parentId?: string): NotePage => ({
  id: crypto.randomUUID(),
  title,
  blocks: [createBlock('text', '')],
  parentId,
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
});

// Sample pages for demo
const createSamplePages = (): NotePage[] => [
  {
    id: 'welcome',
    title: 'Welcome to Notes',
    icon: '📚',
    blocks: [
      createBlock('heading1', 'Welcome to Your Notes! 👋'),
      createBlock('text', 'This is a Notion-style block editor. Try these features:'),
      createBlock('bulletList', 'Type "/" to open the command menu'),
      createBlock('bulletList', 'Drag blocks to reorder them'),
      createBlock('bulletList', 'Use markdown shortcuts like # for headings'),
      createBlock('callout', 'Pro tip: Press Cmd+K to quickly find pages!'),
      createBlock('divider', ''),
      createBlock('heading2', 'Getting Started'),
      createBlock('checkbox', 'Create your first note'),
      createBlock('checkbox', 'Try the slash command menu'),
      createBlock('checkbox', 'Add some blocks'),
    ],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: 'study-notes',
    title: 'Study Notes',
    icon: '📖',
    blocks: [
      createBlock('heading1', 'Biology Chapter 5'),
      createBlock('heading2', 'Cell Structure'),
      createBlock('text', 'Cells are the basic unit of life...'),
      createBlock('quote', 'The cell is the structural and functional unit of all living organisms.'),
      createBlock('code', 'DNA → RNA → Protein'),
    ],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
];

export function useNotes() {
  const [state, setState] = useState<NotesState>({
    pages: [],
    activePage: null,
    recentPages: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error('Failed to parse notes:', e);
        setState({
          pages: createSamplePages(),
          activePage: 'welcome',
          recentPages: ['welcome'],
        });
      }
    } else {
      setState({
        pages: createSamplePages(),
        activePage: 'welcome',
        recentPages: ['welcome'],
      });
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoading]);

  const getActivePage = useCallback((): NotePage | null => {
    return state.pages.find(p => p.id === state.activePage) || null;
  }, [state.pages, state.activePage]);

  const setActivePage = useCallback((pageId: string) => {
    setState(prev => ({
      ...prev,
      activePage: pageId,
      recentPages: [pageId, ...prev.recentPages.filter(id => id !== pageId)].slice(0, 10),
    }));
  }, []);

  const createNewPage = useCallback((title?: string, parentId?: string): string => {
    const page = createPage(title, parentId);
    setState(prev => ({
      ...prev,
      pages: [...prev.pages, page],
      activePage: page.id,
      recentPages: [page.id, ...prev.recentPages].slice(0, 10),
    }));
    return page.id;
  }, []);

  const updatePage = useCallback((pageId: string, updates: Partial<NotePage>) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p => 
        p.id === pageId 
          ? { ...p, ...updates, modifiedAt: new Date().toISOString() }
          : p
      ),
    }));
  }, []);

  const deletePage = useCallback((pageId: string) => {
    setState(prev => {
      const newPages = prev.pages.filter(p => p.id !== pageId && p.parentId !== pageId);
      const newActive = prev.activePage === pageId 
        ? newPages[0]?.id || null 
        : prev.activePage;
      return {
        ...prev,
        pages: newPages,
        activePage: newActive,
        recentPages: prev.recentPages.filter(id => id !== pageId),
      };
    });
  }, []);

  const updateBlocks = useCallback((pageId: string, blocks: Block[]) => {
    updatePage(pageId, { blocks });
  }, [updatePage]);

  const addBlock = useCallback((pageId: string, afterBlockId: string, type: Block['type'] = 'text'): string => {
    const block = createBlock(type);
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p => {
        if (p.id !== pageId) return p;
        const index = p.blocks.findIndex(b => b.id === afterBlockId);
        const newBlocks = [...p.blocks];
        newBlocks.splice(index + 1, 0, block);
        return { ...p, blocks: newBlocks, modifiedAt: new Date().toISOString() };
      }),
    }));
    return block.id;
  }, []);

  const updateBlock = useCallback((pageId: string, blockId: string, updates: Partial<Block>) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.map(b => 
            b.id === blockId 
              ? { ...b, ...updates, metadata: { ...b.metadata, modifiedAt: new Date().toISOString() } }
              : b
          ),
          modifiedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  const deleteBlock = useCallback((pageId: string, blockId: string) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p => {
        if (p.id !== pageId) return p;
        const newBlocks = p.blocks.filter(b => b.id !== blockId);
        // Ensure at least one block exists
        if (newBlocks.length === 0) {
          newBlocks.push(createBlock('text'));
        }
        return { ...p, blocks: newBlocks, modifiedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const moveBlock = useCallback((pageId: string, blockId: string, newIndex: number) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p => {
        if (p.id !== pageId) return p;
        const blocks = [...p.blocks];
        const oldIndex = blocks.findIndex(b => b.id === blockId);
        if (oldIndex === -1) return p;
        const [block] = blocks.splice(oldIndex, 1);
        blocks.splice(newIndex, 0, block);
        return { ...p, blocks, modifiedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const getPageTree = useCallback(() => {
    const rootPages = state.pages.filter(p => !p.parentId);
    const getChildren = (parentId: string): NotePage[] => {
      return state.pages.filter(p => p.parentId === parentId);
    };
    return { rootPages, getChildren };
  }, [state.pages]);

  const searchPages = useCallback((query: string): NotePage[] => {
    const lowerQuery = query.toLowerCase();
    return state.pages.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) ||
      p.blocks.some(b => b.content.toLowerCase().includes(lowerQuery))
    );
  }, [state.pages]);

  const exportPage = useCallback((pageId: string): string => {
    const page = state.pages.find(p => p.id === pageId);
    if (!page) return '';
    return JSON.stringify(page, null, 2);
  }, [state.pages]);

  const importPage = useCallback((json: string): boolean => {
    try {
      const page = JSON.parse(json) as NotePage;
      page.id = crypto.randomUUID();
      page.createdAt = new Date().toISOString();
      page.modifiedAt = new Date().toISOString();
      setState(prev => ({
        ...prev,
        pages: [...prev.pages, page],
      }));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    pages: state.pages,
    activePage: getActivePage(),
    recentPages: state.recentPages.map(id => state.pages.find(p => p.id === id)).filter(Boolean) as NotePage[],
    isLoading,
    setActivePage,
    createNewPage,
    updatePage,
    deletePage,
    updateBlocks,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    getPageTree,
    searchPages,
    exportPage,
    importPage,
  };
}
