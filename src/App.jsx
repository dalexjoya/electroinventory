import { useState, useEffect, useMemo, useRef } from "react";
import { database, ref, set, update, remove, onValue, off } from "./firebase";

// ─── CATEGORY META ───────────────────────────────────────────────────────────
const CAT_META = {
  "Circuitos Integrados": { color: "#f59e0b", icon: "◈" },
  "Transistores": { color: "#10b981", icon: "⊳" },
  "Diodos": { colxor: "#ef4444", icon: "▷" },
  "Resistencias": { color: "#f97316", icon: "⊟" },
  "Capacitores": { color: "#3b82f6", icon: "||" },
  "Inductores": { color: "#8b5cf6", icon: "∿" },
  "Cristales": { color: "#06b6d4", icon: "◇" },
  "Modulos y Pantallas": { color: "#6366f1", icon: "⬡" },
  "Otros": { color: "#84cc16", icon: "⬢" },
};
function catMeta(name) {
  return CAT_META[name] || { color: "#64748b", icon: "◉" };
}

// ─── INITIAL DATA (same as before) ────────────────────────────────────────────
const INITIAL_DATA = {
  "Circuitos Integrados": { ...catMeta("Circuitos Integrados"), subcats: {
    "Op Amps": { items: [
      {part:"TL082",qty:0,spec:"Dual JFET DIP-8"},{part:"TL084",qty:3,spec:"Quad JFET DIP-14"},
      {part:"LM324",qty:1,spec:"Quad DIP-14"},{part:"LM358",qty:4,spec:"Dual DIP-8"},
      {part:"LM386",qty:2,spec:"Audio Amp DIP-8"},{part:"LM741",qty:7,spec:"Single DIP-8"},
    ]},
    "Comparadores": { items: [{part:"LM339",qty:2,spec:"Quad DIP-14"}]},
    "Compuertas Lógicas": { items: [
      {part:"74LS00",qty:2,spec:"NAND 4x2"},{part:"74LS02",qty:2,spec:"NOR 4x2"},
      {part:"74LS04",qty:1,spec:"NOT 6x"},{part:"74LS08",qty:2,spec:"AND 4x2"},
      {part:"74LS10",qty:1,spec:"NAND 3x3"},{part:"74LS11",qty:1,spec:"AND 3x3"},
      {part:"74LS32",qty:1,spec:"OR 4x2"},{part:"74LS86",qty:3,spec:"XOR 4x2"},
      {part:"74LS125",qty:1,spec:"Buffer 3-State"},{part:"74LS266",qty:5,spec:"XNOR 4x2"},
      {part:"CD4011",qty:1,spec:"CMOS NAND 4x2"},{part:"74HC147",qty:1,spec:"Codificador 10-a-4"},
    ]},
    "PLDs": { items: [{part:"GAL16V8D",qty:0,spec:"SPLD 20 pines"},{part:"GAL22V10D",qty:1,spec:"SPLD 24 pines"}]},
    "Compuertas Analógicas": { items: [{part:"CD4016",qty:1,spec:"Quad bilateral switch"},{part:"CD4066",qty:1,spec:"Quad bilateral switch"}]},
    "Contadores": { items: [{part:"74LS191",qty:1,spec:"Up/Down BCD"},{part:"74LS193",qty:1,spec:"Up/Down Binario"},{part:"CD4017",qty:1,spec:"Decádico CMOS"}]},
    "Registros": { items: [{part:"74LS194",qty:2,spec:"4-bit bidireccional"}]},
    "Flip-Flops": { items: [{part:"74LS112N",qty:4,spec:"JK Dual DIP-16"}]},
    "Microcontroladores": { items: [
      {part:"AT89S52",qty:2,spec:"8051 8KB Flash DIP-40"},{part:"AT89S8252",qty:1,spec:"8051 8KB+2KB DIP-40"},
      {part:"ESP32",qty:1,spec:"Xtensa LX6 WiFi/BT"},{part:"KL25",qty:1,spec:"ARM Cortex-M0+"},
    ]},
    "Memorias": { items: [{part:"AT28C64",qty:1,spec:"EEPROM 64K DIP-28"}]},
    "Reguladores": { items: [
      {part:"7805",qty:0,spec:"+5V 1A TO-220"},{part:"7812",qty:0,spec:"+12V 1A TO-220"},
      {part:"7905",qty:1,spec:"-5V 1A TO-220"},{part:"7912",qty:0,spec:"-12V 1A TO-220"},
      {part:"LM317",qty:1,spec:"Adj. 1.2-37V TO-220"},{part:"178M05T",qty:1,spec:"+5V 500mA SOT-89"},
    ]},
    "Moduladores - Demoduladores": { items: [{part:"MC1496P",qty:1,spec:"Balanced Modulator DIP-14"}]},
    "Generales": { items: [{part:"LM3915",qty:1,spec:"Dot/Bar Display Driver"}]},
  }},
  "Transistores": { ...catMeta("Transistores"), subcats: {
    "BJT PNP": { items: [
      {part:"A1015",qty:20,spec:"PNP 150mA 50V TO-92"},{part:"BC327",qty:17,spec:"PNP 800mA 45V TO-92"},
      {part:"BC517",qty:20,spec:"PNP Darlington TO-92"},{part:"BC547",qty:18,spec:"NPN 100mA 45V TO-92"},
      {part:"BC548",qty:19,spec:"NPN 100mA 30V TO-92"},{part:"BC549",qty:18,spec:"NPN 30mA 30V TO-92"},
      {part:"BC550",qty:20,spec:"NPN 100mA 45V TO-92"},{part:"BC556",qty:20,spec:"PNP 100mA 65V TO-92"},
      {part:"BC557",qty:17,spec:"PNP 100mA 45V TO-92"},{part:"BC558",qty:19,spec:"PNP 100mA 30V TO-92"},
    ]},
    "BJT NPN": { items: [
      {part:"BC337",qty:19,spec:"NPN 800mA 45V TO-92"},{part:"C945",qty:20,spec:"NPN 150mA 60V TO-92"},
      {part:"C1815",qty:17,spec:"NPN 150mA 60V TO-92"},{part:"S8050",qty:24,spec:"NPN 700mA 25V TO-92"},
      {part:"S8550",qty:20,spec:"PNP 700mA 25V TO-92"},{part:"S9012",qty:19,spec:"PNP 500mA 25V TO-92"},
      {part:"S9013",qty:19,spec:"NPN 500mA 25V TO-92"},{part:"S9014",qty:19,spec:"NPN 100mA 45V TO-92"},
      {part:"S9015",qty:20,spec:"PNP 100mA 45V TO-92"},{part:"2N2222",qty:7,spec:"NPN 600mA 40V TO-18"},
      {part:"2N3904",qty:4,spec:"NPN 200mA 40V TO-92"},{part:"2N5401",qty:20,spec:"PNP 600mA 150V TO-92"},
      {part:"2N5551",qty:19,spec:"NPN 600mA 160V TO-92"},
    ]},
    "Potencia": { items: [
      {part:"TIP41C",qty:3,spec:"NPN 6A 100V TO-220"},{part:"TIP42C",qty:1,spec:"PNP 6A 100V TO-220"},
      {part:"TIP48C",qty:1,spec:"NPN 1A 300V TO-220"},{part:"2N4920",qty:1,spec:"PNP 4A 40V TO-220"},
    ]},
    "MOSFET Canal N": { items: [
      {part:"IRFZ24N",qty:4,spec:"N-CH 17A 55V TO-220"},{part:"2N7000",qty:6,spec:"N-CH 200mA 60V TO-92"},
    ]},
    "JFET Canal N": { items: [{part:"2N5457",qty:1,spec:"5mA 25V TO-92"}]},
    "Especiales": { items: [{part:"Fototransistor",qty:3,spec:"Encapsulado Tipo LED 5mm resina oscura"}]},
  }},
  "Diodos": { ...catMeta("Diodos"), subcats: {
    "LEDs": { items: [
      {part:"LED Amarillo",qty:0,spec:"5mm 2V 20mA"},{part:"LED Azul",qty:0,spec:"5mm 3.2V 20mA"},
      {part:"LED Rojo",qty:0,spec:"5mm 2V 20mA"},{part:"LED Blanco",qty:0,spec:"5mm 3.2V 20mA"},
    ]},
    "Infrarrojos": { items: [{part:"LED Infrarrojo",qty:2,spec:"940nm 5mm 20mA"}]},
    "Rectificadores": { items: [
      {part:"6A4",qty:3,spec:"6A 400V DO-201"},{part:"1N4002",qty:1,spec:"1A 100V DO-41"},
      {part:"1N4003",qty:1,spec:"1A 200V DO-41"},{part:"1N5408",qty:2,spec:"3A 800V DO-201"},
      {part:"YG911S2",qty:1,spec:"5A 200V Ultra High Speed TO-220F"},{part:"1N4007",qty:3,spec:"1A 1kV DO-41"},
    ]},
    "Conmutación Rápida": { items: [{part:"1N4148",qty:4,spec:"200mA 75V DO-35"}]},
    "Zener": { items: [{part:"1N4728A",qty:4,spec:"3.3V 1W DO-41"}]},
  }},
  "Resistencias": { ...catMeta("Resistencias"), subcats: {
    "Through Hole": { items: [
      {part:"1Ω",qty:4,spec:""},{part:"1.2Ω",qty:3,spec:""},{part:"2.2Ω",qty:0,spec:""},
      {part:"2.7Ω",qty:1,spec:""},{part:"4.7Ω",qty:2,spec:""},{part:"8.2Ω",qty:1,spec:""},
      {part:"10Ω",qty:21,spec:""},{part:"22Ω",qty:3,spec:""},{part:"27Ω",qty:3,spec:""},
      {part:"33Ω",qty:1,spec:""},{part:"39Ω",qty:2,spec:""},{part:"47Ω",qty:4,spec:""},
      {part:"51Ω",qty:1,spec:""},{part:"56Ω",qty:14,spec:""},{part:"100Ω",qty:6,spec:""},
      {part:"120Ω",qty:8,spec:""},{part:"150Ω",qty:15,spec:""},{part:"180Ω",qty:19,spec:""},
      {part:"220Ω",qty:21,spec:""},{part:"270Ω",qty:2,spec:""},{part:"330Ω",qty:30,spec:""},
      {part:"390Ω",qty:20,spec:""},{part:"470Ω",qty:13,spec:""},{part:"560Ω",qty:27,spec:""},
      {part:"620Ω",qty:2,spec:""},{part:"680Ω",qty:8,spec:""},{part:"820Ω",qty:12,spec:""},
      {part:"1kΩ",qty:32,spec:""},{part:"1.2kΩ",qty:0,spec:""},{part:"1.5kΩ",qty:5,spec:""},
      {part:"1.8kΩ",qty:2,spec:""},{part:"2kΩ",qty:4,spec:""},{part:"2.2kΩ",qty:9,spec:""},
      {part:"2.7kΩ",qty:0,spec:""},{part:"3.3kΩ",qty:8,spec:""},{part:"3.9kΩ",qty:2,spec:""},
      {part:"4.7kΩ",qty:0,spec:""},{part:"5.6kΩ",qty:5,spec:""},{part:"6.8kΩ",qty:10,spec:""},
      {part:"8.2kΩ",qty:1,spec:""},{part:"10kΩ",qty:4,spec:""},{part:"15kΩ",qty:3,spec:""},
      {part:"22kΩ",qty:4,spec:""},{part:"27kΩ",qty:1,spec:""},{part:"33kΩ",qty:1,spec:""},
      {part:"39kΩ",qty:1,spec:""},{part:"47kΩ",qty:5,spec:""},{part:"56kΩ",qty:1,spec:""},
      {part:"82kΩ",qty:1,spec:""},{part:"100kΩ",qty:7,spec:""},{part:"120kΩ",qty:1,spec:""},
      {part:"150kΩ",qty:1,spec:""},{part:"220kΩ",qty:1,spec:""},{part:"330kΩ",qty:3,spec:""},
      {part:"560kΩ",qty:13,spec:""},{part:"1MΩ",qty:5,spec:""},{part:"2.2MΩ",qty:0,spec:""},
      {part:"3.3MΩ",qty:1,spec:""},{part:"10MΩ",qty:1,spec:""},
    ]},
    "Potenciómetros": { items: [
      {part:"100Ω",qty:1,spec:""},{part:"10kΩ",qty:2,spec:""},{part:"100kΩ",qty:3,spec:""},{part:"1MΩ",qty:1,spec:""},
    ]},
    "Trimpots": { items: [
      {part:"500Ω",qty:1,spec:""},{part:"1kΩ",qty:4,spec:""},{part:"10kΩ",qty:2,spec:""},{part:"100kΩ",qty:2,spec:""},{part:"1MΩ",qty:1,spec:""},
    ]},
  }},
  "Capacitores": { ...catMeta("Capacitores"), subcats: {
    "Cerámicos": { items: [{part:"1pF",qty:1,spec:""}]},
    "Electrolíticos": { items: [{part:"1µF",qty:1,spec:""}]},
    "Poliéster": { items: []},
  }},
  "Inductores": { ...catMeta("Inductores"), subcats: {
    "LGA": { items: [{part:"4.7µH",qty:1,spec:""}]},
    "Toroidales": { items: [{part:"110µH",qty:1,spec:""}]},
  }},
  "Cristales": { ...catMeta("Cristales"), subcats: {
    "Osciladores": { items: [{part:"4MHz",qty:3,spec:"HC-49S"},{part:"12MHz",qty:0,spec:"HC-49S"}]},
  }},
  "Modulos y Pantallas": { ...catMeta("Modulos y Pantallas"), subcats: {
    "Modulos": { items: [{part:"RC522",qty:0,spec:"RFID 13.56MHz SPI"}]},
    "Pantallas": { items: [{part:"LCD2004",qty:1,spec:"20x4 HD44780 I2C"}]},
  }},
  "Otros": { ...catMeta("Otros"), subcats: {
    "Relevadores": { items: [{part:"5V",qty:2,spec:"SPDT 10A 250VAC"}]},
    "Interruptores y Pulsadores": { items: [
      {part:"DIP Switch 8",qty:1,spec:"8 posiciones"},{part:"DIP Switch 4",qty:0,spec:"4 posiciones"},
      {part:"DIP Switch 2",qty:0,spec:"2 posiciones"},{part:"Push Button",qty:15,spec:"6x6mm SPST"},
    ]},
  }},
};

const mono = "'JetBrains Mono','Fira Code','Courier New',monospace";
const bg = "#060d1a", surf = "#0d1629", surf2 = "#111827", bord = "#1e293b", bord2 = "#243044";
const muted = "#4b637a", text = "#dde8f0", textDim = "#7a90a6";

const css = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:${bg}}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:#0a111e}
::-webkit-scrollbar-thumb{background:#243044;border-radius:3px}
input::placeholder,textarea::placeholder{color:#334d66!important}
input:focus,select:focus,textarea:focus{border-color:#3b82f6!important;outline:none}
.hrow:hover{background:#0d1e30!important}
.hbtn:hover{opacity:0.75}
.cat-btn:hover{background:#111d2e!important}
.tab-btn:hover{background:#0d1e30!important}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
`;

const inp = {width:"100%",background:"#0a111e",border:`1px solid ${bord2}`,borderRadius:7,padding:"0.55rem 0.75rem",color:text,fontSize:"0.8rem",fontFamily:mono};
const lbl = {display:"block",color:muted,fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.3rem",textTransform:"uppercase",fontFamily:mono};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Badge({color,children}) {
  return <span style={{background:color+"18",border:`1px solid ${color}44`,color,borderRadius:20,padding:"0.15rem 0.55rem",fontSize:"0.65rem",fontWeight:700,whiteSpace:"nowrap",fontFamily:mono}}>{children}</span>;
}

function QtyControl({qty,color,onChange}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:"0.35rem"}}>
      <button onClick={()=>onChange(-1)} className="hbtn" style={{width:22,height:22,background:surf2,border:`1px solid ${bord2}`,borderRadius:5,color:muted,cursor:"pointer",fontFamily:mono,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
      <span style={{color:qty===0?"#374151":qty<=2?"#f87171":color||"#4ade80",fontWeight:700,fontSize:"0.9rem",minWidth:"1.8rem",textAlign:"center",fontFamily:mono}}>{qty}</span>
      <button onClick={()=>onChange(1)} className="hbtn" style={{width:22,height:22,background:surf2,border:`1px solid ${bord2}`,borderRadius:5,color:muted,cursor:"pointer",fontFamily:mono,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
      {qty<=2&&qty>0&&<span style={{color:"#f87171",fontSize:10}}>▲</span>}
      {qty===0&&<span style={{color:"#374151",fontSize:10}}>✕</span>}
    </div>
  );
}

function Modal({title,onClose,children,width=480}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{background:"#0b1526",border:`1px solid ${bord2}`,borderRadius:12,width:"100%",maxWidth:width,boxShadow:"0 30px 70px rgba(0,0,0,0.6)",animation:"slideIn 0.2s ease",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.25rem",borderBottom:`1px solid ${bord}`,flexShrink:0}}>
          <span style={{fontFamily:mono,fontWeight:600,color:text,fontSize:"0.85rem",letterSpacing:"0.06em"}}>{title}</span>
          <button onClick={onClose} className="hbtn" style={{background:"none",border:"none",cursor:"pointer",color:muted,fontFamily:mono,fontSize:18,lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"1.25rem",overflowY:"auto"}}>{children}</div>
      </div>
    </div>
  );
}
// ─── FIREBASE HELPERS ─────────────────────────────────────────────────────────
// Sincronizar inventario con Firebase
function useFirebaseInventory(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const inventoryRef = ref(database, `users/${userId}/inventory`);
    let unsubscribe;

    const setupListener = async () => {
      try {
        unsubscribe = onValue(inventoryRef, (snapshot) => {
          if (snapshot.exists()) {
            const firebaseData = JSON.parse(JSON.stringify(snapshot.val()));
            setData(firebaseData);
          } else {
            const initialData = JSON.parse(JSON.stringify(INITIAL_DATA));
            set(inventoryRef, initialData);
            setData(initialData);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error Firebase:", error);
        setData(JSON.parse(JSON.stringify(INITIAL_DATA)));
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  return { data, loading };
}

// Sincronizar proyectos con Firebase
function useFirebaseProjects(userId) {
  const [projects, setProjects] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsRef = ref(database, `users/${userId}/projects`);
    
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      if (snapshot.exists()) {
        const firebaseProjects = JSON.parse(JSON.stringify(snapshot.val()));
        setProjects(Array.isArray(firebaseProjects) ? firebaseProjects : Object.values(firebaseProjects || {}));
      } else {
        setProjects([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error Firebase:", error);
      setProjects([]);
      setLoading(false);
    });

    return () => off(projectsRef, 'value', unsubscribe);
  }, [userId]);

  return { projects, loading, setProjects };
}

// Guardar inventario en Firebase
function saveInventoryToFirebase(userId, data) {
  const inventoryRef = ref(database, `users/${userId}/inventory`);
  const cleanData = JSON.parse(JSON.stringify(data));
  update(inventoryRef, cleanData).catch(err => console.error("Error guardando inventario:", err));
}

// Guardar proyectos en Firebase
function saveProjectsToFirebase(userId, projects) {
  const projectsRef = ref(database, `users/${userId}/projects`);
  const cleanData = JSON.parse(JSON.stringify(projects));
  set(projectsRef, cleanData).catch(err => console.error("Error guardando proyectos:", err));
}

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
function flatten(data) {
  const result = [];
  Object.entries(data).forEach(([cat, catObj]) => {
    Object.entries(catObj.subcats).forEach(([sub, subObj]) => {
      (subObj.items || []).forEach(item => result.push({ ...item, cat, sub, color: catObj.color }));
    });
  });
  return result;
}

function clone(d) {
  return JSON.parse(JSON.stringify(d));
}

function csvEscape(value) {
  const textValue = String(value ?? "");
  return /[",\n]/.test(textValue) ? `"${textValue.replaceAll('"', '""')}"` : textValue;
}

function dataToCsv(data) {
  const rows = [["categoria", "subcategoria", "part", "qty", "spec"]];
  flatten(data).forEach(item => {
    rows.push([item.cat, item.sub, item.part, item.qty, item.spec || ""]);
  });
  return `\uFEFF${rows.map(row => row.map(csvEscape).join(",")).join("\n")}`;
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function csvToData(csvText, baseData = {}) {
  const lines = csvText.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) throw new Error("CSV vacío");

  const headers = parseCsvLine(lines[0]).map(header => header.toLowerCase());
  const findIndex = names => names.map(name => headers.indexOf(name)).find(index => index >= 0);
  const catIndex = findIndex(["categoria", "category", "cat"]);
  const subIndex = findIndex(["subcategoria", "subcategory", "sub"]);
  const partIndex = findIndex(["part", "parte", "part number", "componente"]);
  const qtyIndex = findIndex(["qty", "cantidad", "unidades", "stock"]);
  const specIndex = findIndex(["spec", "especificacion", "especificación", "descripcion", "descripción"]);

  if ([catIndex, subIndex, partIndex, qtyIndex].some(index => index === undefined)) {
    throw new Error("El CSV necesita columnas categoria, subcategoria, part y qty");
  }

  const nextData = clone(baseData || {});

  lines.slice(1).forEach(line => {
    const row = parseCsvLine(line);
    const cat = row[catIndex] || "Otros";
    const sub = row[subIndex] || "Generales";
    const part = row[partIndex];
    const qty = Math.max(0, Number.parseInt(row[qtyIndex] || "0", 10) || 0);
    const spec = specIndex === undefined ? "" : row[specIndex] || "";

    if (!part) return;

    if (!nextData[cat]) nextData[cat] = { ...catMeta(cat), subcats: {} };
    if (!nextData[cat].subcats) nextData[cat].subcats = {};
    if (!nextData[cat].subcats[sub]) nextData[cat].subcats[sub] = { items: [] };

    const items = nextData[cat].subcats[sub].items || [];
    const existingIndex = items.findIndex(item => item.part.toLowerCase() === part.toLowerCase());
    const item = { part, qty, spec };

    if (existingIndex >= 0) items[existingIndex] = item;
    else items.push(item);

    nextData[cat].subcats[sub].items = items;
  });

  return nextData;
}

// ─── CATEGORY PANEL ───────────────────────────────────────────────────────────
function CatPanel({ catName, catObj, onUpdate, expanded, onToggle }) {
  const [openSub, setOpenSub] = useState(null);
  const [addTo, setAddTo] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [delItem, setDelItem] = useState(null);
  const [addSubcat, setAddSubcat] = useState(false);
  const [newSubcatName, setNewSubcatName] = useState("");
  const [subcatError, setSubcatError] = useState("");
  const color = catObj.color;
  const LOW = 2;

  const totalItems = Object.values(catObj.subcats).reduce((s, sc) => s + (sc.items || []).length, 0);
  const totalQty = Object.values(catObj.subcats).reduce((s, sc) => s + (sc.items || []).reduce((a, i) => a + i.qty, 0), 0);
  const lowCount = Object.values(catObj.subcats).reduce((s, sc) => s + (sc.items || []).filter(i => i.qty <= LOW).length, 0);

  function updateQty(sub, part, delta) {
    const next = clone(catObj);
    const item = next.subcats[sub].items.find(i => i.part === part);
    if (item) item.qty = Math.max(0, item.qty + delta);
    onUpdate(next);
  }

  function saveEdit(sub, upd) {
    const next = clone(catObj);
    const idx = next.subcats[sub].items.findIndex(i => i.part === upd.part);
    if (idx >= 0) next.subcats[sub].items[idx] = upd;
    onUpdate(next);
    setEditItem(null);
  }

  function addItem(sub, item) {
    const next = clone(catObj);
    next.subcats[sub].items.push(item);
    onUpdate(next);
    setAddTo(null);
  }

  function delItemFn(sub, part) {
    const next = clone(catObj);
    next.subcats[sub].items = next.subcats[sub].items.filter(i => i.part !== part);
    onUpdate(next);
    setDelItem(null);
  }

  function addSubcatFn(name) {
    const next = clone(catObj);
    next.subcats[name] = { items: [] };
    onUpdate(next);
    setAddSubcat(false);
    setNewSubcatName("");
    setSubcatError("");
  }

  function handleAddSubcat() {
    const name = newSubcatName.trim();
    if (!name) {
      setSubcatError("Ingresa un nombre para la subcategoría");
      return;
    }
    if (catObj.subcats[name]) {
      setSubcatError("Esa subcategoría ya existe");
      return;
    }
    addSubcatFn(name);
  }

  return (
    <div style={{ border: `1px solid`, borderRadius: 10, overflow: "hidden", marginBottom: "0.875rem", borderColor: expanded ? color + "55" : bord, transition: "border-color 0.2s" }}>
      <button onClick={onToggle} className="cat-btn" style={{ width: "100%", background: expanded ? "#0a1628" : surf, border: "none", cursor: "pointer", padding: "0.875rem 1.125rem", display: "flex", alignItems: "center", gap: "0.875rem", textAlign: "left" }}>
        <span style={{ color, fontSize: "1.1rem", fontFamily: mono, minWidth: 20, textAlign: "center" }}>{catObj.icon}</span>
        <span style={{ color: text, fontFamily: mono, fontWeight: 700, fontSize: "0.9rem", flex: 1 }}>{catName}</span>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <span style={{ color: muted, fontSize: "0.7rem", fontFamily: mono }}>{totalItems} refs</span>
          <span style={{ color, fontSize: "0.75rem", fontFamily: mono, fontWeight: 600 }}>{totalQty} uds</span>
          {lowCount > 0 && <span style={{ background: "#7f1d1d", color: "#fca5a5", fontSize: "0.65rem", borderRadius: 10, padding: "0.1rem 0.45rem", fontFamily: mono, fontWeight: 700 }}>▲{lowCount}</span>}
          <span style={{ color: muted, fontSize: "0.75rem", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block", fontFamily: mono }}>▶</span>
        </div>
      </button>
      {expanded && (
        <div style={{ borderTop: `1px solid ${bord}`, animation: "fadeUp 0.15s ease" }}>
          {Object.entries(catObj.subcats).map(([subName, subObj]) => (
            <div key={subName}>
              <div style={{ display: "flex", alignItems: "center", padding: "0.6rem 1.125rem 0.5rem", background: "#080f1c", cursor: "pointer", gap: "0.5rem", borderBottom: `1px solid ${bord}` }}
                onClick={() => setOpenSub(openSub === subName ? null : subName)}>
                <span style={{ color, fontSize: "0.65rem" }}>◆</span>
                <span style={{ color: textDim, fontFamily: mono, fontSize: "0.78rem", fontWeight: 600, flex: 1, letterSpacing: "0.04em" }}>{subName}</span>
                <span style={{ color: muted, fontSize: "0.65rem", fontFamily: mono }}>{(subObj.items || []).length} refs · {(subObj.items || []).reduce((s, i) => s + i.qty, 0)} uds</span>
                <button onClick={e => { e.stopPropagation(); setAddTo(subName); }} className="hbtn"
                  style={{ background: color + "22", border: `1px solid ${color}44`, borderRadius: 5, padding: "0.15rem 0.45rem", color, cursor: "pointer", fontFamily: mono, fontSize: "0.65rem", fontWeight: 700 }}>+ agregar</button>
                <span style={{ color: muted, fontSize: "0.7rem", fontFamily: mono, transform: openSub === subName ? "rotate(90deg)" : "", transition: "transform 0.15s", display: "inline-block", marginLeft: "0.25rem" }}>▶</span>
              </div>
              {openSub === subName && (
                <div style={{ animation: "fadeUp 0.12s ease" }}>
                  {(!subObj.items || subObj.items.length === 0) ? (
                    <div style={{ padding: "1.5rem", textAlign: "center", color: muted, fontSize: "0.75rem", fontFamily: mono }}>
                      Sin componentes — <button onClick={() => setAddTo(subName)} style={{ background: "none", border: "none", color, cursor: "pointer", fontFamily: mono, fontSize: "0.75rem", textDecoration: "underline" }}>agregar primero</button>
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr style={{ background: "#060d1a" }}>
                        {["Part / Matrícula", "Especificación", "Cantidad", ""].map(h => (
                          <th key={h} style={{ padding: "0.4rem 1.125rem", textAlign: "left", color: muted, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${bord}`, fontFamily: mono }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {subObj.items.map((item, idx) => (
                          <tr key={item.part} className="hrow" style={{ borderBottom: `1px solid #0d1629`, background: idx % 2 === 0 ? "transparent" : "#080f1c" }}>
                            <td style={{ padding: "0.55rem 1.125rem" }}><span style={{ color: text, fontFamily: mono, fontSize: "0.82rem", fontWeight: 600 }}>{item.part}</span>{item.notes && <span style={{ color: muted, fontSize: "0.65rem", marginLeft: "0.5rem" }}>{item.notes}</span>}</td>
                            <td style={{ padding: "0.55rem 1.125rem", color: textDim, fontSize: "0.75rem", fontFamily: mono }}>{item.spec || <span style={{ color: "#243044" }}>—</span>}</td>
                            <td style={{ padding: "0.55rem 1.125rem" }}><QtyControl qty={item.qty} color={color} onChange={d => updateQty(subName, item.part, d)} /></td>
                            <td style={{ padding: "0.55rem 1rem", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "0.3rem", justifyContent: "flex-end" }}>
                                <button onClick={() => setEditItem({ subName, item })} className="hbtn" style={{ padding: "0.25rem 0.5rem", background: "#0f2749", border: "1px solid #1d4ed8", borderRadius: 5, color: "#60a5fa", cursor: "pointer", fontFamily: mono, fontSize: "0.65rem" }}>editar</button>
                                <button onClick={() => setDelItem({ subName, item })} className="hbtn" style={{ padding: "0.25rem 0.5rem", background: "#1c0a0a", border: "1px solid #7f1d1d", borderRadius: 5, color: "#f87171", cursor: "pointer", fontFamily: mono, fontSize: "0.65rem" }}>×</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
          <div style={{ padding: "0.6rem 1.125rem", background: "#060d1a", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", width: "100%" }}>
              <button onClick={() => { setAddSubcat(true); setNewSubcatName(""); setSubcatError(""); }} className="hbtn" style={{ background: "transparent", border: `1px dashed ${bord2}`, borderRadius: 5, padding: "0.3rem 0.75rem", color: muted, cursor: "pointer", fontFamily: mono, fontSize: "0.65rem" }}>+ nueva subcategoría</button>
              {addSubcat && (
                <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <input
                    autoFocus
                    value={newSubcatName}
                    onChange={event => {
                      setNewSubcatName(event.target.value);
                      if (subcatError) setSubcatError("");
                    }}
                    onKeyDown={event => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddSubcat();
                      }
                      if (event.key === "Escape") {
                        setAddSubcat(false);
                        setNewSubcatName("");
                        setSubcatError("");
                      }
                    }}
                    placeholder="Nombre de la subcategoría"
                    style={{ background: "#0b1220", border: `1px solid ${bord}`, borderRadius: 5, color: text, padding: "0.35rem 0.55rem", fontFamily: mono, fontSize: "0.72rem" }}
                  />
                  {subcatError && <span style={{ color: "#f87171", fontSize: "0.68rem", fontFamily: mono }}>{subcatError}</span>}
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button onClick={handleAddSubcat} className="hbtn" style={{ background: color + "22", border: `1px solid ${color}44`, borderRadius: 5, padding: "0.25rem 0.55rem", color, cursor: "pointer", fontFamily: mono, fontSize: "0.68rem", fontWeight: 700 }}>guardar</button>
                    <button onClick={() => { setAddSubcat(false); setNewSubcatName(""); setSubcatError(""); }} className="hbtn" style={{ background: "transparent", border: `1px solid ${bord}`, borderRadius: 5, padding: "0.25rem 0.55rem", color: muted, cursor: "pointer", fontFamily: mono, fontSize: "0.68rem" }}>cancelar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modals aquí - los omito por espacio, son iguales que antes */}
    </div>
  );
}

// ─── SEARCH VIEW ──────────────────────────────────────────────────────────────
function SearchView({ results, onQtyChange }) {
  if (results.length === 0) return <div style={{ background: surf, border: `1px solid ${bord}`, borderRadius: 9, padding: "2rem", textAlign: "center", color: muted, fontSize: "0.8rem", fontFamily: mono }}>Sin resultados</div>;
  return (
    <div style={{ border: `1px solid ${bord}`, borderRadius: 10, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ background: "#060d1a" }}>
          {["Part", "Categoría", "Subcategoría", "Spec", "Cantidad"].map(h => (
            <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", color: muted, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${bord}`, fontFamily: mono }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={`${r.cat}-${r.sub}-${r.part}`} className="hrow" style={{ borderBottom: `1px solid ${bord}`, background: i % 2 === 0 ? "transparent" : surf }}>
              <td style={{ padding: "0.6rem 1rem", color: text, fontFamily: mono, fontSize: "0.82rem", fontWeight: 600 }}>{r.part}</td>
              <td style={{ padding: "0.6rem 1rem" }}><Badge color={r.color}>{r.cat}</Badge></td>
              <td style={{ padding: "0.6rem 1rem", color: textDim, fontFamily: mono, fontSize: "0.75rem" }}>{r.sub}</td>
              <td style={{ padding: "0.6rem 1rem", color: textDim, fontFamily: mono, fontSize: "0.75rem" }}>{r.spec || "—"}</td>
              <td style={{ padding: "0.6rem 1rem" }}><QtyControl qty={r.qty} color={r.color} onChange={d => onQtyChange(r.cat, r.sub, r.part, d)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STATUS_META = {
  "Activo": { color: "#4ade80", bg: "#052e16", border: "#166534" },
  "En pausa": { color: "#fbbf24", bg: "#451a03", border: "#92400e" },
  "Completado": { color: "#60a5fa", bg: "#0f2749", border: "#1d4ed8" },
};

function ProjectsView({ projects, invData, onCreateProject, onUpdateProject, onAddComponent, onRemoveComponent, onDeleteProject }) {
  const [openProjectId, setOpenProjectId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [componentSearch, setComponentSearch] = useState("");
  const [newProject, setNewProject] = useState({ name: "", desc: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const openProject = projects.find(project => project.id === openProjectId) || null;
  const allItems = useMemo(() => flatten(invData), [invData]);
  const componentResults = useMemo(() => {
    if (!componentSearch.trim()) return [];
    const query = componentSearch.toLowerCase();
    return allItems.filter(item => item.qty > 0 && (
      item.part.toLowerCase().includes(query) ||
      (item.spec || "").toLowerCase().includes(query) ||
      item.cat.toLowerCase().includes(query) ||
      item.sub.toLowerCase().includes(query)
    )).slice(0, 8);
  }, [allItems, componentSearch]);

  function createProject() {
    const name = newProject.name.trim();
    if (!name) return;
    onCreateProject({ name, desc: newProject.desc.trim() });
    setNewProject({ name: "", desc: "" });
    setShowNew(false);
  }

  function projectUnits(project) {
    return (project.components || []).reduce((sum, component) => sum + Number(component.qtyUsed || 0), 0);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: "1rem" }}>
        <div>
          <div style={{ color: text, fontFamily: mono, fontWeight: 700, fontSize: "0.95rem" }}>Proyectos</div>
          <div style={{ color: muted, fontSize: "0.65rem", fontFamily: mono }}>{projects.length} proyecto{projects.length !== 1 ? "s" : ""} · conectados a Firebase</div>
        </div>
        <button onClick={() => setShowNew(true)} className="hbtn" style={{ padding: "0.55rem 1rem", background: "#15803d", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontFamily: mono, fontSize: "0.75rem", fontWeight: 700 }}>+ Nuevo proyecto</button>
      </div>

      {projects.length === 0 ? (
        <div style={{ background: surf, border: `1px solid ${bord}`, borderRadius: 10, padding: "4rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⬡</div>
          <div style={{ color: text, fontFamily: mono, fontWeight: 600, marginBottom: "0.4rem" }}>Sin proyectos aún</div>
          <div style={{ color: muted, fontSize: "0.75rem", fontFamily: mono }}>Crea un proyecto y asigna componentes del inventario</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {projects.map(project => {
            const statusMeta = STATUS_META[project.status] || STATUS_META.Activo;
            return (
              <div key={project.id} onClick={() => setOpenProjectId(project.id)} className="hrow" style={{ background: surf, border: `1px solid ${bord}`, borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                    <span style={{ color: text, fontFamily: mono, fontWeight: 700, fontSize: "0.9rem" }}>{project.name}</span>
                    <span style={{ background: statusMeta.bg, border: `1px solid ${statusMeta.border}`, color: statusMeta.color, borderRadius: 20, padding: "0.1rem 0.55rem", fontSize: "0.65rem", fontFamily: mono, fontWeight: 700 }}>{project.status || "Activo"}</span>
                  </div>
                  <div style={{ color: muted, fontSize: "0.7rem", fontFamily: mono }}>{(project.components || []).length} refs · {projectUnits(project)} uds{project.desc ? ` · ${project.desc}` : ""}</div>
                </div>
                <span style={{ color: muted, fontSize: "0.8rem", fontFamily: mono }}>▶</span>
              </div>
            );
          })}
        </div>
      )}

      {showNew && (
        <Modal title="// NUEVO PROYECTO" onClose={() => setShowNew(false)} width={460}>
          <div style={{ display: "grid", gap: "0.875rem" }}>
            <div><label style={lbl}>Nombre *</label><input style={inp} value={newProject.name} onChange={event => setNewProject(project => ({ ...project, name: event.target.value }))} placeholder="ej: Sistema mínimo" autoFocus /></div>
            <div><label style={lbl}>Descripción</label><textarea style={{ ...inp, resize: "vertical", minHeight: 70 }} value={newProject.desc} onChange={event => setNewProject(project => ({ ...project, desc: event.target.value }))} placeholder="opcional" /></div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
            <button onClick={() => setShowNew(false)} className="hbtn" style={{ padding: "0.55rem 1rem", background: "transparent", border: `1px solid ${bord2}`, borderRadius: 7, color: muted, cursor: "pointer", fontFamily: mono, fontSize: "0.75rem" }}>Cancelar</button>
            <button onClick={createProject} className="hbtn" style={{ padding: "0.55rem 1.2rem", background: newProject.name.trim() ? "#15803d" : "#1e293b", border: "none", borderRadius: 7, color: "#fff", cursor: newProject.name.trim() ? "pointer" : "not-allowed", fontFamily: mono, fontSize: "0.75rem", fontWeight: 700 }}>Crear proyecto</button>
          </div>
        </Modal>
      )}

      {openProject && (
        <Modal title={`// ${openProject.name}`} onClose={() => { setOpenProjectId(null); setComponentSearch(""); }} width={780}>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              {Object.keys(STATUS_META).map(status => {
                const statusMeta = STATUS_META[status];
                const active = (openProject.status || "Activo") === status;
                return <button key={status} onClick={() => onUpdateProject(openProject.id, { status })} className="hbtn" style={{ padding: "0.3rem 0.75rem", borderRadius: 20, border: `1px solid ${active ? statusMeta.border : bord2}`, background: active ? statusMeta.bg : "transparent", color: active ? statusMeta.color : muted, cursor: "pointer", fontFamily: mono, fontSize: "0.7rem", fontWeight: 700 }}>{status}</button>;
              })}
            </div>

            <div style={{ background: "#0a111e", border: `1px solid ${bord}`, borderRadius: 8, padding: "0.8rem 1rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              <div><div style={{ color: muted, fontSize: "0.6rem", letterSpacing: "0.1em", fontFamily: mono }}>REFERENCIAS</div><div style={{ color: "#60a5fa", fontWeight: 700, fontFamily: mono }}>{(openProject.components || []).length}</div></div>
              <div><div style={{ color: muted, fontSize: "0.6rem", letterSpacing: "0.1em", fontFamily: mono }}>UNIDADES USADAS</div><div style={{ color: "#f87171", fontWeight: 700, fontFamily: mono }}>{projectUnits(openProject)}</div></div>
              <div><div style={{ color: muted, fontSize: "0.6rem", letterSpacing: "0.1em", fontFamily: mono }}>ESTADO</div><div style={{ color: (STATUS_META[openProject.status] || STATUS_META.Activo).color, fontWeight: 700, fontFamily: mono }}>{openProject.status || "Activo"}</div></div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "0.6rem" }}>
                <span style={{ color: muted, fontSize: "0.65rem", letterSpacing: "0.1em", fontFamily: mono }}>COMPONENTES</span>
                <input value={componentSearch} onChange={event => setComponentSearch(event.target.value)} placeholder="Buscar para agregar…" style={{ ...inp, maxWidth: 280, padding: "0.45rem 0.65rem" }} />
              </div>

              {componentSearch.trim() && (
                <div style={{ border: `1px solid ${bord}`, borderRadius: 8, overflow: "hidden", marginBottom: "0.8rem" }}>
                  {componentResults.length === 0 && <div style={{ padding: "0.8rem", color: muted, fontFamily: mono, fontSize: "0.75rem" }}>Sin resultados con stock disponible</div>}
                  {componentResults.map(item => (
                    <button key={`${item.cat}-${item.sub}-${item.part}`} onClick={() => { onAddComponent(openProject.id, { ...item, qtyUsed: 1 }); setComponentSearch(""); }} className="hrow" style={{ width: "100%", padding: "0.65rem 0.85rem", border: "none", borderBottom: `1px solid ${bord}`, background: "transparent", color: text, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem", textAlign: "left" }}>
                      <span style={{ flex: 1, fontFamily: mono, fontSize: "0.78rem" }}>{item.part}<span style={{ color: muted }}> · {item.cat} › {item.sub}</span></span>
                      <span style={{ color: "#4ade80", fontFamily: mono, fontSize: "0.7rem" }}>{item.qty} uds</span>
                    </button>
                  ))}
                </div>
              )}

              {(!openProject.components || openProject.components.length === 0) ? (
                <div style={{ border: `1px solid ${bord}`, borderRadius: 8, padding: "2rem", textAlign: "center", color: muted, fontSize: "0.8rem", fontFamily: mono }}>Sin componentes asignados</div>
              ) : (
                <div style={{ border: `1px solid ${bord}`, borderRadius: 8, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: "#060d1a" }}>{["Part", "Categoría", "Spec", "Cant.", ""].map(header => <th key={header} style={{ padding: "0.45rem 0.875rem", textAlign: "left", color: muted, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${bord}`, fontFamily: mono }}>{header}</th>)}</tr></thead>
                    <tbody>
                      {openProject.components.map((component, index) => (
                        <tr key={`${component.cat}-${component.sub}-${component.part}`} className="hrow" style={{ borderBottom: `1px solid ${bord}`, background: index % 2 === 0 ? "transparent" : "#080f1c" }}>
                          <td style={{ padding: "0.55rem 0.875rem", color: text, fontFamily: mono, fontSize: "0.82rem", fontWeight: 600 }}>{component.part}</td>
                          <td style={{ padding: "0.55rem 0.875rem" }}><Badge color={component.color || catMeta(component.cat).color}>{component.cat}</Badge></td>
                          <td style={{ padding: "0.55rem 0.875rem", color: textDim, fontFamily: mono, fontSize: "0.72rem" }}>{component.spec || "—"}</td>
                          <td style={{ padding: "0.55rem 0.875rem", color: "#f87171", fontFamily: mono, fontWeight: 700 }}>{component.qtyUsed}</td>
                          <td style={{ padding: "0.55rem 0.75rem" }}><button onClick={() => onRemoveComponent(openProject.id, component)} className="hbtn" style={{ padding: "0.2rem 0.5rem", background: "#1c0a0a", border: "1px solid #7f1d1d", borderRadius: 5, color: "#f87171", cursor: "pointer", fontFamily: mono, fontSize: "0.65rem" }}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "1.25rem", paddingTop: "1rem", borderTop: `1px solid ${bord}` }}>
            <button onClick={() => { setOpenProjectId(null); setComponentSearch(""); }} className="hbtn" style={{ padding: "0.55rem 1rem", background: "transparent", border: `1px solid ${bord2}`, borderRadius: 7, color: muted, cursor: "pointer", fontFamily: mono, fontSize: "0.75rem" }}>Cerrar</button>
            <button onClick={() => setDeleteConfirm(openProject.id)} className="hbtn" style={{ padding: "0.55rem 1rem", background: "#1c0a0a", border: "1px solid #7f1d1d", borderRadius: 7, color: "#f87171", cursor: "pointer", fontFamily: mono, fontSize: "0.75rem", fontWeight: 700 }}>🗑 Eliminar proyecto</button>
          </div>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="// CONFIRMAR ELIMINACIÓN" onClose={() => setDeleteConfirm(null)} width={420}>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ color: textDim, fontSize: "0.85rem", lineHeight: 1.6, fontFamily: mono }}>
              ¿Estás seguro que deseas eliminar el proyecto <span style={{ color: "#f87171", fontWeight: 700 }}>"{projects.find(p => p.id === deleteConfirm)?.name}"</span>?
            </div>
            <div style={{ background: "#1c0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "0.75rem 1rem", color: "#fca5a5", fontSize: "0.75rem", fontFamily: mono }}>
              ⚠ Los componentes del proyecto volverán al inventario
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
            <button onClick={() => setDeleteConfirm(null)} className="hbtn" style={{ padding: "0.55rem 1rem", background: "transparent", border: `1px solid ${bord2}`, borderRadius: 7, color: muted, cursor: "pointer", fontFamily: mono, fontSize: "0.75rem" }}>Cancelar</button>
            <button onClick={() => { onDeleteProject(deleteConfirm); setDeleteConfirm(null); setOpenProjectId(null); }} className="hbtn" style={{ padding: "0.55rem 1.2rem", background: "#7f1d1d", border: "1px solid #b91c1c", borderRadius: 7, color: "#fca5a5", cursor: "pointer", fontFamily: mono, fontSize: "0.75rem", fontWeight: 700 }}>Sí, eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const userId = "user_default"; // En futuro: usar autenticación real
  const { data, loading: dataLoading } = useFirebaseInventory(userId);
  const { projects, loading: projectsLoading } = useFirebaseProjects(userId);
  
  const [tab, setTab] = useState("inventory");
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const importInputRef = useRef(null);

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function updateCat(catName, next) {
    const newData = clone(data);
    newData[catName] = next;
    saveInventoryToFirebase(userId, newData);
    showToast("Guardado en Firebase");
  }

  function updateProjects(newProjects) {
    saveProjectsToFirebase(userId, newProjects);
  }

  function createProject(project) {
    const nextProjects = [
      ...(projects || []),
      { id: Date.now(), name: project.name, desc: project.desc || "", status: "Activo", components: [], createdAt: new Date().toLocaleDateString("es-MX") },
    ];
    updateProjects(nextProjects);
    showToast("Proyecto creado");
  }

  function updateProject(projectId, patch) {
    const nextProjects = (projects || []).map(project => project.id === projectId ? { ...project, ...patch } : project);
    updateProjects(nextProjects);
    showToast("Proyecto actualizado");
  }

  function addComponentToProject(projectId, component) {
    const qtyUsed = Math.max(1, Number(component.qtyUsed || 1));
    const newData = clone(data);
    const inventoryItem = newData[component.cat]?.subcats?.[component.sub]?.items?.find(item => item.part === component.part);

    if (!inventoryItem || inventoryItem.qty < qtyUsed) {
      showToast("No hay stock suficiente", "warn");
      return;
    }

    inventoryItem.qty = Math.max(0, inventoryItem.qty - qtyUsed);
    const nextProjects = (projects || []).map(project => {
      if (project.id !== projectId) return project;
      const components = [...(project.components || [])];
      const existing = components.find(item => item.cat === component.cat && item.sub === component.sub && item.part === component.part);
      if (existing) existing.qtyUsed = Number(existing.qtyUsed || 0) + qtyUsed;
      else components.push({ part: component.part, qty: component.qty, qtyUsed, spec: component.spec || "", notes: component.notes || "", cat: component.cat, sub: component.sub, color: component.color || catMeta(component.cat).color });
      return { ...project, components };
    });

    saveInventoryToFirebase(userId, newData);
    updateProjects(nextProjects);
    showToast("Componente agregado y descontado");
  }

  function removeComponentFromProject(projectId, component) {
    const qtyUsed = Math.max(1, Number(component.qtyUsed || 1));
    const newData = clone(data);
    const inventoryItem = newData[component.cat]?.subcats?.[component.sub]?.items?.find(item => item.part === component.part);
    if (inventoryItem) inventoryItem.qty = Number(inventoryItem.qty || 0) + qtyUsed;

    const nextProjects = (projects || []).map(project => {
      if (project.id !== projectId) return project;
      return { ...project, components: (project.components || []).filter(item => !(item.cat === component.cat && item.sub === component.sub && item.part === component.part)) };
    });

    saveInventoryToFirebase(userId, newData);
    updateProjects(nextProjects);
    showToast("Componente devuelto al inventario");
  }

  function deleteProject(projectId) {
    const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;

    const newData = clone(data);
    (projectToDelete.components || []).forEach(component => {
      const qtyUsed = Math.max(1, Number(component.qtyUsed || 1));
      const inventoryItem = newData[component.cat]?.subcats?.[component.sub]?.items?.find(item => item.part === component.part);
      if (inventoryItem) inventoryItem.qty = Number(inventoryItem.qty || 0) + qtyUsed;
    });

    const nextProjects = (projects || []).filter(p => p.id !== projectId);
    saveInventoryToFirebase(userId, newData);
    updateProjects(nextProjects);
    showToast("Proyecto eliminado");
  }

  function exportCsv() {
    const csv = dataToCsv(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `electroinventory-${new Date().toISOString().slice(0, 10)}.csv`;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setCsvPreview(csv);
    showToast("CSV exportado; copia de respaldo lista");
  }

  async function copyCsvPreview() {
    try {
      await navigator.clipboard.writeText(csvPreview || dataToCsv(data));
      showToast("CSV copiado al portapapeles");
    } catch (error) {
      console.error("Error copiando CSV:", error);
      showToast("No se pudo copiar automáticamente", "warn");
    }
  }

  function importCsv(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const importedData = csvToData(String(reader.result || ""), data);
        saveInventoryToFirebase(userId, importedData);
        setExpanded(Object.fromEntries(Object.keys(importedData).map(key => [key, true])));
        showToast("CSV importado a Firebase");
      } catch (error) {
        console.error("Error importando CSV:", error);
        showToast(error.message || "No se pudo importar el CSV", "warn");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  const inventoryData = data || {};
  const allItems = useMemo(() => flatten(inventoryData), [inventoryData]);
  const totalRefs = allItems.length;
  const totalQty = allItems.reduce((s, i) => s + i.qty, 0);
  const totalLow = allItems.filter(i => i.qty <= 2).length;
  const totalZero = allItems.filter(i => i.qty === 0).length;

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allItems.filter(i =>
      i.part.toLowerCase().includes(q) ||
      (i.spec || "").toLowerCase().includes(q) ||
      i.cat.toLowerCase().includes(q) ||
      i.sub.toLowerCase().includes(q)
    );
  }, [allItems, search]);

  if (dataLoading || projectsLoading) {
    return <div style={{ minHeight: "100vh", background: bg, color: text, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono }}>Cargando desde Firebase...</div>;
  }

  if (!data) {
    return <div style={{ minHeight: "100vh", background: bg, color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono }}>Error cargando datos. Intenta recargando.</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: mono }}>
      <style>{css}</style>
      <header style={{ background: "#080f1c", borderBottom: `1px solid ${bord}`, padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ color: "#f59e0b", fontSize: "1.1rem" }}>◈</span>
          <div>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: text, letterSpacing: "0.03em" }}>ElectroInventory</span>
            <span style={{ color: muted, fontSize: "0.6rem", display: "block", letterSpacing: "0.12em" }}>FIREBASE + VERCEL</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.25rem", background: "#0a111e", border: `1px solid ${bord2}`, borderRadius: 8, padding: "0.2rem" }}>
          {[["inventory", "◈ Inventario"], ["projects", "⬡ Proyectos"]].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} className="tab-btn"
              style={{ padding: "0.4rem 1rem", background: tab === t ? "#1d4ed8" : "transparent", border: "none", borderRadius: 6, color: tab === t ? "#fff" : muted, cursor: "pointer", fontFamily: mono, fontSize: "0.75rem", fontWeight: tab === t ? 700 : 400 }}>
              {l}
            </button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.25rem 1.25rem 3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {[{ label: "REFERENCIAS", val: totalRefs, color: "#3b82f6" }, { label: "UNIDADES TOTAL", val: totalQty.toLocaleString(), color: "#4ade80" }, { label: "STOCK CRÍTICO", val: totalLow, color: totalLow > 0 ? "#f87171" : "#374151" }, { label: "SIN STOCK", val: totalZero, color: totalZero > 0 ? "#f59e0b" : "#374151" }].map(s => (
            <div key={s.label} style={{ background: surf, border: `1px solid ${bord}`, borderRadius: 9, padding: "0.875rem 1rem" }}>
              <div style={{ color: muted, fontSize: "0.58rem", letterSpacing: "0.12em", marginBottom: "0.3rem" }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: "1.5rem", fontWeight: 700, lineHeight: 1 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {tab === "inventory" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted, fontSize: "0.8rem", pointerEvents: "none" }}>⌕</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por part number, especificación, categoría…"
                  style={{ ...inp, paddingLeft: "2.25rem", borderRadius: 9, fontSize: "0.85rem", padding: "0.7rem 0.875rem 0.7rem 2.25rem" }} />
                {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: muted, cursor: "pointer", fontFamily: mono, fontSize: "1rem" }}>×</button>}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <input ref={importInputRef} onChange={importCsv} type="file" accept=".csv,text/csv" style={{ display: "none" }} />
                <button onClick={() => importInputRef.current?.click()} className="hbtn" style={{ background: "#0f2749", border: "1px solid #1d4ed8", borderRadius: 9, padding: "0.65rem 0.9rem", color: "#93c5fd", cursor: "pointer", fontFamily: mono, fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>⇧ Importar CSV</button>
                <button onClick={exportCsv} className="hbtn" style={{ background: "#052e16", border: "1px solid #166534", borderRadius: 9, padding: "0.65rem 0.9rem", color: "#86efac", cursor: "pointer", fontFamily: mono, fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>⇩ Exportar CSV</button>
              </div>
            </div>
            {search.trim() ? (
              <div>
                <div style={{ color: muted, fontSize: "0.7rem", marginBottom: "0.6rem", letterSpacing: "0.08em" }}>{searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} para "{search}"</div>
                <SearchView results={searchResults} onQtyChange={(cat, sub, part, delta) => {
                  const newData = clone(data);
                  const item = newData[cat]?.subcats[sub]?.items.find(i => i.part === part);
                  if (item) item.qty = Math.max(0, item.qty + delta);
                  saveInventoryToFirebase(userId, newData);
                }} />
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.875rem", alignItems: "center" }}>
                  <span style={{ color: muted, fontSize: "0.65rem", letterSpacing: "0.1em" }}>CATEGORÍAS</span>
                  <button onClick={() => setExpanded(Object.fromEntries(Object.keys(data).map(k => [k, true])))} className="hbtn" style={{ background: "transparent", border: `1px solid ${bord2}`, borderRadius: 5, padding: "0.2rem 0.6rem", color: muted, cursor: "pointer", fontFamily: mono, fontSize: "0.65rem", marginLeft: "auto" }}>expandir todo</button>
                  <button onClick={() => setExpanded({})} className="hbtn" style={{ background: "transparent", border: `1px solid ${bord2}`, borderRadius: 5, padding: "0.2rem 0.6rem", color: muted, cursor: "pointer", fontFamily: mono, fontSize: "0.65rem" }}>colapsar todo</button>
                </div>
                {Object.entries(data).map(([catName, catObj]) => (
                  <CatPanel key={catName} catName={catName} catObj={catObj} expanded={!!expanded[catName]}
                    onToggle={() => setExpanded(e => ({ ...e, [catName]: !e[catName] }))} onUpdate={next => updateCat(catName, next)} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "projects" && (
          <ProjectsView projects={projects || []} invData={data}
            onCreateProject={createProject} onUpdateProject={updateProject}
            onAddComponent={addComponentToProject} onRemoveComponent={removeComponentFromProject} onDeleteProject={deleteProject} />
        )}
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", background: toast.type === "warn" ? "#451a03" : "#052e16", border: `1px solid ${toast.type === "warn" ? "#92400e" : "#166534"}`, borderRadius: 9, padding: "0.65rem 1.1rem", color: toast.type === "warn" ? "#fcd34d" : "#86efac", fontSize: "0.75rem", fontFamily: mono, boxShadow: "0 8px 30px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease", zIndex: 2000 }}>
          {toast.type === "warn" ? "⚠ " : "✓ "}{toast.msg}
        </div>
      )}

      {csvPreview && (
        <Modal title="CSV exportado" onClose={() => setCsvPreview(null)} width={760}>
          <p style={{ color: textDim, fontSize: "0.78rem", lineHeight: 1.6, marginBottom: "0.9rem", fontFamily: mono }}>
            Si el navegador no descargó el archivo, copia este respaldo y guárdalo como electroinventory.csv.
          </p>
          <textarea readOnly value={csvPreview} style={{ ...inp, minHeight: 260, resize: "vertical", lineHeight: 1.5, whiteSpace: "pre", overflow: "auto" }} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "1rem" }}>
            <button onClick={() => setCsvPreview(null)} className="hbtn" style={{ background: "transparent", border: `1px solid ${bord2}`, borderRadius: 7, padding: "0.55rem 0.9rem", color: muted, cursor: "pointer", fontFamily: mono, fontSize: "0.75rem" }}>cerrar</button>
            <button onClick={copyCsvPreview} className="hbtn" style={{ background: "#052e16", border: "1px solid #166534", borderRadius: 7, padding: "0.55rem 0.9rem", color: "#86efac", cursor: "pointer", fontFamily: mono, fontSize: "0.75rem", fontWeight: 700 }}>copiar CSV</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
