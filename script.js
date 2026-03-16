
const slides=document.querySelectorAll(".slide")
const container=document.getElementById("slides")

let i=0

function update(){
container.style.transform=`translateX(-${i*100}vw)`
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

document.addEventListener("keydown",e=>{
if(e.key==="ArrowRight"){ if(i<slides.length-1){i++}; update() }
if(e.key==="ArrowLeft"){ if(i>0){i--}; update() }
})

const line=document.getElementById("line")
const needle=document.getElementById("needle")

function moveThread(){

let x=10+(i*20)
let path=`M0 50 C ${x} 20 ${x} 80 ${x+10} 50`

line.setAttribute("d",path)

needle.setAttribute("cx",x+10)
needle.setAttribute("cy",50)

}

moveThread()
