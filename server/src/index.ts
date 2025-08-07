import { cors } from '@elysiajs/cors';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Elysia } from 'elysia';

const app = new Elysia();
const prisma = new PrismaClient();

// CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/', () => ({ message: 'ChristianAI API is running' }));

// Chat endpoints
app.post('/api/chat/message', async ({ body }) => {
  try {
    const { content, sessionId } = body as { content: string; sessionId?: string };

    // Create or get chat session
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId }
      });
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {}
      });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        content,
        sender: 'USER',
        messageType: 'TEXT',
        chatSessionId: chatSession.id,
      }
    });

    // Process message and generate response
    const response = processUserInput(content);

    // Save bot response
    const botMessage = await prisma.message.create({
      data: {
        content: response.content,
        sender: 'BOT',
        messageType: response.type.toUpperCase() === 'RESPONSE' ? 'TEXT' : response.type.toUpperCase() as 'VERSE' | 'PRAYER' | 'DEVOTIONAL' | 'ADVICE',
        chatSessionId: chatSession.id,
      }
    });

    return {
      sessionId: chatSession.id,
      userMessage,
      botMessage,
      response
    };
  } catch (error) {
    console.error('Error processing message:', error);
    throw new Error('Internal server error');
  }
});

app.get('/api/chat/session/:sessionId', async ({ params }) => {
  try {
    const { sessionId } = params;

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chatSession) {
      throw new Error('Session not found');
    }

    return chatSession;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw new Error('Internal server error');
  }
});

// Bible verses endpoints
app.get('/api/bible/verse/:book/:chapter/:verse', async ({ params }) => {
  try {
    const { book, chapter, verse } = params;

    const bibleVerse = await prisma.bibleVerse.findFirst({
      where: {
        book: book,
        chapter: parseInt(chapter),
        verse: parseInt(verse)
      }
    });

    if (!bibleVerse) {
      throw new Error('Verse not found');
    }

    return bibleVerse;
  } catch (error) {
    console.error('Error fetching verse:', error);
    throw new Error('Internal server error');
  }
});

// Prayers endpoints
app.get('/api/prayers', async ({ query }) => {
  try {
    const category = query.category;
    const prayers = await prisma.prayer.findMany({
      where: category ? { category } : {},
      orderBy: { createdAt: 'desc' }
    });

    return prayers;
  } catch (error) {
    console.error('Error fetching prayers:', error);
    throw new Error('Internal server error');
  }
});

// Devotionals endpoints
app.get('/api/devotionals', async () => {
  try {
    const devotionals = await prisma.devotional.findMany({
      orderBy: { date: 'desc' },
      take: 10
    });

    return devotionals;
  } catch (error) {
    console.error('Error fetching devotionals:', error);
    throw new Error('Internal server error');
  }
});

// Response processing function (same as frontend for now)
function processUserInput(input: string) {
  const responses = {
    "john 3:16 meaning": {
      type: "verse",
      content: `"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." - John 3:16 (NIV)`,
      explanation: `This verse is often called the "Gospel in a nutshell" because it summarizes God's plan of salvation.`
    },
    "prayer for anxiety": {
      type: "prayer",
      content: `Heavenly Father, in the name of Jesus, I come to You feeling anxious and overwhelmed. Your Word says in Philippians 4:6-7 to not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, to present our requests to You. Fill me with Your peace that surpasses all understanding. In Jesus' name, Amen.`
    },
    "daily devotional": {
      type: "devotional",
      content: `Trusting God's Timing\n\n"Wait for the Lord; be strong and take heart and wait for the Lord." - Psalm 27:14\n\nIn our fast-paced world, waiting is difficult. We want instant answers, quick solutions, and immediate results.`
    },
    "how to grow in faith": {
      type: "advice",
      content: `Growing in faith is a lifelong journey. Here are some biblical ways to strengthen your faith:\n\n1. Regular Bible Study (Romans 10:17)\n2. Prayer (Mark 11:24)\n3. Fellowship (Hebrews 10:25)`
    },
    "default": {
      type: "response",
      content: "Thank you for sharing. As you seek God's wisdom, remember Jeremiah 29:13 - 'You will seek me and find me when you seek me with all your heart.'"
    }
  };

  const lowerInput = input.toLowerCase().trim();

  if (lowerInput.includes('john 3:16') || lowerInput.includes('meaning')) {
    return responses["john 3:16 meaning"];
  } else if (lowerInput.includes('prayer') && lowerInput.includes('anxiety')) {
    return responses["prayer for anxiety"];
  } else if (lowerInput.includes('devotional') || lowerInput.includes('daily')) {
    return responses["daily devotional"];
  } else if (lowerInput.includes('grow') && lowerInput.includes('faith')) {
    return responses["how to grow in faith"];
  } else {
    return responses["default"];
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const port = 3001;

console.log(`🚀 ChristianAI API server starting on port ${port}`);

app.listen(port);

export default app;