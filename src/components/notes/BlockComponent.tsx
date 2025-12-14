import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { 
  GripVertical, Plus, ChevronRight, ChevronDown, Check, 
  Trash2, MoreHorizontal, Copy, ArrowUp, ArrowDown
} from 'lucide-react';
import { Block, BlockType, CALLOUT_COLORS } from '@/types/notes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BlockComponentProps {
  block: Block;
  index: number;
  isActive: boolean;
  onFocus: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onAddBlock: (type?: BlockType) => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>, blockId: string) => void;
  onSlashCommand: (position: { top: number; left: number }) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragHandleProps?: any;
}

export function BlockComponent({
  block,
  index,
  isActive,
  onFocus,
  onUpdate,
  onDelete,
  onAddBlock,
  onKeyDown,
  onSlashCommand,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
}: BlockComponentProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [localContent, setLocalContent] = useState(block.content);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalContent(block.content);
  }, [block.content]);

  const handleInput = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerText;
      setLocalContent(newContent);
      
      // Check for markdown shortcuts
      const shortcuts: Record<string, BlockType> = {
        '# ': 'heading1',
        '## ': 'heading2',
        '### ': 'heading3',
        '- ': 'bulletList',
        '* ': 'bulletList',
        '1. ': 'numberedList',
        '[] ': 'checkbox',
        '> ': 'quote',
        '--- ': 'divider',
        '``` ': 'code',
      };

      for (const [shortcut, type] of Object.entries(shortcuts)) {
        if (newContent.startsWith(shortcut)) {
          onUpdate({ 
            type, 
            content: newContent.slice(shortcut.length),
            metadata: { ...block.metadata, modifiedAt: new Date().toISOString() }
          });
          if (contentRef.current) {
            contentRef.current.innerText = newContent.slice(shortcut.length);
          }
          return;
        }
      }

      // Check for slash command
      if (newContent === '/') {
        const rect = contentRef.current.getBoundingClientRect();
        onSlashCommand({ top: rect.bottom + 4, left: rect.left });
      }
    }
  };

  const handleBlur = () => {
    if (localContent !== block.content) {
      onUpdate({ content: localContent });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Handle backspace on empty block
    if (e.key === 'Backspace' && localContent === '' && block.type !== 'text') {
      e.preventDefault();
      onUpdate({ type: 'text' });
      return;
    }
    
    if (e.key === 'Backspace' && localContent === '' && index > 0) {
      e.preventDefault();
      onDelete();
      return;
    }

    // Handle Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      if (block.type === 'code') return; // Allow multiline in code blocks
      e.preventDefault();
      onAddBlock();
      return;
    }

    onKeyDown(e, block.id);
  };

  const toggleCheckbox = () => {
    onUpdate({ 
      metadata: { 
        ...block.metadata, 
        checked: !block.metadata.checked,
        modifiedAt: new Date().toISOString()
      } 
    });
  };

  const toggleCollapse = () => {
    onUpdate({ 
      metadata: { 
        ...block.metadata, 
        collapsed: !block.metadata.collapsed,
        modifiedAt: new Date().toISOString()
      } 
    });
  };

  const renderBlockContent = () => {
    const baseClasses = "outline-none w-full";
    const placeholderClasses = "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground";

    switch (block.type) {
      case 'heading1':
        return (
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(baseClasses, placeholderClasses, "text-3xl font-bold")}
            data-placeholder="Heading 1"
            onInput={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
          >
            {block.content}
          </div>
        );

      case 'heading2':
        return (
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(baseClasses, placeholderClasses, "text-2xl font-semibold")}
            data-placeholder="Heading 2"
            onInput={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
          >
            {block.content}
          </div>
        );

      case 'heading3':
        return (
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(baseClasses, placeholderClasses, "text-xl font-medium")}
            data-placeholder="Heading 3"
            onInput={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
          >
            {block.content}
          </div>
        );

      case 'bulletList':
        return (
          <div className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground flex-shrink-0" />
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(baseClasses, placeholderClasses)}
              data-placeholder="List item"
              onInput={handleInput}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
            >
              {block.content}
            </div>
          </div>
        );

      case 'numberedList':
        return (
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground flex-shrink-0 min-w-[1.5rem]">{index + 1}.</span>
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(baseClasses, placeholderClasses)}
              data-placeholder="List item"
              onInput={handleInput}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
            >
              {block.content}
            </div>
          </div>
        );

      case 'toggleList':
        return (
          <div className="flex items-start gap-1">
            <button
              onClick={toggleCollapse}
              className="mt-0.5 p-0.5 hover:bg-muted rounded transition-colors"
            >
              {block.metadata.collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(baseClasses, placeholderClasses)}
              data-placeholder="Toggle"
              onInput={handleInput}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
            >
              {block.content}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-start gap-2">
            <button
              onClick={toggleCheckbox}
              className={cn(
                "mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                block.metadata.checked 
                  ? "bg-primary border-primary" 
                  : "border-border hover:border-primary"
              )}
            >
              {block.metadata.checked && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(
                baseClasses, 
                placeholderClasses,
                block.metadata.checked && "line-through text-muted-foreground"
              )}
              data-placeholder="To-do"
              onInput={handleInput}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
            >
              {block.content}
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="flex">
            <div className="w-1 bg-primary rounded mr-3 flex-shrink-0" />
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(baseClasses, placeholderClasses, "italic text-muted-foreground")}
              data-placeholder="Quote"
              onInput={handleInput}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
            >
              {block.content}
            </div>
          </div>
        );

      case 'callout':
        const colorClass = CALLOUT_COLORS.find(c => c.name === block.metadata.color) || CALLOUT_COLORS[0];
        return (
          <div className={cn("flex gap-3 p-4 rounded-lg border", colorClass.bg, colorClass.border)}>
            <span className="text-xl">{block.metadata.emoji || '💡'}</span>
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(baseClasses, placeholderClasses)}
              data-placeholder="Callout"
              onInput={handleInput}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
            >
              {block.content}
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(baseClasses, placeholderClasses, "whitespace-pre-wrap")}
              data-placeholder="// Code"
              onInput={handleInput}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
            >
              {block.content}
            </div>
          </div>
        );

      case 'divider':
        return <hr className="border-border my-2" />;

      case 'image':
        return block.metadata.url ? (
          <div className="my-2">
            <img 
              src={block.metadata.url} 
              alt={block.content || 'Image'} 
              className="max-w-full rounded-lg"
            />
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(baseClasses, placeholderClasses, "text-sm text-muted-foreground mt-2")}
              data-placeholder="Add a caption..."
              onInput={handleInput}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
            >
              {block.content}
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="text"
              placeholder="Paste image URL..."
              className="bg-transparent border-b border-border px-2 py-1 outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const url = (e.target as HTMLInputElement).value;
                  onUpdate({ metadata: { ...block.metadata, url } });
                }
              }}
            />
          </div>
        );

      case 'video':
        const videoId = block.metadata.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
        return videoId ? (
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="text"
              placeholder="Paste YouTube URL..."
              className="bg-transparent border-b border-border px-2 py-1 outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const url = (e.target as HTMLInputElement).value;
                  onUpdate({ metadata: { ...block.metadata, url } });
                }
              }}
            />
          </div>
        );

      case 'table':
        const tableData = block.metadata.tableData || [['', '', ''], ['', '', '']];
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border border-border p-2">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className="outline-none min-w-[80px]"
                          onBlur={(e) => {
                            const newData = [...tableData];
                            newData[rowIndex][colIndex] = e.currentTarget.innerText;
                            onUpdate({ metadata: { ...block.metadata, tableData: newData } });
                          }}
                        >
                          {cell}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(baseClasses, placeholderClasses)}
            data-placeholder="Type '/' for commands..."
            onInput={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
          >
            {block.content}
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-start py-1 -ml-16 pl-16",
        isActive && "bg-accent/30 rounded"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left controls */}
      <div className={cn(
        "absolute left-2 top-1 flex items-center gap-0.5 transition-opacity",
        isHovered || isActive ? "opacity-100" : "opacity-0"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onAddBlock()}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <GripVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Block content */}
      <div className="flex-1 min-w-0">
        {renderBlockContent()}
      </div>

      {/* Right controls */}
      <div className={cn(
        "absolute right-2 top-1 transition-opacity",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(block.content)}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMoveUp}>
              <ArrowUp className="w-4 h-4 mr-2" />
              Move up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMoveDown}>
              <ArrowDown className="w-4 h-4 mr-2" />
              Move down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
