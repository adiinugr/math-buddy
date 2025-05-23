const id = {
  common: {
    title: "Math Buddy",
    login: "Masuk",
    register: "Daftar",
    logout: "Keluar",
    language: "Bahasa",
    footer: {
      copyright: "© 2023 Math Buddy",
      about: "Tentang",
      contact: "Kontak",
      privacy: "Privasi"
    }
  },
  home: {
    hero: {
      title: "Tingkatkan kemampuan matematikamu dengan Math Buddy",
      description:
        "Alat diagnostik kami mengevaluasi keterampilan matematika Anda dan memberikan rekomendasi yang dipersonalisasi untuk membantu Anda belajar dan berkembang. Mulai dengan beberapa langkah sederhana!",
      cta: "Mulai Diagnostik",
      login: "Masuk",
      register: "Daftar",
      dashboard: "Ke Dashboard"
    },
    howItWorks: {
      title: "Cara Kerjanya",
      steps: [
        {
          title: "Masukkan Nama Anda",
          description:
            "Mulai dengan memberi tahu kami siapa Anda sehingga kami dapat mempersonalisasi pengalaman Anda."
        },
        {
          title: "Ikuti Penilaian",
          description:
            "Jawab 10 soal matematika yang dipilih dengan cermat mencakup berbagai topik."
        },
        {
          title: "Dapatkan Analisis Anda",
          description:
            "Terima rincian detail tentang kekuatan dan area yang perlu ditingkatkan."
        },
        {
          title: "Rencana Personal",
          description:
            "Dapatkan rekomendasi khusus untuk meningkatkan keterampilan matematika Anda."
        }
      ]
    },
    whyChoose: {
      title: "Mengapa Memilih Math Buddy?",
      features: [
        {
          title: "Penilaian Akurat",
          description:
            "Mengidentifikasi dengan tepat kekuatan dan kelemahan matematika Anda."
        },
        {
          title: "Wawasan Personal",
          description:
            "Umpan balik yang disesuaikan berdasarkan performa individu Anda."
        },
        {
          title: "Cepat dan Efisien",
          description: "Selesaikan penilaian hanya dalam 10-15 menit."
        },
        {
          title: "Rekomendasi yang Dapat Ditindaklanjuti",
          description:
            "Langkah selanjutnya yang jelas untuk meningkatkan kemampuan matematika Anda."
        }
      ]
    },
    finalCta: {
      title: "Siap untuk menemukan potensi matematika Anda?",
      description:
        "Bergabunglah dengan ribuan siswa yang telah meningkatkan keterampilan matematika mereka dengan alat penilaian dan pembelajaran yang dipersonalisasi. Mulai perjalanan Anda hari ini!",
      button: "Mulai Penilaian Anda Sekarang",
      dashboard: "Ke Dashboard",
      register: "Daftar Sekarang",
      login: "Masuk"
    }
  },
  start: {
    title: "Mari Mulai",
    welcome:
      "Selamat datang di Math Buddy! Sebelum kami memulai penilaian matematika Anda, harap beri tahu kami nama Anda sehingga kami dapat mempersonalisasi pengalaman Anda.",
    nameLabel: "Nama Anda",
    namePlaceholder: "Masukkan nama lengkap Anda",
    nameError: "Harap masukkan nama Anda",
    continue: "Lanjutkan ke Penilaian",
    whatToExpect: {
      title: "Apa yang dapat diharapkan:",
      items: [
        "Anda akan menjawab 10 pertanyaan matematika yang mencakup berbagai topik.",
        "Penilaian membutuhkan waktu sekitar 10-15 menit untuk diselesaikan.",
        "Setelah selesai, Anda akan menerima analisis dan rekomendasi yang dipersonalisasi."
      ]
    }
  },
  questions: {
    title: "Penilaian Matematika",
    loading: "Memuat...",
    loadingDescription:
      "Harap tunggu sementara kami menyiapkan penilaian Anda.",
    questionCount: "Pertanyaan {current} dari {total}",
    answeringAs: "Menjawab sebagai:"
  },
  results: {
    title: "Hasil Penilaian Anda",
    completedOn: "Diselesaikan pada {date}",
    metrics: {
      overallScore: "Skor Keseluruhan",
      performance: "Performa",
      questionsCompleted: "Pertanyaan Selesai"
    },
    performanceByCategory: "Performa berdasarkan Kategori",
    strengthsAndWeaknesses: {
      title: "Kekuatan & Area untuk Perbaikan Anda",
      strengths: {
        title: "Kekuatan",
        description:
          "Anda menunjukkan pemahaman yang baik tentang konsep {area} dan teknik pemecahan masalah.",
        continueTo:
          "Terus bangun kekuatan ini dengan mengeksplorasi topik {area} yang lebih canggih."
      },
      weaknesses: {
        title: "Area untuk Perbaikan",
        description:
          "Anda mungkin mendapat manfaat dari latihan tambahan dengan masalah dan konsep {area}.",
        focusOn:
          "Fokus pada penguatan pemahaman Anda tentang prinsip-prinsip {area} inti untuk meningkatkan kemampuan matematika Anda secara keseluruhan."
      }
    },
    recommendations: {
      title: "Rekomendasi Personal",
      recommendedResources: "Sumber Daya yang Direkomendasikan:"
    },
    reminder:
      "Ingat, latihan yang konsisten adalah kunci untuk perbaikan dalam matematika. Cobalah untuk menghabiskan 15-20 menit setiap hari pada sumber daya yang direkomendasikan.",
    buttons: {
      retake: "Ambil Penilaian Ulang",
      home: "Kembali ke Beranda"
    },
    performance: {
      advanced: "Mahir",
      proficient: "Cakap",
      basic: "Dasar",
      developing: "Berkembang"
    }
  },
  generate: {
    title: "Buat Soal Matematika",
    settings: "Pengaturan Soal",
    settingsDescription: "Konfigurasi parameter untuk membuat soal matematika",
    category: "Kategori Matematika",
    selectCategory: "Pilih kategori",
    difficulty: "Tingkat Kesulitan",
    selectDifficulty: "Pilih tingkat kesulitan",
    questionCount: "Jumlah Soal",
    selectCount: "Pilih jumlah soal",
    questions: "Soal",
    generate: "Buat Soal",
    generating: "Membuat Soal...",
    generatedQuestions: "Soal yang Dibuat",
    generatedDescription:
      "Berikut adalah soal yang dibuat berdasarkan pengaturan Anda",
    error: {
      selectCategory: "Silakan pilih kategori",
      generateFailed: "Gagal membuat soal. Silakan coba lagi."
    },
    publish: "Terbitkan Kuis",
    publishing: "Menerbitkan...",
    publishFailed: "Gagal menerbitkan kuis. Silakan coba lagi."
  },
  dashboard: {
    title: "Kuis Saya",
    createQuiz: "Buat Kuis Baru",
    generateQuestions: "Buat Soal",
    noQuizzes: "Belum ada kuis",
    noQuizzesDescription: "Mulai dengan membuat kuis baru.",
    quizCode: "Kode Kuis:",
    active: "Aktif",
    inactive: "Tidak Aktif",
    viewResults: "Lihat Hasil",
    edit: "Edit",
    delete: "Hapus",
    cancel: "Batal",
    deleteConfirmTitle: "Hapus Kuis",
    deleteConfirmDescription:
      "Apakah Anda yakin ingin menghapus kuis ini? Tindakan ini tidak dapat dibatalkan."
  },
  edit: {
    title: "Edit Kuis",
    quizDetails: "Detail Kuis",
    quizDescription: "Perbarui informasi dan pertanyaan kuis Anda",
    quizTitle: "Judul Kuis",
    description: "Deskripsi",
    questions: "Pertanyaan",
    question: "Pertanyaan",
    questionText: "Teks Pertanyaan",
    options: "Pilihan",
    addQuestion: "Tambah Pertanyaan",
    remove: "Hapus",
    cancel: "Batal",
    save: "Simpan Perubahan",
    saving: "Menyimpan...",
    error: {
      loadFailed: "Gagal memuat kuis",
      saveFailed: "Gagal menyimpan kuis. Silakan coba lagi."
    }
  }
}

export default id
