/* ===== MENU E SUBMENUS (mesmo esquema do exemplo da aula) ===== */
const btnSobre = document.getElementById('btn-sobre');
const menuVerticalSobre = document.getElementById('menu-vertical-sobre');
const btnContato = document.getElementById('btn-contato');
const menuVerticalContato = document.getElementById('menu-vertical-contato');

btnSobre.addEventListener('click', function (event) {
  abreMenu(event, menuVerticalSobre, menuVerticalContato);
});
btnContato.addEventListener('click', function (event) {
  abreMenu(event, menuVerticalContato, menuVerticalSobre);
});

// Abre/fecha o menu clicado e fecha o outro
function abreMenu(event, menu, outro) {
  event.preventDefault();
  outro.classList.remove('active');
  fechaAbas(outro);
  fechaAbas(menu);
  menu.classList.toggle('active');
}

function fechaMenu(event, menu, btn) {
  if (!menu.contains(event.target) && event.target !== btn) {
    menu.classList.remove('active');
    fechaAbas(menu);
  }
}

/* ===== ABINHAS LATERAIS (Empresa, Clientes, Telefones) ===== */
// Fecha as abinhas abertas dentro de um menu
function fechaAbas(menu) {
  menu.querySelectorAll('.aba-lateral.active').forEach(function (aba) {
    aba.classList.remove('active');
    aba.previousElementSibling.setAttribute('aria-expanded', 'false');
  });
}

document.querySelectorAll('.item-aba').forEach(function (item) {
  item.addEventListener('click', function (event) {
    event.preventDefault();
    const aba = item.nextElementSibling;
    const abrir = !aba.classList.contains('active');
    fechaAbas(item.closest('.menu-vertical'));
    if (abrir) {
      aba.classList.add('active');
      item.setAttribute('aria-expanded', 'true');
    }
  });
});

// Fecha o menu se o usuário clicar fora dele
document.addEventListener('click', function (event) {
  fechaMenu(event, menuVerticalSobre, btnSobre);
  fechaMenu(event, menuVerticalContato, btnContato);
});

/* ===== DATA ATUAL NO RODAPÉ ===== */
document.getElementById('data-atual').textContent =
  new Date().toLocaleDateString('pt-BR');

/* ===== FUNÇÕES AUXILIARES ===== */
function pegarUsuarios() {
  return JSON.parse(localStorage.getItem('usuarios')) || [];
}
function pegarAgendamentos() {
  return JSON.parse(localStorage.getItem('agendamentos')) || [];
}
function mostrarMensagem(texto, ok) {
  const msg = document.getElementById('mensagem');
  msg.textContent = texto;
  msg.classList.toggle('ok', Boolean(ok));
}

/* ===== CPF ===== */
// Confere os dois dígitos verificadores (cálculo oficial do CPF)
function cpfValido(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (let tam = 9; tam <= 10; tam++) {
    let soma = 0;
    for (let i = 0; i < tam; i++) soma += Number(cpf[i]) * (tam + 1 - i);
    const dv = (soma * 10) % 11 % 10;
    if (dv !== Number(cpf[tam])) return false;
  }
  return true;
}

// Máscara 000.000.000-00 enquanto digita
const campoCpf = document.getElementById('cpf');
if (campoCpf) {
  campoCpf.addEventListener('input', function () {
    const d = campoCpf.value.replace(/\D/g, '').slice(0, 11);
    campoCpf.value = d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  });
}

/* ===== CADASTRO ===== */
const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
  formCadastro.addEventListener('submit', function (event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const cpf = document.getElementById('cpf').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmar = document.getElementById('confirmar').value;

    if (!cpfValido(cpf)) {
      mostrarMensagem('CPF inválido. Confira os números digitados.');
      return;
    }
    if (senha !== confirmar) {
      mostrarMensagem('As senhas não são iguais.');
      return;
    }
    const usuarios = pegarUsuarios();
    if (usuarios.some(u => u.email === email)) {
      mostrarMensagem('Este email já está cadastrado. Use outro ou faça login.');
      return;
    }
    if (usuarios.some(u => u.cpf === cpf)) {
      mostrarMensagem('Este CPF já está cadastrado. Faça login.');
      return;
    }

    // 1) salva no navegador
    usuarios.push({ nome, email, cpf, endereco, senha });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // 2) baixa um .txt com os dados do cadastro
    const conteudo = 'Nome: ' + nome + '\nEmail: ' + email + '\nCPF: ' + cpf + '\nEndereço: ' + endereco + '\nSenha: ' + senha + '\n';
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([conteudo], { type: 'text/plain' }));
    link.download = 'cadastro_' + email.split('@')[0] + '.txt';
    link.click();

    // guarda email e senha só até a tela de login preencher os campos
    sessionStorage.setItem('ultimoCadastro', JSON.stringify({ email, senha }));

    mostrarMensagem('Cadastro feito! Indo para o login...', true);
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
  });
}

/* ===== LOGIN ===== */
const formLogin = document.getElementById('form-login');
if (formLogin) {
  // Veio do cadastro? Preenche os campos para entrar com um clique
  const recemCadastrado = JSON.parse(sessionStorage.getItem('ultimoCadastro'));
  if (recemCadastrado) {
    document.getElementById('email').value = recemCadastrado.email;
    document.getElementById('senha').value = recemCadastrado.senha;
    sessionStorage.removeItem('ultimoCadastro');
    mostrarMensagem('Cadastro feito! É só clicar em Entrar.', true);
    formLogin.querySelector('button[type="submit"]').focus();
  }
  formLogin.addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value;

    const usuario = pegarUsuarios().find(u => u.email === email);
    if (!usuario) {
      mostrarMensagem('Email não encontrado. Confira o email ou cadastre-se.');
    } else if (usuario.senha !== senha) {
      mostrarMensagem('Senha incorreta. Tente novamente.');
    } else {
      sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
      window.location.href = 'agendamento.html';
    }
  });
}

/* ===== ÁREA LOGADA: AGENDAMENTO ===== */
const formAgendamento = document.getElementById('form-agendamento');
if (formAgendamento) {
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  if (!usuario) {
    window.location.href = 'login.html'; // sem login, sem acesso
  } else {
    iniciarAgendamento(usuario);
  }
}

function iniciarAgendamento(usuario) {
  const selProf = document.getElementById('profissional');
  const inputData = document.getElementById('data');
  const selHorario = document.getElementById('horario');
  const horarios = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00'];

  document.getElementById('nome-usuario').textContent = usuario.nome.split(' ')[0];
  inputData.min = new Date().toISOString().split('T')[0]; // não permite datas passadas

  // Atualiza os horários livres (tira os já reservados)
  function atualizaHorarios() {
    selHorario.innerHTML = '';
    if (!selProf.value || !inputData.value) {
      selHorario.innerHTML = '<option value="">Escolha profissional e dia</option>';
      return;
    }
    const ocupados = pegarAgendamentos()
      .filter(a => a.profissional === selProf.value && a.data === inputData.value)
      .map(a => a.horario);
    const livres = horarios.filter(h => !ocupados.includes(h));
    if (livres.length === 0) {
      selHorario.innerHTML = '<option value="">Sem horários neste dia</option>';
      return;
    }
    selHorario.innerHTML = '<option value="">Selecione</option>' +
      livres.map(h => '<option>' + h + '</option>').join('');
  }
  selProf.addEventListener('change', atualizaHorarios);
  inputData.addEventListener('change', atualizaHorarios);

  formAgendamento.addEventListener('submit', function (event) {
    event.preventDefault();
    const novo = {
      email: usuario.email,
      servico: document.getElementById('servico').value,
      profissional: selProf.value,
      data: inputData.value,
      horario: selHorario.value
    };
    if (!novo.horario) {
      mostrarMensagem('Escolha um horário disponível.');
      return;
    }
    const todos = pegarAgendamentos();
    todos.push(novo);
    localStorage.setItem('agendamentos', JSON.stringify(todos));
    mostrarMensagem('Agendamento confirmado!', true);
    atualizaHorarios();
    listarAgendamentos();
  });

  // Monta o texto de um agendamento para o .txt
  function textoAgendamento(a) {
    const dataBR = a.data.split('-').reverse().join('/');
    return 'Serviço: ' + a.servico + '\n' +
           'Profissional: ' + a.profissional + '\n' +
           'Data: ' + dataBR + '\n' +
           'Horário: ' + a.horario + '\n';
  }

  function baixarTxt(nomeArquivo, conteudo) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([conteudo], { type: 'text/plain;charset=utf-8' }));
    link.download = nomeArquivo;
    link.style.display = 'none';
    document.body.appendChild(link); // alguns navegadores só baixam se o link estiver na página
    link.click();
    setTimeout(function () {
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, 1000);
  }

  const cabecalho = 'Barbearia Navalha\nCliente: ' + usuario.nome + '\n\n';

  function imprimirUm(a) {
    const nome = 'agendamento_' + a.data + '_' + a.horario.replace(':', 'h') + '.txt';
    baixarTxt(nome, cabecalho + textoAgendamento(a));
  }

  function listarAgendamentos() {
    const lista = document.getElementById('lista-agendamentos');
    const meus = pegarAgendamentos().filter(a => a.email === usuario.email);
    if (meus.length === 0) {
      lista.innerHTML = '<li>Você ainda não tem agendamentos.</li>';
      return;
    }
    lista.innerHTML = '';
    meus.forEach(function (a) {
      const li = document.createElement('li');
      const dataBR = a.data.split('-').reverse().join('/');
      li.innerHTML = '<span>' + a.servico + ' com ' + a.profissional +
        '<br>' + dataBR + ' às ' + a.horario + '</span>';
      const btn = document.createElement('button');
      btn.className = 'botao';
      btn.textContent = 'Cancelar';
      btn.addEventListener('click', function () {
        const restantes = pegarAgendamentos().filter(x => !(
          x.email === a.email && x.data === a.data &&
          x.horario === a.horario && x.profissional === a.profissional));
        localStorage.setItem('agendamentos', JSON.stringify(restantes));
        atualizaHorarios();
        listarAgendamentos();
      });
      const btnImprimir = document.createElement('button');
      btnImprimir.type = 'button';
      btnImprimir.className = 'botao botao-imprimir';
      btnImprimir.textContent = 'Imprimir';
      btnImprimir.addEventListener('click', function () { imprimirUm(a); });

      const acoes = document.createElement('div');
      acoes.className = 'acoes';
      acoes.appendChild(btnImprimir);
      acoes.appendChild(btn);
      li.appendChild(acoes);
      lista.appendChild(li);
    });
  }
  listarAgendamentos();

  document.getElementById('btn-sair').addEventListener('click', function () {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
  });
}