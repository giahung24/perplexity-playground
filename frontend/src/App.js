import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  Button,
  Switch
} from '@nextui-org/react';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import SearchPage from './pages/SearchPage';
import ChatPage from './pages/ChatPage';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Switch
      defaultSelected={theme === 'dark'}
      size="lg"
      color="secondary"
      startContent={<span>🌙</span>}
      endContent={<span>☀️</span>}
      onChange={toggleTheme}
    >
      Dark mode
    </Switch>
  );
};

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <Navbar isBordered className="bg-background/60 backdrop-blur-md">
      <NavbarBrand>
        <p className="font-bold text-xl text-primary">RAG Application</p>
      </NavbarBrand>
      
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Button
            as="a"
            href="/search"
            variant={isActive('/search') || isActive('/') ? 'solid' : 'light'}
            color="primary"
          >
            Search
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            as="a"
            href="/chat"
            variant={isActive('/chat') ? 'solid' : 'light'}
            color="primary"
          >
            Chat
          </Button>
        </NavbarItem>
      </NavbarContent>
      
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <Navigation />
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;