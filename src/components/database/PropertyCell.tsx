import React, { useState } from 'react';
import { Property, SelectOption, STATUS_OPTIONS } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Star, Link, Mail, Phone, FileIcon, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PropertyCellProps {
  property: Property;
  value: any;
  onChange: (value: any) => void;
  readonly?: boolean;
}

export const PropertyCell: React.FC<PropertyCellProps> = ({
  property,
  value,
  onChange,
  readonly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const renderSelect = (options: SelectOption[], multi = false) => {
    const selected = multi ? (value || []) : value;
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex flex-wrap gap-1 min-h-[24px] cursor-pointer">
            {multi ? (
              (selected as string[]).map(id => {
                const opt = options.find(o => o.id === id);
                return opt ? (
                  <Badge key={id} className={cn('text-xs text-white', opt.color)}>{opt.label}</Badge>
                ) : null;
              })
            ) : (
              selected && options.find(o => o.id === selected) && (
                <Badge className={cn('text-xs text-white', options.find(o => o.id === selected)?.color)}>
                  {options.find(o => o.id === selected)?.label}
                </Badge>
              )
            )}
            {(!selected || (Array.isArray(selected) && selected.length === 0)) && (
              <span className="text-muted-foreground text-sm">Select...</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2 bg-popover border border-border z-50" align="start">
          <div className="space-y-1">
            {options.map(opt => (
              <div
                key={opt.id}
                onClick={() => {
                  if (multi) {
                    const current = (value || []) as string[];
                    onChange(current.includes(opt.id) 
                      ? current.filter(id => id !== opt.id)
                      : [...current, opt.id]
                    );
                  } else {
                    onChange(opt.id);
                  }
                }}
                className={cn(
                  'px-2 py-1 rounded cursor-pointer flex items-center gap-2 hover:bg-accent',
                  (multi ? (value || []).includes(opt.id) : value === opt.id) && 'bg-accent'
                )}
              >
                <div className={cn('w-3 h-3 rounded', opt.color)} />
                <span className="text-sm">{opt.label}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const renderRating = () => {
    const rating = value || 0;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4 cursor-pointer transition-colors',
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            )}
            onClick={() => !readonly && onChange(star === rating ? 0 : star)}
          />
        ))}
      </div>
    );
  };

  switch (property.type) {
    case 'title':
    case 'text':
      return (
        <Input
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="h-8 border-0 bg-transparent focus-visible:ring-1 px-1"
          placeholder={property.type === 'title' ? 'Untitled' : 'Empty'}
          readOnly={readonly}
        />
      );

    case 'longText':
      return (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full min-h-[60px] bg-transparent border-0 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
          placeholder="Write something..."
          readOnly={readonly}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
          className="h-8 border-0 bg-transparent focus-visible:ring-1 px-1"
          placeholder="0"
          readOnly={readonly}
        />
      );

    case 'select':
      return renderSelect(property.options || [], false);

    case 'multiSelect':
      return renderSelect(property.options || [], true);

    case 'status':
      return renderSelect(STATUS_OPTIONS, false);

    case 'date':
      return (
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer text-sm">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              {value ? format(new Date(value), 'MMM d, yyyy') : <span className="text-muted-foreground">Pick date</span>}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover border border-border z-50" align="start">
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={date => onChange(date?.toISOString())}
            />
          </PopoverContent>
        </Popover>
      );

    case 'checkbox':
      return (
        <Checkbox
          checked={!!value}
          onCheckedChange={checked => onChange(checked)}
          disabled={readonly}
        />
      );

    case 'url':
      return (
        <div className="flex items-center gap-1">
          <Link className="w-4 h-4 text-muted-foreground" />
          <Input
            type="url"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="h-8 border-0 bg-transparent focus-visible:ring-1 px-1 text-primary"
            placeholder="https://..."
            readOnly={readonly}
          />
        </div>
      );

    case 'email':
      return (
        <div className="flex items-center gap-1">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="h-8 border-0 bg-transparent focus-visible:ring-1 px-1"
            placeholder="email@example.com"
            readOnly={readonly}
          />
        </div>
      );

    case 'phone':
      return (
        <div className="flex items-center gap-1">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <Input
            type="tel"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="h-8 border-0 bg-transparent focus-visible:ring-1 px-1"
            placeholder="(555) 123-4567"
            readOnly={readonly}
          />
        </div>
      );

    case 'files':
      return (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <FileIcon className="w-4 h-4" />
          <span>{value?.length || 0} files</span>
        </div>
      );

    case 'rating':
      return renderRating();

    case 'person':
      return (
        <Input
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="h-8 border-0 bg-transparent focus-visible:ring-1 px-1"
          placeholder="Assign person"
          readOnly={readonly}
        />
      );

    default:
      return <span className="text-muted-foreground text-sm">{String(value || '')}</span>;
  }
};
