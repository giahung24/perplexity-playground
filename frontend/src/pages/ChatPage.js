import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  Spinner,
  Link,
  Chip
} from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';
import { chatService } from '../services/api';

function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI assistant. I can help you find information and answer questions using real-time data. What would you like to know?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('sonar');
  const [availableModels, setAvailableModels] = useState([]);
  const messagesEndRef = useRef(null);

  const hasCitations = (content) => {
    if (!content) return false;
    // Check if content contains citation patterns like [1], [2], etc.
    const citationPattern = /\[\d+\]/;
    return citationPattern.test(content);
  };

  const renderContentWithCitations = (content, sources = [], parsedCitations = []) => {
    if (!content) return null;
    
    // If we don't have sources or parsed citations, just render normally
    if (!sources || sources.length === 0 || !parsedCitations || parsedCitations.length === 0) {
      return <ReactMarkdown>{content}</ReactMarkdown>;
    }
    
    // Pre-process content to replace citation patterns with markdown links
    let processedContent = content;
    
    parsedCitations.forEach((citation) => {
      const sourceUrl = sources[citation.index - 1];
      if (sourceUrl) {
        const citationPattern = new RegExp(`\\[${citation.index}\\]`, 'g');
        // Replace with markdown link syntax that ReactMarkdown can handle
        processedContent = processedContent.replace(citationPattern, `[[${citation.index}]](${sourceUrl})`);
      }
    });
    
    // Custom components for ReactMarkdown
    const components = {
      a: ({ href, children, ...props }) => {
        // Check if this is a citation link
        const isCitation = children && children.toString().match(/^\[\d+\]$/);
        
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={isCitation ? "citation-link" : ""}
            {...props}
          >
            {children}
          </a>
        );
      }
    };
    
    return (
      <div className="citation-content">
        <ReactMarkdown components={components}>{processedContent}</ReactMarkdown>
      </div>
    );
  };

  const parseContentWithThinking = (content) => {
    if (!content || typeof content !== 'string') return { thinking: [], content: '' };
    
    const thinkingRegex = /<think>([\s\S]*?)<\/think>/g;
    const thinking = [];
    let match;
    
    while ((match = thinkingRegex.exec(content)) !== null) {
      thinking.push(match[1].trim());
    }
    
    const cleanContent = content.replace(thinkingRegex, '').trim();
    return { thinking, content: cleanContent };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const response = await chatService.getAvailableModels();
      setAvailableModels(response.models || []);
    } catch (err) {
      console.error('Failed to load models:', err);
      setAvailableModels([
        { id: 'sonar', name: 'Sonar', description: 'Standard Perplexity model' },
        { id: 'sonar-pro', name: 'Sonar Pro', description: 'Advanced Perplexity model' },
        { id: 'sonar-reasoning', name: 'Sonar Reasoning', description: 'Reasoning-focused model' }
      ]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);
    setError(null);

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      await handleStreamingResponse(newMessages, userMessage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStreamingResponse = async (newMessages, userMessage) => {
    try {
      const assistantMessageIndex = newMessages.length;
      const streamingMessages = [...newMessages, {
        role: 'assistant',
        content: '',
        sources: [],
        parsedCitations: [],
        model: selectedModel,
        streaming: true
      }];
      setMessages(streamingMessages);

      const response = await chatService.sendMessage(
        messages, 
        userMessage, 
        selectedModel, 
        true
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === '') continue;

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.content) {
                accumulatedContent += parsed.content;
                // eslint-disable-next-line no-loop-func
                setMessages(prev => {
                  const updated = [...prev];
                  updated[assistantMessageIndex] = {
                    ...updated[assistantMessageIndex],
                    content: accumulatedContent
                  };
                  return updated;
                });
              }

              if (parsed.citations || parsed.parsed_citations) {
                // eslint-disable-next-line no-loop-func
                setMessages(prev => {
                  const updated = [...prev];
                  updated[assistantMessageIndex] = {
                    ...updated[assistantMessageIndex],
                    sources: parsed.citations || [],
                    parsedCitations: parsed.parsed_citations || []
                  };
                  return updated;
                });
              }

              if (parsed.done) {
                // eslint-disable-next-line no-loop-func
                setMessages(prev => {
                  const updated = [...prev];
                  updated[assistantMessageIndex] = {
                    ...updated[assistantMessageIndex],
                    streaming: false
                  };
                  return updated;
                });
                return;
              }

              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-100px)] sm:h-[calc(100vh-140px)] flex flex-col">
      <div className="text-center mb-3 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">RAG Chat</h1>
      </div>
      
      <Card className="flex-1 shadow-md flex flex-col h-full">
        <CardBody className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((message, index) => {
            const { thinking, content } = parseContentWithThinking(message.content);
            
            return (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[70%] ${message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-default-100'
                } rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-3`}>
                  
                  {message.model && message.role === 'assistant' && (
                    <Chip size="sm" variant="flat" color="secondary" className="mb-1 sm:mb-2">
                      {availableModels.find(m => m.id === message.model)?.name || message.model}
                    </Chip>
                  )}
                  
                  {thinking.length > 0 && message.role === 'assistant' && thinking.map((thinkText, thinkIndex) => (
                    <details key={`think-${thinkIndex}`} className="bg-default-50 rounded-lg border border-divider">
                      <summary className="cursor-pointer p-2 sm:p-3 text-xs sm:text-sm text-default-500 hover:bg-default-100 rounded-lg select-none">
                        💭 Thinking process
                      </summary>
                      <div className="p-2 sm:p-3 border-t border-divider text-xs text-default-400 leading-relaxed italic">
                        <ReactMarkdown>{thinkText}</ReactMarkdown>
                      </div>
                    </details>
                  ))}
                  
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm sm:text-base">
                    {message.role === 'assistant' ? 
                      renderContentWithCitations(content, message.sources, message.parsedCitations) :
                      <ReactMarkdown>{content}</ReactMarkdown>
                    }
                  </div>
                  
                  {message.streaming && (
                    <div className="flex items-center gap-2 text-xs text-default-500 mt-2">
                      <span>Streaming</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {error && (
            <Card className="bg-danger-50 border-danger-200">
              <CardBody>
                <p className="text-danger-600">Error: {error}</p>
              </CardBody>
            </Card>
          )}
          
          <div ref={messagesEndRef} />
        </CardBody>
        
        <div className="p-3 sm:p-4 border-t border-divider">
          <div className="mb-3 sm:mb-4">
            <Select
              label="Model"
              placeholder="Select a model"
              selectedKeys={[selectedModel]}
              onSelectionChange={(keys) => setSelectedModel(Array.from(keys)[0])}
              disabled={loading}
              size="sm"
              className="max-w-full sm:max-w-xs"
            >
              {availableModels.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Input
              type="text"
              placeholder="Ask me anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              variant="bordered"
              size="lg"
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              color="primary"
              size="lg"
              className="px-6 sm:px-8 w-full sm:w-auto"
            >
              {loading ? <Spinner size="sm" color="white" /> : 'Send'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default ChatPage;
