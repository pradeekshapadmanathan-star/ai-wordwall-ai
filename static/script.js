let timer
let timeLeft = 60

let data
let stage = 0
let score = 0
let quizIndex = 0
let answered = false


// --------------------
// SPEECH FUNCTION
// --------------------
function speak(text){

window.speechSynthesis.cancel()

const speech = new SpeechSynthesisUtterance(text)

speech.lang="en-US"
speech.rate=1
speech.pitch=1

speechSynthesis.speak(speech)

}



// --------------------
// GET SUBTOPICS
// --------------------
function getSubtopics(){

let topic=document.getElementById("topic").value

fetch("/subtopics",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({topic:topic})
})

.then(res=>res.json())
.then(d=>{

let div=document.getElementById("subtopics")
div.innerHTML=""

d.subtopics.forEach(s=>{

let card=document.createElement("div")
card.className="card"
card.innerText=s

card.onclick=()=>loadGames(s)

div.appendChild(card)

})

})

}



// --------------------
// LOAD GAMES
// --------------------
function loadGames(subtopic){

speechSynthesis.cancel()

fetch("/games",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({subtopic:subtopic})
})

.then(res=>res.json())
.then(d=>{

data=d
stage=0
score=0
quizIndex=0

startTimer()
showQuiz()

})

}



// --------------------
// QUIZ
// --------------------
function showQuiz(){

answered=false

let g=document.getElementById("game")

let q=data.quiz[quizIndex]

speak(q.question)

g.innerHTML=`
<h2>Question ${quizIndex+1} / ${data.quiz.length}</h2>
<h3>${q.question}</h3>
<div id="explanation"></div>
`

q.options.forEach(o=>{

let div=document.createElement("div")

div.className="option"
div.innerText=o

div.onclick=()=>{

if(answered) return
answered=true

if(o===q.answer){

div.classList.add("correct")
score++

speak("Correct answer. Good job.")

}else{

div.classList.add("wrong")

speak("Wrong answer.")

}

showExplanation(q.explanation)

}

g.appendChild(div)

})

navigation()

}



// --------------------
// EXPLANATION
// --------------------
function showExplanation(text){

let box=document.getElementById("explanation")

box.innerHTML="<b>Explanation:</b> "+text

speak(text)

}



// --------------------
// MATCH GAME
// --------------------
function showMatch(){

speechSynthesis.cancel()

let g=document.getElementById("game")

g.innerHTML="<h2>Match the Following</h2>"

let container=document.createElement("div")
container.className="match-container"

let leftDiv=document.createElement("div")
let rightDiv=document.createElement("div")

let rightItems=data.match.map(m=>m.right)
rightItems.sort(()=>Math.random()-0.5)

data.match.forEach(m=>{

let left=document.createElement("div")
left.className="match"
left.innerText=m.left
left.dataset.value=m.left

left.onclick=()=>{

document.querySelectorAll(".match").forEach(x=>x.classList.remove("selected"))
left.classList.add("selected")

}

leftDiv.appendChild(left)

})

rightItems.forEach(r=>{

let right=document.createElement("div")
right.className="match"
right.innerText=r

right.onclick=()=>{

let selected=document.querySelector(".selected")
if(!selected) return

let correct=data.match.find(x=>x.left===selected.dataset.value)

if(correct.right===r){

selected.style.background="lightgreen"
right.style.background="lightgreen"

score++

speak("Correct match")

}else{

selected.style.background="salmon"
right.style.background="salmon"

speak("Wrong match")

}

selected.classList.remove("selected")

}

rightDiv.appendChild(right)

})

container.appendChild(leftDiv)
container.appendChild(rightDiv)

g.appendChild(container)

navigation()

}



// --------------------
// DRAG DROP
// --------------------
function showDrag(){

speechSynthesis.cancel()

let g=document.getElementById("game")

g.innerHTML="<h2>Drag items to correct category</h2>"

let categories=[...new Set(data.drag_drop.map(d=>d.category))]

let catContainer=document.createElement("div")
catContainer.className="category-container"

categories.forEach(cat=>{

let box=document.createElement("div")
box.className="drop"
box.innerText=cat

box.ondragover=e=>e.preventDefault()

box.ondrop=e=>{

e.preventDefault()

let item=e.dataTransfer.getData("cat")

if(item===cat){

box.style.background="lightgreen"
score++

speak("Correct drop")

}else{

box.style.background="salmon"

speak("Wrong category")

}

}

catContainer.appendChild(box)

})

g.appendChild(catContainer)

let itemContainer=document.createElement("div")
itemContainer.className="drag-container"

data.drag_drop.forEach(d=>{

let item=document.createElement("div")
item.className="drag"
item.innerText=d.item
item.draggable=true

item.ondragstart=e=>{
e.dataTransfer.setData("cat",d.category)
}

itemContainer.appendChild(item)

})

g.appendChild(itemContainer)

navigation()

}



// --------------------
// NAVIGATION
// --------------------
function navigation(){

let nav=document.getElementById("navigation")
nav.innerHTML=""

let prev=document.createElement("button")
prev.innerText="Previous"

prev.onclick=()=>{

speechSynthesis.cancel()

if(stage===0){

if(quizIndex>0){
quizIndex--
showQuiz()
}

}else{

stage--
render()

}

}



let next=document.createElement("button")
next.innerText="Next"

next.onclick=()=>{

speechSynthesis.cancel()

if(stage===0){

quizIndex++

if(quizIndex>=data.quiz.length){

stage=1
render()

}else{

showQuiz()

}

}

else if(stage===1){

stage=2
render()

}

else if(stage===2){

stage=3
render()

}

}

nav.appendChild(prev)
nav.appendChild(next)

}



// --------------------
// RENDER
// --------------------
function render(){

if(stage===1){
showMatch()
}
else if(stage===2){
showDrag()
}
else{
showScore()
}

}



// --------------------
// SCORE
// --------------------
function showScore(){

speechSynthesis.cancel()

clearInterval(timer)

document.getElementById("game").innerHTML=""
document.getElementById("navigation").innerHTML=""

let scoreBox=document.getElementById("scoreboard")

scoreBox.innerHTML=`
<h2>Game Completed 🎉</h2>
<div class="score">Final Score: ${score}</div>
<button onclick="location.reload()">Play Again</button>
`

speak("Game completed. Your score is " + score)

}



// --------------------
// TIMER
// --------------------
function startTimer(){

clearInterval(timer)

timeLeft=60

let timerBox=document.getElementById("timer")

timer=setInterval(()=>{

timeLeft--

timerBox.innerText="⏱ Time: "+timeLeft+"s"

if(timeLeft<=0){

clearInterval(timer)

speechSynthesis.cancel()

stage++
render()

}

},1000)

}