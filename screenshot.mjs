import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const puppeteer = require('C:/Users/NorthBridge/Desktop/Research and Development/Claude/Website Design General/node_modules/puppeteer/lib/cjs/puppeteer/puppeteer.js')

const browser = await puppeteer.launch({
  headless: true,
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const snap = async (path, url) => {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1500))
  await page.screenshot({ path, fullPage: true })
  await page.close()
  console.log('✓', path)
}

await snap('ss-landing.png',  'http://localhost:5173/')
await snap('ss-login.png',    'http://localhost:5173/login')
await snap('ss-signup.png',   'http://localhost:5173/signup')

await browser.close()
