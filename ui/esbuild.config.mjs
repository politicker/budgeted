import * as esbuild from 'esbuild'

await esbuild.build({
	entryPoints: ['src/renderer.ts'],
	bundle: true,
	outfile: 'dist/bundle.js',
})
