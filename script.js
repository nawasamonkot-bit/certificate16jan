//-----------------------------------------------------------
// 🎨 สร้างเลขรัน (ใช้ Worker/Sheet เป็นหลัก ถ้าไม่ต้องการ LocalStorage)
//-----------------------------------------------------------
let lastNumber = parseInt(localStorage.getItem("lastNumber") || "0");

function genNumber() {
  lastNumber++;
  localStorage.setItem("lastNumber", lastNumber);
  return String(lastNumber).padStart(3, "0");
}

//-----------------------------------------------------------
// 🔧 ส่งข้อมูลไป Cloudflare Worker
//-----------------------------------------------------------
async function saveToWorker(name, number, dateTH) {
  // URL Worker ของคุณ
  const WORKER_URL = "https://certificate-worker.nawasamonkot.workers.dev/";

  // ดึง IP ของผู้ใช้งาน
  const ipData = await fetch('https://api.ipify.org?format=json').then(r => r.json());

  const data = {
    name: name,
    number: number,
    dateTH: dateTH,
    device: navigator.platform,
    userAgent: navigator.userAgent,
    ip: ipData.ip
  };

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log("Worker response:", result);
  } catch (err) {
    console.error(err);
    alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
}

//-----------------------------------------------------------
// 🎨 สร้างเกียรติบัตร
//-----------------------------------------------------------
function generateCert() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("กรุณากรอกชื่อ");

  const number = genNumber();

  const now = new Date();
  const dateTH = now.toLocaleString("th-TH", {
    dateStyle: "long",
    timeStyle: "short"
  });

  drawCertificate(name, number, dateTH);

  // ส่งข้อมูลไป Worker
  saveToWorker(name, number, dateTH);
}

//-----------------------------------------------------------
// 🖼 วาดใบเกียรติบัตรบน Canvas
//-----------------------------------------------------------
function drawCertificate(name, number, dateTH) {
  const canvas = document.getElementById("certCanvas");
  const ctx = canvas.getContext("2d");

  const bg = new Image();
  bg.src = "certificate.png";

  bg.onload = function () {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    ctx.font = "50px THSarabunNew";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.fillText(name, canvas.width / 2, 350);

    ctx.font = "32px THSarabunNew";
    ctx.textAlign = "left";
    ctx.fillText(number, 50, 650);

    document.getElementById("certPreview").style.display = "block";
  };
}

//-----------------------------------------------------------
// ⬇ ดาวน์โหลดไฟล์เกียรติบัตร PNG
//-----------------------------------------------------------
function downloadCert() {
  const canvas = document.getElementById("certCanvas");
  const link = document.createElement("a");
  link.download = "certificate.png";
  link.href = canvas.toDataURL();
  link.click();
}

//-----------------------------------------------------------
// 🗑 Admin: ล้างข้อมูล LocalStorage (ไม่กระทบ Worker)
//-----------------------------------------------------------
function resetAll() {
  if (!confirm("ต้องการเคลียร์ข้อมูลบนอุปกรณ์นี้ไหม?")) return;

  localStorage.clear();
  lastNumber = 0;

  alert("ล้างข้อมูลในเครื่องเรียบร้อย!");
}
