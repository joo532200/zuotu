let marketData = {}

// ===== 泰国时间（新增）=====
function getThaiDate(){
  const now = new Date()

  const y = now.toLocaleString('en-US',{timeZone:'Asia/Bangkok',year:'numeric'})
  const m = now.toLocaleString('en-US',{timeZone:'Asia/Bangkok',month:'2-digit'})
  const d = now.toLocaleString('en-US',{timeZone:'Asia/Bangkok',day:'2-digit'})

  return `${y}/${m}/${d}`
}


// ===== Binance 数据 =====
async function load(){
  let res = await fetch("https://api.binance.com/api/v3/ticker/24hr")
  let data = await res.json()

  data.forEach(d=>{
    marketData[d.symbol]=d
  })

  renderMarket()
}


// ===== 三个卡片 =====
function renderMarket(){

  // HOT
  let hotHTML=""
  ;["BTCUSDT","ETHUSDT","SOLUSDT"].forEach(s=>{
    let d=marketData[s]
    if(!d) return

    let change=parseFloat(d.priceChangePercent)

    hotHTML+=`
    <div class="row">
      <div class="left">
        <img src="img/${s.replace('USDT','').toLowerCase()}.png"
             onerror="this.style.display='none'">
        <span>${s.replace("USDT","/USDT")}</span>
      </div>

      <div class="right">
        <div class="price">${Number(d.lastPrice).toFixed(2)}</div>
        <div class="percent ${change>0?'green':'red'}">
          ${change.toFixed(2)}%
        </div>
      </div>
    </div>`
  })
  document.getElementById("hot").innerHTML=hotHTML


  // MAX
  let gainHTML=""
  ;["XAUTUSDT","WLDUSDT"].forEach(s=>{
    let d=marketData[s]
    if(!d) return

    let change=parseFloat(d.priceChangePercent)

    gainHTML+=`
    <div class="row">
      <div class="left">
        <img src="img/${s.replace('USDT','').toLowerCase()}.png"
             onerror="this.style.display='none'">
        <span>${s.replace("USDT","/USDT")}</span>
      </div>

      <div class="right">
        <div class="price">${Number(d.lastPrice).toFixed(4)}</div>
        <div class="percent ${change>0?'green':'red'}">
          ${change.toFixed(2)}%
        </div>
      </div>
    </div>`
  })
  document.getElementById("gain").innerHTML=gainHTML
}


// ===== NEW SPOT =====
async function loadNewSpot(){

  let coins = [
    { symbol:"ORCAUSDT", id:"orca" },
    { symbol:"ZBTUSDT", id:"zerobase" }
  ]

  let ids = coins.map(c=>c.id).join(",")

  let res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
  )
  let data = await res.json()

  let newHTML=""

  coins.forEach(c=>{
    let item = data[c.id]
    if(!item) return

    let price = Number(item.usd).toFixed(4)
    let change = Number(item.usd_24h_change || 0)

    newHTML+=`
    <div class="row">
      <div class="left">
        <img src="img/${c.symbol.replace('USDT','').toLowerCase()}.png"
             onerror="this.style.display='none'">
        <span>${c.symbol.replace("USDT","/USDT")}</span>
      </div>

      <div class="right">
        <div class="price">${price}</div>
        <div class="percent ${change>0?'green':'red'}">
          ${change.toFixed(2)}%
        </div>
      </div>
    </div>`
  })

  document.getElementById("new").innerHTML=newHTML
}


// ===== 表格 =====

let tableData= JSON.parse(localStorage.getItem("tableData")) ||[
  {lot:"$100", qty:2, ok:true, percent:30},
  {lot:"$200", qty:3, ok:true, percent:30},
  {lot:"$300", qty:1, ok:true, percent:30},
  {lot:"$400", qty:2, ok:true, percent:30},
  {lot:"$500", qty:3, ok:true, percent:30},
  {lot:"$1000", qty:1, ok:true, percent:30},
]


function saveData(){
  localStorage.setItem("tableData", JSON.stringify(tableData))
}

function renderTable(){
  let html=""
  tableData.forEach((d,i)=>{
    html+=`
    <tr class="row-bg">
      <td>${getThaiDate()}</td>
      <td>
  <span class="lot-edit" onclick="editLot(${i})">
    $${d.lot}
  </span>
</td>
      <td>
  <span class="qty-edit" onclick="editQty(${i})">
    ${d.qty}
  </span>
</td>

      <td onclick="toggle(${i})">
  <img 
    class="status-icon"
    src="img/${d.ok ? 'check.png' : 'close.png'}"
  >
</td>

      <td>${d.ok?"Kuota Tersedia":"Kuota Tidak Tersedia"}</td>

      <td>
        <span class="percent-edit" onclick="editPercent(${i})">
          ${d.percent}%
        </span>
      </td>
    </tr>`
  })

  document.getElementById("tableData").innerHTML=html
}


// ===== 操作 =====
function toggle(i){
  tableData[i].ok=!tableData[i].ok
  saveData()      // ✅ 保存
  renderTable()
}


function editPercent(i){
  let val = prompt("请输入百分比（0-100）", tableData[i].percent)

  if(val === null) return

  val = Number(val)

  if(isNaN(val) || val < 0 || val > 100){
    alert("请输入正确数字")
    return
  }

  tableData[i].percent = val
  renderTable()
}

function editLot(i){
  let val = prompt("请输入金额（例如 100）", tableData[i].lot)

  if(val === null) return

  val = Number(val)

  if(isNaN(val) || val <= 0){
    alert("请输入正确金额")
    return
  }

  tableData[i].lot = val   // ✅ 只存数字
  saveData()
  renderTable()
}

function editQty(i){
  let val = prompt("请输入数量", tableData[i].qty)

  if(val === null) return

  val = Number(val)

  if(isNaN(val) || val < 0){
    alert("请输入正确数量")
    return
  }

  tableData[i].qty = val
  renderTable()
}



// ===== 启动 =====
load()
renderTable()
loadNewSpot()

// 自动刷新（交易所效果）
setInterval(load,10000)
setInterval(loadNewSpot,10000)
