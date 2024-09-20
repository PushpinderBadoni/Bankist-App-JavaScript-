"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

//User name: Initials of name

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements; //This decides weather the movements will be sorted or not...also sorts the movements.
  //used slice because we wanted a copy of movements array as sort will change the original movements array.

  //for-each loop that iterates over the movement array of the object
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal"; //setting the type of movement of amount

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        
          <div class="movements__value">${mov}€</div>
        </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html); //check mdn for this.
  }); //forEach loop ends
};

//accs is an array, where we input accounts array
//acc is each account element of accounts arrays
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase() //convert the string into lower case
      .split(" ") //seperate the name based on location of space,  the split method return an array, so we get the first name, middle name and the last name as elements of an array
      .map(function (name) {
        return name[0];
      }) //directly implementing the map method on the array which was received after the split method, as the map method returns an array, so we receive an array which has the 1st letter of all the name elements of array which was returned after split method
      .join(""); //joining the array elements of array
  });
};
//here we got changes in the original array, bcz the array has objects that is a reference type

createUsernames(accounts);
console.log(accounts);

const calcDisplayBalance = function (acc) {
  const balance = acc.movements.reduce(function (acc, mov) {
    return (acc += mov);
  }, 0);
  acc.balance = balance;
  labelBalance.textContent = `${balance}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc - mov, 0);

  labelSumOut.textContent = `${out}€`;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100) //making a new array with just interset of each deposit
    .filter((int) => int >= 1) //interest less than 1€ is neglected
    .reduce((acc, mov) => acc + mov, 0); //sum of interest

  labelSumInterest.textContent = `${interest}€`;
};

// const account = accounts.find((acc) => acc.owner === "Jessica Davis");
// console.log(account);

//Event Handlers
let currentAccount;

const updateUI = function (acc) {
  //Display movements
  displayMovements(acc.movements);
  //Display balance
  calcDisplayBalance(acc);
  //Display summary
  calcDisplaySummary(acc);
};

btnLogin.addEventListener("click", function (e) {
  //Prevent FORM from submitting - the arrow button on the login page is a submit button of a form, every time clicked, it reloades the page, to avoid that we write the next line.
  e.preventDefault();

  //the value to currentAccount will be assigned as soon as the user log-in
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  ); //checking if the account exists
  console.log(currentAccount);

  //used optinal chaining ?.
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //if condition is true, display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;
    //Clear the input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    //update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  ); //checking if the input username exists by comparing it to username of all objects

  inputTransferAmount.value = inputTransferTo.value = "";
  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //update UI
    updateUI(currentAccount);
  }
});

//For LOAN- Our bank has a rule that it approves loan only if the user have atleast one deposit with atleast 10 percent of the loan ammount
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    //Add movement
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    ); //we pass a condition to this 🟠FINDINDEX🟠 method, the first element ehich matches this condition, the method returns it's index.

    //Delete account
    accounts.splice(index, 1);

    //hiding the UI after user deletes the account
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

//Implementing sorting functionalility
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
