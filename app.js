const state = {
  role: localStorage.getItem("mq_role") || "",
  page: "dashboard",
  queue: JSON.parse(localStorage.getItem("mq_queue") || "[]"),
  beds: JSON.parse(localStorage.getItem("mq_beds") || "null"),
  prescriptions: JSON.parse(localStorage.getItem("mq_prescriptions") || "[]")
};

const defaultBeds = [
  {id:"W1-01",ward:"General Ward",status:"available",patient:""},
  {id:"W1-02",ward:"General Ward",status:"occupied",patient:"Riya Sharma"},
  {id:"W1-03",ward:"General Ward",status:"available",patient:""},
  {id:"W1-04",ward:"General Ward",status:"cleaning",patient:""},
  {id:"ICU-01",ward:"ICU",status:"occupied",patient:"Aman Verma"},
  {id:"ICU-02",ward:"ICU",status:"reserved",patient:"Emergency"},
  {id:"ICU-03",ward:"ICU",status:"available",patient:""},
  {id:"P-01",ward:"Private",status:"occupied",patient:"Neha Gupta"},
  {id:"P-02",ward:"Private",status:"available",patient:""},
  {id:"P-03",ward:"Private",status:"available",patient:""},
  {id:"EM-01",ward:"Emergency",status:"occupied",patient:"Emergency Case"},
  {id:"EM-02",ward:"Emergency",status:"available",patient:""}
];
if(!state.beds) state.beds=defaultBeds;

const roleInfo={
 patient:{name:"Demo Patient",icon:"P"},
 doctor:{name:"Dr. Demo",icon:"D"},
 pharmacist:{name:"Demo Pharmacist",icon:"F"},
 nurse:{name:"Demo Nurse",icon:"N"},
 admin:{name:"Hospital Admin",icon:"A"}
};

const navByRole={
 patient:[["dashboard","▦","Dashboard"],["appointments","📅","Appointments"],["queue","🎟","My Queue"],["beds","🛏","Bed Availability"],["prescriptions","💊","Prescriptions"]],
 doctor:[["dashboard","▦","Dashboard"],["queue","🎟","Patient Queue"],["prescriptions","💊","Prescriptions"],["beds","🛏","Bed Management"]],
 pharmacist:[["dashboard","▦","Dashboard"],["prescriptions","💊","Prescription Safety"],["queue","🎟","Queue"]],
 nurse:[["dashboard","▦","Dashboard"],["prescriptions","💊","Medication Administration"],["beds","🛏","Beds"]],
 admin:[["dashboard","▦","Dashboard"],["queue","🎟","Queue Management"],["beds","🛏","Bed Management"],["prescriptions","💊","Prescription Safety"],["analytics","📊","Analytics"]]
};

const content=document.getElementById("content");
const app=document.getElementById("app");
const roleScreen=document.getElementById("roleScreen");

document.querySelectorAll(".role-option").forEach(btn=>{
  btn.addEventListener("click",()=>selectRole(btn.dataset.role));
});
document.getElementById("switchRole").addEventListener("click",()=>{
  app.classList.add("hidden"); roleScreen.classList.remove("hidden");
});
document.getElementById("mobileMenu").addEventListener("click",()=>{
  document.querySelector(".sidebar").classList.toggle("open");
});
document.getElementById("notificationBtn").addEventListener("click",()=>toast("No new critical notifications."));

function selectRole(role){
  state.role=role; state.page="dashboard";
  localStorage.setItem("mq_role",role);
  roleScreen.classList.add("hidden"); app.classList.remove("hidden");
  setupShell(); render();
}
function setupShell(){
  const info=roleInfo[state.role];
  document.getElementById("userAvatar").textContent=info.icon;
  document.getElementById("userName").textContent=info.name;
  document.getElementById("userRole").textContent=state.role.charAt(0).toUpperCase()+state.role.slice(1);
  document.getElementById("mainNav").innerHTML=navByRole[state.role].map(([page,icon,label])=>
    `<button class="nav-item ${state.page===page?"active":""}" data-page="${page}"><span>${icon}</span>${label}</button>`).join("");
  document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
    state.page=btn.dataset.page; document.querySelector(".sidebar").classList.remove("open"); setupShell(); render();
  }));
}
function render(){
  const titles={
    dashboard:"Overview",appointments:"Appointments",queue:"Queue Management",
    beds:"Bed Management",prescriptions:"Prescription Safety",analytics:"Hospital Analytics"
  };
  document.getElementById("pageTitle").textContent=titles[state.page]||"Overview";
  document.getElementById("pageEyebrow").textContent=state.role+" portal";
  if(state.page==="dashboard") dashboard();
  if(state.page==="appointments") appointments();
  if(state.page==="queue") queuePage();
  if(state.page==="beds") bedsPage();
  if(state.page==="prescriptions") prescriptionsPage();
  if(state.page==="analytics") analyticsPage();
}
function persist(){
  localStorage.setItem("mq_queue",JSON.stringify(state.queue));
  localStorage.setItem("mq_beds",JSON.stringify(state.beds));
  localStorage.setItem("mq_prescriptions",JSON.stringify(state.prescriptions));
}
function toast(msg){
  const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>t.classList.remove("show"),2500);
}
function statusBadge(status){
  const map={available:["green","Available"],occupied:["red","Occupied"],cleaning:["orange","Cleaning"],reserved:["blue","Reserved"],waiting:["orange","Waiting"],called:["blue","Called"],completed:["green","Completed"]};
  const [c,label]=map[status]||["gray",status];
  return `<span class="badge ${c}">${label}</span>`;
}
function dashboard(){
  const available=state.beds.filter(b=>b.status==="available").length;
  const occupied=state.beds.filter(b=>b.status==="occupied").length;
  const waiting=state.queue.filter(q=>q.status==="waiting").length;
  const highAlerts=state.prescriptions.filter(p=>p.severity==="high").length;
  content.innerHTML=`
  <div class="welcome"><div><h1>Good day, ${roleInfo[state.role].name}</h1><p class="muted">MediQueue brings patient flow, bed visibility and medication safety together.</p></div></div>
  <div class="grid stats">
    <div class="card stat-card"><div class="stat-icon">🎟</div><div><h3>${waiting}</h3><p>Patients waiting</p></div></div>
    <div class="card stat-card"><div class="stat-icon">🛏</div><div><h3>${available}</h3><p>Beds available</p></div></div>
    <div class="card stat-card"><div class="stat-icon">🏥</div><div><h3>${occupied}</h3><p>Beds occupied</p></div></div>
    <div class="card stat-card"><div class="stat-icon">⚠️</div><div><h3>${highAlerts}</h3><p>High medication alerts</p></div></div>
  </div>
  <div class="grid two section-gap">
    <div class="card"><div class="card-head"><h3>Live Patient Queue</h3><button class="btn btn-secondary" onclick="go('queue')">View Queue</button></div>
      <div class="queue-list">${queueRows(5)}</div>
    </div>
    <div class="card"><div class="card-head"><h3>Medication Safety</h3><button class="btn btn-secondary" onclick="go('prescriptions')">Review</button></div>
      ${alertRows()}
    </div>
  </div>
  <div class="card section-gap"><div class="card-head"><h3>Ward-wise Bed Availability</h3><button class="btn btn-secondary" onclick="go('beds')">Manage Beds</button></div>
    ${bedSummary()}
  </div>`;
}
function queueRows(limit=20){
  const arr=state.queue.slice(0,limit);
  if(!arr.length) return `<div class="empty">No patients are currently in the queue.</div>`;
  return arr.map(q=>`<div class="queue-row"><div><strong>${q.token}</strong> · ${q.patient}<br><small>${q.department}</small></div><div>${statusBadge(q.status)}</div></div>`).join("");
}
function alertRows(){
  const alerts=state.prescriptions.slice(0,4);
  if(!alerts.length) return `<div class="empty">No prescription alerts. Create a prescription to test safety checks.</div>`;
  return alerts.map(p=>`<div class="alert ${p.severity}"><strong>${p.severity.toUpperCase()}:</strong> ${p.alert}<br><small>${p.patient} · ${p.drug}</small></div>`).join("");
}
function bedSummary(){
  const wards=[...new Set(state.beds.map(b=>b.ward))];
  return `<div class="bed-grid">${wards.map(w=>{
    const beds=state.beds.filter(b=>b.ward===w),a=beds.filter(b=>b.status==="available").length;
    return `<div class="bed available"><strong>${a}/${beds.length}</strong><small>${w} beds available</small></div>`;
  }).join("")}</div>`;
}
function appointments(){
  content.innerHTML=`
  <div class="welcome"><div><h1>Book Appointment</h1><p class="muted">Digital appointment and token generation for better patient flow.</p></div></div>
  <div class="grid two">
    <div class="card"><div class="card-head"><h3>New Appointment</h3></div>
      <form id="appointmentForm">
        <div class="form-grid">
          <div class="field"><label>Patient Name</label><input id="apName" required placeholder="Enter patient name"></div>
          <div class="field"><label>Department</label><select id="apDept"><option>General Medicine</option><option>Cardiology</option><option>Orthopedics</option><option>Pediatrics</option><option>Emergency</option></select></div>
          <div class="field"><label>Date</label><input id="apDate" type="date" required></div>
          <div class="field"><label>Preferred Time</label><input id="apTime" type="time" required></div>
        </div>
        <div class="actions"><button class="btn btn-primary">Generate Token & Book</button></div>
      </form>
    </div>
    <div class="card"><div class="card-head"><h3>Today's Flow</h3></div><div class="kpi">${state.queue.length}</div><p class="muted">Total tokens generated in this browser</p><div class="progress"><span style="width:${Math.min(100,state.queue.length*8)}%"></span></div><small class="muted">Live queue updates are shown in the Queue module.</small></div>
  </div>`;
  document.getElementById("appointmentForm").addEventListener("submit",e=>{
    e.preventDefault();
    const token="A"+String(state.queue.length+1).padStart(3,"0");
    state.queue.push({token,patient:document.getElementById("apName").value,department:document.getElementById("apDept").value,date:document.getElementById("apDate").value,time:document.getElementById("apTime").value,status:"waiting"});
    persist(); toast(`Token ${token} generated successfully.`); state.page="queue"; setupShell(); render();
  });
}
function queuePage(){
  content.innerHTML=`
  <div class="welcome"><div><h1>Live Queue Status</h1><p class="muted">Monitor tokens and department-wise waiting flow.</p></div><button class="btn btn-primary" onclick="go('appointments')">+ New Token</button></div>
  <div class="grid stats">
    <div class="card stat-card"><div class="stat-icon">🎟</div><div><h3>${state.queue.length}</h3><p>Total tokens</p></div></div>
    <div class="card stat-card"><div class="stat-icon">⏳</div><div><h3>${state.queue.filter(q=>q.status==="waiting").length}</h3><p>Waiting</p></div></div>
    <div class="card stat-card"><div class="stat-icon">📣</div><div><h3>${state.queue.filter(q=>q.status==="called").length}</h3><p>Called</p></div></div>
    <div class="card stat-card"><div class="stat-icon">⏱</div><div><h3>18 min</h3><p>Estimated average wait</p></div></div>
  </div>
  <div class="card section-gap"><div class="card-head"><h3>Department-wise Queue</h3></div><div class="table-wrap"><table class="table"><thead><tr><th>Token</th><th>Patient</th><th>Department</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr></thead><tbody>
  ${state.queue.length?state.queue.map((q,i)=>`<tr><td><strong>${q.token}</strong></td><td>${q.patient}</td><td>${q.department}</td><td>${q.date||"-"}</td><td>${q.time||"-"}</td><td>${statusBadge(q.status)}</td><td>${q.status==="waiting"?`<button class="btn btn-secondary" onclick="callToken(${i})">Call</button>`:`<button class="btn btn-success" onclick="completeToken(${i})">Complete</button>`}</td></tr>`).join(""):`<tr><td colspan="7"><div class="empty">No queue entries yet.</div></td></tr>`}
  </tbody></table></div></div>`;
}
function callToken(i){state.queue[i].status="called";persist();toast(`${state.queue[i].token} has been called.`);render();}
function completeToken(i){state.queue[i].status="completed";persist();toast("Queue token completed.");render();}
function bedsPage(){
  const available=state.beds.filter(b=>b.status==="available").length;
  content.innerHTML=`
  <div class="welcome"><div><h1>Bed Management</h1><p class="muted">Live ward-wise availability with admission, discharge and cleaning states.</p></div></div>
  <div class="grid stats">
    <div class="card stat-card"><div class="stat-icon">🛏</div><div><h3>${state.beds.length}</h3><p>Total beds</p></div></div>
    <div class="card stat-card"><div class="stat-icon">🟢</div><div><h3>${available}</h3><p>Available</p></div></div>
    <div class="card stat-card"><div class="stat-icon">🔴</div><div><h3>${state.beds.filter(b=>b.status==="occupied").length}</h3><p>Occupied</p></div></div>
    <div class="card stat-card"><div class="stat-icon">🧹</div><div><h3>${state.beds.filter(b=>b.status==="cleaning").length}</h3><p>Cleaning</p></div></div>
  </div>
  <div class="card section-gap"><div class="card-head"><h3>Live Bed Board</h3></div><div class="bed-grid">${state.beds.map((b,i)=>`
    <div class="bed ${b.status}">
      <strong>${b.id}</strong>${statusBadge(b.status)}<small>${b.ward}</small><small>${b.patient||"Ready for admission"}</small>
      <div class="actions">${b.status==="available"?`<button class="btn btn-primary" onclick="admit(${i})">Admit</button>`:b.status==="occupied"?`<button class="btn btn-success" onclick="discharge(${i})">Discharge</button>`:`<button class="btn btn-secondary" onclick="makeAvailable(${i})">Mark Available</button>`}</div>
    </div>`).join("")}</div></div>`;
}
function admit(i){
  const patient=prompt("Enter patient name for admission:");
  if(!patient)return;
  state.beds[i].status="occupied";state.beds[i].patient=patient;persist();toast(`${state.beds[i].id} admitted for ${patient}.`);render();
}
function discharge(i){state.beds[i].status="cleaning";state.beds[i].patient="";persist();toast("Bed moved to cleaning.");render();}
function makeAvailable(i){state.beds[i].status="available";state.beds[i].patient="";persist();toast("Bed is now available.");render();}
function prescriptionsPage(){
  const canCreate=["doctor"].includes(state.role);
  const canAct=["pharmacist","nurse","doctor"].includes(state.role);
  content.innerHTML=`
  <div class="welcome"><div><h1>Digital Prescriptions</h1><p class="muted">Allergy, drug-interaction and dose validation with severity-prioritized alerts.</p></div></div>
  <div class="grid ${canCreate?"two":"one"}">
  ${canCreate?`<div class="card"><div class="card-head"><h3>Create Prescription</h3></div>
    <form id="rxForm"><div class="form-grid">
      <div class="field"><label>Patient</label><input id="rxPatient" required placeholder="Patient name"></div>
      <div class="field"><label>Drug</label><select id="rxDrug"><option>Amoxicillin</option><option>Warfarin</option><option>Ibuprofen</option><option>Paracetamol</option><option>Metformin</option></select></div>
      <div class="field"><label>Allergy</label><select id="rxAllergy"><option value="none">No known allergy</option><option value="penicillin">Penicillin</option><option value="nsaid">NSAIDs</option></select></div>
      <div class="field"><label>Dose</label><input id="rxDose" type="number" min="1" value="500" required><small class="muted">Demo validation range: 50–1000 mg</small></div>
    </div><div class="actions"><button class="btn btn-primary">Validate & Save Prescription</button></div></form>
  </div>`:""}
  <div class="card"><div class="card-head"><h3>Safety Alerts</h3><small>Prioritized by severity</small></div>${alertRows()}</div>
  </div>
  <div class="card section-gap"><div class="card-head"><h3>Prescription Records</h3></div><div class="table-wrap"><table class="table"><thead><tr><th>Patient</th><th>Drug</th><th>Dose</th><th>Alert</th><th>Severity</th><th>Status</th>${canAct?"<th>Action</th>":""}</tr></thead><tbody>
  ${state.prescriptions.length?state.prescriptions.map((p,i)=>`<tr><td>${p.patient}</td><td>${p.drug}</td><td>${p.dose} mg</td><td>${p.alert}</td><td>${statusBadge(p.severity==="high"?"occupied":p.severity==="medium"?"cleaning":"available")}</td><td>${statusBadge(p.status)}</td>${canAct?`<td><button class="btn btn-success" onclick="dispense(${i})">Mark ${state.role==="nurse"?"Administered":"Dispensed"}</button></td>`:""}</tr>`).join(""):`<tr><td colspan="7"><div class="empty">No prescriptions recorded.</div></td></tr>`}
  </tbody></table></div></div>`;
  if(canCreate) document.getElementById("rxForm").addEventListener("submit",e=>{
    e.preventDefault();
    const patient=document.getElementById("rxPatient").value,drug=document.getElementById("rxDrug").value,allergy=document.getElementById("rxAllergy").value,dose=Number(document.getElementById("rxDose").value);
    let severity="low",alert="No major safety issue detected.";
    if(dose<50||dose>1000){severity="high";alert="Dose is outside the demo validation range."}
    else if((drug==="Amoxicillin"&&allergy==="penicillin")||(drug==="Ibuprofen"&&allergy==="nsaid")){severity="high";alert="Possible allergy conflict detected."}
    else if(drug==="Warfarin"&&drug==="Ibuprofen"){severity="medium";alert="Potential drug interaction requires review."}
    else if(drug==="Warfarin"){severity="medium";alert="Interaction review recommended before dispensing."}
    state.prescriptions.unshift({patient,drug,dose,alert,severity,status:"waiting"});
    persist();toast("Prescription validated and saved.");render();
  });
}
function dispense(i){state.prescriptions[i].status="completed";persist();toast("Medication workflow marked completed.");render();}
function analyticsPage(){
  const total=state.beds.length,occupied=state.beds.filter(b=>b.status==="occupied").length;
  const rate=Math.round(occupied/total*100);
  const departments=[...new Set(state.queue.map(q=>q.department))];
  content.innerHTML=`
  <div class="welcome"><div><h1>Hospital Analytics</h1><p class="muted">Operational overview based on current browser demo data.</p></div></div>
  <div class="grid three">
    <div class="card"><p class="muted">Bed occupancy</p><div class="kpi">${rate}%</div><div class="progress"><span style="width:${rate}%"></span></div><small class="muted">${occupied} occupied of ${total} beds</small></div>
    <div class="card"><p class="muted">Queue volume</p><div class="kpi">${state.queue.length}</div><p class="muted">Tokens generated</p></div>
    <div class="card"><p class="muted">Medication records</p><div class="kpi">${state.prescriptions.length}</div><p class="muted">${state.prescriptions.filter(p=>p.severity==="high").length} high-severity alerts</p></div>
  </div>
  <div class="grid two section-gap"><div class="card"><div class="card-head"><h3>Department Queue Volume</h3></div>${departments.length?departments.map(d=>{const n=state.queue.filter(q=>q.department===d).length;return `<div class="queue-row"><strong>${d}</strong><span class="badge blue">${n} tokens</span></div>`}).join(""):`<div class="empty">No queue data yet.</div>`}</div>
  <div class="card"><div class="card-head"><h3>System Modules</h3></div><div class="queue-list"><div class="queue-row"><strong>Patient Flow</strong><span class="badge green">Active</span></div><div class="queue-row"><strong>Bed Management</strong><span class="badge green">Active</span></div><div class="queue-row"><strong>Medication Safety</strong><span class="badge green">Active</span></div></div></div></div>`;
}
function go(page){state.page=page;setupShell();render();}
if(state.role){roleScreen.classList.add("hidden");app.classList.remove("hidden");setupShell();render();}
