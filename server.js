require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { Client } = require('pg');

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

const pgdb = new Client({
  connectionString: process.env.DATABASE_URL,
  host: 'db',
});

// Connect to PostgreSQL database
pgdb.connect()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  app.get('/upload-form', (req, res) => {
    res.sendFile(__dirname + '/upload-form.html'); // Change the path as necessary
  });

// Endpoint to handle file upload and CSV to JSON conversion
app.post('/upload', upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const csvFilePath = req.file.path;
  const csvData = fs.readFileSync(csvFilePath, 'utf-8');
  const rows = csvData.split('\n');
  const headers = rows.shift().split(',');

  const jsonArray = rows.map(row => {
      const values = row.split(',');
      const obj = {};
      headers.forEach((header, index) => {
          if (header && values[index]) { // Add null check to prevent 'undefined' error
              obj[header.trim()] = values[index].trim();
          }
      });
      return obj;
  });

  // Insert jsonArray into PostgreSQL database
  const insertQuery = 'INSERT INTO users (name, age, address, additional_info) VALUES ($1, $2, $3, $4)';

  const insertedData = [];

  for (const item of jsonArray) {
      try {
          const fullName = `${item['name.firstName']} ${item['name.lastName']}`;
          const address = {
              line1: item['address.line1'],
              line2: item['address.line2'],
              city: item['address.city'],
              state: item['address.state']
          };
          const additionalInfo = {
              gender: item['gender']
          };

          const result = await pgdb.query(insertQuery, [
              fullName,
              item['age'],
              JSON.stringify(address),
              JSON.stringify(additionalInfo)
          ]);
          insertedData.push({
              name: {
                  firstName: item['name.firstName'],
                  lastName: item['name.lastName']
              },
              age: parseInt(item.age),
              address: address,
              gender: item.gender
          });
      } catch (error) {
          console.error('Error inserting data into database:', error);
      }
  }

  res.json({ success: true, message: 'CSV file uploaded and data saved to database', data: insertedData });
});

// Endpoint to calculate age distribution and send report
app.get('/ageDistribution', async (req, res) => {
  try {
      const ageDistributionQuery = `
          SELECT
              CASE
                  WHEN age < 20 THEN '< 20'
                  WHEN age >= 20 AND age <= 40 THEN '20 to 40'
                  WHEN age > 40 AND age <= 60 THEN '40 to 60'
                  ELSE '> 60'
              END AS age_group,
              COUNT(*) AS count
          FROM
              users
          GROUP BY
              age_group
          ORDER BY
              age_group;
      `;
      
      const result = await pgdb.query(ageDistributionQuery);
      
      // Calculate total users
      
     const totalRowsQuery = `SELECT COUNT(*) FROM users;`;
     const totalRowsResult = await pgdb.query(totalRowsQuery);
     const totalUsers = parseInt(totalRowsResult.rows[0].count);

      // Calculate percentage distribution
      const ageDistributionReport = result.rows.map(row => {
          return {
              ageGroup: row.age_group,
              count: row.count,
              percentage: ((row.count / totalUsers) * 100).toFixed(2)
          };
      });

      // Print report to console
      
      console.log("Age GroupCount Percentage (%)");
      ageDistributionReport.forEach(row => {
          console.log(`${row.ageGroup.padEnd(10, '    ')}${row.count.toString().padEnd(8, ' ')}${row.percentage.padEnd(14, ' ')}`);
      });

      // Prepare HTML table for response
      let htmlTable = '<table border="1"><tr><th>Age Group</th><th>Count</th><th>Percentage (%)</th></tr>';
      ageDistributionReport.forEach(row => {
          htmlTable += `<tr><td>${row.ageGroup}</td><td>${row.count}</td><td>${row.percentage}</td></tr>`;
      });
      htmlTable += '</table>';

      res.send(`
          <h1>Age Distribution Report</h1>
          ${htmlTable}
      `);
  } catch (error) {
      console.error('Error generating age distribution report:', error);
      res.status(500).send('Failed to generate age distribution report');
  }
});




app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
