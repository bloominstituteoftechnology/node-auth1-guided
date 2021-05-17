const usernameInput = document.querySelector('#usernameInput')
const passwordInput = document.querySelector('#passwordInput')
const registerBtn = document.querySelector('#registerBtn')
const loginBtn = document.querySelector('#loginBtn')

const handle = action => evt => {
  evt.preventDefault()
  const credentials = {
    username: usernameInput.value,
    password: passwordInput.value,
  }
  fetch(`/api/auth/${action}`, {
    method: 'POST',
    mode: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials),
  })
    .then(res => {
      return res.json()
    })
    .then(data => {
      console.log(data)
    })
    .catch(err => {
      debugger
    })
}

registerBtn.addEventListener('click', handle('register'))
loginBtn.addEventListener('click', handle('login'))
