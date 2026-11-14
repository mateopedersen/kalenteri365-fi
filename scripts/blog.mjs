import blog from '../data/blog.json' with {type:'json'};
import inlineLinks from '../data/blog-inline-links.json' with {type:'json'};
import {createHash} from 'node:crypto';
import {annotatedParagraph} from '../src/editorial-links.mjs';
import {holidays,MONTHS,SLUGS,cap} from '../src/calendar.mjs';
import {blogCards} from '../src/edition-view.mjs';
import {esc,link,icon,tools} from '../src/ui.mjs';
import {photo} from '../src/photos.mjs';
const labels={'/':'Oma kalenteri ja varmuuskopio','/tietosuoja/':'Tietosuoja ja tietojen hallinta','/tahtitieteellinen-kalenteri/':'Tähtitieteellinen kalenteri','/horoskooppi/#nouseva-merkki':'Laske nouseva merkkisi','/horoskooppi/':'Päivän horoskooppi'};
const labelFor=url=>{
 const calendar=url.match(/^\/kalenteri\/(202[7-9]|2030)\/(?:([a-z]+)\/)?$/);
 if(calendar)return calendar[2]?cap(MONTHS[SLUGS.indexOf(calendar[2])])+' '+calendar[1]:'Kalenteri '+calendar[1];
 return labels[url]||holidays(2027).find(h=>url==='/juhlapyhat/'+h.slug+'/')?.name||tools.find(t=>url.startsWith('/'+t[0]+'/'))?.[1]||'Kalenterit ja oppaat';
};
function paragraph(g,section,index){
 const text=g.sections[section].paragraphs[index],links=inlineLinks.find(a=>a.slug===g.slug)?.links.filter(l=>l.section===section&&l.paragraph===index)||[];
 for(const l of links)if(createHash('sha256').update(text).digest('hex')!==l.sha256)throw Error('Recheck changed blog paragraph: '+g.slug+' '+section+':'+index);
 return annotatedParagraph(text,links);
}
const sectionId=i=>'osio-'+(i+1);
const words=g=>[g.title,g.intro,...g.sections.flatMap(s=>[s.title,...s.paragraphs])].join(' ').split(/\s+/).length;
export async function blogPages(page){
 const categories=[...new Set(blog.map(g=>g.category||'Kalenterit'))];
 await page('/blogi/','Blogi ja oppaat Suomen arkeen','Käytännön artikkeleita Suomen juhlapäivistä, kalentereista, työstä, opiskelusta ja taivaan ilmiöistä.',
  `<p class="blog-directory-intro">Miten juhannuksen päivämäärä määräytyy? Kuinka suunnittelet perheen viikon tai tulostat selkeän kalenterin? Näistä artikkeleista löydät käytännön esimerkkejä, taustatiedot ja aiheeseen sopivat työkalut.</p><section class="blog-filters no-print" aria-label="Rajaa artikkeleita"><button type="button" data-blog-filter="" aria-pressed="true">Kaikki artikkelit</button>${categories.map(c=>`<button type="button" data-blog-filter="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('')}<label class="sr-only" for="blog-search">Hae artikkeleista</label><input id="blog-search" type="search" placeholder="Hae aihetta tai juhlapäivää…"></section><h2 class="sr-only">Artikkelit</h2><p class="blog-filter-status" id="blog-count" role="status">${blog.length} artikkelia</p>${blogCards(blog)}<p class="panel" id="blog-empty" hidden>Artikkeleita ei löytynyt. Kokeile toista aihetta tai lyhyempää hakusanaa.</p>`, 'blog');
 await page('/oppaat/','Mistä aloitan kalenterin suunnittelun?','Valitse käytännön opas tarpeesi mukaan: päivämäärät, tulostaminen, perhearki, työ tai opiskelu.',
  `<section class="content-guide"><div class="section-heading"><h2>Hyvä suunnitelma alkaa yhdestä kysymyksestä</h2>${link('/blogi/','Selaa kaikkia artikkeleita '+icon('arrow'),'section-link')}</div><p class="blog-directory-intro">Valitse ensin asia, jonka haluat saada selville tai järjestykseen. Lyhyt ohje vie suoraan sopivaan työkaluun, ja tarkempi artikkeli auttaa ymmärtämään valinnat.</p><div class="home-topic-grid">${blog.map(g=>link('/blogi/'+g.slug+'/',`<div><span class="blog-category">${esc(g.category||'Kalenterit')}</span><h3>${esc(g.title)}</h3><p>${esc(g.summary||g.intro)}</p><span class="topic-open">Lue ohje ${icon('arrow')}</span></div>`,'home-topic')).join('')}</div></section>`);
 for(const g of blog){
  const date=g.updated||'2026-11-13',minutes=Math.max(2,Math.ceil(words(g)/180));
  const body=`<div class="article-layout"><article class="blog-article"><div class="article-meta"><span>${esc(g.category||'Kalenterit')}</span><a rel="author" href="/tietoa/#artturi-koskinen">${esc(g.author.name)}</a><time datetime="${date}">Päivitetty ${date.split('-').reverse().join('.')}</time><span>${minutes} min lukuaikaa</span></div><figure class="article-lead-photo">${photo(g.photo,{lazy:false,sizes:'(max-width:800px) 92vw, 780px'})}</figure>${g.sections.map((s,i)=>`<section id="${sectionId(i)}"><h2>${esc(s.title)}</h2>${s.paragraphs.map((p,j)=>`<p>${paragraph(g,i,j)}</p>`).join('')}${s.links?.length?`<div class="article-inline-links">${s.links.map(l=>link(l.href,esc(l.label)+' '+icon('arrow'))).join('')}</div>`:''}</section>`).join('')}<section><h2>Kokeile omassa suunnitelmassasi</h2><div class="actions">${g.links.map(u=>link(u,esc(labelFor(u))+' '+icon('arrow'),'btn secondary')).join('')}</div></section><section class="article-sources"><h2>Lähteet ja lisätieto</h2><ul>${g.sources.map(([u,t])=>`<li>${link(u,esc(t))}</li>`).join('')}</ul><p class="small">Kysymys tai korjaus tästä artikkelista? ${link('/yhteystiedot/','Lähetä palautetta')}. ${link('/toimitusperiaatteet/','Näin tietoja käsitellään')}.</p></section></article><aside class="article-aside no-print"><div><h2>Tässä artikkelissa</h2><nav aria-label="Artikkelin sisältö">${g.sections.map((s,i)=>link('#'+sectionId(i),esc(s.title))).join('')}</nav><h2>Aiheen työkalut</h2>${g.links.map(u=>link(u,esc(labelFor(u))+' '+icon('arrow'),'btn secondary')).join('')}</div></aside></div><section class="content-section"><div class="section-heading"><h2>Jatka lukemista</h2>${link('/blogi/','Kaikki artikkelit '+icon('arrow'),'section-link')}</div>${blogCards(blog.filter(x=>x.slug!==g.slug).sort((a,b)=>(g.relatedArticleSlugs||[]).includes(b.slug)-(g.relatedArticleSlugs||[]).includes(a.slug)),{limit:3})}</section>`;
  await page('/blogi/'+g.slug+'/',g.title,g.summary||g.intro,body,'article',{extra:{article:{author:{'@type':g.author.type,name:g.author.name,url:g.author.url},datePublished:g.published||date,dateModified:date,wordCount:words(g),category:g.category||'Kalenterit'}}});
 }
}
