export const STARTERS = [
  {id:'month-finland',view:'month',name:'Sinivalkoinen kuukausi',note:'Selkeä arjen kalenteri Suomen pyhillä.',preset:'suomi',orientation:'landscape',title:'Oma kuukauteni',motif:'geometry'},
  {id:'month-notes',view:'month',name:'Kuukausi ja muistiinpanot',note:'Suunnitelmat ja muistettavat samalla sivulla.',preset:'business',orientation:'portrait',notes:true,title:'Kuukauden suunnitelma',motif:'botanical'},
  {id:'month-photo',view:'month',name:'Valokuvakalenteri',note:'Oma valokuva ja kuukauden tärkeät päivät.',preset:'photo',orientation:'portrait',title:'Minun vuoteni kuvina',motif:'lake'},
  {id:'month-lake',view:'month',name:'Järven rannalla',note:'Sininen järvimaisema ja väljä kuukausiruudukko.',preset:'editorial',orientation:'landscape',title:'Kuukausi kerrallaan',motif:'lake'},
  {id:'year-finland',view:'year',name:'Vuosi yhdellä silmäyksellä',note:'Koko vuosi yhdelle vaakasuuntaiselle arkille.',preset:'suomi',orientation:'landscape',title:'Oma vuoteni',motif:'geometry'},
  {id:'year-editorial',view:'year',name:'Ajaton vuosikalenteri',note:'Lämmin paperi ja huolella asetellut kuukaudet.',preset:'editorial',orientation:'portrait',title:'Vuoden tärkeät hetket',motif:'botanical'},
  {id:'year-ink',view:'year',name:'Muste ja paperi',note:'Hillitty mustavalkoinen kalenteri tulostamiseen.',preset:'minimal',orientation:'portrait',title:'Kalenterivuosi',motif:'none'},
  {id:'year-forest',view:'year',name:'Pohjoinen metsä',note:'Metsän sävyt ja kaksitoista selkeää kuukautta.',preset:'photo',orientation:'landscape',title:'Vuoteni suunnitelmat',motif:'forest'},
  {id:'week-work',view:'week',name:'Viikon rytmi',note:'Seitsemän päivää ja tilaa omille menoille.',preset:'business',orientation:'landscape',title:'Viikkosuunnitelma',motif:'geometry'},
  {id:'week-family',view:'week',name:'Yhteinen viikko',note:'Perheen menot rauhallisessa pystynäkymässä.',preset:'editorial',orientation:'portrait',title:'Meidän viikkomme',motif:'botanical'},
  {id:'week-focus',view:'week',name:'Viikon tavoitteet',note:'Päivän tehtävät ja viikon muistiinpanot.',preset:'suomi',orientation:'landscape',notes:true,title:'Tärkeintä tällä viikolla',motif:'none'},
  {id:'week-study',view:'week',name:'Opiskeluviikko',note:'Lukemiset, määräajat ja viikon oma muistilista.',preset:'photo',orientation:'landscape',notes:true,title:'Opiskeluviikkoni',motif:'forest'},
  {id:'blank-grid',view:'blank',name:'Tyhjä kuukausipohja',note:'Viisi viikkoa omille päivämäärille.',preset:'minimal',orientation:'landscape',grid:true,title:'Oma suunnitelmani',motif:'none'},
  {id:'blank-colour',view:'blank',name:'Luonnon sävyt',note:'Nimeä päivät ja lisää omat merkinnät.',preset:'editorial',orientation:'portrait',grid:true,title:'Tilaa omille ideoille',motif:'botanical'},
  {id:'blank-page',view:'blank',name:'Vapaa sivu',note:'Vapaa pohja kuville, teksteille ja symboleille.',preset:'minimal',orientation:'portrait',grid:false,title:'Ideoita ja muistiinpanoja',motif:'none'},
  {id:'blank-lake',view:'blank',name:'Sininen muistikirja',note:'Järvikuvitus ja viivoitettu tila ajatuksille.',preset:'suomi',orientation:'landscape',grid:false,notes:true,title:'Omat muistiinpanoni',motif:'lake'},
];
export const VIEW_NAMES={month:'Kuukausi',year:'Vuosi',week:'Viikko',blank:'Tyhjä pohja'};
export const MOTIFS={none:'Ei kuvitusta',geometry:'Sinivalkoinen',lake:'Järvimaisema',forest:'Pohjoinen metsä',botanical:'Lehdet ja oksat'};

// Original print-safe vector compositions; no external images or fonts are required.
export function motifMarkup(motif,color='#002f6c',id='studio-motif'){
 const defs=`<defs><linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="#ecf5fb"/><stop offset="1" stop-color="#d4e8ee"/></linearGradient><linearGradient id="${id}-water" x2="0" y2="1"><stop stop-color="#83afbf"/><stop offset="1" stop-color="${color}"/></linearGradient><linearGradient id="${id}-leaf" x2="1" y2="1"><stop stop-color="#b9d6bd"/><stop offset="1" stop-color="#3f776b"/></linearGradient><clipPath id="${id}-clip"><rect x="0" y="0" width="300" height="155" rx="20"/></clipPath></defs>`;
 const tree=(x,y,k,fill)=>`<g transform="translate(${x} ${y}) scale(${k})"><path d="M-2 2h4v84h-4" fill="#6b766e"/><path d="M0 0-25 42h15l-24 26h68L10 42h15Z" fill="${fill}"/><path d="M0 5v59H24L9 42h12Z" fill="#fff" opacity=".13"/></g>`;
 if(motif==='lake')return defs+`<g clip-path="url(#${id}-clip)"><rect width="300" height="155" fill="url(#${id}-sky)"/><circle cx="220" cy="40" r="24" fill="#f8dfa2"/><path d="M0 82q60-50 120-17t180 3v87H0" fill="#94b6b5"/><path d="M0 99q74-22 150-7t150-4v67H0" fill="url(#${id}-water)"/><path d="M92 105h105m-128 12h180m-130 13h98" stroke="#f4fbff" stroke-width="2" opacity=".55"/>${tree(30,36,.95,'#24566a')}${tree(58,60,.65,'#3b7882')}<path d="M0 142q47-24 90 13H0" fill="#2a5b67"/></g>`;
 if(motif==='forest')return defs+`<g clip-path="url(#${id}-clip)"><rect width="300" height="155" fill="#eef4ef"/><circle cx="225" cy="43" r="35" fill="#dce8d7"/><path d="M0 128q150-55 300-15v42H0" fill="#c1d1ba"/>${[[35,42,.9,'#8aa98d'],[85,18,1.35,'#5e8c79'],[137,51,.95,'#44796d'],[203,14,1.4,'#24584f'],[258,60,.8,'#609c86']].map(v=>tree(...v)).join('')}<path d="M0 151q131-27 300-5v9H0" fill="#335f56"/></g>`;
 if(motif==='botanical')return defs+`<rect width="300" height="155" rx="20" fill="#f2f5ed"/><ellipse cx="195" cy="82" rx="76" ry="59" fill="#e4ecd9"/><g fill="url(#${id}-leaf)" stroke="#457d70" stroke-width="1.2"><path d="M92 145q35-60 88-109" fill="none" stroke-width="3"/><path d="M113 112Q62 119 67 76q44-6 46 36Z"/><path d="M133 88q-4-45 36-55 20 34-36 55Z"/><path d="M146 91q22-35 58-16-5 37-58 16Z"/><path d="M173 58q4-39 39-39 16 33-39 39Z"/><path d="M107 126q29-24 56-3-13 29-56 3Z"/></g><g fill="#a9c6d3"><circle cx="53" cy="40" r="5"/><circle cx="234" cy="120" r="7"/><circle cx="250" cy="100" r="3"/></g>`;
 if(motif==='geometry')return defs+`<rect width="300" height="155" rx="20" fill="#edf4fc"/><circle cx="233" cy="70" r="72" fill="#dae8f7"/><g transform="translate(60 16) rotate(-8 78 62)"><rect x="5" y="10" width="159" height="121" rx="10" fill="#c2d5e7"/><rect width="159" height="121" rx="10" fill="#fff" stroke="#aec9df"/><path d="M0 30h159V10Q159 0 149 0H10Q0 0 0 10Z" fill="${color}"/><path d="M35-4v17m89-17v17" stroke="#9bb2c5" stroke-width="7" stroke-linecap="round"/>${[0,1,2].flatMap(r=>[0,1,2,3,4].map(c=>`<rect x="${17+c*27}" y="${45+r*21}" width="16" height="12" rx="2" fill="${r===1&&c===2?color:'#dce8f1'}"/>`)).join('')}</g><circle cx="227" cy="113" r="23" fill="#377b78" stroke="#f9ffff" stroke-width="4"/><path d="m217 113 7 7 14-15" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
 return '';
}
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
