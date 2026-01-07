import React from 'react';

const ablationTreeModules = (() => {
  const modules = {};

  // Webpack context import so all files in this folder get bundled.
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
    ) continue;

    // Extract instance name from ablation file name
    // e.g., "cjson.cve-2016-10749_ablation_no_relevant_context_retrieval.jsx" -> "cjson.cve-2016-10749"
    const instanceName = file
      .replace(/\.jsx$/, '')
      .replace(/_ablation_no_relevant_context_retrieval$/, '');
    const mod = context(key);
    const Component = mod?.default ?? mod;

    if (typeof Component === 'function') {
      modules[instanceName] = Component;
    }
  }

  return modules;
})();

export function getAvailableAblationTrees() {
  return Object.keys(ablationTreeModules).sort();
}

export default function AblationTree({ instance }) {
  if (!instance) {
    return (
      <div>
        <p>No instance selected.</p>
      </div>
    );
  }

  const TreeComponent = ablationTreeModules[instance];

  if (!TreeComponent) {
    return (
      <div>
        <p>
          No interactive tree component found for <code>{instance}</code>.
        </p>
        <p>
          Available: <code>{getAvailableAblationTrees().join(', ') || 'none'}</code>
        </p>
      </div>
    );
  }

  return <TreeComponent />;
}
