/*
  MAIN PAGE COMPONENT
  ===================
  This is the entry point of our app - it just renders the ChatContainer!
  
  SEO: We add meta tags for search engines and social sharing.
*/

import { ChatContainer } from '@/components/chat/ChatContainer';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Study Buddy AI - Your Personal Study Assistant</title>
        <meta 
          name="description" 
          content="An AI-powered study assistant to help students with homework, explanations, and study tips. Built by students, for students." 
        />
      </Helmet>

      {/* Main Chat Interface */}
      <ChatContainer />
    </>
  );
};

export default Index;
