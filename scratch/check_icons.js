import * as hi2 from 'react-icons/hi2';
const keys = Object.keys(hi2);
console.log('Video/Film/TV keys in hi2:');
console.log(keys.filter(k => /tv|film|video|computer|play|device|screen|monitor/i.test(k)));
