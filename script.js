const tablero = document.getElementById("tablero");
const size = 16;

const tiposRecursos = ["madera","oro","comida"];

let mapa=[], castillos=[], recursos=[], unidades=[];
let piezaSeleccionada=null, casillasPosibles=[];
let turnoActual=0;

// ===== JUGADORES =====
let jugadores = [
 {madera:100,oro:100,comida:100,poblacion:1},
 {madera:100,oro:100,comida:100,poblacion:1},
 {madera:100,oro:100,comida:100,poblacion:1},
 {madera:100,oro:100,comida:100,poblacion:1},
];

// ===== COSTOS =====
const costos = {
 aldeano:{madera:20,comida:10},
 caballo:{comida:30},
 arquero:{madera:30,comida:20},
 caballero:{oro:40,comida:30},
 catapulta:{madera:50,oro:50},
};

// ===== MAPA =====
function generarMapa(){
 mapa=[];
 for(let y=0;y<size;y++){
  let fila=[];
  for(let x=0;x<size;x++){
   let r=Math.random();
   if(r<0.1) fila.push("agua");
   else if(r<0.75) fila.push("llanura");
   else fila.push("montaña");
  }
  mapa.push(fila);
 }
}

// ===== CASTILLOS =====
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
  unidades.push({tipo:"aldeano",x:c.x+1,y:c.y,jugador:c.jugador,movido:false,nuevo:false});
 });
}

// ===== RECURSOS =====
function generarRecursos(){
 recursos=[];

 // cerca de castillos
 castillos.forEach(c=>{
  for(let i=0;i<4;i++){
   let nx=c.x+Math.floor(Math.random()*3)-1;
   let ny=c.y+Math.floor(Math.random()*3)-1;

   if(nx>=0&&ny>=0&&nx<size&&ny<size){
    if(mapa[ny][nx]!=="agua"){
     if(!castillos.some(cs=>cs.x===nx&&cs.y===ny)){
      recursos.push({
       x:nx,
       y:ny,
       tipo:tiposRecursos[Math.floor(Math.random()*3)]
      });
     }
    }
   }
  }
 });

 // aleatorios
 for(let i=0;i<30;i++){
  let x=Math.floor(Math.random()*size);
  let y=Math.floor(Math.random()*size);

  if(mapa[y][x]!=="agua" && mapa[y][x]!=="montaña"){
   if(!castillos.some(c=>c.x===x&&c.y===y)){
    recursos.push({
     x,
     y,
     tipo:tiposRecursos[Math.floor(Math.random()*3)]
    });
   }
  }
 }
}

// ===== DIBUJAR =====
function dibujar(){
 tablero.innerHTML="";

 for(let y=0;y<size;y++){
  for(let x=0;x<size;x++){

   const casilla=document.createElement("div");
   casilla.classList.add("casilla",mapa[y][x]);

   const r=recursos.find(e=>e.x===x&&e.y===y);
   const u=unidades.find(e=>e.x===x&&e.y===y);

   if(u){
    let uni = u.tipo==="rey"?"♔":"👷";

    if(r){
     let rec = r.tipo==="madera"?"🌲":r.tipo==="oro"?"🪙":"🍖";
     casilla.textContent = uni + rec;
    } else {
     casilla.textContent = uni;
    }

    casilla.classList.add("j"+u.jugador);
   }
   else if(r){
    casilla.textContent = r.tipo==="madera"?"🌲":r.tipo==="oro"?"🪙":"🍖";
   }

   const c=castillos.find(e=>e.x===x&&e.y===y);
   if(c && !u) casilla.textContent="🏰";

   if(casillasPosibles.some(p=>p.x===x&&p.y===y)){
    casilla.classList.add("posible");
   }

   casilla.onclick=()=>clickCelda(x,y);

   tablero.appendChild(casilla);
  }
 }

 actualizarUI();
}

// ===== MOVIMIENTO =====
function clickCelda(x,y){
 const u=unidades.find(e=>e.x===x&&e.y===y);

 if(piezaSeleccionada && esMovimientoValido(x,y)){
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
 }else{
  piezaSeleccionada=null;
  casillasPosibles=[];
 }

 dibujar();
}

function calcularMovimientos(u){
 const mov=[];
 const dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];

 dirs.forEach(d=>{
  let nx=u.x+d.x, ny=u.y+d.y;

  if(nx>=0&&ny>=0&&nx<size&&ny<size){

   if(mapa[ny][nx]==="agua") return;
   if(mapa[ny][nx]==="montaña") return;

   if(u.tipo!=="aldeano"){
    if(recursos.some(r=>r.x===nx&&r.y===ny)) return;
   }

   mov.push({x:nx,y:ny});
  }
 });

 return mov;
}

function esMovimientoValido(x,y){
 return casillasPosibles.some(c=>c.x===x&&c.y===y);
}

// ===== PRODUCCIÓN =====
function producirRecursos(){
 unidades.forEach(u=>{
  if(u.tipo==="aldeano" && u.jugador===turnoActual && !u.nuevo){
   const r=recursos.find(e=>e.x===u.x&&e.y===u.y);
   if(r){
    jugadores[turnoActual][r.tipo]+=10;
   }
  }
 });
}

// ===== BUSCAR CASILLA =====
function buscarCasillaLibre(castillo){
 for(let dx=-2;dx<=2;dx++){
  for(let dy=-2;dy<=2;dy++){
   let x=castillo.x+dx, y=castillo.y+dy;

   if(x>=0&&y>=0&&x<size&&y<size){
    if(mapa[y][x]!=="agua" &&
       mapa[y][x]!=="montaña" &&
       !unidades.some(u=>u.x===x&&u.y===y)){
        return {x,y};
    }
   }
  }
 }
 return null;
}

// ===== CONTAR UNIDADES =====
function contarUnidades(jugador, tipo){
 return unidades.filter(u=>u.jugador===jugador && u.tipo===tipo).length;
}

// ===== COMPRA =====
function procesarCompras(){

 const q = id => parseInt(document.getElementById(id)?.value||0);

 let compra = {
  aldeano:q("q_aldeano"),
  caballo:q("q_caballo"),
  arquero:q("q_arquero"),
  caballero:q("q_caballero"),
  catapulta:q("q_catapulta")
 };

 let costoTotal = {madera:0,oro:0,comida:0};

 for(let tipo in compra){
  let cant=compra[tipo];
  if(cant>0){
   let c=costos[tipo];
   for(let r in c){
    costoTotal[r]+=c[r]*cant;
   }
  }
 }

 let j = jugadores[turnoActual];

 if(j.madera<costoTotal.madera ||
    j.oro<costoTotal.oro ||
    j.comida<costoTotal.comida){

    alert("Recursos insuficientes");
    return false;
 }

 j.madera-=costoTotal.madera;
 j.oro-=costoTotal.oro;
 j.comida-=costoTotal.comida;

 let castillo = castillos.find(c=>c.jugador===turnoActual);

 for(let tipo in compra){
  for(let i=0;i<compra[tipo];i++){

   let pos = buscarCasillaLibre(castillo);
   if(!pos) continue;

   unidades.push({
    tipo:tipo,
    x:pos.x,
    y:pos.y,
    jugador:turnoActual,
    movido:false,
    nuevo:true
   });
  }
 }

 document.querySelectorAll("input").forEach(i=>i.value=0);

 return true;
}

// ===== TURNO =====
function siguienteTurno(){

 if(!procesarCompras()) return;

 producirRecursos();

 unidades.forEach(u=>u.nuevo=false);

 turnoActual=(turnoActual+1)%4;

 unidades.forEach(u=>{
  if(u.jugador===turnoActual) u.movido=false;
 });

 piezaSeleccionada=null;
 casillasPosibles=[];

 alert("Turno Jugador "+(turnoActual+1));

 dibujar();
}

// ===== UI =====
function actualizarUI(){

 if(!document.getElementById("m1")) return;

 // recursos
 document.getElementById("m1").textContent = jugadores[0].madera;
 document.getElementById("m2").textContent = jugadores[1].madera;
 document.getElementById("m3").textContent = jugadores[2].madera;
 document.getElementById("m4").textContent = jugadores[3].madera;

 document.getElementById("o1").textContent = jugadores[0].oro;
 document.getElementById("o2").textContent = jugadores[1].oro;
 document.getElementById("o3").textContent = jugadores[2].oro;
 document.getElementById("o4").textContent = jugadores[3].oro;

 document.getElementById("c1").textContent = jugadores[0].comida;
 document.getElementById("c2").textContent = jugadores[1].comida;
 document.getElementById("c3").textContent = jugadores[2].comida;
 document.getElementById("c4").textContent = jugadores[3].comida;

 // unidades
 document.getElementById("u_aldeano1").textContent = contarUnidades(0,"aldeano");
 document.getElementById("u_aldeano2").textContent = contarUnidades(1,"aldeano");
 document.getElementById("u_aldeano3").textContent = contarUnidades(2,"aldeano");
 document.getElementById("u_aldeano4").textContent = contarUnidades(3,"aldeano");

 document.getElementById("u_caballo1").textContent = contarUnidades(0,"caballo");
 document.getElementById("u_caballo2").textContent = contarUnidades(1,"caballo");
 document.getElementById("u_caballo3").textContent = contarUnidades(2,"caballo");
 document.getElementById("u_caballo4").textContent = contarUnidades(3,"caballo");

 document.getElementById("u_arquero1").textContent = contarUnidades(0,"arquero");
 document.getElementById("u_arquero2").textContent = contarUnidades(1,"arquero");
 document.getElementById("u_arquero3").textContent = contarUnidades(2,"arquero");
 document.getElementById("u_arquero4").textContent = contarUnidades(3,"arquero");

 document.getElementById("u_caballero1").textContent = contarUnidades(0,"caballero");
 document.getElementById("u_caballero2").textContent = contarUnidades(1,"caballero");
 document.getElementById("u_caballero3").textContent = contarUnidades(2,"caballero");
 document.getElementById("u_caballero4").textContent = contarUnidades(3,"caballero");

 document.getElementById("u_catapulta1").textContent = contarUnidades(0,"catapulta");
 document.getElementById("u_catapulta2").textContent = contarUnidades(1,"catapulta");
 document.getElementById("u_catapulta3").textContent = contarUnidades(2,"catapulta");
 document.getElementById("u_catapulta4").textContent = contarUnidades(3,"catapulta");

 // edificios (solo castillo por ahora)
 document.getElementById("b1").textContent = 1;
 document.getElementById("b2").textContent = 1;
 document.getElementById("b3").textContent = 1;
 document.getElementById("b4").textContent = 1;

 // turno
 document.getElementById("turno").innerHTML =
 `Turno: <span style="color:${getColorJugador(turnoActual)}">
  Jugador ${turnoActual+1}
 </span>`;
}

function getColorJugador(j){
 return ["white","cyan","yellow","orange"][j];
}

// ===== START =====
function nuevoJuego(){
 unidades=[];
 generarMapa();
 generarCastillos();
 generarRecursos();

 document.querySelectorAll("input").forEach(i=>i.value=0);

 dibujar();
}

nuevoJuego();