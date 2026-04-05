import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallbackTitle?: string
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-3xl border border-fwd-grey p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-fwd-orange-20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-fwd-orange" />
          </div>
          <h2 className="text-xl font-bold text-fwd-green mb-2">
            {this.props.fallbackTitle || 'Something went wrong'}
          </h2>
          <p className="text-fwd-green/60 text-sm mb-6">
            Please try refreshing this section.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-6 py-2.5 bg-fwd-orange text-white font-bold rounded-xl hover:bg-fwd-orange-80 transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
