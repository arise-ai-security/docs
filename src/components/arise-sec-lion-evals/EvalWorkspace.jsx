import React from 'react';

const workspaceModules = (() => {
  const modules = {};

  // Bundle all MDX workspace files.
  const context = require.context('./workspaces', false, /\.mdx$/);

  for (const key of context.keys()) {
    const file = key.replace(/^\.\//, '');
    const instanceName = file.replace(/\.mdx$/, '');

    const mod = context(key);
    // MDX files export a React component as default.
    const Component = mod?.default ?? mod;

    if (typeof Component === 'function') {
      modules[instanceName] = Component;
    }
  }

  return modules;
})();

export function getAvailableWorkspaces() {
  return Object.keys(workspaceModules).sort();
}

export default function EvalWorkspace({ instance }) {
  if (!instance) return null;

  const WorkspaceComponent = workspaceModules[instance];

  if (!WorkspaceComponent) {
    return (
      <div>
        <p>
          No workspace markdown found for <code>{instance}</code>.
        </p>
        <p>
          Available: <code>{getAvailableWorkspaces().join(', ') || 'none'}</code>
        </p>
      </div>
    );
  }

  return <WorkspaceComponent />;
}
