//import './style.css';
//
//(()=> {
//  const transactionForm = document.getElementById('transaction-form') as HTMLFormElement;
//  const amountInput = document.querySelector('input[name="amount"]') as HTMLInputElement;
//  const dateInput = document.querySelector('input[name="date"]') as HTMLInputElement;
//  const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
//  const transactionList = document.getElementById('transactionList') as HTMLUListElement;
//
//  const transactions: { 
//    amount: number, 
//    date: string, 
//    category: string 
//  }[] = [];
//
//  transactionForm.addEventListener('submit', (event) => {
//    event.preventDefault();
//
//    const amount = parseFloat(amountInput.value);
//    const date = dateInput.value;
//    const category = categorySelect.value;
//
//    if (!isNaN(amount) && date && category){
//      transactions.push({amount,date,category});
//      displayTransactions();
//      clearForm();
//    }
//});
//
//function displayTransactions(){
//  transactionList.innerHTML = "";
//  transactions.forEach(transaction => {
//    const li = document.createElement('li');
//    li.textContent = `${transaction.date} - ${transaction.amount} - ${transaction.category}`;
//    transactionList.appendChild(li);
//  });
//}
//
//function clearForm() {
//  amountInput.value = '';
//  dateInput.value = '';
//  categorySelect.value = '';
//}
//})();


if("serviceWorker" in navigator){
  try{
    const registration = await navigator.serviceWorker.register("/sw.js",{
      scope:"/",
    });
    if (registration.installing) {
      console.log("Service worker installing");
  } else if (registration.waiting) {
      console.log("Service worker installed");
  } else if (registration.active) {
      console.log("Service worker active");
  }
} catch (error) {
  console.error(`Registration failed with ${error}`);
}
}

type Transaction = {
  amount: number;
  date: string;
  category: string;
};

(() => {
  const target = {
      transactions: [] as Transaction[],
  };

  const initializeApp = () => {
      if (document.readyState === "complete") {
          const view = {
              transactions: document.getElementById(
                  "transactions",
              ) as HTMLTableSectionElement,
              transactionsForm: document.getElementById(
                  "transaction-form",
              ) as HTMLFormElement,
              handler: {
                  set(_: any, property: string, value: any) {
                      if (property === "transactions") {
                          target.transactions = value;
                          view.render(target.transactions);
                      }
                      return true;
                  },
              },
              render(transactions: Transaction[]) {
                  this.transactions.innerHTML = "";
                  let cumulative = 0;
                  for (const transaction of transactions) {
                      this.transactions.innerHTML += `
                          <tr>
                              <th scope="row">${transaction.date}</th>
                              <td>${transaction.category}</th>
                              <td>${transaction.amount}</td>
                              <td>${cumulative + transaction.amount}</td>
                          </tr>
                      `;
                      cumulative += transaction.amount;
                  }
              },
              init() {
                  this.transactionsForm.onsubmit = (e) => {
                      e.preventDefault();
                      const data = new FormData(this.transactionsForm);
                      const amount = Number(data.get("amount"));
                      const date = data.get("date")?.toString() || "";
                      const category = data.get("category")?.toString() || "";
                      controller.addTransaction(amount, date, category);
                  };
                  this.render(model.transactions);
              },
          };

          const model = new Proxy(target, view.handler);

          const controller = {
              async getTransactions() {
                  const response = await fetch("/transactions", {
                      method: "GET",
                  });
                  const data = await response.json();
                  model.transactions = data as Transaction[];
              },
              async addTransaction(amount: number, date: string, category: string) {
                  const res = await fetch("/transactions", {
                      method: "POST",
                      body: JSON.stringify({
                          amount,
                          date,
                          category,
                      }),
                  });
                  const transactions = [...model.transactions, await res.json()];
                  model.transactions = transactions;
                  view.transactionsForm.reset();
              },
              init() {
                  this.getTransactions();
                  view.init();
              },
          };

          controller.init();
      }
  };

  document.onreadystatechange = initializeApp;
})();

export {}