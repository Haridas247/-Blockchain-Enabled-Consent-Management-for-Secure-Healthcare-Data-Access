let web3;
let contract;
const contractAddress = "0xc843bD7C389c59284136444516D956c0E4Bdd1CB";
const contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "patient",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "doctor",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "expiry",
				"type": "uint256"
			}
		],
		"name": "AccessApproved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "patient",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "doctor",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			}
		],
		"name": "AccessRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "patient",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "doctor",
				"type": "address"
			}
		],
		"name": "AccessRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldAdmin",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newAdmin",
				"type": "address"
			}
		],
		"name": "AdminChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "doctor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "DoctorRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "doctor",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "admin",
				"type": "address"
			}
		],
		"name": "DoctorVerified",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "patient",
				"type": "address"
			}
		],
		"name": "MedicalDataUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "patient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "PatientRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "admin",
				"type": "address"
			}
		],
		"name": "SystemPaused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "admin",
				"type": "address"
			}
		],
		"name": "SystemUnpaused",
		"type": "event"
	},
	{
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "accessPermission",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_requestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_durationSeconds",
				"type": "uint256"
			}
		],
		"name": "approveAccess",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newAdmin",
				"type": "address"
			}
		],
		"name": "changeAdmin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "doctors",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "specialization",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "registered",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "verified",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyRequests",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "doctor",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "expiry",
						"type": "uint256"
					}
				],
				"internalType": "struct HealthcareConsentAdvanced.Request[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_patientAddr",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_doctorAddr",
				"type": "address"
			}
		],
		"name": "isAccessActive",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "patients",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "dataHash",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "registered",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pauseSystem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_doctorAddr",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_specialization",
				"type": "string"
			}
		],
		"name": "registerDoctor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_patientAddr",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_dataHash",
				"type": "string"
			}
		],
		"name": "registerPatient",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_patientAddr",
				"type": "address"
			}
		],
		"name": "requestAccess",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_doctorAddr",
				"type": "address"
			}
		],
		"name": "revokeAccess",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "revokeAllMyAccesses",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalApprovals",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalRequests",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalRevocations",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unpauseSystem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_newHash",
				"type": "string"
			}
		],
		"name": "updateMyMedicalData",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_doctorAddr",
				"type": "address"
			}
		],
		"name": "verifyDoctor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_patientAddr",
				"type": "address"
			}
		],
		"name": "viewPatientData",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
];

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected. Please install it first.");
    return;
  }

  try {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();

    if (!accounts || accounts.length === 0) {
      setStatus("No wallet connected.");
      return;
    }
	// i show you why that all are use in this that's why i use comments in that.
// BNB testnet network details
const BNB_TESTNET_CHAIN_ID = 97;
const BNB_TESTNET_HEX = "0x61";
const BNB_TESTNET_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545/";


   // This show wallet is connect or not only admin
    contract = new web3.eth.Contract(contractABI, contractAddress);
    document.getElementById("walletAddress").innerText = "Connected: " + accounts[0];
    setStatus("Wallet connected successfully.");
    console.log("Wallet connected:", accounts[0]);

  } catch (err) {
    console.error("Wallet connection failed:", err);
    setStatus("Connection failed: " + err.message);
  }
}

// Make sure button exists before adding event listener
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectWallet");
  if (btn) btn.addEventListener("click", connectWallet);
});

// 3. Register Patient (Admin only in your contract)
async function registerPatient() {
  const name = document.getElementById("patientName").value;
  const hash = document.getElementById("patientHash").value;
  const accounts = await web3.eth.getAccounts();

  try {
    await contract.methods
      .registerPatient(accounts[0], name, hash)
      .send({ from: accounts[0] });
    setStatus("Patient registered successfully!");
  } catch (err) {
    console.error("Register patient error:", err);
    setStatus("Error: " + err.message);
  }
}

// 4. Register Doctor (Admin only)
async function registerDoctor() {
  const name = document.getElementById("doctorName").value;
  const spec = document.getElementById("doctorSpec").value;
  const accounts = await web3.eth.getAccounts();

  try {
    await contract.methods
      .registerDoctor(accounts[0], name, spec)
      .send({ from: accounts[0] });
    setStatus("Doctor registered successfully!");
  } catch (err) {
    console.error("Register doctor error:", err);
    setStatus("Error: " + err.message);
  }
}

// 5. Doctor requests access to patient data
async function requestAccess() {
  const patient = document.getElementById("patientAddr").value;
  const accounts = await web3.eth.getAccounts();

  try {
    await contract.methods.requestAccess(patient).send({ from: accounts[0] });
    setStatus("Access request sent!");
  } catch (err) {
    console.error("Request access error:", err);
    setStatus("Error: " + err.message);
  }
}

// 6. Patient approves doctor access 

async function approveAccess() {
  const id = document.getElementById("requestId").value;
  const duration = document.getElementById("duration").value;
  const accounts = await web3.eth.getAccounts();

  try {
    await contract.methods.approveAccess(id, duration).send({ from: accounts[0] });
    setStatus("Access approved!");
  } catch (err) {
    console.error("Approve access error:", err);
    setStatus("Error: " + err.message);
  }
}

// 7. Patient revokes doctor access
async function revokeAccess() {
  const docAddr = document.getElementById("revokeDoctor").value;
  const accounts = await web3.eth.getAccounts();

  try {
    await contract.methods.revokeAccess(docAddr).send({ from: accounts[0] });
    setStatus("Access revoked!");
  } catch (err) {
    console.error("Revoke access error:", err);
    setStatus("Error: " + err.message);
  }
}

// 8. Display status on screen
function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) {
	el.innerText = msg;}
	else {console.warn("Status element not found:", msg);}
}

// 9. Catch any JS errors globally (for debugging)
window.addEventListener("error", (e) => {
  console.error("JS Error:", e.message);
});