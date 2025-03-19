import {
  Injectable,
  BadRequestException,
  Res,
  UnauthorizedException,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { User, UserDocument } from './user.schema';
import {
  SignupInput,
  SigninInput,
  LoginStatusEnum,
  DoneResponse,
  ResetPasswordInput,
  ForgetPasswordInput
} from './user.types';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ms = require('ms');
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async signup(signupInput: SignupInput): Promise<DoneResponse> {
    const { email, password, passwordConfirmation } = signupInput;

    if (password !== passwordConfirmation) {
      throw new BadRequestException('Passwords do not match.');
    }

    const existingUser = await this.userModel.findOne({email});
    if (existingUser) {
      throw new BadRequestException('Email already exists.');
    }

    const newUser = new this.userModel({
      ...signupInput,
    });

    newUser.setPassword(password);
    await newUser.save();
    return {
          done: true,
          code: 'USER_CREATED',
          message: 'User created successfully.',
        };
  }

  async signin(
    signinInput: SigninInput,
    req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; email: string }> {
    const { email, password } = signinInput;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.validPassword(password)) {
      user.addLoginHistory({
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        status: LoginStatusEnum.FAILED,
      });
      throw new UnauthorizedException();
    }

    user.addLoginHistory({
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      status: LoginStatusEnum.SUCCESS,
    });
    const payload = { id: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('accessSecret'),
      expiresIn: this.configService.get<string>('accessExpiry'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('refreshSecret'),
      expiresIn: this.configService.get<string>('refreshExpiry'),
    });
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: ms(this.configService.get<string>('refreshExpiry')),
    });

    return {
      email: user.email,
      accessToken,
    };
  }

  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }


  async refreshToken(@Req() req: Request) {
    const refreshToken = req?.cookies?.jwt;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('refreshSecret'),
      });
      const accessToken = await this.jwtService.signAsync(
        {
          id: payload.id,
          username: payload.username,
          email: payload.email,
        },
        {
          secret: this.configService.get<string>('accessSecret'),
          expiresIn: this.configService.get<string>('accessExpiry'),
        },
      );
      return {
        accessToken,
      };
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException();
    }
  }

  async forgetPassword(
    forgetPasswordInput: ForgetPasswordInput,
  ): Promise<DoneResponse> {
    const { email } = forgetPasswordInput;
    const user = await this.userModel.findOne({ email });
  
    // Always return the same response, even if the user does not exist
    if (user) {
      const token = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = new Date(Date.now() + 3600000);
      await user.save();
  
      const resetLink = `${this.configService.get<string>('frontendUrl')}/reset-password/${token}`;
  
      const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
      ${resetLink}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`;
  
      await this.mailService.sendMail(email, 'Password Reset', text);
    }
  
    return {
      done: true,
      code: 'PASSWORD_RESET_SUCCESS',
      message: 'Password reset email sent if the email exists.',
    };
  }
  

  async resetPassword(token: string, resetPasswordInput: ResetPasswordInput) {
    const { password, passwordConfirmation } = resetPasswordInput;
    const user = await this.userModel.findOne({ resetPasswordToken: token });
    if (!user || user.resetPasswordExpires < new Date()) {
      throw new NotFoundException(
        'Password reset token is invalid or has expired.',
      );
    }
    if (password !== passwordConfirmation) {
      throw new BadRequestException('Passwords do not match.');
    }
    user.setPassword(password);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    return {
      done: true,
      code: 'PASSWORD_RESET_SUCCESS',
      message: 'Password reset successful.',
    };
  }


}
