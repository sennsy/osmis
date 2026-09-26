const fs = require('fs');
let c = fs.readFileSync('src/data/translations.ts', 'utf8');
c = c.replace(/openFeature: "(.*?)",\r?\n  }\r?\n};/g, 'openFeature: "$1",\n    recapTitle: "OSMIS Rekap",\n    recapDesc: "استرجاع لأفضل اللحظات والأنشطة الطلابية الأكثر تميزًا في المعهد.",\n    watchRecap: "شاهد الملخص",\n  }\n};');
fs.writeFileSync('src/data/translations.ts', c);
