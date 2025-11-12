import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
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
              <DropdownItem key="logout" color="danger" onClick={logout}>
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Navigation />}
      <main className={`container mx-auto px-6 ${isAuthenticated ? 'py-8' : 'py-0'} max-w-6xl`}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <SearchPage />
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