let provider, signer, contract, account;
const CONTRACT_ADDRESS = "0xc843bd7c389c59284136444516d956c0e4bdd1cb";

// Load contract ABI
let contractABI;
fetch("./contracts/HealthcareConsentAdvanced.json")
  .then(res => res.json())
  .then(json => contractABI = json.abi);

async function connectWallet() {
  if (!window.ethereum) { alert("Install MetaMask!"); return; }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  account = await signer.getAddress();
  document.getElementById("accountDisplay").innerText = "Connected: " + account;

  contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  detectRole();
}

async function detectRole() {
  const roleInfo = document.getElementById("roleInfo");
  try {
    const adminAddr = await contract.admin();
    if (adminAddr.toLowerCase() === account.toLowerCase()) { roleInfo.innerText = "Role: Admin"; showDashboard("admin"); return; }

    const doctor = await contract.doctors(account);
    if (doctor.registered) { roleInfo.innerText = "Role: Doctor"; showDashboard("doctor"); return; }

    const patient = await contract.patients(account);
    if (patient.registered) { roleInfo.innerText = "Role: Patient"; showDashboard("patient"); return; }

    roleInfo.innerText = "Role: Not registered"; showDashboard("none");
  } catch(err) { console.error(err); roleInfo.innerText="Error detecting role"; }
}

function showDashboard(role) {
  document.querySelectorAll(".dashboard").forEach(d => d.style.display="none");
  if(role==="admin") document.getElementById("adminActions").style.display="block";
  if(role==="doctor") document.getElementById("doctorActions").style.display="block";
  if(role==="patient") document.getElementById("patientActions").style.display="block";
}

// ------------------ Admin Functions ------------------
document.getElementById("registerPatientBtn").onclick = async () => {
  const addr = document.getElementById("patientAddr").value;
  const name = document.getElementById("patientName").value;
  const hash = document.getElementById("patientHash").value;
  await sendTx("registerPatient", [addr,name,hash]);
};

document.getElementById("registerDoctorBtn").onclick = async () => {
  const addr = document.getElementById("doctorAddr").value;
  const name = document.getElementById("doctorName").value;
  const spec = document.getElementById("doctorSpec").value;
  await sendTx("registerDoctor", [addr,name,spec]);
};

document.getElementById("verifyDoctorBtn").onclick = async () => {
  const addr = document.getElementById("verifyDoctorAddr").value;
  await sendTx("verifyDoctor", [addr]);
};

// ------------------ Doctor Functions ------------------
document.getElementById("requestAccessBtn").onclick = async () => {
  const addr = document.getElementById("requestPatientAddr").value;
  await sendTx("requestAccess", [addr]);
};

document.getElementById("viewPatientDataBtn").onclick = async () => {
  const addr = document.getElementById("viewPatientAddr").value;
  try {
    const data = await contract.viewPatientData(addr);
    document.getElementById("patientDataDisplay").innerText = "DataHash: " + data;
  } catch(err) { console.error(err); alert("Access denied or expired"); }
};

// ------------------ Patient Functions ------------------
document.getElementById("approveAccessBtn").onclick = async () => {
  const reqId = document.getElementById("approveRequestId").value;
  const duration = document.getElementById("approveDuration").value;
  await sendTx("approveAccess", [reqId, duration]);
};

document.getElementById("revokeAccessBtn").onclick = async () => {
  const addr = document.getElementById("revokeDoctorAddr").value;
  await sendTx("revokeAccess", [addr]);
};

document.getElementById("updateDataBtn").onclick = async () => {
  const hash = document.getElementById("updateHash").value;
  await sendTx("updateMyMedicalData", [hash]);
};

// ------------------ Generic Function to send transaction ------------------
async function sendTx(fnName, args=[]) {
  if(!contract) { alert("Connect wallet first"); return; }
  try {
    const tx = await contract[fnName](...args);
    document.getElementById("status").innerText = "Transaction sent, waiting...";
    await tx.wait();
    document.getElementById("status").innerText = "✅ Transaction confirmed!";
  } catch(err) { console.error(err); document.getElementById("status").innerText = "❌ Error: "+err.message; }
}

// Connect wallet button
document.getElementById("connectWalletBtn").onclick = connectWallet;