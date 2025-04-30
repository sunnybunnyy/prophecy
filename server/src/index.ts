import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../generated/prisma';
import userRouter from './routes/user';
import goalRouter from './routes/goals';
import expenseRouter from './routes/expenses';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/goals', goalRouter);
app.use('/api/expenses', expenseRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

