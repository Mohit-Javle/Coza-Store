export const users = [
  {
    id: "u1",
    username: "deadstock.dev",
    name: "Dev Patel",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
    bio: "collecting dust, selling fits 🧥 | mumbai based | mostly oversized flannels & streetwear drops.",
    location: "Mumbai",
    listedItems: ["p1", "p3", "p11"],
    soldItems: ["p7", "p12"],
    purchasedItems: ["p2", "p15"]
  },
  {
    id: "u2",
    username: "vintagestreet_in",
    name: "Arjun Sen",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
    bio: "Curating rare retro street gems. All items verified. Ships PAN India 🚀",
    location: "Kolkata",
    listedItems: ["p2", "p6", "p13"],
    soldItems: ["p8"],
    purchasedItems: ["p1", "p4"]
  },
  {
    id: "u3",
    username: "bombay.boiler",
    name: "Kabir Roy",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format&fit=crop",
    bio: "Bombay's subculture archive. Custom pieces, worn-in denim, and rare graphics. ✨",
    location: "Mumbai",
    listedItems: ["p4", "p9"],
    soldItems: ["p14"],
    purchasedItems: ["p3", "p5"]
  },
  {
    id: "u4",
    username: "thrift.mafia",
    name: "Zoya Khan",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
    bio: "Your neighborhood thrift supplier. Pre-loved designer & Y2K aesthetics only.",
    location: "Delhi",
    listedItems: ["p5", "p8", "p10"],
    soldItems: [],
    purchasedItems: ["p6", "p9"]
  },
  {
    id: "u5",
    username: "cyber.gully",
    name: "Rohan Deshmukh",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
    bio: "Techwear, cyber goth, and heavy hardware. Moving things out of my closet.",
    location: "Bengaluru",
    listedItems: ["p7", "p14"],
    soldItems: ["p1", "p2"],
    purchasedItems: ["p8", "p10"]
  },
  {
    id: "u6",
    username: "kicks.kabir",
    name: "Kabir Malhotra",
    avatar: "https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?q=80&w=300&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    bio: "Sneakerhead selling parts of my personal collection. 100% legit.",
    location: "Chandigarh",
    listedItems: ["p12", "p15"],
    soldItems: ["p3"],
    purchasedItems: ["p7"]
  },
  {
    id: "u7",
    username: "delhi_dugout",
    name: "Nikhil Joshi",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=300&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop",
    bio: "Varsity jackets, vintage windbreakers, and archival pieces. DM for bundle deals.",
    location: "Delhi",
    listedItems: [],
    soldItems: ["p11", "p13"],
    purchasedItems: ["p14", "p12"]
  },
  {
    id: "u8",
    username: "lisa.thrifted",
    name: "Lisa D'Souza",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    bio: "Y2K accessories, baguettes, crop tops and hand-knit cardigans.",
    location: "Goa",
    listedItems: [],
    soldItems: [],
    purchasedItems: ["p11", "p13"]
  }
];

export const getSeller = (sellerId) => {
  return users.find(u => u.id === sellerId) || users[0];
};
