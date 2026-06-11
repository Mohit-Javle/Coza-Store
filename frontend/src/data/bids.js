// Memory state for bids and QnA to support frontend adding bids/questions
export let mockBidsData = {
  p1: {
    bids: [
      { bidderId: "u3", amount: 870, time: "2026-06-03T14:22:00" },
      { bidderId: "u5", amount: 750, time: "2026-06-03T11:05:00" },
      { bidderId: "u4", amount: 650, time: "2026-06-02T19:30:00" },
      { bidderId: "u2", amount: 550, time: "2026-06-02T12:00:00" },
      { bidderId: "u7", amount: 450, time: "2026-06-01T18:15:00" }
    ],
    qna: [
      {
        questionBy: "u4",
        question: "Any stains or damage?",
        answer: "Nope, clean kondition bhai. No stains at all, steam ironed and packed.",
        answeredAt: "2026-06-02"
      },
      {
        questionBy: "u8",
        question: "Is the fit oversized or regular?",
        answer: "It says size L but fits like a boxy XL. Check description details.",
        answeredAt: "2026-06-03"
      }
    ]
  },
  p2: {
    bids: [
      { bidderId: "u1", amount: 4100, time: "2026-06-08T22:15:00" },
      { bidderId: "u4", amount: 3900, time: "2026-06-08T18:00:00" },
      { bidderId: "u3", amount: 3700, time: "2026-06-07T14:30:00" },
      { bidderId: "u6", amount: 3500, time: "2026-06-06T11:00:00" },
      { bidderId: "u7", amount: 3200, time: "2026-06-05T15:00:00" }
    ],
    qna: [
      {
        questionBy: "u1",
        question: "What is the waist measurement in inches?",
        answer: "It is a size M but has adjustable waist pulls, fits comfortably from 30 to 33 inches waist.",
        answeredAt: "2026-06-06"
      }
    ]
  },
  p3: {
    bids: [
      { bidderId: "u3", amount: 11200, time: "2026-06-10T14:22:00" },
      { bidderId: "u4", amount: 10500, time: "2026-06-09T20:10:00" },
      { bidderId: "u5", amount: 9800, time: "2026-06-09T10:00:00" },
      { bidderId: "u7", amount: 9000, time: "2026-06-08T15:30:00" },
      { bidderId: "u8", amount: 8000, time: "2026-06-08T12:00:00" }
    ],
    qna: [
      {
        questionBy: "u3",
        question: "Do you have the purchase invoice?",
        answer: "Yes, uploaded the bill. It shows verified badge too. Can share invoice PDF in DM later.",
        answeredAt: "2026-06-09"
      }
    ]
  },
  p4: {
    bids: [
      { bidderId: "u5", amount: 3200, time: "2026-06-05T12:00:00" },
      { bidderId: "u7", amount: 3000, time: "2026-06-04T18:00:00" },
      { bidderId: "u1", amount: 2800, time: "2026-06-03T11:00:00" },
      { bidderId: "u2", amount: 2500, time: "2026-06-02T15:00:00" }
    ],
    qna: [
      {
        questionBy: "u5",
        question: "Is this genuine heavy leather or faux leather?",
        answer: "100% thick steerhide leather, weighs about 2.5kg. Very high quality vintage piece.",
        answeredAt: "2026-06-03"
      }
    ]
  },
  p5: {
    bids: [
      { bidderId: "u8", amount: 1650, time: "2026-06-10T19:30:00" },
      { bidderId: "u4", amount: 1500, time: "2026-06-10T11:00:00" },
      { bidderId: "u1", amount: 1350, time: "2026-06-09T16:00:00" },
      { bidderId: "u7", amount: 1200, time: "2026-06-08T15:20:00" }
    ],
    qna: [
      {
        questionBy: "u8",
        question: "Are there any hairline scratches on the lens?",
        answer: "None, kept in microfibre pouch. Frame is spotless too.",
        answeredAt: "2026-06-09"
      }
    ]
  },
  p6: {
    bids: [
      { bidderId: "u1", amount: 4800, time: "2026-06-09T17:30:00" },
      { bidderId: "u4", amount: 4600, time: "2026-06-09T12:00:00" },
      { bidderId: "u5", amount: 4400, time: "2026-06-08T19:00:00" },
      { bidderId: "u3", amount: 4200, time: "2026-06-08T10:00:00" },
      { bidderId: "u7", amount: 4000, time: "2026-06-07T19:00:00" }
    ],
    qna: [
      {
        questionBy: "u1",
        question: "Is this a warm jacket?",
        answer: "Yes, wool body with nylon lining. Good for Delhi winters.",
        answeredAt: "2026-06-08"
      }
    ]
  },
  p7: {
    bids: [
      { bidderId: "u8", amount: 1500, time: "2026-06-07T14:30:00" },
      { bidderId: "u4", amount: 1400, time: "2026-06-06T18:00:00" },
      { bidderId: "u3", amount: 1300, time: "2026-06-05T12:00:00" },
      { bidderId: "u2", amount: 1200, time: "2026-06-05T09:00:00" },
      { bidderId: "u1", amount: 1100, time: "2026-06-04T21:00:00" }
    ],
    qna: [
      {
        questionBy: "u8",
        question: "What is the leg opening width?",
        answer: "Very baggy skater style, about 9.5 inches flat lay opening.",
        answeredAt: "2026-06-06"
      }
    ]
  },
  p8: {
    bids: [
      { bidderId: "u1", amount: 2400, time: "2026-06-10T22:00:00" },
      { bidderId: "u3", amount: 2200, time: "2026-06-10T15:00:00" },
      { bidderId: "u2", amount: 2000, time: "2026-06-09T18:00:00" },
      { bidderId: "u7", amount: 1800, time: "2026-06-09T18:00:00" }
    ],
    qna: []
  },
  p9: {
    bids: [
      { bidderId: "u1", amount: 6800, time: "2026-06-09T15:00:00" },
      { bidderId: "u4", amount: 6500, time: "2026-06-08T18:00:00" },
      { bidderId: "u5", amount: 6000, time: "2026-06-08T12:00:00" },
      { bidderId: "u7", amount: 5500, time: "2026-06-07T15:00:00" },
      { bidderId: "u8", amount: 5000, time: "2026-06-06T15:00:00" }
    ],
    qna: [
      {
        questionBy: "u1",
        question: "Is it heavy?",
        answer: "Quite heavy due to the platform sole, typical Doc Martens weight but super comfortable after break-in.",
        answeredAt: "2026-06-07"
      }
    ]
  },
  p10: {
    bids: [
      { bidderId: "u5", amount: 2400, time: "2026-06-10T16:00:00" },
      { bidderId: "u1", amount: 2200, time: "2026-06-10T11:00:00" },
      { bidderId: "u2", amount: 2000, time: "2026-06-09T20:00:00" },
      { bidderId: "u8", amount: 1800, time: "2026-06-09T15:00:00" },
      { bidderId: "u7", amount: 1500, time: "2026-06-08T22:00:00" }
    ],
    qna: [
      {
        questionBy: "u5",
        question: "Are the holes structural or accidental?",
        answer: "They are accidental vintage distressing around the bottom hem, looks crazy aesthetic.",
        answeredAt: "2026-06-09"
      }
    ]
  },
  p11: {
    bids: [
      { bidderId: "u5", amount: 1800, time: "2026-06-10T14:00:00" },
      { bidderId: "u3", amount: 1650, time: "2026-06-10T10:00:00" },
      { bidderId: "u2", amount: 1500, time: "2026-06-09T17:00:00" }
    ],
    qna: []
  },
  p12: {
    bids: [
      { bidderId: "u3", amount: 12500, time: "2026-06-09T18:00:00" },
      { bidderId: "u1", amount: 12000, time: "2026-06-09T10:00:00" },
      { bidderId: "u4", amount: 11000, time: "2026-06-08T15:00:00" },
      { bidderId: "u5", amount: 10000, time: "2026-06-07T12:00:00" },
      { bidderId: "u7", amount: 9000, time: "2026-06-05T20:00:00" }
    ],
    qna: [
      {
        questionBy: "u3",
        question: "Is there any yellowing on the boost sole?",
        answer: "No, kept in dry box. Boost is clean and white.",
        answeredAt: "2026-06-07"
      }
    ]
  },
  p13: {
    bids: [
      { bidderId: "u5", amount: 3400, time: "2026-06-09T14:00:00" },
      { bidderId: "u4", amount: 3200, time: "2026-06-08T18:00:00" },
      { bidderId: "u7", amount: 3000, time: "2026-06-07T12:00:00" },
      { bidderId: "u1", amount: 2800, time: "2026-06-04T23:00:00" }
    ],
    qna: []
  },
  p14: {
    bids: [
      { bidderId: "u1", amount: 9500, time: "2026-06-10T12:00:00" },
      { bidderId: "u3", amount: 9000, time: "2026-06-09T20:00:00" },
      { bidderId: "u2", amount: 8500, time: "2026-06-09T10:00:00" },
      { bidderId: "u6", amount: 8000, time: "2026-06-08T14:00:00" },
      { bidderId: "u7", amount: 7000, time: "2026-06-07T15:00:00" }
    ],
    qna: [
      {
        questionBy: "u1",
        question: "Is the dagger engraving sharp?",
        answer: "Yes, it is from the newer casting. Very defined detail.",
        answeredAt: "2026-06-08"
      }
    ]
  },
  p15: {
    bids: [
      { bidderId: "u5", amount: 1600, time: "2026-06-10T10:00:00" },
      { bidderId: "u4", amount: 1400, time: "2026-06-09T18:00:00" },
      { bidderId: "u2", amount: 1200, time: "2026-06-09T11:00:00" },
      { bidderId: "u7", amount: 1000, time: "2026-06-08T18:00:00" }
    ],
    qna: [
      {
        questionBy: "u5",
        question: "Are extra links included for the strap?",
        answer: "It has the sliding adjuster clasp, so it fits any wrist size without links.",
        answeredAt: "2026-06-09"
      }
    ]
  }
};

export const getBidsForProduct = (productId) => {
  return mockBidsData[productId]?.bids || [];
};

export const getQnAForProduct = (productId) => {
  return mockBidsData[productId]?.qna || [];
};

export const placeBid = (productId, bidderId, amount) => {
  if (!mockBidsData[productId]) {
    mockBidsData[productId] = { bids: [], qna: [] };
  }
  const newBid = {
    bidderId,
    amount,
    time: new Date().toISOString()
  };
  mockBidsData[productId].bids = [newBid, ...mockBidsData[productId].bids];
  return mockBidsData[productId].bids;
};

export const askQuestion = (productId, questionBy, question) => {
  if (!mockBidsData[productId]) {
    mockBidsData[productId] = { bids: [], qna: [] };
  }
  const newQ = {
    questionBy,
    question,
    answer: null,
    answeredAt: null
  };
  mockBidsData[productId].qna = [...mockBidsData[productId].qna, newQ];
  return mockBidsData[productId].qna;
};

export const answerQuestion = (productId, questionIndex, answer) => {
  if (mockBidsData[productId] && mockBidsData[productId].qna[questionIndex]) {
    mockBidsData[productId].qna[questionIndex].answer = answer;
    mockBidsData[productId].qna[questionIndex].answeredAt = new Date().toISOString().split('T')[0];
  }
  return mockBidsData[productId]?.qna || [];
};
