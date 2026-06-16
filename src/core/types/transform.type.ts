import { TransformFnParams } from 'class-transformer';

export interface ITransformParams<T = string> extends TransformFnParams {
  value: T;
}
