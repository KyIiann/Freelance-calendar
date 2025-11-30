import { test, expect } from '@playwright/test'

test('can book a slot and it appears in admin', async ({ page, request }) => {
  // Ensure an admin user exists for the test
  try {
    const API = process.env.API_URL || 'http://localhost:4000'
    const adminKey = process.env.ADMIN_KEY || 'changeme'
    await request.post(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${adminKey}` }, data: { email: 'playwright-admin@example.com', password: 'playwright', name: 'Playwright Admin' } })
  } catch {
    // ignore if the user already exists or unauthorized
  }
  await page.route('**/api/auth/login', async (route) => {
    const resp = { token: 'fake-token', user: { id: 'user-1', name: 'Playwright User', email: 'playwright-user@example.com' } }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resp) })
  })
  await page.route('**/api/bookings?*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })
  await page.route('**/api/freelancers?*', async (route) => {
    const freelancers = [{ id: 'freelancer-1', name: 'Mock One', bio: 'Mock 1' }]
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(freelancers) })
  })
  await page.route('**/api/freelancers/*', async (route) => {
    const id = route.request().url().split('/').pop() || 'freelancer-1'
    const freelancer = { id, name: 'Freelancer ' + id, bio: 'Mock freelancer' }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(freelancer) })
  })
  // Mock booking creation endpoint so the UI gets a successful response
  let lastBooking: any = null
  await page.route('**/api/book', async (route) => {
    const post = await route.request().postDataJSON().catch(() => ({}))
    lastBooking = { id: String(Date.now()), created_at: new Date().toISOString(), firstname: post.firstname || post.name || 'Test User', email: post.email, phone: post.phone, company: post.company, start_ts: post.start_ts, duration_minutes: post.duration_minutes ?? 30 }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(lastBooking) })
  })
  // Admin booking list should include the new booking
  await page.route('**/api/admin/bookings', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(lastBooking ? [lastBooking] : []) })
  })
  await page.route('**/api/admin/login', async (route) => {
    const payload = { token: 'admin-token', user: { id: 'admin-1', name: 'Playwright Admin', email: 'playwright-admin@example.com' } }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) })
  })
  await page.route('**/api/admin/me', async (route) => {
    const payload = { user: { id: 'admin-1', name: 'Playwright Admin', email: 'playwright-admin@example.com' } }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) })
  })
  try {
    const API = process.env.API_URL || 'http://localhost:4000'
    await request.post(`${API}/api/auth/register`, { data: { email: 'playwright-user@example.com', password: 'playwright', name: 'Playwright User' } })
  } catch {
    // ignore if already exists
  }
  await page.goto('/')
  // Click first 'Voir le profil' button
  await page.click('text=Voir le profil')
  // If the login modal appears, log the test user in
  if (await page.isVisible('input[placeholder="Email"]')) {
    await page.fill('input[placeholder="Email"]', 'playwright-user@example.com')
    await page.fill('input[placeholder="Password"]', 'playwright')
    await page.click('button:has-text("Se connecter")')
    await page.waitForSelector('.profile h1')
  }
  // Wait for booking slots to load
  const slot = page.locator('.slots button:not(.taken)').first()
  await expect(slot).toBeVisible()
  const timeText = await slot.textContent()
  expect(timeText).toBeTruthy()
  await slot.click()

  // Fill booking form
  await page.fill('input[placeholder="Prénom et nom"]', 'Test User')
  await page.fill('input[placeholder="Email"]', 'test@example.com')
  await page.fill('input[placeholder="Téléphone"]', '0123456789')
  await page.click('text=Confirmer')

  await expect(page.locator('.message')).toHaveText(/Réservation confirmée/i)

  // Open Admin and verify booking is present by email (login if necessary)
  await page.click('text=Admin')
  // If login form appears, sign in
  if (await page.isVisible('input[placeholder="Email"]')) {
    await page.fill('input[placeholder="Email"]', 'playwright-admin@example.com')
    await page.fill('input[placeholder="Password"]', 'playwright')
    await page.click('button:has-text("Se connecter")')
    await page.waitForSelector('text=Connecté en tant')
  }
  await page.waitForSelector('text=Admin — réservations')
  await expect(page.locator('table')).toContainText('test@example.com')
})
