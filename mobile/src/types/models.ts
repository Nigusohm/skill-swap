export type UserProfile = {
  id: string;
  name: string;
  email: string;
  school?: string;
  bio?: string;
  availability?: string;
  skillsToTeach: string[];
  skillsToLearn: string[];
  rating: number;
};

export type Match = {
  userId: string;
  name: string;
  school?: string;
  teachToLearnOverlap: string[];
  learnToTeachOverlap: string[];
  score: number;
};

export type ChatListItem = {
  id: string;
  peer: { id: string; name: string };
  lastMessage: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  } | null;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type Session = {
  id: string;
  userAId: string;
  userBId: string;
  skillOffered: string;
  skillRequested: string;
  startAt: string;
  endAt: string;
  notes?: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED";
  userA: { id: string; name: string };
  userB: { id: string; name: string };
};
