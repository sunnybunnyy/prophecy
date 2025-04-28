import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useState } from "react";

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Name is required')
            .min(2, 'Name must be at least 2 characters'),
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                'Password must contain at least one uppercase, one lowercase, one number and one special character'
            ),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Password must match')
            .required('Please confirm your password')
    });

    return (
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title text-center mb-4">Create Account</h2>
                        <p className="text-muted text-center mb-4">
                            Start planning your financial future
                        </p>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <Formik
                            initialValues={{
                                name: '',
                                email: '',
                                password: '',
                                confirmPassword: ''
                            }}
                            validationSchema={validationSchema}
                            onSubmit={async (values, { setSubmitting }) => {
                                try {
                                    await register(values.name, values.email, values.password);
                                    navigate('/');
                                } catch (err) {
                                    setError('Registration failed. Please try again.');
                                    console.error(err);
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ isSubmitting, errors, touched }) => (
                                <Form>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">
                                            Full Name
                                        </label>
                                        <Field
                                            type="text"
                                            name="name"
                                            className={`form-control ${
                                                errors.name && touched.name ? 'is-invalid' : ''
                                            }`}
                                            placeholder="John Doe"
                                        />
                                        <ErrorMessage
                                            name="name"
                                            component="div"
                                            className="invalid-feedback"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email Address
                                        </label>
                                        <Field
                                            type="email"
                                            name="email"
                                            className={`form-control ${
                                                errors.email && touched.email ? 'is-invalid' : ''
                                            }`}
                                            placeholder="john@example.com"
                                        />
                                        <ErrorMessage
                                            name="email"
                                            component="div"
                                            className="invalid-feedback"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">
                                            Password
                                        </label>
                                        <Field
                                            type="password"
                                            name="password"
                                            className={`form-control ${
                                                errors.password && touched.password ? 'is-invalid' : ''
                                            }`}
                                            placeholder="••••••••"
                                        />
                                        <ErrorMessage 
                                            name="password"
                                            component="div"
                                            className="invalid-feedback"
                                        />
                                        <div className="form-text">
                                            Minimum 8 characters with uppercase, lowercase, number and special character
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="confirmPassword" className="form-label">
                                            Confirm Password
                                        </label>
                                        <Field
                                            type="password"
                                            name="confirmPassword"
                                            className={`form-control ${
                                                errors.confirmPassword && touched.confirmPassword
                                                    ? 'is-invalid'
                                                    : ''
                                            }`}
                                            placeholder="••••••••"
                                        />
                                        <ErrorMessage
                                            name="confirmPassword"
                                            component="div"
                                            className="invalid-feedback"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn btn-primary w-100 py-2 mb-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Creating Account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>

                                    <p className="text-center text-muted mt-3">
                                        Already have an account?{' '}
                                        <a href="/login" className="text-decoration-none">
                                            Sign in
                                        </a>
                                    </p>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;