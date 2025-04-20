const id = {
  common: {
    title: "Math Buddy",
    login: "Masuk",
    register: "Daftar",
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
      cta: "Mulai Diagnostik"
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
      button: "Mulai Penilaian Anda Sekarang"
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
  }
}

export default id
