import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
          <h1 className="text-4xl font-display uppercase mb-4">Ups! Coś poszło nie tak.</h1>
          <p className="text-gray-600 mb-8">Odśwież stronę lub spróbuj ponownie później.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-8 py-3 rounded-xl font-medium"
          >
            Odśwież stronę
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
