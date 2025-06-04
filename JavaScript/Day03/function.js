function showPrimes(n) {

  for (let i = 2; i < n; i++) {
    if (!isPrime(i)) continue;

    console.log(i);  
  }
}

function isPrime(n) {
  for (let i = 2; i < n; i++) {
    if ( n % i == 0) return false;
  }
  return true;
}


showPrimes(10);
let result = isPrime(7);
console.log("Is 7 prime?", result); 

//arrow function

let sum = (a, b) => {  
  let result = a + b;
  return result; 
};
console.log( "Sum=",sum(2, 7) );