
const slides=document.querySelectorAll(".slide")
const container=document.getElementById("slides")

let i=0

function update(){

container.style.transform=`translateX(-${i*100}vw)`

slides.forEach(s=>s.classList.remove("active"))
slides[i].classList.add("active")

moveThread()

}

document.getElementById("next").onclick=()=>{
if(i<slides.length-1){i++}
update()
}

document.getElementById("prev").onclick=()=>{
if(i>0){i--}
update()
}

const line=document.getElementById("line")
const needle=document.getElementById("needle")

function moveThread(){

let x=10+(i*15)

let path=`M0 50 C ${x} 20 ${x} 80 ${x+10} 50`

line.setAttribute("d",path)

needle.setAttribute("cx",x+10)
needle.setAttribute("cy",50)

}

update()
