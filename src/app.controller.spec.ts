import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Auth0UserinfoAdapter } from './infrastructure/external-services/auth0/auth0-userInfo.adapter';
import { HttpService } from '@nestjs/axios';
import { Auth0ManagementApiAdapter } from './infrastructure/external-services/auth0/auth0-managementapi.adapter';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        Auth0UserinfoAdapter,
        Auth0ManagementApiAdapter,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello("")).toEqual({ message: 'Hello World!' });
    });
  });
});
