const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// inlineRem: false keeps rem-based text-* classes as dynamic runtime values
// instead of baking them into static px at bundle time - required for
// FontScaleContext's rem.set() to have any visual effect (see its comment).
module.exports = withNativeWind(config, { input: "./global.css", inlineRem: false });
