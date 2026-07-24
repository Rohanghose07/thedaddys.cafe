"use strict";
(function(){
  const DAYS=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const DEFAULT={
    ordering_enabled:true,timezone:"Asia/Kolkata",
    business_hours:{
      monday:[["10:00","14:00"],["16:00","22:00"]],tuesday:[["10:00","14:00"],["16:00","22:00"]],
      wednesday:[["10:00","14:00"],["16:00","22:00"]],thursday:[["10:00","14:00"],["16:00","22:00"]],
      friday:[["10:00","14:00"],["16:00","22:00"]],saturday:[["10:00","14:00"],["16:00","22:00"]],
      sunday:[["17:30","22:00"]]
    }
  };
  function parts(now=new Date(),tz="Asia/Kolkata"){
    const f=new Intl.DateTimeFormat("en-US",{timeZone:tz,weekday:"long",hour:"2-digit",minute:"2-digit",hour12:false});
    const out={}; for(const x of f.formatToParts(now)) if(x.type!=="literal") out[x.type]=x.value;
    return {day:String(out.weekday||"").toLowerCase(),minutes:Number(out.hour)*60+Number(out.minute)};
  }
  function mins(t){const [h,m]=String(t||"0:0").split(":").map(Number);return h*60+m}
  function fmt(t){if(!t)return"";let [h,m]=t.split(":").map(Number),ap=h>=12?"PM":"AM";h=h%12||12;return `${h}:${String(m).padStart(2,"0")} ${ap}`}
  function status(settings=DEFAULT,now=new Date()){
    const cfg={...DEFAULT,...settings,business_hours:settings?.business_hours||DEFAULT.business_hours};
    if(cfg.ordering_enabled===false)return {open:false,message:"Temporarily closed for online orders",next:""};
    const p=parts(now,cfg.timezone||"Asia/Kolkata"), slots=cfg.business_hours?.[p.day]||[];
    for(const slot of slots){if(p.minutes>=mins(slot[0])&&p.minutes<mins(slot[1]))return{open:true,message:`Open now · Orders accepted until ${fmt(slot[1])}`,next:fmt(slot[1])}}
    const todayFuture=slots.find(s=>p.minutes<mins(s[0]));
    if(todayFuture)return{open:false,message:`Closed now · Opens today at ${fmt(todayFuture[0])}`,next:fmt(todayFuture[0])};
    const di=DAYS.indexOf(p.day);
    for(let add=1;add<=7;add++){const day=DAYS[(di+add)%7],ss=cfg.business_hours?.[day]||[];if(ss.length)return{open:false,message:`Closed now · Opens ${add===1?"tomorrow":day.charAt(0).toUpperCase()+day.slice(1)} at ${fmt(ss[0][0])}`,next:fmt(ss[0][0])}}
    return{open:false,message:"Closed · Online ordering unavailable",next:""};
  }
  async function load(){
    try{if(window.supabaseClient){const {data,error}=await window.supabaseClient.from("store_settings").select("*").eq("id",1).maybeSingle();if(!error&&data){localStorage.setItem("tdcStoreSettings",JSON.stringify(data));return data}}}catch(e){console.warn("Store hours load failed",e)}
    try{return JSON.parse(localStorage.getItem("tdcStoreSettings")||"null")||DEFAULT}catch{return DEFAULT}
  }
  window.TDCBusinessHours={DEFAULT,load,status,fmt};
})();
