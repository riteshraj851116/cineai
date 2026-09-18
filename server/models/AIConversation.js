import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [{
      role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      intent: {
        type: String,
        default: 'GENERAL',
      },
      actionData: {
        type: Object,
        default: null,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    lastIntent: {
      type: String,
      default: 'GENERAL',
    },
  },
  { timestamps: true }
);

export const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
