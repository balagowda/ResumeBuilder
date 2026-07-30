// Tells IndexNow that the site changed.
//
// IndexNow is the push protocol Bing, Yandex, Seznam and Naver share: instead
// of waiting for a crawler to come back, the site announces its URLs. That
// matters here beyond Bing itself — ChatGPT's search results lean on Bing's
// index, so a site Bing has not crawled is a site ChatGPT cannot cite.
//
// Google does not participate; new or changed URLs still go to Google via
// Search Console (sitemap + "Request indexing").
//
// Run after deploying:  npm run indexnow
//
// Ownership is proved by public/<key>.txt, which must stay reachable at
// https://hatchresume.com/<key>.txt and contain exactly the key below.
const https = require('https');
const path = require('path');
const { pathToFileURL } = require('url');

const HOST = 'hatchresume.com';
const KEY = 'f79cea966015941e4181d705bc456366';

async function main() {
  const { CONTENT_PAGES, SITE_URL } = await import(
    pathToFileURL(path.join(__dirname, '..', 'src', 'seo', 'contentPages.mjs')).href
  );

  const urlList = [
    `${SITE_URL}/`,
    `${SITE_URL}/templates/`,
    ...CONTENT_PAGES.map((page) => `${SITE_URL}${page.path}/`),
  ];

  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList,
  });

  const request = https.request(
    {
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    (response) => {
      // 200 and 202 both mean accepted; 403 means the key file is not live yet.
      const accepted = response.statusCode === 200 || response.statusCode === 202;
      console.log(
        `${accepted ? 'Submitted' : 'IndexNow rejected'} ${urlList.length} URLs — HTTP ${response.statusCode}`
      );
      if (!accepted) {
        console.log(`Check that ${SITE_URL}/${KEY}.txt is deployed and contains the key.`);
      }
      response.resume();
    }
  );

  request.on('error', (error) => {
    console.error('IndexNow ping failed:', error.message);
    process.exitCode = 1;
  });

  request.write(payload);
  request.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
