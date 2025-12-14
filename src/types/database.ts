export type PropertyType = 
  | 'title' 
  | 'text' 
  | 'longText' 
  | 'number' 
  | 'select' 
  | 'multiSelect' 
  | 'status' 
  | 'date' 
  | 'person' 
  | 'checkbox' 
  | 'url' 
  | 'email' 
  | 'phone' 
  | 'files' 
  | 'rating';

export type ViewType = 'table' | 'board' | 'calendar' | 'gallery' | 'list';

export interface SelectOption {
  id: string;
  label: string;
  color: string;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  options?: SelectOption[];
  required?: boolean;
}

export interface DatabaseItem {
  id: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ViewFilter {
  propertyId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'isEmpty' | 'isNotEmpty';
  value: any;
}

export interface ViewSort {
  propertyId: string;
  direction: 'asc' | 'desc';
}

export interface DatabaseView {
  id: string;
  name: string;
  type: ViewType;
  filters: ViewFilter[];
  sorts: ViewSort[];
  hiddenProperties: string[];
  groupByPropertyId?: string;
}

export interface Database {
  id: string;
  name: string;
  description: string;
  icon: string;
  properties: Property[];
  items: DatabaseItem[];
  views: DatabaseView[];
  createdAt: string;
  updatedAt: string;
}

export const STATUS_OPTIONS: SelectOption[] = [
  { id: 'not-started', label: 'Not Started', color: 'bg-gray-500' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'complete', label: 'Complete', color: 'bg-green-500' },
];

export const PROPERTY_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-500',
];
