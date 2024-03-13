# CSV to json and Age Distribution Report

## Setup

1. Clone the repository.
2. Install dependencies using `npm install`. (express,pg,nodemon,dotenv)
3. Set up the environment variables in a `.env` file:
     PORT=3000
     DATABASE_URL=postgres://username:password@host_name:port_no/database_name
     CSV_FILE_PATH=<path_to_your_csv_file>
     for example:
       DATABASE_URL=postgres://vinay:vinay@localhost:5432/kelp
       CSV_FILE_PATH=C:\Users\vinay\Kelp_fullstack\sample.csv
4. Ensure you have PostgreSQL installed and running, with a database configured.
5. Modify the database schema as necessary to match the CSV data structure.
6. This is the structure of the table(schema);
  CREATE TABLE public.users (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        age INT NOT NULL,
        address JSONB,
      additional_info JSONB
  );

## Usage

1. To upload the CSV file and insert data into the database, navigate to `http://localhost:3000/upload`.
2. After successful data insertion, you can check the age distribution report by visiting `http://localhost:3000/ageDistribution`.

## Dependencies

- Express.js: A web application framework for Node.js.
- PostgreSQL: A powerful, open-source object-relational database system.
- dotenv: Loads environment variables from a `.env` file into `process.env`.
- nodemon: A utility that monitors for changes in your source code and automatically restarts the server.

## File Structure

- `server.js`: Main application file containing server setup and routes.
- `package.json`: Configuration file for npm dependencies.
- `.env`: Environment variable file (not included in repository).
- `README.md`: Documentation file explaining the application setup and usage.
- `sample.csv`: Sample csv file. 

## Important Notes

- Ensure that the CSV file structure matches the expected format defined in the application.
- This application assumes a PostgreSQL database setup. Modify database configurations accordingly for other databases.
- Error handling is implemented for database connection, data insertion, and report generation.
