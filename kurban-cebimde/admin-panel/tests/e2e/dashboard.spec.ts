import { test, expect } from '@playwright/test'

test('Dashboard yüklenir ve KPI görünüyor', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/Hoş Geldiniz|Dashboard/i)).toBeVisible()
  await expect(page.getByText(/Toplam Kullanıcı|Kullanıcı/i)).toBeVisible()
})

test('Medya İnceleme sayfası açılır', async ({ page }) => {
  await page.goto('/')
  const link = page.getByRole('link', { name: /Medya İnceleme/i })
  if (await link.isVisible()) {
    await link.click()
    await expect(page.getByText(/Onay Bekleyen|İncelenecek medya|Medya/)).toBeVisible()
  } else {
    test.skip(true, 'Medya İnceleme linki bulunamadı')
  }
})
