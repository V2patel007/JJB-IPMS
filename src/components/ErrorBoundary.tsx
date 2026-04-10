import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      let errorMessage = "An unexpected error occurred.";
      
      try {
        // Check if it's our JSON string error from Firestore
        if (error?.message) {
          const parsed = JSON.parse(error.message);
          if (parsed.error) {
            errorMessage = `Firestore Error: ${parsed.error}`;
          }
        }
      } catch (e) {
        // Not a JSON error, use the message directly
        errorMessage = error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
            <div className="bg-red-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-8">{errorMessage}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full h-12 bg-slate-900 hover:bg-slate-800"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
