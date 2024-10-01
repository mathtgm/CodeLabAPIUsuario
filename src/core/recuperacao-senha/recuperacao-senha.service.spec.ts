import { Test, TestingModule } from '@nestjs/testing';
import { RecuperacaoSenhaService } from './recuperacao-senha.service';
import { RecuperacaoSenha } from './entities/recuperacao-senha.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { ConfigService } from '@nestjs/config';

describe('RecuperacaoSenhaService', () => {
  let service: RecuperacaoSenhaService;
  let repository: Repository<RecuperacaoSenha>;
  let repositoryUsuario: Repository<Usuario>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecuperacaoSenhaService,
        {
          provide: getRepositoryToken(RecuperacaoSenha),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn()
          }
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            findOne: jest.fn()
          }
        },
        {
          provide: "MAIL_SERVICE",
          useValue: {
            emit: jest.fn(),
            "MAIL_SERVICE": jest.fn()
          }
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<RecuperacaoSenhaService>(RecuperacaoSenhaService);
    repository = module.get<Repository<RecuperacaoSenha>>(getRepositoryToken(RecuperacaoSenha));
    repositoryUsuario = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {

    let mockAlteracaoSenhaDTO = { email: 'email@email.com' };

    let mockAlteracaoSenha = { id: '1', email: 'email@email.com', dataCriacao: new Date() };

    const mockUsuario = {
      id: 1,
      nome: 'Teste',
      email: 'teste@teste.com',
      senha: '123456',
      ativo: true,
      admin: false,
      permissao: [],
    };

    it('cria uma solicitacao de alteracao de senha com um usuario existente', async () => {

      const spyRepositoryFindOneUsuario = jest
        .spyOn(repositoryUsuario, 'findOne').mockReturnValue(Promise.resolve(mockUsuario));

      const spyRepositoryDelete = jest
        .spyOn(repository, 'delete');

      const spyRepositoryCreate = jest
        .spyOn(repository, 'create').mockReturnValue(mockAlteracaoSenha);

      const spyRepositorySave = jest
        .spyOn(repository, 'save').mockReturnValue(Promise.resolve(mockAlteracaoSenha));

      await service.create(mockAlteracaoSenhaDTO);

      expect(spyRepositoryDelete).toHaveBeenCalledWith(mockAlteracaoSenhaDTO);
      expect(spyRepositoryCreate).toHaveBeenCalledWith(mockAlteracaoSenhaDTO);
      expect(spyRepositorySave).toHaveBeenCalledWith(mockAlteracaoSenha);
      expect(spyRepositoryCreate).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
      expect(spyRepositoryDelete).toHaveBeenCalled();
      expect(spyRepositoryFindOneUsuario).toHaveBeenCalled();
    });

    it('nao pdoe criar uma solicitacao de senha, pois nao encontra o email do usuario', async () => {

      const spyRepositoryFindOneUsuario = jest
        .spyOn(repositoryUsuario, 'findOne');

      const spyRepositoryDelete = jest
        .spyOn(repository, 'delete');

      const spyRepositoryCreate = jest
        .spyOn(repository, 'create');

      const spyRepositorySave = jest
        .spyOn(repository, 'save');

      await service.create(mockAlteracaoSenhaDTO);

      expect(spyRepositoryDelete).toHaveBeenCalledTimes(0);
      expect(spyRepositoryCreate).toHaveBeenCalledTimes(0);
      expect(spyRepositorySave).toHaveBeenCalledTimes(0);
      expect(spyRepositoryFindOneUsuario).toHaveBeenCalled();
    });

  });
});
