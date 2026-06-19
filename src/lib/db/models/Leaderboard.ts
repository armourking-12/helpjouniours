import mongoose, { Schema, Document } from "mongoose";

export interface ILeaderboard extends Document {
  topUsers: Array<{
    userId: mongoose.Types.ObjectId;
    name: string;
    image?: string;
    reputation: number;
    rank: number;
  }>;
  updatedAt: Date;
}

const LeaderboardSchema = new Schema<ILeaderboard>(
  {
    topUsers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        image: { type: String },
        reputation: { type: Number, required: true },
        rank: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Leaderboard = mongoose.models.Leaderboard || mongoose.model<ILeaderboard>("Leaderboard", LeaderboardSchema);
