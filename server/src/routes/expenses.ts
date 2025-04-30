import express from 'express';
import { PrismaClient } from '../../generated/prisma';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticate);

// Get all expenses for user
router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            where: { userId: req.user.id },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Get expense summary by type
router.get('/summary', async (req: AuthenticatedRequest, res) => {
    try {
        const expenses = await prisma.expense.groupBy({
            by: ['type'],
            where: { userId: req.user.id },
            _sum: {
                amount: true
            },
            orderBy: {
                _sum: {
                    amount: 'desc'
                }
            }
        });

        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch expense summary' });
    }
});

// Get a single expense
router.get('/:id', async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    try {
        const expense = await prisma.expense.findUnique({
            where: { id: parseInt(id), userId: req.user.id }
        });

        if (!expense) {
            res.status(404).json({ error: 'Expense not found' });
        }

        res.json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch expense' });
    }
});

// Create new expense
router.post('/', async (req: AuthenticatedRequest, res) => {
    const { name, amount, type, frequency, date } = req.body; 

    try {
        const expense = await prisma.expense.create({
            data: {
                name,
                amount: parseFloat(amount),
                type,
                frequency,
                date: date ? new Date(date) : new Date(),
                userId: req.user.id
            }
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to create expense' });
    }
});

// Update expense
router.put('/:id', async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { name, amount, type, frequency, date } = req.body;

    try {
        const expense = await prisma.expense.update({
            where: { id: parseInt(id), userId: req.user.id },
            data: {
                name,
                amount: amount !== undefined ? parseFloat(amount) : undefined,
                type,
                frequency,
                date: date ? new Date(date) : undefined
            }
        });

        res.json(expense);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to update expense' });
    }
});

// Delete expense
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    try { 
        await prisma.expense.delete({
            where: { id: parseInt(id), userId: req.user.id }
        });

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to delete expense' });
    }
});

export default router;