import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { LoginStatusEnum } from './user.types';

export type UserDocument = User &
  Document & {
    setPassword: (password: string) => void;
    validPassword: (password: string) => boolean;
    addLoginHistory: (history: {
      userAgent: string;
      ip: string;
      status: LoginStatusEnum;
    }) => Promise<User>;
  };

export class LoginHistory {
  @Prop({ type: Date, default: Date.now })
  timeStamp: Date;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ enum: LoginStatusEnum, required: true })
  status: string;
}

@Schema({ timestamps: true })
export class User {

  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop({ type: [LoginHistory], default: [] })
  loginHistory: LoginHistory[];

  @Prop({ nullable: true, index: true })
  resetPasswordToken: string;

  @Prop({ nullable: true })
  resetPasswordExpires: Date;

  @Prop({ required: true })
  hash: string;

  @Prop({ required: true })
  salt: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.pre('save', function () {
  if (this?.loginHistory.length > 10) {
    this.loginHistory.shift();
  }
});

UserSchema.methods.setPassword = function (password: string): void {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex');
};

UserSchema.methods.validPassword = function (password: string): boolean {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex');
  return this.hash === hash;
};

UserSchema.methods.addLoginHistory = function ({
  userAgent,
  ip,
  status,
}: {
  userAgent: string;
  ip: string;
  status: LoginStatusEnum;
}): Promise<User> {
  this.loginHistory.push({ timestamp: new Date(), userAgent, ip, status });
  return this.save();
};
