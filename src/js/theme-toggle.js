(function(){
  // dark theme toggler
  const toggleInput = document.getElementById('night')
  
  toggleInput.addEventListener('change', () =>
    document.body.classList.toggle('dark'))

}())