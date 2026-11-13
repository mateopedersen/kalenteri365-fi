export function lunarPageHeader({year,month,monthName,icon}){
  const days=new Date(Date.UTC(year,month,0)).getUTCDate();
  return `<header class="lunar-page-header">
    <div class="lunar-header-copy">
      <div class="lunar-header-heading"><p class="lunar-header-eyebrow">KUUKALENTERI · SUOMEN AIKA</p><h1>${monthName} <span>${year}</span></h1><div class="lunar-header-facts"><span>${days} päivää</span><span>4 tulostuspohjaa</span></div></div>
      <p class="lunar-header-description">Seuraa Kuun valaistusta päivä päivältä ja tarkista päävaiheiden ajankohdat Suomen ajassa.</p>
      <div class="lunar-header-actions"><a class="lunar-header-download" href="#lunar-print-templates">${icon('download')}<span>Lataa kalenteri</span></a><button type="button" data-action="print">${icon('print')}<span>Tulosta</span></button><button type="button" data-share-open>${icon('share')}<span>Jaa</span></button></div>
    </div>
    <div class="lunar-header-art"><div class="lunar-header-orbit" aria-hidden="true"></div><img src="/assets/photos/moon-heading.webp" width="400" height="400" alt="Kuun kraattereita ja tummia merialueita" decoding="async" fetchpriority="high"></div>
  </header>`;
}
