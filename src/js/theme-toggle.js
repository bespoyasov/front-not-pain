(function(){
  // dark theme toggler
  const toggleInputNode = document.getElementById('night')
  
  toggleInputNode.addEventListener('change', () =>
    document.body.classList.toggle('dark'))

}())