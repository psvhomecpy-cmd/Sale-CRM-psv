import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { MATERIALS, MATERIAL_GROUPS, MATERIAL_TYPES } from "./materials.js";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
const D = {
  // Brand
  bg:"#2A0709", bg2:"#3B0B0E", bg3:"#4A1014", bg4:"#5C1519",
  gold:"#F5C542", goldM:"#E8B830", goldL:"#FFF3C0", goldLL:"#FFFBEB",
  // Neutrals
  w:"#FFFFFF", off:"#FAFAFA", s50:"#F8FAFC", s100:"#F1F5F9",
  s200:"#E2E8F0", s300:"#CBD5E1", s400:"#94A3B8", s500:"#64748B",
  s600:"#475569", s700:"#334155", s800:"#1E293B", s900:"#0F172A",
  // Semantics
  gr:"#059669", grL:"#D1FAE5", grD:"#064E3B",
  bl:"#2563EB", blL:"#DBEAFE", blD:"#1E3A8A",
  am:"#D97706", amL:"#FEF3C7", amD:"#92400E",
  rd:"#DC2626", rdL:"#FEE2E2", rdD:"#7F1D1D",
  pu:"#7C3AED", puL:"#EDE9FE",
  te:"#0891B2", teL:"#CFFAFE",
  ro:"#E11D48", roL:"#FFE4E6",
  cy:"#0D9488", cyL:"#CCFBF1",
};

const now = new Date();
const todayStr = now.toISOString().slice(0,10);
const dAgo = n => { const d=new Date(now); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
const dFwd = n => { const d=new Date(now); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const fmt  = n => n>=1000?`${(n/1000).toFixed(1)}tỷ`:`${n}M`;
const vnd  = n => (n||0).toLocaleString("vi-VN");
const matByCode = c => MATERIALS.find(m=>m.code===c);
const fmtK = n => n>=1000?`${(n/1000).toFixed(0)}k`:n;
const daysDiff = s => s ? Math.floor((now-new Date(s))/86400000) : 0;
const newId = arr => arr.length ? Math.max(...arr.map(x=>x.id))+1 : 1;

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════════════════════
const CATALOG = [
  {id:1,brand:"Forest",sku:"FOR-BT35",name:"Motor Cuốn Forest BT35",type:"Cuốn",spec:"35Nm / 230V / IP44",warranty:24,priceAOK:0,pricePSV:0,priceSUP:0,priceGold:2850,pricePlatinum:2650,priceRetail:3600,weight:2.1,stock:48,minOrder:2},
  {id:2,brand:"Forest",sku:"FOR-BT50",name:"Motor Cuốn Forest BT50",type:"Cuốn",spec:"50Nm / 230V / IP44",warranty:24,priceGold:3200,pricePlatinum:2980,priceRetail:4100,weight:2.4,stock:32,minOrder:2},
  {id:3,brand:"Forest",sku:"FOR-ST30",name:"Motor Lật Venetian ST30",type:"Lật",spec:"30Nm / 230V / IP20",warranty:24,priceGold:3600,pricePlatinum:3350,priceRetail:4800,weight:1.8,stock:20,minOrder:1},
  {id:4,brand:"Dooya",sku:"DOO-DT52E",name:"Motor Dooya DT52E",type:"Cuốn",spec:"52Nm / 230V / IP54",warranty:18,priceGold:1850,pricePlatinum:1720,priceRetail:2400,weight:1.9,stock:65,minOrder:5},
  {id:5,brand:"Dooya",sku:"DOO-KT82",name:"Motor Rèm Ngoài KT82",type:"Ngoài trời",spec:"82Nm / 230V / IP65",warranty:18,priceGold:2200,pricePlatinum:2050,priceRetail:2900,weight:2.8,stock:18,minOrder:2},
  {id:6,brand:"PSV",sku:"PSV-M35",name:"Motor PSV M35",type:"Cuốn",spec:"35Nm / 230V / IP44",warranty:12,priceGold:1650,pricePlatinum:1520,priceRetail:2100,weight:2.0,stock:90,minOrder:5},
  {id:7,brand:"SUP",sku:"SUP-T45",name:"Motor SUP T45",type:"Cuốn",spec:"45Nm / 230V / IP44",warranty:12,priceGold:1450,pricePlatinum:1340,priceRetail:1900,weight:1.9,stock:75,minOrder:5},
  {id:8,brand:"AOK",sku:"AOK-AM35",name:"Motor AOK AM35",type:"Cuốn",spec:"35Nm / 110-230V / IP44",warranty:12,priceGold:980,pricePlatinum:900,priceRetail:1350,weight:1.7,stock:120,minOrder:10},
  {id:9,brand:"AOK",sku:"AOK-AM45S",name:"Motor AOK AM45S Smart",type:"Smart",spec:"45Nm / Wifi / App",warranty:12,priceGold:1350,pricePlatinum:1240,priceRetail:1800,weight:1.8,stock:55,minOrder:5},
  {id:10,brand:"Forest",sku:"FOR-RC01",name:"Remote Forest 15ch",type:"Phụ kiện",spec:"433MHz / 15 kênh",warranty:6,priceGold:380,pricePlatinum:350,priceRetail:500,weight:0.1,stock:200,minOrder:10},
];

const DEALERS = [
  {id:1,code:"DL001",name:"Rèm Đẹp Hà Nội",owner:"Nguyễn Trọng Phát",phone:"0901111111",region:"Hà Nội",zone:"Miền Bắc",tier:"Gold",status:"growing",am:"Linh",joined:"2026-01-15",ds:[120,135,125,140,155,35],target:[130,130,130,150,150,150],product:"Forest",upsell:"Dooya",nextContact:dFwd(3),note:"Sắp đủ Platinum",lastOrder:dAgo(3),debt:12,totalDebt:0,email:"remdepha@gmail.com"},
  {id:2,code:"DL002",name:"Rèm Hoàng Gia HCM",owner:"Trần Văn Hùng",phone:"0912222222",region:"TP.HCM",zone:"Miền Nam",tier:"Silver",status:"growing",am:"Sales 2",joined:"2026-03-20",ds:[55,48,62,70,65,18],target:[60,60,65,70,70,70],product:"PSV",upsell:"Forest",nextContact:dFwd(5),note:"Pitch Forest VP dự án",lastOrder:dAgo(7),debt:0,totalDebt:0,email:"hoanggiarem@gmail.com"},
  {id:3,code:"DL003",name:"Nội Thất Ngọc Lan",owner:"Lê Thị Ngọc",phone:"0923333333",region:"Đà Nẵng",zone:"Miền Trung",tier:"Bronze",status:"onboard",am:"Linh",joined:"2026-06-01",ds:[0,0,0,0,0,8],target:[0,0,0,0,0,15],product:"AOK",upsell:"PSV",nextContact:dFwd(1),note:"Training xong — chờ đơn 2",lastOrder:dAgo(5),debt:0,totalDebt:0,email:"ngoclan.nt@gmail.com"},
  {id:4,code:"DL004",name:"Rèm Đức Phát HP",owner:"Phạm Minh Đức",phone:"0934444444",region:"Hải Phòng",zone:"Miền Bắc",tier:"Silver",status:"atrisk",am:"Sales 3",joined:"2026-02-10",ds:[25,22,20,18,22,5],target:[30,30,30,30,30,30],product:"SUP",upsell:"",nextContact:todayStr,note:"⚠️ Không đặt hàng 47 ngày",lastOrder:dAgo(47),debt:35,totalDebt:35,email:"ducphatrm@gmail.com"},
  {id:5,code:"DL005",name:"Rèm Tự Động 365",owner:"Hoàng Văn Tài",phone:"0945555555",region:"Cần Thơ",zone:"Miền Nam",tier:"Platinum",status:"upgrade",am:"Sales 2",joined:"2025-11-05",ds:[180,195,200,210,220,55],target:[180,190,200,210,220,200],product:"Forest",upsell:"Nhiều dòng",nextContact:dFwd(7),note:"Đủ Platinum — gửi chứng nhận",lastOrder:dAgo(2),debt:0,totalDebt:0,email:"rem365.ct@gmail.com"},
  {id:6,code:"DL006",name:"Rèm Miền Tây",owner:"Nguyễn Long",phone:"0956666666",region:"Cần Thơ",zone:"Miền Nam",tier:"Bronze",status:"inactive",am:"Sales 3",joined:"2026-01-20",ds:[12,8,5,3,0,0],target:[20,20,20,20,20,20],product:"AOK",upsell:"",nextContact:dAgo(5),note:"Inactive 62 ngày — win-back",lastOrder:dAgo(62),debt:0,totalDebt:0,email:"remmt@gmail.com"},
];

const DEALS = [
  {id:1,name:"Nguyễn Văn Minh",phone:"0901234567",region:"Hà Nội",zone:"Miền Bắc",source:"Facebook Ads",stage:"s3",stageDt:dAgo(6),lastContact:dAgo(1),sales:"Linh",product:"Forest",budget:50,bant:"Pass",lostCode:"",estVal:0,closeDate:dFwd(14),followup:"Gọi hỏi đọc catalog chưa",note:""},
  {id:2,name:"Trần Thị Hoa",phone:"0912345678",region:"TP.HCM",zone:"Miền Nam",source:"Zalo Ads",stage:"s4",stageDt:dAgo(2),lastContact:dAgo(2),sales:"Sales 2",product:"Dooya",budget:100,bant:"Pass",lostCode:"",estVal:15,closeDate:dFwd(10),followup:"Demo showroom sáng thứ 4",note:""},
  {id:3,name:"Lê Văn Tuấn",phone:"0923456789",region:"Đà Nẵng",zone:"Miền Trung",source:"Referral",stage:"s2",stageDt:dAgo(3),lastContact:dAgo(3),sales:"Linh",product:"AOK",budget:20,bant:"Chưa XĐ",lostCode:"",estVal:0,closeDate:"",followup:"BANT lần 2",note:""},
  {id:4,name:"Phạm Thanh Tùng",phone:"0934567890",region:"Hải Phòng",zone:"Miền Bắc",source:"Landing Page",stage:"s5",stageDt:dAgo(9),lastContact:dAgo(1),sales:"Sales 2",product:"Forest",budget:80,bant:"Pass",lostCode:"",estVal:30,closeDate:dFwd(5),followup:"Escalate SM — stall 9 ngày",note:""},
  {id:5,name:"Hoàng Thị Mai",phone:"0945678901",region:"Cần Thơ",zone:"Miền Nam",source:"Facebook Ads",stage:"lost",stageDt:dAgo(5),lastContact:dAgo(5),sales:"Linh",product:"PSV",budget:0,bant:"Fail",lostCode:"L07",estVal:0,closeDate:"",followup:"Thử lại 60 ngày",note:""},
  {id:6,name:"Vũ Minh Quang",phone:"0956789012",region:"Hà Nội",zone:"Miền Bắc",source:"Zalo Ads",stage:"s1",stageDt:dAgo(0),lastContact:"",sales:"Sales 3",product:"SUP",budget:0,bant:"Chưa XĐ",lostCode:"",estVal:0,closeDate:"",followup:"GỌI NGAY — golden hour!",note:""},
  {id:7,name:"Đặng Thị Lan",phone:"0967890123",region:"TP.HCM",zone:"Miền Nam",source:"Website",stage:"s6",stageDt:dAgo(1),lastContact:dAgo(1),sales:"Sales 2",product:"Forest",budget:120,bant:"Pass",lostCode:"",estVal:45,closeDate:dFwd(3),followup:"Gửi HĐ trong 4 giờ",note:""},
  {id:8,name:"Bùi Văn Khoa",phone:"0978901234",region:"Bình Dương",zone:"Miền Nam",source:"Hội chợ",stage:"s7",stageDt:dAgo(3),lastContact:dAgo(3),sales:"Linh",product:"Dooya",budget:200,bant:"Pass",lostCode:"",estVal:60,closeDate:dAgo(3),followup:"Bàn giao AM",note:""},
];

const ORDERS = [
  {id:1,dealerId:1,code:"PO2026-001",date:dAgo(3),items:[{sku:"FOR-BT35",qty:8,price:2850},{sku:"FOR-RC01",qty:8,price:380}],status:"delivered",paid:26240,total:26240,note:""},
  {id:2,dealerId:2,code:"PO2026-002",date:dAgo(7),items:[{sku:"PSV-M35",qty:15,price:1650},{sku:"AOK-AM35",qty:10,price:980}],status:"delivered",paid:24750,total:34550,note:"Còn nợ 9.8M"},
  {id:3,dealerId:5,code:"PO2026-003",date:dAgo(2),items:[{sku:"FOR-BT50",qty:10,price:2980},{sku:"FOR-ST30",qty:5,price:3350}],status:"processing",paid:0,total:46600,note:"Chờ xuất kho"},
  {id:4,dealerId:4,code:"PO2026-004",date:dAgo(47),items:[{sku:"SUP-T45",qty:12,price:1450}],status:"delivered",paid:0,total:17400,note:"⚠️ Tồn nợ 47 ngày"},
  {id:5,dealerId:1,code:"PO2026-005",date:dAgo(30),items:[{sku:"FOR-BT35",qty:12,price:2850},{sku:"DOO-DT52E",qty:5,price:1850}],status:"delivered",paid:34200,total:43450,note:""},
];

const TICKETS = [
  {id:1,dealerId:4,code:"TK-001",date:dAgo(2),product:"SUP-T45",serial:"SUP45-2024-0891",issue:"Motor không phản hồi remote sau 6 tháng sử dụng",status:"open",priority:"high",tech:"",note:"",resolution:""},
  {id:2,dealerId:2,code:"TK-002",date:dAgo(5),product:"PSV-M35",serial:"PSV35-2025-1234",issue:"Motor chạy 1 chiều, không đảo chiều",status:"inprogress",priority:"medium",tech:"Kỹ thuật 1",note:"Đã kiểm tra remote OK — nghi motor lỗi encoder",resolution:""},
  {id:3,dealerId:1,code:"TK-003",date:dAgo(10),product:"FOR-BT35",serial:"FOR35-2025-0567",issue:"Tiếng ồn bất thường khi vận hành",status:"resolved",priority:"low",tech:"Kỹ thuật 2",note:"",resolution:"Kiểm tra thấy vật cản trong ống trục — đã xử lý. BH còn hiệu lực."},
];

const INSTALLS = [
  {id:1,code:"LD-001",customer:"Anh Minh — Vinhomes Ocean Park",phone:"0901234567",address:"S2.05 Vinhomes Ocean Park, Gia Lâm",region:"Hà Nội",zone:"Miền Bắc",dealerId:1,product:"FOR-BT50",qty:6,date:todayStr,slot:"Sáng (8–11h)",tech:"Kỹ thuật 1",status:"scheduled",note:"6 phòng rèm cuốn — khách VIP"},
  {id:2,code:"LD-002",customer:"Chị Hoa — Masteri Thảo Điền",phone:"0912345678",address:"Tháp T3, Masteri Thảo Điền, Q2",region:"TP.HCM",zone:"Miền Nam",dealerId:2,product:"DOO-DT52E",qty:4,date:todayStr,slot:"Chiều (13–17h)",tech:"Kỹ thuật 2",status:"inprogress",note:"Đang lắp — phòng khách + 3 phòng ngủ"},
  {id:3,code:"LD-003",customer:"Nhà hàng Sen Hồ Tây",phone:"0923456789",address:"614 Lạc Long Quân, Tây Hồ",region:"Hà Nội",zone:"Miền Bắc",dealerId:1,product:"FOR-ST30",qty:10,date:dFwd(1),slot:"Sáng (8–11h)",tech:"Kỹ thuật 1",status:"scheduled",note:"Rèm lật venetian — khu vực sảnh"},
  {id:4,code:"LD-004",customer:"Anh Tài — Biệt thự Cần Thơ",phone:"0945555555",address:"KDC Hưng Phú, Cái Răng",region:"Cần Thơ",zone:"Miền Nam",dealerId:5,product:"FOR-BT35",qty:8,date:dFwd(2),slot:"Chiều (13–17h)",tech:"Kỹ thuật 3",status:"scheduled",note:""},
  {id:5,code:"LD-005",customer:"Văn phòng Ngọc Lan",phone:"0923333333",address:"Hải Châu, Đà Nẵng",region:"Đà Nẵng",zone:"Miền Trung",dealerId:3,product:"AOK-AM35",qty:5,date:dAgo(1),slot:"Sáng (8–11h)",tech:"Kỹ thuật 2",status:"scheduled",note:"⚠️ Quá hẹn — chưa lắp"},
  {id:6,code:"LD-006",customer:"Chị Mai — Chung cư Ninh Kiều",phone:"0945678901",address:"Ninh Kiều, Cần Thơ",region:"Cần Thơ",zone:"Miền Nam",dealerId:5,product:"PSV-M35",qty:3,date:dAgo(3),slot:"Chiều (13–17h)",tech:"Kỹ thuật 3",status:"done",note:"Đã nghiệm thu — khách hài lòng"},
  {id:7,code:"LD-007",customer:"Anh Khoa — Showroom Bình Dương",phone:"0978901234",address:"TP Thủ Dầu Một, Bình Dương",region:"Bình Dương",zone:"Miền Nam",dealerId:2,product:"DOO-KT82",qty:2,date:dFwd(4),slot:"Sáng (8–11h)",tech:"",status:"scheduled",note:"Rèm ngoài trời — chờ phân công KT"},
];

const DELIVERIES = [
  {id:1,code:"GH-001",dealerId:5,orderCode:"PO2026-003",address:"KDC Hưng Phú, Cái Răng",region:"Cần Thơ",zone:"Miền Nam",product:"FOR-BT50 ×10, FOR-ST30 ×5",qty:15,carrier:"Xe tải PSV",date:todayStr,slot:"Sáng (8–11h)",status:"shipping",note:"Đơn PO2026-003 — đang trên đường"},
  {id:2,code:"GH-002",dealerId:2,orderCode:"PO2026-002",address:"Tháp T3, Masteri Thảo Điền, Q2",region:"TP.HCM",zone:"Miền Nam",product:"PSV-M35 ×15, AOK-AM35 ×10",qty:25,carrier:"Giao Hàng Nhanh",date:todayStr,slot:"Chiều (13–17h)",status:"preparing",note:"Chờ đóng gói"},
  {id:3,code:"GH-003",dealerId:1,orderCode:"PO2026-001",address:"Số 12 Trần Duy Hưng, Cầu Giấy",region:"Hà Nội",zone:"Miền Bắc",product:"FOR-BT35 ×8, FOR-RC01 ×8",qty:16,carrier:"Xe tải PSV",date:dFwd(1),slot:"Sáng (8–11h)",status:"preparing",note:""},
  {id:4,code:"GH-004",dealerId:3,orderCode:"",address:"Hải Châu, Đà Nẵng",region:"Đà Nẵng",zone:"Miền Trung",product:"AOK-AM35 ×10",qty:10,carrier:"Viettel Post",date:dFwd(2),slot:"Cả ngày",status:"preparing",note:"Đơn đại lý mới onboard"},
  {id:5,code:"GH-005",dealerId:4,orderCode:"PO2026-004",address:"Lê Chân, Hải Phòng",region:"Hải Phòng",zone:"Miền Bắc",product:"SUP-T45 ×12",qty:12,carrier:"Nhà xe",date:dAgo(1),slot:"Chiều (13–17h)",status:"shipping",note:"⚠️ Quá hẹn giao 1 ngày — nhà xe báo chậm"},
  {id:6,code:"GH-006",dealerId:1,orderCode:"PO2026-005",address:"Số 12 Trần Duy Hưng, Cầu Giấy",region:"Hà Nội",zone:"Miền Bắc",product:"FOR-BT35 ×12, DOO-DT52E ×5",qty:17,carrier:"Xe tải PSV",date:dAgo(3),slot:"Sáng (8–11h)",status:"delivered",note:"Đã giao & ký nhận đủ"},
  {id:7,code:"GH-007",dealerId:5,orderCode:"",address:"Ninh Kiều, Cần Thơ",region:"Cần Thơ",zone:"Miền Nam",product:"AOK-AM45S ×6",qty:6,carrier:"Khách tự lấy",date:dFwd(3),slot:"Chiều (13–17h)",status:"preparing",note:"Đại lý cử người tới kho lấy"},
];

const SALES_TEAM = [
  {id:1,name:"Linh",role:"Sales Senior",avatar:"L",targetMonth:5,targetWeek:2,dealsWon:3,dealsActive:4,dealsLost:1,commission:8,baseCommission:0.05},
  {id:2,name:"Sales 2",role:"Sales Senior",avatar:"2",targetMonth:4,targetWeek:2,dealsWon:2,dealsActive:3,dealsLost:0,commission:6,baseCommission:0.05},
  {id:3,name:"Sales 3",role:"Telesales",avatar:"3",targetMonth:3,targetWeek:1,dealsWon:1,dealsActive:2,dealsLost:1,commission:3,baseCommission:0.04},
  {id:4,name:"Sales Manager",role:"Sales Manager",avatar:"M",targetMonth:15,targetWeek:5,dealsWon:6,dealsActive:9,dealsLost:2,commission:0,baseCommission:0},
];

const FOLLOWUPS = [
  {id:1,dealId:6,type:"call",title:"GỌI NGAY: Vũ Minh Quang",due:now.toISOString().slice(0,10),done:false,priority:"urgent",note:"Data mới — golden hour!"},
  {id:2,dealId:4,type:"escalate",title:"Escalate SM: Phạm Tùng stall 9n",due:now.toISOString().slice(0,10),done:false,priority:"urgent",note:"Cần SM vào cuộc"},
  {id:3,dealId:7,type:"contract",title:"Gửi HĐ: Đặng Thị Lan",due:now.toISOString().slice(0,10),done:false,priority:"high",note:"Chốt rồi — gửi trong 4h"},
  {id:4,dealId:1,type:"call",title:"Follow-up catalog: Nguyễn Văn Minh",due:dFwd(1),done:false,priority:"high",note:"Hỏi đọc tài liệu chưa"},
  {id:5,dealerId:4,type:"call",title:"Liên hệ khẩn: Rèm Đức Phát HP",due:now.toISOString().slice(0,10),done:false,priority:"urgent",note:"Inactive 47 ngày — tìm nguyên nhân"},
];

const STAGES_CFG = [
  {id:"s1",label:"Data Mới",    short:"S1",prob:5,  dot:D.pu, bg:D.puL,  maxDays:1},
  {id:"s2",label:"Liên Lạc",   short:"S2",prob:15, dot:D.bl, bg:D.blL,  maxDays:2},
  {id:"s3",label:"Gửi TL",     short:"S3",prob:30, dot:D.gr, bg:D.grL,  maxDays:5},
  {id:"s4",label:"Demo",        short:"S4",prob:50, dot:D.am, bg:D.amL,  maxDays:3},
  {id:"s5",label:"Đàm Phán",   short:"S5",prob:65, dot:D.rd, bg:D.rdL,  maxDays:7},
  {id:"s6",label:"Đã Chốt",    short:"S6",prob:85, dot:D.gr, bg:"#F0FDF4",maxDays:5},
  {id:"s7",label:"WIN ✓",      short:"S7",prob:100,dot:D.te, bg:D.teL,  maxDays:0},
  {id:"lost",label:"Lost",      short:"✕", prob:0,  dot:D.s400,bg:D.s100,maxDays:0},
];

const DS_STATUS = [
  {id:"onboard", label:"Onboarding",   dot:D.pu, bg:D.puL},
  {id:"growing", label:"Growing",      dot:D.gr, bg:D.grL},
  {id:"upgrade", label:"Nâng Tier",    dot:D.am, bg:D.amL},
  {id:"atrisk",  label:"Rủi ro Churn", dot:D.rd, bg:D.rdL},
  {id:"inactive",label:"Inactive",     dot:D.s400,bg:D.s100},
  {id:"churn",   label:"Churn",        dot:"#CBD5E1",bg:"#F8FAFC"},
];

const INSTALL_STATUS=[
  {id:"scheduled", label:"Đã hẹn",     dot:D.bl,  bg:D.blL},
  {id:"inprogress",label:"Đang lắp",   dot:D.am,  bg:D.amL},
  {id:"done",      label:"Hoàn thành", dot:D.gr,  bg:D.grL},
  {id:"cancelled", label:"Đã huỷ",     dot:D.s400,bg:D.s100},
];
const INSTALL_SLOTS=["Sáng (8–11h)","Chiều (13–17h)","Tối (18–20h)","Cả ngày"];

const DELIVERY_STATUS=[
  {id:"preparing", label:"Chuẩn bị",  dot:D.pu,  bg:D.puL},
  {id:"shipping",  label:"Đang giao", dot:D.am,  bg:D.amL},
  {id:"delivered", label:"Đã giao",   dot:D.gr,  bg:D.grL},
  {id:"cancelled", label:"Đã huỷ",    dot:D.s400,bg:D.s100},
];
const DELIVERY_CARRIERS=["Xe tải PSV","Giao Hàng Nhanh","Viettel Post","Nhà xe","Khách tự lấy"];

const LOST_MAP={L01:"Không đủ vốn",L02:"Không phải người QĐ",L03:"Chọn đối thủ",L04:"Không nhu cầu",L05:"Sai thị trường",L06:"Không hài lòng CS",L07:"Không liên lạc được",L08:"Giá cao hơn ĐT",L09:"Chưa sẵn sàng",L10:"Lý do khác"};
const REGIONS=["Hà Nội","TP.HCM","Đà Nẵng","Hải Phòng","Cần Thơ","Bình Dương","Khác"];
const ZONES=["Miền Bắc","Miền Trung","Miền Nam"];
const PRODUCTS=["Forest","PSV","SUP","Dooya","AOK","Nhiều dòng"];
const SOURCES=["Facebook Ads","Zalo Ads","Landing Page","Website","Referral","Hội chợ","Cold Call","Khác"];
const TIERS=["Bronze","Silver","Gold","Platinum"];
const stageOf=id=>STAGES_CFG.find(s=>s.id===id)||STAGES_CFG[0];
const statusOf=id=>DS_STATUS.find(s=>s.id===id)||DS_STATUS[0];
const installStatusOf=id=>INSTALL_STATUS.find(s=>s.id===id)||INSTALL_STATUS[0];
const deliveryStatusOf=id=>DELIVERY_STATUS.find(s=>s.id===id)||DELIVERY_STATUS[0];

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM — Premium Desktop UI
// ═══════════════════════════════════════════════════════════════════════════════

const glassCard = {
  background:"rgba(255,255,255,0.88)",
  backdropFilter:"blur(16px)",
  WebkitBackdropFilter:"blur(16px)",
  border:"1px solid rgba(255,255,255,0.65)",
  boxShadow:"0 4px 24px rgba(42,7,9,0.07), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
};

const Badge=({label,dot,bg,size="sm"})=>(
  <span style={{display:"inline-flex",alignItems:"center",gap:5,
    padding:size==="sm"?"3px 10px":"5px 14px",borderRadius:20,
    background:bg||D.s100,fontSize:size==="sm"?10:12,fontWeight:700,
    color:D.s800,whiteSpace:"nowrap",
    border:`1px solid ${(dot||D.s400)}22`,
    boxShadow:"inset 0 1px 0 rgba(255,255,255,0.7)"}}>
    <span style={{width:6,height:6,borderRadius:"50%",background:dot||D.s400,flexShrink:0}}/>{label}
  </span>
);

const Tag=({label,color=D.bl,bg=D.blL})=>(
  <span style={{padding:"2px 9px",borderRadius:6,background:bg,color,
    fontSize:10,fontWeight:800,letterSpacing:"0.02em",
    border:`1px solid ${color}22`}}>{label}</span>
);

const Avatar=({name,size=32,bg=D.bg})=>(
  <div style={{width:size,height:size,borderRadius:"50%",
    background:`linear-gradient(135deg,${bg},${D.bg2})`,
    color:D.gold,fontWeight:900,fontSize:size*0.38,
    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
    boxShadow:`0 2px 8px ${bg}55, inset 0 1px 0 rgba(255,255,255,0.15)`}}>
    {name.slice(0,1).toUpperCase()}
  </div>
);

const Btn=({children,onClick,v="primary",sz="md",disabled,full,icon})=>{
  const [h,sh]=useState(false);
  const vs={
    primary:{
      background:h?`linear-gradient(135deg,${D.bg2},${D.bg3})`:`linear-gradient(135deg,${D.bg},${D.bg2})`,
      color:D.gold,border:"none",
      boxShadow:h?"0 8px 24px rgba(42,7,9,0.4), inset 0 1px 0 rgba(255,255,255,0.08)":"0 2px 8px rgba(42,7,9,0.25), inset 0 1px 0 rgba(255,255,255,0.06)"},
    gold:{
      background:h?`linear-gradient(135deg,${D.goldM},${D.gold})`:`linear-gradient(135deg,${D.gold},${D.goldM})`,
      color:D.bg,border:"none",
      boxShadow:h?"0 8px 24px rgba(245,197,66,0.5)":"0 2px 8px rgba(245,197,66,0.3)"},
    ghost:{background:h?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.7)",color:D.s600,
      border:`1px solid ${D.s200}`,backdropFilter:"blur(8px)",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"},
    danger:{background:h?"rgba(254,226,226,0.95)":"rgba(254,226,226,0.8)",
      color:D.rd,border:`1px solid ${D.rd}44`},
    success:{background:h?"rgba(209,250,229,0.95)":"rgba(209,250,229,0.8)",
      color:D.gr,border:`1px solid ${D.gr}44`},
    outline:{background:h?`${D.bg}0a`:"transparent",color:D.bg,
      border:`1.5px solid ${D.bg}88`},
  };
  const szs={
    xs:{padding:"3px 10px",fontSize:11,borderRadius:7},
    sm:{padding:"6px 15px",fontSize:12,borderRadius:9},
    md:{padding:"9px 20px",fontSize:13,borderRadius:10},
    lg:{padding:"12px 28px",fontSize:14,borderRadius:12}};
  return(
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)}
      style={{...vs[v],...szs[sz],fontWeight:700,
        cursor:disabled?"not-allowed":"pointer",opacity:disabled?.45:1,
        fontFamily:"inherit",display:"inline-flex",alignItems:"center",
        gap:7,width:full?"100%":"auto",justifyContent:"center",
        transition:"all .18s cubic-bezier(.4,0,.2,1)",
        transform:h&&!disabled?"translateY(-1px)":"none",letterSpacing:"-0.01em"}}>
      {icon&&<span style={{fontSize:"1.05em",lineHeight:1}}>{icon}</span>}{children}
    </button>
  );
};

const Inp=({label,value,onChange,type="text",opts,ph,rows,note,required})=>{
  const [focused,setF]=useState(false);
  const base={
    padding:"9px 13px",borderRadius:10,fontSize:13,color:D.s900,
    background:focused?"rgba(255,255,255,1)":"rgba(255,255,255,0.85)",
    fontFamily:"inherit",width:"100%",outline:"none",
    border:`1.5px solid ${focused?D.bg:D.s200}`,
    boxShadow:focused?`0 0 0 3px ${D.bg}14, 0 2px 8px rgba(0,0,0,0.04)`:"0 1px 3px rgba(0,0,0,0.03)",
    transition:"all .18s",boxSizing:"border-box"};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:10.5,fontWeight:800,color:D.s500,
        textTransform:"uppercase",letterSpacing:"0.07em",
        display:"flex",alignItems:"center",gap:3}}>
        {label}{required&&<span style={{color:D.rd}}>*</span>}
      </label>}
      {opts?(
        <select value={value} onChange={e=>onChange(e.target.value)}
          onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{...base,appearance:"auto"}}>
          <option value="">— Chọn —</option>
          {opts.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
        </select>
      ):rows?(
        <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows}
          placeholder={ph} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{...base,resize:"vertical"}}/>
      ):(
        <input type={type} value={value} onChange={e=>onChange(e.target.value)}
          placeholder={ph} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={base}/>
      )}
      {note&&<div style={{fontSize:10,color:D.s400}}>{note}</div>}
    </div>
  );
};

const Modal=({title,subtitle,onClose,children,wide,ultra})=>(
  <div style={{position:"fixed",inset:0,zIndex:1000,
    background:"rgba(15,23,42,0.5)",
    backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",
    display:"flex",alignItems:"center",justifyContent:"center",padding:24}}
    onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{
      background:"rgba(255,255,255,0.97)",
      backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
      borderRadius:24,width:"100%",
      maxWidth:ultra?1060:wide?820:560,maxHeight:"92vh",overflow:"auto",
      boxShadow:"0 40px 80px rgba(15,23,42,0.28), 0 0 0 1px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,1)"}}>
      <div style={{
        background:`linear-gradient(135deg,${D.bg} 0%,${D.bg3} 100%)`,
        padding:"20px 28px",borderRadius:"24px 24px 0 0",
        position:"sticky",top:0,zIndex:1,
        boxShadow:"0 4px 20px rgba(42,7,9,0.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{color:D.gold,fontWeight:900,fontSize:16,
              letterSpacing:"-0.02em",textShadow:"0 1px 4px rgba(0,0,0,0.2)"}}>{title}</div>
            {subtitle&&<div style={{color:"rgba(255,248,192,0.5)",fontSize:11,marginTop:4}}>{subtitle}</div>}
          </div>
          <button onClick={onClose}
            style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",
              color:"rgba(245,197,66,0.9)",width:32,height:32,borderRadius:"50%",
              cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",
              transition:"all .15s",lineHeight:1}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}>×</button>
        </div>
      </div>
      <div style={{padding:"28px"}}>{children}</div>
    </div>
  </div>
);

const Card=({children,p=22,style={}})=>(
  <div style={{...glassCard,borderRadius:18,padding:p,...style}}>{children}</div>
);

const SectionTitle=({children,action})=>(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
    <h3 style={{margin:0,fontSize:14,fontWeight:800,color:D.s800,letterSpacing:"-0.01em"}}>{children}</h3>
    {action}
  </div>
);

const KpiTile=({icon,label,value,sub,accent=D.gold,alert,onClick,trend})=>{
  const [h,sh]=useState(false);
  return(
    <div onClick={onClick} onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)}
      style={{
        background:alert
          ?"linear-gradient(145deg,rgba(254,226,226,0.95),rgba(255,242,242,0.9))"
          :"linear-gradient(145deg,rgba(255,255,255,0.95),rgba(248,250,252,0.85))",
        backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
        border:`1px solid ${alert?`rgba(220,38,38,0.2)`:"rgba(255,255,255,0.8)"}`,
        borderRadius:20,padding:"20px 22px",
        cursor:onClick?"pointer":"default",
        transform:h&&onClick?"translateY(-4px)":"none",
        boxShadow:h&&onClick
          ?`0 20px 48px rgba(42,7,9,0.16), 0 4px 12px rgba(42,7,9,0.08), 0 0 0 1px ${accent}22`
          :`0 4px 16px rgba(42,7,9,0.06), 0 1px 4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.9)`,
        transition:"all .22s cubic-bezier(.34,1.56,.64,1)",
        position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,
        background:alert
          ?`linear-gradient(90deg,${D.rd},${D.ro})`
          :`linear-gradient(90deg,${accent},${accent}88)`,
        borderRadius:"20px 20px 0 0"}}/>
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,
        borderRadius:"50%",background:`${alert?D.rd:accent}08`,pointerEvents:"none"}}/>
      <div style={{fontSize:24,marginBottom:10,lineHeight:1}}>{icon}</div>
      <div style={{fontSize:9.5,color:alert?`${D.rd}bb`:D.s400,fontWeight:800,
        textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:5}}>{label}</div>
      <div style={{fontSize:32,fontWeight:900,color:alert?D.rd:D.s900,lineHeight:1,
        letterSpacing:"-0.025em"}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:alert?`${D.rd}99`:D.s400,marginTop:6,
        fontWeight:500,lineHeight:1.4}}>{sub}</div>}
      {trend!==undefined&&<div style={{position:"absolute",top:18,right:18,
        fontSize:10.5,fontWeight:800,
        color:trend>0?D.gr:trend<0?D.rd:D.s400,
        background:trend>0?"rgba(209,250,229,0.9)":trend<0?"rgba(254,226,226,0.9)":"rgba(241,245,249,0.9)",
        padding:"3px 9px",borderRadius:20,backdropFilter:"blur(8px)",
        border:`1px solid ${trend>0?D.gr+"33":trend<0?D.rd+"33":D.s200}`}}>
        {trend>0?"↑":trend<0?"↓":"→"} {Math.abs(trend)}%
      </div>}
      {alert&&<span style={{position:"absolute",top:16,right:h?48:18,
        width:8,height:8,borderRadius:"50%",background:D.rd,
        boxShadow:`0 0 0 3px rgba(220,38,38,0.2), 0 0 10px ${D.rd}88`}}/>}
    </div>
  );
};

const Divider=({label})=>(
  <div style={{display:"flex",alignItems:"center",gap:14,margin:"24px 0 20px"}}>
    <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${D.s200}88)`}}/>
    {label&&<span style={{fontSize:9.5,color:D.s400,fontWeight:800,textTransform:"uppercase",
      letterSpacing:"0.1em",whiteSpace:"nowrap",
      padding:"3px 14px",background:"rgba(248,250,252,0.9)",
      borderRadius:20,border:`1px solid ${D.s200}`,
      backdropFilter:"blur(8px)"}}>{label}</span>}
    <div style={{flex:1,height:1,background:`linear-gradient(90deg,${D.s200}88,transparent)`}}/>
  </div>
);

const ProgressBar=({value,max,color=D.gr,height=6,showLabel=false})=>{
  const pct=max>0?Math.min(100,Math.round(value/max*100)):0;
  const c=pct>=100?D.gr:pct>=70?D.am:D.rd;
  return(
    <div>
      {showLabel&&<div style={{display:"flex",justifyContent:"space-between",
        fontSize:10,color:D.s500,marginBottom:4,fontWeight:600}}>
        <span>{value}</span>
        <span style={{color:c,fontWeight:800}}>{pct}%</span>
      </div>}
      <div style={{background:`${D.s100}`,borderRadius:99,height,overflow:"hidden",
        boxShadow:"inset 0 1px 3px rgba(0,0,0,0.07)"}}>
        <div style={{width:`${pct}%`,height:"100%",
          background:`linear-gradient(90deg,${c},${c}cc)`,
          borderRadius:99,transition:"width .6s cubic-bezier(.4,0,.2,1)",
          boxShadow:`0 1px 4px ${c}66`}}/>
      </div>
    </div>
  );
};

const Sparkline=({data,color=D.bg,height=32})=>{
  const max=Math.max(...data,1);
  const pts=data.map((v,i)=>[Math.round((i/(data.length-1))*100),Math.round((height-4)-(v/max*(height-8))+2)]);
  const safeId=`sg${color.replace(/[^a-zA-Z0-9]/g,"")}`;
  return(
    <svg width="100%" height={height} preserveAspectRatio="none" style={{overflow:"visible"}}>
      <defs>
        <linearGradient id={safeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon fill={`url(#${safeId})`}
        points={[`0,${height}`,...pts.map(p=>`${p[0]}%,${p[1]}`),"100%,"+height].join(" ")}/>
      <polyline fill="none" stroke={color} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round"
        points={pts.map(p=>`${p[0]}%,${p[1]}`).join(" ")}/>
      {pts.length>0&&<circle cx={`${pts[pts.length-1][0]}%`} cy={pts[pts.length-1][1]}
        r={3.5} fill={color} stroke="white" strokeWidth={2}/>}
    </svg>
  );
};

const Toast=({msg,type="success",onClose})=>(
  <div style={{position:"fixed",bottom:28,right:28,zIndex:2000,
    background:type==="success"
      ?"linear-gradient(135deg,rgba(236,253,245,0.98),rgba(209,250,229,0.95))"
      :type==="danger"
      ?"linear-gradient(135deg,rgba(255,241,241,0.98),rgba(254,226,226,0.95))"
      :"linear-gradient(135deg,rgba(255,251,235,0.98),rgba(254,243,199,0.95))",
    border:`1px solid ${type==="success"?D.gr:type==="danger"?D.rd:D.am}33`,
    borderRadius:16,padding:"15px 20px",fontWeight:700,
    color:type==="success"?D.gr:type==="danger"?D.rd:D.am,
    boxShadow:"0 20px 48px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.9)",
    display:"flex",gap:10,alignItems:"center",fontSize:13,
    backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",minWidth:280}}>
    <span style={{fontSize:20,lineHeight:1}}>{type==="success"?"✓":type==="danger"?"✕":"!"}</span>
    <span style={{flex:1,lineHeight:1.4}}>{msg}</span>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",
      color:"inherit",fontSize:18,opacity:0.5,marginLeft:4,lineHeight:1,
      padding:0}}>×</button>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// AI ADVISOR
// ═══════════════════════════════════════════════════════════════════════════════
const getAIAdvice=(situation,deals,dealers)=>{
  const stall=deals.filter(d=>!["s7","lost"].includes(d.stage)&&daysDiff(d.stageDt)>7);
  const churn=dealers.filter(d=>["atrisk","inactive"].includes(d.status));
  const s=situation.toLowerCase();

  if(s.includes("không chốt")||s.includes("từ chối")||s.includes("không quyết định"))
    return{action:"🎯 Xử lý Objection",steps:["Hỏi thẳng: 'Điều gì ngăn anh/chị quyết định hôm nay?'","Xác định objection cụ thể (giá/vốn/rủi ro/người quyết định)","Dùng script xử lý từ chối tương ứng (xem tab Scripts)","Tạo urgency nhẹ: deadline ưu đãi đại lý mới","Đề xuất gói thử nghiệm nhỏ 15-20M nếu vướng vốn"],priority:"high"};
  if(s.includes("stall")||s.includes("không tiến"))
    return{action:"⬆️ Escalate & Re-engage",steps:["Báo ngay Sales Manager nếu stall >7 ngày","Thay đổi người liên lạc (SM gọi trực tiếp tạo ấn tượng mới)","Gửi case study đại lý thành công cùng khu vực","Đặt câu hỏi mở: 'Từ lần gặp vừa rồi, anh/chị đang nghĩ đến điều gì?'","Nếu >14 ngày: đề xuất lịch cụ thể hoặc chuyển sang nurture"],priority:"urgent"};
  if(s.includes("churn")||s.includes("inactive")||s.includes("không đặt hàng"))
    return{action:"🔄 Win-Back Campaign",steps:["Gọi ngay trong 24h — không để kéo dài thêm","Lắng nghe nguyên nhân thực sự (không phán xét)","Đề xuất giải pháp tùy nguyên nhân: vốn/chậm bán/dịch vụ","Tặng vật tư lắp đặt hoặc hỗ trợ marketing địa phương","Đặt mốc cụ thể: đơn hàng nhỏ trong 7 ngày để reactivate"],priority:"urgent"};
  if(s.includes("giá")||s.includes("đắt")||s.includes("cạnh tranh"))
    return{action:"💡 Value Positioning",steps:["KHÔNG giảm giá ngay — thương lượng bằng giá trị","So sánh TCO: Forest 2 năm BH vs hàng rẻ 6 tháng phải thay","Tính ROI cụ thể theo số lượng công trình khu vực","Đề xuất combo Forest + AOK (cao-thấp) để phủ nhiều phân khúc","Giới thiệu đại lý thành công bán Forest với margin tốt"],priority:"high"};
  if(s.includes("demo")||s.includes("gặp mặt")||s.includes("showroom"))
    return{action:"🎬 Demo Preparation",steps:["Chuẩn bị: mẫu Forest BT35/50 + Dooya DT52E + AOK AM35","Mang remote và tablet chạy video lắp đặt thực tế","Tính ROI riêng cho khu vực của khách (số công trình/tháng)","Câu hỏi đóng sau demo: 'Dòng nào phù hợp nhất với khách của anh/chị?'","Chụp ảnh mẫu gửi Zalo ngay sau khi ra về"],priority:"medium"};
  if(s.includes("nợ")||s.includes("công nợ")||s.includes("chưa thanh toán"))
    return{action:"💰 Debt Collection",steps:["Gọi điện ngay — không nhắn tin (dễ bị ignore)","Nhắc lịch thanh toán đã cam kết, không phán xét","Đề xuất trả góp nếu đại lý gặp khó khăn tạm thời","Tạm dừng đơn hàng mới cho đến khi xử lý công nợ","Escalate lên SM nếu >30 ngày không giải quyết"],priority:"urgent"};

  // Default contextual
  const topIssue=stall.length>0?"stall deals":churn.length>0?"churn risk":"growth optimization";
  return{action:"📋 General Action Plan",steps:[
    stall.length>0?`Ưu tiên 1: Xử lý ${stall.length} deal stall quá 7 ngày`:"Pipeline đang tốt — tập trung tăng deal mới",
    churn.length>0?`Ưu tiên 2: Liên hệ ${churn.length} đại lý có rủi ro churn`:"Tiếp tục nurture đại lý Growing lên tier cao hơn",
    "Tổ chức Monday Meeting để review pipeline tuần này",
    "Cập nhật lý do rớt cho deal Lost để cải thiện script",
    "Lên lịch follow-up cho tất cả deal chưa có ngày tiếp theo",
  ],priority:"medium"};
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEWS
// ═══════════════════════════════════════════════════════════════════════════════

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
const Dashboard=({S,dispatch,setTab,openModal,toast})=>{
  const {deals,dealers,orders,tickets,followups}=S;
  const active=deals.filter(d=>!["lost","s7"].includes(d.stage));
  const stall=deals.filter(d=>!["s7","lost"].includes(d.stage)&&daysDiff(d.stageDt)>7);
  const wins=deals.filter(d=>d.stage==="s7");
  const pipeVal=active.reduce((a,d)=>a+(+d.estVal||0),0);
  const overdue=followups.filter(f=>!f.done&&f.due<=todayStr);
  const churn=dealers.filter(d=>["atrisk","inactive"].includes(d.status));
  const openTickets=tickets.filter(t=>t.status!=="resolved");
  const totalDebt=dealers.reduce((a,d)=>a+(+d.debt||0),0);
  const thisMonthDS=dealers.reduce((a,d)=>a+(d.ds[d.ds.length-1]||0),0);
  const prevMonthDS=dealers.reduce((a,d)=>a+(d.ds[d.ds.length-2]||0),0);
  const dsTrend=prevMonthDS>0?Math.round((thisMonthDS-prevMonthDS)/prevMonthDS*100):0;

  const funnelData=STAGES_CFG.filter(s=>!["lost"].includes(s.id)).map(s=>({
    name:s.short,label:s.label,count:deals.filter(d=>d.stage===s.id).length,fill:s.dot,prob:s.prob,
  }));
  const monthlyDS=["T1","T2","T3","T4","T5","T6"].map((m,i)=>({
    name:m,DS:dealers.reduce((a,d)=>a+(d.ds[i]||0),0),Target:dealers.reduce((a,d)=>a+(d.target?.[i]||0),0),
  }));
  const zoneData=ZONES.map(z=>({name:z.replace("Miền ",""),DS:dealers.filter(d=>d.zone===z).reduce((a,d)=>a+(d.ds[d.ds.length-1]||0),0),count:dealers.filter(d=>d.zone===z).length}));
  const tierData=TIERS.map(t=>({name:t,value:dealers.filter(d=>d.tier===t).length,ds:dealers.filter(d=>d.tier===t).reduce((a,d)=>a+(d.ds[d.ds.length-1]||0),0)}));
  const PIE_C=[D.s300,D.bl,D.gold,D.bg];

  return(
    <div style={{display:"grid",gap:20}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:900,color:D.s900}}>Dashboard</h2>
          <p style={{margin:"4px 0 0",color:D.s400,fontSize:13}}>{now.toLocaleDateString("vi-VN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {overdue.length>0&&<div style={{background:D.rdL,border:`1px solid ${D.rd}`,borderRadius:9,padding:"6px 12px",fontSize:12,fontWeight:700,color:D.rd}}>🔥 {overdue.length} việc cần làm ngay</div>}
          <Btn v="ghost" sz="sm" onClick={()=>setTab("monday")}>☕ Meeting</Btn>
          <Btn v="gold" sz="sm" onClick={()=>openModal("newDeal")}>+ Deal mới</Btn>
        </div>
      </div>

      {/* KPI row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:12}}>
        <KpiTile icon="🔄" label="Deal Active" value={active.length} sub={`Pipeline: ${fmt(pipeVal)}`} accent={D.bl} onClick={()=>setTab("pipeline")}/>
        <KpiTile icon="⚠️" label="Stall >7n" value={stall.length} sub="Escalate ngay" accent={D.rd} alert={stall.length>0} onClick={()=>setTab("pipeline")}/>
        <KpiTile icon="🏆" label="WIN tháng" value={wins.length} sub={`CR: ${deals.length?Math.round(wins.length/deals.length*100):0}%`} accent={D.gr}/>
        <KpiTile icon="📋" label="Việc hôm nay" value={overdue.length} sub="Follow-up overdue" accent={D.am} alert={overdue.length>0} onClick={()=>setTab("followup")}/>
        <KpiTile icon="📦" label="DS tháng này" value={`${thisMonthDS}M`} sub={`${prevMonthDS}M T.trước`} accent={D.te} trend={dsTrend}/>
        <KpiTile icon="💰" label="Tổng nợ ĐL" value={`${totalDebt}M`} sub="Công nợ tồn đọng" accent={D.rd} alert={totalDebt>0} onClick={()=>setTab("orders")}/>
        <KpiTile icon="🎫" label="Ticket mở" value={openTickets.length} sub="BH & kỹ thuật" accent={D.pu} alert={openTickets.filter(t=>t.priority==="high").length>0} onClick={()=>setTab("tickets")}/>
        <KpiTile icon="🤝" label="Đại lý" value={dealers.length} sub={`${churn.length} churn risk`} accent={D.cy} alert={churn.length>0} onClick={()=>setTab("dealers")}/>
      </div>

      {/* Charts */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <Card>
          <SectionTitle>Doanh số mạng lưới vs Target (Triệu đồng)</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyDS} margin={{top:0,right:0,bottom:0,left:-15}}>
              <CartesianGrid strokeDasharray="3 3" stroke={D.s100} vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:11,fill:D.s400}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:D.s400}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:8,border:`1px solid ${D.s200}`,fontSize:12}} formatter={v=>[`${v}M`]}/>
              <Bar dataKey="DS" fill={D.bg} radius={[4,4,0,0]} name="Thực tế"/>
              <Bar dataKey="Target" fill={D.goldL} radius={[4,4,0,0]} name="Target" opacity={0.6}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle>Phân bổ Tier</SectionTitle>
          <PieChart width={160} height={160} style={{margin:"0 auto"}}>
            <Pie data={tierData} cx={75} cy={75} innerRadius={35} outerRadius={70} dataKey="value" paddingAngle={3}>
              {tierData.map((_,i)=><Cell key={i} fill={PIE_C[i]}/>)}
            </Pie>
            <Tooltip formatter={(v,n,p)=>[`${v} ĐL · ${p.payload.ds}M`,p.payload.name]}/>
          </PieChart>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginTop:8}}>
            {tierData.map((t,i)=>(
              <div key={t.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}>
                <span style={{width:8,height:8,borderRadius:2,background:PIE_C[i],flexShrink:0}}/>
                <span style={{color:D.s600}}>{t.name}: <b style={{color:D.s900}}>{t.value}</b></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
        {/* Funnel */}
        <Card>
          <SectionTitle>Pipeline Funnel</SectionTitle>
          <div style={{display:"flex",gap:2,alignItems:"flex-end",height:100}}>
            {funnelData.map(s=>{
              const maxC=Math.max(...funnelData.map(x=>x.count),1);
              const h=s.count>0?Math.max(16,Math.round(s.count/maxC*90)):6;
              return(
                <div key={s.name} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:12,fontWeight:800,color:s.count>0?D.s900:D.s200}}>{s.count}</div>
                  <div style={{width:"100%",height:h,background:s.count>0?s.fill:D.s100,borderRadius:"3px 3px 0 0",opacity:s.count>0?1:0.4}}/>
                  <div style={{fontSize:9,color:D.s400,fontWeight:600}}>{s.name}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Zone breakdown */}
        <Card>
          <SectionTitle>Doanh số theo vùng</SectionTitle>
          {zoneData.map((z,i)=>(
            <div key={z.name} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:600,color:D.s700}}>Miền {z.name}</span>
                <span style={{fontSize:12,color:D.s500}}>{z.count} ĐL · <b style={{color:D.s900}}>{z.DS}M</b></span>
              </div>
              <ProgressBar value={z.DS} max={Math.max(...zoneData.map(x=>x.DS),1)} color={[D.bl,D.am,D.gr][i]} height={8}/>
            </div>
          ))}
        </Card>

        {/* Alert summary */}
        <Card>
          <SectionTitle>🔔 Cần xử lý ngay</SectionTitle>
          <div style={{display:"grid",gap:8}}>
            {[
              {label:`${stall.length} deal stall`,sub:"Quá 7 ngày tại stage",color:D.rd,bg:D.rdL,tab:"pipeline",show:stall.length>0},
              {label:`${openTickets.filter(t=>t.priority==="high").length} ticket khẩn`,sub:"BH & lỗi kỹ thuật",color:D.pu,bg:D.puL,tab:"tickets",show:openTickets.filter(t=>t.priority==="high").length>0},
              {label:`${totalDebt}M tổng nợ`,sub:"Đại lý chưa thanh toán",color:D.am,bg:D.amL,tab:"orders",show:totalDebt>0},
              {label:`${churn.length} churn risk`,sub:"Cần liên lạc gấp",color:D.rd,bg:D.rdL,tab:"dealers",show:churn.length>0},
            ].filter(x=>x.show).map(a=>(
              <div key={a.label} onClick={()=>setTab(a.tab)} style={{background:a.bg,border:`1px solid ${a.color}22`,borderRadius:9,padding:"10px 12px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontWeight:700,fontSize:13,color:a.color}}>{a.label}</div><div style={{fontSize:11,color:D.s500}}>{a.sub}</div></div>
                <span style={{color:a.color,fontSize:16}}>→</span>
              </div>
            ))}
            {stall.length===0&&churn.length===0&&totalDebt===0&&<div style={{color:D.gr,fontSize:13,fontWeight:600,textAlign:"center",padding:16}}>✓ Không có cảnh báo khẩn cấp</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── PIPELINE KANBAN ───────────────────────────────────────────────────────────
const PipelineView=({S,dispatch,openModal})=>{
  const [fs,setFs]=useState({sales:"",region:"",product:"",bant:"",search:""});
  const {deals}=S;
  const filtered=useMemo(()=>deals.filter(d=>
    (!fs.sales||d.sales===fs.sales)&&(!fs.region||d.region===fs.region)&&
    (!fs.product||d.product===fs.product)&&(!fs.bant||d.bant===fs.bant)&&
    (!fs.search||d.name.toLowerCase().includes(fs.search.toLowerCase())||d.phone.includes(fs.search))
  ),[deals,fs]);
  const F=(k,v)=>setFs(f=>({...f,[k]:v}));
  const stall=filtered.filter(d=>!["s7","lost"].includes(d.stage)&&daysDiff(d.stageDt)>7).length;
  const pv=filtered.filter(d=>!["s7","lost"].includes(d.stage)).reduce((a,d)=>a+(+d.estVal||0),0);

  return(
    <div style={{display:"grid",gap:16}}>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>Pipeline A — Tuyển Đại Lý Mới</h2>
        <div style={{flex:1}}/>
        <input value={fs.search} onChange={e=>F("search",e.target.value)} placeholder="🔍 Tìm tên, SĐT..."
          style={{padding:"7px 12px",borderRadius:9,border:`1px solid ${D.s200}`,fontSize:12,width:180,fontFamily:"inherit"}}/>
        {[["sales","Sales",["Linh","Sales 2","Sales 3","Sales Manager"]],["region","Khu vực",REGIONS],["product","Sản phẩm",PRODUCTS],["bant","BANT",["Pass","Fail","Chưa XĐ"]]].map(([k,ph,opts])=>(
          <select key={k} value={fs[k]} onChange={e=>F(k,e.target.value)}
            style={{padding:"7px 10px",borderRadius:9,border:`1px solid ${D.s200}`,fontSize:12,fontFamily:"inherit",color:fs[k]?D.bg:D.s400,background:fs[k]?D.goldLL:D.w}}>
            <option value="">{ph}</option>
            {opts.map(o=><option key={o}>{o}</option>)}
          </select>
        ))}
        <Btn v="gold" sz="sm" onClick={()=>openModal("newDeal")} icon="➕">Deal mới</Btn>
      </div>

      {/* Stats bar */}
      <div style={{display:"flex",gap:20,padding:"10px 18px",background:D.w,borderRadius:10,border:`1px solid ${D.s200}`,flexWrap:"wrap",fontSize:13}}>
        <span style={{color:D.s600}}><b style={{color:D.s900}}>{filtered.filter(d=>!["s7","lost"].includes(d.stage)).length}</b> active</span>
        <span style={{color:D.s600}}>Pipeline: <b style={{color:D.te}}>{fmt(pv)}</b></span>
        <span style={{color:stall>0?D.rd:D.gr}}><b>{stall}</b> stall {stall>0?"⚠️":"✓"}</span>
        <span style={{color:D.s600}}>WIN: <b style={{color:D.gr}}>{filtered.filter(d=>d.stage==="s7").length}</b></span>
        <span style={{color:D.s600}}>Lost: <b style={{color:D.rd}}>{filtered.filter(d=>d.stage==="lost").length}</b></span>
        <span style={{color:D.s600}}>CR: <b>{deals.length?Math.round(deals.filter(d=>d.stage==="s7").length/deals.length*100):0}%</b></span>
      </div>

      {/* Kanban */}
      <div style={{overflowX:"auto",paddingBottom:8}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${STAGES_CFG.length},minmax(190px,1fr))`,gap:10,minWidth:1540}}>
          {STAGES_CFG.map(sg=>{
            const cards=filtered.filter(d=>d.stage===sg.id);
            const val=cards.reduce((a,d)=>a+(+d.estVal||0),0);
            return(
              <div key={sg.id}>
                <div style={{background:sg.bg,border:`1px solid ${sg.dot}33`,borderRadius:"12px 12px 0 0",padding:"10px 13px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:800,fontSize:12,color:D.s900}}>{sg.short} {sg.label}</span>
                    <span style={{background:sg.dot,color:D.w,borderRadius:20,padding:"1px 9px",fontSize:11,fontWeight:700}}>{cards.length}</span>
                  </div>
                  <div style={{fontSize:10,color:D.s500,marginTop:2}}>{sg.prob>0?`${sg.prob}% `:""}{val>0?`· ${fmt(val)}`:""}</div>
                </div>
                <div style={{background:"#ECF0F7",borderRadius:"0 0 12px 12px",padding:8,minHeight:160,border:`1px solid ${sg.dot}22`,borderTop:"none"}}>
                  {cards.map(d=>{
                    const days=daysDiff(d.stageDt);
                    const isStall=days>sg.maxDays&&sg.maxDays>0;
                    const isWarn=days>Math.round(sg.maxDays*.7)&&sg.maxDays>0;
                    return(
                      <div key={d.id} onClick={()=>openModal("editDeal",d)}
                        style={{background:D.w,border:`1.5px solid ${isStall?D.rd:D.s200}`,borderLeft:`4px solid ${sg.dot}`,borderRadius:10,padding:"11px 13px",cursor:"pointer",marginBottom:8,transition:"all .15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,0.1)";e.currentTarget.style.transform="translateY(-1px)";}}
                        onMouseLeave={e=>{e.currentTarget.style.boxShadow="";e.currentTarget.style.transform="";}}>
                        <div style={{fontWeight:700,fontSize:13,color:D.s900,marginBottom:2}}>{d.name}</div>
                        <div style={{fontSize:11,color:D.s400,marginBottom:7}}>{d.region} · {d.product||"—"}</div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                            {d.bant==="Pass"&&<Tag label="BANT✓" color={D.gr} bg={D.grL}/>}
                            {d.sales&&<span style={{fontSize:10,color:D.s400}}>{d.sales}</span>}
                          </div>
                          <span style={{fontSize:11,fontWeight:800,color:isStall?D.rd:isWarn?D.am:D.gr}}>
                            {days===0?"Hôm nay":`${days}n`}{isStall?" ⚠️":isWarn?" 🟡":""}
                          </span>
                        </div>
                        {d.estVal>0&&<div style={{fontSize:11,fontWeight:700,color:D.te,marginTop:5}}>💰 {d.estVal}M</div>}
                        {d.followup&&<div style={{fontSize:10,color:D.s400,marginTop:5,paddingTop:5,borderTop:`1px solid ${D.s100}`}}>→ {d.followup.slice(0,48)}{d.followup.length>48?"…":""}</div>}
                      </div>
                    );
                  })}
                  <button onClick={()=>openModal("newDeal",{stage:sg.id})}
                    style={{width:"100%",background:"none",border:`1px dashed ${D.s300}`,borderRadius:9,padding:"7px",fontSize:11,color:D.s400,cursor:"pointer",fontFamily:"inherit"}}>
                    + Thêm vào {sg.short}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── VẬT TƯ & BÁO GIÁ (dữ liệu thật từ "Danh sách vật tư PSV.xlsx") ────────────
const CatalogView=({S,dispatch,toast})=>{
  const [tab,setTab]=useState("catalog");
  const [quoteItems,setQI]=useState([]);
  const [quoteCustomer,setQC]=useState("");
  const [search,setSr]=useState("");
  const [grp,setGrp]=useState("");
  const [openDesc,setOpenDesc]=useState(null);

  const filtered=MATERIALS.filter(p=>
    (!grp||p.group===grp)&&
    (!search||p.name.toLowerCase().includes(search.toLowerCase())||p.code.toLowerCase().includes(search.toLowerCase())||(p.desc||"").toLowerCase().includes(search.toLowerCase()))
  );

  const addToQuote=(p)=>{setQI(qi=>{const ex=qi.find(i=>i.id===p.id);if(ex)return qi.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i);return[...qi,{id:p.id,code:p.code,name:p.name,desc:p.desc,unit:p.unit,price:p.price,qty:1,discount:0}];});toast&&toast(`Đã thêm ${p.code} vào báo giá`);};
  const removeFromQuote=id=>setQI(qi=>qi.filter(i=>i.id!==id));
  const updateQty=(id,qty)=>setQI(qi=>qi.map(i=>i.id===id?{...i,qty:Math.max(1,+qty||1)}:i));
  const updateDiscount=(id,d)=>setQI(qi=>qi.map(i=>i.id===id?{...i,discount:Math.min(50,Math.max(0,+d||0))}:i));

  const quoteSub=quoteItems.reduce((a,i)=>a+i.qty*i.price,0);
  const quoteDisc=quoteItems.reduce((a,i)=>a+i.qty*i.price*i.discount/100,0);
  const quoteTotal=quoteSub-quoteDisc;

  const printQuote=()=>{
    const win=window.open("","_blank"); if(!win) return;
    win.document.write(`<html><head><title>Bao gia PSV HOME</title><style>
      body{font-family:Arial,sans-serif;padding:40px;color:#111}
      h1{color:#2A0709}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th{background:#2A0709;color:#F5C542;padding:9px;text-align:left;font-size:12px}
      td{padding:7px 9px;border-bottom:1px solid #eee;font-size:12px;vertical-align:top}
      .r{text-align:right}.total{font-weight:bold;font-size:14px;color:#2A0709}
      .desc{color:#666;font-size:10px;white-space:pre-line;margin-top:3px}
      .footer{margin-top:30px;font-size:11px;color:#888}
    </style></head><body>
      <h1>PSV HOME — BÁO GIÁ VẬT TƯ</h1>
      <p><b>Khách hàng:</b> ${quoteCustomer||"—"} &nbsp;|&nbsp; <b>Ngày:</b> ${todayStr}</p>
      <table><thead><tr><th>Mã VT</th><th>Tên & diễn giải</th><th>ĐVT</th><th class="r">SL</th><th class="r">Đơn giá</th><th class="r">Giảm</th><th class="r">Thành tiền</th></tr></thead>
      <tbody>${quoteItems.map(i=>`<tr><td>${i.code}</td><td><b>${i.name}</b>${i.desc?`<div class="desc">${i.desc}</div>`:""}</td><td>${i.unit||""}</td><td class="r">${i.qty}</td><td class="r">${i.price.toLocaleString("vi-VN")}</td><td class="r">${i.discount}%</td><td class="r">${Math.round(i.qty*i.price*(1-i.discount/100)).toLocaleString("vi-VN")}</td></tr>`).join("")}
      <tr><td colspan="6" class="total r">TỔNG CỘNG (VNĐ)</td><td class="total r">${Math.round(quoteTotal).toLocaleString("vi-VN")}</td></tr>
      </tbody></table>
      <div class="footer"><p>PSV HOME — Phân phối Motor Rèm Tự Động Forest · PSV · SUP · Dooya · AOK · SOMFY</p><p>Báo giá có hiệu lực 7 ngày. Giá theo Giá Đại Lý, chưa gồm VAT (nếu có).</p></div>
    </body></html>`);
    win.document.close();win.print();
  };

  return(
    <div style={{display:"grid",gap:20}}>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>Vật tư & Báo Giá</h2>
        <span style={{fontSize:12,color:D.s400}}>{MATERIALS.length} mã vật tư</span>
        <div style={{flex:1}}/>
        <div style={{display:"flex",gap:1,borderRadius:9,overflow:"hidden",border:`1px solid ${D.s200}`}}>
          {["catalog","quote"].map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"7px 18px",border:"none",background:tab===t?D.bg:D.w,color:tab===t?D.gold:D.s600,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{t==="catalog"?"📦 Danh mục vật tư":"📄 Báo giá"+(quoteItems.length?` (${quoteItems.length})`:"")} </button>)}
        </div>
      </div>

      {tab==="catalog"&&(
        <div style={{display:"grid",gap:16}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <input value={search} onChange={e=>setSr(e.target.value)} placeholder="🔍 Tìm mã, tên, diễn giải vật tư..."
              style={{padding:"7px 12px",borderRadius:9,border:`1px solid ${D.s200}`,fontSize:12,flex:1,minWidth:220,fontFamily:"inherit"}}/>
            <select value={grp} onChange={e=>setGrp(e.target.value)} style={{padding:"7px 10px",borderRadius:9,border:`1px solid ${D.s200}`,fontSize:12,fontFamily:"inherit",maxWidth:340}}>
              <option value="">Tất cả nhóm ({MATERIALS.length})</option>
              {MATERIAL_GROUPS.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
            <div style={{fontSize:12,color:D.s500,display:"flex",alignItems:"center"}}>{filtered.length} kết quả</div>
          </div>

          <Card p={0} style={{overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:D.bg}}>
                  {["Mã VT","Loại","Tên vật tư & diễn giải","ĐVT","Giá đại lý (VNĐ)",""].map(h=>(
                    <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:D.gold,textTransform:"uppercase",letterSpacing:"0.03em",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p,ri)=>(
                  <tr key={p.code+ri} style={{borderBottom:`1px solid ${D.s100}`,background:ri%2===0?D.w:D.s50}}>
                    <td style={{padding:"9px 14px",fontFamily:"monospace",fontSize:12,color:D.s700,fontWeight:700,whiteSpace:"nowrap"}}>{p.code}</td>
                    <td style={{padding:"9px 14px"}}><Tag label={p.type||"—"} color={D.s600} bg={D.s100}/></td>
                    <td style={{padding:"9px 14px",maxWidth:440}}>
                      <div style={{fontWeight:600,fontSize:13,color:D.s900}}>{p.name}</div>
                      {p.desc&&<div style={{fontSize:11,color:D.s500,marginTop:3,whiteSpace:"pre-line",cursor:"pointer"}} onClick={()=>setOpenDesc(openDesc===p.code?null:p.code)}>{openDesc===p.code?p.desc:(p.desc.split("\n")[0]+(p.desc.includes("\n")?" … (xem thêm)":""))}</div>}
                      <div style={{fontSize:10,color:D.s400,marginTop:2}}>{p.group}</div>
                    </td>
                    <td style={{padding:"9px 14px",fontSize:12,color:D.s600,whiteSpace:"nowrap"}}>{p.unit}</td>
                    <td style={{padding:"9px 14px",fontWeight:800,fontSize:14,color:D.bg,whiteSpace:"nowrap"}}>{p.price?p.price.toLocaleString("vi-VN"):"—"}</td>
                    <td style={{padding:"9px 14px"}}><Btn v="outline" sz="xs" onClick={()=>{addToQuote(p);}}>+ Báo giá</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab==="quote"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20}}>
          <div style={{display:"grid",gap:16}}>
            <Card>
              <div style={{marginBottom:16}}>
                <Inp label="Tên khách hàng / đại lý" value={quoteCustomer} onChange={setQC} ph="Nguyễn Văn A — Rèm ABC"/>
              </div>
              {quoteItems.length===0?(
                <div style={{textAlign:"center",padding:40,color:D.s400}}>
                  <div style={{fontSize:32,marginBottom:8}}>📦</div>
                  <div style={{fontWeight:600}}>Chưa có vật tư trong báo giá</div>
                  <Btn v="outline" sz="sm" onClick={()=>setTab("catalog")} style={{marginTop:12}}>← Chọn vật tư</Btn>
                </div>
              ):(
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:D.s50}}>{["Vật tư","Đơn giá","SL","Giảm %","Thành tiền",""].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:700,color:D.s500,borderBottom:`1px solid ${D.s200}`}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {quoteItems.map(i=>(
                      <tr key={i.id} style={{borderBottom:`1px solid ${D.s100}`}}>
                        <td style={{padding:"10px 10px"}}><div style={{fontWeight:600,fontSize:13,color:D.s900}}>{i.name}</div><div style={{fontSize:11,color:D.s400}}>{i.code} · {i.unit}</div></td>
                        <td style={{padding:"10px 10px",fontSize:13,fontWeight:700,color:D.bg,whiteSpace:"nowrap"}}>{i.price.toLocaleString("vi-VN")}</td>
                        <td style={{padding:"10px 10px"}}><input type="number" value={i.qty} min={1} onChange={e=>updateQty(i.id,e.target.value)} style={{width:56,padding:"5px 8px",borderRadius:7,border:`1px solid ${D.s200}`,fontSize:13,textAlign:"center",fontFamily:"inherit"}}/></td>
                        <td style={{padding:"10px 10px"}}><input type="number" value={i.discount} min={0} max={50} onChange={e=>updateDiscount(i.id,e.target.value)} style={{width:52,padding:"5px 8px",borderRadius:7,border:`1px solid ${D.s200}`,fontSize:13,textAlign:"center",fontFamily:"inherit"}}/></td>
                        <td style={{padding:"10px 10px",fontWeight:800,fontSize:13,color:D.s900,whiteSpace:"nowrap"}}>{Math.round(i.qty*i.price*(1-i.discount/100)).toLocaleString("vi-VN")}</td>
                        <td style={{padding:"10px 10px"}}><button onClick={()=>removeFromQuote(i.id)} style={{background:"none",border:"none",color:D.s300,cursor:"pointer",fontSize:18}}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
            <Btn v="ghost" sz="sm" onClick={()=>setTab("catalog")} icon="←">Thêm vật tư</Btn>
          </div>
          <div style={{display:"grid",gap:14,alignContent:"start"}}>
            <Card style={{border:`2px solid ${D.gold}`}}>
              <div style={{fontWeight:800,fontSize:15,color:D.bg,marginBottom:16}}>Tổng báo giá (VNĐ)</div>
              <div style={{display:"grid",gap:10}}>
                {[
                  {label:"Tạm tính",val:vnd(Math.round(quoteSub)),c:D.s600},
                  {label:"Giảm giá",val:"- "+vnd(Math.round(quoteDisc)),c:D.gr},
                  {label:"Tổng thanh toán",val:vnd(Math.round(quoteTotal)),c:D.bg,big:true},
                ].map(r=>(
                  <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:8,borderBottom:r.big?`2px solid ${D.gold}`:"none"}}>
                    <span style={{fontSize:12,color:D.s600}}>{r.label}</span>
                    <span style={{fontWeight:r.big?800:600,fontSize:r.big?18:13,color:r.c}}>{r.val}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:16,display:"grid",gap:8}}>
                <Btn v="gold" full onClick={printQuote} icon="🖨️" disabled={!quoteItems.length}>In báo giá PDF</Btn>
                <Btn v="ghost" full onClick={()=>{setQI([]);toast&&toast("Đã xoá báo giá");}} icon="🗑️">Xoá & làm mới</Btn>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// ── ORDERS & DEBT ─────────────────────────────────────────────────────────────
const OrdersView=({S,dispatch,openModal,toast})=>{
  const {orders,dealers}=S;
  const installs=S.installs||[];
  const fulfillmentOf=o=>o.fulfillment||(installs.some(i=>i.orderCode===o.code)?"delivery_install":"delivery");
  const totalDebt=dealers.reduce((a,d)=>a+(+d.debt||0),0);
  const STATUS_CFG={delivered:{label:"Đã giao",color:D.gr,bg:D.grL},processing:{label:"Đang xử lý",color:D.am,bg:D.amL},pending:{label:"Chờ xác nhận",color:D.bl,bg:D.blL},cancelled:{label:"Đã huỷ",color:D.s400,bg:D.s100}};

  return(
    <div style={{display:"grid",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>Đơn Hàng & Công Nợ</h2>
        <Btn v="gold" sz="sm" onClick={()=>openModal("newOrder")} icon="➕">Tạo đơn hàng</Btn>
      </div>

      {/* Debt summary */}
      {totalDebt>0&&(
        <div style={{background:D.rdL,border:`1px solid ${D.rd}`,borderRadius:14,padding:18}}>
          <div style={{fontWeight:800,color:D.rd,fontSize:15,marginBottom:12}}>💰 Tổng nợ: {totalDebt}M — Cần thu hồi</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:10}}>
            {dealers.filter(d=>d.debt>0).map(d=>(
              <div key={d.id} style={{background:D.w,borderRadius:10,padding:"12px 14px",border:`1px solid ${D.rd}22`}}>
                <div style={{fontWeight:700,color:D.s900}}>{d.name}</div>
                <div style={{fontSize:11,color:D.s500,marginTop:2}}>{d.tier} · AM: {d.am}</div>
                <div style={{fontWeight:900,fontSize:18,color:D.rd,marginTop:6}}>{d.debt}M tồn nợ</div>
                <div style={{fontSize:10,color:D.s400,marginTop:2}}>Liên hệ: {d.phone}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders table */}
      <Card p={0} style={{overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:D.bg}}>
              {["Mã PO","Đại lý","Ngày","Sản phẩm","Tổng (VNĐ)","Đã TT (VNĐ)","Còn nợ (VNĐ)","Trạng thái","Hình thức",""].map(h=>(
                <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:D.gold,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o,ri)=>{
              const dealer=dealers.find(d=>d.id===o.dealerId);
              const debt=o.total-o.paid;
              const sc=STATUS_CFG[o.status]||STATUS_CFG.pending;
              return(
                <tr key={o.id} style={{borderBottom:`1px solid ${D.s100}`,background:debt>0?`${D.rdL}88`:ri%2===0?D.w:D.s50}}>
                  <td style={{padding:"11px 14px",fontFamily:"monospace",fontSize:12,fontWeight:700,color:D.s700}}>{o.code}</td>
                  <td style={{padding:"11px 14px"}}>
                    <div style={{fontWeight:600,fontSize:13,color:D.s900}}>{dealer?.name||"—"}</div>
                    <div style={{fontSize:11,color:D.s400}}>{dealer?.tier}</div>
                  </td>
                  <td style={{padding:"11px 14px",fontSize:12,color:D.s600}}>{o.date}</td>
                  <td style={{padding:"11px 14px",fontSize:11,color:D.s600,maxWidth:260}}>{o.items.map((i,k)=>{const nm=i.name||matByCode(i.sku)?.name;return(<div key={k}><b style={{color:D.s700}}>{i.sku}</b>{nm?` · ${nm}`:""} ×{i.qty}</div>);})}</td>
                  <td style={{padding:"11px 14px",fontWeight:700,fontSize:13,color:D.s900}}>{o.total.toLocaleString()}</td>
                  <td style={{padding:"11px 14px",fontWeight:700,color:D.gr,fontSize:13}}>{o.paid.toLocaleString()}</td>
                  <td style={{padding:"11px 14px",fontWeight:800,fontSize:13,color:debt>0?D.rd:D.gr}}>{debt>0?debt.toLocaleString():"✓"}</td>
                  <td style={{padding:"11px 14px"}}><Badge label={sc.label} dot={sc.color} bg={sc.bg}/></td>
                  <td style={{padding:"11px 14px"}}>
                    {(()=>{const fm=fulfillmentOf(o);
                      const cfg=fm==="delivery_install_retail"?{l:"🚚🏠 Giao+Lắp (khách lẻ)",dot:D.te,bg:D.teL}:fm==="delivery_install"?{l:"🚚🔧 Giao+Lắp (đại lý)",dot:D.pu,bg:D.puL}:{l:"🚚 Giao",dot:D.bl,bg:D.blL};
                      return(<div style={{display:"grid",gap:3}}>
                      <Badge label={cfg.l} dot={cfg.dot} bg={cfg.bg}/>
                      {o.completed&&<span style={{fontSize:10,color:D.gr,fontWeight:700,whiteSpace:"nowrap"}}>✓ Đã lắp · hoàn tất</span>}
                    </div>);})()}
                  </td>
                  <td style={{padding:"11px 14px"}}>{debt>0&&<Btn v="danger" sz="xs" onClick={()=>toast(`Nhắc nợ gửi đến ${dealer?.name}`,)}>Nhắc nợ</Btn>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── TICKETS / WARRANTY ────────────────────────────────────────────────────────
const TicketsView=({S,dispatch,openModal})=>{
  const {tickets,dealers}=S;
  const [tab,setTab]=useState("open");
  const PRI={high:{label:"Khẩn",color:D.rd,bg:D.rdL},medium:{label:"Trung bình",color:D.am,bg:D.amL},low:{label:"Thấp",color:D.gr,bg:D.grL}};
  const ST={open:{label:"Mở",color:D.rd},inprogress:{label:"Đang xử lý",color:D.am},resolved:{label:"Đã giải quyết",color:D.gr}};

  const filtered=tickets.filter(t=>tab==="open"?t.status!=="resolved":t.status==="resolved");

  return(
    <div style={{display:"grid",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>Chăm sóc sau bán & Bảo hành</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:D.s400}}>{tickets.filter(t=>t.status!=="resolved").length} ticket chưa đóng · {tickets.filter(t=>t.priority==="high"&&t.status!=="resolved").length} khẩn cấp</p>
        </div>
        <Btn v="gold" sz="sm" onClick={()=>openModal("newTicket")} icon="➕">Tạo ticket</Btn>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {label:"Tổng ticket",val:tickets.length,color:D.bl},
          {label:"Đang mở",val:tickets.filter(t=>t.status==="open").length,color:D.rd},
          {label:"Đang xử lý",val:tickets.filter(t=>t.status==="inprogress").length,color:D.am},
          {label:"Đã giải quyết",val:tickets.filter(t=>t.status==="resolved").length,color:D.gr},
        ].map(s=>(
          <Card key={s.label} style={{borderTop:`3px solid ${s.color}`}}>
            <div style={{fontSize:10,color:D.s500,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:26,fontWeight:900,color:s.color}}>{s.val}</div>
          </Card>
        ))}
      </div>

      {/* Toggle */}
      <div style={{display:"flex",gap:1,borderRadius:9,overflow:"hidden",border:`1px solid ${D.s200}`,alignSelf:"start"}}>
        {["open","resolved"].map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"7px 18px",border:"none",background:tab===t?D.bg:D.w,color:tab===t?D.gold:D.s600,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{t==="open"?"🔴 Đang mở":"✅ Đã giải quyết"}</button>)}
      </div>

      {/* Ticket list */}
      <div style={{display:"grid",gap:12}}>
        {filtered.map(tk=>{
          const dealer=dealers.find(d=>d.id===tk.dealerId);
          const pri=PRI[tk.priority]||PRI.low;
          const st=ST[tk.status]||ST.open;
          return(
            <Card key={tk.id} style={{borderLeft:`4px solid ${pri.color}`}}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:220}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:D.s500}}>{tk.code}</span>
                    <Badge label={pri.label} dot={pri.color} bg={pri.bg}/>
                    <Badge label={st.label} dot={st.color} bg={st.color+"22"}/>
                    <span style={{fontSize:11,color:D.s400}}>{tk.date}</span>
                  </div>
                  <div style={{fontWeight:700,fontSize:14,color:D.s900,marginBottom:4}}>{tk.issue}</div>
                  <div style={{fontSize:12,color:D.s600}}>Đại lý: <b>{dealer?.name||"—"}</b> · Sản phẩm: <b>{tk.product}</b></div>
                  {tk.serial&&<div style={{fontSize:11,color:D.s400,marginTop:2}}>Serial: {tk.serial}</div>}
                  {tk.note&&<div style={{fontSize:12,color:D.am,marginTop:6,background:D.amL,padding:"6px 10px",borderRadius:7}}>{tk.note}</div>}
                  {tk.resolution&&<div style={{fontSize:12,color:D.gr,marginTop:6,background:D.grL,padding:"6px 10px",borderRadius:7}}>✓ {tk.resolution}</div>}
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0,alignItems:"center"}}>
                  {tk.tech&&<div style={{fontSize:11,color:D.s500}}>KTV: {tk.tech}</div>}
                  {tk.status!=="resolved"&&(
                    <div style={{display:"flex",gap:6}}>
                      {tk.status==="open"&&<Btn v="outline" sz="xs" onClick={()=>dispatch({type:"UPDATE_TICKET",id:tk.id,data:{status:"inprogress"}})}>Tiếp nhận</Btn>}
                      <Btn v="success" sz="xs" onClick={()=>dispatch({type:"UPDATE_TICKET",id:tk.id,data:{status:"resolved",resolution:"Đã xử lý xong."}})}>✓ Đóng ticket</Btn>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:D.s400}}>Không có ticket {tab==="open"?"đang mở":"đã giải quyết"}</div>}
      </div>
    </div>
  );
};

// ── SALES KPI ─────────────────────────────────────────────────────────────────
const comm=(m)=>m.won*m.baseCommission*25;
const SalesKPIView=({S})=>{
  const {deals}=S;
  const MONTHS=["T1","T2","T3","T4","T5","T6"];

  const getMemberStats=(m)=>{
    const myDeals=deals.filter(d=>d.sales===m.name);
    const won=myDeals.filter(d=>d.stage==="s7").length;
    const active=myDeals.filter(d=>!["s7","lost"].includes(d.stage)).length;
    const lost=myDeals.filter(d=>d.stage==="lost").length;
    const cr=myDeals.length?Math.round(won/myDeals.length*100):0;
    const pipeVal=myDeals.filter(d=>!["s7","lost"].includes(d.stage)).reduce((a,d)=>a+(+d.estVal||0),0);
    const comm=won*m.baseCommission*25; // avg 25M/deal
    const weekProg=Math.round(won/m.targetWeek*100);
    const monthProg=Math.round(won/m.targetMonth*100);
    return{...m,won,active,lost,cr,pipeVal,comm,weekProg,monthProg};
  };

  const stats=SALES_TEAM.map(getMemberStats);
  const top=stats.sort((a,b)=>b.won-a.won);

  const radarData=["won","active","cr","pipeVal"].map(k=>({subject:k,A:top[0]?.[k]||0,B:top[1]?.[k]||0}));

  return(
    <div style={{display:"grid",gap:20}}>
      <h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>KPI Cá Nhân Sales</h2>

      {/* Leaderboard */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {top.map((m,i)=>{
          const medals=["🥇","🥈","🥉","4️⃣"];
          const rankColor=[D.gold,D.s300,"#CD7F32",D.s200][i];
          return(
            <Card key={m.id} style={{borderTop:`3px solid ${rankColor}`,position:"relative"}}>
              <div style={{position:"absolute",top:14,right:14,fontSize:22}}>{medals[i]||""}</div>
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
                <Avatar name={m.avatar} size={44}/>
                <div>
                  <div style={{fontWeight:800,fontSize:15,color:D.s900}}>{m.name}</div>
                  <div style={{fontSize:11,color:D.s500}}>{m.role}</div>
                </div>
              </div>

              {/* Progress bars */}
              <div style={{display:"grid",gap:10}}>
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:D.s600,marginBottom:4}}>
                    <span>Target tháng</span><span style={{fontWeight:700,color:m.monthProg>=100?D.gr:m.monthProg>=70?D.am:D.rd}}>{m.won}/{m.targetMonth} WIN ({m.monthProg}%)</span>
                  </div>
                  <ProgressBar value={m.won} max={m.targetMonth} color={m.monthProg>=100?D.gr:m.monthProg>=70?D.am:D.rd} height={8}/>
                </div>
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:D.s600,marginBottom:4}}>
                    <span>Target tuần</span><span style={{fontWeight:700}}>{m.won}/{m.targetWeek}</span>
                  </div>
                  <ProgressBar value={Math.min(m.won,m.targetWeek)} max={m.targetWeek} color={D.bl} height={5}/>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:14,paddingTop:14,borderTop:`1px solid ${D.s100}`}}>
                {[["Active",m.active,D.bl],[`CR`,`${m.cr}%`,D.gr],[`Pipeline`,`${fmt(m.pipeVal)}`,D.te]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{fontWeight:800,fontSize:16,color:c}}>{v}</div>
                    <div style={{fontSize:10,color:D.s400}}>{l}</div>
                  </div>
                ))}
              </div>

              {m.baseCommission>0&&(
                <div style={{marginTop:12,background:D.goldLL,borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:D.s600}}>Commission ước tính</span>
                  <span style={{fontWeight:800,color:D.bg,fontSize:13}}>{comm(m).toFixed(1)}M</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <Divider label="Phân tích chi tiết"/>
      <Card p={0} style={{overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:D.bg}}>
              {["#","Sales","Vai trò","Active","WIN","Lost","CR %","Pipeline Value","Target T","Target W","Commission"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:D.gold,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {top.map((m,i)=>(
              <tr key={m.id} style={{borderBottom:`1px solid ${D.s100}`,background:i===0?D.goldLL:i%2===0?D.w:D.s50}}>
                <td style={{padding:"11px 14px",fontSize:16}}>{["🥇","🥈","🥉","4"][i]||i+1}</td>
                <td style={{padding:"11px 14px"}}><div style={{display:"flex",gap:8,alignItems:"center"}}><Avatar name={m.avatar} size={28}/><b style={{color:D.s900}}>{m.name}</b></div></td>
                <td style={{padding:"11px 14px",fontSize:12,color:D.s500}}>{m.role}</td>
                <td style={{padding:"11px 14px",fontWeight:700,color:D.bl,textAlign:"center"}}>{m.active}</td>
                <td style={{padding:"11px 14px",fontWeight:800,color:D.gr,fontSize:16,textAlign:"center"}}>{m.won}</td>
                <td style={{padding:"11px 14px",color:D.rd,textAlign:"center"}}>{m.lost}</td>
                <td style={{padding:"11px 14px",textAlign:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <ProgressBar value={m.cr} max={100} color={m.cr>=20?D.gr:m.cr>=10?D.am:D.rd} height={5}/>
                    <span style={{fontSize:11,fontWeight:700,minWidth:30}}>{m.cr}%</span>
                  </div>
                </td>
                <td style={{padding:"11px 14px",fontWeight:700,color:D.te}}>{fmt(m.pipeVal)}</td>
                <td style={{padding:"11px 14px",textAlign:"center"}}>
                  <ProgressBar value={m.won} max={m.targetMonth} color={m.monthProg>=100?D.gr:D.am} height={6} showLabel={true}/>
                </td>
                <td style={{padding:"11px 14px",textAlign:"center"}}>
                  <ProgressBar value={Math.min(m.won,m.targetWeek)} max={m.targetWeek} color={D.bl} height={6}/>
                </td>
                <td style={{padding:"11px 14px",fontWeight:700,color:D.bg}}>{m.baseCommission>0?`${comm(m).toFixed(1)}M`:"—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── ZONE MAP ──────────────────────────────────────────────────────────────────
const ZoneView=({S,openModal})=>{
  const {dealers}=S;
  const [selZone,setSelZone]=useState("all");
  const ZONE_CITIES={
    "Miền Bắc":["Hà Nội","Hải Phòng","Quảng Ninh","Nam Định","Thái Bình","Ninh Bình","Hòa Bình","Hà Nam"],
    "Miền Trung":["Đà Nẵng","Huế","Quảng Nam","Quảng Ngãi","Bình Định","Phú Yên","Khánh Hòa","Ninh Thuận","Bình Thuận"],
    "Miền Nam":["TP.HCM","Bình Dương","Đồng Nai","Long An","Tiền Giang","Bến Tre","Cần Thơ","Vĩnh Long","An Giang"],
  };
  const filtered=dealers.filter(d=>selZone==="all"||d.zone===selZone);

  return(
    <div style={{display:"grid",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>Bản đồ khu vực & Phân vùng đại lý</h2>
        <div style={{display:"flex",gap:8}}>
          {["all",...Object.keys(ZONE_CITIES)].map(z=>(
            <button key={z} onClick={()=>setSelZone(z)}
              style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${selZone===z?D.bg:D.s200}`,background:selZone===z?D.bg:D.w,color:selZone===z?D.gold:D.s600,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              {z==="all"?"Tất cả":z.replace("Miền ","")}
            </button>
          ))}
        </div>
      </div>

      {/* Zone summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {Object.entries(ZONE_CITIES).map(([zone,cities])=>{
          const zoneDealers=dealers.filter(d=>d.zone===zone);
          const covered=cities.filter(c=>zoneDealers.some(d=>d.region===c));
          const uncovered=cities.filter(c=>!zoneDealers.some(d=>d.region===c));
          const conflict=cities.filter(c=>zoneDealers.filter(d=>d.region===c).length>1);
          const ds=zoneDealers.reduce((a,d)=>a+(d.ds[d.ds.length-1]||0),0);
          return(
            <Card key={zone} style={{borderTop:`3px solid ${D.bg}`}}>
              <div style={{fontWeight:800,fontSize:15,color:D.bg,marginBottom:4}}>{zone}</div>
              <div style={{fontSize:12,color:D.s500,marginBottom:12}}>DS tháng này: <b style={{color:D.te}}>{ds}M</b></div>
              <div style={{display:"grid",gap:8,marginBottom:14}}>
                {[
                  {label:"Đại lý đang có",val:zoneDealers.length,c:D.gr,icon:"✓"},
                  {label:"Tỉnh đã phủ",val:`${covered.length}/${cities.length}`,c:D.bl,icon:"📍"},
                  {label:"Tỉnh trống",val:uncovered.length,c:D.am,icon:"⚪"},
                  {label:"Chồng chéo",val:conflict.length,c:conflict.length>0?D.rd:D.gr,icon:conflict.length>0?"⚠️":"✓"},
                ].map(r=>(
                  <div key={r.label} style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                    <span style={{color:D.s600}}>{r.icon} {r.label}</span>
                    <b style={{color:r.c}}>{r.val}</b>
                  </div>
                ))}
              </div>

              {uncovered.length>0&&(
                <div style={{background:D.amL,borderRadius:8,padding:"8px 10px",fontSize:11}}>
                  <b style={{color:D.am}}>Tỉnh trống — cơ hội mở rộng:</b>
                  <div style={{color:D.amD,marginTop:4}}>{uncovered.slice(0,4).join(", ")}{uncovered.length>4?`... +${uncovered.length-4}`:""}</div>
                </div>
              )}
              {conflict.length>0&&(
                <div style={{background:D.rdL,borderRadius:8,padding:"8px 10px",fontSize:11,marginTop:8}}>
                  <b style={{color:D.rd}}>⚠️ Chồng chéo khu vực:</b>
                  <div style={{color:D.rdD,marginTop:4}}>{conflict.join(", ")}</div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Dealer map grid */}
      <Card>
        <SectionTitle>Danh sách đại lý theo khu vực</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {filtered.map(d=>{
            const st=statusOf(d.status);
            const ds=d.ds[d.ds.length-1]||0;
            const lastOrderDays=d.lastOrder?daysDiff(d.lastOrder):999;
            return(
              <div key={d.id} style={{border:`1px solid ${D.s200}`,borderLeft:`4px solid ${st.dot}`,borderRadius:10,padding:"12px 14px",background:D.w}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:D.s900}}>{d.name}</div>
                    <div style={{fontSize:11,color:D.s400}}>{d.code} · {d.region}</div>
                  </div>
                  <span style={{background:D.goldLL,color:D.bg,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>{d.tier}</span>
                </div>
                <div style={{display:"flex",gap:12,fontSize:12,marginTop:8,paddingTop:8,borderTop:`1px solid ${D.s100}`}}>
                  <span style={{color:D.s500}}>AM: <b style={{color:D.s700}}>{d.am}</b></span>
                  <span style={{color:D.s500}}>DS: <b style={{color:D.te}}>{ds}M</b></span>
                  <span style={{color:lastOrderDays>45?D.rd:D.s500}}>Đơn: <b>{lastOrderDays>300?"—":`${lastOrderDays}n`}</b></span>
                </div>
                <div style={{marginTop:8}}><Sparkline data={d.ds} color={st.dot} height={24}/></div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ── AI ADVISOR ────────────────────────────────────────────────────────────────
const AIAdvisorView=({S})=>{
  const [input,setInput]=useState("");
  const [result,setResult]=useState(null);
  const [history,setHistory]=useState([]);
  const [loading,setLoading]=useState(false);

  const ask=()=>{
    if(!input.trim())return;
    setLoading(true);
    setTimeout(()=>{
      const advice=getAIAdvice(input,S.deals,S.dealers);
      const item={q:input,advice,ts:new Date().toLocaleTimeString("vi-VN")};
      setResult(item);
      setHistory(h=>[item,...h.slice(0,4)]);
      setInput("");
      setLoading(false);
    },600);
  };

  const QUICK=[
    "Deal đang stall không tiến triển",
    "Đại lý không đặt hàng lâu ngày",
    "Khách hàng từ chối vì giá cao",
    "Chuẩn bị buổi demo sản phẩm",
    "Đại lý còn nợ chưa thanh toán",
    "Khách không quyết định được",
  ];

  const PRI_STYLE={urgent:{bg:D.rdL,c:D.rd,icon:"🔥"},high:{bg:D.amL,c:D.am,icon:"❗"},medium:{bg:D.blL,c:D.bl,icon:"💡"},low:{bg:D.grL,c:D.gr,icon:"✅"}};

  return(
    <div style={{display:"grid",gap:20}}>
      <div>
        <h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>AI Sales Advisor</h2>
        <p style={{margin:"4px 0 0",fontSize:13,color:D.s400}}>Mô tả tình huống → nhận gợi ý hành động cụ thể ngay</p>
      </div>

      {/* Input */}
      <Card style={{border:`2px solid ${D.gold}`}}>
        <div style={{fontWeight:700,fontSize:14,color:D.bg,marginBottom:12}}>🤖 Mô tả tình huống của bạn</div>
        <textarea value={input} onChange={e=>setInput(e.target.value)} rows={3}
          placeholder="Ví dụ: Deal với Nguyễn Văn A đã 10 ngày không chuyển stage, anh ta nói cần bàn với vợ trước nhưng không thấy phản hồi..."
          onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey)ask();}}
          style={{width:"100%",padding:"10px 12px",borderRadius:9,border:`1px solid ${D.s200}`,fontSize:13,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
          <span style={{fontSize:11,color:D.s400}}>Ctrl+Enter để gửi</span>
          <Btn v="gold" onClick={ask} disabled={!input.trim()||loading}>{loading?"Đang phân tích...":"💡 Phân tích & Gợi ý"}</Btn>
        </div>
      </Card>

      {/* Quick prompts */}
      <div>
        <div style={{fontSize:12,fontWeight:700,color:D.s600,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>Tình huống phổ biến</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {QUICK.map(q=>(
            <button key={q} onClick={()=>{setInput(q);}}
              style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${D.s200}`,background:D.w,color:D.s600,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=D.goldLL;e.currentTarget.style.borderColor=D.gold;e.currentTarget.style.color=D.bg;}}
              onMouseLeave={e=>{e.currentTarget.style.background=D.w;e.currentTarget.style.borderColor=D.s200;e.currentTarget.style.color=D.s600;}}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {result&&(
        <div style={{background:D.bg,borderRadius:16,padding:24}}>
          <div style={{color:D.gold,fontWeight:800,fontSize:16,marginBottom:4}}>💡 {result.advice.action}</div>
          <div style={{color:"rgba(255,243,192,0.6)",fontSize:11,marginBottom:20}}>Phân tích: "{result.q}"</div>
          <div style={{display:"grid",gap:10}}>
            {result.advice.steps.map((step,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",background:"rgba(255,255,255,0.06)",borderRadius:10,padding:"12px 14px"}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:D.gold,color:D.bg,fontWeight:900,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</div>
                <div style={{fontSize:13,color:D.w,lineHeight:1.6}}>{step}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:"10px 14px",borderRadius:9,background:"rgba(255,255,255,0.06)"}}>
            <span style={{...{urgent:{background:D.rdL,color:D.rd},high:{background:D.amL,color:D.am},medium:{background:D.blL,color:D.bl},low:{background:D.grL,color:D.gr}}[result.advice.priority],padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:700}}>
              {PRI_STYLE[result.advice.priority]?.icon} Priority: {result.advice.priority.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* History */}
      {history.length>1&&(
        <div>
          <Divider label="Lịch sử phân tích"/>
          <div style={{display:"grid",gap:10}}>
            {history.slice(1).map((h,i)=>(
              <Card key={i} style={{cursor:"pointer"}} onClick={()=>setResult(h)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div>
                    <div style={{fontSize:12,color:D.s500,marginBottom:3}}>{h.ts}</div>
                    <div style={{fontSize:13,fontWeight:600,color:D.s700}}>"{h.q.slice(0,80)}{h.q.length>80?"…":""}"</div>
                    <div style={{fontSize:12,color:D.bg,fontWeight:700,marginTop:4}}>{h.advice.action}</div>
                  </div>
                  <span style={{color:D.s300,fontSize:18}}>→</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── REPORTS ───────────────────────────────────────────────────────────────────
const ReportsView=({S})=>{
  const {deals,dealers,orders}=S;
  const MONTHS=["T1","T2","T3","T4","T5","T6"];
  const thisM=dealers.reduce((a,d)=>a+(d.ds[5]||0),0);
  const prevM=dealers.reduce((a,d)=>a+(d.ds[4]||0),0);
  const trend=prevM>0?((thisM-prevM)/prevM*100).toFixed(1):0;

  const compareData=MONTHS.map((m,i)=>({
    name:m,
    "Tháng này":dealers.reduce((a,d)=>a+(d.ds[i]||0),0),
    Target:dealers.reduce((a,d)=>a+(d.target?.[i]||0),0),
  }));

  const dealerCompare=dealers.map(d=>({
    name:d.name.split(" ").slice(-2).join(" "),
    "Tháng này":d.ds[5]||0,
    "Tháng trước":d.ds[4]||0,
    Target:d.target?.[5]||0,
  })).sort((a,b)=>b["Tháng này"]-a["Tháng này"]);

  const printReport=()=>{
    const win=window.open("","_blank");
    win.document.write(`<html><head><title>Báo cáo PSV HOME</title><style>
      body{font-family:Arial,sans-serif;padding:30px;color:#111;font-size:12px}
      h1{color:#2A0709;font-size:20px}h2{color:#2A0709;font-size:14px;margin-top:24px}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th{background:#2A0709;color:#F5C542;padding:8px;text-align:left;font-size:11px}
      td{padding:7px 8px;border-bottom:1px solid #eee}
      .pos{color:#059669;font-weight:bold}.neg{color:#DC2626;font-weight:bold}
    </style></head><body>
      <h1>PSV HOME — BÁO CÁO KINH DOANH THÁNG 6/2026</h1>
      <p>Ngày xuất: ${todayStr} | Người lập: Sales Manager</p>
      <h2>1. Tổng quan</h2>
      <table><tr><td><b>Doanh số tháng này</b></td><td class="${trend>=0?"pos":"neg"}">${thisM}M (${trend>=0?"+":""}${trend}% vs tháng trước)</td></tr>
      <tr><td>Doanh số tháng trước</td><td>${prevM}M</td></tr>
      <tr><td>Tổng đại lý active</td><td>${dealers.filter(d=>d.ds[5]>0).length}/${dealers.length}</td></tr>
      <tr><td>Deal WIN tháng này</td><td>${deals.filter(d=>d.stage==="s7").length}</td></tr>
      <tr><td>Tỉ lệ chuyển đổi</td><td>${deals.length?Math.round(deals.filter(d=>d.stage==="s7").length/deals.length*100):0}%</td></tr></table>
      <h2>2. Doanh số từng đại lý</h2>
      <table><thead><tr><th>Đại lý</th><th>Tier</th><th>T5</th><th>T6</th><th>Tăng trưởng</th></tr></thead><tbody>
      ${dealers.map(d=>`<tr><td>${d.name}</td><td>${d.tier}</td><td>${d.ds[4]||0}M</td><td>${d.ds[5]||0}M</td><td class="${(d.ds[5]||0)>=(d.ds[4]||0)?"pos":"neg"}">${(d.ds[5]||0)-(d.ds[4]||0)}M</td></tr>`).join("")}
      </tbody></table>
    </body></html>`);
    win.document.close();win.print();
  };

  return(
    <div style={{display:"grid",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>Báo cáo & Analytics</h2>
        <Btn v="gold" sz="sm" onClick={printReport} icon="🖨️">Xuất báo cáo BGĐ</Btn>
      </div>

      {/* MoM comparison */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {label:"DS tháng này",val:`${thisM}M`,trend:+trend,c:D.te},
          {label:"So tháng trước",val:`${trend>=0?"+":""}${trend}%`,c:+trend>=0?D.gr:D.rd},
          {label:"WIN rate",val:`${deals.length?Math.round(deals.filter(d=>d.stage==="s7").length/deals.length*100):0}%`,c:D.bl},
          {label:"Pipeline Value",val:fmt(deals.filter(d=>!["s7","lost"].includes(d.stage)).reduce((a,d)=>a+(+d.estVal||0),0)),c:D.pu},
        ].map(r=>(
          <Card key={r.label} style={{borderTop:`3px solid ${r.c}`}}>
            <div style={{fontSize:10,color:D.s500,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{r.label}</div>
            <div style={{fontSize:26,fontWeight:900,color:r.c}}>{r.val}</div>
            {r.trend!==undefined&&<div style={{fontSize:11,color:+r.trend>=0?D.gr:D.rd,marginTop:4}}>{+r.trend>=0?"↑":"↓"} vs tháng trước</div>}
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <Card>
          <SectionTitle>DS vs Target 6 tháng</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={compareData} margin={{top:0,right:0,bottom:0,left:-15}}>
              <defs>
                <linearGradient id="dsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={D.bg} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={D.bg} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={D.s100} vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:11,fill:D.s400}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:D.s400}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:8,border:`1px solid ${D.s200}`,fontSize:12}} formatter={v=>[`${v}M`]}/>
              <Area type="monotone" dataKey="Tháng này" stroke={D.bg} strokeWidth={2.5} fill="url(#dsGrad)" dot={{fill:D.gold,r:4}}/>
              <Line type="monotone" dataKey="Target" stroke={D.goldM} strokeWidth={1.5} strokeDasharray="5 5" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle>T5 vs T6 từng đại lý</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dealerCompare.slice(0,5)} layout="vertical" margin={{left:55,right:10,top:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={D.s100} horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:D.s400}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="name" type="category" tick={{fontSize:10,fill:D.s600}} axisLine={false} tickLine={false} width={55}/>
              <Tooltip contentStyle={{borderRadius:8,fontSize:12}} formatter={v=>[`${v}M`]}/>
              <Bar dataKey="Tháng trước" fill={D.s200} radius={[0,3,3,0]} barSize={8}/>
              <Bar dataKey="Tháng này" fill={D.bg} radius={[0,3,3,0]} barSize={8}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Lost analysis */}
      <Card>
        <SectionTitle>Phân tích lý do rớt (Lost Analysis)</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            {Object.entries(LOST_MAP).map(([k,v])=>{
              const cnt=deals.filter(d=>d.stage==="lost"&&d.lostCode===k).length;
              const total=deals.filter(d=>d.stage==="lost").length||1;
              return(
                <div key={k} style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
                  <Tag label={k} color={D.bg} bg={D.goldLL}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:D.s600,marginBottom:3}}>
                      <span>{v}</span><span style={{fontWeight:700,color:cnt>0?D.rd:D.s300}}>{cnt} deal</span>
                    </div>
                    <ProgressBar value={cnt} max={total} color={D.rd} height={5}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{background:D.s50,borderRadius:12,padding:16}}>
            <div style={{fontWeight:700,fontSize:13,color:D.s900,marginBottom:12}}>Top insights</div>
            {[
              {icon:"🎯",text:`${deals.filter(d=>d.stage==="lost").length} deal Lost tổng cộng`},
              {icon:"📊",text:`Lý do phổ biến nhất: ${(()=>{const m={};deals.filter(d=>d.stage==="lost").forEach(d=>{if(d.lostCode)m[d.lostCode]=(m[d.lostCode]||0)+1;});const t=Object.entries(m).sort((a,b)=>b[1]-a[1])[0];return t?`${LOST_MAP[t[0]]} (${t[1]} lần)`:"-"})()}`},
              {icon:"💡",text:"L07 (không liên lạc được) → Golden Hour Rule: gọi trong 15 phút sau khi nhận data"},
              {icon:"🔄",text:"Đại lý Lost → Nurture 30/60/90 ngày → Win-back campaign khi có sản phẩm mới"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                <span style={{fontSize:16,flexShrink:0}}>{r.icon}</span>
                <span style={{fontSize:12,color:D.s700,lineHeight:1.5}}>{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEAL FORM
// ═══════════════════════════════════════════════════════════════════════════════
const DEAL0={name:"",phone:"",region:"",zone:"Miền Bắc",source:"",stage:"s1",stageDt:todayStr,lastContact:"",sales:"",product:"",budget:"",bant:"Chưa XĐ",lostCode:"",estVal:"",closeDate:"",followup:"",note:""};
const DealForm=({deal,onSave,onClose,onDel})=>{
  const [f,sf]=useState({...DEAL0,...deal});
  const s=(k,v)=>sf(x=>({...x,[k]:v}));
  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Tên KH" value={f.name} onChange={v=>s("name",v)} ph="Nguyễn Văn A" required/>
        <Inp label="Số điện thoại" value={f.phone} onChange={v=>s("phone",v)} ph="09xxxxxxxx" required/>
        <Inp label="Khu vực" value={f.region} onChange={v=>s("region",v)} opts={REGIONS}/>
        <Inp label="Vùng" value={f.zone} onChange={v=>s("zone",v)} opts={ZONES}/>
        <Inp label="Nguồn" value={f.source} onChange={v=>s("source",v)} opts={SOURCES}/>
        <Inp label="Stage" value={f.stage} onChange={v=>{s("stage",v);s("stageDt",todayStr);}} opts={STAGES_CFG.map(x=>({value:x.id,label:`${x.short} — ${x.label}`}))}/>
        <Inp label="Sales" value={f.sales} onChange={v=>s("sales",v)} opts={["Linh","Sales 2","Sales 3","Sales Manager"]}/>
        <Inp label="Sản phẩm" value={f.product} onChange={v=>s("product",v)} opts={PRODUCTS}/>
        <Inp label="Vốn ước tính (M)" value={f.budget} onChange={v=>s("budget",v)} type="number"/>
        <Inp label="BANT" value={f.bant} onChange={v=>s("bant",v)} opts={["Pass","Fail","Chưa XĐ"]}/>
        {f.stage==="lost"&&<Inp label="Mã lý do rớt" value={f.lostCode} onChange={v=>s("lostCode",v)} opts={Object.entries(LOST_MAP).map(([k,v])=>({value:k,label:`${k} — ${v}`}))}/>}
        <Inp label="Deal Value (M)" value={f.estVal} onChange={v=>s("estVal",v)} type="number"/>
        <Inp label="Ngày dự kiến chốt" value={f.closeDate} onChange={v=>s("closeDate",v)} type="date"/>
        <Inp label="Liên lạc gần nhất" value={f.lastContact} onChange={v=>s("lastContact",v)} type="date"/>
      </div>
      <Inp label="Follow-up tiếp theo" value={f.followup} onChange={v=>s("followup",v)} ph="Gọi lại vào..."/>
      <Inp label="Ghi chú" value={f.note} onChange={v=>s("note",v)} rows={2}/>
      <div style={{display:"flex",gap:10,justifyContent:"space-between",marginTop:4}}>
        <div>{onDel&&<Btn v="danger" sz="sm" onClick={onDel}>🗑 Xoá</Btn>}</div>
        <div style={{display:"flex",gap:8}}><Btn v="ghost" onClick={onClose}>Huỷ</Btn><Btn v="gold" onClick={()=>{if(!f.name||!f.phone){alert("Cần tên + SĐT");return;}onSave(f);}}>💾 Lưu deal</Btn></div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════════════════

const INIT_STATE={deals:DEALS,dealers:DEALERS,orders:ORDERS,tickets:TICKETS,installs:INSTALLS,deliveries:DELIVERIES,followups:FOLLOWUPS,mondayNotes:"",kpiTarget:{target:500,months:12,avgDeal:25,convRate:10}};

// Khi lịch lắp chuyển "done": đánh dấu đơn hoàn tất + tạo follow-up CSKH (1 lần)
function installDone(state,it,installs){
  let orders=state.orders, followups=state.followups;
  if(it&&it.status==="done"){
    if(it.orderCode) orders=state.orders.map(o=>o.code===it.orderCode?{...o,completed:true}:o);
    const exists=(state.followups||[]).some(f=>f.installId===it.id&&f.type==="cskh");
    if(it.id&&!exists){
      followups=[...state.followups,{id:newId(state.followups),installId:it.id,dealerId:it.dealerId,type:"cskh",title:`CSKH sau lắp: ${it.customer}`,due:dFwd(3),done:false,priority:"medium",note:it.orderCode?`Chăm sóc sau lắp đặt — đơn ${it.orderCode}`:"Chăm sóc sau lắp đặt"}];
    }
  }
  return{...state,installs,orders,followups};
}

function reducer(state,action){
  switch(action.type){
    case"SAVE_DEAL": return{...state,deals:action.data.id?state.deals.map(d=>d.id===action.data.id?action.data:d):[...state.deals,{...action.data,id:newId(state.deals)}]};
    case"DEL_DEAL":  return{...state,deals:state.deals.filter(d=>d.id!==action.id)};
    case"SAVE_DEALER": return{...state,dealers:action.data.id?state.dealers.map(d=>d.id===action.data.id?action.data:d):[...state.dealers,{...action.data,id:newId(state.dealers)}]};
    case"DEL_DEALER":  return{...state,dealers:state.dealers.filter(d=>d.id!==action.id)};
    case"SAVE_ORDER": return{...state,orders:action.data.id?state.orders.map(o=>o.id===action.data.id?action.data:o):[...state.orders,{...action.data,id:newId(state.orders)}]};
    case"SAVE_TICKET": return{...state,tickets:action.data.id?state.tickets.map(t=>t.id===action.data.id?action.data:t):[...state.tickets,{...action.data,id:newId(state.tickets)}]};
    case"UPDATE_TICKET": return{...state,tickets:state.tickets.map(t=>t.id===action.id?{...t,...action.data}:t)};
    case"SAVE_INSTALL": {
      const installs=action.data.id?(state.installs||[]).map(x=>x.id===action.data.id?action.data:x):[...(state.installs||[]),{...action.data,id:newId(state.installs||[])}];
      return installDone(state,action.data.id?action.data:installs[installs.length-1],installs);
    }
    case"UPDATE_INSTALL": {
      const installs=(state.installs||[]).map(x=>x.id===action.id?{...x,...action.data}:x);
      return installDone(state,installs.find(x=>x.id===action.id),installs);
    }
    case"DEL_INSTALL": return{...state,installs:(state.installs||[]).filter(x=>x.id!==action.id)};
    case"SAVE_DELIVERY": {
      const deliveries=action.data.id?(state.deliveries||[]).map(x=>x.id===action.data.id?action.data:x):[...(state.deliveries||[]),{...action.data,id:newId(state.deliveries||[])}];
      const orders=(action.data.status==="delivered"&&action.data.orderCode)?state.orders.map(o=>o.code===action.data.orderCode?{...o,status:"delivered"}:o):state.orders;
      return{...state,deliveries,orders};
    }
    case"UPDATE_DELIVERY": {
      const deliveries=(state.deliveries||[]).map(x=>x.id===action.id?{...x,...action.data}:x);
      const changed=deliveries.find(x=>x.id===action.id);
      const orders=(changed&&changed.status==="delivered"&&changed.orderCode)?state.orders.map(o=>o.code===changed.orderCode?{...o,status:"delivered"}:o):state.orders;
      return{...state,deliveries,orders};
    }
    case"DEL_DELIVERY": return{...state,deliveries:(state.deliveries||[]).filter(x=>x.id!==action.id)};
    case"TOGGLE_FU": return{...state,followups:state.followups.map(f=>f.id===action.id?{...f,done:!f.done}:f)};
    case"ADD_FU":    return{...state,followups:[...state.followups,{...action.data,id:newId(state.followups),done:false}]};
    case"DEL_FU":    return{...state,followups:state.followups.filter(f=>f.id!==action.id)};
    default: return state;
  }
}

const NAV=[
  {id:"dashboard",icon:"📊",label:"Dashboard"},
  {id:"pipeline", icon:"🔄",label:"Pipeline A"},
  {id:"dealers",  icon:"🤝",label:"Đại lý (B)"},
  {id:"catalog",  icon:"📦",label:"Vật tư & Báo giá"},
  {id:"orders",   icon:"💰",label:"Đơn hàng & Nợ"},
  {id:"tickets",  icon:"🎫",label:"Bảo hành & KT"},
  {id:"installs", icon:"🔧",label:"Lịch lắp đặt"},
  {id:"deliveries",icon:"🚚",label:"Lịch giao hàng"},
  {id:"kpi",      icon:"🏆",label:"KPI Sales"},
  {id:"zone",     icon:"🗺️",label:"Khu vực"},
  {id:"followup", icon:"📋",label:"Follow-up"},
  {id:"ai",       icon:"🤖",label:"AI Advisor"},
  {id:"reports",  icon:"📈",label:"Báo cáo"},
  {id:"monday",   icon:"☕",label:"Monday Meeting"},
];

// Inline Follow-up & Monday stubs (reuse from previous but slimmed)
const FollowupView=({S,dispatch})=>{
  const {followups}=S;
  const [newF,setNF]=useState({title:"",type:"call",due:todayStr,priority:"high",note:""});
  const overdue=followups.filter(f=>!f.done&&f.due<todayStr);
  const todayF=followups.filter(f=>!f.done&&f.due===todayStr);
  const upcoming=followups.filter(f=>!f.done&&f.due>todayStr);
  const PRI={urgent:{bg:D.rdL,c:D.rd,label:"🔥 Gấp"},high:{bg:D.amL,c:D.am,label:"❗ Cao"},medium:{bg:D.blL,c:D.bl,label:"Trung"},low:{bg:D.grL,c:D.gr,label:"Thấp"}};
  const TYPE={call:"📞",meeting:"🤝",contract:"📄",escalate:"⬆️",zalo:"💬",cskh:"💚"};
  const FCard=({f})=>(
    <div style={{display:"flex",gap:12,alignItems:"flex-start",background:f.done?D.s50:D.w,border:`1px solid ${D.s200}`,borderRadius:11,padding:"11px 14px",opacity:f.done?0.55:1}}>
      <button onClick={()=>dispatch({type:"TOGGLE_FU",id:f.id})} style={{width:20,height:20,borderRadius:5,border:`2px solid ${f.done?D.gr:D.s300}`,background:f.done?D.gr:"none",color:D.w,cursor:"pointer",fontSize:12,flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center"}}>{f.done?"✓":""}</button>
      <div style={{flex:1}}>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:3}}>
          <span style={{fontSize:13,fontWeight:700,color:f.done?D.s400:D.s900,textDecoration:f.done?"line-through":"none"}}>{TYPE[f.type]||"📌"} {f.title}</span>
          <span style={{...{background:PRI[f.priority]?.bg,color:PRI[f.priority]?.c,padding:"1px 8px",borderRadius:20,fontSize:10,fontWeight:700}}}>{PRI[f.priority]?.label}</span>
        </div>
        {f.note&&<div style={{fontSize:11,color:D.s500,marginBottom:3}}>{f.note}</div>}
        <div style={{fontSize:10,color:D.s400}}>📅 {f.due}</div>
      </div>
      <button onClick={()=>dispatch({type:"DEL_FU",id:f.id})} style={{background:"none",border:"none",color:D.s300,cursor:"pointer",fontSize:18,padding:"0 4px"}}>×</button>
    </div>
  );
  return(
    <div style={{display:"grid",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>Follow-up & Nhắc việc</h2>
        <div style={{display:"flex",gap:16,fontSize:13,color:D.s500}}>
          {overdue.length>0&&<span style={{color:D.rd,fontWeight:700}}>⚠️ {overdue.length} quá hạn</span>}
          <span style={{color:D.am,fontWeight:700}}>📌 {todayF.length} hôm nay</span>
          <span>{upcoming.length} sắp tới</span>
        </div>
      </div>
      <Card>
        <div style={{fontWeight:700,fontSize:13,color:D.s900,marginBottom:12}}>➕ Thêm follow-up</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto auto",gap:10,alignItems:"end"}}>
          <Inp label="Tiêu đề" value={newF.title} onChange={v=>setNF(f=>({...f,title:v}))} ph="Gọi lại..."/>
          <Inp label="Loại" value={newF.type} onChange={v=>setNF(f=>({...f,type:v}))} opts={["call","meeting","contract","escalate","zalo"]}/>
          <Inp label="Ngày" value={newF.due} onChange={v=>setNF(f=>({...f,due:v}))} type="date"/>
          <Inp label="Priority" value={newF.priority} onChange={v=>setNF(f=>({...f,priority:v}))} opts={["urgent","high","medium","low"]}/>
          <Btn v="gold" onClick={()=>{if(!newF.title)return;dispatch({type:"ADD_FU",data:newF});setNF({title:"",type:"call",due:todayStr,priority:"high",note:""});}}>Thêm</Btn>
        </div>
      </Card>
      {overdue.length>0&&<div><div style={{fontWeight:700,fontSize:13,color:D.rd,marginBottom:8}}>⚠️ QUÁ HẠN ({overdue.length})</div><div style={{display:"grid",gap:8}}>{overdue.map(f=><FCard key={f.id} f={f}/>)}</div></div>}
      {todayF.length>0&&<><Divider label={`Hôm nay — ${todayF.length} việc`}/><div style={{display:"grid",gap:8}}>{todayF.map(f=><FCard key={f.id} f={f}/>)}</div></>}
      {upcoming.length>0&&<><Divider label={`Sắp tới — ${upcoming.length}`}/><div style={{display:"grid",gap:8}}>{upcoming.map(f=><FCard key={f.id} f={f}/>)}</div></>}
      {followups.filter(f=>f.done).length>0&&<><Divider label="Đã xong"/><div style={{display:"grid",gap:8}}>{followups.filter(f=>f.done).map(f=><FCard key={f.id} f={f}/>)}</div></>}
    </div>
  );
};

const MondayView=({S,dispatch,openModal,setTab})=>{
  const {deals,dealers,followups,mondayNotes}=S;
  const [notes,setNotes]=useState(mondayNotes||"");
  const stall=deals.filter(d=>!["s7","lost"].includes(d.stage)&&daysDiff(d.stageDt)>7);
  const churn=dealers.filter(d=>["atrisk","inactive"].includes(d.status));
  const overdue=followups.filter(f=>!f.done);
  const wins=deals.filter(d=>d.stage==="s7");
  return(
    <div style={{display:"grid",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div><h2 style={{margin:0,fontSize:22,fontWeight:900,color:D.s900}}>Monday Meeting</h2><p style={{margin:"4px 0 0",color:D.s400,fontSize:13}}>{now.toLocaleDateString("vi-VN",{weekday:"long",day:"numeric",month:"long"})}</p></div>
        <div style={{background:D.bg,color:D.gold,padding:"8px 16px",borderRadius:9,fontSize:13,fontWeight:700}}>⏱ 9:00–9:45 sáng</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {STAGES_CFG.map(s=>{const cnt=deals.filter(d=>d.stage===s.id).length;return(<div key={s.id} style={{background:s.bg,border:`1px solid ${s.dot}44`,borderRadius:12,padding:"14px 16px",textAlign:"center"}}><div style={{fontWeight:900,fontSize:24,color:s.dot}}>{cnt}</div><div style={{fontSize:12,fontWeight:700,color:D.s700,marginTop:2}}>{s.label}</div></div>);})}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {[{time:"9:00–9:10",title:"Review tuần trước",icon:"📊",items:[`${wins.length} WIN mới tuần này`,`${stall.length} deal stall >7 ngày`,`${churn.length} đại lý churn risk`]},{time:"9:10–9:25",title:"Review từng AM",icon:"👤",items:["Linh","Sales 2","Sales 3"].map(s=>`${s}: ${deals.filter(d=>d.sales===s&&!["s7","lost"].includes(d.stage)).length} active, ${deals.filter(d=>d.sales===s&&d.stage==="s7").length} WIN`)},{time:"9:25–9:35",title:"Deal Escalation",icon:"⚠️",items:stall.length>0?stall.map(d=>`${d.name} — ${daysDiff(d.stageDt)}n tại ${stageOf(d.stage).label}`):["Không có deal stall ✓"]},{time:"9:35–9:45",title:"Action items tuần này",icon:"✅",items:overdue.slice(0,4).map(f=>f.title)},].map(b=>(
          <Card key={b.title}>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
              <div style={{width:36,height:36,background:D.bg,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{b.icon}</div>
              <div><div style={{fontWeight:800,fontSize:13,color:D.s900}}>{b.title}</div><div style={{fontSize:11,color:D.s500}}>{b.time}</div></div>
            </div>
            {b.items.map((item,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:13,color:D.s700}}><span style={{color:D.gold,fontWeight:800}}>·</span>{item}</div>)}
          </Card>
        ))}
      </div>
      <Card>
        <div style={{fontWeight:700,fontSize:14,color:D.s900,marginBottom:12}}>📝 Ghi chú & Action items</div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={6} placeholder="Quyết định buổi họp, action items, người chịu trách nhiệm, deadline..." style={{width:"100%",padding:"10px 12px",borderRadius:9,border:`1px solid ${D.s200}`,fontSize:13,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}/>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}><Btn v="gold" onClick={()=>{}}>💾 Lưu ghi chú</Btn></div>
      </Card>
    </div>
  );
};

// ── NEW TICKET FORM ───────────────────────────────────────────────────────────
const TicketForm=({dealers,onSave,onClose})=>{
  const [f,sf]=useState({dealerId:"",product:"FOR-BT35",serial:"",issue:"",priority:"medium",tech:"",note:""});
  const s=(k,v)=>sf(x=>({...x,[k]:v}));
  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Đại lý" value={f.dealerId} onChange={v=>s("dealerId",+v)} opts={dealers.map(d=>({value:d.id,label:d.name}))}/>
        <Inp label="SKU sản phẩm" value={f.product} onChange={v=>s("product",v)} opts={CATALOG.map(p=>p.sku)}/>
        <Inp label="Số serial" value={f.serial} onChange={v=>s("serial",v)} ph="FOR35-2025-xxxx"/>
        <Inp label="Mức độ" value={f.priority} onChange={v=>s("priority",v)} opts={["high","medium","low"]}/>
        <Inp label="Kỹ thuật viên" value={f.tech} onChange={v=>s("tech",v)} opts={["","Kỹ thuật 1","Kỹ thuật 2","Kỹ thuật 3"]}/>
      </div>
      <Inp label="Mô tả lỗi" value={f.issue} onChange={v=>s("issue",v)} rows={3} ph="Mô tả chi tiết tình trạng lỗi..."/>
      <Inp label="Ghi chú nội bộ" value={f.note} onChange={v=>s("note",v)} rows={2}/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn v="ghost" onClick={onClose}>Huỷ</Btn>
        <Btn v="gold" onClick={()=>{if(!f.issue){alert("Cần mô tả lỗi");return;}onSave({...f,code:`TK-${String(Date.now()).slice(-4)}`,date:todayStr,status:"open"});}}>💾 Tạo ticket</Btn>
      </div>
    </div>
  );
};

// ── LỊCH LẮP ĐẶT ─────────────────────────────────────────────────────────────
const InstallView=({S,dispatch,openModal,toast})=>{
  const installs=S.installs||[];
  const active=x=>["scheduled","inprogress"].includes(x.status);
  const overdue =installs.filter(x=>active(x)&&x.date<todayStr);
  const today   =installs.filter(x=>active(x)&&x.date===todayStr);
  const upcoming=installs.filter(x=>active(x)&&x.date>todayStr).sort((a,b)=>a.date.localeCompare(b.date));
  const done    =installs.filter(x=>x.status==="done");
  const cancelled=installs.filter(x=>x.status==="cancelled");
  const dealerName=id=>(S.dealers.find(d=>d.id===id)||{}).name||"";

  const ICard=({x})=>{
    const st=installStatusOf(x.status);
    const isOverdue=active(x)&&x.date<todayStr;
    return(
      <div style={{background:D.w,border:`1px solid ${isOverdue?D.rd:D.s200}`,borderLeft:`5px solid ${st.dot}`,borderRadius:13,padding:"14px 16px",display:"grid",gap:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:800,fontSize:14,color:D.s900}}>{x.customer}</div>
            <div style={{fontSize:11,color:D.s400}}>{x.code}{dealerName(x.dealerId)?` · ĐL: ${dealerName(x.dealerId)}`:""} · 📞 {x.phone}</div>
          </div>
          <Badge label={isOverdue?`⚠️ ${st.label}`:st.label} dot={st.dot} bg={isOverdue?D.rdL:st.bg}/>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px",fontSize:12,color:D.s700}}>
          <span>📦 <b>{x.product}</b> × {x.qty}</span>
          <span>👤 {x.tech||"Chưa phân công KT"}</span>
        </div>
        <div style={{fontSize:12,color:D.s500}}>📍 {x.address}, {x.region}</div>
        <div style={{display:"flex",gap:14,fontSize:12,color:isOverdue?D.rd:D.s600,fontWeight:isOverdue?700:500}}>
          <span>📅 {x.date}</span><span>⏰ {x.slot}</span>
        </div>
        {x.note&&<div style={{fontSize:11,color:D.s500,fontStyle:"italic",borderTop:`1px solid ${D.s100}`,paddingTop:6}}>{x.note}</div>}
        <div style={{display:"flex",gap:6,justifyContent:"flex-end",borderTop:`1px solid ${D.s100}`,paddingTop:8,flexWrap:"wrap"}}>
          {x.status==="scheduled"&&<Btn v="ghost" sz="sm" onClick={()=>dispatch({type:"UPDATE_INSTALL",id:x.id,data:{status:"inprogress"}})}>▶ Bắt đầu lắp</Btn>}
          {x.status==="inprogress"&&<Btn v="gold" sz="sm" onClick={()=>{dispatch({type:"UPDATE_INSTALL",id:x.id,data:{status:"done"}});toast&&toast(`✓ Hoàn thành lắp đặt${x.orderCode?` — đơn ${x.orderCode} hoàn tất`:""} · đã tạo follow-up CSKH 💚`);}}>✓ Hoàn thành</Btn>}
          {active(x)&&<Btn v="ghost" sz="sm" onClick={()=>dispatch({type:"UPDATE_INSTALL",id:x.id,data:{status:"cancelled"}})}>Huỷ</Btn>}
          {x.status==="cancelled"&&<Btn v="ghost" sz="sm" onClick={()=>dispatch({type:"UPDATE_INSTALL",id:x.id,data:{status:"scheduled"}})}>↩ Mở lại</Btn>}
          <Btn v="ghost" sz="sm" onClick={()=>openModal("editInstall",x)}>✏️ Sửa</Btn>
        </div>
      </div>
    );
  };

  const Group=({label,items,color})=>items.length>0?(
    <div><div style={{fontWeight:700,fontSize:13,color:color||D.s700,marginBottom:8}}>{label} ({items.length})</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>{items.map(x=><ICard key={x.id} x={x}/>)}</div></div>
  ):null;

  return(
    <div style={{display:"grid",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>Lịch Lắp Đặt</h2><p style={{margin:"4px 0 0",color:D.s400,fontSize:13}}>Quản lý lịch hẹn lắp đặt motor & rèm tự động</p></div>
        <Btn v="gold" sz="sm" onClick={()=>openModal("newInstall")} icon="➕">Thêm lịch lắp</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12}}>
        {[{l:"Quá hẹn",n:overdue.length,c:D.rd,bg:D.rdL},{l:"Hôm nay",n:today.length,c:D.am,bg:D.amL},{l:"Sắp tới",n:upcoming.length,c:D.bl,bg:D.blL},{l:"Hoàn thành",n:done.length,c:D.gr,bg:D.grL}].map(t=>(
          <div key={t.l} style={{background:t.bg,border:`1px solid ${t.c}33`,borderRadius:12,padding:"14px 16px"}}><div style={{fontWeight:900,fontSize:26,color:t.c}}>{t.n}</div><div style={{fontSize:12,fontWeight:700,color:D.s700,marginTop:2}}>{t.l}</div></div>
        ))}
      </div>
      {installs.length===0&&<Card><div style={{textAlign:"center",color:D.s400,padding:30,fontSize:14}}>Chưa có lịch lắp đặt nào. Nhấn <b>“Thêm lịch lắp”</b> để bắt đầu.</div></Card>}
      <Group label="⚠️ QUÁ HẸN" items={overdue} color={D.rd}/>
      {today.length>0&&<><Divider label={`Hôm nay — ${today.length} lịch`}/><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>{today.map(x=><ICard key={x.id} x={x}/>)}</div></>}
      <Group label="📅 Sắp tới" items={upcoming} color={D.bl}/>
      <Group label="✓ Đã hoàn thành" items={done} color={D.gr}/>
      <Group label="Đã huỷ" items={cancelled} color={D.s400}/>
    </div>
  );
};

const InstallForm=({install,dealers,onSave,onClose,onDel})=>{
  const [f,sf]=useState(install||{customer:"",phone:"",address:"",region:"Hà Nội",zone:"Miền Bắc",dealerId:"",product:"FOR-BT35",qty:1,date:todayStr,slot:INSTALL_SLOTS[0],tech:"",status:"scheduled",note:""});
  const s=(k,v)=>sf(x=>({...x,[k]:v}));
  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Khách hàng / Công trình" value={f.customer} onChange={v=>s("customer",v)} ph="Anh Minh — Vinhomes..."/>
        <Inp label="Số điện thoại" value={f.phone} onChange={v=>s("phone",v)} ph="09xxxxxxxx"/>
      </div>
      <Inp label="Địa chỉ lắp đặt" value={f.address} onChange={v=>s("address",v)} ph="Số nhà, đường, quận/huyện"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Khu vực" value={f.region} onChange={v=>s("region",v)} ph="Hà Nội / TP.HCM..."/>
        <Inp label="Vùng" value={f.zone} onChange={v=>s("zone",v)} opts={["Miền Bắc","Miền Trung","Miền Nam"]}/>
        <Inp label="Đại lý (nếu có)" value={f.dealerId} onChange={v=>s("dealerId",v?+v:"")} opts={[{value:"",label:"— Không —"},...dealers.map(d=>({value:d.id,label:d.name}))]}/>
        <Inp label="Sản phẩm" value={f.product} onChange={v=>s("product",v)} opts={CATALOG.map(p=>p.sku)}/>
        <Inp label="Số lượng" value={f.qty} onChange={v=>s("qty",+v||1)} type="number"/>
        <Inp label="Ngày lắp" value={f.date} onChange={v=>s("date",v)} type="date"/>
        <Inp label="Khung giờ" value={f.slot} onChange={v=>s("slot",v)} opts={INSTALL_SLOTS}/>
        <Inp label="Kỹ thuật viên" value={f.tech} onChange={v=>s("tech",v)} opts={["","Kỹ thuật 1","Kỹ thuật 2","Kỹ thuật 3"]}/>
        <Inp label="Trạng thái" value={f.status} onChange={v=>s("status",v)} opts={INSTALL_STATUS.map(x=>({value:x.id,label:x.label}))}/>
      </div>
      <Inp label="Ghi chú" value={f.note} onChange={v=>s("note",v)} rows={2} ph="Số phòng, yêu cầu đặc biệt..."/>
      <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
        {onDel?<Btn v="danger" sz="sm" onClick={onDel}>🗑 Xoá</Btn>:<span/>}
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={onClose}>Huỷ</Btn>
          <Btn v="gold" onClick={()=>{if(!f.customer){alert("Cần nhập khách hàng / công trình");return;}onSave({...f,code:f.code||`LD-${String(Date.now()).slice(-4)}`});}}>💾 Lưu lịch</Btn>
        </div>
      </div>
    </div>
  );
};

// ── LỊCH GIAO HÀNG ───────────────────────────────────────────────────────────
const DeliveryView=({S,dispatch,openModal,toast})=>{
  const deliveries=S.deliveries||[];
  const active=x=>["preparing","shipping"].includes(x.status);
  const overdue =deliveries.filter(x=>active(x)&&x.date<todayStr);
  const today   =deliveries.filter(x=>active(x)&&x.date===todayStr);
  const upcoming=deliveries.filter(x=>active(x)&&x.date>todayStr).sort((a,b)=>a.date.localeCompare(b.date));
  const delivered=deliveries.filter(x=>x.status==="delivered");
  const cancelled=deliveries.filter(x=>x.status==="cancelled");
  const dealerName=id=>(S.dealers.find(d=>d.id===id)||{}).name||"";

  const DCard=({x})=>{
    const st=deliveryStatusOf(x.status);
    const isOverdue=active(x)&&x.date<todayStr;
    return(
      <div style={{background:D.w,border:`1px solid ${isOverdue?D.rd:D.s200}`,borderLeft:`5px solid ${st.dot}`,borderRadius:13,padding:"14px 16px",display:"grid",gap:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:800,fontSize:14,color:D.s900}}>{dealerName(x.dealerId)||x.address}</div>
            <div style={{fontSize:11,color:D.s400}}>{x.code}{x.orderCode?` · ${x.orderCode}`:""}</div>
          </div>
          <Badge label={isOverdue?`⚠️ ${st.label}`:st.label} dot={st.dot} bg={isOverdue?D.rdL:st.bg}/>
        </div>
        <div style={{fontSize:12,color:D.s700}}>📦 {x.product}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px",fontSize:12,color:D.s600}}>
          <span>🚚 {x.carrier}</span><span>📍 {x.region}</span>
        </div>
        <div style={{display:"flex",gap:14,fontSize:12,color:isOverdue?D.rd:D.s600,fontWeight:isOverdue?700:500}}>
          <span>📅 {x.date}</span><span>⏰ {x.slot}</span>
        </div>
        {x.note&&<div style={{fontSize:11,color:D.s500,fontStyle:"italic",borderTop:`1px solid ${D.s100}`,paddingTop:6}}>{x.note}</div>}
        <div style={{display:"flex",gap:6,justifyContent:"flex-end",borderTop:`1px solid ${D.s100}`,paddingTop:8,flexWrap:"wrap"}}>
          {x.status==="preparing"&&<Btn v="ghost" sz="sm" onClick={()=>dispatch({type:"UPDATE_DELIVERY",id:x.id,data:{status:"shipping"}})}>🚚 Bắt đầu giao</Btn>}
          {x.status==="shipping"&&<Btn v="gold" sz="sm" onClick={()=>{dispatch({type:"UPDATE_DELIVERY",id:x.id,data:{status:"delivered"}});toast&&toast(x.orderCode?`✓ Đã giao — đơn ${x.orderCode} tự cập nhật "Đã giao"`:"✓ Đã giao");}}>✓ Đã giao</Btn>}
          {active(x)&&<Btn v="ghost" sz="sm" onClick={()=>dispatch({type:"UPDATE_DELIVERY",id:x.id,data:{status:"cancelled"}})}>Huỷ</Btn>}
          {x.status==="cancelled"&&<Btn v="ghost" sz="sm" onClick={()=>dispatch({type:"UPDATE_DELIVERY",id:x.id,data:{status:"preparing"}})}>↩ Mở lại</Btn>}
          <Btn v="ghost" sz="sm" onClick={()=>openModal("editDelivery",x)}>✏️ Sửa</Btn>
        </div>
      </div>
    );
  };

  const Group=({label,items,color})=>items.length>0?(
    <div><div style={{fontWeight:700,fontSize:13,color:color||D.s700,marginBottom:8}}>{label} ({items.length})</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>{items.map(x=><DCard key={x.id} x={x}/>)}</div></div>
  ):null;

  return(
    <div style={{display:"grid",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>Lịch Giao Hàng</h2><p style={{margin:"4px 0 0",color:D.s400,fontSize:13}}>Quản lý lịch giao đơn hàng cho đại lý & công trình</p></div>
        <Btn v="gold" sz="sm" onClick={()=>openModal("newDelivery")} icon="➕">Thêm lịch giao</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12}}>
        {[{l:"Quá hẹn",n:overdue.length,c:D.rd,bg:D.rdL},{l:"Hôm nay",n:today.length,c:D.am,bg:D.amL},{l:"Sắp tới",n:upcoming.length,c:D.bl,bg:D.blL},{l:"Đã giao",n:delivered.length,c:D.gr,bg:D.grL}].map(t=>(
          <div key={t.l} style={{background:t.bg,border:`1px solid ${t.c}33`,borderRadius:12,padding:"14px 16px"}}><div style={{fontWeight:900,fontSize:26,color:t.c}}>{t.n}</div><div style={{fontSize:12,fontWeight:700,color:D.s700,marginTop:2}}>{t.l}</div></div>
        ))}
      </div>
      {deliveries.length===0&&<Card><div style={{textAlign:"center",color:D.s400,padding:30,fontSize:14}}>Chưa có lịch giao hàng nào. Nhấn <b>“Thêm lịch giao”</b> để bắt đầu.</div></Card>}
      <Group label="⚠️ QUÁ HẸN" items={overdue} color={D.rd}/>
      {today.length>0&&<><Divider label={`Hôm nay — ${today.length} chuyến`}/><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>{today.map(x=><DCard key={x.id} x={x}/>)}</div></>}
      <Group label="📅 Sắp tới" items={upcoming} color={D.bl}/>
      <Group label="✓ Đã giao" items={delivered} color={D.gr}/>
      <Group label="Đã huỷ" items={cancelled} color={D.s400}/>
    </div>
  );
};

const DeliveryForm=({delivery,dealers,orders,onSave,onClose,onDel})=>{
  const [f,sf]=useState(delivery||{dealerId:"",orderCode:"",address:"",region:"Hà Nội",zone:"Miền Bắc",product:"",qty:1,carrier:DELIVERY_CARRIERS[0],date:todayStr,slot:INSTALL_SLOTS[0],status:"preparing",note:""});
  const s=(k,v)=>sf(x=>({...x,[k]:v}));
  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Đại lý" value={f.dealerId} onChange={v=>s("dealerId",v?+v:"")} opts={[{value:"",label:"— Chọn đại lý —"},...dealers.map(d=>({value:d.id,label:d.name}))]}/>
        <Inp label="Mã đơn hàng (PO)" value={f.orderCode} onChange={v=>s("orderCode",v)} opts={["",...(orders||[]).map(o=>o.code)]}/>
      </div>
      <Inp label="Địa chỉ giao" value={f.address} onChange={v=>s("address",v)} ph="Số nhà, đường, quận/huyện"/>
      <Inp label="Hàng giao (SP × SL)" value={f.product} onChange={v=>s("product",v)} ph="FOR-BT35 ×8, FOR-RC01 ×8..."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Khu vực" value={f.region} onChange={v=>s("region",v)} ph="Hà Nội / TP.HCM..."/>
        <Inp label="Vùng" value={f.zone} onChange={v=>s("zone",v)} opts={["Miền Bắc","Miền Trung","Miền Nam"]}/>
        <Inp label="Tổng số lượng" value={f.qty} onChange={v=>s("qty",+v||1)} type="number"/>
        <Inp label="Đơn vị vận chuyển" value={f.carrier} onChange={v=>s("carrier",v)} opts={DELIVERY_CARRIERS}/>
        <Inp label="Ngày giao" value={f.date} onChange={v=>s("date",v)} type="date"/>
        <Inp label="Khung giờ" value={f.slot} onChange={v=>s("slot",v)} opts={INSTALL_SLOTS}/>
        <Inp label="Trạng thái" value={f.status} onChange={v=>s("status",v)} opts={DELIVERY_STATUS.map(x=>({value:x.id,label:x.label}))}/>
      </div>
      <Inp label="Ghi chú" value={f.note} onChange={v=>s("note",v)} rows={2} ph="Yêu cầu giao, liên hệ nhận hàng..."/>
      <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
        {onDel?<Btn v="danger" sz="sm" onClick={onDel}>🗑 Xoá</Btn>:<span/>}
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={onClose}>Huỷ</Btn>
          <Btn v="gold" onClick={()=>{if(!f.dealerId&&!f.address){alert("Cần chọn đại lý hoặc nhập địa chỉ giao");return;}onSave({...f,code:f.code||`GH-${String(Date.now()).slice(-4)}`});}}>💾 Lưu lịch</Btn>
        </div>
      </div>
    </div>
  );
};

// ── TẠO ĐƠN HÀNG (PO) + tự tạo lịch giao ─────────────────────────────────────
const tierPrice=(p,tier)=>tier==="Platinum"?(p.pricePlatinum||p.priceRetail):tier==="Gold"?(p.priceGold||p.priceRetail):p.priceRetail;

const OrderForm=({dealers,onSave,onClose})=>{
  const [dealerId,setDealerId]=useState(dealers[0]?.id||"");
  const dealer=dealers.find(d=>d.id===+dealerId);
  const [date,setDate]=useState(todayStr);
  const [status,setStatus]=useState("processing");
  const [paid,setPaid]=useState(0);
  const [note,setNote]=useState("");
  const [items,setItems]=useState(()=>[{mid:MATERIALS[0].id,sku:MATERIALS[0].code,name:MATERIALS[0].name,qty:1,price:MATERIALS[0].price}]);
  const [fulfillment,setFulfillment]=useState("delivery");
  const [delDate,setDelDate]=useState(dFwd(2));
  const [carrier,setCarrier]=useState(DELIVERY_CARRIERS[0]);
  const [delSlot,setDelSlot]=useState(INSTALL_SLOTS[0]);
  const [insDate,setInsDate]=useState(dFwd(3));
  const [insSlot,setInsSlot]=useState(INSTALL_SLOTS[0]);
  const [insTech,setInsTech]=useState("");
  const [retailCustomer,setRetailCustomer]=useState("");
  const [retailPhone,setRetailPhone]=useState("");
  const [retailAddress,setRetailAddress]=useState("");
  const [retailRegion,setRetailRegion]=useState("");
  const wantInstall=fulfillment==="delivery_install"||fulfillment==="delivery_install_retail";
  const isRetail=fulfillment==="delivery_install_retail";

  const total=items.reduce((a,i)=>a+(+i.qty||0)*(+i.price||0),0);
  const totalQty=items.reduce((a,i)=>a+(+i.qty||0),0);

  const setItem=(idx,k,v)=>setItems(arr=>arr.map((it,i)=>{
    if(i!==idx)return it;
    if(k==="mid"){const p=MATERIALS.find(m=>m.id===v);return{...it,mid:v,sku:p?.code||"",name:p?.name||"",price:p?.price||0};}
    return {...it,[k]:v};
  }));
  const addItem=()=>setItems(a=>[...a,{mid:MATERIALS[0].id,sku:MATERIALS[0].code,name:MATERIALS[0].name,qty:1,price:MATERIALS[0].price}]);
  const delItem=idx=>setItems(a=>a.length>1?a.filter((_,i)=>i!==idx):a);
  const inSt={padding:"8px 10px",borderRadius:8,border:`1px solid ${D.s200}`,fontSize:12,fontFamily:"inherit",width:"100%",boxSizing:"border-box"};

  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Inp label="Đại lý" value={dealerId} onChange={v=>setDealerId(+v)} opts={dealers.map(d=>({value:d.id,label:`${d.name} (${d.tier})`}))}/>
        <Inp label="Ngày đặt" value={date} onChange={setDate} type="date"/>
        <Inp label="Trạng thái" value={status} onChange={setStatus} opts={[{value:"pending",label:"Chờ xác nhận"},{value:"processing",label:"Đang xử lý"},{value:"delivered",label:"Đã giao"}]}/>
      </div>

      <div style={{border:`1px solid ${D.s200}`,borderRadius:12,padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontWeight:700,fontSize:13,color:D.s900}}>📦 Vật tư — giá đại lý <b style={{color:D.bg}}>(VNĐ)</b></div>
          <Btn v="ghost" sz="sm" onClick={addItem}>➕ Thêm dòng</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 56px 120px 130px 28px",gap:8,fontSize:10,fontWeight:700,color:D.s400,marginBottom:4,padding:"0 2px"}}>
          <span>Mã — Tên vật tư</span><span>SL</span><span>Đơn giá (VNĐ)</span><span style={{textAlign:"right"}}>Thành tiền</span><span/>
        </div>
        <div style={{display:"grid",gap:8}}>
          {items.map((it,idx)=>(
            <div key={idx} style={{display:"grid",gridTemplateColumns:"2fr 56px 120px 130px 28px",gap:8,alignItems:"center"}}>
              <select value={it.mid} onChange={e=>setItem(idx,"mid",+e.target.value)} style={inSt}>
                {MATERIALS.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
              <input type="number" min="1" value={it.qty} onChange={e=>setItem(idx,"qty",+e.target.value)} style={inSt}/>
              <input type="number" value={it.price} onChange={e=>setItem(idx,"price",+e.target.value)} style={inSt}/>
              <div style={{fontSize:12,fontWeight:700,color:D.s700,textAlign:"right"}}>{vnd((+it.qty||0)*(+it.price||0))}</div>
              <button onClick={()=>delItem(idx)} title="Xoá dòng" style={{background:"none",border:"none",color:D.s300,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:10,paddingTop:10,borderTop:`1px solid ${D.s100}`,fontSize:14,fontWeight:900,color:D.s900}}>Tổng: {vnd(total)}đ · {totalQty} sp</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:12}}>
        <Inp label="Đã thanh toán (VNĐ)" value={paid} onChange={v=>setPaid(+v||0)} type="number" note={total-(+paid||0)>0?`Còn nợ ${vnd(total-(+paid||0))}đ`:"Đã thanh toán đủ"}/>
        <Inp label="Ghi chú" value={note} onChange={setNote} ph="Ghi chú đơn hàng..."/>
      </div>

      <div style={{display:"grid",gap:12}}>
        <div style={{fontWeight:800,fontSize:13,color:D.s900}}>Hình thức thực hiện đơn</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12}}>
          {[
            {id:"delivery",               icon:"🚚",  t:"Giao hàng đến đại lý",   d:"Chỉ tạo lịch giao hàng"},
            {id:"delivery_install",       icon:"🚚🔧",t:"Giao + Lắp cho đại lý",  d:"Lắp tại địa chỉ đại lý"},
            {id:"delivery_install_retail",icon:"🚚🏠",t:"Giao + Lắp cho khách lẻ",d:"Lắp tại công trình khách lẻ"},
          ].map(opt=>{
            const sel=fulfillment===opt.id;
            return(
              <div key={opt.id} onClick={()=>setFulfillment(opt.id)} style={{border:`1.5px solid ${sel?D.gold:D.s200}`,borderRadius:12,padding:"12px 14px",background:sel?D.goldLL:D.w,cursor:"pointer",transition:"all .15s",display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${sel?D.bg:D.s300}`,flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center"}}>{sel&&<div style={{width:8,height:8,borderRadius:"50%",background:D.bg}}/>}</div>
                <div><div style={{fontWeight:800,fontSize:13,color:D.s900}}>{opt.icon} {opt.t}</div><div style={{fontSize:11,color:D.s500,marginTop:2}}>{opt.d}</div></div>
              </div>
            );
          })}
        </div>

        <div style={{border:`1px solid ${D.s200}`,borderRadius:12,padding:14}}>
          <div style={{fontWeight:700,fontSize:12,color:D.bg,marginBottom:10}}>🚚 Lịch giao hàng</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Inp label="Ngày giao" value={delDate} onChange={setDelDate} type="date"/>
            <Inp label="Khung giờ" value={delSlot} onChange={setDelSlot} opts={INSTALL_SLOTS}/>
            <Inp label="Đơn vị vận chuyển" value={carrier} onChange={setCarrier} opts={DELIVERY_CARRIERS}/>
          </div>
        </div>

        {wantInstall&&<div style={{border:`1px solid ${D.gold}`,borderRadius:12,padding:14,background:D.goldLL}}>
          <div style={{fontWeight:700,fontSize:12,color:D.bg,marginBottom:10}}>🔧 {isRetail?"Lắp đặt cho khách lẻ của đại lý":"Lắp đặt cho đại lý"}</div>
          {isRetail&&<div style={{display:"grid",gap:12,marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Inp label="Tên khách lẻ" value={retailCustomer} onChange={setRetailCustomer} ph="Anh/Chị..." required/>
              <Inp label="SĐT khách" value={retailPhone} onChange={setRetailPhone} ph="09xxxxxxxx"/>
            </div>
            <Inp label="Địa chỉ công trình" value={retailAddress} onChange={setRetailAddress} ph="Số nhà, đường, quận/huyện..." required/>
            <Inp label="Khu vực công trình" value={retailRegion} onChange={setRetailRegion} ph="Để trống = theo khu vực đại lý"/>
          </div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Inp label="Ngày lắp" value={insDate} onChange={setInsDate} type="date"/>
            <Inp label="Khung giờ" value={insSlot} onChange={setInsSlot} opts={INSTALL_SLOTS}/>
            <Inp label="Kỹ thuật viên" value={insTech} onChange={setInsTech} opts={["","Kỹ thuật 1","Kỹ thuật 2","Kỹ thuật 3"]}/>
          </div>
        </div>}
      </div>

      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn v="ghost" onClick={onClose}>Huỷ</Btn>
        <Btn v="gold" onClick={()=>{
          if(!dealerId){alert("Cần chọn đại lý");return;}
          if(total<=0){alert("Cần nhập sản phẩm và số lượng");return;}
          if(isRetail&&(!retailCustomer||!retailAddress)){alert("Cần nhập tên khách lẻ và địa chỉ công trình");return;}
          onSave(
            {dealerId:+dealerId,date,items:items.map(i=>({sku:i.sku,name:i.name||matByCode(i.sku)?.name||"",qty:+i.qty||0,price:+i.price||0})),status,paid:+paid||0,total,note},
            {delivery:{date:delDate,carrier,slot:delSlot},install:wantInstall?{date:insDate,slot:insSlot,tech:insTech,retail:isRetail,customer:retailCustomer,phone:retailPhone,address:retailAddress,region:retailRegion}:null}
          );
        }}>💾 Tạo đơn hàng</Btn>
      </div>
    </div>
  );
};

// ── DATA SAVE KEY (dùng cho storage artifact API) ────────────────────────────
const SAVE_KEY = "psv_crm_data_v1";

export default function App(){
  // ── Load data: thử đọc từ storage trước, fallback về INIT_STATE ──────────
  const [S,dispatch]=useState(()=>{
    try {
      const raw = sessionStorage.getItem(SAVE_KEY);
      if (raw) { const parsed = JSON.parse(raw); if (parsed?.deals) return parsed; }
    } catch(e) {}
    return INIT_STATE;
  });

  const disp=useCallback((action)=>dispatch(s=>{
    const next=reducer(s,action);
    // Auto-save vào sessionStorage sau mỗi action
    try { sessionStorage.setItem(SAVE_KEY, JSON.stringify(next)); } catch(e){}
    return next;
  }),[]);

  const [tab,setTab]=useState("dashboard");
  const [modal,setModal]=useState(null);
  const [toastMsg,setToastMsg]=useState(null);
  const [collapsed,setCollapsed]=useState(false);
  const [showDataPanel,setShowDataPanel]=useState(false);
  const importRef=useRef(null);

  // Inject global CSS once on mount
  useEffect(()=>{
    const id="psv-crm-styles";
    if(document.getElementById(id)) return;
    const el=document.createElement("style");
    el.id=id;
    el.textContent=[
      "*{box-sizing:border-box}",
      "::-webkit-scrollbar{width:6px;height:6px}",
      "::-webkit-scrollbar-track{background:transparent}",
      "::-webkit-scrollbar-thumb{background:rgba(42,7,9,0.15);border-radius:99px}",
      "::-webkit-scrollbar-thumb:hover{background:rgba(42,7,9,0.3)}",
      "@keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}",
      "@keyframes pulseDot{0%,100%{opacity:1}50%{opacity:0.4}}",
      ".psv-view{animation:fadeSlideIn .22s cubic-bezier(.4,0,.2,1)}",
    ].join(" ");
    document.head.appendChild(el);
    return ()=>{};
  },[]);

  const toast=(msg,type="success")=>{setToastMsg({msg,type});setTimeout(()=>setToastMsg(null),3500);};
  const openModal=(type,data)=>setModal({type,data});
  const closeModal=()=>setModal(null);

  // ── EXPORT: tải file JSON về máy ─────────────────────────────────────────
  const exportData=()=>{
    const blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    const dateStr=new Date().toISOString().slice(0,10).replace(/-/g,"");
    a.href=url; a.download=`PSV_CRM_backup_${dateStr}.json`; a.click();
    URL.revokeObjectURL(url);
    toast("✅ Đã xuất file backup thành công!");
  };

  // ── IMPORT: đọc file JSON và load vào state ───────────────────────────────
  const importData=(e)=>{
    const file=e.target.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try {
        const parsed=JSON.parse(ev.target.result);
        if(!parsed?.deals||!parsed?.dealers) throw new Error("File không hợp lệ");
        dispatch(parsed);
        try { sessionStorage.setItem(SAVE_KEY, JSON.stringify(parsed)); } catch(e){}
        toast(`✅ Đã load data: ${parsed.deals.length} deals, ${parsed.dealers.length} đại lý`);
        setShowDataPanel(false);
      } catch(err) { toast("❌ File lỗi — không đọc được data","danger"); }
    };
    reader.readAsText(file);
    e.target.value="";
  };

  // ── RESET về data mẫu ────────────────────────────────────────────────────
  const resetData=()=>{
    if(!confirm("Reset về data mẫu? Toàn bộ data hiện tại sẽ mất!")) return;
    dispatch(INIT_STATE);
    try { sessionStorage.removeItem(SAVE_KEY); } catch(e){}
    toast("🔄 Đã reset về data mẫu");
    setShowDataPanel(false);
  };

  const stall=S.deals.filter(d=>!["s7","lost"].includes(d.stage)&&daysDiff(d.stageDt)>7).length;
  const overdue=S.followups.filter(f=>!f.done&&f.due<=todayStr).length;
  const openTickets=S.tickets.filter(t=>t.status!=="resolved"&&t.priority==="high").length;

  const VIEWS={
    dashboard:<Dashboard S={S} dispatch={disp} setTab={setTab} openModal={openModal} toast={toast}/>,
    pipeline: <PipelineView S={S} dispatch={disp} openModal={openModal}/>,
    dealers:  <div style={{display:"grid",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:900,color:D.s900}}>Quản lý Đại Lý (Pipeline B)</h2>
        <Btn v="gold" sz="sm" onClick={()=>openModal("newDealer")} icon="➕">Thêm đại lý</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14}}>
        {S.dealers.map(d=>{
          const st=statusOf(d.status);const ds=d.ds[d.ds.length-1]||0;const dsPrv=d.ds[d.ds.length-2]||0;const t=ds>dsPrv?"↑":ds<dsPrv?"↓":"→";const tc=ds>dsPrv?D.gr:ds<dsPrv?D.rd:D.s400;const lod=d.lastOrder?daysDiff(d.lastOrder):999;
          return(
            <div key={d.id} onClick={()=>openModal("editDealer",d)} style={{background:D.w,border:`1.5px solid ${["atrisk","inactive"].includes(d.status)?D.rd:D.s200}`,borderLeft:`5px solid ${st.dot}`,borderRadius:14,padding:"16px 18px",cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div><div style={{fontWeight:800,fontSize:14,color:D.s900}}>{d.name}</div><div style={{fontSize:11,color:D.s400}}>{d.code} · {d.owner} · {d.region}</div></div>
                <span style={{background:D.goldLL,color:D.bg,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:800,flexShrink:0}}>{d.tier}</span>
              </div>
              <Badge label={st.label} dot={st.dot} bg={st.bg}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",marginTop:12,paddingTop:12,borderTop:`1px solid ${D.s100}`}}>
                {[[`${ds}M`,"Tháng này",D.s900],[t,`${Math.abs(ds-dsPrv)}M`,tc],[lod>300?"—":`${lod}n`,"Đơn cuối",lod>45?D.rd:D.gr]].map(([v,l,c],i)=>(
                  <div key={l} style={{textAlign:"center",borderRight:i<2?`1px solid ${D.s100}`:""}}><div style={{fontWeight:900,fontSize:18,color:c}}>{v}</div><div style={{fontSize:10,color:D.s400}}>{l}</div></div>
                ))}
              </div>
              <div style={{marginTop:10}}><Sparkline data={d.ds} color={st.dot} height={22}/></div>
              {d.note&&<div style={{fontSize:10,color:D.s500,marginTop:8,borderTop:`1px solid ${D.s100}`,paddingTop:6,fontStyle:"italic"}}>{d.note}</div>}
            </div>
          );
        })}
      </div>
    </div>,
    catalog:  <CatalogView S={S} dispatch={disp} toast={toast}/>,
    orders:   <OrdersView S={S} dispatch={disp} openModal={openModal} toast={toast}/>,
    tickets:  <TicketsView S={S} dispatch={disp} openModal={openModal}/>,
    installs: <InstallView S={S} dispatch={disp} openModal={openModal} toast={toast}/>,
    deliveries: <DeliveryView S={S} dispatch={disp} openModal={openModal} toast={toast}/>,
    kpi:      <SalesKPIView S={S}/>,
    zone:     <ZoneView S={S} openModal={openModal}/>,
    followup: <FollowupView S={S} dispatch={disp}/>,
    ai:       <AIAdvisorView S={S}/>,
    reports:  <ReportsView S={S}/>,
    monday:   <MondayView S={S} dispatch={disp} openModal={openModal} setTab={setTab}/>,
  };

  const installOverdue=(S.installs||[]).filter(x=>["scheduled","inprogress"].includes(x.status)&&x.date<todayStr).length;
  const deliveryOverdue=(S.deliveries||[]).filter(x=>["preparing","shipping"].includes(x.status)&&x.date<todayStr).length;
  const ALERTS={pipeline:stall>0,followup:overdue>0,tickets:openTickets>0,installs:installOverdue>0,deliveries:deliveryOverdue>0,orders:S.dealers.reduce((a,d)=>a+(+d.debt||0),0)>0};

  return(
    <div style={{display:"flex",minHeight:"100vh",
      background:`linear-gradient(135deg,#F0EEF8 0%,#EDF2F7 40%,#F5F0EC 100%)`,
      fontFamily:"'Segoe UI',system-ui,-apple-system,sans-serif",color:D.s900}}>

      {/* ── PREMIUM SIDEBAR ──────────────────────────────────────────────────── */}
      <div style={{
        width:collapsed?68:230,flexShrink:0,
        background:`linear-gradient(180deg,${D.bg} 0%,${D.bg2} 60%,${D.bg3} 100%)`,
        display:"flex",flexDirection:"column",
        transition:"width .25s cubic-bezier(.4,0,.2,1)",overflow:"hidden",
        position:"sticky",top:0,height:"100vh",zIndex:50,
        boxShadow:"4px 0 32px rgba(42,7,9,0.18), 1px 0 0 rgba(255,255,255,0.04)"}}>

        {/* Logo */}
        <div style={{padding:collapsed?"18px 14px":"20px 18px",
          borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:36,height:36,borderRadius:11,flexShrink:0,
              background:`linear-gradient(135deg,${D.gold},${D.goldM})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:900,fontSize:16,color:D.bg,
              boxShadow:`0 4px 12px ${D.gold}55, inset 0 1px 0 rgba(255,255,255,0.4)`}}>P</div>
            {!collapsed&&<div style={{flex:1,minWidth:0}}>
              <div style={{color:D.gold,fontWeight:900,fontSize:15,lineHeight:1,
                letterSpacing:"-0.02em"}}>PSV HOME</div>
              <div style={{color:"rgba(255,243,192,0.4)",fontSize:9.5,marginTop:3,
                letterSpacing:"0.04em",textTransform:"uppercase"}}>Enterprise CRM</div>
            </div>}
            {!collapsed&&<button onClick={()=>setShowDataPanel(p=>!p)}
              title="Quản lý data — Export/Import"
              style={{width:28,height:28,borderRadius:8,flexShrink:0,
                background:"rgba(245,197,66,0.12)",
                border:"1px solid rgba(245,197,66,0.25)",
                color:`${D.gold}cc`,cursor:"pointer",fontSize:14,
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(245,197,66,0.22)";e.currentTarget.style.color=D.gold;}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(245,197,66,0.12)";e.currentTarget.style.color=`${D.gold}cc`;}}>
              💾
            </button>}
          </div>
        </div>

        {/* Nav items */}
        <nav style={{flex:1,padding:"10px 8px",display:"flex",flexDirection:"column",
          gap:2,overflowY:"auto",overflowX:"hidden"}}>
          {NAV.map(n=>{
            const active=tab===n.id;
            const hasAlert=ALERTS[n.id];
            return(
              <button key={n.id} onClick={()=>setTab(n.id)}
                title={collapsed?n.label:""}
                style={{display:"flex",alignItems:"center",
                  gap:collapsed?0:10,
                  padding:collapsed?"10px 0":"9px 12px",
                  justifyContent:collapsed?"center":"flex-start",
                  borderRadius:12,border:"none",
                  background:active
                    ?"rgba(245,197,66,0.14)":"transparent",
                  color:active?D.gold:"rgba(255,243,192,0.5)",
                  cursor:"pointer",fontFamily:"inherit",
                  fontWeight:active?800:500,fontSize:13,
                  textAlign:"left",
                  transition:"all .18s cubic-bezier(.4,0,.2,1)",
                  position:"relative",whiteSpace:"nowrap",
                  boxShadow:active?"inset 1px 0 0 rgba(245,197,66,0.6), 0 1px 8px rgba(245,197,66,0.08)":"none"}}>
                {active&&!collapsed&&<div style={{position:"absolute",left:0,top:"20%",bottom:"20%",
                  width:3,borderRadius:99,
                  background:`linear-gradient(180deg,${D.gold},${D.goldM})`}}/>}
                <span style={{fontSize:16,flexShrink:0,
                  filter:active?"drop-shadow(0 0 6px rgba(245,197,66,0.4))":"none",
                  transition:"filter .2s"}}>{n.icon}</span>
                {!collapsed&&<span style={{flex:1}}>{n.label}</span>}
                {hasAlert&&<span style={{
                  width:7,height:7,borderRadius:"50%",flexShrink:0,
                  background:D.rd,
                  position:collapsed?"absolute":"relative",
                  top:collapsed?8:undefined,right:collapsed?8:undefined,
                  boxShadow:`0 0 0 2px ${D.bg2}, 0 0 8px ${D.rd}88`}}/>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div style={{padding:"10px 8px",borderTop:"1px solid rgba(255,255,255,0.05)",flexShrink:0}}>
          <button onClick={()=>setCollapsed(c=>!c)}
            style={{width:"100%",padding:"9px",borderRadius:10,
              border:"1px solid rgba(255,255,255,0.07)",
              background:"rgba(255,255,255,0.04)",
              color:"rgba(255,243,192,0.3)",cursor:"pointer",
              fontSize:11,fontFamily:"inherit",
              display:"flex",alignItems:"center",
              justifyContent:collapsed?"center":"flex-start",gap:8,
              transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.color="rgba(255,243,192,0.6)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(255,243,192,0.3)";}}>
            <span style={{fontSize:14}}>{collapsed?"▶":"◀"}</span>
            {!collapsed&&<span style={{fontWeight:600}}>Thu gọn sidebar</span>}
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div style={{flex:1,overflow:"auto",padding:"28px 32px",minWidth:0}}>
        <div className="psv-view" key={tab}>
          {VIEWS[tab]||<div style={{padding:60,textAlign:"center",color:D.s400,fontSize:15}}>
            Module đang phát triển...
          </div>}
        </div>
      </div>

      {/* Modals */}
      {modal?.type==="newDeal"&&<Modal title="➕ Thêm deal mới" onClose={closeModal} wide><DealForm deal={modal.data} onSave={d=>{disp({type:"SAVE_DEAL",data:d});closeModal();toast("Đã thêm deal mới");}} onClose={closeModal}/></Modal>}
      {modal?.type==="editDeal"&&<Modal title={`✏️ ${modal.data?.name}`} onClose={closeModal} wide><DealForm deal={modal.data} onSave={d=>{disp({type:"SAVE_DEAL",data:d});closeModal();toast("Đã cập nhật deal");}} onClose={closeModal} onDel={()=>{if(confirm("Xoá deal?")){disp({type:"DEL_DEAL",id:modal.data.id});closeModal();toast("Đã xoá deal","danger");}}}/></Modal>}
      {modal?.type==="newDealer"&&<Modal title="➕ Thêm đại lý mới" onClose={closeModal} wide><div style={{color:D.s400,textAlign:"center",padding:20}}>Form đại lý — nhập thông tin cơ bản để bắt đầu</div><div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12}}><Btn v="ghost" onClick={closeModal}>Huỷ</Btn></div></Modal>}
      {modal?.type==="editDealer"&&<Modal title={`✏️ ${modal.data?.name}`} onClose={closeModal} wide><div style={{display:"grid",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[["Tier",modal.data.tier,TIERS],["Trạng thái",modal.data.status,DS_STATUS.map(s=>s.id)],["AM",modal.data.am,["Linh","Sales 2","Sales 3","Sales Manager"]]].map(([l,v,opts])=>(
            <Inp key={l} label={l} value={v} onChange={nv=>{const nd={...modal.data,[l.toLowerCase().replace(" ","")]:nv};setModal(m=>({...m,data:nd}));}} opts={opts}/>
          ))}
          <Inp label="Ghi chú" value={modal.data.note} onChange={v=>setModal(m=>({...m,data:{...m.data,note:v}}))} rows={2}/>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
          <Btn v="danger" sz="sm" onClick={()=>{if(confirm("Xoá đại lý?")){{disp({type:"DEL_DEALER",id:modal.data.id});closeModal();toast("Đã xoá đại lý","danger");}}}}>🗑 Xoá</Btn>
          <div style={{display:"flex",gap:8}}><Btn v="ghost" onClick={closeModal}>Huỷ</Btn><Btn v="gold" onClick={()=>{disp({type:"SAVE_DEALER",data:modal.data});closeModal();toast("Đã cập nhật đại lý");}}>💾 Lưu</Btn></div>
        </div>
      </div></Modal>}
      {modal?.type==="newTicket"&&<Modal title="🎫 Tạo ticket bảo hành" onClose={closeModal} wide><TicketForm dealers={S.dealers} onSave={d=>{disp({type:"SAVE_TICKET",data:d});closeModal();toast("Đã tạo ticket");}} onClose={closeModal}/></Modal>}
      {modal?.type==="newInstall"&&<Modal title="🔧 Thêm lịch lắp đặt" onClose={closeModal} wide><InstallForm dealers={S.dealers} onSave={d=>{disp({type:"SAVE_INSTALL",data:d});closeModal();toast("Đã thêm lịch lắp đặt");}} onClose={closeModal}/></Modal>}
      {modal?.type==="editInstall"&&<Modal title={`🔧 ${modal.data?.customer}`} onClose={closeModal} wide><InstallForm install={modal.data} dealers={S.dealers} onSave={d=>{disp({type:"SAVE_INSTALL",data:d});closeModal();toast("Đã cập nhật lịch lắp");}} onClose={closeModal} onDel={()=>{if(confirm("Xoá lịch lắp đặt?")){disp({type:"DEL_INSTALL",id:modal.data.id});closeModal();toast("Đã xoá lịch lắp","danger");}}}/></Modal>}
      {modal?.type==="newDelivery"&&<Modal title="🚚 Thêm lịch giao hàng" onClose={closeModal} wide><DeliveryForm dealers={S.dealers} orders={S.orders} onSave={d=>{disp({type:"SAVE_DELIVERY",data:d});closeModal();toast("Đã thêm lịch giao hàng");}} onClose={closeModal}/></Modal>}
      {modal?.type==="editDelivery"&&<Modal title={`🚚 ${modal.data?.code}`} onClose={closeModal} wide><DeliveryForm delivery={modal.data} dealers={S.dealers} orders={S.orders} onSave={d=>{disp({type:"SAVE_DELIVERY",data:d});closeModal();toast("Đã cập nhật lịch giao");}} onClose={closeModal} onDel={()=>{if(confirm("Xoá lịch giao hàng?")){disp({type:"DEL_DELIVERY",id:modal.data.id});closeModal();toast("Đã xoá lịch giao","danger");}}}/></Modal>}
      {modal?.type==="newOrder"&&<Modal title="💰 Tạo đơn hàng mới" onClose={closeModal} ultra><OrderForm dealers={S.dealers} onClose={closeModal} onSave={(ord,fx)=>{
        const nums=S.orders.map(o=>parseInt(String(o.code||"").split("-")[1])||0);
        const code=`PO${new Date().getFullYear()}-${String(Math.max(0,...nums)+1).padStart(3,"0")}`;
        disp({type:"SAVE_ORDER",data:{...ord,code,fulfillment:fx.install?(fx.install.retail?"delivery_install_retail":"delivery_install"):"delivery"}});
        const dl=S.dealers.find(d=>d.id===ord.dealerId);
        const product=ord.items.map(i=>`${i.sku} ×${i.qty}`).join(", ");
        const qty=ord.items.reduce((a,i)=>a+i.qty,0);
        if(fx.delivery){
          disp({type:"SAVE_DELIVERY",data:{code:`GH-${String(Date.now()).slice(-4)}`,orderCode:code,dealerId:ord.dealerId,address:dl?.region||"",region:dl?.region||"",zone:dl?.zone||"",product,qty,carrier:fx.delivery.carrier,date:fx.delivery.date,slot:fx.delivery.slot,status:"preparing",note:`Tự tạo từ đơn ${code}`}});
        }
        if(fx.install){
          const rt=fx.install.retail;
          disp({type:"SAVE_INSTALL",data:{code:`LD-${String(Date.now()).slice(-4)}`,orderCode:code,
            customer:rt?(fx.install.customer||"Khách lẻ"):(dl?.name||"Đại lý"),
            phone:rt?(fx.install.phone||""):(dl?.phone||""),
            address:rt?(fx.install.address||""):(dl?.region||""),
            region:rt?(fx.install.region||dl?.region||""):(dl?.region||""),
            zone:dl?.zone||"",dealerId:ord.dealerId,product,qty,date:fx.install.date,slot:fx.install.slot,tech:fx.install.tech,status:"scheduled",
            note:rt?`Lắp cho khách lẻ của ${dl?.name||"đại lý"} — đơn ${code}`:`Lắp đặt cho đại lý — đơn ${code}`}});
        }
        closeModal();
        toast(fx.install?(fx.install.retail?`✅ Đơn ${code} + lịch giao 🚚 + lắp khách lẻ 🏠`:`✅ Đơn ${code} + lịch giao 🚚 + lịch lắp 🔧`):`✅ Đơn ${code} + lịch giao 🚚`);
      }}/></Modal>}

      {/* Hidden file input for import */}
      <input ref={importRef} type="file" accept=".json" onChange={importData} style={{display:"none"}}/>

      {/* Data Management Panel */}
      {showDataPanel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(3px)"}}
          onClick={e=>e.target===e.currentTarget&&setShowDataPanel(false)}>
          <div style={{background:D.w,borderRadius:20,width:"100%",maxWidth:480,boxShadow:"0 40px 100px rgba(0,0,0,0.3)"}}>
            {/* Header */}
            <div style={{background:D.bg,padding:"18px 24px",borderRadius:"20px 20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:D.gold,fontWeight:900,fontSize:15}}>💾 Quản lý Data</div>
                <div style={{color:"rgba(255,243,192,0.6)",fontSize:11,marginTop:3}}>
                  {S.deals.length} deals · {S.dealers.length} đại lý · {S.tickets.length} tickets · {(S.installs||[]).length} lịch lắp · {(S.deliveries||[]).length} lịch giao
                </div>
              </div>
              <button onClick={()=>setShowDataPanel(false)} style={{background:"rgba(255,255,255,0.08)",border:"none",color:D.gold,width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>

            <div style={{padding:24,display:"grid",gap:16}}>

              {/* Auto-save status */}
              <div style={{background:D.grL,border:`1px solid ${D.gr}`,borderRadius:12,padding:"12px 16px",display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:20}}>✅</span>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:D.gr}}>Tự động lưu đang bật</div>
                  <div style={{fontSize:11,color:D.grD,marginTop:2}}>Mọi thay đổi được lưu tự động trong phiên làm việc này. Đóng tab sẽ mất — dùng Export để backup.</div>
                </div>
              </div>

              {/* Export */}
              <div style={{border:`1px solid ${D.s200}`,borderRadius:12,padding:16}}>
                <div style={{fontWeight:700,fontSize:13,color:D.s900,marginBottom:4}}>📤 Export — Tải backup về máy</div>
                <div style={{fontSize:12,color:D.s500,marginBottom:12,lineHeight:1.5}}>
                  Tải toàn bộ data về dạng file <b>.json</b>. Lưu vào điện thoại / Google Drive để dùng lại sau.
                </div>
                <button onClick={exportData}
                  style={{width:"100%",padding:"11px",borderRadius:10,background:D.bg,color:D.gold,border:"none",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  📥 Tải file backup (.json)
                </button>
              </div>

              {/* Import */}
              <div style={{border:`1px solid ${D.s200}`,borderRadius:12,padding:16}}>
                <div style={{fontWeight:700,fontSize:13,color:D.s900,marginBottom:4}}>📂 Import — Load data từ file backup</div>
                <div style={{fontSize:12,color:D.s500,marginBottom:12,lineHeight:1.5}}>
                  Chọn file <b>.json</b> đã export trước đó. Toàn bộ data hiện tại sẽ được thay thế.
                </div>
                <button onClick={()=>importRef.current?.click()}
                  style={{width:"100%",padding:"11px",borderRadius:10,background:D.gold,color:D.bg,border:"none",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  📂 Chọn file .json để import
                </button>
              </div>

              {/* Hướng dẫn */}
              <div style={{background:D.blL,border:`1px solid ${D.bl}22`,borderRadius:12,padding:14}}>
                <div style={{fontWeight:700,fontSize:12,color:D.bl,marginBottom:8}}>📱 Cách dùng trên điện thoại</div>
                {[
                  "Lần đầu: nhập data thật vào app, nhấn Export → lưu file vào Google Drive",
                  "Lần sau mở lại: nhấn Import → chọn file từ Google Drive → data load lại",
                  "Sau mỗi buổi làm việc: Export lại để cập nhật backup mới nhất",
                  "Chia sẻ team: gửi file .json qua Zalo/email → mỗi người Import vào máy mình",
                ].map((tip,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:11,color:D.blD}}>
                    <span style={{fontWeight:800,minWidth:16}}>{i+1}.</span>
                    <span style={{lineHeight:1.5}}>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Reset */}
              <button onClick={resetData}
                style={{width:"100%",padding:"9px",borderRadius:10,background:"none",color:D.s400,border:`1px dashed ${D.s300}`,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                🔄 Reset về data mẫu (xoá hết data hiện tại)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg&&<Toast msg={toastMsg.msg} type={toastMsg.type} onClose={()=>setToastMsg(null)}/>}
    </div>
  );
}
