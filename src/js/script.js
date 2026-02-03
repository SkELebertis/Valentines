const openBtn = document.getElementById('openBtn')
const modal = document.getElementById('modal')
const closeModal = document.getElementById('closeModal')
const choices = document.querySelectorAll('.choice')
const form = document.getElementById('answerForm')
const result = document.getElementById('result')
let selectedAnswer = null

// show hearts on initial load and refresh occasionally for a lively background
document.addEventListener('DOMContentLoaded', ()=>{
  revealHearts()
  // refresh occasionally; keep interval modest for power savings
  setInterval(revealHearts, 10000)
})

let cardAnimating = false
const card = document.getElementById('cardWrap')

openBtn.addEventListener('click', ()=>{
  if(cardAnimating) return
  cardAnimating = true
  playChime()
  // respect reduced-motion preference: skip animation and open modal directly
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    modal.setAttribute('aria-hidden','false')
    document.body.style.overflow = 'hidden'
    const first = document.querySelector('.choice')
    if(first) first.focus()
    cardAnimating = false
    return
  }

  // show card overlay
  card.style.display = 'block'
  card.setAttribute('aria-hidden','false')
  // force reflow then open lids + trigger shimmer
  void card.offsetWidth
  card.classList.add('open','shimmer')
  // stop shimmer after the animation completes
  setTimeout(()=>{ try{ card.classList.remove('shimmer') }catch(e){} }, 920)
  revealHearts()
  // wait for lids to open (matches .65s transition)
  setTimeout(()=>{
    // reveal modal
    modal.setAttribute('aria-hidden','false')
    document.body.style.overflow = 'hidden'
    const first = document.querySelector('.choice')
    if(first) first.focus()
    // hide the card overlay shortly after
    setTimeout(()=>{
      card.classList.remove('open')
      card.classList.remove('shimmer')
      card.setAttribute('aria-hidden','true')
      card.style.display = 'none'
      cardAnimating = false
    }, 200)
  }, 720)
})

closeModal.addEventListener('click', ()=>{
  modal.setAttribute('aria-hidden','true')
  document.body.style.overflow = ''
  openBtn.focus()
})

// allow Escape key to close modal for accessibility
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false'){
    modal.setAttribute('aria-hidden','true')
    document.body.style.overflow = ''
    openBtn.focus()
  }
})

choices.forEach(btn => btn.addEventListener('click', e=>{
  selectedAnswer = e.currentTarget.dataset.answer
  form.classList.remove('hidden')
  result.classList.add('hidden')
}))

form.addEventListener('submit', async (e)=>{
  e.preventDefault()
  const message = document.getElementById('message').value
  // show loading
  result.textContent = 'Sending your answer...'
  result.classList.remove('hidden')

  try{
    const payload = { answer: selectedAnswer, message }
    const res = await fetch('/api/send', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) })
    const data = await res.json()
    if(res.ok){
      result.textContent = data.message || 'Sent! 🎉'
      showConfetti()
      // close modal and restore scrolling
      modal.setAttribute('aria-hidden','true')
      document.body.style.overflow = ''
      openBtn.focus()
    }else{
      result.textContent = data.error || 'Oops, could not send.'
    }
  }catch(err){
    console.error(err)
    result.textContent = 'Network error or server is not running.'
  }
})

// Animated hearts
function revealHearts(){
  const layer = document.querySelector('.animation-layer')
  if(!layer) return
  layer.innerHTML = ''
  const baseHues = [320, 340, 350, 0, 10, 300]
  const maxHearts = window.innerWidth < 480 ? 6 : window.innerWidth < 900 ? 8 : 12
  const count = maxHearts
  for(let i=0;i<count;i++){
    const h = document.createElement('div')
    h.className = 'heart'
    h.style.left = (5 + Math.random()*90) + '%'
    h.style.top = (0 + Math.random()*80) + '%'
    h.style.animationDelay = (Math.random()*1.2) + 's'
    const hue = baseHues[Math.floor(Math.random()*baseHues.length)] + Math.floor(Math.random()*12)
    h.style.setProperty('--h', hue)
    h.style.animationDuration = (3.0 + Math.random()*2.0) + 's'
    h.style.opacity = (0.6 + Math.random()*0.28)
    layer.appendChild(h)
  }
}

// parallax via mouse/touch
let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2
let rafId = null
const updateParallax = ()=>{
  rafId = null
  document.querySelectorAll('.heart').forEach(h => {
    const rect = h.getBoundingClientRect()
    const hx = rect.left + rect.width/2
    const hy = rect.top + rect.height/2
    const dx = (mouseX - hx) * 0.02
    const dy = (mouseY - hy) * 0.02
    h.style.setProperty('--tx', dx.toFixed(2) + 'px')
    h.style.setProperty('--ty', dy.toFixed(2) + 'px')
  })
}

document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; if(!rafId) rafId = requestAnimationFrame(updateParallax) })
document.addEventListener('touchmove', e => { if(e.touches && e.touches[0]){ mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; if(!rafId) rafId = requestAnimationFrame(updateParallax) } }, {passive:true})

// gentle hue drift for a living feel
setInterval(()=> {
  document.querySelectorAll('.heart').forEach(h => {
    const current = parseFloat(h.style.getPropertyValue('--h')) || 330
    const next = (current + (Math.random()*6 - 3) + 360) % 360
    h.style.setProperty('--h', next.toFixed(2))
  })
}, 1200)

// little chime on user open
function playChime(){
  try{
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioCtx()
    const o1 = ctx.createOscillator()
    const o2 = ctx.createOscillator()
    const g = ctx.createGain()
    o1.type = 'sine'; o2.type = 'triangle'
    o1.frequency.setValueAtTime(660, ctx.currentTime)
    o2.frequency.setValueAtTime(880, ctx.currentTime)
    o1.connect(g); o2.connect(g)
    g.connect(ctx.destination)
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01)
    o1.start(); o2.start()
    o1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25)
    o2.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.25)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9)
    setTimeout(()=>{ try{o1.stop(); o2.stop(); ctx.close()}catch(e){} }, 1000)
  }catch(e){ console.warn('Audio not available', e) }
}

// Photos removed — simplified page

// No photo UI: keep the page lightweight and focused on the card modal



// ensure the primary form handler (near the top) remains active; we don't send featured photos anymore



// Simple confetti using canvas
function showConfetti(){
  const cvs = document.createElement('canvas')
  cvs.style.position = 'fixed'
  cvs.style.left = 0
  cvs.style.top = 0
  cvs.width = innerWidth
  cvs.height = innerHeight
  document.body.appendChild(cvs)
  const ctx = cvs.getContext('2d')
  const pieces = []
  for(let i=0;i<60;i++){
    pieces.push({x:Math.random()*cvs.width,y:Math.random()*-cvs.height,w:6+Math.random()*8,h:10+Math.random()*12,c:['#ff5577','#ffd1e0','#ff8fb3'][Math.floor(Math.random()*3)],vy:1.8+Math.random()*3,rot:Math.random()*360,vr:Math.random()*5})
  }
  let raf
  function render(){
    ctx.clearRect(0,0,cvs.width,cvs.height)
    pieces.forEach(p=>{
      p.y += p.vy
      p.rot += p.vr
      ctx.save()
      ctx.translate(p.x,p.y)
      ctx.rotate(p.rot*Math.PI/180)
      ctx.fillStyle = p.c
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h)
      ctx.restore()
    })
    raf = requestAnimationFrame(render)
  }
  render()
  setTimeout(()=>{cancelAnimationFrame(raf);cvs.remove()},2500)
}

// Background carousel for hero using images listed in assets/photos/photos.json
(function(){
  const hero = document.querySelector('.hero')
  if(!hero) return
  const manifest = '/assets/photos/photos.json'
  let images = []
  let idx = 0
  const intervalMs = 5000
  const fadeMs = 800
  let timer = null

  function preload(src){
    return new Promise((resolve)=>{
      const i = new Image()
      i.onload = ()=>resolve(src)
      i.onerror = ()=>resolve(null)
      i.src = src
    })
  }

  async function start(list){
    console.log('carousel: manifest loaded', list)
    images = list.map(n => `/assets/photos/${n}`)
    const loader = document.getElementById('heroLoader')
    if(loader){ loader.setAttribute('aria-hidden','false'); loader.classList.add('loading') }

    // try each image until one preloads successfully
    let foundIndex = null
    for(let i=0;i<images.length;i++){
      const src = images[i]
      console.log('carousel: trying preload', src)
      const ok = await preload(src)
      if(ok){ foundIndex = i; console.log('carousel: first usable image ->', src); break }
    }

    if(foundIndex === null){
      console.warn('carousel: no images could be preloaded, falling back to gradient')
      hero.style.setProperty('--hero-before', 'linear-gradient(180deg,#ffeff4,#ffdfea)')
      if(loader){ loader.setAttribute('aria-hidden','true'); loader.classList.remove('loading') }
      return
    }

    idx = foundIndex
    hero.style.setProperty('--hero-before', `url("${images[idx]}")`)
    hero.style.setProperty('--hero-after', `url("${images[idx]}")`)
    if(loader){ loader.setAttribute('aria-hidden','true'); loader.classList.remove('loading') }

    // reduced motion: set one image and don't auto-rotate
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // start auto rotation
    timer = setInterval(()=>{
      const nextIdx = (idx + 1) % images.length
      const next = images[nextIdx]
      // preload next
      preload(next).then((okSrc)=>{
        if(!okSrc) return
        // set the after layer to next image and trigger the crossfade
        hero.style.setProperty('--hero-after', `url("${next}")`)
        // toggle class to show after (fade-in)
        hero.classList.add('fade-hero')
        // after fade completes, move after -> before and reset class
        setTimeout(()=>{
          hero.style.setProperty('--hero-before', `url("${next}")`)
          hero.classList.remove('fade-hero')
          idx = nextIdx
        }, fadeMs + 40)
      })
    }, intervalMs)
  }

  // try to fetch the manifest; if it fails we gracefully degrade
  fetch(manifest).then(r=>r.json()).then(list=>{
    if(Array.isArray(list) && list.length) start(list)
  }).catch((err)=>{
    console.error('carousel: could not fetch manifest', err)
  })

  // expose a stop function if needed later
  window.heroCarousel = { stop: ()=>{ if(timer) clearInterval(timer); timer = null } }
})()

