# Search Feature Guide

This guide explains how to use the new artist search feature.

## What's New

1. **Artist Search Bar** - Search for artists on the homepage using keywords
2. **Search Keywords Support** - Artists can have multiple search keywords (e.g., "ztmy", "真夜中" for "ずっと真夜中でいいのに。")
3. **Artist Detail Page** - View dedicated pages for each artist showing only their live events

## How to Setup

### 1. Database Setup

First, make sure your database is set up with the search keywords:

```bash
cd backend

# Reset and migrate the database
npx prisma migrate reset --skip-seed

# Run migrations
npx prisma migrate dev --name add_search_keywords

# Seed the database with ZUTOMAYO data (includes search keywords)
npm run seed:zutomayo
```

### 2. Start the Application

Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 3. Access the Application

Open your browser and go to: `http://localhost:3000`

## How to Use

### Search for Artists

1. On the homepage, you'll see a search bar in the hero section
2. Type any of these keywords to find "ずっと真夜中でいいのに。":
   - `ztmy`
   - `真夜中`
   - `ずとまよ`
   - Or part of the artist name: `ずっと`

3. As you type, search results will appear in a dropdown
4. Click on an artist to go to their dedicated page

### Artist Detail Page

- Shows artist information (names in Japanese, English, Chinese)
- Displays search keywords
- Shows a calendar with **only that artist's live events**
- Links to official websites and social media
- Click "Back to Home" to return to the main page

## Technical Details

### Database Schema

The `Artist` model has a `searchKeywords` field:
```prisma
model Artist {
  searchKeywords String[] @default([])
  // ... other fields
}
```

### API Endpoints

- `GET /artists?search={query}` - Search for artists by name or keywords
- `GET /artists/{id}` - Get artist details including all their live events

### Frontend Components

- `frontend/src/app/page.tsx` - Homepage with search functionality
- `frontend/src/app/artists/[id]/page.tsx` - Artist detail page
- `frontend/src/components/LiveCalendar.tsx` - Calendar component (supports artist filtering)

## Adding Search Keywords for Artists

### Through Admin Interface (Recommended)

1. Go to the Admin Panel: `http://localhost:3000/admin`
2. Navigate to **Artists** section
3. Click **Edit** on any artist or **Add New** to create one
4. Find the **Search Keywords** field
5. Enter keywords separated by **spaces or newlines** (e.g., `ztmy 真夜中 ずとまよ`)
6. Click **Save**

The keywords will be automatically split by spaces/newlines and saved as an array.

**Note**: We use spaces instead of commas because different languages use different comma symbols (e.g., English `,` vs Chinese `，`).

### Through Database (Advanced)

```typescript
await prisma.artist.update({
  where: { id: 'artist-id' },
  data: {
    searchKeywords: ['keyword1', 'keyword2', 'abbreviation']
  }
});
```

## Example Search Keywords

- **ZUTOMAYO**: `ztmy 真夜中 ずとまよ`
- **Aimyon**: `あいみょん aimyon aymn`
- **YOASOBI**: `yoasobi ヨアソビ よあそび yaso`

Note: Keywords are separated by spaces or newlines, not commas.

## Troubleshooting

### No search results found

1. Make sure you've run the seed script: `npm run seed:zutomayo`
2. Check if the artist exists: `http://localhost:3001/artists`
3. Check if the artist has search keywords in the database

### Artist page shows no events

1. Make sure the artist has associated live events in the database
2. Check the live events API: `http://localhost:3001/lives?artistId={id}`

### Search is too slow

The current implementation searches through all artists on the backend. For large datasets, consider:
- Adding a database index on searchKeywords
- Using full-text search
- Implementing pagination

## Future Improvements

- [ ] Add fuzzy search for typo tolerance
- [ ] Add search history/suggestions
- [ ] Add filters (by city, date, etc.)
- [ ] Add search by venue or tour name
- [ ] Implement full-text search for better performance
