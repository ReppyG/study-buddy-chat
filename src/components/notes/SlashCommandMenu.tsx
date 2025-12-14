import { useState, useEffect, useRef } from 'react';
import { 
  Type, Heading1, Heading2, Heading3, List, ListOrdered, 
  ChevronRight, CheckSquare, Quote, AlertCircle, Code, 
  Minus, Image, Video, Table
} from 'lucide-react';
import { BLOCK_TYPES, BlockType } from '@/types/notes';
import { cn } from '@/lib/utils';

interface SlashCommandMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  filter: string;
}

const iconMap: Record<string, any> = {
  Type, Heading1, Heading2, Heading3, List, ListOrdered,
  ChevronRight, CheckSquare, Quote, AlertCircle, Code,
  Minus, Image, Video, Table,
};

export function SlashCommandMenu({ isOpen, position, onSelect, onClose, filter }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredTypes = BLOCK_TYPES.filter(bt => 
    bt.label.toLowerCase().includes(filter.toLowerCase()) ||
    bt.type.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredTypes.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredTypes.length) % filteredTypes.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTypes[selectedIndex]) {
            onSelect(filteredTypes[selectedIndex].type);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredTypes, onSelect, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover border border-border rounded-lg shadow-xl overflow-hidden min-w-[250px] max-h-[300px] overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-2">
        <p className="text-xs text-muted-foreground px-2 pb-2">Basic blocks</p>
        {filteredTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-4 text-center">No results found</p>
        ) : (
          filteredTypes.map((bt, index) => {
            const Icon = iconMap[bt.icon] || Type;
            return (
              <button
                key={bt.type}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors",
                  index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                )}
                onClick={() => onSelect(bt.type)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{bt.label}</p>
                  {bt.shortcut && (
                    <p className="text-xs text-muted-foreground">Type {bt.shortcut}</p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
