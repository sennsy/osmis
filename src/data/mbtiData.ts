export interface MBTIProfile {
  name: string;
  title: string;
  group: string;
  color: string;
  desc: string;
  strengths: string[];
  weaknesses: string[];
  careers: string[];
  relationship: string;
  famous: string[];
}

export const MBTI_DATABASE: Record<string, MBTIProfile> = {
  "INTJ": {
      name: "INTJ",
      title: "Arsitek (Architect)",
      group: "Analis",
      color: "purple",
      desc: "Pemikir strategis dengan imajinasi kuat dan rencana matang untuk segala hal. Sangat independen dan selalu berfokus pada efisiensi serta peningkatan sistem.",
      strengths: ["Pemikiran Strategis", "Independen & Mandiri", "Sangat Analitis", "Tekun & Berkomitmen"],
      weaknesses: ["Cenderung Terlalu Kritis", "Skeptis berlebihan", "Kurang Peka secara Emosional"],
      careers: ["Data Scientist", "Arsitek Sistem", "Konsultan Strategi", "Peneliti", "Insinyur Software"],
      relationship: "Sangat menghargai kejujuran intelektual, ruang pribadi, dan pertumbuhan bersama yang rasional.",
      famous: ["Elon Musk", "Nikola Tesla", "Friedrich Nietzsche", "Walter White"]
  },
  "INTP": {
      name: "INTP",
      title: "Logikawan (Logician)",
      group: "Analis",
      color: "purple",
      desc: "Penemu yang kreatif dan penasaran dengan haus akan pengetahuan yang tak pernah padam. Menyukai teori, logika, dan penyelesaian masalah kompleks.",
      strengths: ["Kreatif & Inovatif", "Pikiran Terbuka", "Obyektif & Analitis", "Sangat Antusias"],
      weaknesses: ["Sering Pelupa / Melamun", "Meragukan Diri Sendiri", "Kurang Suka Aturan Kaku"],
      careers: ["Pengembang AI", "Matematikawan", "Filsuf", "Analis Keuangan", "Penulis Ilmiah"],
      relationship: "Menyukai pasangan yang memicu diskusi mendalam dan menghargai kebebasan berpikirnya.",
      famous: ["Albert Einstein", "Bill Gates", "Isaac Newton", "Neo (The Matrix)"]
  },
  "ENTJ": {
      name: "ENTJ",
      title: "Komandan (Commander)",
      group: "Analis",
      color: "purple",
      desc: "Pemimpin yang berani, imajinatif, dan berkemauan keras, selalu menemukan cara atau menciptakan jalan menuju efisiensi maksimal.",
      strengths: ["Kepemimpinan Alami", "Percaya Diri Tinggi", "Efisien & Karismatik", "Keputusan Cepat"],
      weaknesses: ["Dominan / Dominatif", "Kurang Sabar", "Bisa Terlihat Dingin"],
      careers: ["CEO / Direktur", "Pengacara", "Konsultan Manajemen", "Entrepreneur", "Manajer Proyek"],
      relationship: "Menyukai pasangan yang berambisi tinggi, mandiri, dan berani menantang ide-idenya.",
      famous: ["Steve Jobs", "Margaret Thatcher", "Franklin D. Roosevelt", "Gordon Ramsay"]
  },
  "ENTP": {
      name: "ENTP",
      title: "Debat (Debater)",
      group: "Analis",
      color: "purple",
      desc: "Pemikir yang cerdas dan ingin tahu yang tidak bisa menolak tantangan intelektual. Menyukai eksplorasi ide baru dari berbagai sudut pandang.",
      strengths: ["Cepat Berpikir", "Orisinal & Kreatif", "Komunikator Cerdas", "Penuh Energi"],
      weaknesses: ["Mudah Bosan pada Detail", "Suka Berdebat", "Kurang Konsisten di Pelaksanaan"],
      careers: ["Pengusaha", "Pemasar Kreatif", "Pengacara", "Politisi", "Produser Media"],
      relationship: "Mencari pasangan yang fleksibel, humoris, dan berani diajak bertukar pikiran tanpa henti.",
      famous: ["Thomas Edison", "Mark Twain", "Cezanne", "Joker (Batman)"]
  },
  "INFJ": {
      name: "INFJ",
      title: "Advokat (Advocate)",
      group: "Diplomat",
      color: "emerald",
      desc: "Pendiam dan mistis, namun sangat menginspirasi dan idealis yang tak pernah lelah membantu kedamaian masyarakat.",
      strengths: ["Wawasan Empati Tinggi", "Idealis & Prinsipil", "Kreatif & Berdedikasi", "Sangat Peduli"],
      weaknesses: ["Rentan Burnout", "Terlalu Sensitif terhadap Kritik", "Perfeksionis Khusus"],
      careers: ["Psikolog / Konselor", "Penulis", "Pekerja Sosial", "Desain UX", "Pengajar"],
      relationship: "Mencari ikatan jiwa yang dalam, autentik, penuh arti, dan saling mendukung moral.",
      famous: ["Martin Luther King Jr.", "Nelson Mandela", "Mother Teresa", "Aragorn"]
  },
  "INFP": {
      name: "INFP",
      title: "Mediator (Mediator)",
      group: "Diplomat",
      color: "emerald",
      desc: "Penyair yang puitis, baik hati, dan altruistik, selalu bersemangat untuk membantu tindakan kebaikan dan mengekspresikan nilai diri.",
      strengths: ["Penuh Empati & Hangat", "Kreatif & Fleksibel", "Sangat Autentik", "Pikiran Terbuka"],
      weaknesses: ["Cenderung Terlalu Idealistis", "Sering Menyalahkan Diri", "Sulit Terima Kritik"],
      careers: ["Penulis / Novelis", "Desainer Grafis", "Konselor", "Sastrawan", "Arsitek Lanskap"],
      relationship: "Menginginkan hubungan romantis yang harmonis, pengertian, dan bebas dari kepalsuan.",
      famous: ["Shakespeare", "J.R.R. Tolkien", "Keanu Reeves", "Frodo Baggins"]
  },
  "ENFJ": {
      name: "ENFJ",
      title: "Protagonis (Protagonist)",
      group: "Diplomat",
      color: "emerald",
      desc: "Pemimpin yang karismatik dan menginspirasi, mampu memukau pendengarnya dan membimbing masyarakat menuju tujuan mulia.",
      strengths: ["Karismatik & Persuasif", "Sangat Empatis", "Pemimpin Inspiratif", "Handal Berorganisasi"],
      weaknesses: ["Terlalu Altruistis", "Sering Mengabaikan Kebutuhan Diri", "Fluktuasi Harga Diri"],
      careers: ["Motivator", "Pelatih / Coach", "HRD Manager", "Humas / PR", "Pengajar"],
      relationship: "Sangat suportif, perhatian, dan mendedikasikan energi untuk kebahagiaan pasangan.",
      famous: ["Barack Obama", "Oprah Winfrey", "Malala Yousafzai", "Dumbledore"]
  },
  "ENFP": {
      name: "ENFP",
      title: "Pejuang (Campaigner)",
      group: "Diplomat",
      color: "emerald",
      desc: "Jiwa bebas yang antusias, kreatif, dan ramah, yang selalu dapat menemukan alasan untuk tersenyum dan menginspirasi lingkungan.",
      strengths: ["Antusiasme Tinggi", "Sangat Kreatif", "Komunikatif & Hangat", "Mudah Beradaptasi"],
      weaknesses: ["Fokus Mudah Terpecah", "Terlalu Banyak Berpikir", "Suka Menunda Tugas Rutin"],
      careers: ["Content Creator", "Wartawan", "Event Organizer", "Kreatif Director", "Psikolog"],
      relationship: "Menyukai kejutan, petualangan bersama, dan hubungan yang suportif serta ekspresif.",
      famous: ["Robin Williams", "Mark Twain", "Robert Downey Jr.", "Spider-Man"]
  },
  "ISTJ": {
      name: "ISTJ",
      title: "Logistik (Logistician)",
      group: "Pengawal",
      color: "blue",
      desc: "Individu yang praktis dan mengutamakan fakta, yang keandalan dan integritasnya tidak dapat diragukan lagi.",
      strengths: ["Jujur & Langsung", "Tanggung Jawab Tinggi", "Sangat Rapi & Teratur", "Tenang & Setia"],
      weaknesses: ["Kaku terhadap Aturan", "Kurang Suka Perubahan Mendadak", "Cenderung Penghakim"],
      careers: ["Akuntan", "Auditor", "Manajer Operasional", "Polisi / Militer", "Administrator"],
      relationship: "Setia, stabil, dan menunjukkan rasa sayang lewat tindakan nyata serta komitmen.",
      famous: ["George Washington", "Warren Buffett", "Angela Merkel", "Hermione Granger"]
  },
  "ISFJ": {
      name: "ISFJ",
      title: "Pelindung (Defender)",
      group: "Pengawal",
      color: "blue",
      desc: "Pelindung yang sangat hangat dan berdedikasi, selalu siap membela dan merawat orang-orang yang dicintainya.",
      strengths: ["Sangat Suportif", "Andal & Teliti", "Setia & Sabar", "Keterampilan Praktis"],
      weaknesses: ["Terlalu Altruistis", "Menekan Perasaan Sendiri", "Takut Pada Perubahan"],
      careers: ["Perawat / Dokter", "Guru Sekolah", "Pekerja Sosial", "Manajer Administrasi", "Customer Service"],
      relationship: "Sangat perhatian, mengingat detail kecil kesukaan pasangan, dan setia seumur hidup.",
      famous: ["Beyoncé", "Captain America (Steve Rogers)", "Samwise Gamgee", "Kate Middleton"]
  },
  "ESTJ": {
      name: "ESTJ",
      title: "Eksekutif (Executive)",
      group: "Pengawal",
      color: "blue",
      desc: "Administrator yang luar biasa, tidak ada tandingannya dalam mengelola hal-hal atau orang-orang sesuai keteraturan.",
      strengths: ["Berdedikasi Tinggi", "Keinginan Kuat", "Sangat Organisasi", "Jujur & Langsung"],
      weaknesses: ["Sulit Fleksibel", "Suka Mengatur / Bossy", "Terlalu Fokus Status"],
      careers: ["Manajer Proyek", "Direktur Operasional", "Hakim / Pengacara", "Eksekutif Perusahaan"],
      relationship: "Menghargai tradisi, kepastian, dan kerja sama rumah tangga yang terstruktur rapi.",
      famous: ["Judge Judy", "Henry Ford", "Frank Sinatra", "Dwight Schrute"]
  },
  "ESFJ": {
      name: "ESFJ",
      title: "Konsul (Consul)",
      group: "Pengawal",
      color: "blue",
      desc: "Orang yang sangat peduli, populer secara sosial, dan selalu siap membantu menciptakan keharmonisan di sekitarnya.",
      strengths: ["Setia & Bekerja Sama", "Sensitif terhadap Orang Lain", "Pintar Bergaul", "Praktis"],
      weaknesses: ["Haus Pengakuan Sosial", "Rentan terhadap Kritik", "Terlalu Kaku pada Etika"],
      careers: ["Manajer Acara", "Manajer HRD", "Guru", "Public Relations", "Konselor Sekolah"],
      relationship: "Sangat memperhatikan kebahagiaan pasangan dan keluarga serta menyukai stabilitas.",
      famous: ["Taylor Swift", "Jennifer Garner", "Bill Clinton", "SpongeBob SquarePants"]
  },
  "ISTP": {
      name: "ISTP",
      title: "Pengrajin (Virtuoso)",
      group: "Pengawal",
      color: "amber",
      desc: "Eksplorer yang berani dan praktis, menguasai berbagai jenis alat dan penyelesaian masalah teknis secara langsung.",
      strengths: ["Optimis & Energetik", "Kreatif-Praktis", "Spontan & Riset Langsung", "Tenang saat Krisis"],
      weaknesses: ["Mudah Bosan", "Suka Mengambil Risiko Berbahaya", "Pendiam & Tertutup"],
      careers: ["Mekanik / Insinyur Teknik", "Pilot", "Atlit Profesional", "Analis Forensik", "Koki"],
      relationship: "Menghargai kebebasan pribadi dan lebih suka bertindak daripada obrolan emosional berlebihan.",
      famous: ["Tom Cruise", "Clint Eastwood", "Michael Jordan", "Indiana Jones"]
  },
  "ISFP": {
      name: "ISFP",
      title: "Seniman (Adventurer)",
      group: "Penjelajah",
      color: "amber",
      desc: "Seniman yang fleksibel dan memikat, selalu siap untuk menjelajahi dan mengalami hal baru dengan gaya estetis unik.",
      strengths: ["Sangat Memikat & Ramah", "Imajinatif & Estetis", "Pikiran Terbuka", "Gaya Asli"],
      weaknesses: ["Sangat Independen", "Mudah Stres saat Tertekan", "Kurang Suka Perencanaan Jangka Panjang"],
      careers: ["Desainer Mode", "Fotografer", "Musisi", "Florist / Desainer Interior", "Pelukis"],
      relationship: "Hangat, penyayang, dan suka memberikan kejutan manja yang bermakna bagi pasangan.",
      famous: ["Michael Jackson", "Frida Kahlo", "Britney Spears", "Loki"]
  },
  "ESTP": {
      name: "ESTP",
      title: "Pengusaha (Entrepreneur)",
      group: "Penjelajah",
      color: "amber",
      desc: "Cerdas, energik, dan sangat perseptif, yang benar-benar menikmati hidup di batas kemampuan dan penuh aksi.",
      strengths: ["Berani & Mengambil Risiko", "Praktis & Persepsional", "Sangat Sosialis", "Respons Cepat"],
      weaknesses: ["Tidak Sabar", "Cenderung Impulsif", "Kurang Memperhatikan Gambaran Besar"],
      careers: ["Pemasar Properti", "Pialang Saham", "Detektif", "Atlet", "Start-up Founder"],
      relationship: "Sangat seru, dinamis, dan mengajak pasangan menikmati momen saat ini tanpa ribet.",
      famous: ["Ernest Hemingway", "Madonna", "Jack Nicholson", "Thor"]
  },
  "ESFP": {
      name: "ESFP",
      title: "Penghibur (Entertainer)",
      group: "Penjelajah",
      color: "amber",
      desc: "Spontan, energik, dan antusias—hidup tidak pernah membosankan di sekitar mereka yang suka menghidupkan suasana.",
      strengths: ["Berani & Original", "Estetika & Gaya Kuat", "Pintar Menghibur", "Sangat Ramah"],
      weaknesses: ["Mudah Terdistraksi", "Menghindari Konflik", "Kurang Perencanaan Masa Depan"],
      careers: ["Aktor / Aktris", "Desainer Acara", "Pemandu Wisata", "Musisi / DJ", "Kreator Konten"],
      relationship: "Penuh energi positif, romantis dengan cara spontan, dan membuat hubungan selalu segar.",
      famous: ["Elton John", "Marilyn Monroe", "Adele", "Peter Pan"]
  }
};

export interface Question {
  id: number;
  type: "EI" | "SN" | "TF" | "JP";
  text: string;
  direction: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
}

export const QUESTIONS: Question[] = [
  // E vs I
  { id: 1, type: "EI", text: "Anda merasa lebih berenergi setelah menghabiskan waktu berkumpul bersama sekelompok besar orang.", direction: "E" },
  { id: 2, type: "EI", text: "Anda lebih suka memproses ide secara pribadi terlebih dahulu sebelum membicarakannya dengan orang lain.", direction: "I" },
  { id: 3, type: "EI", text: "Dalam acara sosial, Anda biasanya yang pertama kali memulai percakapan dengan orang baru.", direction: "E" },
  { id: 4, type: "EI", text: "Anda membutuhkan waktu menyendiri (me-time) untuk mengisi ulang energi setelah seharian beraktivitas.", direction: "I" },
  { id: 5, type: "EI", text: "Anda menikmati menjadi pusat perhatian dalam suatu diskusi atau presentasi.", direction: "E" },

  // S vs N
  { id: 6, type: "SN", text: "Anda lebih fokus pada fakta praktis dan kenyataan langsung daripada teori-teori abstrak.", direction: "S" },
  { id: 7, type: "SN", text: "Anda sering membayangkan kemungkinan masa depan dan suka mencari makna tersembunyi di balik hal-hal.", direction: "N" },
  { id: 8, type: "SN", text: "Anda lebih nyaman mengikuti petunjuk atau metode langkah-demi-langkah yang terbukti.", direction: "S" },
  { id: 9, type: "SN", text: "Anda sering mengandalkan firasat atau intuisi saat membuat keputusan penting.", direction: "N" },
  { id: 10, type: "SN", text: "Anda menghargai sesuatu yang nyata dan dapat diterapkan langsung daripada sekadar gagasan ide.", direction: "S" },

  // T vs F
  { id: 11, type: "TF", text: "Dalam mengambil keputusan, logika objektif lebih penting bagi Anda daripada pertimbangan perasaan orang.", direction: "T" },
  { id: 12, type: "TF", text: "Menjaga keharmonisan dan empati dalam tim adalah prioritas utama Anda melebihi sekadar efisiensi.", direction: "F" },
  { id: 13, type: "TF", text: "Anda tidak keberatan memberikan kritik yang jujur dan tegas demi hasil perbaikan yang lebih baik.", direction: "T" },
  { id: 14, type: "TF", text: "Anda sangat peka terhadap perubahan suasana hati dan perasaan orang-orang di sekitar Anda.", direction: "F" },
  { id: 15, type: "TF", text: "Keputusan terbaik adalah keputusan yang berpatokan pada fakta rasional, bukan emosi.", direction: "T" },

  // J vs P
  { id: 16, type: "JP", text: "Anda merasa lebih nyaman ketika semua jadwal dan rencana kegiatan Anda sudah terstruktur rapi.", direction: "J" },
  { id: 17, type: "JP", text: "Anda menyukai fleksibilitas, spontanitas, dan membiarkan pilihan tetap terbuka hingga saat-saat terakhir.", direction: "P" },
  { id: 18, type: "JP", text: "Anda biasanya menyelesaikan tugas atau pekerjaan jauh sebelum batas waktu (deadline) berakhir.", direction: "J" },
  { id: 19, type: "JP", text: "Anda bekerja lebih kreatif dan bersemangat ketika berada di bawah tekanan waktu yang mendesak.", direction: "P" },
  { id: 20, type: "JP", text: "Perubahan rencana awal yang mendadak sering kali membuat Anda merasa sedikit terganggu.", direction: "J" }
];
