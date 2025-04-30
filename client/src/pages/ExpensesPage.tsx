import { useState, useEffect } from 'react';
import { Table, Form, Button, Modal, Card, Tab, Tabs } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Expense } from '../types';

Chart.register(...registerables);

const ExpensesPage = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('table');
    const [filters, setFilters] = useState({
        type: '',
        month: '',
        year: new Date().getFullYear().toString()
    });

    // Fetch expenses on mount
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await api.get('/expenses');
                setExpenses(response.data);
                setFilteredExpenses(response.data);
            } catch( error ) {
                console.error('Failed to fetch expenses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, []);

    // Apply filters when they change
    useEffect(() => {
        let result = [...expenses];

        if (filters.type) {
            result = result.filter(exp => exp.type === filters.type);
        }

        if (filters.month) {
            result = result.filter(exp => {
                const date = new Date(exp.date);
                return date.getMonth() + 1 === parseInt(filters.month);
            });
        }

        if (filters.year) {
            result = result.filter(exp => {
                const date = new Date(exp.date);
                return date.getFullYear() === parseInt(filters.year);
            });
        }

        setFilteredExpenses(result);
    }, [filters, expenses]);

    // Expense form validation schema
    const expenseSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        amount: Yup.number()
            .required('Amount is required')
            .positive('Amount must be positive'),
        type: Yup.string().required('Type is required'),
        frequency: Yup.string().required('Frequency is required'),
        date: Yup.date().required('Date is required')
    });

    // Handle expense submission
    const handleSubmit = async (values: any, { resetform }: any) => {
        try {
            const response = await api.post('/expenses', values);
            setExpenses([...expenses, response.data]);
            resetform();
            setShowModal(false);
        } catch (error) {
            console.error('Failed to add expense:', error);
        }
    };

    // Handle expense deletion
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await api.delete(`/expenses/${id}`);
                setExpenses(expenses.filter(exp => exp.id !== id));
            } catch (error) {
                console.error('Failed to delete expense:', error);
            }
        }
    };

    // Prepare chart data
    const prepareChartData = () => {
        const categories = [...new Set(filteredExpenses.map(exp => exp.type))];
        const amounts = categories.map(cat =>
            filteredExpenses
                .filter(exp => exp.type === cat)
                .reduce((sum, exp) => sum + exp.amount, 0)
        );

        return {
            labels: categories,
            datasets: [
                {
                    label: 'Expenses by Category',
                    data: amounts,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                        '#FF9F40', '#8AC24A', '#FF6B6B', '#47B8E0', '#7A7A7A'
                    ]
                }
            ]
        };
    };

    if (loading) {
        return (
            <div className='d-flex justify-content-center mt-5'>
                <div className='spinner-border' role="status">
                    <span className='visually-hidden'>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className='container mt-4'>
            <h1 className='mb-4'>Expense Tracking</h1>

            {/* Filters */}
            <Card className='mb-4'>
                <Card.Body>
                    <Form>
                        <div className='row'>
                            <div className='col-md-3'>
                                <Form.Group controlId='typeFilter'>
                                    <Form.Label>Type</Form.Label>
                                    <Form.Select
                                        value={filters.type}
                                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                                    >
                                        <option value="">All Types</option>
                                        <option value="housing">Housing</option>
                                        <option value="food">Food</option>
                                        <option value="transportation">Transportation</option>
                                        <option value="utilities">Utilities</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="health">Health</option>
                                        <option value="other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className='col-md-3'>
                                <Form.Group controlId='monthFilter'>
                                    <Form.Label>Month</Form.Label>
                                    <Form.Select
                                        value={filters.month}
                                        onChange={(e) => setFilters({...filters, month: e.target.value})}
                                    >
                                        <option value="">All Months</option>
                                        {Array.from({length: 12}, (_, i) => (
                                            <option key={i+1} value={i+1}>
                                                {new Date(0, i).toLocaleString('default', {month: 'long'})}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className='col-md-3'>
                                <Form.Group controlId='yearFilter'>
                                    <Form.Label>Year</Form.Label>
                                    <Form.Select
                                        value={filters.year}
                                        onChange={(e) => setFilters({...filters, year: e.target.value})}
                                    >
                                        {Array.from({length: 5}, (_, i) => {
                                            const year = new Date().getFullYear() - i;
                                            return <option key={year} value={year}>{year}</option>;
                                        })}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className='col-md-3 d-flex align-items-end'>
                                <Button
                                    variant="primary"
                                    onClick={() => setShowModal(true)}
                                    className='w-100'
                                >
                                    Add Expense
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Summary Cards */}
            <div className='row mb-4'>
                <div className='col-md-4'>
                    <Card className='text-white bg-primary'>
                        <Card.Body>
                            <Card.Title>Total Expenses</Card.Title>
                            <h3>
                                ${filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className='col-md-4'>
                    <Card className='text-white bg-success'>
                        <Card.Body>
                            <Card.Title>Monthly Average</Card.Title>
                            <h3>
                                ${(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0) /
                                    (filters.month ? 1 : 12)).toFixed(2)}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className='col-md-4'>
                    <Card className='text-white bg-info'>
                        <Card.Body>
                            <Card.Title>Count</Card.Title>
                            <h3>{filteredExpenses.length}</h3>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/*Tabs for different views */}
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => k && setActiveTab(k)}
                className='mb-3'
            >
                <Tab eventKey="table" title="Table View">
                    <Card>
                        <Card.Body>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                        <th>Frequency</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.length > 0 ? (
                                        filteredExpenses.map((expense) => (
                                            <tr key={expense.id}>
                                                <td>{expense.name}</td>
                                                <td>${expense.amount.toFixed(2)}</td>
                                                <td className='text-capitalize'>{expense.type}</td>
                                                <td className='text-capitalize'>{expense.frequency}</td>
                                                <td>{new Date(expense.date).toLocaleDateString()}</td>
                                                <td>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(expense.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className='text-center'>
                                                No expenses found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>
                <Tab eventKey="charts" title="Charts">
                    <div className='row'>
                        <div className='col-md-6'>
                            <Card className='mb-4'>
                                <Card.Body>
                                    <Card.Title>Expenses by Category</Card.Title>
                                    <div style={{height: '300px'}}>
                                        <Pie data={prepareChartData()} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className='col-md-6'>
                            <Card className='mb-4'>
                                <Card.Body>
                                    <Card.Title>Monthly Breakdown</Card.Title>
                                    <div style={{height: '300px'}}>
                                        <Bar
                                            data={{
                                                labels: Array.from({length: 12}, (_, i) => 
                                                    new Date(0, i).toLocaleString('default', {month: 'short'})
                                                ),
                                                datasets: [{
                                                    label: 'Expenses',
                                                    data: Array.from({length: 12}, (_, i) =>
                                                    filteredExpenses
                                                        .filter(exp => new Date(exp.date).getMonth() === i)
                                                        .reduce((sum, exp) => sum + exp.amount, 0)
                                                    ),
                                                    backgroundColor: '#36A2EB'
                                                }]
                                            }}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </Tab>
            </Tabs>

            {/* Add Expense Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Expense</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{
                            name: '',
                            amount: '',
                            type: 'housing',
                            frequency: 'monthly',
                            date: new Date().toISOString().split('T')[0]
                        }}
                        validationSchema={expenseSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, handleSubmit }) => (
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Expense Name</Form.Label>
                                    <Field
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="Rent payment"
                                    />
                                    <ErrorMessage name="name" component="div" className='text-danger' />
                                </Form.Group>

                                <Form.Group className='mb-3'>
                                    <Form.Label>Amount</Form.Label>
                                    <Field
                                        type="number"
                                        name="amount"
                                        className="form-control"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                    <ErrorMessage name="amount" component="div" className='text-danger' />
                                </Form.Group>

                                <Form.Group className='mb-3'>
                                    <Form.Label>Category</Form.Label>
                                    <Field as="select" name="type" className="form-select">
                                        <option value="housing">Housing</option>
                                        <option value="food">Food</option>
                                        <option value="transportation">Transportation</option>
                                        <option value="utilities">Utilities</option>
                                        <option value="entertainment">Entertainnment</option>
                                        <option value="health">Health</option>
                                        <option value="other">Other</option>
                                    </Field>
                                </Form.Group>

                                <Form.Group className='mb-3'>
                                    <Form.Label>Frequency</Form.Label>
                                    <Field as="select" name="frequency" className="form-select">
                                        <option value="one-time">One-time</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </Field>
                                </Form.Group>

                                <Form.Group className='mb-3'>
                                    <Form.Label>Date</Form.Label>
                                    <Field 
                                        type="date"
                                        name="date"
                                        className="form-control"
                                    />
                                    <ErrorMessage name="date" component="div" className='text-danger' />
                                </Form.Group>

                                <Button
                                    variant='primary'
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='w-100'
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Expense'}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </div>
    );
} ;
export default ExpensesPage;