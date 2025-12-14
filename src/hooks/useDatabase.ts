import { useState, useEffect, useCallback } from 'react';
import { Database, DatabaseItem, Property, DatabaseView, PropertyType, STATUS_OPTIONS, PROPERTY_COLORS } from '@/types/database';

const STORAGE_KEY = 'study-buddy-databases';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createDefaultProperty = (type: PropertyType, name: string): Property => ({
  id: generateId(),
  name,
  type,
  options: type === 'status' ? STATUS_OPTIONS : type === 'select' || type === 'multiSelect' ? [] : undefined,
});

const DATABASE_TEMPLATES: Partial<Database>[] = [
  {
    name: 'Assignment Tracker',
    description: 'Track your homework and assignments',
    icon: '📚',
    properties: [
      createDefaultProperty('title', 'Assignment'),
      createDefaultProperty('select', 'Course'),
      createDefaultProperty('status', 'Status'),
      createDefaultProperty('date', 'Due Date'),
      createDefaultProperty('number', 'Points'),
      createDefaultProperty('rating', 'Priority'),
    ],
  },
  {
    name: 'Study Resources',
    description: 'Organize your study materials',
    icon: '📖',
    properties: [
      createDefaultProperty('title', 'Resource'),
      createDefaultProperty('select', 'Type'),
      createDefaultProperty('multiSelect', 'Topics'),
      createDefaultProperty('url', 'Link'),
      createDefaultProperty('rating', 'Usefulness'),
    ],
  },
  {
    name: 'Flashcard Sets',
    description: 'Manage your flashcard collections',
    icon: '🃏',
    properties: [
      createDefaultProperty('title', 'Set Name'),
      createDefaultProperty('select', 'Subject'),
      createDefaultProperty('number', 'Card Count'),
      createDefaultProperty('status', 'Mastery'),
      createDefaultProperty('date', 'Last Reviewed'),
    ],
  },
  {
    name: 'Project Tasks',
    description: 'Manage project tasks and milestones',
    icon: '✅',
    properties: [
      createDefaultProperty('title', 'Task'),
      createDefaultProperty('person', 'Assignee'),
      createDefaultProperty('status', 'Status'),
      createDefaultProperty('date', 'Deadline'),
      createDefaultProperty('checkbox', 'Urgent'),
    ],
  },
  {
    name: 'Reading List',
    description: 'Track books and articles to read',
    icon: '📕',
    properties: [
      createDefaultProperty('title', 'Title'),
      createDefaultProperty('text', 'Author'),
      createDefaultProperty('select', 'Genre'),
      createDefaultProperty('status', 'Status'),
      createDefaultProperty('rating', 'Rating'),
      createDefaultProperty('number', 'Pages'),
    ],
  },
];

export const useDatabase = () => {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [activeDatabaseId, setActiveDatabaseId] = useState<string | null>(null);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setDatabases(parsed);
      if (parsed.length > 0) {
        setActiveDatabaseId(parsed[0].id);
        if (parsed[0].views.length > 0) {
          setActiveViewId(parsed[0].views[0].id);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (databases.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(databases));
    }
  }, [databases]);

  const activeDatabase = databases.find(db => db.id === activeDatabaseId);
  const activeView = activeDatabase?.views.find(v => v.id === activeViewId);

  const createDatabase = useCallback((templateIndex?: number) => {
    const template = templateIndex !== undefined ? DATABASE_TEMPLATES[templateIndex] : null;
    const newDb: Database = {
      id: generateId(),
      name: template?.name || 'Untitled Database',
      description: template?.description || '',
      icon: template?.icon || '📋',
      properties: template?.properties || [createDefaultProperty('title', 'Name')],
      items: [],
      views: [
        { id: generateId(), name: 'Table View', type: 'table', filters: [], sorts: [], hiddenProperties: [] },
        { id: generateId(), name: 'Board View', type: 'board', filters: [], sorts: [], hiddenProperties: [], groupByPropertyId: template?.properties?.find(p => p.type === 'status')?.id },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add sample course options if it's assignment tracker
    if (templateIndex === 0) {
      const courseProperty = newDb.properties.find(p => p.name === 'Course');
      if (courseProperty) {
        courseProperty.options = [
          { id: 'math', label: 'Math', color: 'bg-blue-500' },
          { id: 'science', label: 'Science', color: 'bg-green-500' },
          { id: 'english', label: 'English', color: 'bg-purple-500' },
          { id: 'history', label: 'History', color: 'bg-orange-500' },
        ];
      }
    }

    setDatabases(prev => [...prev, newDb]);
    setActiveDatabaseId(newDb.id);
    setActiveViewId(newDb.views[0].id);
    return newDb;
  }, []);

  const updateDatabase = useCallback((id: string, updates: Partial<Database>) => {
    setDatabases(prev => prev.map(db => 
      db.id === id ? { ...db, ...updates, updatedAt: new Date().toISOString() } : db
    ));
  }, []);

  const deleteDatabase = useCallback((id: string) => {
    setDatabases(prev => prev.filter(db => db.id !== id));
    if (activeDatabaseId === id) {
      const remaining = databases.filter(db => db.id !== id);
      setActiveDatabaseId(remaining[0]?.id || null);
    }
  }, [activeDatabaseId, databases]);

  const addProperty = useCallback((dbId: string, property: Property) => {
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      return { ...db, properties: [...db.properties, property], updatedAt: new Date().toISOString() };
    }));
  }, []);

  const updateProperty = useCallback((dbId: string, propertyId: string, updates: Partial<Property>) => {
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      return {
        ...db,
        properties: db.properties.map(p => p.id === propertyId ? { ...p, ...updates } : p),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const deleteProperty = useCallback((dbId: string, propertyId: string) => {
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      return {
        ...db,
        properties: db.properties.filter(p => p.id !== propertyId),
        items: db.items.map(item => {
          const { [propertyId]: _, ...rest } = item.properties;
          return { ...item, properties: rest };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const addItem = useCallback((dbId: string, item?: Partial<DatabaseItem>) => {
    const newItem: DatabaseItem = {
      id: generateId(),
      properties: item?.properties || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      return { ...db, items: [...db.items, newItem], updatedAt: new Date().toISOString() };
    }));
    return newItem;
  }, []);

  const updateItem = useCallback((dbId: string, itemId: string, updates: Partial<DatabaseItem>) => {
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      return {
        ...db,
        items: db.items.map(item => 
          item.id === itemId ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
        ),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const deleteItem = useCallback((dbId: string, itemId: string) => {
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      return { ...db, items: db.items.filter(i => i.id !== itemId), updatedAt: new Date().toISOString() };
    }));
  }, []);

  const addView = useCallback((dbId: string, view: DatabaseView) => {
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      return { ...db, views: [...db.views, view] };
    }));
    setActiveViewId(view.id);
  }, []);

  const updateView = useCallback((dbId: string, viewId: string, updates: Partial<DatabaseView>) => {
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      return { ...db, views: db.views.map(v => v.id === viewId ? { ...v, ...updates } : v) };
    }));
  }, []);

  const deleteView = useCallback((dbId: string, viewId: string) => {
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      return { ...db, views: db.views.filter(v => v.id !== viewId) };
    }));
  }, []);

  const getFilteredItems = useCallback((db: Database, view: DatabaseView): DatabaseItem[] => {
    let items = [...db.items];

    // Apply filters
    for (const filter of view.filters) {
      items = items.filter(item => {
        const value = item.properties[filter.propertyId];
        switch (filter.operator) {
          case 'equals': return value === filter.value;
          case 'notEquals': return value !== filter.value;
          case 'contains': return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'isEmpty': return !value || value === '';
          case 'isNotEmpty': return value && value !== '';
          default: return true;
        }
      });
    }

    // Apply sorts
    for (const sort of view.sorts) {
      items.sort((a, b) => {
        const aVal = a.properties[sort.propertyId];
        const bVal = b.properties[sort.propertyId];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return items;
  }, []);

  return {
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
    deleteView,
    getFilteredItems,
    templates: DATABASE_TEMPLATES,
  };
};
