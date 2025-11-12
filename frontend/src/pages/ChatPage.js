import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { chatService } from '../services/api';

const PageContainer = styled.div`
  color: white;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
`;

const ChatContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 1rem 1.5rem;
  border-radius: 18px;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'rgba(255, 255, 255, 0.15)'};
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const MessageContent = styled.div`
  line-height: 1.6;
  
  p {
    margin: 0.5rem 0;
  }
  
  ul, ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  
  code {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
  }
  
  pre {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
  }
`;

const SourcesContainer = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const SourcesTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const SourceLink = styled.a`
  color: #87CEEB;
  text-decoration: none;
  font-size: 0.8rem;
  display: block;
  margin-bottom: 0.25rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const MessageForm = styled.form`
  display: flex;
  gap: 1rem;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  outline: none;
  
  &:focus {
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  }
`;

const SendButton = styled.button`
  padding: 1rem 2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #45a049;
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const LoadingBubble = styled.div`
  max-width: 70%;
  padding: 1rem 1.5rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.25rem;
  
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    animation: loading 1.4s infinite ease-in-out both;
  }
  
  span:nth-child(1) { animation-delay: -0.32s; }
  span:nth-child(2) { animation-delay: -0.16s; }
  span:nth-child(3) { animation-delay: 0s; }
  
  @keyframes loading {
    0%, 80%, 100% { 
      transform: scale(0);
    } 40% { 
      transform: scale(1);
    }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: #ff6b6b;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem;
`;

function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you find information and answer questions using real-time data. What would you like to know?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);
    setError(null);

    // Add user message to chat
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      // Send to RAG API
      const response = await chatService.sendMessage(messages, userMessage);
      
      // Add assistant response
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: response.response,
        sources: response.sources || []
      }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Title>RAG Chat</Title>
      
      <ChatContainer>
        <MessagesContainer>
          {messages.map((message, index) => (
            <Message key={index} isUser={message.role === 'user'}>
              <MessageBubble isUser={message.role === 'user'}>
                <MessageContent>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </MessageContent>
                {message.sources && message.sources.length > 0 && (
                  <SourcesContainer>
                    <SourcesTitle>Sources:</SourcesTitle>
                    {message.sources.map((source, sourceIndex) => (
                      <SourceLink 
                        key={sourceIndex} 
                        href={source} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {source}
                      </SourceLink>
                    ))}
                  </SourcesContainer>
                )}
              </MessageBubble>
            </Message>
          ))}
          
          {loading && (
            <LoadingMessage>
              <LoadingBubble>
                <span>Thinking</span>
                <LoadingDots>
                  <span></span>
                  <span></span>
                  <span></span>
                </LoadingDots>
              </LoadingBubble>
            </LoadingMessage>
          )}
          
          {error && (
            <ErrorMessage>
              Error: {error}
            </ErrorMessage>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesContainer>
        
        <InputContainer>
          <MessageForm onSubmit={handleSendMessage}>
            <MessageInput
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <SendButton type="submit" disabled={loading || !inputMessage.trim()}>
              {loading ? 'Sending...' : 'Send'}
            </SendButton>
          </MessageForm>
        </InputContainer>
      </ChatContainer>
    </PageContainer>
  );
}

export default ChatPage;