// WMO weather interpretation codes published by Open-Meteo.
export function weatherCondition(code, isDay = true) {
  if (code === 0) return {name:isDay ? 'Selkeää' : 'Selkeä yö', icon:isDay ? 'sun' : 'moon'};
  if ([1,2,3].includes(code)) return {name:['','Melko selkeää','Puolipilvistä','Pilvistä'][code],icon:'cloud'};
  if ([45,48].includes(code)) return {name:'Sumua',icon:'cloud'};
  if ([51,53,55].includes(code)) return {name:'Tihkusadetta',icon:'rain'};
  if ([56,57,66,67].includes(code)) return {name:'Jäätävää sadetta',icon:'rain'};
  if ([61,63,65].includes(code)) return {name:'Sadetta',icon:'rain'};
  if ([71,73,75,77].includes(code)) return {name:'Lumisadetta',icon:'snow'};
  if ([80,81,82].includes(code)) return {name:'Sadekuuroja',icon:'rain'};
  if ([85,86].includes(code)) return {name:'Lumikuuroja',icon:'snow'};
  if ([95,96,97,99].includes(code)) return {name:'Ukkosta',icon:'storm'};
  return {name:'Säätila ei ole saatavilla',icon:'cloud'};
}
