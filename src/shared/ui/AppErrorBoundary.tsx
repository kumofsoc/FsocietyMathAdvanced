import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportRuntimeError } from "@/shared/observability/runtimeErrors";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportRuntimeError(error, {
      source: "react",
      componentStack: info.componentStack ?? undefined,
    });
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="app-crash">
        <div className="eyebrow">RECOVERY MODE</div>
        <h1>Интерфейс словил ошибку.</h1>
        <p>
          Данные прогресса и настройки хранятся отдельно, поэтому можно безопасно
          перезапустить интерфейс или вернуться на главную.
        </p>
        <details>
          <summary>Техническая информация</summary>
          <code>{this.state.error.message}</code>
        </details>
        <div className="app-crash-actions">
          <button onClick={() => window.location.reload()}>Перезапустить</button>
          <button
            onClick={() => {
              window.location.hash = "home";
              this.setState({ error: null });
            }}
          >
            На главную
          </button>
        </div>
      </main>
    );
  }
}
