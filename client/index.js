/* eslint-disable no-debugger */
const usernameInput = document.querySelector('#usernameInput')
const passwordInput = document.querySelector('#passwordInput')
const registerBtn = document.querySelector('#registerBtn')
const loginBtn = document.querySelector('#loginBtn')
const logoutBtn = document.querySelector('#logoutBtn')
const message = document.querySelector('#message')
const fetchUsersBtn = document.querySelector('#fetchUsers')
const userListDOM = document.querySelector('#users')

console.log('document.cookie:', document.cookie)

const handle = action => evt => {
  evt.preventDefault()
  message.textContent = ''
  userListDOM.textContent = ''
  const credentials = {
    username: usernameInput.value,
    password: passwordInput.value,
  }
  fetch(`/api/auth/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
    .then(res => res.json())
    .then(data => { console.log(data); message.textContent = data.message })
    .catch(err => { message.textContent = err.message; debugger })
}

const logout = evt => {
  evt.preventDefault()
  message.textContent = ''
  userListDOM.textContent = ''
  fetch(`/api/auth/logout`)
    .then(res => res.json())
    .then(data => { console.log(data); message.textContent = data.message })
    .catch(err => { message.textContent = err.message; debugger })
}

const fetchUsers = evt => {
  evt.preventDefault()
  message.textContent = ''
  userListDOM.textContent = ''
  let status
  fetch(`/api/users`)
    .then(res => {
      status = res.status
      return res.json()
    })
    .then(body => {
      if (status == 200) {
        message.textContent = 'Here are the users:'
        body.forEach(u => {
          const li = document.createElement('li')
          li.textContent = u.username
          userListDOM.append(li)
        })
      } else {
        throw new Error(body.message)
      }
    })
    .catch(err => {
      message.textContent = err.message
    })
}

registerBtn.addEventListener('click', handle('register'))
loginBtn.addEventListener('click', handle('login'))
logoutBtn.addEventListener('click', logout)
fetchUsersBtn.addEventListener('click', fetchUsers)
