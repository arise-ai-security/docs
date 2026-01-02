import React from 'react';

const evalTreeModules = (() => {
  const modules = {};

  // Webpack context import so all files in this folder get bundled.
  const context = require.context('./', false, /\.jsx$/);

  for (const key of context.keys()) {
    const file = key.replace(/^\.\//, '');

    // Avoid self-import cycles.
    if (file === 'EvalTree.jsx' || file === 'EvalTreeFromLocation.jsx') continue;

    const instanceName = file.replace(/\.jsx$/, '');
    const mod = context(key);
    const Component = mod?.default ?? mod;

    if (typeof Component === 'function') {
      modules[instanceName] = Component;
    }
  }

  return modules;
})();

export function getAvailableEvalTrees() {
  return Object.keys(evalTreeModules).sort();
}

export default function EvalTree({ instance }) {
  if (!instance) {
    return (
      <div>
        <p>No instance selected.</p>
      </div>
    );
  }

  const TreeComponent = evalTreeModules[instance];

  if (!TreeComponent) {
    return (
      <div>
        <p>
          No interactive tree component found for <code>{instance}</code>.
        </p>
        <p>
          Available: <code>{getAvailableEvalTrees().join(', ') || 'none'}</code>
        </p>
      </div>
    );
  }

  return <TreeComponent />;
}
