import React from 'react';
// Se você usar CSS Modules, importaria assim:
// import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="logo" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
        TRAMPOLIM
      </div>
      <nav className="nav-links">
        <a href="#">Início</a>
        <a href="#">Comunidade</a>
        <a href="#">Observatório</a>
        <a href="#">Ferramentas</a>
        <a href="#">Sobre</a>
      </nav>
      <div className="nav-cta">
        <button className="btn-icon">IA Chat Gratuito</button>
        <button className="btn-primary">Pesquise sobre você agora</button>
      </div>
    </header>
  );
};

export default Navbar;