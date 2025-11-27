# MongoDB Setup Guide

## Option 1: Using Docker (Recommended)

1. Make sure Docker Desktop is running
2. Start MongoDB:
   ```bash
   docker-compose up -d mongodb
   ```
3. Seed the database:
   ```bash
   npm run seed
   ```

## Option 2: Install MongoDB Locally

### Windows
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service:
   ```bash
   net start MongoDB
   ```
4. Seed the database:
   ```bash
   npm run seed
   ```

### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
npm run seed
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
npm run seed
```

## Verify MongoDB is Running

Check if MongoDB is accessible:
```bash
mongosh
```

Or test the connection from the app:
```bash
npm run dev
```

## Database Configuration

The application connects to MongoDB using the connection string in `.env`:
```
DATABASE_URL=mongodb://localhost:27017/book_management
```

## Seed Data

To populate the database with sample data:
```bash
npm run seed
```

This will create:
- 4 sample books
- 3 sample remarks

## MongoDB Compass (Optional)

For a GUI to view your data, download MongoDB Compass:
https://www.mongodb.com/try/download/compass

Connection string: `mongodb://localhost:27017/book_management`
