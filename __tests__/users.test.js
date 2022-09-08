const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const mockUser = {
  email: 'testing1@example',
  password: 'testing321'
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...mockUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};


describe('users routes testing', () => {
  beforeEach(() => {
    return setup(pool);
  });

  afterAll(() => {
    pool.end();
  });

  it('creates a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(mockUser);
    const { email } = mockUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      email,
    });
  });

  it('signs in existing user', async () => {
    await UserService.create(mockUser);
    const { email, password } = mockUser;
    const res = await request(app).post('/api/v1/users/sessions').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Successfully signed in!' });
  });

  it('returns an authenticated user', async () => {
    const [agent, user] = await registerAndLogin();

    const mySession = await agent.get('/api/v1/users/me');

    expect(mySession.body).toEqual({
      ...user,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });

  it('DELETE /sessions will delete the user session', async () => {
    const [agent] = await registerAndLogin();
    const resp = await agent.delete('/api/v1/users/sessions');
    expect(resp.status).toBe(204);
  });
  
});
