const checkSuperUser = async () => {
    const response = await fetch('/auth/superuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'email@do.usuario' }), // Substitua pelo email do usuário logado
    });
  
    const data = await response.json();
  
    if (data.isSuperUser) {
      // O usuário é um superusuário, faça o que for necessário
      // Exemplo: Renderize o componente <Fixit />
    } else {
      // O usuário não é um superusuário, talvez renderize uma mensagem ou oculte o componente
    }
  };
  
  // Chame a função quando necessário
  checkSuperUser();
  