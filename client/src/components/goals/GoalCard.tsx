import React, { useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import api from '../../services/api';

const GoalCard: React.FC<{
    goal: any;
    onEdit: () => void;
    onDelete: () => void
}> = ({ goal, onEdit, onDelete }) => {
    const [amountToAdd, setAmountToAdd] = useState('');
    const progress = (goal.currentAmount / goal.targetAmount) * 100;

    const handleAddAmount = async () => {
        try {
            await api.put(`/goals/${goal.id}`, {
                currentAmount: goal.currentAmount + parseFloat(amountToAdd)
            });
            onEdit(); // Refresh the goal
            setAmountToAdd('');
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div className='card h-100'>
            <div className='card-body'>
                <h5 className='card-title'>{goal.name}</h5>
                <h6 className='card-subtitle mb-2 text-muted'>{goal.type}</h6>

                <div className='my-3'>
                    <div className='d-flex justify-content-between mb-1'>
                        <span>${goal.currentAmount.toFixed(2)}</span>
                        <span>${goal.targetAmount.toFixed(2)}</span>
                    </div>
                    <ProgressBar
                        now={progress}
                        label={`${Math.round(progress)}%`}
                        variant={progress >= 100 ? 'success' : 'primary'}
                    />
                </div>

                {goal.targetDate && (
                    <p className='card-text'>
                        <small className='text-muted'>
                            Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                        </small>
                    </p>
                )}

                <div className='input-group mt-2'>
                    <input
                        type="number"
                        className='form-control'
                        placeholder='Amount to add'
                        value={amountToAdd}
                        onChange={(e) => setAmountToAdd(e.target.value)}
                    />
                    <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={handleAddAmount}
                        disabled={!amountToAdd || isNaN(parseFloat(amountToAdd))}
                    >
                        Add
                    </button>
                </div>

                <div className='d-flex justify-content-between mt-3'>
                    <button onClick={onEdit} className='btn btn-sm btn-outline-primary'>
                        Edit
                    </button>
                    <button onClick={onDelete} className='btn btn-sm btn-outline-danger'>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalCard;