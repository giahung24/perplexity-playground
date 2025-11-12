import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Switch,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar
} from '@nextui-org/react';
import SearchPage from './pages/SearchPage';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

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
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path) => {
    if (path === '/chat' && (location.pathname === '/' || location.pathname === '/chat')) {
      return true;
    }
    return location.pathname === path;
  };
  
  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      isBordered 
      className="bg-background/60 backdrop-blur-md"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <p className="font-bold text-lg sm:text-xl text-primary">RAG App</p>
        </NavbarBrand>
      </NavbarContent>
      
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Button
            as="a"
            href="/chat"
            variant={isActive('/chat') ? 'solid' : 'light'}
            color="primary"
            size="sm"
          >
            Chat
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            as="a"
            href="/search"
            variant={isActive('/search') ? 'solid' : 'light'}
            color="primary"
            size="sm"
          >
            Search
          </Button>
        </NavbarItem>
      </NavbarContent>
      
      <NavbarContent justify="end">
        <NavbarItem className="hidden sm:flex">
          <ThemeToggle />
        </NavbarItem>
        <NavbarItem>
          <Dropdown>
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                size="sm"
                showFallback
                fallback={<span className="text-sm">👤</span>}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem 
                key="github" 
                startContent="🔗"
                onClick={() => window.open('https://github.com/giahung24/perplexity-playground', '_blank')}
              >
                GitHub Page
              </DropdownItem>
              <DropdownItem 
                key="models" 
                startContent="📖"
                onClick={() => window.open('https://docs.perplexity.ai/getting-started/models', '_blank')}
              >
                Models Help
              </DropdownItem>
              <DropdownItem key="logout" color="danger" startContent="🚪" onClick={logout}>
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
      
      <NavbarMenu>
        <NavbarMenuItem>
          <Button
            as="a"
            href="/chat"
            variant={isActive('/chat') ? 'solid' : 'light'}
            color="primary"
            className="w-full justify-start"
            size="lg"
            onPress={() => setIsMenuOpen(false)}
          >
            � Chat
          </Button>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Button
            as="a"
            href="/search"
            variant={isActive('/search') ? 'solid' : 'light'}
            color="primary"
            className="w-full justify-start"
            size="lg"
            onPress={() => setIsMenuOpen(false)}
          >
            � Search
          </Button>
        </NavbarMenuItem>
        <NavbarMenuItem className="mt-4">
          <div className="w-full">
            <ThemeToggle />
          </div>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Navigation />}
      <main className={`container mx-auto px-4 sm:px-6 ${isAuthenticated ? 'py-4 sm:py-8' : 'py-0'} max-w-7xl`}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;