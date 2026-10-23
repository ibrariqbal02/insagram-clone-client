import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import api from "../../src/api/axios";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeUnlikeComment,
} from "../../src/services/comment.service"; 


jest.mock("../../src/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn<(...args: any[]) => Promise<any>>(),
    post: jest.fn<(...args: any[]) => Promise<any>>(),
    put: jest.fn<(...args: any[]) => Promise<any>>(),
    delete: jest.fn<(...args: any[]) => Promise<any>>(),
  },
}));

describe("Comment API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

 
  it("getComments calls GET /comment/:postId", async () => {
    const postId = "post-123";
    const mockResponse = {
      data: {
        comments: [
          { _id: "c1", text: "Nice post!" },
          { _id: "c2", text: "Awesome!" },
        ],
      },
    };

    (api.get as jest.MockedFunction<typeof api.get>).mockResolvedValue(mockResponse);

    const result = await getComments(postId);

    expect(api.get).toHaveBeenCalledWith(`/comment/${postId}`);
    expect(result).toEqual(mockResponse.data);
  });

  it("createComment calls POST /comment/:postId with text payload", async () => {
    const payload = {
      postId: "post-123",
      text: "This is a root comment",
    };
    const mockResponse = { data: { comment: { _id: "c1", text: payload.text } } };

    (api.post as jest.MockedFunction<typeof api.post>).mockResolvedValue(mockResponse);

    const result = await createComment(payload);

    expect(api.post).toHaveBeenCalledWith(`/comment/${payload.postId}`, {
      text: payload.text,
      parentComment: undefined,
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("createComment passes parentComment ID when replying", async () => {
    const payload = {
      postId: "post-123",
      text: "This is a reply",
      parentComment: "c1",
    };
    const mockResponse = { data: { comment: { _id: "c2", text: payload.text } } };

    (api.post as jest.MockedFunction<typeof api.post>).mockResolvedValue(mockResponse);

    const result = await createComment(payload);

    expect(api.post).toHaveBeenCalledWith(`/comment/${payload.postId}`, {
      text: payload.text,
      parentComment: "c1",
    });
    expect(result).toEqual(mockResponse.data);
  });


  it("updateComment calls PUT /comment/:commentId with updated text", async () => {
    const payload = {
      commentId: "c1",
      text: "Updated comment text",
    };
    const mockResponse = { data: { message: "Comment updated successfully" } };

    (api.put as jest.MockedFunction<typeof api.put>).mockResolvedValue(mockResponse);

    const result = await updateComment(payload);

    expect(api.put).toHaveBeenCalledWith(`/comment/${payload.commentId}`, {
      text: payload.text,
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("deleteComment calls DELETE /comment/:commentId", async () => {
    const commentId = "c1";
    const mockResponse = { data: { message: "Comment deleted successfully" } };

    (api.delete as jest.MockedFunction<typeof api.delete>).mockResolvedValue(mockResponse);

    const result = await deleteComment(commentId);

    expect(api.delete).toHaveBeenCalledWith(`/comment/${commentId}`);
    expect(result).toEqual(mockResponse.data);
  });


  it("likeUnlikeComment calls PUT /comment/:commentId/like", async () => {
    const commentId = "c1";
    const mockResponse = { data: { message: "Comment liked successfully" } };

    (api.put as jest.MockedFunction<typeof api.put>).mockResolvedValue(mockResponse);

    const result = await likeUnlikeComment(commentId);

    expect(api.put).toHaveBeenCalledWith(`/comment/${commentId}/like`);
    expect(result).toEqual(mockResponse.data);
  });
});