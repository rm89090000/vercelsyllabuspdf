const pdf = require('pdf-parse');
const { parseSyllabus } = require('../lib/parsesyllabus');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const buffers = [];
    req.on('data', (chunk) => buffers.push(chunk));
    req.on('end', async () => {
      try {
        const buffer = Buffer.concat(buffers);
        const data = await pdf(buffer); 
        const events = parseSyllabus(data.text); 
        res.status(200).json({ events });
      } catch (err) {
        console.error('PDF parsing error:', err);
        res.status(500).json({ error: 'Failed to parse PDF' });
      }
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
