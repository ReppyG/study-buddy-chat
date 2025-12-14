import { useState, useCallback, KeyboardEvent } from 'react';
import { Image, Smile, Clock, FileText } from 'lucide-react';
import { Block, BlockType, NotePage } from '@/types/notes';
import { BlockComponent } from './BlockComponent';
import { SlashCommandMenu } from './SlashCommandMenu';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PageEditorProps {
  page: NotePage;
  onUpdatePage: (updates: Partial<NotePage>) => void;
  onAddBlock: (afterBlockId: string, type?: BlockType) => string;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, newIndex: number) => void;
}

const EMOJI_LIST = ['📚', '📖', '✏️', '💡', '🎯', '🚀', '⭐', '📝', '🔥', '💪', '🎓', '🧠', '📊', '🗂️', '📌'];

export function PageEditor({
  page,
  onUpdatePage,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
}: PageEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [slashMenu, setSlashMenu] = useState<{ isOpen: boolean; position: { top: number; left: number }; blockId: string; filter: string }>({
    isOpen: false,
    position: { top: 0, left: 0 },
    blockId: '',
    filter: '',
  });
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  // Calculate stats
  const wordCount = page.blocks.reduce((acc, block) => acc + block.content.split(/\s+/).filter(Boolean).length, 0);
  const charCount = page.blocks.reduce((acc, block) => acc + block.content.length, 0);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleTitleChange = (e: React.FormEvent<HTMLDivElement>) => {
    onUpdatePage({ title: e.currentTarget.innerText });
  };

  const handleSlashCommand = useCallback((blockId: string, position: { top: number; left: number }) => {
    setSlashMenu({ isOpen: true, position, blockId, filter: '' });
  }, []);

  const handleSlashSelect = useCallback((type: BlockType) => {
    if (slashMenu.blockId) {
      onUpdateBlock(slashMenu.blockId, { type, content: '' });
    }
    setSlashMenu(prev => ({ ...prev, isOpen: false }));
  }, [slashMenu.blockId, onUpdateBlock]);

  const handleBlockKeyDown = useCallback((e: KeyboardEvent<HTMLElement>, blockId: string) => {
    const blockIndex = page.blocks.findIndex(b => b.id === blockId);
    
    // Navigate between blocks with arrow keys
    if (e.key === 'ArrowUp' && blockIndex > 0) {
      // Focus previous block
    }
    if (e.key === 'ArrowDown' && blockIndex < page.blocks.length - 1) {
      // Focus next block
    }
  }, [page.blocks]);

  const handleDragStart = (blockId: string) => {
    setDraggedBlockId(blockId);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedBlockId) return;
    
    const draggedIndex = page.blocks.findIndex(b => b.id === draggedBlockId);
    if (draggedIndex !== targetIndex) {
      onMoveBlock(draggedBlockId, targetIndex);
    }
  };

  const handleDragEnd = () => {
    setDraggedBlockId(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Cover Image */}
      {page.coverImage ? (
        <div className="relative -mx-4 mb-8 h-48 md:h-64 overflow-hidden rounded-lg">
          <img 
            src={page.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4"
            onClick={() => onUpdatePage({ coverImage: undefined })}
          >
            Remove cover
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 mb-4 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              const url = prompt('Enter cover image URL:');
              if (url) onUpdatePage({ coverImage: url });
            }}
          >
            <Image className="w-4 h-4 mr-2" />
            Add cover
          </Button>
        </div>
      )}

      {/* Icon & Title */}
      <div className="flex items-start gap-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-5xl hover:bg-muted rounded-lg p-2 transition-colors">
              {page.icon || '📄'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-5 gap-1">
              {EMOJI_LIST.map(emoji => (
                <button
                  key={emoji}
                  className="text-2xl p-2 hover:bg-muted rounded"
                  onClick={() => onUpdatePage({ icon: emoji })}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div
          contentEditable
          suppressContentEditableWarning
          className="flex-1 text-4xl font-bold outline-none empty:before:content-['Untitled'] empty:before:text-muted-foreground"
          onBlur={handleTitleChange}
        >
          {page.title}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          <span>{wordCount} words</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{readingTime} min read</span>
        </div>
        <div className="ml-auto">
          Last edited {new Date(page.modifiedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-0.5 pl-16">
        {page.blocks.map((block, index) => (
          <div
            key={block.id}
            draggable
            onDragStart={() => handleDragStart(block.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              draggedBlockId === block.id && "opacity-50"
            )}
          >
            <BlockComponent
              block={block}
              index={index}
              isActive={activeBlockId === block.id}
              onFocus={() => setActiveBlockId(block.id)}
              onUpdate={(updates) => onUpdateBlock(block.id, updates)}
              onDelete={() => onDeleteBlock(block.id)}
              onAddBlock={(type) => {
                const newId = onAddBlock(block.id, type);
                setTimeout(() => setActiveBlockId(newId), 0);
              }}
              onKeyDown={handleBlockKeyDown}
              onSlashCommand={(pos) => handleSlashCommand(block.id, pos)}
              onMoveUp={() => index > 0 && onMoveBlock(block.id, index - 1)}
              onMoveDown={() => index < page.blocks.length - 1 && onMoveBlock(block.id, index + 1)}
            />
          </div>
        ))}
      </div>

      {/* Slash Command Menu */}
      <SlashCommandMenu
        isOpen={slashMenu.isOpen}
        position={slashMenu.position}
        filter={slashMenu.filter}
        onSelect={handleSlashSelect}
        onClose={() => setSlashMenu(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
