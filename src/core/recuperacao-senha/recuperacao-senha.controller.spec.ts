import { Test, TestingModule } from '@nestjs/testing';
import { RecuperacaoSenhaController } from './recuperacao-senha.controller';
import { RecuperacaoSenhaService } from './recuperacao-senha.service';
import { EMensagem } from '../../shared/enums/mensagem.enum';

describe('RecuperacaoSenhaController', () => {
  let controller: RecuperacaoSenhaController;
  let service: RecuperacaoSenhaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecuperacaoSenhaController],
      providers: [
        {
          provide: RecuperacaoSenhaService, 
          useValue: {
            create: jest.fn(),
            "MAIL_SERVICE": jest.fn()
          }
        },
      ],
    }).compile();

    controller = module.get<RecuperacaoSenhaController>(RecuperacaoSenhaController);
    service = module.get<RecuperacaoSenhaService>(RecuperacaoSenhaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {

    let mockAlteracaoSenhaDTO = { email: 'email@email.com'}

    it('solicita uma alteracao de senha', async () => {

      const spyServiceCreate = jest
        .spyOn(service, 'create');

      const response = await controller.create(mockAlteracaoSenhaDTO);

      expect(spyServiceCreate).toHaveBeenCalledWith(mockAlteracaoSenhaDTO);
      expect(spyServiceCreate).toHaveBeenCalled();
      expect(response.data).toEqual(true);
      expect(response.message).toEqual(EMensagem.VerifiqueEnderecoEmailInformado);
    });
  });
});
