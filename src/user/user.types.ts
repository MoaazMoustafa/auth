import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupInput {

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'The password of the user',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'The password confirmation of the user',
  })
  @IsString()
  @IsNotEmpty()
  passwordConfirmation: string;
}

export class SigninInput {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'The password of the user',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgetPasswordInput {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordInput {
  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'The new password of the user',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'The new password confirmation of the user',
  })
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

