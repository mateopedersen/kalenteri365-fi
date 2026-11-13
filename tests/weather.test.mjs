import test from 'node:test';
import assert from 'node:assert/strict';
import {weatherCondition} from '../assets/weather.mjs';
import {weatherAppearance} from '../assets/weather-scene.mjs';
test('Weather distinguishes day, night, rain, snow showers and thunderstorms',()=>{
 assert.equal(weatherCondition(0,true).icon,'sun');
 assert.equal(weatherCondition(0,false).icon,'moon');
 for(const c of [85,86])assert.equal(weatherCondition(c).icon,'snow');
 for(const c of [95,96,97,99])assert.equal(weatherCondition(c).icon,'storm');
 assert.equal(weatherCondition(66).name,'Jäätävää sadetta');
 assert.equal(weatherCondition(61).icon,'rain');
 assert.equal(weatherCondition(999).name,'Säätila ei ole saatavilla');
});

test('the animated scene follows MET precipitation and polar/night symbols',()=>{
 assert.deepEqual(weatherAppearance('heavyrain_day'),{condition:'rain',period:'day',heavy:true});
 assert.equal(weatherAppearance('lightsleet_night').condition,'sleet');
 assert.equal(weatherAppearance('snowshowersandthunder_day').condition,'snow');
 assert.equal(weatherAppearance('lightrainandthunder_day').condition,'storm');
 assert.deepEqual(weatherAppearance('clearsky_polartwilight'),{condition:'sun',period:'twilight',heavy:false});
 assert.equal(weatherAppearance('clearsky_night').period,'night');
 assert.equal(weatherAppearance('partlycloudy_day').condition,'partlycloudy');
 assert.equal(weatherAppearance('fog').condition,'fog');
});
