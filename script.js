const addtransaction=document.querySelector(".addtransaction")
const model=document.querySelector(".model")
const overlay=document.querySelector(".model .card")
const cross=document.querySelector(".cross")
addtransaction.addEventListener("click",()=>{
    model.style.display="flex"
    document.body.style.overflow = "hidden";
    cross.addEventListener("click",(e)=>{
        model.style.display="none"
        document.body.style.overflow = "";
    })
    model.addEventListener("click",()=>{
        model.style.display="none"
        document.body.style.overflow = "";
    })
    overlay.addEventListener("click",(e)=>{
        e.stopPropagation()
    })
})
const dashboard=document.querySelector(".dashboard")
const settings=document.querySelector(".settings")
const todash=document.querySelector(".todash")
const toset=document.querySelector(".toset")
toset.addEventListener("click",(e)=>{
     e.preventDefault();
    dashboard.style.display="none"
    settings.style.display="flex"
    todash.classList.remove("active")
    toset.classList.add("active")
})
todash.addEventListener("click",(e)=>{
     e.preventDefault();
    settings.style.display="none"
    dashboard.style.display="flex"
    toset.classList.remove("active")
    todash.classList.add("active")
})
const darkModeToggle = document.getElementById('darkModeToggle');
const savedDarkMode = localStorage.getItem('darkMode') === 'true';
if (savedDarkMode) {
    document.body.classList.add('dark');
    darkModeToggle.checked = true;
}

darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.body.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
    }
});

const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user'); 
            window.location.replace('login.html'); 
        });
    }
const username=document.querySelector(".username")
const settingNameInput=document.querySelector("#settingName")
const settingCurrencyInput=document.querySelector("#settingCurrency")
let userProfile = JSON.parse(localStorage.getItem('user'))
function initProfile() {
        username.innerText = userProfile.username;
        settingNameInput.value = userProfile.username;
        settingCurrencyInput.value = userProfile.currency || '$';
    }
initProfile();
let cashFlowChart = null;
function initChart() {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const ctx = document.getElementById('cashFlowChart').getContext('2d');
    cashFlowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income vs Expenses'],
            datasets: [
                {
                    label: 'Income',
                    data: [income],
                    backgroundColor: '#166534',
                    borderRadius: 6,
                    barThickness: 120,
                },
                {
                    label: 'Expenses',
                    data: [expense],
                    backgroundColor: '#991B1B',
                    borderRadius: 6,
                    barThickness: 120,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: false,
                        boxWidth: 20,
                        boxHeight: 14,
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f0eff2' },
                    ticks: {
                        callback: (val) => val.toLocaleString()
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}
function updateSummaryAndChart(list = transactions) {
    const currency = userProfile.currency || '$';
    const income = list.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = list.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    document.querySelectorAll('.container .card h3')[0].innerText = `${currency}${balance.toFixed(2)}`;
    document.querySelectorAll('.container .card h3')[1].innerText = `${currency}${income.toFixed(2)}`;
    document.querySelectorAll('.container .card h3')[2].innerText = `${currency}${expense.toFixed(2)}`;
    document.querySelectorAll('.container .card h3')[3].innerText = list.length;

    if (cashFlowChart) {
        cashFlowChart.data.datasets[0].data = [income];
        cashFlowChart.data.datasets[1].data = [expense];
        cashFlowChart.update();
    }
}
const settingsForm=document.querySelector("#settingsForm")
settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newName = settingNameInput.value;
    const newCurrency = settingCurrencyInput.value;

    if (newName !== userProfile.username) {
        const oldTransactions = localStorage.getItem(`transactions_${userProfile.username}`);
        localStorage.setItem(`transactions_${newName}`, oldTransactions || '[]');
        localStorage.removeItem(`transactions_${userProfile.username}`);
    }
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userIndex = registeredUsers.findIndex(u => u.username === userProfile.username);
    if (userIndex !== -1) {
        registeredUsers[userIndex].username = newName;
        registeredUsers[userIndex].currency = newCurrency;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }

    userProfile.username = newName;
    userProfile.currency = newCurrency;
    localStorage.setItem('user', JSON.stringify(userProfile));

    initProfile();
    updateSummaryAndChart(); 
    renderTransactions();
    alert('Settings saved successfully!');
});

document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('WARNING: This will delete all your transaction data permanently!')) {
        transactions = [];
        saveTransactions();
        updateSummaryAndChart();
        renderTransactions();
    }
});

let transactions = JSON.parse(localStorage.getItem(`transactions_${userProfile.username}`)) || [];
function saveTransactions() {
    localStorage.setItem(`transactions_${userProfile.username}`, JSON.stringify(transactions));
}

function renderTransactions(list = transactions) {
    const tbody = document.getElementById('transactionTableBody');
    const currency = userProfile.currency || '$';
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#6B7280;">No transactions found</td></tr>`;
        return;
    }

    list.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding:12px 8px; font-size:14px;">${t.date}</td>
            <td style="padding:12px 8px; font-size:14px;">${t.description}</td>
            <td style="padding:12px 8px; font-size:14px;">${t.category}</td>
            <td style="padding:12px 8px; font-size:14px; font-weight:600; color:${t.type === 'income' ? '#166534' : '#991B1B'};">
                ${t.type === 'income' ? '+' : '-'}${currency}${t.amount.toFixed(2)}
            </td>
            <td style="padding:12px 8px; display:flex; gap:8px;">
                <button onclick="editTransaction('${t.id}')" style="padding:4px 10px; border-radius:5px; border:1px solid #ddd; cursor:pointer; background:#f8f9fb;">Edit</button>
                <button onclick="deleteTransaction('${t.id}')" style="padding:4px 10px; border-radius:5px; border:1px solid #ffcccc; cursor:pointer; background:#fff5f5; color:#991B1B;">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
document.getElementById('transactionForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('txId').value;
    const type = document.getElementById('txType').value;
    const description = document.getElementById('txDescription').value;
    const amount = parseFloat(document.getElementById('txAmount').value);
    const date = document.getElementById('txDate').value;
    const category = document.getElementById('txCategory').value;

    if (id) {
        const index = transactions.findIndex(t => t.id === id);
        transactions[index] = { id, type, description, amount, date, category };
    } else {
        transactions.push({
            id: Date.now().toString(),
            type, description, amount, date, category
        });
    }

    saveTransactions();
    updateSummaryAndChart();
    renderTransactions();
    model.style.display = 'none';
    document.body.style.overflow = "";
    e.target.reset();
    document.getElementById('txId').value = '';
});
function editTransaction(id) {
    const t = transactions.find(t => t.id === id);
    document.getElementById('txId').value = t.id;
    document.getElementById('txType').value = t.type;
    document.getElementById('txDescription').value = t.description;
    document.getElementById('txAmount').value = t.amount;
    document.getElementById('txDate').value = t.date;
    document.getElementById('txCategory').value = t.category;
    model.style.display = 'flex';
    document.body.style.overflow = "hidden";
}

function deleteTransaction(id) {
    if (confirm('Delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateSummaryAndChart();
        renderTransactions();
    }
}
const searchInput = document.querySelector('.search input');
const typeFilter = document.getElementById('typeFilter');

function applyFilters() {
    const query = searchInput.value.toLowerCase();
    const type = typeFilter.value;

    const filtered = transactions.filter(t => {
        const matchSearch = t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query);
        const matchType = type === 'all' || t.type === type;
        return matchSearch && matchType;
    });

    renderTransactions(filtered);
    updateSummaryAndChart(filtered);
}

searchInput.addEventListener('input', applyFilters);
typeFilter.addEventListener('change', applyFilters);

initChart();
updateSummaryAndChart();
renderTransactions();