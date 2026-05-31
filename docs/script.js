(function(){
  const slides=[...document.querySelectorAll('.slide')];
  const total=slides.length;
  let i=0;
  const cur=document.getElementById('cur');
  const tot=document.getElementById('tot');
  const prog=document.getElementById('progress');
  const dots=document.getElementById('dots');
  tot.textContent=String(total).padStart(2,'0');

  slides.forEach((_,n)=>{
    const d=document.createElement('i');
    d.addEventListener('click',()=>go(n));
    dots.appendChild(d);
  });
  const dotEls=[...dots.children];

  function go(n){
    i=Math.max(0,Math.min(total-1,n));
    slides.forEach((s,k)=>s.classList.toggle('active',k===i));
    dotEls.forEach((d,k)=>d.classList.toggle('on',k===i));
    cur.textContent=String(i+1).padStart(2,'0');
    prog.style.width=((i+1)/total*100)+'%';
  }
  function next(){go(i+1)}
  function prev(){go(i-1)}

  document.getElementById('next').addEventListener('click',next);
  document.getElementById('prev').addEventListener('click',prev);
  document.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();next();}
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();prev();}
    else if(e.key==='Home'){go(0);}
    else if(e.key==='End'){go(total-1);}
    else if(e.key==='f'||e.key==='F'){
      if(!document.fullscreenElement)document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  // swipe (touch)
  let x0=null;
  document.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
  document.addEventListener('touchend',e=>{
    if(x0===null)return;
    const dx=e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>60){dx<0?next():prev();}
    x0=null;
  },{passive:true});

  go(0);
})();
