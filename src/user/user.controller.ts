import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  SignupInput,
  SigninInput,
} from './user.types';
import { AuthGuard } from './guards/auth.guard';
// import { DoneResponse } from '../common';
import { User } from './user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signup(@Body() signupInput: SignupInput) {
    return this.userService.signup(signupInput);
  }

  @Post('login')
  signin(
    @Body() signinInput: SigninInput,
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<{ accessToken: string; email: string }> {
    return this.userService.signin(signinInput, req, res);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req): Promise<User> {
    const user = req.user;
    return this.userService.getProfile(user.id);
  }

  @Post('refresh-token')
  refreshToken(@Req() req): Promise<{ accessToken: string }> {
    return this.userService.refreshToken(req);
  }


  // @Post('forget-password')
  // forgetPassword(
  //   @Body() forgetPasswordInput: ForgetPasswordInput,
  // ): Promise<DoneResponse> {
  //   return this.userService.forgetPassword(forgetPasswordInput);
  // }

  // @Post('reset-password/:token')
  // resetPassword(
  //   @Param('token') token: string,
  //   @Body() resetPasswordInput: ResetPasswordInput,
  // ): Promise<DoneResponse> {
  //   return this.userService.resetPassword(token, resetPasswordInput);
  // }
}
