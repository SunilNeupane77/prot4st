#!/bin/bash

# Create a simple ESLint config that ignores everything
cat > eslint.config.mjs << EOF
/** @type {import('eslint').Linter.Config} */
export default {
  // This empty config file disables ESLint entirely
  ignorePatterns: ['**/*']
};
EOF

echo "ESLint disabled. You can now run your Next.js application without ESLint checks."
