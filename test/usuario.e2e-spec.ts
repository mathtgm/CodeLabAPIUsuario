import { fakerPT_BR as faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Usuario } from '../src/core/usuario/entities/usuario.entity';
import { EMensagem } from '../src/shared/enums/mensagem.enum';
import { ResponseExceptionsFilter } from '../src/shared/filters/response-exception.filter';
import { ResponseTransformInterceptor } from '../src/shared/interceptors/response-transform.interceptor';
import { UsuarioPermissao } from '../src/core/usuario/entities/usuario-permissao.entity';

describe('Usuario (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<Usuario>;
  let repositoryUsuarioPermissao: Repository<UsuarioPermissao>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    app.useGlobalFilters(new ResponseExceptionsFilter());

    await app.startAllMicroservices();
    await app.init();

    repository = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    repositoryUsuarioPermissao = app.get<Repository<UsuarioPermissao>>(getRepositoryToken(UsuarioPermissao));
  });

  afterAll(async () => {
    await repositoryUsuarioPermissao.delete({});
    await repository.delete({});
    await app.close();
  });

  describe('CRUD /usuario', () => {
    let idUsuario: number;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const usuario = {
      nome: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      senha: faker.internet.password(),
      ativo: true,
      admin: false,
      permissao: []
    };

    it('criar um novo usuario', async () => {
      const resp = await request(app.getHttpServer())
        .post('')
        .send(usuario);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.SalvoSucesso);
      expect(resp.body.data).toHaveProperty('id');

      idUsuario = resp.body.data.id;
    });

    it('criar um novo usuario usando o mesmo email', async () => {
      const resp = await request(app.getHttpServer())
        .post('')
        .send(usuario);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.ImpossivelCadastrar);
      expect(resp.body.data).toBe(null);
    });

    it('carregar o usuario criado', async () => {
      const resp = await request(app.getHttpServer()).get(`/${+idUsuario}`);

      expect(resp).toBeDefined();
      expect(resp.body.mensagem).toBe(undefined);
      expect(resp.body.data.email).toBe(usuario.email);
      expect(resp.body.data.ativo).toBe(usuario.ativo);
      expect(resp.body.data.admin).toBe(usuario.admin);
      expect(resp.body.data.password).toBe(undefined);
      expect(resp.body.data).toHaveProperty('permissao');
    });

    it('alterar um usuario criado', async () => {
      const usuarioAlterado = Object.assign(usuario, { id: +idUsuario, admin: true });

      const resp = await request(app.getHttpServer())
        .patch(`/${+idUsuario}`)
        .send(usuarioAlterado);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.AtualizadoSucesso);
      expect(resp.body.data.admin).toBe(true);
    });

    it('lançar uma exceção ao alterar um usuario criado passando um id diferente', async () => {
      const usuarioAlterado = Object.assign(usuario, { id: +idUsuario, admin: true });

      const resp = await request(app.getHttpServer())
        .patch(`/999`)
        .send(usuarioAlterado);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IDsDiferentes);
      expect(resp.body.data).toBe(null);
    });

    it('lançar uma exeção ao alterar um usuario utilizando um email já utilizado', async () => {
      const firstNameTemp = faker.person.firstName();
      const lastNameTemp = faker.person.lastName();

      const usuarioTemp = {
        nome: `${firstNameTemp} ${lastNameTemp}`,
        email: faker.internet
          .email({ firstName: firstNameTemp, lastName: lastNameTemp })
          .toLowerCase(),
        senha: faker.internet.password(),
        ativo: true,
        admin: false,
        permissao: []
      };

      const teste = await request(app.getHttpServer()).post('').send(usuarioTemp);
 
      const usuarioAlterado = Object.assign(usuario, {
        email: usuarioTemp.email,
      });

      const resp = await request(app.getHttpServer())
        .patch(`/${+idUsuario}`)
        .send(usuarioAlterado);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.ImpossivelAlterar);
      expect(resp.body.data).toBe(null);
    });

    it('desativar um usuario cadastrado', async () => {
      const resp = await request(app.getHttpServer()).delete(`/${+idUsuario}`);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.DesativadoSucesso);
      expect(resp.body.data).toBe(false);
    });

    it('lançar uma exceção ao desativar um usuario não cadastrado', async () => {
      const resp = await request(app.getHttpServer()).delete(`/999`);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.ImpossivelDesativar);
      expect(resp.body.data).toBe(null);
    });
  });

  describe('findAll /usuario', () => {
    let usuarioBanco;
    const filter = {column: 'id', sort: 'asc'}

    it('obter todos os registros da página 1', async () => {
      for (let i = 0; i < 10; i++) {
        const firstNameTemp = faker.person.firstName();
        const lastNameTemp = faker.person.lastName();

        const usuarioTemp = {
          nome: `${firstNameTemp} ${lastNameTemp}`,
          email: faker.internet
            .email({ firstName: firstNameTemp, lastName: lastNameTemp })
            .toLowerCase(),
          senha: faker.internet.password(),
          ativo: true,
          admin: false,
          permissao: []
        };

        let usuarioSalvo = await request(app.getHttpServer()).post('').send(usuarioTemp);
        usuarioBanco = usuarioSalvo.body.data;
      }

      const resp = await request(app.getHttpServer()).get(`/0/10/${JSON.stringify(filter)}`);

      expect(resp).toBeDefined();
      expect(resp.body.mensagem).toBe(undefined);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('obter todos os registros da página 2', async () => {
      
      const resp = await request(app.getHttpServer()).get(`/1/10/${JSON.stringify(filter)}`);

      expect(resp).toBeDefined();
      expect(resp.body.mensagem).toBe(undefined);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('obtem todos os usuários pelo nome', async () => {
      const resp = await request(app.getHttpServer()).get(`/0/5/${JSON.stringify(filter)}`).query({filter: JSON.stringify({column: 'nome', value: usuarioBanco.nome})});

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe('');
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });
    
    it('obtem todos os usuários pelo id', async () => {
      const resp = await request(app.getHttpServer()).get(`/0/5/${JSON.stringify(filter)}`).query({filter: JSON.stringify({column: 'id', value: usuarioBanco.id})});

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe('');
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });
    
    it('obtem todos os usuários administradores', async () => {
      const resp = await request(app.getHttpServer()).get(`/0/5/${JSON.stringify(filter)}`).query({filter: JSON.stringify({column: 'admin', value: true})});;

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe('');
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });

  });
});
