//-----------------------------------------------------------
// 🔧 ตั้งค่า GitHub Repo
//-----------------------------------------------------------
// ใส่ค่าตามที่คุณสร้างไว้ใน GitHub
window.GITHUB_USER = "nawasamonkot-bit";   // ชื่อ user คุณ
window.GITHUB_REPO = "certificate16jan";  // repo ใหม่สำหรับเก็บข้อมูล
window.GITHUB_TOKEN = "certificate16jan";  // ใส่ token ที่คุณสร้าง

//-----------------------------------------------------------
// 📌 โหลดเลขรันสุดท้ายจาก LocalStorage (ใช้แค่บนเครื่องหนึ่ง แต่ GitHub คือของจริง)
//-----------------------------------------------------------
let lastNumber = parseInt(localStorage.getItem("lastNumber") || "0");

// ฟังก์ชันสร้างเลขรันแบบ 001, 002...
function genNumber() {
  lastNumber++;
  localStorage.setItem("lastNumber", lastNumber);
  return String(lastNumber).padStart(3, "0");
}

//-----------------------------------------------------------
// ✏ บันทึกข้อมูลลง GitHub Issues (ระบบเก็บข้อมูลกลาง)
//-----------------------------------------------------------
async function saveToGitHub(name, number, dateTH) {
  const url = `https://api.github.com/repos/${window.GITHUB_USER}/${window.GITHUB_REPO}/issues`;

  const body = {
    title: `CERT-${number}`,
    body: `ชื่อ: ${name}\nเลขที่: ${number}\nวันที่: ${dateTH}`
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `token ${window.GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    alert("❌ บันทึกข้อมูลไป GitHub ไม่สำเร็จ");
  }
}

//-----------------------------------------------------------
// 🎨 สร้างเกียรติบัตรจาก canvas
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

  // บันทึกข้อมูลรวม (สำคัญ)
  saveToGitHub(name, number, dateTH);
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
// 📥 ดึงข้อมูลทั้งหมดจาก GitHub Issues
//-----------------------------------------------------------
async function fetchAllDataFromGitHub() {
  const url = `https://api.github.com/repos/${window.GITHUB_USER}/${window.GITHUB_REPO}/issues?per_page=100`;

  const res = await fetch(url, {
    headers: {
      "Authorization": `token ${window.GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json"
    }
  });

  if (!res.ok) {
    alert("❌ ดาวน์โหลดข้อมูลจาก GitHub ไม่สำเร็จ");
    return [];
  }

  const issues = await res.json();

  return issues.map(item => {
    const lines = item.body.split("\n");

    return {
      number: item.title.replace("CERT-", "").trim(),
      name: lines[0].replace("ชื่อ: ", "").trim(),
      date: lines[2].replace("วันที่: ", "").trim()
    };
  });
}

//-----------------------------------------------------------
// 📊 ดาวน์โหลด Excel แบบรวมจาก GitHub
//-----------------------------------------------------------
async function downloadExcelFromGitHub() {
  const data = await fetchAllDataFromGitHub();

  if (data.length === 0)
    return alert("ยังไม่มีข้อมูลใน GitHub");

  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "CERT_DATA");

  XLSX.writeFile(wb, "certificate-data.xlsx");

  alert("ดาวน์โหลด Excel สำเร็จ!");
}

//-----------------------------------------------------------
// 🗑 Admin: ล้างข้อมูล LocalStorage (ไม่กระทบ GitHub)
//-----------------------------------------------------------
function resetAll() {
  if (!confirm("ต้องการเคลียร์ข้อมูลบนอุปกรณ์นี้ไหม?")) return;

  localStorage.clear();
  lastNumber = 0;

  alert("ล้างข้อมูลในเครื่องเรียบร้อย!");
}
