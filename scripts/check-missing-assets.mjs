#!/usr/bin/env node
/**
 * Encontra imagens de blog que NÃO estão em public/assets/img
 * Uso: node scripts/check-missing-assets.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')
const blogDir = join(root, 'src/content/blog')
const assetsDir = join(root, 'public/assets/img')

const imageExt = ['.webp', '.avif', '.jpg', '.jpeg', '.png', '.gif']

function extractAssetsFromContent(content) {
  const refs = new Set()
  // Remove URLs remotas para não confundir; depois extrai paths locais /assets/img/
  const withoutUrls = content.replace(/https?:\/\/[^\s"')\]]+/g, '')
  const regex = /\/assets\/img\/([a-zA-Z0-9._/-]+\.(?:webp|avif|jpg|jpeg|png|gif))/g
  let m
  while ((m = regex.exec(withoutUrls)) !== null) refs.add(m[1])
  return refs
}

function getExistingAssets(dir, prefix = '') {
  const files = new Set()
  if (!existsSync(dir)) return files
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = prefix ? `${prefix}/${name.name}` : name.name
    if (name.isDirectory()) {
      for (const f of getExistingAssets(join(dir, name.name), path)) files.add(f)
    } else if (imageExt.some((e) => name.name.toLowerCase().endsWith(e))) {
      files.add(path)
    }
  }
  return files
}

function getAllBlogRefs() {
  const refs = new Set()
  for (const file of readdirSync(blogDir)) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue
    const content = readFileSync(join(blogDir, file), 'utf-8')
    for (const r of extractAssetsFromContent(content)) refs.add(r)
  }
  return refs
}

const blogRefs = getAllBlogRefs()
const existing = getExistingAssets(assetsDir)

const missing = [...blogRefs].filter((r) => !existing.has(r)).sort()

console.log('=== Imagens de blog que NÃO estão em Assets ===\n')
console.log(`Total referenciadas: ${blogRefs.size}`)
console.log(`Total em public/assets/img: ${existing.size}`)
console.log(`Faltando: ${missing.length}\n`)

if (missing.length > 0) {
  console.log('Arquivos faltando:\n')
  for (const m of missing) console.log(`  ${m}`)
}
