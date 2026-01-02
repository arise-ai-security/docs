import React from 'react';
import { useLocation } from '@docusaurus/router';

function getQueryParam(search, key) {
  const params = new URLSearchParams(search || '');
  const value = params.get(key);
  return value ? String(value) : null;
}

export default function EvalInstanceLabel({ defaultInstance }) {
  const location = useLocation();
  const instance = getQueryParam(location.search, 'instance') || defaultInstance;
  return <code>{instance || 'unknown'}</code>;
}
