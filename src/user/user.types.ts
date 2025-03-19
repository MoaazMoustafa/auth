import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsStrongPassword,
} from 'class-validator';

export class SignupInput {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirmation: string;
}

export class SigninInput {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgetPasswordInput {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordInput {
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirmation: string;
}

export class DoneResponse {
  done: boolean;
  code: string;
  message: string;
}

export enum LoginStatusEnum {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
