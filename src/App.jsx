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

function useFirebaseProjects(userId) {
  const [projects, setProjects] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsRef = ref(database, `users/${userId}/projects`);
    let unsubscribe;

    const setupListener = async () => {
      try {
        unsubscribe = onValue(projectsRef, (snapshot) => {
          if (snapshot.exists()) {
            const firebaseProjects = JSON.parse(JSON.stringify(snapshot.val()));
            setProjects(Array.isArray(firebaseProjects) ? firebaseProjects : Object.values(firebaseProjects || {}));
          } else {
            setProjects([]);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error Firebase:", error);
        setProjects([]);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  return { projects, loading };
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

// ─── CATEGORY PANEL ───────────────────────────────────────────────────────────
function CatPanel({ catName, catObj, onUpdate, expanded, onToggle }) {
  const [openSub, setOpenSub] = useState(null);
  const [addTo, setAddTo] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [delItem, setDelItem] = useState(null);
  const [addSubcat, setAddSubcat] = useState(false);
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
            <button onClick={() => setAddSubcat(true)} className="hbtn" style={{ background: "transparent", border: `1px dashed ${bord2}`, borderRadius: 5, padding: "0.3rem 0.75rem", color: muted, cursor: "pointer", fontFamily: mono, fontSize: "0.65rem" }}>+ nueva subcategoría</button>
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

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const userId = "user_default"; // En futuro: usar autenticación real
  const { data, loading: dataLoading } = useFirebaseInventory(userId);
  const { projects, loading: projectsLoading } = useFirebaseProjects(userId);
  
  const [tab, setTab] = useState("inventory");
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

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

  if (dataLoading || projectsLoading) {
    return <div style={{ minHeight: "100vh", background: bg, color: text, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono }}>Cargando desde Firebase...</div>;
  }

  if (!data) {
    return <div style={{ minHeight: "100vh", background: bg, color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono }}>Error cargando datos. Intenta recargando.</div>;
  }

  const allItems = useMemo(() => flatten(data), [data]);
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
            <div style={{ position: "relative", marginBottom: "1.25rem" }}>
              <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted, fontSize: "0.8rem", pointerEvents: "none" }}>⌕</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por part number, especificación, categoría…"
                style={{ ...inp, paddingLeft: "2.25rem", borderRadius: 9, fontSize: "0.85rem", padding: "0.7rem 0.875rem 0.7rem 2.25rem" }} />
              {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: muted, cursor: "pointer", fontFamily: mono, fontSize: "1rem" }}>×</button>}
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
          <div style={{ color: text, fontFamily: mono, textAlign: "center", padding: "4rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⬡</div>
            <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Módulo de Proyectos</div>
            <div style={{ color: muted, fontSize: "0.85rem" }}>Este módulo está conectado a Firebase. Implementaremos los detalles en la siguiente fase.</div>
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", background: toast.type === "warn" ? "#451a03" : "#052e16", border: `1px solid ${toast.type === "warn" ? "#92400e" : "#166534"}`, borderRadius: 9, padding: "0.65rem 1.1rem", color: toast.type === "warn" ? "#fcd34d" : "#86efac", fontSize: "0.75rem", fontFamily: mono, boxShadow: "0 8px 30px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease", zIndex: 2000 }}>
          {toast.type === "warn" ? "⚠ " : "✓ "}{toast.msg}
        </div>
      )}
    </div>
  );
}