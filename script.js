const tablero = document.getElementById("tablero");
const size = 21;

const iconos = {
 rey:"♔", aldeano:"👷", caballo:"🐎",
 arquero:"🏹", caballero:"⚔️", catapulta:"💣"
};

const tiposRecursos = ["madera","oro","comida"];

let mapa=[], castillos=[], recursos=[], unidades=[];
let turnoActual=0, piezaSeleccionada=null, casillasPosibles=[];

let jugadores = [
 {madera:100,oro:100,comida:100},
 {madera:100,oro:100,comida:100},
 {madera:100,oro:100,comida:100},
 {madera:100,oro:100,comida:100}
];

const costos = {
 aldeano:{madera:20,comida:10},
 caballo:{comida:30},
 arquero:{madera:30,comida:20},
 caballero:{oro:40,comida:30},
 catapulta:{madera:50,oro:50},
};

function generarMapa(){
 mapa=[];
 for(let y=0;y<size;y++){
  let fila=[];
  for(let x=0;x<size;x++){
   let r=Math.random();
   if(r<0.1) fila.push("agua");
   else if(r<0.85) fila.push("llanura");
   else fila.push("montaña");
  }
  mapa.push(fila);
 }
}

function generarCastillos(){
 castillos=[
  {x:1,y:1,jugador:0},
  {x:size-2,y:1,jugador:1},
  {x:1,y:size-2,jugador:2},
  {x:size-2,y:size-2,jugador:3}
 ];

 castillos.forEach(c=>{
  mapa[c.y][c.x]="llanura";
  unidades.push({tipo:"rey",x:c.x,y:c.y,jugador:c.jugador,movido:false});
  unidades.push({tipo:"aldeano",x:c.x+1,y:c.y,jugador:c.jugador,movido:false});
 });
}

function generarRecursos(){
 recursos=[];
 for(let i=0;i<60;i++){
  let x=Math.random()*size|0;
  let y=Math.random()*size|0;

  if(
   mapa[y][x]!=="agua" &&
   mapa[y][x]!=="montaña" &&
   !castillos.some(c=>c.x===x&&c.y===y)
  ){
   recursos.push({x,y,tipo:tiposRecursos[Math.random()*3|0]});
  }
 }
}

function dibujar(){
 tablero.innerHTML="";
 for(let y=0;y<size;y++){
  for(let x=0;x<size;x++){
   let c=document.createElement("div");
   c.className="casilla "+mapa[y][x];

   let r=recursos.find(e=>e.x===x&&e.y===y);
   let u=unidades.find(e=>e.x===x&&e.y===y);
   let cs=castillos.find(e=>e.x===x&&e.y===y);

   if(cs){
    if(u && u.tipo==="rey"){
     c.textContent="🏰♔";
     c.classList.add("j"+u.jugador);
    }else{
     c.textContent="🏰";
    }
   }
   else if(u){
    c.textContent=iconos[u.tipo];
    c.classList.add("j"+u.jugador);
    if(r && u.tipo==="aldeano"){
     c.textContent+= (r.tipo==="madera"?"🌲":r.tipo==="oro"?"🪙":"🍖");
    }
   }
   else if(r){
    c.textContent=r.tipo==="madera"?"🌲":r.tipo==="oro"?"🪙":"🍖";
   }

   if(casillasPosibles.some(p=>p.x===x&&p.y===y)) c.classList.add("posible");

   c.onclick=()=>clickCelda(x,y);
   tablero.appendChild(c);
  }
 }
 actualizarUI();
}

function calcularMovimientos(u){
 const dirs=[
 {x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1},
 {x:1,y:1},{x:-1,y:-1},{x:1,y:-1},{x:-1,y:1}
 ];

 let rango = (u.tipo==="caballo")?2:1;
 let mov=[];

 dirs.forEach(d=>{
  for(let i=1;i<=rango;i++){
   let nx=u.x+d.x*i, ny=u.y+d.y*i;

   if(nx>=0&&ny>=0&&nx<size&&ny<size){

    if(mapa[ny][nx]==="agua"||mapa[ny][nx]==="montaña") break;

    let esCastillo = castillos.some(c=>c.x===nx&&c.y===ny);
    if(esCastillo && u.tipo!=="rey") break;

    mov.push({x:nx,y:ny});
   }
  }
 });
 return mov;
}

function clickCelda(x,y){
 let u=unidades.find(e=>e.x===x&&e.y===y);

 if(piezaSeleccionada && casillasPosibles.some(p=>p.x===x&&p.y===y)){
  piezaSeleccionada.x=x;
  piezaSeleccionada.y=y;
  piezaSeleccionada.movido=true;
  piezaSeleccionada=null;
  casillasPosibles=[];
  dibujar();
  return;
 }

 if(u && u.jugador===turnoActual && !u.movido){
  piezaSeleccionada=u;
  casillasPosibles=calcularMovimientos(u);
 } else {
  piezaSeleccionada=null;
  casillasPosibles=[];
 }

 dibujar();
}

function siguienteJugadorActivo(){
 let intentos=0;
 do{
  turnoActual=(turnoActual+1)%4;
  intentos++;
 }while(!document.getElementById("chk"+turnoActual).checked && intentos<5);
}

function procesarCompras(resumen){
 const q=id=>parseInt(document.getElementById(id).value||0);

 let compra={
  aldeano:q("q_aldeano"),
  caballo:q("q_caballo"),
  arquero:q("q_arquero"),
  caballero:q("q_caballero"),
  catapulta:q("q_catapulta")
 };

 let costo={madera:0,oro:0,comida:0};

 for(let t in compra){
  for(let r in costos[t]){
   costo[r]+=costos[t][r]*compra[t];
  }
 }

 let j=jugadores[turnoActual];

 if(j.madera<costo.madera||j.oro<costo.oro||j.comida<costo.comida){
  alert("Recursos insuficientes");
  return false;
 }

 j.madera-=costo.madera;
 j.oro-=costo.oro;
 j.comida-=costo.comida;

 let cast=castillos.find(c=>c.jugador===turnoActual);

 for(let t in compra){
  for(let i=0;i<compra[t];i++){
   let x=cast.x+1+i, y=cast.y;
   unidades.push({tipo:t,x,y,jugador:turnoActual,movido:true});
  }
  if(compra[t]>0) resumen+=compra[t]+" "+iconos[t]+"\n";
 }

 document.querySelectorAll("input").forEach(i=>i.value=0);

 return true;
}

function siguienteTurno(){
 let resumen="Jugador "+(turnoActual+1)+":\n";

 unidades.forEach(u=>{
  if(u.tipo==="aldeano" && u.jugador===turnoActual){
   let r=recursos.find(e=>e.x===u.x&&e.y===u.y);
   if(r){
    jugadores[turnoActual][r.tipo]+=10;
    resumen+="+10 "+r.tipo+"\n";
   }
  }
 });

 if(!procesarCompras(resumen)) return;

 unidades.forEach(u=>{ if(u.jugador===turnoActual) u.movido=false; });

 siguienteJugadorActivo();

 alert(resumen+"\nTurno Jugador "+(turnoActual+1));
 dibujar();
}

function contar(j,t){
 return unidades.filter(u=>u.jugador===j&&u.tipo===t).length;
}

function actualizarUI(){
 ["madera","oro","comida"].forEach((r,i)=>{
  for(let j=0;j<4;j++){
   document.getElementById(["m","o","c"][i]+(j+1)).textContent=jugadores[j][r];
  }
 });

 for(let j=0;j<4;j++){
  document.getElementById("u_aldeano"+(j+1)).textContent=contar(j,"aldeano");
  document.getElementById("u_caballo"+(j+1)).textContent=contar(j,"caballo");
  document.getElementById("u_arquero"+(j+1)).textContent=contar(j,"arquero");
  document.getElementById("u_caballero"+(j+1)).textContent=contar(j,"caballero");
  document.getElementById("u_catapulta"+(j+1)).textContent=contar(j,"catapulta");
  document.getElementById("b"+(j+1)).textContent=1;
 }

 document.getElementById("turno").innerHTML="Turno: Jugador "+(turnoActual+1);
}

function nuevoJuego(){
 unidades=[];
 generarMapa();
 generarCastillos();
 generarRecursos();
 dibujar();
}

nuevoJuego();