import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import api from "../../src/api/axios";
import { getFeed } from "../../src/services/feed.service"; 


jest.mock("../../src/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn<(...args: any[]) => Promise<any>>(),
  },
}));

describe("Feed API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });



  it("getFeed calls GET /feed and returns response data", async () => {
    const mockResponse = {
      data: {
        posts: [
          {
            _id: "post-1",
            caption: "First post",
            likes: [],
          },
          {
            _id: "post-2",
            caption: "Second post",
            likes: ["user-1"],
          },
        ],
      },
    };

    (api.get as jest.MockedFunction<typeof api.get>).mockResolvedValue(mockResponse);

    const result = await getFeed();

    expect(api.get).toHaveBeenCalledWith("/feed");
    expect(result).toEqual(mockResponse.data);
  });
});