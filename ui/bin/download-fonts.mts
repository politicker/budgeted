import fs from 'fs'
import crypto from 'node:crypto'

// to edit fonts, load this URL in the browser, then update using share button:
const fontURL =
	'https://fonts.google.com/share?selection.family=Noto+Sans:ital,wght@0,100;0,400;0,500;1,400' as const

const stylesheetURL = fontURL.replace(
	'https://fonts.google.com/share?selection.family=',
	'https://fonts.googleapis.com/css?family=',
)

const stylesheetData = await (await fetch(stylesheetURL)).text()

// 1. extract src: url() from stylesheet
const matches = stylesheetData.match(/url\((.*?)\)/g)
if (!matches) throw new Error('No matches found')

const fontUrls = matches.map((url) =>
	url.replace(/url\((['"])?(.*?)\1\)/, '$2'),
)

// 2. download each font
const fontDataPromises = fontUrls.map(async (url) => {
	const res = await fetch(url)
	const data = await res.text()
	return { data, url }
})

const fontData = await Promise.all(fontDataPromises)

// 3. replace src: url() with local path
const localPaths = fontUrls.reduce(
	(paths, url) => {
		// Create a hash from the URL
		const hash = crypto.createHash('md5').update(url).digest('hex')
		paths[url] = `./public/cache/fonts/font-${hash}.woff2`
		return paths
	},
	{} as Record<string, string>,
)

let newStylesheetData = stylesheetData
fontUrls.forEach((url) => {
	newStylesheetData = newStylesheetData.replace(url, localPaths[url])
})

// 4. save stylesheet
fs.mkdirSync('./public/cache/fonts', { recursive: true })
fs.writeFileSync('./public/cache/fonts/stylesheet.css', newStylesheetData)

// 5. save fonts
fontData.forEach(({ data, url }) => {
	const localPath = localPaths[url]
	fs.writeFileSync(localPath, data)
})

console.log('Done.')
