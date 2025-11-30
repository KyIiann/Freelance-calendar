import { test, expect } from '@playwright/test'

test('header modal login redirects to a selected freelancer', async ({ page, request }) => {
  const email = 'playwright-user@example.com'
  const password = 'playwright'
  // Intercept auth and bookings API endpoints to remove requirement that backend is running
  await page.route('**/api/auth/login', async (route) => {
    const resp = { token: 'fake-token', user: { id: 'user-1', name: 'Playwright User', email } }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resp) })
  })
  await page.route('**/api/bookings?*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })

  await page.goto('/')
  // capture first freelancer name
  const firstName = await page.locator('.freelancer-card .name').first().textContent()
  // click the first 'Voir le profil' — this should open the header modal with next set
  await page.locator('.freelancer-card').first().locator('text=Voir le profil').click()
  if (await page.isVisible('input[placeholder="Email"]')) {
    await page.fill('input[placeholder="Email"]', email)
    await page.fill('input[placeholder="Password"]', password)
    await page.click('button:has-text("Se connecter")')
  }
  // ensure login modal is visible
  await expect(page.locator('input[placeholder="Email"]')).toBeVisible()
  // login via modal
  await page.fill('input[placeholder="Email"]', email)
  await page.fill('input[placeholder="Password"]', password)
  await page.click('button:has-text("Se connecter")')
  // Wait for profile header to appear and match the freelancer name
  await page.waitForSelector('.profile h1')
  await expect(page.locator('.profile h1')).toHaveText(firstName ?? '')
})
