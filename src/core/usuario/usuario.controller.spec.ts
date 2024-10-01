import { Test, TestingModule } from '@nestjs/testing';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

describe('UsuarioController', () => {
  let controller: UsuarioController;
  let service: UsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            unactivate: jest.fn(),
            findOneGrpc: jest.fn(),
            alterarSenha: jest.fn()
          },
        },
      ],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
    service = module.get<UsuarioService>(UsuarioService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('criar um novo usuário', async () => {
      const createUsuarioDto = {
        nome: 'Teste',
        email: 'teste@teste.com.br',
        senha: '12345678',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const mockUsuario = Object.assign(createUsuarioDto, { id: 1 });

      const spyServiceCreate = jest
        .spyOn(service, 'create')
        .mockReturnValue(Promise.resolve(mockUsuario));

      const response = await controller.create(createUsuarioDto);

      expect(spyServiceCreate).toHaveBeenCalledWith(createUsuarioDto);
      expect(response.data).toEqual(mockUsuario);
      expect(response.message).toBe(EMensagem.SalvoSucesso);
    });
  });

  describe('findAll', () => {

    const mockListaUsuarios = [
      {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com.br',
        senha: '12345678',
        ativo: true,
        admin: false,
        permissao: [],
      },
    ];

    const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

    it('obter uma listagem de usuários', async () => {

      const mockFilter = { column: '', value: '' }

      const spyServicefindAll = jest
        .spyOn(service, 'findAll')
        .mockReturnValue(Promise.resolve({ data: mockListaUsuarios, count: 1, message: '' }));

      const response = await controller.findAll(0, 10, mockOrderFilter, mockFilter);

      expect(spyServicefindAll).toHaveBeenCalledWith(0, 10, mockOrderFilter, mockFilter);
      expect(response.data).toEqual(mockListaUsuarios);
      expect(response.message).toBe('');
    });

    it('obter uma listagem por id', async () => {

      const mockFilter = { column: 'id', value: 1 }

      const spyServicefindAll = jest
        .spyOn(service, 'findAll')
        .mockReturnValue(Promise.resolve({ data: mockListaUsuarios, count: 1, message: '' }));

      const response = await controller.findAll(0, 10, mockOrderFilter, mockFilter);

      expect(spyServicefindAll).toHaveBeenCalledWith(0, 10, mockOrderFilter, mockFilter);
      expect(response.data).toEqual(mockListaUsuarios);
      expect(response.message).toBe('');
    });
  });

  describe('findOne', () => {
    it('obter um usuário', async () => {
      const mockUsuario = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com.br',
        senha: '12345678',
        ativo: true,
        admin: false,
        permissao: [],
      };
      const spyServiceFindOne = jest
        .spyOn(service, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuario) as any);

      const response = await controller.findOne(1);

      expect(spyServiceFindOne).toHaveBeenCalledWith(1);
      expect(response.data).toEqual(mockUsuario);
      expect(response.message).toBe('');
    });
  });

  describe('update', () => {
    it('atualizar um usuário', async () => {
      const mockUsuario = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com.br',
        senha: '12345678',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockReturnValue(Promise.resolve(mockUsuario) as any);

      const response = await controller.update(1, mockUsuario);

      expect(spyServiceUpdate).toHaveBeenCalled();
      expect(response.data).toEqual(mockUsuario);
      expect(response.message).toBe(EMensagem.AtualizadoSucesso);
    });
  });

  describe('unactivage', () => {
    it('desativar um usuário', async () => {
      const spyServiceUnactivate = jest
        .spyOn(service, 'unactivate')
        .mockReturnValue(Promise.resolve(false) as any);

      const response = await controller.unactivate(1);

      expect(spyServiceUnactivate).toHaveBeenCalled();
      expect(response.data).toEqual(false);
      expect(response.message).toBe(EMensagem.DesativadoSucesso);
    });
  });
  
  describe('alterar-senha', () => {

    const mockAlterarSenhaDTO = {
      email: 'email@email.com',
      senha: 'senha123',
      token: 'toekn123456789ABC'
    };

    it('envia solicitacao de alteracao de senha', async () => {
      const spyServiceUnactivate = jest
        .spyOn(service, 'alterarSenha')
        .mockReturnValue(Promise.resolve(true) as any);

      const response = await controller.alterarSenha(mockAlterarSenhaDTO);

      expect(spyServiceUnactivate).toHaveBeenCalled();
      expect(response.data).toEqual(true);
      expect(response.message).toBe(EMensagem.AtualizadoSucesso);
    });
  });
  
  describe('findOneGrpc', () => {

    const mockUsuario = {
      id: 1,
      nome: 'Teste',
      email: 'teste@teste.com.br',
      senha: '12345678',
      ativo: true,
      admin: false,
      permissao: [],
    };

    it('retorna um usuario via grpc', async () => {
      const spyServiceUnactivate = jest
        .spyOn(service, 'findOneGrpc')
        .mockReturnValue(Promise.resolve(mockUsuario));

      const response = await controller.findOneGrpc({id: '1'});

      expect(spyServiceUnactivate).toHaveBeenCalled();
      expect(response).toEqual(mockUsuario);
    });
  });

});
