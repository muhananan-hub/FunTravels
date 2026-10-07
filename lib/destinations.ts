export type Destination = {
  id: string;
  name: string;
  category: string;
  location: string;
  price: number;
  description: string;
  longDescription: string;
  image: string;
  highlights: string[];
};

export const destinations: Destination[] = [
  {
    id: "tanjung-aan",
    name: "Pantai Tanjung Aan",
    category: "Pantai",
    location: "Lombok Tengah",
    price: 150000,
    description:
      "Pantai dengan pasir putih dan air laut jernih di kawasan Mandalika.",
    longDescription:
      "Tanjung Aan merupakan salah satu kawasan pantai yang terkenal di Lombok Tengah. Pantai ini memiliki garis pantai yang luas dengan panorama laut yang menarik untuk dinikmati.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Tanjung%20Aan%20Beach.jpg",
    highlights: [
      "Pantai pasir putih",
      "Pemandangan laut",
      "Kawasan Mandalika",
      "Cocok untuk bersantai",
    ],
  },

  {
    id: "pantai-pink",
    name: "Pantai Pink",
    category: "Pantai",
    location: "Lombok Timur",
    price: 200000,
    description:
      "Pantai dengan pasir bernuansa merah muda dan pemandangan laut.",
    longDescription:
      "Pantai Pink merupakan salah satu destinasi pantai yang terkenal di Lombok Timur. Warna pasirnya dapat terlihat memiliki nuansa merah muda terutama pada kondisi pencahayaan tertentu.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Pink%20Beach%20Lombok.jpg",
    highlights: [
      "Pasir bernuansa pink",
      "Pemandangan laut",
      "Lombok Timur",
      "Spot foto",
    ],
  },

  {
    id: "kuta-mandalika",
    name: "Kuta Mandalika",
    category: "Pantai",
    location: "Lombok Tengah",
    price: 150000,
    description:
      "Destinasi populer di kawasan Mandalika dengan panorama pantai.",
    longDescription:
      "Kawasan Kuta Mandalika menjadi salah satu kawasan wisata utama di Lombok Tengah dengan berbagai pilihan pantai dan aktivitas wisata.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Kuta%20Beach%20Lombok.jpg",
    highlights: [
      "Kawasan Mandalika",
      "Pantai",
      "Kuliner",
      "Pusat aktivitas wisata",
    ],
  },

  {
    id: "gili-trawangan",
    name: "Gili Trawangan",
    category: "Gili",
    location: "Lombok Utara",
    price: 250000,
    description:
      "Pulau wisata populer dengan laut jernih dan berbagai aktivitas.",
    longDescription:
      "Gili Trawangan merupakan salah satu dari tiga Gili yang populer di Lombok. Kawasan ini dikenal dengan aktivitas wisata bahari dan suasana pulau.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Gili%20Trawangan.jpg",
    highlights: [
      "Snorkeling",
      "Pantai",
      "Sunset",
      "Aktivitas bahari",
    ],
  },

  {
    id: "gili-air",
    name: "Gili Air",
    category: "Gili",
    location: "Lombok Utara",
    price: 250000,
    description:
      "Pulau kecil dengan suasana santai, pantai indah, dan snorkeling.",
    longDescription:
      "Gili Air menawarkan suasana pulau yang lebih santai dengan pantai dan aktivitas wisata bahari.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Gili%20Air.jpg",
    highlights: [
      "Snorkeling",
      "Pantai",
      "Suasana santai",
      "Wisata bahari",
    ],
  },

  {
    id: "gili-meno",
    name: "Gili Meno",
    category: "Gili",
    location: "Lombok Utara",
    price: 250000,
    description:
      "Destinasi tenang untuk menikmati pantai dan kehidupan bawah air.",
    longDescription:
      "Gili Meno dikenal sebagai salah satu pulau kecil di sekitar Lombok yang menawarkan suasana lebih tenang.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Gili%20Meno.jpg",
    highlights: [
      "Pantai",
      "Snorkeling",
      "Suasana tenang",
      "Wisata bahari",
    ],
  },

  {
    id: "sembalun",
    name: "Sembalun",
    category: "Gunung",
    location: "Lombok Timur",
    price: 200000,
    description:
      "Kawasan pegunungan dengan perbukitan dan pemandangan alam Lombok.",
    longDescription:
      "Sembalun merupakan kawasan dataran tinggi di Lombok Timur yang terkenal dengan lanskap perbukitan dan pemandangan alam.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Sembalun.jpg",
    highlights: [
      "Pegunungan",
      "Perbukitan",
      "Pemandangan alam",
      "Udara sejuk",
    ],
  },

  {
    id: "tetebatu",
    name: "Tetebatu",
    category: "Alam",
    location: "Lombok Timur",
    price: 180000,
    description:
      "Desa wisata dengan persawahan, perkebunan, dan suasana pedesaan.",
    longDescription:
      "Tetebatu menawarkan suasana pedesaan Lombok dengan persawahan, perkebunan, dan panorama alam.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Tetebatu.jpg",
    highlights: [
      "Persawahan",
      "Perkebunan",
      "Desa wisata",
      "Panorama alam",
    ],
  },

  {
    id: "sendang-gile",
    name: "Air Terjun Sendang Gile",
    category: "Air Terjun",
    location: "Lombok Utara",
    price: 150000,
    description:
      "Air terjun di kawasan Senaru dengan suasana hutan tropis.",
    longDescription:
      "Air Terjun Sendang Gile berada di kawasan Senaru dan menjadi salah satu tujuan wisata alam di Lombok Utara.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Sendang%20Gile.jpg",
    highlights: [
      "Air terjun",
      "Hutan tropis",
      "Senaru",
      "Wisata alam",
    ],
  },

  {
    id: "benang-kelambu",
    name: "Air Terjun Benang Kelambu",
    category: "Air Terjun",
    location: "Lombok Tengah",
    price: 150000,
    description:
      "Air terjun bertingkat dengan aliran air seperti tirai.",
    longDescription:
      "Benang Kelambu merupakan salah satu air terjun yang berada di kawasan Lombok dengan suasana alam yang hijau.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Benang%20Kelambu.jpg",
    highlights: [
      "Air terjun",
      "Hutan",
      "Wisata alam",
      "Spot foto",
    ],
  },

  {
    id: "sade",
    name: "Desa Sade",
    category: "Budaya",
    location: "Lombok Tengah",
    price: 120000,
    description:
      "Desa tradisional Sasak yang memperkenalkan budaya masyarakat lokal.",
    longDescription:
      "Desa Sade merupakan salah satu destinasi budaya yang memperkenalkan tradisi dan kehidupan masyarakat Sasak.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Sade%20Village.jpg",
    highlights: [
      "Budaya Sasak",
      "Rumah tradisional",
      "Kerajinan",
      "Wisata budaya",
    ],
  },

  {
    id: "banyumulek",
    name: "Banyumulek",
    category: "Budaya",
    location: "Lombok Barat",
    price: 120000,
    description:
      "Sentra kerajinan gerabah tradisional Lombok.",
    longDescription:
      "Banyumulek dikenal sebagai salah satu kawasan sentra kerajinan gerabah di Lombok.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Banyumulek%20pottery.jpg",
    highlights: [
      "Gerabah",
      "Kerajinan lokal",
      "Budaya",
      "Belanja oleh-oleh",
    ],
  },

  {
    id: "ayam-taliwang",
    name: "Kuliner Ayam Taliwang",
    category: "Kuliner",
    location: "Mataram",
    price: 100000,
    description:
      "Menikmati salah satu kuliner khas Lombok yang terkenal.",
    longDescription:
      "Ayam Taliwang merupakan salah satu hidangan khas Lombok yang banyak ditemukan di kawasan Mataram dan daerah lainnya di Lombok.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ayam%20Taliwang.jpg",
    highlights: [
      "Kuliner khas Lombok",
      "Makanan lokal",
      "Wisata kuliner",
      "Mataram",
    ],
  },

  {
    id: "selong-belanak",
    name: "Pantai Selong Belanak",
    category: "Pantai",
    location: "Lombok Tengah",
    price: 150000,
    description:
      "Pantai dengan garis pasir luas dan lokasi populer untuk berselancar.",
    longDescription:
      "Selong Belanak merupakan salah satu pantai yang populer di Lombok Tengah dengan garis pantai yang luas.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Selong%20Belanak.jpg",
    highlights: [
      "Pantai",
      "Surfing",
      "Pasir putih",
      "Sunset",
    ],
  },

  {
    id: "senggigi",
    name: "Pantai Senggigi",
    category: "Pantai",
    location: "Lombok Barat",
    price: 150000,
    description:
      "Salah satu kawasan wisata pantai terkenal di Lombok Barat.",
    longDescription:
      "Senggigi merupakan kawasan wisata pantai di Lombok Barat yang memiliki berbagai fasilitas wisata.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Senggigi%20Beach.jpg",
    highlights: [
      "Pantai",
      "Sunset",
      "Hotel",
      "Kuliner",
    ],
  },

  {
    id: "bukit-merese",
    name: "Bukit Merese",
    category: "Alam",
    location: "Lombok Tengah",
    price: 120000,
    description:
      "Bukit dengan panorama laut dan kawasan Mandalika.",
    longDescription:
      "Bukit Merese berada di kawasan Mandalika dan menawarkan pemandangan perbukitan serta garis pantai dari ketinggian.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Merese%20Hill.jpg",
    highlights: [
      "Bukit",
      "Pemandangan laut",
      "Sunset",
      "Mandalika",
    ],
  },
];

export function getDestinationById(id: string) {
  return destinations.find((destination) => destination.id === id);
}