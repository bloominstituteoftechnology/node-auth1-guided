# Web Auth I Guided Project Solution

Guided project solution for **Web Auth I** Module.

## Prerequisites

- [SQLite Studio](https://sqlitestudio.pl/index.rvt?act=download) installed.

## Starter Code

The [Starter Code](https://github.com/LambdaSchool/webauth-i-guided) for this project is configured to run the server by typing `yarn server` or `npm run server`. The server will restart automatically on changes.

## Introduce Module Challenge

## Introduce Authentication and Authorization

Open TK and provide an introduction to `Authentication` and `Authorization` and highlight the difference.

Cover things to consider when storing passwords.

- `hashing` vs `encrypting`.
- password strength.
- brut force attacks like `rainbow table`.

Introduce [OWASP Top 10](https://www.cloudflare.com/learning/security/threats/owasp-top-10/).

Introduce [Google 12 best practices for user account](https://cloud.google.com/blog/products/gcp/12-best-practices-for-user-account).

**time for a break? take it**

## Introduce Guided Project

- clone starter code and download all dependencies.
- run it and make a GET to `/` and a GET to `/api/users` to test it.

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

## Hash User Passwords

- make a POST to `/api/register` with

```json
{
  "username": "sam",
  "password": "pass"
}
```

- note the **password is stored as plain text**. Bad panda!

Let's fix that.

- introduce the library we'll use to hash passwords.
- add [bcryptjs](https://www.npmjs.com/package/bcryptjs) to the project.
- require `bcryptjs` at the top of `index.js`.

```js
// .. other requires
const cors = require('cors');
const bcrypt = require('bcryptjs');
```

- change the `POST /api/register` to this:

```js
server.post('/api/register', (req, res) => {
  let user = req.body;
  // generate hash from user's password
  // we'll do it synchronously, no sense on going async for this
  const hash = bcrypt.hashSync(user.password, 10); // 2 to the 10th rounds

  // override user.password with hash
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});
```

- call attention to the time it takes to register a user
- make a POST to `/api/register` with

```json
{
  "username": "frodo",
  "password": "pass"
}
```

- change the number of rounds to 16: `const hash = bcrypt.hashSync(user.password, 16);`
- make a POST to `/api/register` for _merry/pass_, note how much longer it takes now. That is how we add time to slow down attackers trying to pre-generate hashes.
- change it down to 8 to make it fast for the demo.
- explain that the resulting hash includes the number of rounds used to generate the hash.
- make a GET to `/api/users` and note that the hashes are different, even for the same password. The library takes care of that by adding a random string to the password before hashing. That random string is often called a `salt`.

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

## Validate Credentials on Login

- change the login to check the password.
- explain that the library will first hash the password guess and then compare the newly generated hash against the hash stored for the user in the database. It's magic!

```js
server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      // update the if condition to check that passwords match
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        // we will return 401 if the password or username are invalid
        // we don't want to let attackers know when they have a good username
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});
```

- test it with one invalid and valid credentials.

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

**time for a break? take it**

### You Do (estimated 10 minutes to complete)

Ask students to protect the `/api/users` endpoint so only authenticated users can access it.

Possible solution would be to write middleware:

```js
function restricted(req, res, next) {
  // to keep the endpoint as a get (we can't send information in the body en GET)
  // we'll read the username and password from headers
  // when testing the endpoint add these headers in Postman
  // students will learn how to send headers using axios in the JWT lecture, but
  // can be briefly explained if asked about it
  // axios.get('/api/users', { headers: { username: 'frodo', password: 'pass' }})
  const { username, password } = req.headers;

  if (username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          next();
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        res.status(500).json({ message: 'Unexpected error' });
      });
  } else {
    res.status(400).json({ message: 'No credentials provided' });
  }
}

// we can use it locally
server.get('/api/users', restricted, (req, res) => { //.. endpoint unchanged }
```

Another solution would be to change to a POST and read the credentials from the `body` of the request.

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

We don't have a way for the server to _"remember"_ that the user is logged in. We'll learn a way to do that in the `sessions` module.
