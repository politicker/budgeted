import * as esbuild from 'esbuild'
import CssModulesPlugin from 'esbuild-css-modules-plugin'

await esbuild.build({
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
