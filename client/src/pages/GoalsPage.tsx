import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import GoalCard from '../components/goals/GoalCard';

const GoalsPage: React.FC = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingGoal, setEditingGoal] = useState<any>(null);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Required'),
        type: Yup.string().required('Required'),
        targetAmount: Yup.number().required('Required').positive('Must be positive'),
        targetDate: Yup.date().nullable(),
        annualContribution: Yup.number().min(0, 'Must be positive'),
        monthlyContribution: Yup.number().min(0, 'Must be positive')
    });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const response = await api.get('/goals');
            setGoals(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: any, { resetForm }: any) => {
        try {
            if (editingGoal) {
                await api.put(`/goals/${editingGoal.id}`, values);
            } else {
                await api.post('/goals', values);
            }
            fetchGoals();
            resetForm();
            setEditingGoal(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/goals/${id}`);
            fetchGoals();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Financial Goals</h1>

            <div className='row mt-4'>
                <div className='col-md-5'>
                    <div className="card">
                        <div className='card-header'>
                            <h3>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h3>
                        </div>
                        <div className='card-body'>
                            <Formik
                                initialValues={{
                                    name: editingGoal?.name || '',
                                    type: editingGoal?.type || 'emergency',
                                    targetAmount: editingGoal?.targetAmount || '',
                                    targetDate: editingGoal?.targetDate?.split('T')[0] || '',
                                    annualContribution: editingGoal?.annualContribution || '',
                                    monthlyContribution: editingGoal?.monthlyContribution || ''
                                }}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form>
                                        <div className='mb-3'>
                                            <label htmlFor='name' className='form-label'>Goal Name</label>
                                            <Field type="text" name="name" className="form-control" />
                                            <ErrorMessage name="name" component="div" className='text-danger' />
                                        </div>

                                        <div className='mb-3'>
                                            <label htmlFor='type' className='form-label'>Goal Type</label>
                                            <Field as="select" name="type" className="form-select">
                                                <option value="emergency">Emergency Fund</option>
                                                <option value="tfsa">TFSA</option>
                                                <option value="rrsp">RRSP</option>
                                                <option value="fhsa">FHSA</option>
                                                <option value="vacation">Vacation</option>
                                                <option value="purchase">Big Purchase</option>
                                                <option value="other">Other</option>
                                            </Field>
                                        </div>

                                        <div className='mb-3'>
                                            <label htmlFor='targetAmount' className='form-label'>Target Amount ($)</label>
                                            <Field type="number" name="targetAmount" className="form-control" step="0.01" />
                                            <ErrorMessage name="targetAmount" component="div" className='text-danger' />
                                        </div>

                                        <div className='mb-3'>
                                            <label htmlFor='targetDate' className='form-label'>Target Date (optional)</label>
                                            <Field type="date" name="targetDate" className="form-control" />
                                        </div>

                                        <div className='mb-3'>
                                            <label htmlFor='annualContribution' className='form-label'>Annual Contribution ($)</label>
                                            <Field type="number" name="annualContribution" className="form-control" step="0.01" />
                                            <ErrorMessage name="annualContribution" component="div" className='text-danger' />
                                        </div>

                                        <div className='mb-3'>
                                            <label htmlFor='monthlyContribution' className='form-label'>Monthly Contribution ($)</label>
                                            <Field type="number" name="monthlyContribution" className="form-control" step="0.01" />
                                            <ErrorMessage name="monthlyContribution" component="div" className='text-danger' />
                                        </div>

                                        <button type="submit" disabled={isSubmitting} className='btn btn-primary me-2'>
                                            {isSubmitting ? 'Saving...' : 'Save'}
                                        </button>

                                        {editingGoal && (
                                            <button
                                                type="button"
                                                className='btn btn-secondary'
                                                onClick={() => setEditingGoal(null)}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>

                <div className='col-md-7'>
                    <div className='card'>
                        <div className='card-header'>
                            <h3>Your Goals</h3>
                        </div>
                        <div className='card-body'>
                            {goals.length === 0 ? (
                                <p>No goals yet. Add your first goal!</p>
                            ) : (
                                <div className='row'>
                                    {goals.map(goal => (
                                        <div key={goal.id} className='col-md-6 mb-3'>
                                            <GoalCard
                                                goal={goal}
                                                onEdit={() => setEditingGoal(goal)}
                                                onDelete={() => handleDelete(goal.id)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalsPage