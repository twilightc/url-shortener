
export interface SuccessResponse<T>{
  isSuccess: true;
  message:string;
  data: T;
}


export interface ErrorResponse{
  isSuccess: false;
  message:string;
  data: unknown;
}