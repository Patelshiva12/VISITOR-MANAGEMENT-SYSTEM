import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
            <ShieldAlert className="w-10 h-10 mx-auto mb-2 animate-bounce" />
            <h2 className="text-lg font-black text-white">System Render Notice</h2>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              {this.state.error?.message || 'An unexpected rendering issue occurred.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Return to Public Portal
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
