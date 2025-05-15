import React, { useState } from 'react';
// Se você usar CSS Modules, importaria assim:
// import styles from './LoginForm.module.css';

interface LoginFormProps {
    onSubmit: (formData: any) => void; // Define a prop para lidar com a submissão
    loading?: boolean; // Opcional: estado de loading
    error?: string | null; // Opcional: mensagem de erro
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Coletar os dados do formulário
    const formData = {
        email,
        password,
    };
    // Chamar a função onSubmit passada via props
    onSubmit(formData);
  };

  return (
    <div className="card"> {/* Usar a classe card para estilizar o container do formulário */}
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email">Email:</label>
          <input
            type="email"
            id="login-email"
            className="form-control" {/* Aplicar classe de estilo */}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="login-password">Senha:</label>
          <input
            type="password"
            id="login-password"
            className="form-control" {/* Aplicar classe de estilo */}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
       <p style={{ textAlign: 'center', marginTop: '16px' }}>
           Não tem uma conta? <a href="/register">Cadastre-se aqui</a>
       </p>
    </div>
  );
};

export default LoginForm;