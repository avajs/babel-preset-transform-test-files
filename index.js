'use strict';
const ESPOWER_PATTERNS = require('./espower-patterns.json');

function buildPreset(context, options) {
	const plugins = [];
	if (!options || options.powerAssert !== false) {
		plugins.push(require('babel-plugin-espower/create')(context, {
			embedAst: true,
			patterns: ESPOWER_PATTERNS
		}));
	}
	plugins.push(require('babel-plugin-ava-throws-helper'));

	return {plugins};
}
module.exports = buildPreset;
