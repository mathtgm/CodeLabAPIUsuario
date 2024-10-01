import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EMensagem } from '../../shared/enums/mensagem.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('realiza login', async () => {
      const mockLogin = {
        email: 'matht@gmail.com',
        senha: 'senha123'
      };

      const jwtToken = 'jwtToken'

      const spyServiceLogin = jest
        .spyOn(service, 'login')
        .mockReturnValue(Promise.resolve(jwtToken));

        const response = await controller.login(mockLogin);

        expect(spyServiceLogin).toHaveBeenCalledWith(mockLogin);
        expect(spyServiceLogin).toHaveBeenCalled();
        expect(response.data).toEqual(jwtToken);
        expect(response.message).toEqual(EMensagem.AutenticadoSucesso);
    });
  });
});
