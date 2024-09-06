const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const port = 3000;

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

app.get('/', async (req, res) => {
  try {
    const musicians = await scrapeMusicians();
    res.json(musicians);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Ocurrió un error durante el scraping');
  }
});

async function scrapeMusicians() {
  const musicians = [];
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const links = $('#mw-pages a').map((_, el) => $(el).attr('href')).get();

  for (const link of links) {
    if (link && link.startsWith('/wiki/')) {
      const musicianUrl = `https://es.wikipedia.org${link}`;
      const musicianData = await scrapeMusicianPage(musicianUrl);
      if (musicianData) {
        musicians.push(musicianData);
      }
    }
  }

  return musicians;
}

async function scrapeMusicianPage(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $('h1').text().trim();
    const images = $('img').map((_, el) => $(el).attr('src')).get();
    const texts = $('p').map((_, el) => $(el).text().trim()).get();

    return { title, images, texts };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log('Accede a esta URL para iniciar el scraping');
});