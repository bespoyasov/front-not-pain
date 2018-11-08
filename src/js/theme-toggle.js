(function(){
  // dark theme toggler
  const toggle = document.getElementById('toggle')

  toggle.addEventListener('change', () =>
    document.body.classList.toggle('dark'))


  const darkThemeQuery = '(prefers-color-scheme: dark)'
  if (window.matchMedia(darkThemeQuery).matches) toggle.click()

}());