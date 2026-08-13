import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import api from "../../src/api/axios";
import { createConversation } from "../../src/services/conversation.service"; 


jest.mock("../../src/api/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn<(...args: any[]) => Promise<any>>(),
    get: jest.fn<(...args: any[]) => Promise<any>>(),
    delete: jest.fn<(...args: any[]) => Promise<any>>(),
  },
}));

describe("Message API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it("createConversation calls POST /conversation with receiverId payload", async () => {
    const receiverId = "user-receiver-123";
    const mockResponse = {
      data: {
        _id: "conversation-999",
        participants: ["user-me", receiverId],
      },
    };

    (api.post as jest.MockedFunction<typeof api.post>).mockResolvedValue(mockResponse);

    const result = await createConversation(receiverId);

    expect(api.post).toHaveBeenCalledWith("/conversation", {
      receiverId,
    });
    expect(result).toEqual(mockResponse.data);
  });
});