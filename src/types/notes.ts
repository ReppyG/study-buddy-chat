export type BlockType = 
  | 'text'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'numberedList'
  | 'toggleList'
  | 'checkbox'
  | 'quote'
  | 'callout'
  | 'code'
  | 'divider'
  | 'image'
  | 'video'
  | 'file'
  | 'columns'
  | 'table';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  metadata: {
    createdAt: string;
    modifiedAt: string;
    checked?: boolean;
    collapsed?: boolean;
    language?: string;
    emoji?: string;
    color?: string;
    url?: string;
    fileName?: string;
    columns?: Block[][];
    tableData?: string[][];
    indent?: number;
  };
  children?: Block[];
}

export interface NotePage {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  blocks: Block[];
  parentId?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface NotesState {
  pages: NotePage[];
  activePage: string | null;
  recentPages: string[];
}

export const BLOCK_TYPES: { type: BlockType; label: string; icon: string; shortcut?: string }[] = [
  { type: 'text', label: 'Text', icon: 'Type', shortcut: '' },
  { type: 'heading1', label: 'Heading 1', icon: 'Heading1', shortcut: '#' },
  { type: 'heading2', label: 'Heading 2', icon: 'Heading2', shortcut: '##' },
  { type: 'heading3', label: 'Heading 3', icon: 'Heading3', shortcut: '###' },
  { type: 'bulletList', label: 'Bulleted List', icon: 'List', shortcut: '-' },
  { type: 'numberedList', label: 'Numbered List', icon: 'ListOrdered', shortcut: '1.' },
  { type: 'toggleList', label: 'Toggle List', icon: 'ChevronRight', shortcut: '>' },
  { type: 'checkbox', label: 'To-do List', icon: 'CheckSquare', shortcut: '[]' },
  { type: 'quote', label: 'Quote', icon: 'Quote', shortcut: '"' },
  { type: 'callout', label: 'Callout', icon: 'AlertCircle' },
  { type: 'code', label: 'Code Block', icon: 'Code', shortcut: '```' },
  { type: 'divider', label: 'Divider', icon: 'Minus', shortcut: '---' },
  { type: 'image', label: 'Image', icon: 'Image' },
  { type: 'video', label: 'Video Embed', icon: 'Video' },
  { type: 'table', label: 'Table', icon: 'Table' },
];

export const CALLOUT_COLORS = [
  { name: 'Gray', bg: 'bg-muted', border: 'border-muted-foreground/20' },
  { name: 'Blue', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { name: 'Green', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  { name: 'Yellow', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { name: 'Red', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  { name: 'Purple', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
];
