import { useEffect } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./lib/protected-route";
import { initializeBlockchain } from "./lib/web3";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize blockchain connection with proper error handling
    const setupBlockchain = async () => {
      try {
        console.log('Initializing blockchain connection...');
        const success = await initializeBlockchain();
        console.log('Blockchain initialization:', success ? 'successful' : 'failed');
      } catch (error) {
        console.error('Error initializing blockchain:', error);
      }
    };

    setupBlockchain();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;