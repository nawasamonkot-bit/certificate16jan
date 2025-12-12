const SHEET_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"; // ใส่ URL ของ Apps Script

// สร้างเลขรันแบบง่าย
let lastNumber = parseInt(localStorage.getItem("lastNumber") || "0");
function genNumber() {
  lastNumber++;
  localStorage.setItem("lastNumber", lastNumber);
  return String(lastNumber).padStart(3, "0");
}

// สร้างเกียรติบัตร + ส่งข้อมูลไป Google Sheet
async function generateCert() {
  const name = document.getElementById("nameInput").value.trim();
  if(!name) { alert("กรุณากรอกชื่อ"); return; }

  const number = genNumber();
  const now = new Date();
  const dateTH = now.toLocaleString("th-TH", { dateStyle:"long", timeStyle:"short" });

  drawCertificate(name, number, dateTH);

  // ส่งข้อมูลไป Sheet
  try {
    const ipData = await fetch('https://api.ipify.org?format=json').then(r=>r.json());
    const data = { name, number, dateTH, device:navigator.platform, userAgent:navigator.userAgent, ip:ipData.ip };

    const res = await fetch(SHEET_URL, {
      method:"POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.text();
    console.log("Sheet response:", result);
  } catch(err){
    console.error(err);
    alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
}

// วาด Canvas
function drawCertificate(name, number, dateTH){
  const canvas = document.getElementById("certCanvas");
  const ctx = canvas.getContext("2d");
  const bg = new Image();
  bg.src="certificate.png";
  bg.onload=function(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(bg,0,0,canvas.width,canvas.height);
    ctx.font="50px THSarabunNew"; ctx.textAlign="center"; ctx.fillStyle="#000";
    ctx.fillText(name, canvas.width/2, 350);
    ctx.font="32px THSarabunNew"; ctx.textAlign="left";
    ctx.fillText(number,50,550);
    ctx.fillText(dateTH,50,590);
  }
}

// ดาวน์โหลด PNG
function downloadCert(){
  const canvas = document.getElementById("certCanvas");
  const link = document.createElement("a");
  link.download="certificate.png";
  link.href=canvas.toDataURL();
  link.click();
}
