import { context } from 'esbuild'
import CssModulesPlugin from 'esbuild-css-modules-plugin'

async function main() {
	const ctx = await context({
		entryPoints: ['src/renderer/index.tsx'],
		bundle: true,
		outfile: 'dist/bundle.js',
		plugins: [
			CssModulesPlugin({
				// @see https://github.com/indooorsman/esbuild-css-modules-plugin/blob/main/index.d.ts for more details
				force: true,
				// emitDeclarationFile: true,
				localsConvention: 'camelCaseOnly',
				namedExports: true,
				inject: false,
			}),
		],
	})

	if (process.argv.includes('--watch')) {
		await ctx.watch()
	} else {
		await ctx.rebuild()
	}
}

main()
	.then(() => {
		console.log('done')
		process.exit(0)
	})
	.catch((err) => {
		console.error(err)
		process.exit(1)
	})
