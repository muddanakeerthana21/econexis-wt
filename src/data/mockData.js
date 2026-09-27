// =======================================================
// EcoNexis - Mock Data Store
// =======================================================

export const demoUsers = {
  user: {
    id: "usr-101",
    name: "Aarav Sharma",
    email: "user@econexis.com",
    role: "user",
    phone: "+91 98765 43210",
    ecoPoints: 1250,
    recycledKg: 24.5,
    co2SavedKg: 18.2,
    greenLevel: "Eco Hero",
    joinedDate: "January 2026",
    college: "National Institute of Technology",
    address: "Room 304, Block B, Campus Hostel"
  },
  admin: {
    id: "adm-001",
    name: "Dr. Sunita Rao",
    email: "admin@econexis.com",
    role: "admin",
    phone: "+91 98450 11223",
    ecoPoints: 9800,
    department: "Sustainability & Operations Admin"
  },
  delivery: {
    id: "del-502",
    name: "Vikram Singh",
    email: "delivery@econexis.com",
    role: "delivery",
    phone: "+91 91234 56789",
    vehicleNumber: "EV-VAN-4022",
    assignedArea: "North City Campus Hub"
  }
};

export const rewardsList = [
  {
    id: "rew-1",
    title: "Eco Badge (Verified Recycler)",
    points: 200,
    category: "Digital",
    icon: "Award",
    description: "Display an exclusive eco-warrior badge on your student profile and resume.",
    claimed: true
  },
  {
    id: "rew-2",
    title: "Plant a Tree in Your Name",
    points: 500,
    category: "Impact",
    icon: "TreePine",
    description: "We partner with local forestry to plant a geo-tagged sapling in your honour.",
    claimed: false
  },
  {
    id: "rew-3",
    title: "EcoNexis Reusable Bottle",
    points: 750,
    category: "Merchandise",
    icon: "CupSoda",
    description: "Insulated stainless steel thermal water bottle made from recycled metals.",
    claimed: false
  },
  {
    id: "rew-4",
    title: "Campus Cafeteria Eco Voucher (₹250)",
    points: 1000,
    category: "Voucher",
    icon: "Gift",
    description: "Redeemable for delicious meals & green beverages at campus eateries.",
    claimed: false
  },
  {
    id: "rew-5",
    title: "Green Champion Trophy & Certificate",
    points: 1500,
    category: "Honor",
    icon: "Medal",
    description: "Physical award presented during the annual University Sustainability Gala.",
    claimed: false
  },
  {
    id: "rew-6",
    title: "Solar-Powered Pocket Power Bank",
    points: 2000,
    category: "Gadgets",
    icon: "Sun",
    description: "High-efficiency 10,000mAh solar charging pack for your smartphones & gadgets.",
    claimed: false
  }
];

export const collectionCenters = [
  {
    id: "ctr-1",
    name: "EcoNexis Green Hub - City Central",
    location: "Metro Station Gate 2, Central Avenue, Tech Zone",
    distance: "1.2 km away",
    hours: "Mon - Sat: 9:00 AM - 7:00 PM",
    accepted: ["Smartphones", "Laptops", "Batteries", "Accessories"],
    phone: "+91 80 2345 6789",
    rating: 4.9,
    mapUrl: "https://maps.google.com"
  },
  {
    id: "ctr-2",
    name: "GreenTech Recycling Center",
    location: "Building 4, University Main Road, Science Block",
    distance: "2.8 km away",
    hours: "All Days: 8:00 AM - 8:00 PM",
    accepted: ["All Electronics", "Home Appliances", "Monitors"],
    phone: "+91 80 9876 5432",
    rating: 4.8,
    mapUrl: "https://maps.google.com"
  },
  {
    id: "ctr-3",
    name: "SmartRecycle Center - College Area",
    location: "Opposite Student Activity Center, Campus North Gate",
    distance: "0.5 km away",
    hours: "Mon - Fri: 10:00 AM - 5:00 PM",
    accepted: ["College E-Waste", "Cables", "Laptops", "Peripherals"],
    phone: "+91 80 4567 8901",
    rating: 4.95,
    mapUrl: "https://maps.google.com"
  },
  {
    id: "ctr-4",
    name: "EcoDrop Express Kiosk",
    location: "Cyber Towers Plaza, Ground Floor E-Waste Bin",
    distance: "4.1 km away",
    hours: "24/7 Automated Drop Box",
    accepted: ["Small Electronics", "Batteries", "Smartphones"],
    phone: "+91 80 1122 3344",
    rating: 4.7,
    mapUrl: "https://maps.google.com"
  }
];

export const awarenessArticles = [
  {
    id: "art-1",
    category: "Basics",
    title: "What is E-Waste & Why is it Critical?",
    desc: "Electronic waste comprises discarded computers, phones, circuit boards, and appliances. Understand how rapid tech turnover creates millions of tons of hazardous waste annually.",
    readTime: "3 min read",
    content: "Electronic waste (e-waste) refers to any discarded electrical or electronic devices. As consumer electronics lifecycle shrinks, globally over 50 million metric tons of e-waste is generated every year. Toxic components like lead, cadmium, and mercury leak into ground water if dumped in landfills, causing severe health hazards. Proper recycling recovers valuable precious metals like gold, copper, and palladium while safeguarding human health."
  },
  {
    id: "art-2",
    category: "Health & Safety",
    title: "Why is E-Waste Dangerous?",
    desc: "Heavy metals such as lead, mercury, and flame retardants in electronics can contaminate soil, air, and drinking water if incinerated or improperly buried.",
    readTime: "4 min read",
    content: "When electronics are improperly disposed, toxic elements leach into soil and aquifers. Burning wire insulation releases toxic dioxins into the atmosphere. Exposure to heavy metals can cause neurological damage, respiratory illnesses, and kidney damage. Certified e-waste processing centers neutralize hazardous compounds in controlled environments."
  },
  {
    id: "art-3",
    category: "Guide",
    title: "How to Dispose Electronics Safely",
    desc: "A step-by-step checklist to back up personal data, factory reset devices, remove lithium batteries, and locate verified collection centers.",
    readTime: "5 min read",
    content: "1. Back up all your important photos and documents.\n2. Perform a complete factory reset and unlink cloud accounts.\n3. Remove SIM cards, microSD storage, and removable batteries.\n4. Tape battery terminals with electrical tape to prevent short circuits.\n5. Schedule a certified doorstep pickup on EcoNexis or drop at the nearest campus kiosk."
  },
  {
    id: "art-4",
    category: "Circular Economy",
    title: "Recycling Benefits & Urban Mining",
    desc: "1 ton of recycled smartphones yields up to 300g of gold and 140kg of copper—exponentially richer than mining raw earth ores.",
    readTime: "3 min read",
    content: "Urban mining is the extraction of precious metals and rare earth elements from recycled electronics. Recycling saves over 80% of energy compared to virgin mining, dramatically lowering greenhouse gas emissions and preserving natural ecosystems."
  },
  {
    id: "art-5",
    category: "Reuse",
    title: "Reuse Before Recycling: Upcycling Tech",
    desc: "Don't discard functional devices! Learn how donating older laptops and phones can bridge the digital divide for underserved school children.",
    readTime: "4 min read",
    content: "Extending the lifespan of an electronic item by just two years reduces its carbon footprint by nearly 50%. Usable gadgets donated on EcoNexis are refurbished and distributed to government schools, digital learning centers, and community libraries."
  },
  {
    id: "art-6",
    category: "Battery Safety",
    title: "Lithium-Ion Battery Hazards & Handling",
    desc: "Swollen, punctured, or overheated lithium batteries present fire hazards. Learn critical safety measures for battery handling.",
    readTime: "4 min read",
    content: "Lithium-ion batteries store dense chemical energy. Never puncture, crush, or expose them to open flames. If a battery is swollen or leaking, place it in a non-flammable container with sand and arrange immediate hazardous waste pickup via EcoNexis."
  }
];

export const mockDisposalHistory = [
  {
    id: "HIS-1091",
    date: "2026-08-20",
    item: "MacBook Air 2017 (Refurbished)",
    category: "Laptops",
    method: "Donation",
    ecoPoints: "+200",
    status: "Completed"
  },
  {
    id: "HIS-1088",
    date: "2026-08-14",
    item: "Samsung Galaxy S10",
    category: "Smartphones",
    method: "Doorstep Pickup",
    ecoPoints: "+50",
    status: "Completed"
  },
  {
    id: "HIS-1072",
    date: "2026-08-02",
    item: "Logitech Mechanical Keyboard",
    category: "Accessories",
    method: "Center Drop-off",
    ecoPoints: "+35",
    status: "Completed"
  },
  {
    id: "HIS-1065",
    date: "2026-07-28",
    item: "Old CRT TV & Cables",
    category: "Home Appliances",
    method: "Doorstep Pickup",
    ecoPoints: "+120",
    status: "Completed"
  },
  {
    id: "HIS-1049",
    date: "2026-07-15",
    item: "Li-Ion Power Bank & 4 Chargers",
    category: "Batteries & Cables",
    method: "QR Kiosk Scan",
    ecoPoints: "+45",
    status: "Completed"
  }
];

export const initialPickups = [
  {
    id: "ECO-1024",
    user: "Aarav Sharma",
    phone: "+91 98765 43210",
    address: "Room 304, Block B, Campus Hostel, National Institute of Technology",
    ewasteType: "Laptop & 3 Power Adapters",
    date: "2026-08-25",
    time: "02:00 PM - 04:00 PM",
    notes: "Please call when arriving at Gate 3",
    status: "Assigned",
    deliveryAgent: "Vikram Singh"
  },
  {
    id: "ECO-1025",
    user: "Keerthana Reddy",
    phone: "+91 98222 33445",
    address: "Apt 502, Green Meadows Residency, College Road",
    ewasteType: "Desktop CPU, Monitor & Keyboard",
    date: "2026-08-25",
    time: "10:00 AM - 12:00 PM",
    notes: "Leave with security guard if not available",
    status: "Pending",
    deliveryAgent: "Unassigned"
  },
  {
    id: "ECO-1022",
    user: "Rohan Varma",
    phone: "+91 99112 88440",
    address: "House 14B, Faculty Quarters, Campus East",
    ewasteType: "2 Smartphones & Old Tablet",
    date: "2026-08-22",
    time: "04:00 PM - 06:00 PM",
    notes: "Batteries taped safely",
    status: "Completed",
    deliveryAgent: "Vikram Singh"
  },
  {
    id: "ECO-1019",
    user: "Pooja Patel",
    phone: "+91 97333 44556",
    address: "Girls Hostel 2, Room 112",
    ewasteType: "Damaged Inkjet Printer",
    date: "2026-08-20",
    time: "11:00 AM - 01:00 PM",
    notes: "Cancelled due to schedule conflict",
    status: "Cancelled",
    deliveryAgent: "Vikram Singh"
  }
];

export const initialAdminUsers = [
  {
    id: "usr-101",
    name: "Aarav Sharma",
    email: "user@econexis.com",
    role: "User",
    ecoPoints: 1250,
    recycledKg: 24.5,
    status: "Active"
  },
  {
    id: "usr-102",
    name: "Keerthana Reddy",
    email: "keerthana@gmail.com",
    role: "User",
    ecoPoints: 890,
    recycledKg: 15.2,
    status: "Active"
  },
  {
    id: "usr-103",
    name: "Vikram Singh",
    email: "delivery@econexis.com",
    role: "Delivery",
    ecoPoints: 3400,
    recycledKg: 310.0,
    status: "Active"
  },
  {
    id: "usr-104",
    name: "Pooja Patel",
    email: "pooja.p@univ.edu",
    role: "User",
    ecoPoints: 420,
    recycledKg: 8.0,
    status: "Active"
  },
  {
    id: "usr-105",
    name: "Rohan Varma",
    email: "rohan.v@tech.com",
    role: "User",
    ecoPoints: 1650,
    recycledKg: 32.1,
    status: "Active"
  },
  {
    id: "adm-001",
    name: "Dr. Sunita Rao",
    email: "admin@econexis.com",
    role: "Admin",
    ecoPoints: 9800,
    recycledKg: 1240.0,
    status: "Active"
  }
];

export const aiDemoItems = [
  {
    name: "Smartphone",
    category: "Small Electronics",
    condition: "Reusable / Repairable",
    ecoPoints: 50,
    co2Saved: "4.2 kg",
    rareMaterials: "Gold, Silver, Cobalt, Lithium",
    hazardLevel: "Medium (Lithium Battery)",
    recommendation: "Eligible for student donation or certified recycling"
  },
  {
    name: "Laptop",
    category: "Computing & IT",
    condition: "Partially Working",
    ecoPoints: 150,
    co2Saved: "14.5 kg",
    rareMaterials: "Copper, Aluminum, Gold, Neodymium",
    hazardLevel: "Medium (Battery & Display panel)",
    recommendation: "Great candidate for educational donation refurbishing"
  },
  {
    name: "Mechanical Keyboard",
    category: "Computer Peripherals",
    condition: "Working",
    ecoPoints: 35,
    co2Saved: "1.8 kg",
    rareMaterials: "ABS Plastics, Copper, Steel",
    hazardLevel: "Low",
    recommendation: "Donate to student computing lab"
  },
  {
    name: "Optical Mouse",
    category: "Computer Peripherals",
    condition: "Damaged Cable",
    ecoPoints: 20,
    co2Saved: "0.8 kg",
    rareMaterials: "Recyclable Thermoplastics, Copper",
    hazardLevel: "Low",
    recommendation: "Safe for standard plastics and wiring recycling"
  },
  {
    name: "Fast USB Charger & Cables",
    category: "Power & Cables",
    condition: "Functional",
    ecoPoints: 25,
    co2Saved: "1.2 kg",
    rareMaterials: "High-grade Copper, Silicon ICs",
    hazardLevel: "Low",
    recommendation: "Direct reuse or copper wire recovery"
  },
  {
    name: "Lithium-Ion Battery Pack",
    category: "Hazardous Energy Storage",
    condition: "Depleted",
    ecoPoints: 40,
    co2Saved: "3.5 kg",
    rareMaterials: "Lithium, Cobalt, Nickel, Manganese",
    hazardLevel: "High - Handle with Care",
    recommendation: "Specialized chemical recycling required. Do not landfill."
  },
  {
    name: "LED / LCD Television",
    category: "Large Consumer Displays",
    condition: "Broken Backlight",
    ecoPoints: 220,
    co2Saved: "22.0 kg",
    rareMaterials: "Indium Tin Oxide, Glass, Aluminum chassis",
    hazardLevel: "Medium",
    recommendation: "Doorstep pickup recommended due to fragile glass panel"
  }
];
