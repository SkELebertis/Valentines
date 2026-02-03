document.addEventListener('DOMContentLoaded', ()=>{

const modal=document.getElementById('modal')
const openBtn=document.getElementById('openBtn')
const closeBtn=document.getElementById('closeModal')
const yesBtn=document.getElementById('yesBtn')
const result=document.getElementById('result')

openBtn.onclick=()=>modal.setAttribute('aria-hidden','false')
closeBtn.onclick=()=>modal.setAttribute('aria-hidden','true')

yesBtn.onclick=()=>{
emailjs.send("RalphRusselV","template_83bh1rg",{
message:"She said YES 💘"
}).then(()=>{
result.textContent="your YES has been delivered 💌"
result.classList.remove('hidden')
})
}

/* FX */

const fx=document.getElementById('fxLayer')

setInterval(()=>{
const p=document.createElement('div')
p.className='petal'
p.style.left=Math.random()*100+'vw'
p.style.animationDuration=(7+Math.random()*6)+'s'
fx.appendChild(p)
setTimeout(()=>p.remove(),12000)
},900)

setInterval(()=>{
const h=document.createElement('div')
h.className='float-heart'
h.style.left=Math.random()*100+'vw'
h.style.bottom='-20px'
h.style.animationDuration=(8+Math.random()*5)+'s'
fx.appendChild(h)
setTimeout(()=>h.remove(),12000)
},1400)

})
