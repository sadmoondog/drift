import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { test, expect, skipOnboarding, pickForCompare, ENV_SOURCE, ENV_TARGET } from './fixtures'

test('long paths and many keys keep approval buttons inside the dialog', async ({
  window,
  workspace
}) => {
  const name = `.env.production-${'long-deployment-region-'.repeat(8)}`
  const relative = join(...Array.from({ length: 4 }, () => 'nested-region-'.repeat(12)), name)
  const additions = Array.from({ length: 180 }, (_, index) => `FIXTURE_KEY_${index}=fake-${index}`)
  writeFileSync(join(workspace, 'app', '.env'), ENV_SOURCE + additions.join('\n') + '\n')
  const target = join(workspace, 'app', relative)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, ENV_TARGET)
  await skipOnboarding(window)
  await window.getByRole('button', { name: 'Rescan', exact: true }).click()
  await pickForCompare(window, 'app/.env', 'A')
  await pickForCompare(window, `app/${relative}`, 'B')
  await window.getByRole('button', { name: 'Compare', exact: true }).click()
  await expect(window.getByRole('cell', { name: 'SHARED_TOKEN', exact: true })).toBeVisible()
  await window.getByRole('tab', { name: /Dry-run plan/ }).click()
  await window.getByRole('button', { name: /Apply to B/ }).click()
  const dialog = window.getByRole('dialog')

  for (const viewport of [
    { width: 1100, height: 800 },
    { width: 900, height: 600 }
  ]) {
    await window.setViewportSize(viewport)
    for (const button of [
      dialog.getByRole('button', { name: 'Cancel', exact: true }),
      dialog.getByRole('button', { name: /^Write \d+ keys$/ })
    ]) {
      await expect(button).toBeInViewport({ ratio: 1 })
      const frame = await dialog.boundingBox()
      const bounds = await button.boundingBox()
      expect(frame).not.toBeNull()
      expect(bounds).not.toBeNull()
      if (frame === null) throw new Error('Approval dialog has no bounds')
      if (bounds === null) throw new Error('Approval button has no bounds')
      expect(bounds.x).toBeGreaterThanOrEqual(frame.x)
      expect(bounds.y).toBeGreaterThanOrEqual(frame.y)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(frame.x + frame.width)
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(frame.y + frame.height)
    }
  }
  const lastKey = dialog.getByRole('checkbox').last()
  const description = dialog.locator('[data-slot="dialog-description"]')
  await description.scrollIntoViewIfNeeded()
  await expect(description).toBeInViewport({ ratio: 1 })
  await expect(description).toContainText(name)
  await lastKey.scrollIntoViewIfNeeded()
  await expect(lastKey).toBeInViewport({ ratio: 1 })
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeInViewport({
    ratio: 1
  })
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(dialog).not.toBeVisible()
})
