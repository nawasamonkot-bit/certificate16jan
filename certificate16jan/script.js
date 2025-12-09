//-----------------------------------------------------------
// โหลดเลขรันสุดท้ายจาก LocalStorage
//-----------------------------------------------------------
let lastNumber = parseInt(localStorage.getItem("lastNumber") || "0");

// ฟังก์ชันสร้างเลขรันแบบ 001, 002...
function genNumber() {
  lastNumber++;
  localStorage.setItem("lastNumber", lastNumber);
  return String(lastNumber).padStart(3, "0");
}

//-----------------------------------------------------------
// สร้างเกียรติบัตร
//-----------------------------------------------------------
function generateCert() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("กรุณากรอกชื่อ");

  const number = genNumber();

  // วันที่แบบไทย
  const now = new Date();
  const dateTH = now.toLocaleString("th-TH", {
    dateStyle: "long",
    timeStyle: "short"
  });

  drawCertificate(name, number, dateTH);
}

//-----------------------------------------------------------
// วาดเกียรติบัตรบน Canvas
//-----------------------------------------------------------
function drawCertificate(name, number, dateTH) {
  const canvas = document.getElementById("certCanvas");
  const ctx = canvas.getContext("2d");

  const bg = new Image();
  bg.src = "certificate.png";  // ← รูปต้องอยู่โฟลเดอร์เดียวกับ index.html

  bg.onload = function () {
    // วาดภาพพื้นหลังใบเกียรติบัตร
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // ชื่อ
    ctx.font = "50px THSarabunNew";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(name, canvas.width / 2, 350);

    // เลขรัน มุมล่างซ้าย
    ctx.textAlign = "right";
    ctx.font = "32px THSarabunNew";
    ctx.fillText( number, 50, 650);

   

    // แสดง preview
    document.getElementById("certPreview").style.display = "block";
  };

  bg.onerror = function () {
    alert("โหลดไฟล์ certificate.png ไม่ได้ — ตรวจดูว่ารูปอยู่ที่โฟลเดอร์เดียวกับ index.html");
  };
}


//-----------------------------------------------------------
// ดาวน์โหลดเกียรติบัตร
//-----------------------------------------------------------
function downloadCert() {
  const canvas = document.getElementById("certCanvas");
  const link = document.createElement("a");
  link.download = "certificate.png";
  link.href = canvas.toDataURL();
  link.click();
}

//-----------------------------------------------------------
// Admin: ดาวน์โหลด Excel
//-----------------------------------------------------------
function downloadExcel() {
  window.location.href = "admin/data.xlsx";
}

//-----------------------------------------------------------
// Admin: รีเซ็ตเฉพาะเลขรัน
//-----------------------------------------------------------
function resetNumberOnly() {
  if (!confirm("ต้องการรีเซ็ตเลขรันกลับเป็น 001 ใช่ไหม?")) return;
  
  lastNumber = 0;
  localStorage.setItem("lastNumber", 0);

  alert("รีเซ็ตเลขรันเรียบร้อย! เลขต่อไปคือ 001");
}
