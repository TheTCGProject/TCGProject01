import { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Define help topics as sections with arrays of topics
const helpSections = [
  {
    section: 'Getting Started',
    topics: [
      {
        title: 'Getting Started',
        file: 'getting-started.md',
        summary: 'Learn how to create an account and start using PokeNexus.',
      },
      {
        title: 'Adding Cards',
        file: 'adding-cards.md',
        summary: 'How to add and manage cards in your decks.',
      },
      // Add more topics to this section as needed
    ],
  },
  {
    section: 'Account & Security',
    topics: [
      {
        title: 'Managing Your Account Settings',
        file: 'account-settings.md',
        summary: 'How to update email, password, and notification preferences.',
      },
      // Add more topics to this section as needed
    ],
  },
  // Add more sections as needed
];

// Flatten topics for initial selection
const allTopics = helpSections.flatMap(section => section.topics);

const HelpPage = () => {
  const [selectedTopic, setSelectedTopic] = useState(allTopics[0]);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`/help-articles/${selectedTopic.file}`)
      .then(res => {
        if (!res.ok) throw new Error('File not found');
        return res.text();
      })
      .then(setContent)
      .catch(() => setContent('Sorry, this article could not be loaded.'));
  }, [selectedTopic]);

  // Simple markdown renderer to replace react-markdown
  const renderMarkdown = (markdown: string) => {
    return markdown
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold mb-3 text-slate-900 dark:text-white">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-medium mb-2 text-slate-900 dark:text-white">{line.slice(4)}</h3>;
        }
        
        // Horizontal rule
        if (line.trim() === '---') {
          return <hr key={index} className="my-6 border-slate-200 dark:border-slate-700" />;
        }
        
        // Lists
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 text-slate-700 dark:text-slate-300">{line.slice(2)}</li>;
        }
        if (line.match(/^\d+\. /)) {
          return <li key={index} className="ml-4 text-slate-700 dark:text-slate-300">{line.replace(/^\d+\. /, '')}</li>;
        }
        
        // Bold text
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        // Regular paragraphs
        return (
          <p 
            key={index} 
            className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: boldText }}
          />
        );
      });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 p-6 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
        <h2 className="text-xl font-bold mb-4">Help Topics</h2>
        <nav>
          {helpSections.map(section => (
            <div key={section.section} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{section.section}</h3>
              <ul>
                {section.topics.map(topic => (
                  <li key={topic.file} className="mb-2">
                    <button
                      className={`text-left w-full px-2 py-1 rounded hover:bg-primary-50 dark:hover:bg-primary-900 ${
                        selectedTopic.file === topic.file
                          ? 'bg-primary-100 dark:bg-primary-800 font-semibold'
                          : ''
                      }`}
                      onClick={() => setSelectedTopic(topic)}
                    >
                      <div>{topic.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{topic.summary}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">{selectedTopic.title}</h1>
        <ErrorBoundary>
          <div className="prose dark:prose-invert max-w-none">
            {renderMarkdown(content)}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default HelpPage;