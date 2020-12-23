const fs = require('fs');
const puppeteer = require('puppeteer');

let browser;

module.exports.initializer = async (context, callback) => {
  const options = {
    headless: true,
    args: [
      // error when launch(); No usable sandbox! Update your kernel
      '--no-sandbox',
      // error when launch(); Failed to load libosmesa.so
      '--disable-gpu',
      // freeze when newPage()
      '--single-process',
    ],
    dumpio: !!process.env.DEBUG,
  }
  try {
    browser = await puppeteer.launch(options);
  } catch (e) {
    callback(e, 'puppeteer launch error');
    return;
  }
  callback(null, '');
};

const convert2pdf = async (url) => {
  const page = await browser.newPage();
  const outputFile = '/tmp/temp.pdf';
  await page.goto(url);
  await page.evaluate(async () => {
    //todo 执行页面优化js
    console.log("hello world");
  });
  await page.pdf({path: outputFile, format: 'A4'});
  console.log(`The convert2pdf for url ${url} saved to ${outputFile}`);
  page.close();
  return outputFile;
};

module.exports.handler = async (req, resp, context) => {
  const pageUrl = req.queries["url"] || 'https://www.fxbaogao.com';
  console.log(`page url: ${pageUrl}`);
  const file = await convert2pdf(pageUrl);
  const filename = "temp.pdf";
  resp.setHeader('Context-Type', 'application/octet-stream');
  resp.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  resp.send(fs.createReadStream(file));
}
