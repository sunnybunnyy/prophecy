import express from 'express';
import { PrismaClient } from '../../generated/prisma';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticate);

// Get all goals for a user
router.get('/', async(req: AuthenticatedRequest, res) => {
    try {
        const goals = await prisma.goal.findMany({
            where: { userId: req.user.id }
        });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// Create new goal
router.post('/', async(req: AuthenticatedRequest, res) => {
    const { name, type, targetAmount, targetDate, annualContribution, monthlyContribution } = req.body;

    try {
        const goal = await prisma.goal.create({
            data: {
                name,
                type,
                targetAmount: parseFloat(targetAmount),
                targetDate: targetDate ? new Date(targetDate) : null,
                annualContribution: parseFloat(annualContribution || '0'),
                monthlyContribution: parseFloat(monthlyContribution || '0'),
                userId: req.user.id
            }
        });
        res.json(goal);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create goal' });
    }
});

// Update goal
router.put('/:id', async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { currentAmount, ...data } = req.body;

    try {
        const goal = await prisma.goal.update({
            where: { id: parseInt(id), userId: req.user.id },
            data: {
                ... data,
                currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : undefined
            }
        });
        res.json(goal);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update goal' });
    }
});

// Delete goal
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    try {
        await prisma.goal.delete({
            where: { id: parseInt(id), userId: req.user.id }
        });
        res.json({ message: 'Goal deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete goal' });
    }
});

export default router;