import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Usuario } from '../usuario/entities/usuario.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { KongService } from './kong.service';
import { JwtService } from '@nestjs/jwt';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let repositoryUsuario: Repository<Usuario>;
  let jwtService: JwtService;
  let kongService: KongService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, ConfigService,
        {
          provide: KongService,
          useValue: {
            getCredential: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn()
          }
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repositoryUsuario = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    jwtService = module.get<JwtService>(JwtService);
    kongService = module.get<KongService>(KongService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {

    let mockUsuario = {
      id: 1,
      nome: 'Teste',
      email: 'email@email.com',
      senha: bcrypt.hashSync('senha123'),
      ativo: true,
      admin: false,
      permissao: [
        {
          id: 1,
          idUsuario: 1,
          modulo: 1,
          usuario: null
        }
      ],
    };

    let mockLoginDTO = {
      email: 'email@email.com',
      senha: 'senha123'
    };

    it('realiza o login do usuario', async () => {
      let spyRepositoryFind = jest
        .spyOn(repositoryUsuario, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuario));

      let spyJwtSign = jest
        .spyOn(jwtService, 'sign')
        .mockReturnValue('tokenJwt');

      jest.spyOn(kongService, 'getCredential').mockReturnValue(Promise.resolve({id: 'idKong', key: 'keyKong'}));

      const response = await service.login(mockLoginDTO);

      expect(spyRepositoryFind).toHaveBeenCalled();
      expect(spyJwtSign).toHaveBeenCalled();
      expect(response.length).toBeGreaterThan(0);
    });

    it('lança exceção, pois usuario ou senha não foram encontrados', async () => {

      let mockUsuario = {
        id: 0,
        nome: '',
        email: '',
        senha: '',
        ativo: undefined,
        admin: undefined,
        permissao: [],
      };

      const spyRepositoryFind = jest
        .spyOn(repositoryUsuario, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuario));

      try {
        await service.login(mockLoginDTO);
      } catch (error) {
        expect(spyRepositoryFind).toHaveBeenCalled();
        expect(error.message).toBe(EMensagem.UsuarioSenhaInvalido)
      }
    });

  });
});
