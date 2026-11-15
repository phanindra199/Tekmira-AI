import React from 'react';
import MainLayout from './MainLayout';

/**
 * Backward-compatible wrapper forwarding to MainLayout
 */
export default function PageLayout(props) {
  return <MainLayout {...props} />;
}
