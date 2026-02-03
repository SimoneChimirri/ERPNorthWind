if (typeof require !== 'undefined' && typeof module !== 'undefined' && !global.window) {
  const express = require('express');
  const fs = require('fs');
  const path = require('path');

  const app = express();
  const PORT = process.env.PORT || 3000;
  const DATA_PATH = path.join(__dirname, 'json', 'giocatori.json');

  app.use(express.json());
  app.use(express.static(__dirname));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'giocatori.html'));
  });

  const readPlayers = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const writePlayers = (players) => fs.writeFileSync(DATA_PATH, JSON.stringify(players, null, 2));

  app.get('/json/giocatori.json', (req, res) => {
    try { res.json(readPlayers()); }
    catch (err) { console.error(err); res.status(500).json({ error: 'read failed' }); }
  });

  app.post('/json/giocatori.json', (req, res) => {
    try {
      const payload = req.body;
      console.log('Received POST payload:', payload, 'Type:', typeof payload);
      
      if (Array.isArray(payload)) {
        writePlayers(payload);
        return res.json({ saved: payload.length, mode: 'replace' });
      }
      if (payload && typeof payload === 'object' && Object.keys(payload).length > 0) {
        const players = readPlayers();
        const id = String(payload.ID_REC ?? Date.now().toString());
        const idx = players.findIndex((p) => String(p.ID_REC) === id);
        const player = { ...payload, ID_REC: id };
        if (idx >= 0) players[idx] = player; else players.unshift(player);
        writePlayers(players);
        return res.json(player);
      }
      res.status(400).json({ error: 'Body must be an array or player object', received: payload });
    } catch (err) {
      console.error(err); res.status(500).json({ error: 'write failed' });
    }
  });

  app.delete('/json/giocatori.json', (req, res) => {
    const id = req.query.ID_REC;
    if (!id) return res.status(400).json({ error: 'ID_REC required' });
    try {
      const players = readPlayers();
      const filtered = players.filter((p) => String(p.ID_REC) !== String(id));
      if (filtered.length === players.length) return res.status(404).json({ error: 'not found' });
      writePlayers(filtered);
      res.json({ deleted: id });
    } catch (err) {
      console.error(err); res.status(500).json({ error: 'delete failed' });
    }
  });

  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}