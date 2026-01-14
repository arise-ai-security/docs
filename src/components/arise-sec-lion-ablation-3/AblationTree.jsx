import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

let cachedModules = null;

// Lazy-load modules only in the browser to avoid SSR issues with window references
function loadAblationTreeModules() {
  if (cachedModules) return cachedModules;

  const modules = {};

  // Webpack context import so all files in this folder get bundled.
  // This must only be called in browser context since instance files may reference window
  const context = require.context('./', false, /\.jsx$/);

  for (const key of context.keys()) {
    const file = key.replace(/^\.\//, '');

    // Avoid self-import cycles.
    if (
      file === 'AblationTree.jsx' ||
      file === 'AblationTreeFromLocation.jsx' ||
      file === 'AblationInstanceLabel.jsx' ||
      file === 'AblationWorkspace.jsx' ||
      file === 'AblationWorkspaceFromLocation.jsx'
    )
      continue;

    // Extract instance name from ablation file name.
    // Keep this tolerant so it works even if file suffix conventions change.
    const instanceName = file
      .replace(/\.jsx$/, '')
      .replace(/_ablation_no_thinker_justification_pass_down$/, '');

    const mod = context(key);
    const Component = mod?.default ?? mod;

    if (typeof Component === 'function') {
      modules[instanceName] = Component;
    }
  }

  cachedModules = modules;
  return modules;
}

export function getAvailableAblationTrees() {
  if (typeof window === 'undefined') {
    return [];
  }
  return Object.keys(loadAblationTreeModules()).sort();
}

function AblationTreeInner({ instance }) {
  const [modules, setModules] = useState(null);

  useEffect(() => {
    setModules(loadAblationTreeModules());
  }, []);

  if (!instance) {
    return (
      <div>
        <p>No instance selected.</p>
      </div>
    );
  }

  if (!modules) {
    return <div>Loading...</div>;
  }

  const TreeComponent = modules[instance];

  if (!TreeComponent) {
    return (
      <div>
        <p>
          No interactive tree component found for <code>{instance}</code>.
        </p>
        <p>
          Available: <code>{Object.keys(modules).sort().join(', ') || 'none'}</code>
        </p>
      </div>
    );
  }

  return <TreeComponent />;
}

export default function AblationTree({ instance }) {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => <AblationTreeInner instance={instance} />}
    </BrowserOnly>
  );
}
