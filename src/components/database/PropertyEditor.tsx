import React, { useState } from 'react';
import { Property, PropertyType, SelectOption, PROPERTY_COLORS } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyEditorProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onAddProperty: (property: Property) => void;
  onUpdateProperty: (propertyId: string, updates: Partial<Property>) => void;
  onDeleteProperty: (propertyId: string) => void;
}

const PROPERTY_TYPES: { type: PropertyType; label: string; icon: string }[] = [
  { type: 'title', label: 'Title', icon: '📝' },
  { type: 'text', label: 'Text', icon: '📄' },
  { type: 'longText', label: 'Long Text', icon: '📃' },
  { type: 'number', label: 'Number', icon: '🔢' },
  { type: 'select', label: 'Select', icon: '📋' },
  { type: 'multiSelect', label: 'Multi-select', icon: '📑' },
  { type: 'status', label: 'Status', icon: '🚦' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'person', label: 'Person', icon: '👤' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { type: 'url', label: 'URL', icon: '🔗' },
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'phone', label: 'Phone', icon: '📞' },
  { type: 'files', label: 'Files', icon: '📎' },
  { type: 'rating', label: 'Rating', icon: '⭐' },
];

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  isOpen,
  onClose,
  properties,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}) => {
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [newOptionLabel, setNewOptionLabel] = useState('');

  const handleAddProperty = (type: PropertyType) => {
    const typeInfo = PROPERTY_TYPES.find(t => t.type === type);
    onAddProperty({
      id: Math.random().toString(36).substr(2, 9),
      name: typeInfo?.label || 'New Property',
      type,
      options: type === 'select' || type === 'multiSelect' ? [] : undefined,
    });
  };

  const handleAddOption = () => {
    if (!editingProperty || !newOptionLabel.trim()) return;
    
    const newOption: SelectOption = {
      id: Math.random().toString(36).substr(2, 9),
      label: newOptionLabel.trim(),
      color: PROPERTY_COLORS[Math.floor(Math.random() * PROPERTY_COLORS.length)],
    };

    onUpdateProperty(editingProperty.id, {
      options: [...(editingProperty.options || []), newOption],
    });
    
    setEditingProperty({
      ...editingProperty,
      options: [...(editingProperty.options || []), newOption],
    });
    
    setNewOptionLabel('');
  };

  const handleRemoveOption = (optionId: string) => {
    if (!editingProperty) return;
    
    const newOptions = editingProperty.options?.filter(o => o.id !== optionId) || [];
    onUpdateProperty(editingProperty.id, { options: newOptions });
    setEditingProperty({ ...editingProperty, options: newOptions });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Properties</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Existing Properties */}
          <div className="space-y-2">
            {properties.map(property => (
              <div
                key={property.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent/30"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                
                <span className="text-lg">
                  {PROPERTY_TYPES.find(t => t.type === property.type)?.icon}
                </span>
                
                <Input
                  value={property.name}
                  onChange={e => onUpdateProperty(property.id, { name: e.target.value })}
                  className="flex-1 h-8"
                />
                
                <span className="text-xs text-muted-foreground">
                  {PROPERTY_TYPES.find(t => t.type === property.type)?.label}
                </span>

                {(property.type === 'select' || property.type === 'multiSelect') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProperty(property)}
                  >
                    Options
                  </Button>
                )}
                
                {property.type !== 'title' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDeleteProperty(property.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add Property */}
          <div className="pt-4 border-t border-border">
            <Label className="text-sm text-muted-foreground mb-2 block">Add Property</Label>
            <div className="grid grid-cols-4 gap-2">
              {PROPERTY_TYPES.filter(t => t.type !== 'title').map(({ type, label, icon }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => handleAddProperty(type)}
                >
                  <span className="mr-1">{icon}</span>
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Option Editor Modal */}
        {editingProperty && (editingProperty.type === 'select' || editingProperty.type === 'multiSelect') && (
          <Dialog open={!!editingProperty} onOpenChange={() => setEditingProperty(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Options for {editingProperty.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {editingProperty.options?.map(option => (
                  <div key={option.id} className="flex items-center gap-2">
                    <div className={cn('w-4 h-4 rounded', option.color)} />
                    <span className="flex-1">{option.label}</span>
                    <Select
                      value={option.color}
                      onValueChange={color => {
                        const newOptions = editingProperty.options?.map(o =>
                          o.id === option.id ? { ...o, color } : o
                        );
                        onUpdateProperty(editingProperty.id, { options: newOptions });
                        setEditingProperty({ ...editingProperty, options: newOptions });
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        {PROPERTY_COLORS.map(color => (
                          <SelectItem key={color} value={color}>
                            <div className={cn('w-4 h-4 rounded', color)} />
                          </SelectItem>
                        )))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveOption(option.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <Input
                    value={newOptionLabel}
                    onChange={e => setNewOptionLabel(e.target.value)}
                    placeholder="New option"
                    onKeyDown={e => e.key === 'Enter' && handleAddOption()}
                  />
                  <Button onClick={handleAddOption}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};
