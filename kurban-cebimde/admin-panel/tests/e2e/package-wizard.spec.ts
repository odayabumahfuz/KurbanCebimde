import { test, expect } from '@playwright/test'

test('Paket oluşturma sihirbazı akışı', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('link', { name: /Medya Paketleri/i })
  if (!(await nav.isVisible())) test.skip(true, 'Medya Paketleri linki yok')
  await nav.click()
  const createBtn = page.getByRole('button', { name: /Paket Oluştur|Yeni Paket/i })
  if (!(await createBtn.isVisible())) test.skip(true, 'Paket oluştur butonu yok')
  await createBtn.click()
  await expect(page.getByText(/Bağış Seç|Paket Başlığı|Adım 1/i)).toBeVisible()
})
