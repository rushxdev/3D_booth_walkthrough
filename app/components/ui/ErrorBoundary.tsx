"use client";

import { Component, type ReactNode } from "react";
import { resetKeysChanged } from "@/app/lib/errorBoundary";

type Props = {
  children: ReactNode;
  fallback: (error: unknown, reset: () => void) => ReactNode;
  onError?: (error: unknown) => void;
  /** When any of these change, a failed boundary tries its children again. */
  resetKeys?: readonly unknown[];
};
// `failed` is separate because a thrown value can be falsy (throw null).
type State = { failed: boolean; error: unknown };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { failed: true, error };
  }

  componentDidCatch(error: unknown) {
    console.error("[ErrorBoundary]", error);
    this.props.onError?.(error);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.failed && resetKeysChanged(prev.resetKeys, this.props.resetKeys)) this.reset();
  }

  reset = () => this.setState({ failed: false, error: null });

  render() {
    return this.state.failed ? this.props.fallback(this.state.error, this.reset) : this.props.children;
  }
}