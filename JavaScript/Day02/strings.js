let str = "JavaScript is awesome!";
let vowels = "aeiouAEIOU";
let count = 0;

for (let i = 0; i < str.length; i++) {
  if (vowels.includes(str[i])) {
    count++;
  }
}

console.log("Vowel count:", count);
