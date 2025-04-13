class Storage {
    static getTransactions() {
        return JSON.parse(localStorage.getItem('transactions')) || [];
    }

    static addTransaction(transaction) {
        const transactions = this.getTransactions();
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    static deleteTransaction(transactionDate) {
        const transactions = this.getTransactions();
        const updatedTransactions = transactions.filter(t => t.date !== transactionDate);
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        return updatedTransactions;
    }

    static getAllTransactions() {
        return this.getTransactions();
    }

    static getTransactionsByCategory(category) {
        return this.getTransactions().filter(t => t.category === category);
    }

    static getTransactionsByDateRange(startDate, endDate) {
        return this.getTransactions().filter(t => {
            const date = new Date(t.date);
            return date >= startDate && date <= endDate;
        });
    }

    static getBalance() {
        const transactions = this.getTransactions();
        return transactions.reduce((balance, t) => {
            return balance + (t.category === 'income' ? +t.amount : -t.amount);
        }, 0);
    }

    static getTotalIncome() {
        return this.getTransactionsByCategory('income')
            .reduce((total, t) => total + +t.amount, 0);
    }

    static getTotalExpense() {
        return this.getTransactionsByCategory('expense')
            .reduce((total, t) => total + +t.amount, 0);
    }

    static clearTransactions() {
        localStorage.removeItem('transactions');
    }
} 