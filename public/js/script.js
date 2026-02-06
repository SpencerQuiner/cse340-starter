document.addEventListener('DOMContentLoaded', () => {
  const showPasswordCheckbox = document.getElementById('showPassword')
  const passwordInput = document.getElementById('account_password')

  if(showPasswordCheckbox && passwordInput) {
    showPasswordCheckbox.addEventListener('change', () => {
      passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password'
    })
  }
})