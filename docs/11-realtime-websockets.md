# ⚡ Guide 11: Real-Time Features with WebSockets

> **Duration:** 180-240 minutes (3-4 hours)  
> **Prerequisites:** Guides 8, 9, 10 completed  
> **Outcome:** Live updates, notifications, and real-time collaboration

---

## 🎯 What You'll Build

Real-time features for ChamaHub:
- **Live Contribution Feed** - See contributions as they happen
- **Instant Notifications** - Push notifications for events
- **Online Presence** - See who's online
- **Live Chat** - Member communication
- **Real-Time Dashboard** - Auto-updating stats
- **Collaborative Voting** - Live dispute resolution
- **Activity Stream** - Recent actions feed

---

## Part I: WebSocket Setup

### 1.1 Backend WebSocket Configuration

**Note:** This connects to Django Channels setup from Guide 6.

**Django Channels Consumer (Backend - Reference):**

```python
# apps/core/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChamaConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chama_id = self.scope['url_route']['kwargs']['chama_id']
        self.room_group_name = f'chama_{self.chama_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']

        # Broadcast to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': message_type,
                'data': data
            }
        )

    # Event handlers
    async def contribution_created(self, event):
        await self.send(text_data=json.dumps(event['data']))

    async def expense_approved(self, event):
        await self.send(text_data=json.dumps(event['data']))

    async def member_online(self, event):
        await self.send(text_data=json.dumps(event['data']))
```

### 1.2 Frontend WebSocket Hook

**Create `src/hooks/useWebSocket.ts`:**

```typescript
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: string;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export const useWebSocket = (
  chamaId: string | null,
  options: UseWebSocketOptions = {}
) => {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const reconnectCount = useRef(0);
  const { accessToken } = useAuthStore();

  const connect = useCallback(() => {
    if (!chamaId || !accessToken) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chama/${chamaId}/?token=${accessToken}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      reconnectCount.current = 0;
      onConnect?.();
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
        onMessage?.(message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      onError?.(error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      onDisconnect?.();

      // Attempt to reconnect
      if (reconnectCount.current < reconnectAttempts) {
        reconnectCount.current++;
        console.log(`Reconnecting... Attempt ${reconnectCount.current}`);
        setTimeout(connect, reconnectInterval);
      }
    };
  }, [chamaId, accessToken, onConnect, onMessage, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((type: string, data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
};
```

---

## Part II: Live Contribution Feed

### 2.1 Real-Time Contribution Component

**Create `src/components/realtime/LiveContributionFeed.tsx`:**

```typescript
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpCircle, CheckCircle2, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatCurrency, formatRelativeTime, getInitials } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast-notification";

interface Contribution {
  id: string;
  memberName: string;
  memberAvatar?: string;
  amount: number;
  timestamp: string;
  status: "confirmed" | "pending";
  mpesaCode: string;
}

interface LiveContributionFeedProps {
  chamaId: string;
}

export const LiveContributionFeed: React.FC<LiveContributionFeedProps> = ({
  chamaId,
}) => {
  const [contributions, setContributions] = React.useState<Contribution[]>([]);
  const queryClient = useQueryClient();
  const { success } = useToast();

  // Fetch initial contributions
  const { data: initialContributions } = useQuery({
    queryKey: ["contributions", chamaId],
    queryFn: async () => {
      // Replace with actual API call
      return [] as Contribution[];
    },
  });

  React.useEffect(() => {
    if (initialContributions) {
      setContributions(initialContributions);
    }
  }, [initialContributions]);

  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket(chamaId, {
    onMessage: (message) => {
      if (message.type === "contribution_created") {
        const newContribution = message.data as Contribution;
        
        // Add to local state
        setContributions((prev) => [newContribution, ...prev].slice(0, 10));
        
        // Show toast notification
        success(
          "New Contribution!",
          `${newContribution.memberName} contributed ${formatCurrency(newContribution.amount)}`
        );

        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ["contributions"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
    },
  });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">
          Live Contributions
        </CardTitle>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="animate-pulse bg-green-500">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Connecting...
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {contributions.map((contribution, index) => (
              <motion.div
                key={contribution.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  layout: { duration: 0.2 },
                }}
                layout
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group relative overflow-hidden"
              >
                {/* New indicator */}
                {index === 0 && (
                  <motion.div
                    className="absolute inset-0 bg-primary/5"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                  {contribution.memberAvatar ? (
                    <AvatarImage src={contribution.memberAvatar} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {getInitials(contribution.memberName)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {contribution.memberName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {contribution.mpesaCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(contribution.amount)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(contribution.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {contribution.status === "confirmed" ? (
                      <Badge
                        variant="default"
                        className="h-5 text-xs bg-green-500/10 text-green-700 hover:bg-green-500/20"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Confirmed
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="h-5 text-xs animate-pulse"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                >
                  <ArrowUpCircle className="h-5 w-5 text-primary" />
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {contributions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Waiting for contributions...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## Part III: Online Presence Indicator

**Create `src/components/realtime/OnlineMembers.tsx`:**

```typescript
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket";
import { getInitials } from "@/lib/utils";

interface OnlineMember {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "offline";
  lastSeen?: string;
}

interface OnlineMembersProps {
  chamaId: string;
}

export const OnlineMembers: React.FC<OnlineMembersProps> = ({ chamaId }) => {
  const [onlineMembers, setOnlineMembers] = React.useState<OnlineMember[]>([]);

  const { sendMessage } = useWebSocket(chamaId, {
    onMessage: (message) => {
      if (message.type === "member_online") {
        setOnlineMembers((prev) => {
          const exists = prev.find((m) => m.id === message.data.id);
          if (exists) {
            return prev.map((m) =>
              m.id === message.data.id ? { ...m, ...message.data } : m
            );
          }
          return [...prev, message.data];
        });
      } else if (message.type === "member_offline") {
        setOnlineMembers((prev) =>
          prev.filter((m) => m.id !== message.data.id)
        );
      }
    },
    onConnect: () => {
      // Announce presence
      sendMessage("member_online", {
        status: "online",
      });
    },
  });

  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    offline: "bg-gray-400",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Online Members</CardTitle>
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            {onlineMembers.filter((m) => m.status === "online").length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <AnimatePresence>
            {onlineMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    {member.avatar ? (
                      <AvatarImage src={member.avatar} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <motion.div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                      statusColors[member.status]
                    }`}
                    animate={{
                      scale: member.status === "online" ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      duration: 2,
                      repeat: member.status === "online" ? Infinity : 0,
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {member.status}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {onlineMembers.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No members online</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## Part IV: Live Voting System

**Create `src/components/realtime/LiveVoting.tsx`:**

```typescript
import React from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency } from "@/lib/utils";

interface VotingData {
  id: string;
  expenseTitle: string;
  expenseAmount: number;
  approvalVotes: number;
  rejectionVotes: number;
  totalMembers: number;
  hasVoted: boolean;
  userVote?: "approve" | "reject";
}

interface LiveVotingProps {
  chamaId: string;
  votingId: string;
  initialData: VotingData;
}

export const LiveVoting: React.FC<LiveVotingProps> = ({
  chamaId,
  votingId,
  initialData,
}) => {
  const [votingData, setVotingData] = React.useState(initialData);
  const { user } = useAuthStore();

  const { sendMessage } = useWebSocket(chamaId, {
    onMessage: (message) => {
      if (message.type === "vote_cast" && message.data.votingId === votingId) {
        setVotingData((prev) => ({
          ...prev,
          approvalVotes: message.data.approvalVotes,
          rejectionVotes: message.data.rejectionVotes,
        }));
      }
    },
  });

  const castVote = (vote: "approve" | "reject") => {
    sendMessage("cast_vote", {
      votingId,
      userId: user?.id,
      vote,
    });

    setVotingData((prev) => ({
      ...prev,
      hasVoted: true,
      userVote: vote,
      approvalVotes: vote === "approve" ? prev.approvalVotes + 1 : prev.approvalVotes,
      rejectionVotes: vote === "reject" ? prev.rejectionVotes + 1 : prev.rejectionVotes,
    }));
  };

  const totalVotes = votingData.approvalVotes + votingData.rejectionVotes;
  const approvalPercentage =
    totalVotes > 0 ? (votingData.approvalVotes / totalVotes) * 100 : 0;
  const quorumPercentage = (totalVotes / votingData.totalMembers) * 100;
  const quorumReached = quorumPercentage >= 70;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Expense Approval Vote</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {votingData.expenseTitle} - {formatCurrency(votingData.expenseAmount)}
            </p>
          </div>
          <Badge variant={quorumReached ? "default" : "secondary"}>
            <Users className="h-3 w-3 mr-1" />
            {totalVotes}/{votingData.totalMembers}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quorum Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quorum (70% required)</span>
            <span className="font-medium">{quorumPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={quorumPercentage} className="h-2" />
        </div>

        {/* Vote Results */}
        <div className="space-y-4">
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span>Approve</span>
              </div>
              <span className="font-semibold">
                {votingData.approvalVotes} ({approvalPercentage.toFixed(0)}%)
              </span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${approvalPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                <span>Reject</span>
              </div>
              <span className="font-semibold">
                {votingData.rejectionVotes} ({(100 - approvalPercentage).toFixed(0)}%)
              </span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-red-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${100 - approvalPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Voting Buttons */}
        {!votingData.hasVoted ? (
          <div className="flex gap-2">
            <Button
              onClick={() => castVote("approve")}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={() => castVote("reject")}
              variant="destructive"
              className="flex-1"
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              You voted to {votingData.userVote}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Thank you for participating
            </p>
          </div>
        )}

        {/* Status Message */}
        {quorumReached && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-green-50 text-green-800 rounded-lg text-sm text-center"
          >
            ✓ Quorum reached! Vote will be finalized soon.
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## Part V: Activity Stream

**Create `src/components/realtime/ActivityStream.tsx`:**

```typescript
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "contribution" | "expense" | "member_joined" | "loan_approved" | "loan_rejected";
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  userName: string;
}

const activityIcons = {
  contribution: ArrowUpRight,
  expense: ArrowDownRight,
  member_joined: UserPlus,
  loan_approved: CheckCircle,
  loan_rejected: XCircle,
};

const activityColors = {
  contribution: "text-green-600 bg-green-100",
  expense: "text-red-600 bg-red-100",
  member_joined: "text-blue-600 bg-blue-100",
  loan_approved: "text-green-600 bg-green-100",
  loan_rejected: "text-red-600 bg-red-100",
};

interface ActivityStreamProps {
  chamaId: string;
}

export const ActivityStream: React.FC<ActivityStreamProps> = ({ chamaId }) => {
  const [activities, setActivities] = React.useState<Activity[]>([]);

  useWebSocket(chamaId, {
    onMessage: (message) => {
      if (message.type.includes("_created") || message.type.includes("_updated")) {
        const newActivity: Activity = {
          id: Math.random().toString(),
          type: message.type.replace("_created", "").replace("_updated", "") as Activity["type"],
          ...message.data,
          timestamp: new Date().toISOString(),
        };
        
        setActivities((prev) => [newActivity, ...prev].slice(0, 20));
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Badge variant="secondary">Live</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type] || AlertCircle;
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      activityColors[activity.type]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>

                  {activity.amount && (
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {formatCurrency(activity.amount)}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {activities.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 🎉 Summary

You've built complete real-time features:

✅ **WebSocket Integration** - Custom hook for connections  
✅ **Live Updates** - Real-time contribution feed  
✅ **Online Presence** - See who's online  
✅ **Live Voting** - Collaborative decision making  
✅ **Activity Stream** - Recent actions feed  
✅ **Auto Reconnection** - Handles disconnects gracefully  
✅ **Toast Notifications** - Instant feedback  
✅ **Optimistic Updates** - Better UX  

### 🎊 Complete Frontend Stack

You now have a **production-ready, full-stack application** with:

**Guides 8-11 Coverage:**
- ✅ Modern UI components with animations
- ✅ Complete dashboard with charts
- ✅ Advanced forms with validation
- ✅ Real-time WebSocket features

**Next Steps:**
1. Deploy frontend to Vercel/Netlify
2. Connect to Django backend
3. Test end-to-end functionality
4. Monitor performance and errors

---

**🚀 Congratulations! You've mastered full-stack development with Django + TypeScript!**

**Built with ❤️ for ChamaHub**
