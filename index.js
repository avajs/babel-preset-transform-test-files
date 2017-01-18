'use strict';
const ESPOWER_PATTERNS = require('./espower-patterns.json');

function buildPreset(context) {
	const plugins = [
		require('babel-plugin-espower/create')(context, {
			embedAst: true,
			patterns: ESPOWER_PATTERNS
		}),
		require('babel-plugin-ava-throws-helper')
	];

	return {plugins};
}
module.exports = buildPreset;
