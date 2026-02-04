if (typeof require !== 'undefined' && typeof module !== 'undefined' && !global.window) {
  const express = require('express');
  const fs = require('fs');
  const path = require('path');

  const app = express();
  const PORT = process.env.PORT || 3000;
  const JSON_DIR = path.join(__dirname, 'json');

  app.use(express.json());
  app.use(express.static(__dirname));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  const readJSON = (filename) => {
    const filepath = path.join(JSON_DIR, `${filename}.json`);
    try {
      const buffer = fs.readFileSync(filepath);
      // Remove BOM if present
      const content = buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF
        ? buffer.slice(3).toString('utf8')
        : buffer.toString('utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading ${filename}.json:`, error.message);
      throw error;
    }
  };

  const writeJSON = (filename, data) => {
    const filepath = path.join(JSON_DIR, `${filename}.json`);
    // Write without BOM by explicitly using UTF8 buffer
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(filepath, Buffer.from(json, 'utf8'));
  };

  const entities = ['dipendenti', 'clienti', 'ordini', 'prodotti', 'categorie', 'fornitori', 'spedizionieri', 'dettagli_ordini'];

  app.get('/json/:entity.json', (req, res) => {
    try {
      const { entity } = req.params;
      console.log(`GET request for: ${entity}`);
      if (!entities.includes(entity)) return res.status(400).json({ error: 'Invalid entity' });
      const data = readJSON(entity);
      res.json(data);
    } catch (err) {
      console.error('GET Error:', err.message);
      console.error('Stack:', err.stack);
      res.status(500).json({ error: 'Read failed', details: err.message });
    }
  });

  app.post('/json/:entity.json', (req, res) => {
    try {
      const { entity } = req.params;
      if (!entities.includes(entity)) return res.status(400).json({ error: 'Invalid entity' });

      const payload = req.body;
      console.log(`POST /${entity}:`, payload);

      if (Array.isArray(payload)) {
        writeJSON(entity, payload);
        return res.json({ saved: payload.length, mode: 'replace' });
      }

      if (payload && typeof payload === 'object' && Object.keys(payload).length > 0) {
        const data = readJSON(entity);
        
        let idField = 'ID';
        if (entity === 'dipendenti') idField = 'EMPLOYEE_ID';
        else if (entity === 'clienti') idField = 'CUSTOMER_ID';
        else if (entity === 'ordini') idField = 'ORDER_ID';
        else if (entity === 'prodotti') idField = 'PRODUCT_ID';
        else if (entity === 'categorie') idField = 'CATEGORY_ID';
        else if (entity === 'fornitori') idField = 'SUPPLIER_ID';
        else if (entity === 'spedizionieri') idField = 'SHIPPER_ID';

        let idx;
        let newItem;

        if (entity === 'dettagli_ordini') {
          const orderId = payload.ORDER_ID;
          const productId = payload.PRODUCT_ID;

          idx = data.findIndex(
            (item) => String(item.ORDER_ID) === String(orderId) && String(item.PRODUCT_ID) === String(productId)
          );

          newItem = {
            ...payload,
            ORDER_ID: orderId !== undefined ? parseInt(orderId) : orderId,
            PRODUCT_ID: productId !== undefined ? parseInt(productId) : productId
          };
        } else {
          const id = payload[idField] ?? Date.now().toString();
          idx = data.findIndex((item) => String(item[idField]) === String(id));
          newItem = { ...payload, [idField]: parseInt(id) };
        }

        if (idx >= 0) {
          data[idx] = newItem;
          writeJSON(entity, data);
          return res.json({ ...newItem, mode: 'updated' });
        } else {
          data.push(newItem);
          writeJSON(entity, data);
          return res.json({ ...newItem, mode: 'created' });
        }
      }

      res.status(400).json({ error: 'Body must be an array or object', received: payload });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Write failed' });
    }
  });

  app.delete('/json/:entity.json', (req, res) => {
    try {
      const { entity } = req.params;
      console.log(`DELETE request for: ${entity}, query params:`, req.query);
      if (!entities.includes(entity)) return res.status(400).json({ error: 'Invalid entity' });

      let idField = 'ID';
      if (entity === 'dipendenti') idField = 'EMPLOYEE_ID';
      else if (entity === 'clienti') idField = 'CUSTOMER_ID';
      else if (entity === 'ordini') idField = 'ORDER_ID';
      else if (entity === 'prodotti') idField = 'PRODUCT_ID';
      else if (entity === 'categorie') idField = 'CATEGORY_ID';
      else if (entity === 'fornitori') idField = 'SUPPLIER_ID';
      else if (entity === 'spedizionieri') idField = 'SHIPPER_ID';
      else if (entity === 'dettagli_ordini') idField = 'ORDER_DETAIL_ID';

      // Accept both ?id= and entity-specific ID field name
      const id = req.query.id || req.query[idField];
      if (!id) return res.status(400).json({ error: `${idField} or 'id' required as query parameter` });

      const data = readJSON(entity);
      const filtered = data.filter((item) => String(item[idField]) !== String(id));

      if (filtered.length === data.length) {
        return res.status(404).json({ error: 'Record not found' });
      }

      writeJSON(entity, filtered);
      res.json({ deleted: id, entity });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  app.listen(PORT, () => {
    console.log(`ERP NorthWind Server running at http://localhost:${PORT}`);
    console.log(`Supported entities: ${entities.join(', ')}`);
  });
}