const urls = [
'https://drive.google.com/file/d/14U2XA1siOVuuXdM5MCbox1pvbOKumHpC/view?usp=sharing', 'https://drive.google.com/file/d/1ApvxKNli7JNxRqUXx_DLns1Mx-SW3G7T/view?usp=sharing', 'https://drive.google.com/file/d/1CdAqG336HdmbIcrHnbbZwgi5E5wqniSG/view?usp=sharing', 'https://drive.google.com/file/d/1M0Gi3RDoOv91eiKmPPFc-V4r2OGxJl-V/view?usp=sharing', 'https://drive.google.com/file/d/1NaUESmfWgW2tr8tsdAZAxS_U_0CcqLtV/view?usp=sharing', 'https://drive.google.com/file/d/1ORdRddb0LlJpx_UXtZiw5WyUw--HPyq0/view?usp=sharing', 'https://drive.google.com/file/d/1QgjmrHJYWEoFCwuE2hCb-AHToNx7Bvui/view?usp=sharing', 'https://drive.google.com/file/d/1UGEbWz-W6NpoGNtZnndpSUF6B71w8ME5/view?usp=sharing', 'https://drive.google.com/file/d/1_Kb2BvdziOXHP0Wa0BP3odpVNp6Bdxs7/view?usp=sharing', 'https://drive.google.com/file/d/1hCI8v1kxVgx_DvkCfu5AbPMmCdDdClA9/view?usp=sharing', 'https://drive.google.com/file/d/1jLSwhl7qnJY9FjbHkJCcehiSxaysidQr/view?usp=sharing', 'https://drive.google.com/file/d/1uAQn2GnwQ-vpFBl3u4ObV1BQ2N0ChQnr/view?usp=sharing', 'https://drive.google.com/file/d/1ufnlHfPhO-5tqMMm8z7aZvzbzdgzaHOS/view?usp=sharing', 'https://drive.google.com/file/d/1xKyKAp0WbGYF2-qvsIoCOg0rzMZ8-eZY/view?usp=sharing'
];
async function run() {
  for (const url of urls) {
    const id = url.split('/d/')[1].split('/')[0];
    try {
      const res = await fetch('https://drive.google.com/uc?id=' + id + '&export=download', {method: 'HEAD'});
      const contentDisposition = res.headers.get('content-disposition');
      let name = id;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match) name = match[1];
        else {
           const match2 = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
           if (match2) name = decodeURIComponent(match2[1]);
        }
      }
      console.log(id + ' -> ' + name);
    } catch(e) {
      console.log(id + ' -> ERROR');
    }
  }
}
run();
