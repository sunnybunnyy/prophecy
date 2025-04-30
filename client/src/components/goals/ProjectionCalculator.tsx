import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

const ProjectionCalculator: React.FC<{
    currentAmount: number;
    monthlyContribution: number;
    annualContribution: number;
}> = ({ currentAmount, monthlyContribution, annualContribution }) =>
{
    const [years, setYears] = useState(5);
    const [rate, setRate] = useState(5);
    const [projectedAmount, setProjectedAmount] = useState(0);

    const calculateProjection = () => {
        let amount = currentAmount;
        const monthlyRate = Math.pow(1 + rate / 100, 1 / 12) - 1;

        for (let month = 1; month <= years * 12; month++) {
            // Add monthly contribution
            amount += monthlyContribution;

            // Add annual contribution in January
            if (month % 12 === 1) {
                amount += annualContribution;
            }

            // Apply monthly interest
            amount *= (1 + monthlyRate);
        }

        setProjectedAmount(amount);
    };

    return (
        <Card className='mt-4'>
            <Card.Header>
                <h5>Projection Calculator</h5>
            </Card.Header>
            <Card.Body>
                <Form>
                    <Form.Group className='mb-3'>
                        <Form.Label>Years to Project</Form.Label>
                        <Form.Control
                            type="number"
                            value={years}
                            onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                            min="1"
                            max="30"
                        />
                    </Form.Group>

                    <Form.Group className='mb-3'>
                        <Form.Label>Annual Growth Rate (%)</Form.Label>
                        <Form.Control
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                            min="0"
                            max="20"
                            step="0.1"
                        />
                    </Form.Group>

                    <Button variant="primary" onClick={calculateProjection}>
                        Calculate
                    </Button>
                </Form>

                {projectedAmount > 0 && (
                    <div className='mt-3'>
                        <h6>Projected Value in {years} Years:</h6>
                        <h4>${projectedAmount.toFixed(2)}</h4>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default ProjectionCalculator;