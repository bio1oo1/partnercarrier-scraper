const puppeteer = require('puppeteer');
const fs = require('fs');

const URL_PORTAL = 'https://partnercarrier.com';

(async () => {
  const args = process.argv.slice(2);
  if (args.length != 2) return;

  args[0] = Number(args[0]);
  args[1] = Number(args[1]);
  const [beginNumber, endNumber] = args;
  console.log(beginNumber, endNumber);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    userDataDir: `C:\\Users\\A\\AppData\\Local\\Google\\Chrome\\User Data\\Default`
  });

  console.log('Browser Session');
  const page = await browser.newPage();
  console.log('New browser page created');
  page.setDefaultTimeout(500000);

  // console.log('Go to Partners Carrier Website');
  // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  try {
    /* Getting City List
    await page.goto(URL_PORTAL);
    console.log('Navigated to the website');
    // await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click(`.signBtn`)]);
    // await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log(page.url());

    const states = await page.$$eval('.col-md-4.col-sm-6.col-xs-12.form-group a', anchors => {
      const result = [];
      for (anchor of anchors) {
        result.push({
          text: anchor.textContent.trim(),
          href: anchor.getAttribute('href')
        });
      }
      return result;
    });

    console.log(`State Count: ${states.length}`);
    let cities = [];
    for (i in states) {
      // if (i++ > 0) break;
      const state = states[i];
      console.log(`====== State #${i}: ${state.text}`);
      const URL_STATE = `${URL_PORTAL}${state.href}`;
      await page.goto(URL_STATE);
      const stateCities = await page.$$eval('.col-md-12.divcitylistheader .city-link-font-size', anchors => {
        const result = [];
        for (anchor of anchors) {
          result.push({
            text: anchor.textContent.trim(),
            href: anchor.getAttribute('href')
          });
        }
        return result;
      });
      console.log(`City Count ${stateCities.length}`);
      cities = [...cities, ...stateCities];
    }
    fs.writeFileSync(`./result/cities.json`, JSON.stringify(cities, null, '\t'));
    */
    const rawdata = fs.readFileSync(`./result/cities.json`);
    const cities = JSON.parse(rawdata);
    // console.log(cities);

    let totalCompanies = [];
    for (let i = beginNumber; i <= endNumber; i++) {
      if (i >= cities.length) break;
      // if (i++ > 0) break;
      const city = cities[i];
      console.log(`====== City #${i}: ${city.text}`);
      let cityCompanies = [];
      let pageNum = 1;

      while (true) {
        const URL_CITY = `${URL_PORTAL}${city.href}?p=${pageNum}`;
        console.log(URL_CITY);
        await page.goto(URL_CITY);

        const divs = await page.$$('#companyList .row.form-group .div-border .col-md-6');
        if (divs.length === 0) break;
        const companies = await page.$$eval('#companyList .row.form-group .div-border .col-md-6', divs => {
          let result = [];
          for (i in divs) {
            if (i % 2 === 1) continue;
            const anchor = divs[i].getElementsByTagName('a')[0];
            const href = anchor.getAttribute('href');
            const hasInactive = anchor.getElementsByClassName('inactive-status').length;
            let isInactive;
            if (hasInactive > 0) {
              isInactive = true;
              // inactiveText = anchor.getElementsByClassName('inactive-status')[0].textContent.trim();
              anchor.getElementsByClassName('inactive-status')[0].remove();
            }

            const name = anchor.getElementsByTagName('h4')[0].textContent.trim();
            result.push({ href, name, isInactive: isInactive });
          }
          return result;
        });
        cityCompanies = [...cityCompanies, ...companies];

        const hasNext = await page.$$eval('.pagination li a', anchors => {
          if (anchors.length === 0) return false;
          const content = anchors[anchors.length - 1].textContent;
          if (content.includes('»')) return true;
          return false;
        });
        if (!hasNext) break;
        pageNum++;
      }
      console.log(`Company Count: ${cityCompanies.length}`);
      totalCompanies = [...totalCompanies, ...cityCompanies];
      fs.writeFileSync(`./result/${i}.json`, JSON.stringify(cityCompanies, null, '\t'));
    }

    console.log(`Total Company Count: ${totalCompanies.length}`);

    // console.log('Output Result');
    // fs.writeFileSync(`./output.json`, JSON.stringify(totalCompanies, null, '\t'));

    console.log('Close browser');
    // await browser.close();
  } catch (e) {
    console.log(e);
    // console.log('Already Logged in goes to main portal page.');
  }
})();
