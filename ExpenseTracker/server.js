const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// In-memory storage for expenses
let expenses = [
  { id: 1, description: 'Groceries', amount: 200.00, category: 'Food', date: '2025-06-15', type: 'expense' },
  { id: 2, description: 'Salary', amount: 30000.00, category: 'Income', date: '2025-06-01', type: 'income' },
  { id: 3, description: 'Coffee', amount: 140.00, category: 'Food', date: '2025-06-16', type: 'expense' },
  { id: 4, description: 'Gas', amount: 450.00, category: 'Transportation', date: '2025-06-14', type: 'expense' }
];

let nextId = 5;

const categories = {
  expense: ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Other'],
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all expenses
app.get('/api/expenses', (req, res) => {
  const { category, type, startDate, endDate } = req.query;
  let filteredExpenses = expenses;

  if (category) {
    filteredExpenses = filteredExpenses.filter(e => e.category === category);
  }
  
  if (type) {
    filteredExpenses = filteredExpenses.filter(e => e.type === type);
  }
  
  if (startDate) {
    filteredExpenses = filteredExpenses.filter(e => e.date >= startDate);
  }
  
  if (endDate) {
    filteredExpenses = filteredExpenses.filter(e => e.date <= endDate);
  }

  res.json(filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Get expense statistics
app.get('/api/stats', (req, res) => {
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;
  
  // Category breakdown
  const expensesByCategory = {};
  expenses.filter(e => e.type === 'expense').forEach(e => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });

  // Monthly breakdown
  const monthlyData = {};
  expenses.forEach(e => {
    const month = e.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 };
    }
    monthlyData[month][e.type === 'income' ? 'income' : 'expenses'] += e.amount;
  });

  res.json({
    totalIncome,
    totalExpenses,
    balance,
    expensesByCategory,
    monthlyData,
    totalTransactions: expenses.length
  });
});

// Add new expense/income
app.post('/api/expenses', (req, res) => {
  const { description, amount, category, type } = req.body;
  
  if (!description || !amount || !category || !type) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }

  if (!categories[type] || !categories[type].includes(category)) {
    return res.status(400).json({ error: 'Invalid category for this type' });
  }

  const newExpense = {
    id: nextId++,
    description,
    amount: parseFloat(amount),
    category,
    type,
    date: new Date().toISOString().split('T')[0]
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

// Update expense
app.put('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { description, amount, category, type } = req.body;
  
  const expense = expenses.find(e => e.id === id);
  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  if (description) expense.description = description;
  if (amount && amount > 0) expense.amount = parseFloat(amount);
  if (category && categories[expense.type].includes(category)) expense.category = category;

  res.json(expense);
});

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const expenseIndex = expenses.findIndex(e => e.id === id);
  
  if (expenseIndex === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  expenses.splice(expenseIndex, 1);
  res.status(204).send();
});

// Get categories
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.listen(PORT, () => {
  console.log(`Expense Tracker running at http://localhost:${PORT}`);
});

module.exports = app;