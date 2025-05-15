import React, { useState } from 'react';
import { db } from '../utils/firebaseConfig'; // Assume you have a firebaseConfig.ts in utils
import { collection, addDoc } from 'firebase/firestore';

const AstrologiaForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    dataNascimento: '',
    horaNascimento: '',
    cidadeNascimento: '',
    estadoNascimento: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "mapasAstrologicos"), formData);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    console.log('Dados do formulário:', formData);
    // Por enquanto, apenas loga os dados
  };

  return (
    <div>
      <h1>Análise Astrológica</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nomeCompleto">Nome completo:</label>
          <input
            type="text"
            id="nomeCompleto"
            name="nomeCompleto"
            value={formData.nomeCompleto}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="dataNascimento">Data de nascimento:</label>
          <input
            type="date"
            id="dataNascimento"
            name="dataNascimento"
            value={formData.dataNascimento}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="horaNascimento">Hora de nascimento:</label>
          <input
            type="time"
            id="horaNascimento"
            name="horaNascimento"
            value={formData.horaNascimento}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="cidadeNascimento">Cidade de nascimento:</label>
          <input
            type="text"
            id="cidadeNascimento"
            name="cidadeNascimento"
            value={formData.cidadeNascimento}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="estadoNascimento">Estado de nascimento:</label>
          <input
            type="text"
            id="estadoNascimento"
            name="estadoNascimento"
            value={formData.estadoNascimento}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Gerar Análise</button>
      </form>
    </div>
  );
};

export default AstrologiaForm;