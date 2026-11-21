import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding library database...');

  // ── 1) Genres (7 genres — exceeds 4 minimum) ──
  const genres = [
    { name: 'African Literature', slug: 'african-literature' },
    { name: 'Literary Fiction', slug: 'literary-fiction' },
    { name: 'Science Fiction', slug: 'science-fiction' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Business & Economics', slug: 'business-economics' },
    { name: 'History', slug: 'history' },
    { name: "Children's & YA", slug: 'childrens-ya' },
  ];

  const genreIdBySlug = new Map<string, number>();
  for (const g of genres) {
    const row = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: { name: g.name },
      create: g,
    });
    genreIdBySlug.set(g.slug, row.id);
  }
  console.log(`   ✔ ${genres.length} genres ready`);

  // ── 2) Users ──
  const users = [
    { email: 'amina@plp.ac.ke',  name: 'Amina Wanjiku',  role: Role.LIBRARIAN },
    { email: 'brian@plp.ac.ke',  name: 'Brian Otieno',   role: Role.PATRON },
    { email: 'chidi@plp.ac.ke',  name: 'Chidi Okonkwo',  role: Role.PATRON },
  ];

  const userIdByEmail = new Map<string, number>();
  for (const u of users) {
    const row = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: u,
    });
    userIdByEmail.set(u.email, row.id);
  }
  console.log(`   ✔ ${users.length} users ready`);

  // ── 3) Books (22 across 7 genres — exceeds 15 / 4 minimums) ──
  type SeedBook = {
    title: string;
    author: string;
    isbn: string;
    description?: string;
    publishedYear?: number;
    totalCopies: number;
    availableCopies: number;
    genreSlug: string;
  };

  const books: SeedBook[] = [
    // African Literature
    { title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '9780385474542', publishedYear: 1958, totalCopies: 5, availableCopies: 3, genreSlug: 'african-literature', description: 'A cornerstone of modern African literature.' },
    { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', isbn: '9781400095209', publishedYear: 2006, totalCopies: 4, availableCopies: 4, genreSlug: 'african-literature' },
    { title: 'The River Between', author: 'Ngũgĩ wa Thiong’o', isbn: '9780435905484', publishedYear: 1965, totalCopies: 3, availableCopies: 2, genreSlug: 'african-literature' },
    { title: 'Nervous Conditions', author: 'Tsitsi Dangarembga', isbn: '9780954702335', publishedYear: 1988, totalCopies: 3, availableCopies: 3, genreSlug: 'african-literature' },
    { title: 'Weep Not, Child', author: 'Ngũgĩ wa Thiong’o', isbn: '9780143106692', publishedYear: 1964, totalCopies: 2, availableCopies: 2, genreSlug: 'african-literature' },

    // Literary Fiction
    { title: 'The Old Man and the Sea', author: 'Ernest Hemingway', isbn: '9780684801223', publishedYear: 1952, totalCopies: 3, availableCopies: 3, genreSlug: 'literary-fiction' },
    { title: 'Nineteen Eighty-Four', author: 'George Orwell', isbn: '9780451524935', publishedYear: 1949, totalCopies: 4, availableCopies: 1, genreSlug: 'literary-fiction' },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', publishedYear: 1960, totalCopies: 4, availableCopies: 4, genreSlug: 'literary-fiction' },

    // Science Fiction
    { title: 'Dune', author: 'Frank Herbert', isbn: '9780441172719', publishedYear: 1965, totalCopies: 3, availableCopies: 2, genreSlug: 'science-fiction' },
    { title: 'Neuromancer', author: 'William Gibson', isbn: '9780441569595', publishedYear: 1984, totalCopies: 2, availableCopies: 2, genreSlug: 'science-fiction' },
    { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '9780441478125', publishedYear: 1969, totalCopies: 2, availableCopies: 2, genreSlug: 'science-fiction' },

    // Technology
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', publishedYear: 2008, totalCopies: 5, availableCopies: 5, genreSlug: 'technology' },
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '9781449373320', publishedYear: 2017, totalCopies: 3, availableCopies: 2, genreSlug: 'technology' },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', isbn: '9780135957059', publishedYear: 2019, totalCopies: 4, availableCopies: 4, genreSlug: 'technology' },

    // Business & Economics
    { title: 'Zero to One', author: 'Peter Thiel', isbn: '9780804139298', publishedYear: 2014, totalCopies: 3, availableCopies: 3, genreSlug: 'business-economics' },
    { title: 'The Lean Startup', author: 'Eric Ries', isbn: '9780307887894', publishedYear: 2011, totalCopies: 3, availableCopies: 2, genreSlug: 'business-economics' },
    { title: 'Rich Dad Poor Dad', author: 'Robert T. Kiyosaki', isbn: '9781612680194', publishedYear: 1997, totalCopies: 2, availableCopies: 2, genreSlug: 'business-economics' },

    // History
    { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', publishedYear: 2011, totalCopies: 4, availableCopies: 4, genreSlug: 'history' },
    { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9780393317558', publishedYear: 1997, totalCopies: 2, availableCopies: 2, genreSlug: 'history' },
    { title: 'Africa: A Biography of the Continent', author: 'John Reader', isbn: '9780375700798', publishedYear: 1997, totalCopies: 2, availableCopies: 2, genreSlug: 'history' },

    // Children’s & YA
    { title: "Harry Potter and the Philosopher's Stone", author: 'J.K. Rowling', isbn: '9780747532699', publishedYear: 1997, totalCopies: 5, availableCopies: 4, genreSlug: 'childrens-ya' },
    { title: 'The Lion, the Witch and the Wardrobe', author: 'C.S. Lewis', isbn: '9780064471046', publishedYear: 1950, totalCopies: 3, availableCopies: 3, genreSlug: 'childrens-ya' },
  ];

  for (const b of books) {
    const genreId = genreIdBySlug.get(b.genreSlug);
    if (!genreId) throw new Error(`Unknown genre slug: ${b.genreSlug}`);

    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        description: b.description,
        publishedYear: b.publishedYear,
        totalCopies: b.totalCopies,
        availableCopies: b.availableCopies,
        genreId,
      },
    });
  }
  console.log(`   ✔ ${books.length} books ready`);

  // ── 4) Reviews (stretch) ──
  const brian = userIdByEmail.get('brian@plp.ac.ke')!;
  const chidi = userIdByEmail.get('chidi@plp.ac.ke')!;
  const hobbit = await prisma.book.findUnique({ where: { isbn: '9780385474542' } });

  if (hobbit) {
    await prisma.review.upsert({
      where: { bookId_userId: { bookId: hobbit.id, userId: brian } },
      update: {},
      create: { bookId: hobbit.id, userId: brian, rating: 5, comment: 'A masterpiece of African literature.' },
    });
    await prisma.review.upsert({
      where: { bookId_userId: { bookId: hobbit.id, userId: chidi } },
      update: {},
      create: { bookId: hobbit.id, userId: chidi, rating: 4, comment: 'Read it twice already.' },
    });
  }
  console.log('   ✔ sample reviews ready');

  // ── 5) Study spaces (forward-designed for Week 5) ──
  const spaces = [
    { name: 'Quiet Study Room A', capacity: 6, location: 'Level 1 — East Wing' },
    { name: 'Group Discussion Pod B', capacity: 10, location: 'Level 2 — North' },
    { name: 'Silent Reading Room', capacity: 1, location: 'Level 1 — West' },
  ];
  for (const s of spaces) {
    await prisma.studySpace.upsert({
      where: { id: spaces.indexOf(s) + 1 },
      update: { ...s },
      create: s,
    });
  }
  console.log(`   ✔ ${spaces.length} study spaces ready`);

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });