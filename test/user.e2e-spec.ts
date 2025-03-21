import { MongoMemoryServer } from 'mongodb-memory-server';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../src/user/user.service';

let mongod: MongoMemoryServer;
let app: INestApplication;
let userService: UserService;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    process.env.mongoUrl = uri;
    process.env.NODE_ENV = 'test';

    const { default: bootstrap } = await import('../src/main');
    app = await bootstrap({ logger: ['error'] });
    await app.init();
    userService = app.get<UserService>(UserService);
});

afterAll(async () => {
    await userService['userModel'].deleteMany({});
    await app.close();
    if (mongod) await mongod.stop();
});

jest.setTimeout(30000);

describe('Auth Module (e2e)', () => {
    it('should sign up and then log in a user', async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'test@example.com',
          name: 'test',
          password: 'P@ssw0rd',
          passwordConfirmation: 'P@ssw0rd',
        })
        .expect(201);
  
      expect(signupResponse.body).toEqual({
        code: 'USER_CREATED',
        done: true,
        message: 'User created successfully.',
      });
  
      const loginResponse = await request(app.getHttpServer())
        .post('/users/login')
        .send({ email: 'test@example.com', password: 'P@ssw0rd' })
        .expect(201);
  
      expect(loginResponse.body).toHaveProperty('accessToken');
    });
  
    it('should throw an error if the signup data is invalid', async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'test@example.com',
          name: 'test',
          password: 'ssw0rd', 
          passwordConfirmation: 'P@ssw0rd',
        })
        .expect(400);
  
      expect(signupResponse.body.message).toHaveLength(1);
    });
  
    it('should not allow duplicate sign up with the same email', async () => {

      await request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'duplicate@example.com',
          name: 'duplicate',
          password: 'P@ssw0rd',
          passwordConfirmation: 'P@ssw0rd',
        })
        .expect(201);
  

      const duplicateResponse = await request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'duplicate@example.com',
          name: 'duplicate',
          password: 'P@ssw0rd',
          passwordConfirmation: 'P@ssw0rd',
        })
        .expect(400); 
  
      expect(duplicateResponse.body.message).toContain('Email already exists');
    });
  
    it('should return error when logging in with wrong password', async () => {

      await request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'wrongpassword@example.com',
          name: 'wrongpassword',
          password: 'P@ssw0rd',
          passwordConfirmation: 'P@ssw0rd',
        })
        .expect(201);
  

      const loginResponse = await request(app.getHttpServer())
        .post('/users/login')
        .send({ email: 'wrongpassword@example.com', password: 'WrongPassword' })
        .expect(401);
  
      expect(loginResponse.body.message).toEqual('Unauthorized');
    });
  
    it('should return error when logging in with unregistered email', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/users/login')
        .send({ email: 'nonexistent@example.com', password: 'P@ssw0rd' })
        .expect(401);
  
      expect(loginResponse.body.message).toEqual('Unauthorized');
    });
  
    it('should validate missing required fields on signup', async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/users/signup')
        .send({ email: 'incomplete@example.com' }) 
        .expect(400);
  

      expect(Array.isArray(signupResponse.body.message)).toBeTruthy();
      expect(signupResponse.body.message.length).toBeGreaterThan(0);
    });
  });
  
