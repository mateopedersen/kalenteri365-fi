const origin='https://kalenteri365.fi';
const rightsPage=origin+'/valokuvat-ja-lisenssit/';
const absolute=value=>new URL(value,origin).href.replace(/^http:\/\/creativecommons\.org\//,'https://creativecommons.org/');
const project={'@type':'Organization',name:'Kalenteri365',url:origin+'/'};
const organizations=new Set(['Kanta-Hämeen kuvapankki','Kymenlaakson museo','Grovemade','USAID U.S. Agency for International Development']);

export function photoImageSchema(photo){
  const author=photo.author?.trim();
  const creator=author?{'@type':organizations.has(author)||author.startsWith('NASA · ')?'Organization':'Person',name:author}:null;
  return {'@type':'ImageObject',contentUrl:absolute(photo.src),caption:photo.alt,
    ...(creator?{creator}:{}),
    creditText:[author||'Tekijää ei ole nimetty alkuperäisessä lähteessä',photo.license].filter(Boolean).join(' · '),
    copyrightNotice:[photo.license,author].filter(Boolean).join(' · '),
    license:absolute(photo.licenseUrl||photo.source),acquireLicensePage:photo.source,isBasedOn:photo.source};
}

export function illustrationImageSchema({src,alt,section='vuodenaikojen-kuvitus'}){
  return {'@type':'ImageObject',contentUrl:absolute(src),caption:alt,creator:project,
    creditText:'Kalenteri365 · tekoälyavusteinen digitaalinen kuvitus',
    copyrightNotice:'Kalenteri365 · digitaalinen kuvitus; käyttöehdot lisenssisivulla',
    license:rightsPage+'#'+section,acquireLicensePage:rightsPage+'#'+section};
}

export function socialImageSchema(social){
  if(!social.src)return null;
  const sources=(social.sources||[]).map(photoImageSchema);
  return {'@type':'ImageObject',url:absolute(social.src),contentUrl:absolute(social.src),caption:social.alt,
    width:social.width||1200,height:social.height||630,encodingFormat:social.type||'image/jpeg',
    creator:project,creditText:social.creditText||'Kalenteri365 · jakokuvan sommittelu',
    copyrightNotice:['Kalenteri365 · jakokuvan sommittelu',...sources.map(image=>image.copyrightNotice)].join('; '),
    license:rightsPage+'#jakokuvat',acquireLicensePage:rightsPage+'#jakokuvat',
    ...(sources.length?{isBasedOn:sources}:{})};
}
