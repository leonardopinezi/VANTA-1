const RAM = new Array(1024*1000).fill(0x00);
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const VIDEO_BUFFER_SIZE = 800 + canvas.width*canvas.height;
const width = canvas.width;

const KEYBUF_START = 600;
const KEYBUF_END = 700;
const KEYBUF_WRITE = 598;
const KEYBUF_READ = 599;

addEventListener("keydown", (e) => {
    if (e.key.length !== 1) return;

    let keycode = e.key.charCodeAt(0);
    let writeIndex = RAM[KEYBUF_WRITE] || 0;

    RAM[KEYBUF_START + writeIndex] = keycode;

    writeIndex++;
    if (writeIndex >= KEYBUF_END - KEYBUF_START) writeIndex = 0;

    RAM[KEYBUF_WRITE] = writeIndex;
});

const tools = {
    put: (address=0, value=0x00)=>{
        if(RAM[address] != undefined) RAM[address] = value;
    },
    get: (address=0)=>{
        if(RAM[address] != undefined) return RAM[address];
    }
}

const VGA_COLOURS = [
    "#000", "#00A", "#0A0", "#0AA",
    "#A00", "#A0A", "#AA0", "#AAA",
    "#555", "#55F", "#5F5", "#5FF",
    "#F55", "#F5F", "#FF5", "#FFF"
];

const CPU = {
    PC: 0,
    REG: {
        "R0": 0,
        "R1": 0,
        "R2": 0,
        "R3": 0,
        "R4": 0,
        "R5": 0,
        "R6": 0,
        "R7": 0,
        "R8": 0,
        "R9": 0,
    },
    FLAGS: {
        "Z": 0,
        "N": 0,
        "C": 0,
        "O": 0
    },
    IR: 0,
    HALTED: 0
}

const flags = {
    0x00: ()=>{
        CPU.PC++;
    },
    0x01: (part)=>{
        const addr = part[CPU.PC+1];
        const value = part[CPU.PC+2];

        tools.put(addr, value);

        CPU.PC+=3;
    },
    0x02: (part)=>{
        const addr = part[CPU.PC+1];
        const reg = part[CPU.PC+2];

        if(CPU.REG[`R${reg}`] != undefined) CPU.REG[`R${reg}`] = tools.get(addr);
        
        CPU.PC+=3;
    },
    0x03: (part)=>{
        const reg1 = part[CPU.PC+1];
        const reg2 = part[CPU.PC+2];

        if(CPU.REG[`R${reg1}`] != undefined && CPU.REG[`R${reg2}`] != undefined) CPU.REG[`R${reg1}`] = CPU.REG[`R${reg2}`];
    
        CPU.PC+=3;
    },
    0x04: (part)=>{
        const reg1 = part[CPU.PC+1];
        const reg2 = part[CPU.PC+2];

        if(CPU.REG[`R${reg1}`] != undefined && CPU.REG[`R${reg2}`] != undefined) {
            const a = CPU.REG[`R${reg1}`];
            const b = CPU.REG[`R${reg2}`];
            
            CPU.REG[`R${reg1}`] = a + b;
            
            regexFlags(a + b, a, b, "+");
        };
        
        CPU.PC+=3;
    },
    0x05: (part)=>{
        const reg1 = part[CPU.PC+1];
        const reg2 = part[CPU.PC+2];

        if(CPU.REG[`R${reg1}`] != undefined && CPU.REG[`R${reg2}`] != undefined) {
            const a = CPU.REG[`R${reg1}`];
            const b = CPU.REG[`R${reg2}`];
            
            CPU.REG[`R${reg1}`] = a - b;
            
            regexFlags(a - b, a, b, "-");
        };

        CPU.PC+=3;
    },
    0x06: (part)=>{
        const id = part[CPU.PC+1];
        CPU.PC = id;
    },
    0x07: (part)=>{
        const id = part[CPU.PC+1];

        if(CPU.FLAGS.Z === 1) CPU.PC = id;
        else CPU.PC+=2;
    },
    0x08: (part)=>{
        const reg = part[CPU.PC+1];

        if(CPU.REG[`R${reg}`] != undefined) console.log(CPU.REG[`R${reg}`]);
        CPU.PC+=2;
    },
    0x09: (part)=>{
        const reg1 = part[CPU.PC+1];
        const reg2 = part[CPU.PC+2];

        if(CPU.REG[`R${reg1}`] != undefined && CPU.REG[`R${reg2}`] != undefined) {
            const a = CPU.REG[`R${reg1}`];
            const b = CPU.REG[`R${reg2}`];
            regexFlags(a - b, a, b, "-");
        }
        CPU.PC+=3;
    },
    0x0a: (part)=>{
        const reg = part[CPU.PC+1];
        const val = part[CPU.PC+2];

        if(CPU.REG[`R${reg}`] != undefined) CPU.REG[`R${reg}`] = val;
        CPU.PC+=3;
    },
    0x0b: (part)=>{
        const reg = part[CPU.PC+1];
        const readIndex = RAM[KEYBUF_READ];

        if(readIndex !== undefined && readIndex < (KEYBUF_END - KEYBUF_START)) {
            const keycode = RAM[KEYBUF_START + readIndex];
            CPU.REG[`R${reg}`] = keycode;

            RAM[KEYBUF_READ] = (readIndex + 1) % (KEYBUF_END - KEYBUF_START);
        }
    
        CPU.PC+=2;
    },
    0x0c: (part)=>{
        const address = part[CPU.PC+1];
        const reg = part[CPU.PC+2];

        if(CPU.REG[`R${reg}`] != undefined) tools.put(address, CPU.REG[`R${reg}`]);
    
        CPU.PC+=3;
    },
    0x0ff: ()=>{
        CPU.HALTED = 1;
    }
}

function runPartition(partition) {
    CPU.PC = 0;
    CPU.HALTED = 0;
    function step() {
        if(flags[partition[CPU.PC]] != undefined) flags[partition[CPU.PC]](partition);
        if(partition[CPU.PC] == undefined) CPU.HALTED = 1;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        renderGraphics();
        if(CPU.HALTED === 0) requestAnimationFrame(step);
    }
    if(CPU.HALTED === 0) requestAnimationFrame(step);
}

function renderGraphics() {
    let x = 0, y = 0;

    for(let i = 800; i < VIDEO_BUFFER_SIZE; i++) {
        const colorIndex = RAM[i] || 0;

        ctx.fillStyle = VGA_COLOURS[colorIndex % VGA_COLOURS.length];
        ctx.fillRect(x, y, 1, 1);
        x++;

        if(x >= width) {
            y++;
            x = 0;
        }
    }
}

function regexFlags(entry, a=0, b=0, opcode="+") {
    CPU.FLAGS.Z = entry === 0 ? 1 : 0;
    CPU.FLAGS.N = entry < 0 ? 1 : 0;
    CPU.FLAGS.O = 0;
    CPU.FLAGS.C = 0;

    if(opcode === "+" && entry > 255) CPU.FLAGS.C = 1;
    else if(opcode === "-" && a < b) CPU.FLAGS.C = 1; 
}

const SIMPLE_PARTITION = [
    0x0a, 0, 800,
    0x0a, 1, 1,
    0x0c, 0, 2,
    0x06, 3,

    0xff
];

runPartition(SIMPLE_PARTITION);