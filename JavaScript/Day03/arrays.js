const numbers = [10, 25, 30, 45, 60, 75, 90];

const squares = numbers.map(num => num * num);
console.log("Squares:", squares);

const filtered = numbers.filter(num => num > 40);
console.log("Filtered (>40):", filtered);

const firstAbove50 = numbers.find(num => num > 50);
console.log("First number > 50:", firstAbove50);

const sum = numbers.reduce((acc, curr) => acc + curr, 0);
console.log("Sum:", sum);

const anyDivisibleBy5 = numbers.some(num => num % 5 === 0);
console.log("Any number divisible by 5:", anyDivisibleBy5);

const allBelow100 = numbers.every(num => num < 100);
console.log("All numbers < 100:", allBelow100);

const index = numbers.indexOf(45);
console.log("Index of 45:", index);

const values = [0, "", "Hello", null, 123, undefined, [], {}];
values.forEach(value => {
  console.log(`${JSON.stringify(value)} is ${value ? "truthy" : "falsy"}`);
});
