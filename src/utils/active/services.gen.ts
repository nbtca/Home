// This file is auto-generated by @hey-api/openapi-ts

import type { CancelablePromise } from "./core/CancelablePromise";
import type { BaseHttpRequest } from "./core/BaseHttpRequest";
import type {
  PostFreshmanAddData,
  PostFreshmanAddResponse,
  GetFreshmanListResponse,
} from "./types.gen";

export class FreshmanService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * 添加新人
   * @param data The data for the request.
   * @param data.requestBody
   * @returns unknown Returns the created task
   * @throws ApiError
   */
  public postFreshmanAdd(
    data: PostFreshmanAddData = {},
  ): CancelablePromise<PostFreshmanAddResponse> {
    return this.httpRequest.request({
      method: "POST",
      url: "/api/freshman",
      body: data.requestBody,
      mediaType: "application/json",
    });
  }

  /**
   * 获取新人列表
   * @returns unknown Returns a list of tasks
   * @throws ApiError
   */
  public getFreshmanList(): CancelablePromise<GetFreshmanListResponse> {
    return this.httpRequest.request({
      method: "GET",
      url: "/api/freshman",
    });
  }
}