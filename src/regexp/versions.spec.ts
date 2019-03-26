import {
	IRangedSemver
} from '../semver';
import {
	IBrowserVersionRegExp
} from '../useragent';
import {
	IRangedBrowsers
} from '../browsers';
import {
	regExpToString
} from '../regexp';
import {
	applyVersionsToRegExp,
	applyVersionsToRegExps
} from './versions';

describe('RegExp', () => {

	describe('versions', () => {

		describe('applyVersionsToRegExp', () => {

			it('should work with RegExp', () => {

				expect(
					applyVersionsToRegExp(
						/Chrome v(\d+) (\d+) (\d+)/,
						[
							[[10, 11], 0, 0],
							[64, 0, 0]
						],
						{}
					)
				).toBe(
					'Chrome v((10|11) 0 0|64 0 0)'
				);
			});

			it('should work with string', () => {

				expect(
					applyVersionsToRegExp(
						'Chrome v(\\d+) (\\d+) (\\d+)?',
						[
							[[10, 11], 0, 0],
							[64, 0, 0]
						],
						{}
					)
				).toBe(
					'Chrome v((10|11) 0 0?|64 0 0?)'
				);
			});

			it('should ignore unsuitable RegExp', () => {

				expect(
					applyVersionsToRegExp(
						'Chrome v(\\d+) (\\d+)',
						[
							[[10, 11], 0, 0],
							[64, 0, 0]
						],
						{}
					)
				).toBe(
					null
				);
			});

			it('should apply semver compare options', () => {

				expect(
					applyVersionsToRegExp(
						'Chrome v(\\d+)',
						[
							[[10, 11], 0, 0],
							[64, 2, 2],
							[64, 0, 0]
						],
						{
							ignorePatch:         true,
							allowZeroSubverions: true,
							allowHigherVersions: true
						}
					)
				).toBe(
					'Chrome v(([1-9]\\d|\\d{3,})|(6[4-9]|[7-9]\\d|\\d{3,}))'
				);
			});
		});

		describe('applyVersionsToRegExps', () => {

			const regExps: IBrowserVersionRegExp[] = [
				{
					family:          'chrome',
					regExp:          /Chrome (\d+) (\d+) (\d+)/,
					resultVersion:   null,
					requestVersions: [[64, 0, 0], [73, 0, 0]]
				},
				{
					family:          'firefox',
					regExp:          /FF/,
					resultVersion:   null,
					requestVersions: [[1, 2, 3]]
				},
				{
					family:          'ie',
					regExp:          /lol serious?/,
					resultVersion:   [5, 0, 0],
					requestVersions: [[5, 0, 0]]
				}
			];
			const browsers: IRangedBrowsers = new Map([
				['chrome', [
					[[64, 73], 0, 0] as IRangedSemver
				]],
				['firefox', [
					[1, 2, 3] as IRangedSemver
				]],
				['ie', [
					[5, 0, 0] as IRangedSemver
				]]
			]);

			it('should return versioned RegExp objects with info', () => {

				expect(
					applyVersionsToRegExps(
						regExps,
						browsers,
						{
							allowZeroSubverions: true,
							allowHigherVersions: true
						}
					)
				).toEqual([
					{
						...regExps[0],
						sourceRegExp:           regExps[0].regExp,
						sourceRegExpString:     regExpToString(regExps[0].regExp),
						regExp:                 /Chrome (6[4-9]|[7-9]\d|\d{3,}) (\d+) (\d+)/,
						regExpString:           'Chrome (6[4-9]|[7-9]\\d|\\d{3,}) (\\d+) (\\d+)',
						requestVersionsStrings: regExps[0].requestVersions.map(_ => _.join('.'))
					},
					{
						...regExps[2],
						sourceRegExp:           regExps[2].regExp,
						sourceRegExpString:     regExpToString(regExps[2].regExp),
						regExpString:           regExpToString(regExps[2].regExp),
						requestVersionsStrings: regExps[2].requestVersions.map(_ => _.join('.'))
					}
				]);
			});
		});
	});
});