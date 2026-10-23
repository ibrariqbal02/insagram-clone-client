import { jest, describe, beforeEach, afterEach, it, expect } from "@jest/globals";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useChatSocket,
  useTypingIndicator,
  usePresence,
  useMarkConversationRead,
} from "../../src/hooks/useSocket";
import { getSocket, connectSocket, disconnectSocket } from "../../src/lib/socket";

jest.mock("../../src/lib/socket", () => ({
  getSocket: jest.fn(),
  connectSocket: jest.fn(),
  disconnectSocket: jest.fn(),
}));

class FakeSocket {
  listeners: Record<string, Array<(...args: any[]) => void>> = {};
  emit = jest.fn();

  on(event: string, cb: (...args: any[]) => void) {
    this.listeners[event] = this.listeners[event] ?? [];
    this.listeners[event].push(cb);
  }

  off(event: string, cb: (...args: any[]) => void) {
    this.listeners[event] = (this.listeners[event] ?? []).filter((fn) => fn !== cb);
  }

  trigger(event: string, payload: any) {
    (this.listeners[event] ?? []).forEach((cb) => cb(payload));
  }
}

describe("useSocket hooks", () => {
  let fakeSocket: FakeSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    fakeSocket = new FakeSocket();
    (getSocket as jest.Mock).mockReturnValue(fakeSocket);
    (connectSocket as jest.Mock).mockReturnValue(fakeSocket);
  });

  describe("useChatSocket", () => {
    const makeWrapper = () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
      return { queryClient, wrapper };
    };

    it("disconnects and does not subscribe when there is no authenticated user", () => {
      const { wrapper } = makeWrapper();
      renderHook(() => useChatSocket(undefined), { wrapper });

      expect(disconnectSocket).toHaveBeenCalled();
      expect(connectSocket).not.toHaveBeenCalled();
    });

    it("connects and adds a new message to the matching conversation's cache", () => {
      const { queryClient, wrapper } = makeWrapper();
      queryClient.setQueryData(["messages", "conv-1"], {
        success: true,
        totalMessages: 1,
        messages: [{ _id: "m1", content: "hi" }],
      });

      renderHook(() => useChatSocket("user-me"), { wrapper });

      expect(connectSocket).toHaveBeenCalled();

      act(() => {
        fakeSocket.trigger("message:new", {
          conversationId: "conv-1",
          message: { _id: "m2", content: "new message" },
        });
      });

      const data: any = queryClient.getQueryData(["messages", "conv-1"]);
      expect(data.messages).toHaveLength(2);
      expect(data.messages[1]).toEqual({ _id: "m2", content: "new message" });
    });

    it("does not duplicate a message that is already in the cache", () => {
      const { queryClient, wrapper } = makeWrapper();
      queryClient.setQueryData(["messages", "conv-1"], {
        messages: [{ _id: "m1", content: "hi" }],
      });

      renderHook(() => useChatSocket("user-me"), { wrapper });

      act(() => {
        fakeSocket.trigger("message:new", {
          conversationId: "conv-1",
          message: { _id: "m1", content: "hi" },
        });
      });

      const data: any = queryClient.getQueryData(["messages", "conv-1"]);
      expect(data.messages).toHaveLength(1);
    });

    it("patches an edited message in place on message:update", () => {
      const { queryClient, wrapper } = makeWrapper();
      queryClient.setQueryData(["messages", "conv-1"], {
        messages: [{ _id: "m1", content: "original" }],
      });

      renderHook(() => useChatSocket("user-me"), { wrapper });

      act(() => {
        fakeSocket.trigger("message:update", {
          conversationId: "conv-1",
          message: { _id: "m1", content: "edited", isEdited: true },
        });
      });

      const data: any = queryClient.getQueryData(["messages", "conv-1"]);
      expect(data.messages[0]).toEqual({ _id: "m1", content: "edited", isEdited: true });
    });

    it("removes a message from the cache on message:delete", () => {
      const { queryClient, wrapper } = makeWrapper();
      queryClient.setQueryData(["messages", "conv-1"], {
        messages: [{ _id: "m1" }, { _id: "m2" }],
      });

      renderHook(() => useChatSocket("user-me"), { wrapper });

      act(() => {
        fakeSocket.trigger("message:delete", {
          conversationId: "conv-1",
          messageId: "m1",
        });
      });

      const data: any = queryClient.getQueryData(["messages", "conv-1"]);
      expect(data.messages).toEqual([{ _id: "m2" }]);
    });

    it("marks only my own messages as read on message:read", () => {
      const { queryClient, wrapper } = makeWrapper();
      queryClient.setQueryData(["messages", "conv-1"], {
        messages: [
          { _id: "m1", sender: "user-me", isRead: false },
          { _id: "m2", sender: "user-other", isRead: false },
        ],
      });

      renderHook(() => useChatSocket("user-me"), { wrapper });

      act(() => {
        fakeSocket.trigger("message:read", {
          conversationId: "conv-1",
          readBy: "user-other",
        });
      });

      const data: any = queryClient.getQueryData(["messages", "conv-1"]);
      expect(data.messages[0].isRead).toBe(true);
      expect(data.messages[1].isRead).toBe(false);
    });

    it("unsubscribes all listeners on unmount", () => {
      const { wrapper } = makeWrapper();
      const { unmount } = renderHook(() => useChatSocket("user-me"), { wrapper });

      expect(fakeSocket.listeners["message:new"]?.length).toBe(1);

      unmount();

      expect(fakeSocket.listeners["message:new"]?.length).toBe(0);
      expect(fakeSocket.listeners["message:update"]?.length).toBe(0);
      expect(fakeSocket.listeners["message:delete"]?.length).toBe(0);
      expect(fakeSocket.listeners["message:read"]?.length).toBe(0);
    });
  });

  describe("useTypingIndicator", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("emits typing:start once, then typing:stop after the idle timeout", () => {
      const { result } = renderHook(() => useTypingIndicator("conv-1"));

      act(() => {
        result.current.notifyTyping();
      });

      expect(fakeSocket.emit).toHaveBeenCalledWith("typing:start", {
        conversationId: "conv-1",
      });
      expect(fakeSocket.emit).not.toHaveBeenCalledWith("typing:stop", expect.anything());

      act(() => {
        result.current.notifyTyping();
      });
      // Still only one typing:start despite calling notifyTyping twice
      expect(
        fakeSocket.emit.mock.calls.filter((call) => call[0] === "typing:start")
      ).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(fakeSocket.emit).toHaveBeenCalledWith("typing:stop", {
        conversationId: "conv-1",
      });
    });

    it("updates typingUserId only for events matching its own conversationId", () => {
      const { result } = renderHook(() => useTypingIndicator("conv-1"));

      act(() => {
        fakeSocket.trigger("typing:update", {
          conversationId: "conv-other",
          userId: "user-x",
          isTyping: true,
        });
      });
      expect(result.current.typingUserId).toBeNull();

      act(() => {
        fakeSocket.trigger("typing:update", {
          conversationId: "conv-1",
          userId: "user-x",
          isTyping: true,
        });
      });
      expect(result.current.typingUserId).toBe("user-x");

      act(() => {
        fakeSocket.trigger("typing:update", {
          conversationId: "conv-1",
          userId: "user-x",
          isTyping: false,
        });
      });
      expect(result.current.typingUserId).toBeNull();
    });
  });

  describe("usePresence", () => {
    it("tracks online state only for the given userId", () => {
      const { result } = renderHook(() => usePresence("user-x"));

      expect(result.current).toBe(false);

      act(() => {
        fakeSocket.trigger("presence:update", { userId: "user-y", online: true });
      });
      expect(result.current).toBe(false);

      act(() => {
        fakeSocket.trigger("presence:update", { userId: "user-x", online: true });
      });
      expect(result.current).toBe(true);

      act(() => {
        fakeSocket.trigger("presence:update", { userId: "user-x", online: false });
      });
      expect(result.current).toBe(false);
    });
  });

  describe("useMarkConversationRead", () => {
    it("emits message:read when the conversation or message count changes", () => {
      const { rerender } = renderHook(
        ({ conversationId, count }) => useMarkConversationRead(conversationId, count),
        { initialProps: { conversationId: "conv-1", count: 1 } }
      );

      expect(fakeSocket.emit).toHaveBeenCalledWith("message:read", {
        conversationId: "conv-1",
      });

      fakeSocket.emit.mockClear();

      rerender({ conversationId: "conv-1", count: 2 });

      expect(fakeSocket.emit).toHaveBeenCalledWith("message:read", {
        conversationId: "conv-1",
      });
    });
  });
});
