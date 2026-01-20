// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HealthcareConsentAdvanced {
    struct Patient {
        string name;
        string dataHash;
        bool registered;
    }

    struct Doctor {
        string name;
        string specialization;
        bool registered;
        bool verified;
    }

    struct Request {
        uint id;
        address doctor;
        bool approved;
        uint timestamp;
        uint expiry;
    }

    event PatientRegistered(address indexed patient, string name);
    event DoctorRegistered(address indexed doctor, string name);
    event DoctorVerified(address indexed doctor, address indexed admin);
    event AccessRequested(address indexed patient, address indexed doctor, uint indexed requestId);
    event AccessApproved(address indexed patient, address indexed doctor, uint indexed requestId, uint expiry);
    event AccessRevoked(address indexed patient, address indexed doctor);
    event MedicalDataUpdated(address indexed patient);
    event SystemPaused(address indexed admin);
    event SystemUnpaused(address indexed admin);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    address public admin;
    bool public paused;

    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(address => mapping(address => bool)) public accessPermission;
    mapping(address => Request[]) private requests;

    uint private requestCounter;
    uint public totalRequests;
    uint public totalApprovals;
    uint public totalRevocations;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "System paused");
        _;
    }

    modifier onlyRegisteredPatient() {
        require(patients[msg.sender].registered, "Not registered patient");
        _;
    }

    modifier onlyRegisteredDoctor() {
        require(doctors[msg.sender].registered, "Not registered doctor");
        _;
    }

    constructor() {
        admin = msg.sender;
        paused = false;
        requestCounter = 0;
    }

    receive() external payable {}
    fallback() external payable {}

    function changeAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin");
        address old = admin;
        admin = _newAdmin;
        emit AdminChanged(old, _newAdmin);
    }

    function pauseSystem() external onlyAdmin {
        paused = true;
        emit SystemPaused(msg.sender);
    }

    function unpauseSystem() external onlyAdmin {
        paused = false;
        emit SystemUnpaused(msg.sender);
    }

    function registerPatient(address _patientAddr, string calldata _name, string calldata _dataHash) external onlyAdmin whenNotPaused {
        require(_patientAddr != address(0), "Invalid address");
        require(!patients[_patientAddr].registered, "Patient exists");
        patients[_patientAddr] = Patient({ name: _name, dataHash: _dataHash, registered: true });
        emit PatientRegistered(_patientAddr, _name);
    }

    function registerDoctor(address _doctorAddr, string calldata _name, string calldata _specialization) external onlyAdmin whenNotPaused {
        require(_doctorAddr != address(0), "Invalid address");
        require(!doctors[_doctorAddr].registered, "Doctor exists");
        doctors[_doctorAddr] = Doctor({ name: _name, specialization: _specialization, registered: true, verified: false });
        emit DoctorRegistered(_doctorAddr, _name);
    }

    function verifyDoctor(address _doctorAddr) external onlyAdmin whenNotPaused {
        require(doctors[_doctorAddr].registered, "Doctor not registered");
        require(!doctors[_doctorAddr].verified, "Already verified");
        doctors[_doctorAddr].verified = true;
        emit DoctorVerified(_doctorAddr, msg.sender);
    }

    function requestAccess(address _patientAddr) external onlyRegisteredDoctor whenNotPaused {
        require(doctors[msg.sender].verified, "Doctor not verified");
        require(_patientAddr != address(0), "Invalid patient");
        require(patients[_patientAddr].registered, "Patient not found");
        requestCounter++;
        Request memory r = Request({ id: requestCounter, doctor: msg.sender, approved: false, timestamp: block.timestamp, expiry: 0 });
        requests[_patientAddr].push(r);
        totalRequests++;
        emit AccessRequested(_patientAddr, msg.sender, requestCounter);
    }

    function approveAccess(uint _requestId, uint _durationSeconds) external onlyRegisteredPatient whenNotPaused {
        Request[] storage reqs = requests[msg.sender];
        bool found = false;
        for (uint i = 0; i < reqs.length; i++) {
            if (reqs[i].id == _requestId) {
                require(!reqs[i].approved, "Already approved");
                reqs[i].approved = true;
                reqs[i].expiry = block.timestamp + _durationSeconds;
                accessPermission[msg.sender][reqs[i].doctor] = true;
                totalApprovals++;
                emit AccessApproved(msg.sender, reqs[i].doctor, _requestId, reqs[i].expiry);
                found = true;
                break;
            }
        }
        require(found, "Request not found");
    }

    function revokeAccess(address _doctorAddr) external onlyRegisteredPatient whenNotPaused {
        require(accessPermission[msg.sender][_doctorAddr], "Access not granted");
        accessPermission[msg.sender][_doctorAddr] = false;
        totalRevocations++;
        emit AccessRevoked(msg.sender, _doctorAddr);
    }

    function revokeAllMyAccesses() external onlyRegisteredPatient whenNotPaused {
        Request[] storage reqs = requests[msg.sender];
        for (uint i = 0; i < reqs.length; i++) {
            if (reqs[i].approved && accessPermission[msg.sender][reqs[i].doctor]) {
                accessPermission[msg.sender][reqs[i].doctor] = false;
                reqs[i].approved = false;
                reqs[i].expiry = 0;
                totalRevocations++;
                emit AccessRevoked(msg.sender, reqs[i].doctor);
            }
        }
    }

    function updateMyMedicalData(string calldata _newHash) external onlyRegisteredPatient whenNotPaused {
        patients[msg.sender].dataHash = _newHash;
        emit MedicalDataUpdated(msg.sender);
    }

    function viewPatientData(address _patientAddr) external view onlyRegisteredDoctor whenNotPaused returns (string memory) {
        require(_patientAddr != address(0), "Invalid patient");
        require(patients[_patientAddr].registered, "Patient not found");
        require(doctors[msg.sender].verified, "Doctor not verified");
        bool allowed = accessPermission[_patientAddr][msg.sender];
        if (!allowed) revert("Access not granted");
        Request[] storage reqs = requests[_patientAddr];
        uint latestExpiry = 0;
        for (uint i = 0; i < reqs.length; i++) {
            if (reqs[i].doctor == msg.sender && reqs[i].approved && reqs[i].expiry > latestExpiry) {
                latestExpiry = reqs[i].expiry;
            }
        }
        require(latestExpiry >= block.timestamp, "Access expired");
        return patients[_patientAddr].dataHash;
    }

    function getMyRequests() external view onlyRegisteredPatient returns (Request[] memory) {
        return requests[msg.sender];
    }

    function isAccessActive(address _patientAddr, address _doctorAddr) external view returns (bool) {
        if (!accessPermission[_patientAddr][_doctorAddr]) return false;
        Request[] storage reqs = requests[_patientAddr];
        for (uint i = 0; i < reqs.length; i++) {
            if (reqs[i].doctor == _doctorAddr && reqs[i].approved && reqs[i].expiry >= block.timestamp) {
                return true;
            }
        }
        return false;
    }
}