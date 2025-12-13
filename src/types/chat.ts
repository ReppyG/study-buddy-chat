/*
  TYPE DEFINITIONS FOR OUR CHAT APP
  ==================================
  TypeScript types help catch errors before they happen!
  Think of them as labels that tell the code what shape data should have.
*/

// This defines what a single chat message looks like
export interface Message {
  id: string;           // Unique identifier for each message
  role: 'user' | 'assistant';  // Who sent it: you or the AI
  content: string;      // The actual message text
  timestamp: Date;      // When the message was sent
}

// This defines what the chat state looks like
export interface ChatState {
  messages: Message[];  // Array of all messages in the conversation
  isLoading: boolean;   // Is the AI currently thinking?
  error: string | null; // Any error message to display
}
