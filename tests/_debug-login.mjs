import { chromium } from '@playwright/test'

const email = 'e2e-test-user@eggtestfarm.invalid'
const password = 'E2eTestP@ss2026!'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

page.on('console', m => {
  if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text())
})
page.on('pageerror', e => console.log('PAGE ERROR:', e.message))

console.log('Navigating to app...')
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2000)

const title = await page.title()
console.log('Title:', title)

const hasLoginForm = await page.locator('input[type="email"]').isVisible()
console.log('Login form visible:', hasLoginForm)

if (!hasLoginForm) {
  console.log('Page HTML snippet:', (await page.content()).substring(0, 500))
  await browser.close()
  process.exit(1)
}

console.log('Filling login form...')
await page.fill('input[type="email"]', email)
await page.fill('input[type="password"]', password)
await page.click('button[type="submit"]')

console.log('Waiting for dashboard...')
try {
  await page.waitForSelector('.dashboard', { timeout: 15000 })
  console.log('SUCCESS: .dashboard found!')
} catch (e) {
  console.log('FAILED to find .dashboard')
  // Check for error message
  const errorEl = page.locator('[style*="f8d7da"], [style*="721c24"]')
  if (await errorEl.isVisible()) {
    console.log('Login error shown:', await errorEl.textContent())
  }
  // Check current URL
  console.log('Current URL:', page.url())
  // Check if still on login
  console.log('Still on login:', await page.locator('input[type="email"]').isVisible())
  // Dump a chunk of the page
  const body = await page.evaluate(() => document.body.innerText.substring(0, 600))
  console.log('Page body text:', body)
}

await browser.close()
