export const STARTERS = [
  {id:'month-finland',view:'month',name:'Sinivalkoinen kuukausi',note:'Selkeä ruudukko ja Suomen pyhät',preset:'suomi',orientation:'landscape',title:'Oma kuukauteni'},
  {id:'month-notes',view:'month',name:'Kuukausi ja muistiinpanot',note:'Tilaa tehtäville ja tärkeille asioille',preset:'business',orientation:'portrait',notes:true,title:'Kuukauden suunnitelma'},
  {id:'month-photo',view:'month',name:'Valokuvakalenteri',note:'Lisää oma kuva ja tärkeät päivät',preset:'photo',orientation:'portrait',title:'Minun vuoteni kuvina'},
  {id:'year-finland',view:'year',name:'Vuosi yhdellä silmäyksellä',note:'Kaksitoista kuukautta samalle arkille',preset:'suomi',orientation:'landscape',title:'Oma vuoteni'},
  {id:'year-editorial',view:'year',name:'Ajaton vuosikalenteri',note:'Kaunis kirjasin ja lämmin paperi',preset:'editorial',orientation:'portrait',title:'Vuoden tärkeät hetket'},
  {id:'year-ink',view:'year',name:'Muste ja paperi',note:'Pelkistetty, mustavalkoinen vuosinäkymä',preset:'minimal',orientation:'portrait',title:'Kalenterivuosi'},
  {id:'week-work',view:'week',name:'Viikon rytmi',note:'Seitsemän päivää ja omat menot',preset:'business',orientation:'landscape',title:'Viikkosuunnitelma'},
  {id:'week-family',view:'week',name:'Yhteinen viikko',note:'Perheen menot ja muistettavat asiat',preset:'editorial',orientation:'portrait',title:'Meidän viikkomme'},
  {id:'week-focus',view:'week',name:'Viikon tavoitteet',note:'Päiväkohtaiset suunnitelmat ja muistiinpanot',preset:'suomi',orientation:'landscape',notes:true,title:'Tärkeintä tällä viikolla'},
  {id:'blank-grid',view:'blank',name:'Tyhjä kuukausipohja',note:'Viisi viikkoa, ilman valmiita päivämääriä',preset:'minimal',orientation:'landscape',grid:true,title:'Oma suunnitelmani'},
  {id:'blank-colour',view:'blank',name:'Värikäs suunnittelupohja',note:'Nimeä päivät ja koristele itse',preset:'editorial',orientation:'portrait',grid:true,title:'Tilaa omille ideoille'},
  {id:'blank-page',view:'blank',name:'Vapaa sivu',note:'Kuvaa, tekstiä, symboleja ja muistiinpanoja',preset:'minimal',orientation:'portrait',grid:false,title:'Ideoita ja muistiinpanoja'},
];
export const VIEW_NAMES={month:'Kuukausi',year:'Vuosi',week:'Viikko',blank:'Tyhjä pohja'};
export const STICKERS={star:'Tähti',heart:'Sydän',gift:'Juhla',leaf:'Luonto',plane:'Matka',check:'Valmis'};
export function stickerMarkup(symbol,color='#245c8e',id='sticker'){
  const shapes={
    star:'<path d="m40 9 9 20 23 3-17 16 5 23-20-12-20 12 5-23L8 32l23-3Z"/>',
    heart:'<path d="M40 69 12 43C-6 25 18 4 33 18l7 7 7-7C63 4 85 25 68 43Z"/>',
    gift:'<rect x="15" y="33" width="50" height="36" rx="5"/><rect x="9" y="25" width="62" height="15" rx="4"/><path d="M40 25C13 28 17 2 30 10c9 5 10 15 10 15Zm0 0C67 28 63 2 50 10c-9 5-10 15-10 15Z" fill="none" stroke="#c6a65e" stroke-width="6"/><path d="M39 29v38" stroke="#f6deb0" stroke-width="9"/>',
    leaf:'<path d="M68 12C24 4 5 30 18 54c21 24 52 3 50-42Z"/><path d="M13 70 56 25M30 52l-6-15m17 4 16 1" fill="none" stroke="#eaf2d7" stroke-width="3.5" stroke-linecap="round"/>',
    plane:'<path d="m9 43 27-5 15-23c4-7 11-8 14-5s2 8-3 14L45 45l-1 24-9 4-5-21-19 1-7-6Z"/><path d="m35 40 10 5" fill="none" stroke="#d5e8fa" stroke-width="3"/>',
    check:'<rect x="13" y="10" width="54" height="62" rx="11"/><path d="m25 40 11 11 21-23" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
  };
  return `<defs><linearGradient id="${id}" x2=".8" y2="1"><stop stop-color="#d5e8f9"/><stop offset=".4" stop-color="${color}"/><stop offset="1" stop-color="#16375a"/></linearGradient></defs><g fill="url(#${id})" stroke="${color}" stroke-width="1.2">${shapes[symbol]||shapes.star}</g>`;
}
