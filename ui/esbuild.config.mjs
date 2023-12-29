import * as esbuild from 'esbuild'

await esbuild.build({
	entryPoints: ['src/renderer/index.tsx'],
	bundle: true,
	outfile: 'dist/bundle.js',
})
