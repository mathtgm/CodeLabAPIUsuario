import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { Usuario } from './entities/usuario.entity';
import { UsuarioService } from './usuario.service';
import { UsuarioPermissao } from './entities/usuario-permissao.entity';
import { RecuperacaoSenha } from '../recuperacao-senha/entities/recuperacao-senha.entity';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let repository: Repository<Usuario>;
  let repositoryUsuarioPermissao: Repository<UsuarioPermissao>;
  let repositoryRecuperacaoSenha: Repository<RecuperacaoSenha>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            save: jest.fn(),
            delete: jest.fn()
          },
        },
        {
          provide: getRepositoryToken(UsuarioPermissao),
          useValue: {
            delete: jest.fn()
          },
        },
        {
          provide: getRepositoryToken(RecuperacaoSenha),
          useValue: {
            findOne: jest.fn(),
            delete: jest.fn()
          },
        }
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    repository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    repositoryUsuarioPermissao = module.get<Repository<UsuarioPermissao>>(getRepositoryToken(UsuarioPermissao));
    repositoryRecuperacaoSenha = module.get<Repository<RecuperacaoSenha>>(getRepositoryToken(RecuperacaoSenha));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('criar um novo usuário', async () => {
      const createUsuarioDto = {
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const mockUsuario = Object.assign(createUsuarioDto, { id: 1 });

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockUsuario));

      const response = await service.create(createUsuarioDto);

      expect(response).toEqual(mockUsuario);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar uma exceção ao repetir um email já cadastrado, quando criar um novo usuario', async () => {
      const mockUsuario = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuario));

      try {
        await service.create(mockUsuario);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.ImpossivelCadastrar);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('findAll', () => {

    const mockUsuarioLista = [
      {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      },
    ];

    const mockFilterOrder: IFindAllOrder =
    {
      column: 'nome',
      sort: 'asc'
    };

    it('obter uma listagem de usuários', async () => {
      const spyRepositoryFind = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockUsuarioLista, 1]));

      const response = await service.findAll(0, 10, mockFilterOrder);

      expect(response.data).toEqual(mockUsuarioLista);
      expect(spyRepositoryFind).toHaveBeenCalled();
    });

    it('obter lista de usuário filtrando por id', async () => {

      const mockFilter: IFindAllFilter[] = [
        {
          column: 'id',
          value: 1
        }
      ];

      const spyRepositoryFind = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockUsuarioLista, 1]));

      const response = await service.findAll(0, 10, mockFilterOrder, mockFilter);

      expect(response.data).toEqual(mockUsuarioLista);
      expect(spyRepositoryFind).toHaveBeenCalled();
    });

    it('obter lista de usuário filtrando por nome', async () => {

      const mockFilter: IFindAllFilter[] = [
        {
          column: 'nome',
          value: 'Teste'
        }
      ];

      const spyRepositoryFind = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockUsuarioLista, 1]));

      const response = await service.findAll(0, 10, mockFilterOrder, mockFilter);

      expect(response.data).toEqual(mockUsuarioLista);
      expect(spyRepositoryFind).toHaveBeenCalled();
    });
    
    it('obter lista de usuário ativos', async () => {

      const mockFilter: IFindAllFilter[] = [
        {
          column: 'ativo',
          value: true
        }
      ];

      const spyRepositoryFind = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockUsuarioLista, 1]));

      const response = await service.findAll(0, 10, mockFilterOrder, mockFilter);

      expect(response.data).toEqual(mockUsuarioLista);
      expect(spyRepositoryFind).toHaveBeenCalled();
    });


    it('obter lista de usuário filtrando por nome', async () => {

      const mockFilter: IFindAllFilter[] = [
        {
          column: 'nome',
          value: 'Teste'
        }
      ];

      const spyRepositoryFind = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockUsuarioLista, 1]));

      const response = await service.findAll(0, 10, mockFilterOrder, mockFilter);

      expect(response.data).toEqual(mockUsuarioLista);
      expect(spyRepositoryFind).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('obter um usuário', async () => {
      const mockUsuario = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuario));

      const response = await service.findOne(1);

      expect(response).toEqual(mockUsuario);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um usuário', async () => {
      const updateUsuarioDto = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [ {
          id: 1,
          modulo: 1,
          idUsuario: 1,
          usuario: undefined
        } ],
      };

      const mockUsuario = Object.assign(updateUsuarioDto, {});

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuario));

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockUsuario));

      const response = await service.update(1, updateUsuarioDto);

      expect(response).toEqual(mockUsuario);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar uma exceção ao enviar ids diferentes quando alterar um usuário', async () => {
      const updateUsuarioDto = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      try {
        await service.update(999, updateUsuarioDto);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.IDsDiferentes);
      }
    });

    it('lançar uma exceção ao enviar um email previamente cadastrado quando alterar um usuário', async () => {
      const createUsuarioDto = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const mockUsuarioFindOne = {
        id: 2,
        nome: 'Teste 2',
        email: 'teste2@teste2.com',
        senha: 'abcdef',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuarioFindOne));

      try {
        await service.update(1, createUsuarioDto);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.ImpossivelAlterar);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('unactivate', () => {
    it('desativar um usuário', async () => {
      const mockUsuarioFindOne = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuarioFindOne) as any);

      const mockUsuarioSave = Object.assign(mockUsuarioFindOne, {
        ativo: false,
      });

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockUsuarioSave) as any);

      const response = await service.unactivate(1);

      expect(response).toEqual(false);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao não encontrar o usuario usando o id quando alterar um usuario', async () => {
      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(null) as any);

      try {
        await service.unactivate(1);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.ImpossivelDesativar);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('findOneGrpc', () => {
    it('obter um usuário', async () => {
      const mockUsuario = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuario));

      const response = await service.findOneGrpc(1);

      expect(response).toEqual(mockUsuario);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

    it('retorna nenhum usuario', async () => {

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(null));

      const response = await service.findOneGrpc(1);

      expect(response).toEqual({});
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('alterarSenha', () => {

    const mockUsuario = {
      id: 1,
      nome: 'Teste',
      email: 'teste@teste.com',
      senha: '123456',
      ativo: true,
      admin: false,
      permissao: [],
    };

    const mockAlterarSenha = {
      id: '12345ABC',
      email: 'email@email.com',
      dataCriacao: new Date()
    };

    const mockAlterarSenhaDataCriacaoAntiga = {
      id: '12345ABC',
      email: 'email@email.com',
      dataCriacao: new Date('1995-12-17T03:24:00')      
    };

    const mockAlterarSenhaDTO = {
      email: 'email@email.com',
      senha: 'senha123',
      token: 'toekn123456789ABC'
    };

    it('alterar senha de um usuario', async () => {
      

      const spyRepositoryRecuperacaoSenhaFindOne = jest
        .spyOn(repositoryRecuperacaoSenha, 'findOne')
        .mockReturnValue(Promise.resolve(mockAlterarSenha));

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuario) as any);

      const spyRepositorySave = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuario) as any);

      const spyRepositoryRecuperacaoSenhaDelete = jest
        .spyOn(repositoryRecuperacaoSenha, 'delete')
        .mockReturnValue(Promise.resolve({ raw: '' }));

      const response = await service.alterarSenha(mockAlterarSenhaDTO);

      expect(response).toEqual(true);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
      expect(spyRepositoryRecuperacaoSenhaFindOne).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
      expect(spyRepositoryRecuperacaoSenhaDelete).toHaveBeenCalled();
    });

    it('lançar erro ao não encontrar o token', async () => {
      const spyRepositoryRecuperacaoSenhaFindOne = jest
        .spyOn(repositoryRecuperacaoSenha, 'findOne')
        .mockReturnValue(Promise.resolve(null));

      try {
        const response = await service.alterarSenha(mockAlterarSenhaDTO);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.ImpossivelAlterar);
        expect(spyRepositoryRecuperacaoSenhaFindOne).toHaveBeenCalled();
      }
    }); 

    it('lançar erro ao passar o tempo de alteracao para alterar a senha', async () => {
      const spyRepositoryRecuperacaoSenhaFindOne = jest
        .spyOn(repositoryRecuperacaoSenha, 'findOne')
        .mockReturnValue(Promise.resolve(mockAlterarSenhaDataCriacaoAntiga));


      try {
        const response = await service.alterarSenha(mockAlterarSenhaDTO);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.TokenInvalido);
        expect(spyRepositoryRecuperacaoSenhaFindOne).toHaveBeenCalled();
      }
    }); 
  });


});
