const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Monorepo root
const monorepoRoot = path.resolve(__dirname, "../..");

const config = getDefaultConfig(__dirname);

// 1. Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro resolve modules from the monorepo root node_modules
//    as well as the mobile app's own node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. Ensure the mobile app's node_modules takes priority
//    for resolving dependencies (avoids conflicts with web-only deps)
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
