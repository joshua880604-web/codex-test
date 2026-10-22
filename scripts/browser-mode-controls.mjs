// Exercise the same active mode through either responsive navigation control.
export async function selectCalculatorMode(page, modeId) {
  const strategy = page.locator('#payoff-strategy');
  if (await strategy.isVisible()) {
    const [basis, method] = modeId.split('-');
    await page.getByRole('radio', {name: basis === 'known' ? 'Original loan' : 'Current balance', exact: true}).check();
    await strategy.selectOption(method);
  } else if (await page.locator('#calculation-mode').isVisible()) {
    await page.locator('#calculation-mode').selectOption(modeId);
  } else {
    const tab = page.locator(`[id="tab-${modeId}"]`);
    if (await tab.count()) await tab.click();
  }
}
