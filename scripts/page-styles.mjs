// Keep shared styles in their original cascade order. Include a feature sheet
// only when its server-rendered root exists; its interactive states stay intact.
const roots={
 'studio-workspace.css':['calendar-studio'],
 'education-hub.css':['education-hub','education-levels','education-cards','education-institution-banner','institution-credits','community-workspace'],
 'garden-planner.css':['garden-workspace','garden-page','crop-photo'],
 'personal-planner.css':['personal-hub','personal-planner','personal-workspace'], 'countdown.css':['countdown-workspace'],
 'calendar-lab.css':['calendar-lab'], 'date-tools.css':['date-tools'],
 'work-overview.css':['work-overview'], 'work-tools.css':['workday-app','shift-workspace'],
 'benefit-workspace.css':['benefit-workspace','pension-workspace'], 'pension-workspace.css':['pension-workspace','benefit-workspace'],
 'tax-calendar.css':['tax-workspace'], 'flagging.css':['flagging-page'], 'namedays.css':['namedays-page'],
 'exams.css':['matriculation'], 'admissions.css':['admissions-page'], 'birthday-calendar.css':['birthday-workspace'],
 'vacation-planner.css':['vacation-planner'], 'long-weekends.css':['weekend-workspace'],
 'contact.css':['contact-page'], 'faq.css':['help-page'], 'legal-pages.css':['legal-page'],
 'solar-eclipse.css':['solar-eclipse-page','lunar-eclipse-page'], 'lunar-eclipse.css':['lunar-eclipse-page'],
 'perseids.css':['perseids-page'], 'clock-change.css':['clock-change-page'],
 'season-reminders.css':['season-reminders'], 'monthly-directory.css':['monthly-directory'],
 'print-catalog.css':['print-catalog-hub','print-catalog'], 'lunar-directory.css':['lunar-photo-intro','lunar-year-card'],
 'lunar-header.css':['lunar-page-header'], 'lunar-phases.css':['lunar-phase-section'],
 'solar-workspace.css':['solar-workspace'], 'daylength.css':['daylength-page-heading','solar-stage'],
 'zodiac-guide.css':['zodiac-guide','horoscope-grid'], 'document-pages.css':['document-hero','legal-intro'],
 'local-weather.css':['local-dashboard'], 'calendar-workspace.css':['calendar-panel','calendar-table'],
};
export function pageStyleNames(names,html){
 const classes=new Set([...html.matchAll(/\bclass="([^"]*)"/g)].flatMap(m=>m[1].split(/\s+/)));
 return names.filter(name=>!roots[name]||roots[name].some(root=>classes.has(root)));
}
