import React, { useState } from 'react';
// Se você usar CSS Modules, importaria assim:
// import styles from './RegisterForm.module.css';

interface RegisterFormProps {
    onSubmit: (formData: any) => void; // Define a prop para lidar com a submissão
    loading?: boolean; // Opcional: estado de loading
    error?: string | null; // Opcional: mensagem de erro
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading, error }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Coletar os dados do formulário
    const formData = {
        name,
        email,
        password,
        dob,
        time,
        city,
        state,
    };
    // Chamar a função onSubmit passada via props
    onSubmit(formData);
  };

  return (
    <div className="card"> {/* Usar a classe card para estilizar o container do formulário */}
      <h2>Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reg-name">Nome:</label>
          <input
            type="text"
            id="reg-name"
            className="form-control" {/* Aplicar classe de estilo */}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reg-email">Email:</label>
          <input
            type="email"
            id="reg-email"
            className="form-control" {/* Aplicar classe de estilo */}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reg-password">Senha:</label>
          <input
            type="password"
            id="reg-password"
            className="form-control" {/* Aplicar classe de estilo */}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
         <div>
          <label htmlFor="reg-dob">Data de Nascimento:</label>
          <input
            type="date"
            id="reg-dob"
            className="form-control" {/* Aplicar classe de estilo */}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reg-time">Hora de Nascimento:</label>
          <input
            type="time"
            id="reg-time"
            className="form-control" {/* Aplicar classe de estilo */}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reg-city">Cidade de Nascimento:</label>
          <input
            type="text"
            id="reg-city"
            className="form-control" {/* Aplicar classe de estilo */}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reg-state">Estado de Nascimento:</label>
          <input
            type="text"
            id="reg-state"
            className="form-control" {/* Aplicar classe de estilo */}
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
        </div>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
       <p style={{ textAlign: 'center', marginTop: '16px' }}>
           Já tem uma conta? <a href="/login">Faça login aqui</a>
       </p>
    </div>
  );
};

export default RegisterForm;