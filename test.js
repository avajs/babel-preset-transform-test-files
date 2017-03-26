import {runInNewContext} from 'vm';
import test from 'ava';
import * as babel from 'babel-core';
import throwsHelper from 'babel-plugin-ava-throws-helper';
import empower from 'empower-core';
import buildPreset from '.';

const ESPOWER_PATTERNS = require('./espower-patterns.json');

test('throws-helper is included', t => {
	const {plugins} = buildPreset(babel);
	t.true(plugins.indexOf(throwsHelper) !== -1);
});

test('resulting preset transforms assertion patterns', t => {
	const {code} = babel.transform(`
		const value = 'value'
		const expected = 'expected'
		const contents = 'contents'
		const regex = /regex/

		// "Execute" the patterns. Hardcode them here, otherwise it's cheating.
		t.truthy(value)
		t.falsy(value)
		t.true(value)
		t.false(value)
		t.regex(contents, regex)
		t.notRegex(contents, regex)
	`, {
		ast: false,
		babelrc: false,
		presets: [buildPreset]
	});

	const appliedPatterns = [];
	// Create a stub assertion object that can be enhanced using empower-core
	const assert = ESPOWER_PATTERNS
		.map(p => /^t\.(.+)\(/.exec(p)[1])
		.reduce((assert, name) => {
			assert[name] = () => {};
			return assert;
		}, {});

	runInNewContext(code, {
		t: empower(assert, {
			onSuccess({matcherSpec: {pattern}, powerAssertContext}) {
				if (powerAssertContext) { // Only available if the empower plugin transformed the assertion
					appliedPatterns.push(pattern);
				}
			},
			patterns: ESPOWER_PATTERNS
		})
	});
	t.deepEqual(appliedPatterns, ESPOWER_PATTERNS);
});

test('the espower plugin can be disabled', t => {
	const expected = 't.true(value);';
	const {code} = babel.transform(expected, {
		ast: false,
		babelrc: false,
		presets: [[require.resolve('./'), {powerAssert: false}]]
	});
	t.is(code, expected);
});
