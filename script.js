const tablero = document.getElementById("tablero");
const size = 14;

const terrenos = ["agua","llanura","montaña"];
const tiposRecursos = ["madera","oro","comida"];

let mapa=[], castillos=[], recursos=[], unidades=[];
let piezaSeleccionada=null, casillasPosibles=[];
let turnoActual=0;

// jugadores
let jugadores = [
 {madera:100,oro:100,comida:100,poblacion:1},
 {madera:100,oro:100,comida:100,poblacion:1},
 {madera:100,oro:100,comida:100,poblacion:1},
 {madera:100,oro:100,comida:100,poblacion:1},
];

// ===== MAPA (menos agua) =====
function generarMapa(){
 mapa=[];
 for(let y=0;y<size;y++){
  let fila=[];
  for(let x=0;x<size;x++){
   let r=Math.random();
   if(r<0.15) fila.push("agua"); // menos agua
   else if(r<0.75) fila.push("llanura");
   else fila.push("montaña");
  }
  mapa.push(fila);
 }
}

// ===== CASTILLOS + REY + ALDEANO =====
function generarCastillos(){
 castillos=[
  {x:1,y:1,jugador:0},
  {x:size-2,y:1,jugador:1},
  {x:1,y:size-2,jugador:2},
  {x:size-2,y:size-2,jugador:3}
 ];

 castillos.forEach(c=>{
  mapa[c.y][c.x]="llanura";

  // rey
  unidades.push({tipo:"rey",x:c.x,y:c.y,jugador:c.jugador,movido:false});

  // aldeano cerca
  unidades.push({
   tipo:"aldeano",
   x:c.x+1,
   y:c.y,
   jugador:c.jugador,
   movido:false
  });
 });
}

// ===== RECURSOS =====
function generarRecursos(){
 recursos=[];

 castillos.forEach(c=>{
  for(let i=0;i<4;i++){
   let nx=c.x+Math.floor(Math.random()*3)-1;
   let ny=c.y+Math.floor(Math.random()*3)-1;

   if(nx>=0&&ny>=0&&nx<size&&ny<size){
    if(mapa[ny][nx]!=="agua"){
     recursos.push({
      x:nx,y:ny,
      tipo:tiposRecursos[Math.floor(Math.random()*3)]
     });
    }
   }
  }
 });

 for(let i=0;i<25;i++){
  let x=Math.floor(Math.random()*size);
  let y=Math.floor(Math.random()*size);

  if(mapa[y][x]!=="agua"){
   recursos.push({
    x,y,
    tipo:tiposRecursos[Math.floor(Math.random()*3)]
   });
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
   if(r){
    casilla.classList.add(r.tipo);
    if(r.tipo==="madera") casilla.textContent="🌲";
    if(r.tipo==="oro") casilla.textContent="🪙";
    if(r.tipo==="comida") casilla.textContent="🍖";
   }

   const c=castillos.find(e=>e.x===x&&e.y===y);
   if(c) casilla.textContent="🏰";

   const u=unidades.find(e=>e.x===x&&e.y===y);
   if(u){
    casilla.textContent = u.tipo==="rey" ? "♔" : "👷";
    casilla.classList.add("j"+u.jugador);
   }

   if(casillasPosibles.some(p=>p.x===x&&p.y===y)){
    casilla.classList.add("posible");
   }

   casilla.onclick=()=>clickCelda(x,y);

   tablero.appendChild(casilla);
  }
 }

 actualizarUI();
}

// ===== CLICK =====
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

// ===== MOVIMIENTO =====
function calcularMovimientos(u){
 const mov=[];
 const dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];

 dirs.forEach(d=>{
  let nx=u.x+d.x;
  let ny=u.y+d.y;

  if(nx>=0&&ny>=0&&nx<size&&ny<size){

   if(mapa[ny][nx]==="agua") return;

   // REGLA: aldeano sí puede entrar a recursos
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
  if(u.tipo==="aldeano" && u.jugador===turnoActual){

   const r=recursos.find(e=>e.x===u.x&&e.y===u.y);
   if(r){
    jugadores[turnoActual][r.tipo]+=10;
   }
  }
 });
}

// ===== TURNO =====
function siguienteTurno(){

 // producir antes de cambiar turno
 producirRecursos();

 turnoActual=(turnoActual+1)%4;

 unidades.forEach(u=>{
  if(u.jugador===turnoActual){
   u.movido=false;
  }
 });

 piezaSeleccionada=null;
 casillasPosibles=[];
 dibujar();
}

// ===== UI =====
function actualizarUI(){

 for(let i=0;i<4;i++){
  document.getElementById("j"+(i+1)).innerHTML =
  `<td style="color:${getColorJugador(i)}">J${i+1}</td>
   <td>${jugadores[i].madera}</td>
   <td>${jugadores[i].oro}</td>
   <td>${jugadores[i].comida}</td>
   <td>${jugadores[i].poblacion}</td>`;
 }

 document.getElementById("turno").innerHTML =
 `Turno: <span style="color:${getColorJugador(turnoActual)}">Jugador ${turnoActual+1}</span>`;
}

function getColorJugador(j){
 return ["white","cyan","yellow","orange"][j];
}

// ===== CONTROL =====
function nuevoJuego(){
 unidades=[];
 generarMapa();
 generarCastillos();
 generarRecursos();
 dibujar();
}

function reiniciarJuego(){
 nuevoJuego();
}

// START
nuevoJuego();