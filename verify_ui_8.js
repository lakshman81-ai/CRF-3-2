const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log("Going to app...");
  await page.goto(`http://localhost:8000`);
  await page.waitForTimeout(2000);

  await page.screenshot({path: "verification/1_start.png"});
  console.log("took 1_start.png");

  console.log("Loading sample...");
  await page.evaluate(() => {
        const dummyData = {
           format: 'XML',
           elements: [{from: 1, to: 2, length: 100, od: 100, dx: 100, dy: 0, dz: 0, fromPos: {x:0, y:0, z:0}, toPos: {x:100, y:0, z:0}}],
           nodes: {1: {x:0, y:0, z:0}, 2: {x:100, y:0, z:0}},
           restraints: [{node: 1, type: 'ANCHOR', isAnchor: true}]
        };
        window.__test_data = dummyData;
    });

  const geo_tab_btn = page.locator(".tab-btn[data-tab='geometry']");
  if (await geo_tab_btn.count() > 0) {
      await geo_tab_btn.click();
      await page.waitForTimeout(1000);
  }

  await page.evaluate(() => {
      import('./core/state.js').then(m => {
          m.state.parsed = window.__test_data;
          import('./core/event-bus.js').then(eb => {
              eb.emit('parse-complete', window.__test_data);
          });
      }).catch(err => console.error("ERR", err));
  });
  await page.waitForTimeout(1000);
  await page.screenshot({path: "verification/2_geo_loaded.png"});
  console.log("took 2_geo_loaded.png");

  const settings_btn = page.locator("#geo-settings-btn");
  if (await settings_btn.count() > 0) {
      await settings_btn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({path: "verification/geometry_tab_settings.png"});
      console.log("Screenshot saved to verification/geometry_tab_settings.png");
  }

  const supports_tab_btn = page.locator(".tab-btn[data-tab='supports']");
  if (await supports_tab_btn.count() > 0) {
      await supports_tab_btn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({path: "verification/supports_tab.png"});
      console.log("Screenshot saved to verification/supports_tab.png");
  }

  const log_toggle = page.locator("#log-panel-toggle");
  if (await log_toggle.count() > 0) {
      await log_toggle.click();
      await page.waitForTimeout(1000);
      await page.screenshot({path: "verification/log_panel.png"});
      console.log("Screenshot saved to verification/log_panel.png");
  }

  await browser.close();
})();