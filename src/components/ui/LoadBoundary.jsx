import { Component } from 'react';

// Catches a lazy chunk that fails to load (e.g. the Markdown renderer after a
// redeploy, or a dev server whose dependency cache went stale) so only the
// report area shows an error, instead of React unmounting the whole site.
export default class LoadBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('[LoadBoundary]', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className={`font-mono text-xs text-danger ${this.props.className ?? ''}`}>
        <p>&gt; ERROR: the report viewer could not be loaded.</p>
        <button type="button" onClick={() => window.location.reload()} className="link-ui press mt-2">
          [RELOAD_PAGE]
        </button>
      </div>
    );
  }
}
