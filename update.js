const fs = require('fs');
let content = fs.readFileSync('src/data/organization.ts', 'utf8');
const replacements = {
  'Dharma Adhyaksa': '14U2XA1siOVuuXdM5MCbox1pvbOKumHpC',
  'Abdul Mumin': '1ApvxKNli7JNxRqUXx_DLns1Mx-SW3G7T',
  'Raykhan Dwi Fardani': '1M0Gi3RDoOv91eiKmPPFc-V4r2OGxJl-V',
  'Muhammad Said Mahfouz': '1NaUESmfWgW2tr8tsdAZAxS_U_0CcqLtV',
  'Maulana Zaidan Nugroho': '1ORdRddb0LlJpx_UXtZiw5WyUw--HPyq0',
  'Abdillah Muhsin Al Ansori': '1UGEbWz-W6NpoGNtZnndpSUF6B71w8ME5',
  'Simbian Mahesa Naszhwi': '1_Kb2BvdziOXHP0Wa0BP3odpVNp6Bdxs7',
  'Muhammad Tegar Bimantoro': '1hCI8v1kxVgx_DvkCfu5AbPMmCdDdClA9',
  'Faqihuddin Rahman': '1jLSwhl7qnJY9FjbHkJCcehiSxaysidQr',
  'Fajar Maulana Aris': '1uAQn2GnwQ-vpFBl3u4ObV1BQ2N0ChQnr',
  'Nawaf Hafid Kautsar': '1ufnlHfPhO-5tqMMm8z7aZvzbzdgzaHOS',
  'Khadafi Agista Musyafa': '1xKyKAp0WbGYF2-qvsIoCOg0rzMZ8-eZY'
};
for (const [name, id] of Object.entries(replacements)) {
  const regex = new RegExp('({ name: "' + name + '"[^}]+image: ")([^"]+)(")', 'g');
  content = content.replace(regex, '$1https://drive.google.com/uc?export=view&id=' + id + '$3');
}
fs.writeFileSync('src/data/organization.ts', content, 'utf8');
console.log('Done!');
