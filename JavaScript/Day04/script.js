let heading= document.getElementById("h1");
console.log(heading);
console.dir(heading);

heading.style.color = "red";
heading.style.backgroundColor = "yellow";

let para= document.getElementsByTagName("p");
console.log(para);

 document.querySelector("h1").textContent = "Welcome, Navneet!";

let para2 = document.querySelectorAll("p");
console.log(para2);

let div= document.querySelector("div");
console.log(div);
console.dir(div);
console.log(div.innerHTML)

//div.innerHTML = "<i>Welcome to JavaScript</i>";


let att= document.getAttribute("h2");
console.log(att);


let newBtn=document.createElement("button");
newBtn.innerHTML = "Click";
newBtn.style.backgroundColor = "blue";
newBtn.style.color = "white";
newBtn.onclick = function() {
    alert("Button clicked!");
};      


let body = document.querySelector("body");
body.appendChild(newBtn);
