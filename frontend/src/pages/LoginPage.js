import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Spacer
} from '@nextui-org/react';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = login(password);
    
    if (!result.success) {
      setError(result.error);
      setPassword('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col gap-3 text-center">
            <h1 className="text-2xl font-bold text-foreground">RAG Application</h1>
            <p className="text-default-500">Please enter the access password</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="password"
                label="Password"
                placeholder="Enter access password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="bordered"
                isInvalid={!!error}
                errorMessage={error}
                disabled={isLoading}
                autoFocus
              />
              <Spacer y={2} />
              <Button
                type="submit"
                color="primary"
                size="lg"
                isLoading={isLoading}
                disabled={!password.trim()}
                className="w-full"
              >
                Access Application
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;