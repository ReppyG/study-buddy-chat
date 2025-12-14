import React, { useState, useMemo } from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import { DatabaseSidebar } from './DatabaseSidebar';
import { TableView } from './TableView';
import { BoardView } from './BoardView';
import { CalendarView } from './CalendarView';
import { GalleryView } from './GalleryView';
import { ListView } from './ListView';
import { ItemDetailModal } from './ItemDetailModal';
import { PropertyEditor } from './PropertyEditor';
import { ViewControls } from './ViewControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatabaseItem, ViewType } from '@/types/database';
import { Settings, Database as DbIcon } from 'lucide-react';

export const DatabaseApp: React.FC = () => {
  const {
    databases,
    activeDatabase,
    activeView,
    activeDatabaseId,
    activeViewId,
    setActiveDatabaseId,
    setActiveViewId,
    createDatabase,
    updateDatabase,
    deleteDatabase,
    addProperty,
    updateProperty,
    deleteProperty,
    addItem,
    updateItem,
    deleteItem,
    addView,
    updateView,
    getFilteredItems,
    templates,
  } = useDatabase();

  const [selectedItem, setSelectedItem] = useState<DatabaseItem | null>(null);
  const [showPropertyEditor, setShowPropertyEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!activeDatabase || !activeView) return [];
    
    let items = getFilteredItems(activeDatabase, activeView);
    
    // Apply search
    if (searchQuery) {
      const titleProperty = activeDatabase.properties.find(p => p.type === 'title');
      items = items.filter(item => {
        const title = item.properties[titleProperty?.id || ''] || '';
        return String(title).toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    return items;
  }, [activeDatabase, activeView, getFilteredItems, searchQuery]);

  const handleAddItem = (defaultProperties?: Record<string, any>) => {
    if (!activeDatabaseId) return;
    addItem(activeDatabaseId, { properties: defaultProperties || {} });
  };

  const handleUpdateItem = (itemId: string, updates: Partial<DatabaseItem>) => {
    if (!activeDatabaseId) return;
    updateItem(activeDatabaseId, itemId, updates);
    if (selectedItem?.id === itemId) {
      setSelectedItem({ ...selectedItem, ...updates });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeDatabaseId) return;
    deleteItem(activeDatabaseId, itemId);
  };

  const handleDuplicateItem = () => {
    if (!activeDatabaseId || !selectedItem) return;
    addItem(activeDatabaseId, { properties: { ...selectedItem.properties } });
  };

  const handleAddView = (type: ViewType) => {
    if (!activeDatabaseId) return;
    const viewName = `${type.charAt(0).toUpperCase() + type.slice(1)} View`;
    addView(activeDatabaseId, {
      id: Math.random().toString(36).substr(2, 9),
      name: viewName,
      type,
      filters: [],
      sorts: [],
      hiddenProperties: [],
      groupByPropertyId: type === 'board' ? activeDatabase?.properties.find(p => p.type === 'status')?.id : undefined,
    });
  };

  const handleSort = (propertyId: string) => {
    if (!activeDatabaseId || !activeViewId || !activeView) return;
    
    const existingSort = activeView.sorts.find(s => s.propertyId === propertyId);
    let newSorts;
    
    if (!existingSort) {
      newSorts = [{ propertyId, direction: 'asc' as const }];
    } else if (existingSort.direction === 'asc') {
      newSorts = [{ propertyId, direction: 'desc' as const }];
    } else {
      newSorts = [];
    }
    
    updateView(activeDatabaseId, activeViewId, { sorts: newSorts });
  };

  if (!activeDatabase) {
    return (
      <div className="flex h-[calc(100vh-120px)]">
        <DatabaseSidebar
          databases={databases}
          activeDatabaseId={activeDatabaseId}
          onSelectDatabase={setActiveDatabaseId}
          onCreateDatabase={createDatabase}
          onDeleteDatabase={deleteDatabase}
          templates={templates}
        />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <DbIcon className="w-16 h-16 mx-auto text-muted-foreground/50" />
            <h2 className="text-xl font-semibold text-muted-foreground">No Database Selected</h2>
            <p className="text-muted-foreground">Select or create a database to get started</p>
            <Button onClick={() => createDatabase()}>
              Create Database
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      <DatabaseSidebar
        databases={databases}
        activeDatabaseId={activeDatabaseId}
        onSelectDatabase={(id) => {
          setActiveDatabaseId(id);
          const db = databases.find(d => d.id === id);
          if (db?.views[0]) setActiveViewId(db.views[0].id);
        }}
        onCreateDatabase={createDatabase}
        onDeleteDatabase={deleteDatabase}
        templates={templates}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{activeDatabase.icon}</span>
            <Input
              value={activeDatabase.name}
              onChange={e => updateDatabase(activeDatabase.id, { name: e.target.value })}
              className="text-xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPropertyEditor(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {activeView && (
            <ViewControls
              database={activeDatabase}
              view={activeView}
              views={activeDatabase.views}
              onViewChange={setActiveViewId}
              onUpdateView={(updates) => updateView(activeDatabase.id, activeView.id, updates)}
              onAddView={handleAddView}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeView?.type === 'table' && (
            <TableView
              database={activeDatabase}
              view={activeView}
              items={filteredItems}
              onItemClick={setSelectedItem}
              onUpdateItem={handleUpdateItem}
              onAddItem={() => handleAddItem()}
              onDeleteItem={handleDeleteItem}
              onSort={handleSort}
            />
          )}

          {activeView?.type === 'board' && (
            <BoardView
              database={activeDatabase}
              view={activeView}
              items={filteredItems}
              onItemClick={setSelectedItem}
              onUpdateItem={handleUpdateItem}
              onAddItem={handleAddItem}
            />
          )}

          {activeView?.type === 'calendar' && (
            <CalendarView
              database={activeDatabase}
              view={activeView}
              items={filteredItems}
              onItemClick={setSelectedItem}
              onAddItem={handleAddItem}
            />
          )}

          {activeView?.type === 'gallery' && (
            <GalleryView
              database={activeDatabase}
              view={activeView}
              items={filteredItems}
              onItemClick={setSelectedItem}
              onAddItem={() => handleAddItem()}
            />
          )}

          {activeView?.type === 'list' && (
            <ListView
              database={activeDatabase}
              view={activeView}
              items={filteredItems}
              onItemClick={setSelectedItem}
              onAddItem={() => handleAddItem()}
              onDeleteItem={handleDeleteItem}
            />
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        database={activeDatabase}
        item={selectedItem}
        onUpdateItem={(updates) => selectedItem && handleUpdateItem(selectedItem.id, updates)}
        onDeleteItem={() => selectedItem && handleDeleteItem(selectedItem.id)}
        onDuplicateItem={handleDuplicateItem}
      />

      {/* Property Editor */}
      <PropertyEditor
        isOpen={showPropertyEditor}
        onClose={() => setShowPropertyEditor(false)}
        properties={activeDatabase.properties}
        onAddProperty={(prop) => addProperty(activeDatabase.id, prop)}
        onUpdateProperty={(propId, updates) => updateProperty(activeDatabase.id, propId, updates)}
        onDeleteProperty={(propId) => deleteProperty(activeDatabase.id, propId)}
      />
    </div>
  );
};
