import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import api from "../../src/api/axios";
import {
  likeUnlikePost,
  createPost,
  getMyPosts,
  getPostById,
  getPostsByUserId,
  updatePost,
  deletePost,
} from "../../src/services/post.service"; 


jest.mock("../../src/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn<(...args: any[]) => Promise<any>>(),
    post: jest.fn<(...args: any[]) => Promise<any>>(),
    put: jest.fn<(...args: any[]) => Promise<any>>(),
    delete: jest.fn<(...args: any[]) => Promise<any>>(),
  },
}));

describe("Post API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

 
  it("likeUnlikePost calls PUT /post/:postId/like", async () => {
    const postId = "post-123";
    const mockResponse = { data: { message: "Post liked" } };

    (api.put as jest.MockedFunction<typeof api.put>).mockResolvedValue(mockResponse);

    const result = await likeUnlikePost(postId);

    expect(api.put).toHaveBeenCalledWith(`/post/${postId}/like`);
    expect(result).toEqual(mockResponse.data);
  });

  it("createPost calls POST /post/create with FormData and multipart headers", async () => {
    const formData = new FormData();
    formData.append("caption", "Hello World");

    const mockResponse = { data: { post: { _id: "post-123", caption: "Hello World" } } };

    (api.post as jest.MockedFunction<typeof api.post>).mockResolvedValue(mockResponse);

    const result = await createPost(formData);

    expect(api.post).toHaveBeenCalledWith("/post/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    expect(result).toEqual(mockResponse.data);
  });


  it("getMyPosts calls GET /post/my-posts", async () => {
    const mockResponse = { data: { posts: [{ _id: "post-1" }] } };

    (api.get as jest.MockedFunction<typeof api.get>).mockResolvedValue(mockResponse);

    const result = await getMyPosts();

    expect(api.get).toHaveBeenCalledWith("/post/my-posts");
    expect(result).toEqual(mockResponse.data);
  });

  it("getPostById calls GET /post/:postId", async () => {
    const postId = "post-123";
    const mockResponse = { data: { post: { _id: postId } } };

    (api.get as jest.MockedFunction<typeof api.get>).mockResolvedValue(mockResponse);

    const result = await getPostById(postId);

    expect(api.get).toHaveBeenCalledWith(`/post/${postId}`);
    expect(result).toEqual(mockResponse.data);
  });

  it("getPostsByUserId calls GET /post/user/:userId", async () => {
    const userId = "user-456";
    const mockResponse = { data: { posts: [{ _id: "post-1", owner: userId }] } };

    (api.get as jest.MockedFunction<typeof api.get>).mockResolvedValue(mockResponse);

    const result = await getPostsByUserId(userId);

    expect(api.get).toHaveBeenCalledWith(`/post/user/${userId}`);
    expect(result).toEqual(mockResponse.data);
  });


  it("updatePost calls PUT /post/:postId with FormData and multipart headers", async () => {
    const postId = "post-123";
    const formData = new FormData();
    formData.append("caption", "Updated Caption");

    const mockResponse = { data: { message: "Post updated successfully" } };

    (api.put as jest.MockedFunction<typeof api.put>).mockResolvedValue(mockResponse);

    const result = await updatePost({ postId, formData });

    expect(api.put).toHaveBeenCalledWith(`/post/${postId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    expect(result).toEqual(mockResponse.data);
  });


  it("deletePost calls DELETE /post/:postId", async () => {
    const postId = "post-123";
    const mockResponse = { data: { message: "Post deleted successfully" } };

    (api.delete as jest.MockedFunction<typeof api.delete>).mockResolvedValue(mockResponse);

    const result = await deletePost(postId);

    expect(api.delete).toHaveBeenCalledWith(`/post/${postId}`);
    expect(result).toEqual(mockResponse.data);
  });
});