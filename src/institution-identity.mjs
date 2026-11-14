import logos from '../data/institution-logos.json' with {type:'json'};
import {educationLogo} from '../assets/education-levels-core.mjs';
export const INSTITUTION_LOGOS=logos;
export const institutionIdentity=name=>logos.find(l=>l.name===name)||null;
export const institutionLogo=name=>educationLogo({institution:name,identity:institutionIdentity(name)});
export function institutionCredits(){return `<section class="institution-credits"><h2>Oppilaitosten tunnukset</h2><p>Logot yksilöivät aikataulun julkaisseen oppilaitoksen tai koulutuksen järjestäjän. Helsingin kaupungin tunnus tarkoittaa kaupungin lukioita yhteisesti. Tunnukset kuuluvat haltijoilleen; niitä ei tarjota ladattavaksi eikä käyttö tarkoita yhteistyötä oppilaitosten kanssa.</p><ul>${logos.map(l=>`<li><a href="${l.source}">${l.name}</a></li>`).join('')}</ul></section>`;}
