// Exercise the same active mode through either responsive navigation control.
export async function selectCalculatorMode(page, modeId) {
  const savings = page.locator(`.savings-mode-picker [data-mode-id="${modeId}"]`);
  if (await savings.isVisible()) { await savings.click(); return; }
  if (await page.locator('.task-mode-navigation').isVisible()) {
    const group = await page.locator('.task-mode-navigation [data-mode-ids]').evaluateAll((els, id) => {
      const el = els.find(el => el.dataset.modeIds.split(',').includes(id));
      return el ? {value: el.value, radio: el.tagName === 'INPUT'} : null;
    }, modeId);
    if (!group) throw Error('Missing task group for '+modeId);
    if (group.radio) await page.locator(`input[name="task-group"][value="${group.value}"]`).check();
    else await page.locator('#task-group').selectOption(group.value);
    const mode = page.locator('#task-mode');
    if (await mode.count()) {
      if (!await mode.isVisible()) await page.locator('.specific-mode > summary').click();
      await mode.selectOption(modeId);
    }
    return;
  }
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
