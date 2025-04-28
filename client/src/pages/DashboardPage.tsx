import { useEffect, useState } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

Chart.register(...registerables)

const DashboardPage = () => {
    const { user } = useAuth()
    const [goals, setGoals] = useState<any[]>([])
    const [expenses, setExpenses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [goalsRes, expensesRes] = await Promise.all([
                    api.get('/goals'),
                    api.get('/expenses')
                ])
                setGoals(goalsRes.data)
                setExpenses(expensesRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div>Loading...</div>

    const goalsData = {
        labels: goals.map(goal => goal.name),
        datasets: [
            {
                label: 'Current Amount',
                data: goals.map(goal => goal.currentAmount),
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            },
            {
                label: 'Target Amount',
                data: goals.map(goal => goal.targetAmount),
                backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }
        ]
    }

    const expensesData = {
        labels: expenses.map(expense => expense.name),
        datasets: [
            { data: expenses.map(expense =>expense.amount),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#8AC24A', '#FF6B6B', '#47B8E0', '#7A7A7A'
                ]
            }
        ]
    }

    return (
        <div>
            <h1>Welcome, {user?.name}</h1>

            <div className='row mt-4'>
                <div className='col-md-6'>
                    <div className='card'>
                        <div className='card-header'>
                            <h3>Goals Progress</h3>
                        </div>
                        <div className='card-body'>
                            <Bar data={goalsData} />
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className='card'>
                        <div className='card-header'>
                            <h3>Expenses Breakdown</h3>
                        </div>
                        <div className='card-body'>
                            <Pie data={expensesData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage