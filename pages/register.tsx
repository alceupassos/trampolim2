import React, { useState } from 'react';
import { auth, db } from '../utils/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Salvar dados adicionais no Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        dob: dob,
        time: time,
        city: city,
        state: state,
        email: user.email // Opcional: salvar email também no documento do usuário
      });

      // Redirecionar para a página principal ou uma página de sucesso após o cadastro
      router.push('/');
    } catch (error: any) {
      setError(error.message);
      console.error("Erro ao cadastrar:", error);
    }
  };

  return (
    <div>
      <h1>Página de Cadastro</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="name">Nome:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
         <div>
          <label htmlFor="dob">Data de Nascimento:</label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="time">Hora de Nascimento:</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="city">Cidade de Nascimento:</label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="state">Estado de Nascimento:</label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Já tem uma conta? <a href="/login">Faça login aqui</a></p>
    </div>
  );
};

export default Register;