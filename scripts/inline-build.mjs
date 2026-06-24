import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(root, 'dist')
const indexPath = resolve(distDir, 'index.html')

let html = await readFile(indexPath, 'utf8')

const scriptMatch = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/)
if (!scriptMatch) throw new Error('未找到构建后的 JavaScript 入口')

const scriptPath = resolve(distDir, scriptMatch[1].replace(/^\//, ''))
const script = (await readFile(scriptPath, 'utf8')).replaceAll('</script', '<\\/script')
html = html.replace(scriptMatch[0], () => `<script type="module">${script}</script>`)

const styleMatch = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/)
if (!styleMatch) throw new Error('未找到构建后的样式入口')

const stylePath = resolve(distDir, styleMatch[1].replace(/^\//, ''))
const style = await readFile(stylePath, 'utf8')
html = html.replace(styleMatch[0], () => `<style>${style}</style>`)

if (/\b(?:src|href)=["'](?:\.\/|\/)?assets\//.test(html)) {
  throw new Error('单文件仍包含外部构建资源引用')
}
if ((html.match(/<script type="module">/g) ?? []).length !== 1) {
  throw new Error('单文件 JavaScript 入口数量异常')
}

await mkdir(distDir, { recursive: true })
await writeFile(indexPath, html)
await writeFile(resolve(root, 'PointFlow-Demo.html'), html)

console.log('Self-contained demo generated: PointFlow-Demo.html')
